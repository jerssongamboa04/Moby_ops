-- Run in SQL Editor as administrator. Synthetic metadata only; no image bytes.
-- The entire transaction is rolled back. On failure, run ROLLBACK before retrying.
begin;
do $$ begin
  if exists (select 1 from auth.users where id::text between '00000000-0000-4000-8000-000000009501' and '00000000-0000-4000-8000-000000009504')
    or exists (select 1 from public.public_order_actions where id::text between '00000000-0000-4000-8000-000000008501' and '00000000-0000-4000-8000-000000008505')
    or exists (select 1 from public.action_evidence where id::text between '00000000-0000-4000-8000-000000008601' and '00000000-0000-4000-8000-000000008605')
    or exists (select 1 from storage.objects where name like '00000000-0000-4000-8000-00000000950%/%')
  then raise exception 'Reserved detail fixtures already exist; stop'; end if;
end; $$;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000009501','moby-detail-9501@example.invalid'),
 ('00000000-0000-4000-8000-000000009502','moby-detail-9502@example.invalid'),
 ('00000000-0000-4000-8000-000000009503','moby-detail-9503@example.invalid'),
 ('00000000-0000-4000-8000-000000009504','moby-detail-9504@example.invalid');
insert into public.profiles(id,full_name,role,is_active) values
 ('00000000-0000-4000-8000-000000009501','SQL detail 9501','supervisor',true),
 ('00000000-0000-4000-8000-000000009502','SQL detail 9502','employee',true),
 ('00000000-0000-4000-8000-000000009503','SQL detail 9503','employee',false),
 ('00000000-0000-4000-8000-000000009504','SQL detail 9504','supervisor',false)
on conflict(id) do update set full_name=excluded.full_name,role=excluded.role,is_active=excluded.is_active;
insert into public.public_order_actions(id,employee_id,bike_external_id,bike_locked,kickstand_positioned,bike_repositioned,notes,latitude,longitude,performed_at,created_at) values
 ('00000000-0000-4000-8000-000000008501','00000000-0000-4000-8000-000000009502','IE12H02911',true,false,false,'Actual observation',53.34,-6.26,'2020-01-01 12:00+00','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008502','00000000-0000-4000-8000-000000009502','IE12H02911',true,false,false,null,53.34,-6.26,'2020-01-01 12:00+00','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008503','00000000-0000-4000-8000-000000009502','IE12H02911',true,false,false,null,53.34,-6.26,'2020-01-01 12:00+00','2024-03-31 23:00+00'),
 ('00000000-0000-4000-8000-000000008504','00000000-0000-4000-8000-000000009503','IE12H02911',true,false,false,null,53.34,-6.26,'2020-01-01 12:00+00','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008505','00000000-0000-4000-8000-000000009502','IE12H02911',true,false,false,null,53.34,-6.26,'2020-01-01 12:00+00','2024-10-27 00:30+00');
insert into public.action_evidence(id,action_id,phase,storage_path,mime_type,file_size,captured_at,created_at) values
 ('00000000-0000-4000-8000-000000008601','00000000-0000-4000-8000-000000008501','before','00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp','image/webp',100,'2024-03-31 22:58+00','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008602','00000000-0000-4000-8000-000000008501','after','00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/after/00000000-0000-4000-8000-000000008702.webp','image/webp',100,'2024-03-31 22:58+00','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008603','00000000-0000-4000-8000-000000008504','before','00000000-0000-4000-8000-000000009503/00000000-0000-4000-8000-000000008504/before/00000000-0000-4000-8000-000000008703.webp','image/webp',100,'2024-03-31 22:58+00','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008604','00000000-0000-4000-8000-000000008501','before','00000000-0000-4000-8000-000000009503/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008704.webp','image/webp',100,'2024-03-31 22:58+00','2024-03-31 22:59+00');
insert into storage.objects(bucket_id,name,owner_id,metadata) values
 ('public-order-evidence','00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp','00000000-0000-4000-8000-000000009502','{"mimetype":"image/webp","size":100}'::jsonb),
 ('public-order-evidence','00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/after/00000000-0000-4000-8000-000000008702.webp','00000000-0000-4000-8000-000000009502','{"mimetype":"image/webp","size":100}'::jsonb),
 ('public-order-evidence','00000000-0000-4000-8000-000000009503/00000000-0000-4000-8000-000000008504/before/00000000-0000-4000-8000-000000008703.webp','00000000-0000-4000-8000-000000009503','{"mimetype":"image/webp","size":100}'::jsonb),
 ('public-order-evidence','00000000-0000-4000-8000-000000009503/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008704.webp','00000000-0000-4000-8000-000000009503','{"mimetype":"image/webp","size":100}'::jsonb),
 ('public-order-evidence','00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/after/00000000-0000-4000-8000-000000008799.webp','00000000-0000-4000-8000-000000009502','{"mimetype":"image/webp","size":100}'::jsonb);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000009501","role":"authenticated"}',true);
do $$
declare detail jsonb; listed jsonb;
begin
  detail := public.read_team_activity_detail('00000000-0000-4000-8000-000000008501');
  if detail->>'full_name' <> 'SQL detail 9502' or detail->>'notes' <> 'Actual observation'
    or (detail->>'latitude')::numeric <> 53.34 or not (detail->>'counted')::boolean
    or detail->>'duplicate_of' is not null or jsonb_array_length(detail->'evidence') <> 2
    or detail->'evidence'->0->>'phase' <> 'before' or detail->'evidence'->1->>'phase' <> 'after'
  then raise exception 'FAIL: real detail, valid status, evidence order or path restriction'; end if;
  if (select count(*) from jsonb_object_keys(detail)) <> 15 or
    (select count(*) from jsonb_object_keys(detail->'evidence'->0)) <> 4
  then raise exception 'FAIL: minimal fields'; end if;
  detail := public.read_team_activity_detail('00000000-0000-4000-8000-000000008502');
  if (detail->>'counted')::boolean or detail->>'duplicate_of' <> '00000000-0000-4000-8000-000000008501'
    or detail->>'notes' is not null or detail->'evidence' <> '[]'::jsonb
  then raise exception 'FAIL: deterministic duplicate, nullable observation or missing evidence'; end if;
  listed := public.read_team_activity('day','2024-03-31','00000000-0000-4000-8000-000000009502',null,'invalid',0,null);
  if listed->'items'->0->>'id' <> detail->>'id' or listed->'items'->0->>'duplicate_of' <> detail->>'duplicate_of'
  then raise exception 'FAIL: list/detail agreement'; end if;
  if not (public.read_team_activity_detail('00000000-0000-4000-8000-000000008503')->>'counted')::boolean
    or not (public.read_team_activity_detail('00000000-0000-4000-8000-000000008504')->>'counted')::boolean
  then raise exception 'FAIL: Dublin midnight or independent historical employee'; end if;
  if public.read_team_activity_detail('00000000-0000-4000-8000-000000008599') is not null
    or public.read_team_activity_detail('00000000-0000-4000-8000-000000008501','2024-03-31 22:58+00') is not null
  then raise exception 'FAIL: missing action or cutoff'; end if;
  if (select count(*) from storage.objects where name = any(array['00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp','00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/after/00000000-0000-4000-8000-000000008702.webp','00000000-0000-4000-8000-000000009503/00000000-0000-4000-8000-000000008504/before/00000000-0000-4000-8000-000000008703.webp','00000000-0000-4000-8000-000000009503/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008704.webp'])) <> 3
    or exists(select 1 from storage.objects where name = '00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/after/00000000-0000-4000-8000-000000008799.webp')
  then raise exception 'FAIL: registered-only supervisor Storage RLS'; end if;
  if exists(select 1 from public.public_order_actions where id in ('00000000-0000-4000-8000-000000008501','00000000-0000-4000-8000-000000008504'))
    or exists(select 1 from public.action_evidence where id = '00000000-0000-4000-8000-000000008601')
  then raise exception 'FAIL: direct table RLS broadened'; end if;
  begin perform public.read_team_activity_detail(null); raise exception 'FAIL: null accepted';
  exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity_detail('00000000-0000-4000-8000-000000008501','infinity'); raise exception 'FAIL: infinity accepted';
  exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity_detail('00000000-0000-4000-8000-000000008501',statement_timestamp()+interval '1 day'); raise exception 'FAIL: future accepted';
  exception when sqlstate '22023' then null; end;
end; $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000009502","role":"supervisor"}',true);
do $$ begin
  begin perform public.read_team_activity_detail('00000000-0000-4000-8000-000000008501'); raise exception 'FAIL: spoofed employee role accepted';
  exception when sqlstate '42501' then null; end;
  begin perform moby_ops_private.team_activity_detail('00000000-0000-4000-8000-000000008501',null); raise exception 'FAIL: private guard bypass';
  exception when sqlstate '42501' then null; end;
  if moby_ops_private.supervisor_can_read_evidence('00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp')
    or exists(select 1 from storage.objects where name = '00000000-0000-4000-8000-000000009503/00000000-0000-4000-8000-000000008504/before/00000000-0000-4000-8000-000000008703.webp')
    or not exists(select 1 from storage.objects where name = '00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp')
    or not exists(select 1 from public.action_evidence where id = '00000000-0000-4000-8000-000000008601')
  then raise exception 'FAIL: employee own access or cross-user denial'; end if;
end; $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000009504","role":"authenticated"}',true);
do $$ begin
  begin perform public.read_team_activity_detail('00000000-0000-4000-8000-000000008501'); raise exception 'FAIL: inactive/unknown accepted';
  exception when sqlstate '42501' then null; end;
  if moby_ops_private.supervisor_can_read_evidence('00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp')
    or exists(select 1 from storage.objects where name = '00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp')
  then raise exception 'FAIL: inactive/unknown Storage access'; end if;
end; $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000009599","role":"authenticated"}',true);
do $$ begin
  begin perform public.read_team_activity_detail('00000000-0000-4000-8000-000000008501'); raise exception 'FAIL: inactive/unknown accepted';
  exception when sqlstate '42501' then null; end;
  if moby_ops_private.supervisor_can_read_evidence('00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp')
    or exists(select 1 from storage.objects where name = '00000000-0000-4000-8000-000000009502/00000000-0000-4000-8000-000000008501/before/00000000-0000-4000-8000-000000008701.webp')
  then raise exception 'FAIL: inactive/unknown Storage access'; end if;
end; $$;
select set_config('request.jwt.claims','{}',true);
do $$ begin
  begin perform public.read_team_activity_detail('00000000-0000-4000-8000-000000008501'); raise exception 'FAIL: no identity accepted';
  exception when sqlstate '42501' then null; end;
end; $$;
reset role;
do $$ declare fn regprocedure; begin
  foreach fn in array array[
    'public.read_team_activity_detail(uuid,timestamptz)'::regprocedure,
    'moby_ops_private.team_activity_detail(uuid,timestamptz)'::regprocedure,
    'moby_ops_private.supervisor_can_read_evidence(text)'::regprocedure
  ] loop
    if has_function_privilege('anon',fn,'EXECUTE') or exists(
      select 1 from pg_proc p, lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      where p.oid = fn and a.grantee = 0 and a.privilege_type = 'EXECUTE'
    ) then raise exception 'FAIL: anonymous/PUBLIC function execution'; end if;
  end loop;
  if not exists(select 1 from storage.buckets where id='public-order-evidence' and not public)
    or not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects'
      and policyname='evidence_read_registered_supervisor' and cmd='SELECT')
    or (select count(*) from pg_policies where schemaname='storage' and tablename='objects'
      and policyname in ('evidence_upload_own_active','evidence_read_own_active')) <> 2
  then raise exception 'FAIL: bucket/policy configuration'; end if;
end; $$;
rollback;
select 'OK: detail/list agreement, real evidence, duplicate ties, Dublin midnight, history, cutoff, registered Storage access, own access, role checks and unchanged direct table RLS' as resultado;
