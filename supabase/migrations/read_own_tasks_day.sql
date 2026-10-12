begin;

-- Extend the existing signature: p_month is the selected date when p_view=day.
create or replace function public.read_own_tasks(
  p_view text default 'today', p_month date default null, p_offset integer default 0
) returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  employee uuid := auth.uid();
  today date := (now() at time zone 'Europe/Dublin')::date;
  current_month date := date_trunc('month', today::timestamp)::date;
  period_start date;
  period_end date;
  result jsonb;
begin
  if employee is null or not exists (
    select 1 from public.profiles where id = employee and is_active
  ) then raise exception 'Operational access required' using errcode = '42501'; end if;

  if p_view is null or p_view not in ('today', 'month', 'day') or
    p_offset is null or p_offset < 0 or p_offset % 50 <> 0 or
    (p_month is not null and (not isfinite(p_month) or p_month < date '1900-01-01' or
      p_month > today or (p_view <> 'day' and (p_month > current_month or extract(day from p_month) <> 1)))) or
    (p_view = 'day' and p_month is null)
  then raise exception 'Invalid period or page' using errcode = '22023'; end if;

  period_start := case when p_view = 'today' then today else coalesce(p_month, current_month) end;
  period_end := case when p_view in ('today', 'day') then period_start + 1
    else (period_start + interval '1 month')::date end;

  -- Invoker security preserves RLS. Employee comes only from the authenticated JWT.
  -- Server-created timestamp controls attribution; never the phone's performed_at.
  with ranked as (
    select id, bike_external_id, created_at, kickstand_positioned, bike_locked, bike_repositioned,
      (created_at at time zone 'Europe/Dublin')::date as day,
      row_number() over (
        partition by bike_external_id, (created_at at time zone 'Europe/Dublin')::date
        order by created_at, id
      ) = 1 as counted
    from public.public_order_actions
    where employee_id = employee
      and created_at >= (period_start::timestamp at time zone 'Europe/Dublin')
      and created_at < (period_end::timestamp at time zone 'Europe/Dublin')
  ), daily as (
    select day, count(*) as total, count(*) filter (where counted) as counted,
      count(*) filter (where not counted) as repeated
    from ranked group by day
  ), page as (
    select * from ranked where p_view in ('today', 'day')
    order by created_at desc, id desc limit 50 offset p_offset
  )
  select jsonb_build_object(
    'today', today, 'current_month', current_month, 'period', period_start,
    'refresh_after_ms', ceil(extract(epoch from
      (((today + 1)::timestamp at time zone 'Europe/Dublin') - now())) * 1000)::bigint,
    'total', count(*), 'counted', count(*) filter (where counted),
    'repeated', count(*) filter (where not counted),
    'has_more', p_view in ('today', 'day') and count(*) > p_offset::bigint + 50,
    'days', coalesce((select jsonb_agg(to_jsonb(daily) order by day desc) from daily), '[]'::jsonb),
    'items', coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc, id desc) from page), '[]'::jsonb)
  ) into result from ranked;
  return result;
end;
$$;
revoke all on function public.read_own_tasks(text,date,integer) from public, anon, authenticated;
grant execute on function public.read_own_tasks(text,date,integer) to authenticated;

commit;
