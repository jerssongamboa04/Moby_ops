-- Run only after reviewing the migration. Administrator SQL Editor; rollback at end.
-- Creates isolated users/profiles/actions; does not edit existing employees or acts.
begin;
do $$
begin
  if exists (select 1 from auth.users where id in (
    '00000000-0000-4000-8000-000000009001', '00000000-0000-4000-8000-000000009002',
    '00000000-0000-4000-8000-000000009003', '00000000-0000-4000-8000-000000009004'))
  then raise exception 'Reserved test IDs already exist; stop without changes'; end if;
  if exists (select 1 from public.public_order_actions where
    (created_at >= '2024-03-01 Europe/Dublin'::timestamptz and created_at < '2024-05-01 Europe/Dublin'::timestamptz)
    or (created_at >= '2024-10-01 Europe/Dublin'::timestamptz and created_at < '2024-11-01 Europe/Dublin'::timestamptz)
    or (bike_external_id = '34E9999999' and (created_at at time zone 'Europe/Dublin')::date = (now() at time zone 'Europe/Dublin')::date))
  then raise exception 'Reserved test periods/bicycle contain data; stop without changes'; end if;
end;
$$;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000009001','moby-summary-supervisor@example.invalid'),
 ('00000000-0000-4000-8000-000000009002','moby-summary-employee-a@example.invalid'),
 ('00000000-0000-4000-8000-000000009003','moby-summary-employee-b@example.invalid'),
 ('00000000-0000-4000-8000-000000009004','moby-summary-inactive@example.invalid');
insert into public.profiles(id,full_name,role,is_active) values
 ('00000000-0000-4000-8000-000000009001','SQL test supervisor','supervisor',true),
 ('00000000-0000-4000-8000-000000009002','SQL test employee A','employee',true),
 ('00000000-0000-4000-8000-000000009003','SQL test employee B','employee',false),
 ('00000000-0000-4000-8000-000000009004','SQL test inactive','supervisor',false)
on conflict (id) do update set full_name=excluded.full_name,role=excluded.role,is_active=excluded.is_active;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000009001',true);
select set_config('moby.test_baseline',public.read_team_summary_metrics()::text,true);

insert into public.public_order_actions
 (id,employee_id,bike_external_id,kickstand_positioned,bike_locked,bike_repositioned,latitude,longitude,performed_at,created_at)
values
 ('00000000-0000-4000-8000-000000008001','00000000-0000-4000-8000-000000009002','IE12H02911',false,true,false,53,-6,now(),'2024-03-01 10:00+00'),
 ('00000000-0000-4000-8000-000000008002','00000000-0000-4000-8000-000000009002','IE12H02911',true,true,true,53,-6,now(),'2024-03-01 10:00+00'),
 ('00000000-0000-4000-8000-000000008003','00000000-0000-4000-8000-000000009003','IE12H02911',true,true,true,53,-6,now(),'2024-03-01 10:00+00'),
 ('00000000-0000-4000-8000-000000008004','00000000-0000-4000-8000-000000009002','IE12H02911',true,false,false,53,-6,now(),'2024-03-02 10:00+00'),
 ('00000000-0000-4000-8000-000000008005','00000000-0000-4000-8000-000000009002','IE12H02912',false,false,true,53,-6,now(),'2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008006','00000000-0000-4000-8000-000000009002','IE12H02913',true,false,false,53,-6,now(),'2024-03-31 23:00+00'),
 ('00000000-0000-4000-8000-000000008007','00000000-0000-4000-8000-000000009002','IE12H02914',false,true,false,53,-6,now(),'2024-10-27 00:30+00'),
 ('00000000-0000-4000-8000-000000008008','00000000-0000-4000-8000-000000009002','IE12H02914',true,false,false,53,-6,now(),'2024-10-27 01:30+00'),
 ('00000000-0000-4000-8000-000000008009','00000000-0000-4000-8000-000000009002','IE12H02915',true,false,false,53,-6,now(),'2024-09-30 23:00+00'),
 ('00000000-0000-4000-8000-000000008010','00000000-0000-4000-8000-000000009002','34E9999999',false,true,false,53,-6,now()-interval '10 years',now()),
 ('00000000-0000-4000-8000-000000008011','00000000-0000-4000-8000-000000009002','34E9999999',true,true,true,53,-6,now(),now());

set local role authenticated;
do $$
declare result jsonb; baseline jsonb := current_setting('moby.test_baseline')::jsonb; selected date;
begin
  result := public.read_team_summary_metrics('2024-03-01');
  if result->'month_metrics' <> '{"attended":4,"locked":2,"kickstand":2,"repositioned":2,"invalid":1}'::jsonb
  then raise exception 'FAIL: March counts, employee/day partition, tie ordering, server date or excluded invalid checks: %',result; end if;
  result := public.read_team_summary_metrics('2024-04-01');
  if (result->'month_metrics'->>'attended')::int <> 1 then raise exception 'FAIL: Dublin spring month boundary'; end if;
  result := public.read_team_summary_metrics('2024-10-01');
  if result->'month_metrics' <> '{"attended":2,"locked":1,"kickstand":1,"repositioned":0,"invalid":1}'::jsonb
  then raise exception 'FAIL: repeated fall-back hour or Dublin month start: %',result; end if;
  result := public.read_team_summary_metrics('2024-02-01');
  if result->'month_metrics' <> '{"attended":0,"locked":0,"kickstand":0,"repositioned":0,"invalid":0}'::jsonb
  then raise exception 'FAIL: successful empty month'; end if;
  result := public.read_team_summary_metrics();
  if (result->'today_metrics'->>'attended')::bigint <> (baseline->'today_metrics'->>'attended')::bigint+1
    or (result->'today_metrics'->>'locked')::bigint <> (baseline->'today_metrics'->>'locked')::bigint+1
    or (result->'today_metrics'->>'invalid')::bigint <> (baseline->'today_metrics'->>'invalid')::bigint+1
    or (result->'today_metrics'->>'kickstand')::bigint <> (baseline->'today_metrics'->>'kickstand')::bigint
    or (result->'today_metrics'->>'repositioned')::bigint <> (baseline->'today_metrics'->>'repositioned')::bigint
  then raise exception 'FAIL: real today totals/excluded repeated checks'; end if;
  if (result->'month_metrics'->>'attended')::bigint <> (baseline->'month_metrics'->>'attended')::bigint+1
    or (result->'month_metrics'->>'locked')::bigint <> (baseline->'month_metrics'->>'locked')::bigint+1
    or (result->'month_metrics'->>'invalid')::bigint <> (baseline->'month_metrics'->>'invalid')::bigint+1
    or (result->'month_metrics'->>'kickstand')::bigint <> (baseline->'month_metrics'->>'kickstand')::bigint
    or (result->'month_metrics'->>'repositioned')::bigint <> (baseline->'month_metrics'->>'repositioned')::bigint
  then raise exception 'FAIL: current month increments/excluded repeated checks'; end if;
  if (result->>'today')::date <> (now() at time zone 'Europe/Dublin')::date
    or (result->>'month')::date <> date_trunc('month',now() at time zone 'Europe/Dublin')::date
    or result->>'generated_at' is null then raise exception 'FAIL: authoritative period metadata'; end if;
  foreach selected in array array[date '2024-03-02',date 'infinity',date '1899-01-01',
      (date_trunc('month',now() at time zone 'Europe/Dublin')+interval '1 month')::date]
  loop
    begin
      perform public.read_team_summary_metrics(selected);
      raise exception 'FAIL: invalid month accepted: %',selected;
    exception when invalid_parameter_value then null;
    end;
  end loop;
  if exists (select 1 from public.public_order_actions where employee_id in (
    '00000000-0000-4000-8000-000000009002','00000000-0000-4000-8000-000000009003'))
  then raise exception 'FAIL: direct team access was widened'; end if;
end;
$$;

-- A spoofed JWT role must not replace the role stored in profiles.
select set_config('request.jwt.claim.role','supervisor',true);
do $$
declare denied uuid;
begin
  foreach denied in array array[
    '00000000-0000-4000-8000-000000009002'::uuid,
    '00000000-0000-4000-8000-000000009004'::uuid,
    '00000000-0000-4000-8000-000000009099'::uuid]
  loop
    perform set_config('request.jwt.claim.sub',denied::text,true);
    begin
      perform public.read_team_summary_metrics();
      raise exception 'FAIL: unauthorized profile accepted: %',denied;
    exception when insufficient_privilege then null;
    end;
  end loop;
  perform set_config('request.jwt.claim.sub','',true);
  begin
    perform public.read_team_summary_metrics();
    raise exception 'FAIL: absent identity accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
do $$
begin
  if has_function_privilege('anon','public.read_team_summary_metrics(date)','EXECUTE')
    or has_function_privilege('anon','moby_ops_private.team_summary_metrics(date)','EXECUTE')
  then raise exception 'FAIL: anonymous function grant'; end if;
end;
$$;
set local role anon;
do $$
begin
  begin
    perform public.read_team_summary_metrics();
    raise exception 'FAIL: anonymous invocation accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
select 'OK: team totals, duplication, DST, empty month, today, parameters, role checks and unchanged direct RLS' as resultado;
rollback;
