begin;

do $$
begin
  if to_regprocedure('moby_ops_private.team_summary_metrics_filtered(date,uuid)') is null
  then raise exception 'Apply the validated summary filters migration first'; end if;
end;
$$;

-- Minimal table data only; evidence and location require a separate authorized detail read.
create function moby_ops_private.team_activity(
  p_view text, p_date date, p_employee_id uuid, p_bike_query text,
  p_validity text, p_offset integer, p_as_of timestamptz
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  server_now timestamptz := statement_timestamp();
  today date := (server_now at time zone 'Europe/Dublin')::date;
  as_of timestamptz := coalesce(p_as_of, server_now);
  period_start date;
  period_end date;
  bike_query text := nullif(upper(btrim(p_bike_query)), '');
  result jsonb;
begin
  -- Check actual database role and active state, not a client role or arbitrary claim.
  if caller is null or not exists (
    select 1 from public.profiles where id = caller and is_active and role = 'supervisor'
  ) then raise exception 'Supervisor access required' using errcode = '42501'; end if;

  if p_view is null or p_view not in ('day','month') or
    p_validity is null or p_validity not in ('all','valid','invalid') or
    p_offset is null or p_offset < 0 or p_offset % 25 <> 0 or
    not isfinite(as_of) or as_of < timestamptz '1900-01-01 00:00+00' or as_of > server_now or
    (bike_query is not null and (length(bike_query) > 10 or bike_query !~ '^[A-Z0-9]+$')) or
    (p_date is not null and (not isfinite(p_date) or p_date < date '1900-01-01' or p_date > today or
      (p_view = 'month' and extract(day from p_date) <> 1)))
  then raise exception 'Invalid activity filters or page' using errcode = '22023'; end if;

  if p_employee_id is not null and not exists (
    select 1 from public.profiles profile where profile.id = p_employee_id and
      (profile.is_active or exists (select 1 from public.public_order_actions history
        where history.employee_id = profile.id and history.created_at <= server_now))
  ) then raise exception 'Invalid collaborator' using errcode = '22023'; end if;

  period_start := coalesce(p_date, case when p_view = 'day' then today
    else date_trunc('month',today::timestamp)::date end);
  period_end := case when p_view = 'day' then period_start + 1
    else (period_start + interval '1 month')::date end;

  with ranked as (
    select action.id, action.employee_id, action.bike_external_id, action.created_at,
      action.bike_locked, action.kickstand_positioned, action.bike_repositioned,
      row_number() over duplicates = 1 as counted,
      first_value(action.id) over duplicates as first_action_id
    from public.public_order_actions action
    where (p_employee_id is null or action.employee_id = p_employee_id)
      and action.created_at <= as_of
      and action.created_at >= (period_start::timestamp at time zone 'Europe/Dublin')
      and action.created_at < (period_end::timestamp at time zone 'Europe/Dublin')
    window duplicates as (
      partition by action.employee_id, action.bike_external_id, (action.created_at at time zone 'Europe/Dublin')::date
      order by action.created_at, action.id
    )
  ), filtered as (
    -- Rank before validity filtering, bicycle search or pagination.
    select * from ranked where (bike_query is null or position(bike_query in upper(bike_external_id)) > 0)
      and (p_validity = 'all' or (p_validity = 'valid' and counted) or (p_validity = 'invalid' and not counted))
  ), page as (
    select filtered.id, employee_id, btrim(profile.full_name) as full_name, bike_external_id,
      filtered.created_at, bike_locked, kickstand_positioned, bike_repositioned, counted,
      case when counted then null else first_action_id end as duplicate_of
    from filtered join public.profiles profile on profile.id = filtered.employee_id
    order by filtered.created_at desc, filtered.id desc limit 25 offset p_offset
  )
  select jsonb_build_object(
    'view',p_view, 'period',period_start, 'today',today, 'as_of',as_of,
    'employee_id',p_employee_id, 'bike_query',bike_query, 'validity',p_validity,
    'offset',p_offset, 'page_size',25, 'total',count(*),
    'valid',count(*) filter (where counted), 'invalid',count(*) filter (where not counted),
    'has_more',count(*) > p_offset::bigint + 25,
    'items',coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc,id desc) from page),'[]'::jsonb)
  ) into result from filtered;
  return result;
end;
$$;
revoke all on function moby_ops_private.team_activity(text,date,uuid,text,text,integer,timestamptz) from public,anon,authenticated;
grant execute on function moby_ops_private.team_activity(text,date,uuid,text,text,integer,timestamptz) to authenticated;

create function public.read_team_activity(
  p_view text default 'day', p_date date default null, p_employee_id uuid default null,
  p_bike_query text default null, p_validity text default 'all',
  p_offset integer default 0, p_as_of timestamptz default null
) returns jsonb language sql stable security invoker set search_path = '' as $$
  select moby_ops_private.team_activity(p_view,p_date,p_employee_id,p_bike_query,p_validity,p_offset,p_as_of);
$$;
revoke all on function public.read_team_activity(text,date,uuid,text,text,integer,timestamptz) from public,anon,authenticated;
grant execute on function public.read_team_activity(text,date,uuid,text,text,integer,timestamptz) to authenticated;
notify pgrst, 'reload schema';
commit;
