-- Reviewed administrator SQL Editor only. Reserved fixtures are rolled back.
begin;
do $$
begin
  if exists (select 1 from auth.users where id in (
    '00000000-0000-4000-8000-000000009301','00000000-0000-4000-8000-000000009302',
    '00000000-0000-4000-8000-000000009303','00000000-0000-4000-8000-000000009304',
    '00000000-0000-4000-8000-000000009305','00000000-0000-4000-8000-000000009306'))
    or exists (select 1 from public.public_order_actions where id in (
      '00000000-0000-4000-8000-000000008301','00000000-0000-4000-8000-000000008302',
      '00000000-0000-4000-8000-000000008303','00000000-0000-4000-8000-000000008304',
      '00000000-0000-4000-8000-000000008305','00000000-0000-4000-8000-000000008306',
      '00000000-0000-4000-8000-000000008307','00000000-0000-4000-8000-000000008308',
      '00000000-0000-4000-8000-000000008309','00000000-0000-4000-8000-000000008310'))
  then raise exception 'Reserved collaborator test IDs already exist; stop without changes'; end if;
end;
$$;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000009301','moby-collaborator-supervisor@example.invalid'),
 ('00000000-0000-4000-8000-000000009302','moby-collaborator-employee-a@example.invalid'),
 ('00000000-0000-4000-8000-000000009303','moby-collaborator-employee-b@example.invalid'),
 ('00000000-0000-4000-8000-000000009304','moby-collaborator-inactive-supervisor@example.invalid'),
 ('00000000-0000-4000-8000-000000009305','moby-collaborator-zero@example.invalid'),
 ('00000000-0000-4000-8000-000000009306','moby-collaborator-inactive-zero@example.invalid');
insert into public.profiles(id,full_name,role,is_active) values
 ('00000000-0000-4000-8000-000000009301','SQL collaborator supervisor','supervisor',true),
 ('00000000-0000-4000-8000-000000009302','SQL collaborator duplicate name','employee',true),
 ('00000000-0000-4000-8000-000000009303','SQL collaborator historical','employee',false),
 ('00000000-0000-4000-8000-000000009304','SQL collaborator inactive supervisor','supervisor',false),
 ('00000000-0000-4000-8000-000000009305','SQL collaborator duplicate name','employee',true),
 ('00000000-0000-4000-8000-000000009306','SQL collaborator inactive without history','employee',false)
on conflict (id) do update set full_name=excluded.full_name,role=excluded.role,is_active=excluded.is_active;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000009301',true);
select set_config('moby.collaborator_baseline',public.read_team_summary_by_collaborator('2024-03-01')::text,true);

insert into public.public_order_actions
 (id,employee_id,bike_external_id,kickstand_positioned,bike_locked,bike_repositioned,latitude,longitude,performed_at,created_at)
values
 ('00000000-0000-4000-8000-000000008301','00000000-0000-4000-8000-000000009302','IE12H02911',false,true,false,53,-6,now(),'2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008302','00000000-0000-4000-8000-000000009302','IE12H02911',true,true,true,53,-6,now(),'2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008303','00000000-0000-4000-8000-000000009303','IE12H02911',true,false,true,53,-6,now(),'2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008304','00000000-0000-4000-8000-000000009302','IE12H02911',true,false,false,53,-6,now(),'2024-03-31 23:00+00'),
 ('00000000-0000-4000-8000-000000008305','00000000-0000-4000-8000-000000009302','IE12H02912',false,true,false,53,-6,now(),'2024-10-27 00:30+00'),
 ('00000000-0000-4000-8000-000000008306','00000000-0000-4000-8000-000000009302','IE12H02912',true,false,true,53,-6,now(),'2024-10-27 01:30+00'),
 ('00000000-0000-4000-8000-000000008307','00000000-0000-4000-8000-000000009301','IE12H02911',false,false,true,53,-6,now(),'2024-03-01 10:00+00'),
 ('00000000-0000-4000-8000-000000008308','00000000-0000-4000-8000-000000009302','34E9999999',false,true,false,53,-6,now()-interval '10 years',now()),
 ('00000000-0000-4000-8000-000000008309','00000000-0000-4000-8000-000000009302','34E9999999',true,true,true,53,-6,now(),now()),
 ('00000000-0000-4000-8000-000000008310','00000000-0000-4000-8000-000000009306','34E9999999',true,true,true,53,-6,now(),now()+interval '2 days');

set local role authenticated;
do $$
declare
  a uuid := '00000000-0000-4000-8000-000000009302';
  b uuid := '00000000-0000-4000-8000-000000009303';
  s uuid := '00000000-0000-4000-8000-000000009301';
  z uuid := '00000000-0000-4000-8000-000000009305';
  result jsonb; row_data jsonb; counts jsonb;
  baseline jsonb := current_setting('moby.collaborator_baseline')::jsonb;
  selected date; invalid_id uuid; pos_a bigint; pos_z bigint;
  zero jsonb := '{"attended":0,"locked":0,"kickstand":0,"repositioned":0,"invalid":0}';
begin
  result := public.read_team_summary_by_collaborator('2024-03-01',a);
  if jsonb_array_length(result->'rows') <> 1 or result->'rows'->0->>'id' <> a::text
    or result->'rows'->0->'metrics' <> '{"attended":1,"locked":1,"kickstand":0,"repositioned":0,"invalid":1}'::jsonb
    or result->'total_metrics' <> result->'rows'->0->'metrics'
    or result->>'month' <> '2024-03-01' or result->>'employee_id' <> a::text
    or (result->>'today')::date <> (statement_timestamp() at time zone 'Europe/Dublin')::date
    or result->>'generated_at' is null
  then raise exception 'FAIL: selected row, tie ordering, repeated checks, metadata or footer: %',result; end if;
  result := public.read_team_summary_by_collaborator('2024-03-01',b);
  if result->'rows'->0->'is_active' <> 'false'::jsonb
    or result->'total_metrics' <> '{"attended":1,"locked":0,"kickstand":1,"repositioned":1,"invalid":0}'::jsonb
  then raise exception 'FAIL: inactive historical collaborator or same bicycle across people'; end if;
  result := public.read_team_summary_by_collaborator('2024-04-01',a);
  if result->'total_metrics' <> '{"attended":1,"locked":0,"kickstand":1,"repositioned":0,"invalid":0}'::jsonb
  then raise exception 'FAIL: Dublin spring month boundary'; end if;
  result := public.read_team_summary_by_collaborator('2024-10-01',a);
  if result->'total_metrics' <> '{"attended":1,"locked":1,"kickstand":0,"repositioned":0,"invalid":1}'::jsonb
  then raise exception 'FAIL: autumn repeated-hour duplicate'; end if;
  result := public.read_team_summary_by_collaborator('2024-03-01',z);
  if jsonb_array_length(result->'rows') <> 1 or result->'total_metrics' <> zero or result->'rows'->0->'metrics' <> zero
  then raise exception 'FAIL: active collaborator without activity must have real zeros'; end if;
  result := public.read_team_summary_by_collaborator(null,a);
  if result->>'month' <> to_char(date_trunc('month',statement_timestamp() at time zone 'Europe/Dublin'),'YYYY-MM-DD')
    or result->'total_metrics' <> '{"attended":1,"locked":1,"kickstand":0,"repositioned":0,"invalid":1}'::jsonb
  then raise exception 'FAIL: default month, created_at authority or future exclusion'; end if;

  result := public.read_team_summary_by_collaborator('2024-03-01');
  if (result->'total_metrics'->>'attended')::bigint <> (baseline->'total_metrics'->>'attended')::bigint+3
    or (result->'total_metrics'->>'locked')::bigint <> (baseline->'total_metrics'->>'locked')::bigint+1
    or (result->'total_metrics'->>'kickstand')::bigint <> (baseline->'total_metrics'->>'kickstand')::bigint+1
    or (result->'total_metrics'->>'repositioned')::bigint <> (baseline->'total_metrics'->>'repositioned')::bigint+2
    or (result->'total_metrics'->>'invalid')::bigint <> (baseline->'total_metrics'->>'invalid')::bigint+1
  then raise exception 'FAIL: all-collaborator footer deltas'; end if;
  if not exists (select 1 from jsonb_array_elements(result->'rows') p where p->>'id'=s::text)
    or not exists (select 1 from jsonb_array_elements(result->'rows') p where p->>'id'=b::text)
    or not exists (select 1 from jsonb_array_elements(result->'rows') p where p->>'id'=z::text)
    or exists (select 1 from jsonb_array_elements(result->'rows') p where p->>'id' in (
      '00000000-0000-4000-8000-000000009304','00000000-0000-4000-8000-000000009306'))
  then raise exception 'FAIL: roster differs from active/history eligibility'; end if;
  select ordinal into pos_a from jsonb_array_elements(result->'rows') with ordinality items(p,ordinal) where p->>'id'=a::text;
  select ordinal into pos_z from jsonb_array_elements(result->'rows') with ordinality items(p,ordinal) where p->>'id'=z::text;
  if pos_a is null or pos_z is null or pos_a >= pos_z then raise exception 'FAIL: duplicate names lose stable ID order'; end if;

  -- Ensure every row and footer agree with the established card RPC across cases.
  foreach selected in array array[date '2024-03-01',date '2024-04-01',date '2024-10-01',date '1900-01-01',null::date]
  loop
    foreach invalid_id in array array[a,b,s,z,null::uuid]
    loop
      result := public.read_team_summary_by_collaborator(selected,invalid_id);
      counts := public.read_team_summary_metrics_filtered(selected,invalid_id)->'month_metrics';
      if result->'total_metrics' <> counts then raise exception 'FAIL: footer differs from cards: %',result; end if;
      for row_data in select value from jsonb_array_elements(result->'rows')
      loop
        if (select count(*) from jsonb_object_keys(row_data)) <> 4
          or not (row_data ?& array['id','full_name','is_active','metrics'])
          or row_data->'metrics' <> public.read_team_summary_metrics_filtered(selected,(row_data->>'id')::uuid)->'month_metrics'
        then raise exception 'FAIL: row disagreement or extra profile data'; end if;
      end loop;
    end loop;
  end loop;

  foreach invalid_id in array array['00000000-0000-4000-8000-000000009306'::uuid,'00000000-0000-4000-8000-000000009399'::uuid]
  loop
    begin
      perform public.read_team_summary_by_collaborator(null,invalid_id);
      raise exception 'FAIL: unavailable collaborator accepted';
    exception when invalid_parameter_value then null; end;
  end loop;
  foreach selected in array array[date '2024-03-02',date 'infinity',date '-infinity',date '1899-01-01',
    (date_trunc('month',statement_timestamp() at time zone 'Europe/Dublin')+interval '1 month')::date]
  loop
    begin
      perform public.read_team_summary_by_collaborator(selected,a);
      raise exception 'FAIL: invalid/future month accepted';
    exception when invalid_parameter_value then null; end;
  end loop;
  if exists (select 1 from public.profiles where id <> s)
    or exists (select 1 from public.public_order_actions where employee_id <> s)
  then raise exception 'FAIL: direct RLS widened'; end if;
end;
$$;

select set_config('request.jwt.claim.role','supervisor',true);
do $$
declare denied uuid;
begin
  foreach denied in array array['00000000-0000-4000-8000-000000009302'::uuid,
    '00000000-0000-4000-8000-000000009304'::uuid,'00000000-0000-4000-8000-000000009399'::uuid,null::uuid]
  loop
    perform set_config('request.jwt.claim.sub',coalesce(denied::text,''),true);
    begin
      perform public.read_team_summary_by_collaborator();
      raise exception 'FAIL: unauthorized public rows';
    exception when insufficient_privilege then null; end;
    begin
      perform moby_ops_private.team_summary_by_collaborator(null,null);
      raise exception 'FAIL: unauthorized private rows';
    exception when insufficient_privilege then null; end;
  end loop;
end;
$$;
reset role;
do $$
declare signature text;
begin
  foreach signature in array array['public.read_team_summary_by_collaborator(date,uuid)',
    'moby_ops_private.team_summary_by_collaborator(date,uuid)']
  loop
    if has_function_privilege('anon',signature,'EXECUTE') or exists (
      select 1 from pg_catalog.pg_proc fn cross join lateral pg_catalog.aclexplode(coalesce(fn.proacl,pg_catalog.acldefault('f',fn.proowner))) acl
      where fn.oid=to_regprocedure(signature) and acl.grantee=0 and acl.privilege_type='EXECUTE'
    ) then raise exception 'FAIL: anonymous/PUBLIC grant on %',signature; end if;
  end loop;
end;
$$;
set local role anon;
do $$
begin
  begin
    perform public.read_team_summary_by_collaborator();
    raise exception 'FAIL: anonymous table';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;
select 'OK: collaborator rows, footer/card agreement, filters, zeros, inactive history, duplicates, DST, metadata, authorization and unchanged direct RLS' as resultado;
rollback;
