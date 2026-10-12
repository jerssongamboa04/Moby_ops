begin;

-- Requires the reviewed/applied original summary RPC. Abort on a missing baseline.
do $$
begin
  if to_regprocedure('public.read_team_summary_metrics(date)') is null
    or to_regprocedure('moby_ops_private.team_summary_metrics(date)') is null
  then raise exception 'Apply read_team_summary_metrics.sql first'; end if;
end;
$$;

-- New names prevent default-argument/overload ambiguity for existing RPC calls.
create function moby_ops_private.team_summary_metrics_filtered(p_month date, p_employee_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  as_of timestamptz := statement_timestamp();
  today date := (as_of at time zone 'Europe/Dublin')::date;
  current_month date := date_trunc('month', today::timestamp)::date;
  month_start date := coalesce(p_month, current_month);
  month_end date;
  result jsonb;
begin
  if caller is null or not exists (
    select 1 from public.profiles
    where id = caller and is_active and role = 'supervisor'
  ) then raise exception 'Supervisor access required' using errcode = '42501'; end if;

  if not isfinite(month_start) or month_start < date '1900-01-01'
    or month_start > current_month or extract(day from month_start) <> 1
  then raise exception 'Invalid month' using errcode = '22023'; end if;
  if p_employee_id is not null and not exists (
    select 1 from public.profiles profile
    where profile.id = p_employee_id and (profile.is_active or exists (
      select 1 from public.public_order_actions action
      where action.employee_id = profile.id and action.created_at <= as_of
    ))
  ) then raise exception 'Invalid collaborator' using errcode = '22023'; end if;
  month_end := (month_start + interval '1 month')::date;

  with ranked as (
    select kickstand_positioned, bike_locked, bike_repositioned,
      (created_at at time zone 'Europe/Dublin')::date as day,
      row_number() over (
        partition by employee_id, bike_external_id, (created_at at time zone 'Europe/Dublin')::date
        order by created_at, id
      ) = 1 as counted
    from public.public_order_actions
    where (p_employee_id is null or employee_id = p_employee_id)
      and created_at <= as_of and (
      (created_at >= (month_start::timestamp at time zone 'Europe/Dublin')
        and created_at < (month_end::timestamp at time zone 'Europe/Dublin'))
      or (created_at >= (today::timestamp at time zone 'Europe/Dublin')
        and created_at < ((today + 1)::timestamp at time zone 'Europe/Dublin'))
    )
  ), monthly as (
    select jsonb_build_object(
      'attended', count(*) filter (where counted),
      'locked', count(*) filter (where counted and bike_locked),
      'kickstand', count(*) filter (where counted and kickstand_positioned),
      'repositioned', count(*) filter (where counted and bike_repositioned),
      'invalid', count(*) filter (where not counted)
    ) as metrics from ranked where day >= month_start and day < month_end
  ), daily as (
    select jsonb_build_object(
      'attended', count(*) filter (where counted),
      'locked', count(*) filter (where counted and bike_locked),
      'kickstand', count(*) filter (where counted and kickstand_positioned),
      'repositioned', count(*) filter (where counted and bike_repositioned),
      'invalid', count(*) filter (where not counted)
    ) as metrics from ranked where day = today
  )
  select jsonb_build_object(
    'month', month_start, 'today', today, 'generated_at', as_of, 'employee_id', p_employee_id,
    'month_metrics', monthly.metrics, 'today_metrics', daily.metrics
  ) into result from monthly cross join daily;
  return result;
end;
$$;
revoke all on function moby_ops_private.team_summary_metrics_filtered(date,uuid) from public, anon, authenticated;
grant execute on function moby_ops_private.team_summary_metrics_filtered(date,uuid) to authenticated;

-- Keep the existing signature/JSON contract; share the same counting logic.
create or replace function moby_ops_private.team_summary_metrics(p_month date default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select moby_ops_private.team_summary_metrics_filtered(p_month, null) - 'employee_id';
$$;
revoke all on function moby_ops_private.team_summary_metrics(date) from public, anon, authenticated;
grant execute on function moby_ops_private.team_summary_metrics(date) to authenticated;

create function public.read_team_summary_metrics_filtered(p_month date default null, p_employee_id uuid default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select moby_ops_private.team_summary_metrics_filtered(p_month, p_employee_id);
$$;
revoke all on function public.read_team_summary_metrics_filtered(date,uuid) from public, anon, authenticated;
grant execute on function public.read_team_summary_metrics_filtered(date,uuid) to authenticated;

-- Only selector fields, never email, credentials, location or evidence.
create function moby_ops_private.team_summary_collaborators()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  as_of timestamptz := statement_timestamp();
  result jsonb;
begin
  if caller is null or not exists (
    select 1 from public.profiles where id = caller and is_active and role = 'supervisor'
  ) then raise exception 'Supervisor access required' using errcode = '42501'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', profile.id, 'full_name', btrim(profile.full_name), 'is_active', profile.is_active
  ) order by lower(btrim(profile.full_name)), profile.id), '[]'::jsonb)
  into result from public.profiles profile
  where profile.is_active or exists (
    select 1 from public.public_order_actions action
    where action.employee_id = profile.id and action.created_at <= as_of
  );
  return result;
end;
$$;
revoke all on function moby_ops_private.team_summary_collaborators() from public, anon, authenticated;
grant execute on function moby_ops_private.team_summary_collaborators() to authenticated;

create function public.read_team_summary_collaborators()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select moby_ops_private.team_summary_collaborators();
$$;
revoke all on function public.read_team_summary_collaborators() from public, anon, authenticated;
grant execute on function public.read_team_summary_collaborators() to authenticated;

-- No schema exposure or RLS changes. API discovers the two new entry points.
notify pgrst, 'reload schema';
commit;
