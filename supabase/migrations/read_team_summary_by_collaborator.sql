begin;

do $$
begin
  if to_regprocedure('moby_ops_private.team_summary_metrics_filtered(date,uuid)') is null
  then raise exception 'Apply read_team_summary_filters.sql first'; end if;
end;
$$;

-- One grouped monthly read, not one aggregate RPC per collaborator.
create function moby_ops_private.team_summary_by_collaborator(p_month date, p_employee_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  validated jsonb;
  month_start date;
  month_end date;
  as_of timestamptz;
  result jsonb;
begin
  -- Reuse the established active-supervisor guard, parameter validation and clock.
  validated := moby_ops_private.team_summary_metrics_filtered(p_month, p_employee_id);
  month_start := (validated->>'month')::date;
  month_end := (month_start + interval '1 month')::date;
  as_of := (validated->>'generated_at')::timestamptz;

  with eligible as (
    select profile.id, btrim(profile.full_name) as full_name, profile.is_active
    from public.profiles profile
    where (p_employee_id is null or profile.id = p_employee_id)
      and (profile.is_active or exists (
        select 1 from public.public_order_actions history
        where history.employee_id = profile.id and history.created_at <= as_of
      ))
  ), ranked as (
    select employee_id, kickstand_positioned, bike_locked, bike_repositioned,
      row_number() over (
        partition by employee_id, bike_external_id, (created_at at time zone 'Europe/Dublin')::date
        order by created_at, id
      ) = 1 as counted
    from public.public_order_actions
    where (p_employee_id is null or employee_id = p_employee_id)
      and created_at <= as_of
      and created_at >= (month_start::timestamp at time zone 'Europe/Dublin')
      and created_at < (month_end::timestamp at time zone 'Europe/Dublin')
  ), aggregated as (
    select employee_id,
      count(*) filter (where counted) as attended,
      count(*) filter (where counted and bike_locked) as locked,
      count(*) filter (where counted and kickstand_positioned) as kickstand,
      count(*) filter (where counted and bike_repositioned) as repositioned,
      count(*) filter (where not counted) as invalid
    from ranked group by employee_id
  ), collaborators as (
    select eligible.id, eligible.full_name, eligible.is_active,
      coalesce(aggregated.attended,0) as attended,
      coalesce(aggregated.locked,0) as locked,
      coalesce(aggregated.kickstand,0) as kickstand,
      coalesce(aggregated.repositioned,0) as repositioned,
      coalesce(aggregated.invalid,0) as invalid
    from eligible left join aggregated on eligible.id = aggregated.employee_id
  )
  select jsonb_build_object(
    'month', month_start, 'today', validated->'today', 'generated_at', validated->'generated_at',
    'employee_id', p_employee_id,
    'rows', coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'full_name', full_name, 'is_active', is_active,
      'metrics', jsonb_build_object('attended',attended,'locked',locked,'kickstand',kickstand,
        'repositioned',repositioned,'invalid',invalid)
    ) order by lower(full_name), id), '[]'::jsonb),
    'total_metrics', jsonb_build_object(
      'attended',coalesce(sum(attended),0), 'locked',coalesce(sum(locked),0),
      'kickstand',coalesce(sum(kickstand),0), 'repositioned',coalesce(sum(repositioned),0),
      'invalid',coalesce(sum(invalid),0)
    )
  ) into result from collaborators;
  return result;
end;
$$;
revoke all on function moby_ops_private.team_summary_by_collaborator(date,uuid) from public, anon, authenticated;
grant execute on function moby_ops_private.team_summary_by_collaborator(date,uuid) to authenticated;

create function public.read_team_summary_by_collaborator(p_month date default null, p_employee_id uuid default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select moby_ops_private.team_summary_by_collaborator(p_month, p_employee_id);
$$;
revoke all on function public.read_team_summary_by_collaborator(date,uuid) from public, anon, authenticated;
grant execute on function public.read_team_summary_by_collaborator(date,uuid) to authenticated;

notify pgrst, 'reload schema';
commit;
