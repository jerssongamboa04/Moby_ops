-- Reviewed administrator SQL Editor only. Reserved fixtures are rolled back.
begin;
do $$
begin
  if exists (select 1 from auth.users where id in (
    '00000000-0000-4000-8000-000000009101','00000000-0000-4000-8000-000000009102',
    '00000000-0000-4000-8000-000000009103','00000000-0000-4000-8000-000000009104',
    '00000000-0000-4000-8000-000000009105','00000000-0000-4000-8000-000000009106'))
    or exists (select 1 from public.public_order_actions where id in (
      '00000000-0000-4000-8000-000000008101','00000000-0000-4000-8000-000000008102',
      '00000000-0000-4000-8000-000000008103','00000000-0000-4000-8000-000000008104',
      '00000000-0000-4000-8000-000000008105','00000000-0000-4000-8000-000000008106',
      '00000000-0000-4000-8000-000000008107','00000000-0000-4000-8000-000000008108',
      '00000000-0000-4000-8000-000000008109','00000000-0000-4000-8000-000000008110'))
  then raise exception 'Reserved filter test IDs already exist; stop without changes'; end if;
end;
$$;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000009101','moby-filter-supervisor@example.invalid'),
 ('00000000-0000-4000-8000-000000009102','moby-filter-employee-a@example.invalid'),
 ('00000000-0000-4000-8000-000000009103','moby-filter-employee-b@example.invalid'),
 ('00000000-0000-4000-8000-000000009104','moby-filter-inactive-supervisor@example.invalid'),
 ('00000000-0000-4000-8000-000000009105','moby-filter-zero@example.invalid'),
 ('00000000-0000-4000-8000-000000009106','moby-filter-inactive-zero@example.invalid');
insert into public.profiles(id,full_name,role,is_active) values
 ('00000000-0000-4000-8000-000000009101','SQL filter supervisor','supervisor',true),
 ('00000000-0000-4000-8000-000000009102','SQL filter duplicate name','employee',true),
 ('00000000-0000-4000-8000-000000009103','SQL filter historical','employee',false),
 ('00000000-0000-4000-8000-000000009104','SQL filter inactive supervisor','supervisor',false),
 ('00000000-0000-4000-8000-000000009105','SQL filter duplicate name','employee',true),
 ('00000000-0000-4000-8000-000000009106','SQL filter inactive without history','employee',false)
on conflict (id) do update set full_name=excluded.full_name,role=excluded.role,is_active=excluded.is_active;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000009101',true);
select set_config('moby.filter_baseline',public.read_team_summary_metrics('2024-03-01')::text,true);

insert into public.public_order_actions
 (id,employee_id,bike_external_id,kickstand_positioned,bike_locked,bike_repositioned,latitude,longitude,performed_at,created_at)
values
 ('00000000-0000-4000-8000-000000008101','00000000-0000-4000-8000-000000009102','IE12H02911',false,true,false,53,-6,now(),'2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008102','00000000-0000-4000-8000-000000009102','IE12H02911',true,true,true,53,-6,now(),'2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008103','00000000-0000-4000-8000-000000009103','IE12H02911',true,false,true,53,-6,now(),'2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008104','00000000-0000-4000-8000-000000009102','IE12H02911',true,false,false,53,-6,now(),'2024-03-31 23:00+00'),
 ('00000000-0000-4000-8000-000000008105','00000000-0000-4000-8000-000000009102','IE12H02912',false,true,false,53,-6,now(),'2024-10-27 00:30+00'),
 ('00000000-0000-4000-8000-000000008106','00000000-0000-4000-8000-000000009102','IE12H02912',true,false,true,53,-6,now(),'2024-10-27 01:30+00'),
 ('00000000-0000-4000-8000-000000008107','00000000-0000-4000-8000-000000009101','IE12H02911',false,false,true,53,-6,now(),'2024-03-01 10:00+00'),
 ('00000000-0000-4000-8000-000000008108','00000000-0000-4000-8000-000000009102','34E9999999',false,true,false,53,-6,now()-interval '10 years',now()),
 ('00000000-0000-4000-8000-000000008109','00000000-0000-4000-8000-000000009102','34E9999999',true,true,true,53,-6,now(),now()),
 ('00000000-0000-4000-8000-000000008110','00000000-0000-4000-8000-000000009106','34E9999999',true,true,true,53,-6,now(),now()+interval '2 days');

set local role authenticated;
do $$
declare
  a uuid := '00000000-0000-4000-8000-000000009102';
  b uuid := '00000000-0000-4000-8000-000000009103';
  s uuid := '00000000-0000-4000-8000-000000009101';
  z uuid := '00000000-0000-4000-8000-000000009105';
  result jsonb; roster jsonb; baseline jsonb := current_setting('moby.filter_baseline')::jsonb;
  selected date; invalid_id uuid; pos_a int; pos_z int;
  zero jsonb := '{"attended":0,"locked":0,"kickstand":0,"repositioned":0,"invalid":0}';
begin
  result := public.read_team_summary_metrics_filtered('2024-03-01',a);
  if result->'month_metrics' <> '{"attended":1,"locked":1,"kickstand":0,"repositioned":0,"invalid":1}'::jsonb
    or result->>'employee_id' <> a::text
  then raise exception 'FAIL: selected collaborator, tie order or repeated check exclusion: %',result; end if;
  if result->'today_metrics' <> '{"attended":1,"locked":1,"kickstand":0,"repositioned":0,"invalid":1}'::jsonb
  then raise exception 'FAIL: today must remain actual/selected person despite historical month'; end if;
  if (result->>'today')::date <> (now() at time zone 'Europe/Dublin')::date
    or result->>'month' <> '2024-03-01' or result->>'generated_at' is null
  then raise exception 'FAIL: selected period/server metadata'; end if;
  result := public.read_team_summary_metrics_filtered('2024-03-01',b);
  if result->'month_metrics' <> '{"attended":1,"locked":0,"kickstand":1,"repositioned":1,"invalid":0}'::jsonb
  then raise exception 'FAIL: inactive history or same bike in another person'; end if;
  result := public.read_team_summary_metrics_filtered('2024-03-01',s);
  if result->'month_metrics' <> '{"attended":1,"locked":0,"kickstand":0,"repositioned":1,"invalid":0}'::jsonb
  then raise exception 'FAIL: supervisor actions must also remain selectable'; end if;
  result := public.read_team_summary_metrics_filtered('2024-04-01',a);
  if result->'month_metrics' <> '{"attended":1,"locked":0,"kickstand":1,"repositioned":0,"invalid":0}'::jsonb
  then raise exception 'FAIL: Dublin spring/month boundary'; end if;
  result := public.read_team_summary_metrics_filtered('2024-10-01',a);
  if result->'month_metrics' <> '{"attended":1,"locked":1,"kickstand":0,"repositioned":0,"invalid":1}'::jsonb
  then raise exception 'FAIL: repeated fall-back hour'; end if;
  result := public.read_team_summary_metrics_filtered('2024-03-01',z);
  if result->'month_metrics' <> zero or result->'today_metrics' <> zero
  then raise exception 'FAIL: real zero counts for active person without acts'; end if;
  result := public.read_team_summary_metrics_filtered(null,a);
  if result->>'month' <> to_char(date_trunc('month',now() at time zone 'Europe/Dublin'),'YYYY-MM-DD')
    or result->'month_metrics' <> result->'today_metrics'
  then raise exception 'FAIL: current month default/future exclusion'; end if;
  result := public.read_team_summary_metrics_filtered('2024-03-01',null);
  if (result->'month_metrics'->>'attended')::bigint <> (baseline->'month_metrics'->>'attended')::bigint+3
    or (result->'month_metrics'->>'locked')::bigint <> (baseline->'month_metrics'->>'locked')::bigint+1
    or (result->'month_metrics'->>'kickstand')::bigint <> (baseline->'month_metrics'->>'kickstand')::bigint+1
    or (result->'month_metrics'->>'repositioned')::bigint <> (baseline->'month_metrics'->>'repositioned')::bigint+2
    or (result->'month_metrics'->>'invalid')::bigint <> (baseline->'month_metrics'->>'invalid')::bigint+1
  then raise exception 'FAIL: all collaborator aggregate deltas'; end if;
  if result - 'employee_id' - 'generated_at' <> public.read_team_summary_metrics('2024-03-01') - 'generated_at'
    or public.read_team_summary_metrics() - 'generated_at' <> public.read_team_summary_metrics_filtered() - 'employee_id' - 'generated_at'
  then raise exception 'FAIL: legacy RPC contract/default call changed'; end if;

  roster := public.read_team_summary_collaborators();
  if not exists (select 1 from jsonb_array_elements(roster) p where p->>'id'=b::text and p->'is_active'='false'::jsonb)
    or not exists (select 1 from jsonb_array_elements(roster) p where p->>'id'=z::text)
    or exists (select 1 from jsonb_array_elements(roster) p where p->>'id' in (
      '00000000-0000-4000-8000-000000009104','00000000-0000-4000-8000-000000009106'))
  then raise exception 'FAIL: active/history roster or future-only person included'; end if;
  if exists (select 1 from jsonb_array_elements(roster) p where
    (select count(*) from jsonb_object_keys(p)) <> 3 or not (p ?& array['id','full_name','is_active']))
  then raise exception 'FAIL: roster exposes extra profile data'; end if;
  select ordinal into pos_a from jsonb_array_elements(roster) with ordinality items(p,ordinal) where p->>'id'=a::text;
  select ordinal into pos_z from jsonb_array_elements(roster) with ordinality items(p,ordinal) where p->>'id'=z::text;
  if pos_a is null or pos_z is null or pos_a >= pos_z then raise exception 'FAIL: duplicate names must remain distinct/stably ordered'; end if;

  foreach invalid_id in array array['00000000-0000-4000-8000-000000009106'::uuid,'00000000-0000-4000-8000-000000009199'::uuid]
  loop
    begin
      perform public.read_team_summary_metrics_filtered(null,invalid_id);
      raise exception 'FAIL: invalid/non-selectable collaborator accepted';
    exception when invalid_parameter_value then null; end;
  end loop;
  foreach selected in array array[date '2024-03-02',date 'infinity',date '-infinity',date '1899-01-01',
    (date_trunc('month',now() at time zone 'Europe/Dublin')+interval '1 month')::date]
  loop
    begin
      perform public.read_team_summary_metrics_filtered(selected,a);
      raise exception 'FAIL: invalid month accepted';
    exception when invalid_parameter_value then null; end;
  end loop;
  if exists (select 1 from public.profiles where id <> s)
    or exists (select 1 from public.public_order_actions where employee_id <> s)
  then raise exception 'FAIL: direct profile/action RLS was widened'; end if;
end;
$$;

-- Profile role, never a spoofed claim, authorizes every entry point.
select set_config('request.jwt.claim.role','supervisor',true);
do $$
declare denied uuid;
begin
  foreach denied in array array[
    '00000000-0000-4000-8000-000000009102'::uuid,
    '00000000-0000-4000-8000-000000009104'::uuid,
    '00000000-0000-4000-8000-000000009199'::uuid,null::uuid]
  loop
    perform set_config('request.jwt.claim.sub',coalesce(denied::text,''),true);
    begin
      perform public.read_team_summary_metrics_filtered();
      raise exception 'FAIL: unauthorized filtered metrics';
    exception when insufficient_privilege then null; end;
    begin
      perform public.read_team_summary_collaborators();
      raise exception 'FAIL: unauthorized collaborator list';
    exception when insufficient_privilege then null; end;
    begin
      perform moby_ops_private.team_summary_metrics_filtered(null,null);
      raise exception 'FAIL: unauthorized private metrics';
    exception when insufficient_privilege then null; end;
    begin
      perform moby_ops_private.team_summary_collaborators();
      raise exception 'FAIL: unauthorized private list';
    exception when insufficient_privilege then null; end;
    begin
      perform public.read_team_summary_metrics();
      raise exception 'FAIL: unauthorized legacy wrapper';
    exception when insufficient_privilege then null; end;
  end loop;
end;
$$;
reset role;
do $$
declare signature text;
begin
  foreach signature in array array[
    'public.read_team_summary_metrics_filtered(date,uuid)',
    'public.read_team_summary_collaborators()',
    'moby_ops_private.team_summary_metrics_filtered(date,uuid)',
    'moby_ops_private.team_summary_collaborators()']
  loop
    if has_function_privilege('anon',signature,'EXECUTE')
    then raise exception 'FAIL: anonymous grant on %',signature; end if;
  end loop;
end;
$$;
set local role anon;
do $$
begin
  begin
    perform public.read_team_summary_metrics_filtered();
    raise exception 'FAIL: anonymous filtered invocation';
  exception when insufficient_privilege then null; end;
  begin
    perform public.read_team_summary_collaborators();
    raise exception 'FAIL: anonymous list invocation';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;
select 'OK: month/person filters, real today, historical/active roster, zero counts, duplicates, DST, legacy compatibility, authorization and unchanged direct RLS' as resultado;
rollback;
