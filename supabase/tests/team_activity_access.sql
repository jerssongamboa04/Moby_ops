-- Execute as administrator in SQL Editor; all fixtures are rolled back.
begin;
do $$ begin
  if exists (select 1 from auth.users where id::text between '00000000-0000-4000-8000-000000009401' and '00000000-0000-4000-8000-000000009404')
    or exists (select 1 from public.public_order_actions where id::text between '00000000-0000-4000-8000-000000008401' and '00000000-0000-4000-8000-000000008499')
  then raise exception 'Reserved activity fixture IDs already exist; stop without changes'; end if;
end; $$;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000009401','moby-activity-009401@example.invalid'),
 ('00000000-0000-4000-8000-000000009402','moby-activity-009402@example.invalid'),
 ('00000000-0000-4000-8000-000000009403','moby-activity-009403@example.invalid'),
 ('00000000-0000-4000-8000-000000009404','moby-activity-009404@example.invalid');
insert into public.profiles(id,full_name,role,is_active) values
 ('00000000-0000-4000-8000-000000009401','SQL activity supervisor','supervisor',true),
 ('00000000-0000-4000-8000-000000009402','SQL activity employee','employee',true),
 ('00000000-0000-4000-8000-000000009403','SQL activity historical','employee',false),
 ('00000000-0000-4000-8000-000000009404','SQL activity inactive supervisor','supervisor',false)
on conflict(id) do update set full_name=excluded.full_name,role=excluded.role,is_active=excluded.is_active;
insert into public.public_order_actions(id,employee_id,bike_external_id,kickstand_positioned,bike_locked,bike_repositioned,latitude,longitude,performed_at,created_at) values
 ('00000000-0000-4000-8000-000000008401','00000000-0000-4000-8000-000000009402','IE12H02911',false,true,false,53,-6,now()-interval '10 years','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008402','00000000-0000-4000-8000-000000009402','IE12H02911',true,true,true,53,-6,now()-interval '10 years','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008403','00000000-0000-4000-8000-000000009403','IE12H02911',true,false,true,53,-6,now()-interval '10 years','2024-03-31 22:59+00'),
 ('00000000-0000-4000-8000-000000008404','00000000-0000-4000-8000-000000009402','IE12H02911',true,false,false,53,-6,now()-interval '10 years','2024-03-31 23:00+00'),
 ('00000000-0000-4000-8000-000000008405','00000000-0000-4000-8000-000000009402','IE12H02912',false,true,false,53,-6,now()-interval '10 years','2024-10-27 00:30+00'),
 ('00000000-0000-4000-8000-000000008406','00000000-0000-4000-8000-000000009402','IE12H02912',true,false,true,53,-6,now()-interval '10 years','2024-10-27 01:30+00'),
 ('00000000-0000-4000-8000-000000008407','00000000-0000-4000-8000-000000009402','34E9999999',false,true,false,53,-6,now()-interval '10 years',now()),
 ('00000000-0000-4000-8000-000000008408','00000000-0000-4000-8000-000000009402','34E9999999',true,true,true,53,-6,now()-interval '10 years',now()),
 ('00000000-0000-4000-8000-000000008409','00000000-0000-4000-8000-000000009402','34E9999998',true,true,true,53,-6,now()-interval '10 years',now()+interval '2 days'),
 ('00000000-0000-4000-8000-000000008420','00000000-0000-4000-8000-000000009402','34E0000000',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '0 minutes'),
 ('00000000-0000-4000-8000-000000008421','00000000-0000-4000-8000-000000009402','34E0000001',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '1 minutes'),
 ('00000000-0000-4000-8000-000000008422','00000000-0000-4000-8000-000000009402','34E0000002',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '2 minutes'),
 ('00000000-0000-4000-8000-000000008423','00000000-0000-4000-8000-000000009402','34E0000003',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '3 minutes'),
 ('00000000-0000-4000-8000-000000008424','00000000-0000-4000-8000-000000009402','34E0000004',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '4 minutes'),
 ('00000000-0000-4000-8000-000000008425','00000000-0000-4000-8000-000000009402','34E0000005',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '5 minutes'),
 ('00000000-0000-4000-8000-000000008426','00000000-0000-4000-8000-000000009402','34E0000006',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '6 minutes'),
 ('00000000-0000-4000-8000-000000008427','00000000-0000-4000-8000-000000009402','34E0000007',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '7 minutes'),
 ('00000000-0000-4000-8000-000000008428','00000000-0000-4000-8000-000000009402','34E0000008',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '8 minutes'),
 ('00000000-0000-4000-8000-000000008429','00000000-0000-4000-8000-000000009402','34E0000009',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '9 minutes'),
 ('00000000-0000-4000-8000-000000008430','00000000-0000-4000-8000-000000009402','34E0000010',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '10 minutes'),
 ('00000000-0000-4000-8000-000000008431','00000000-0000-4000-8000-000000009402','34E0000011',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '11 minutes'),
 ('00000000-0000-4000-8000-000000008432','00000000-0000-4000-8000-000000009402','34E0000012',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '12 minutes'),
 ('00000000-0000-4000-8000-000000008433','00000000-0000-4000-8000-000000009402','34E0000013',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '13 minutes'),
 ('00000000-0000-4000-8000-000000008434','00000000-0000-4000-8000-000000009402','34E0000014',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '14 minutes'),
 ('00000000-0000-4000-8000-000000008435','00000000-0000-4000-8000-000000009402','34E0000015',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '15 minutes'),
 ('00000000-0000-4000-8000-000000008436','00000000-0000-4000-8000-000000009402','34E0000016',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '16 minutes'),
 ('00000000-0000-4000-8000-000000008437','00000000-0000-4000-8000-000000009402','34E0000017',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '17 minutes'),
 ('00000000-0000-4000-8000-000000008438','00000000-0000-4000-8000-000000009402','34E0000018',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '18 minutes'),
 ('00000000-0000-4000-8000-000000008439','00000000-0000-4000-8000-000000009402','34E0000019',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '19 minutes'),
 ('00000000-0000-4000-8000-000000008440','00000000-0000-4000-8000-000000009402','34E0000020',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '20 minutes'),
 ('00000000-0000-4000-8000-000000008441','00000000-0000-4000-8000-000000009402','34E0000021',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '21 minutes'),
 ('00000000-0000-4000-8000-000000008442','00000000-0000-4000-8000-000000009402','34E0000022',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '22 minutes'),
 ('00000000-0000-4000-8000-000000008443','00000000-0000-4000-8000-000000009402','34E0000023',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '23 minutes'),
 ('00000000-0000-4000-8000-000000008444','00000000-0000-4000-8000-000000009402','34E0000024',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '24 minutes'),
 ('00000000-0000-4000-8000-000000008445','00000000-0000-4000-8000-000000009402','34E0000025',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '25 minutes'),
 ('00000000-0000-4000-8000-000000008446','00000000-0000-4000-8000-000000009402','34E0000026',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '26 minutes'),
 ('00000000-0000-4000-8000-000000008447','00000000-0000-4000-8000-000000009402','34E0000027',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '27 minutes'),
 ('00000000-0000-4000-8000-000000008448','00000000-0000-4000-8000-000000009402','34E0000028',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '28 minutes'),
 ('00000000-0000-4000-8000-000000008449','00000000-0000-4000-8000-000000009402','34E0000029',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '29 minutes'),
 ('00000000-0000-4000-8000-000000008450','00000000-0000-4000-8000-000000009402','34E0000030',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '30 minutes'),
 ('00000000-0000-4000-8000-000000008451','00000000-0000-4000-8000-000000009402','34E0000031',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '31 minutes'),
 ('00000000-0000-4000-8000-000000008452','00000000-0000-4000-8000-000000009402','34E0000032',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '32 minutes'),
 ('00000000-0000-4000-8000-000000008453','00000000-0000-4000-8000-000000009402','34E0000033',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '33 minutes'),
 ('00000000-0000-4000-8000-000000008454','00000000-0000-4000-8000-000000009402','34E0000034',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '34 minutes'),
 ('00000000-0000-4000-8000-000000008455','00000000-0000-4000-8000-000000009402','34E0000035',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '35 minutes'),
 ('00000000-0000-4000-8000-000000008456','00000000-0000-4000-8000-000000009402','34E0000036',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '36 minutes'),
 ('00000000-0000-4000-8000-000000008457','00000000-0000-4000-8000-000000009402','34E0000037',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '37 minutes'),
 ('00000000-0000-4000-8000-000000008458','00000000-0000-4000-8000-000000009402','34E0000038',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '38 minutes'),
 ('00000000-0000-4000-8000-000000008459','00000000-0000-4000-8000-000000009402','34E0000039',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '39 minutes'),
 ('00000000-0000-4000-8000-000000008460','00000000-0000-4000-8000-000000009402','34E0000040',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '40 minutes'),
 ('00000000-0000-4000-8000-000000008461','00000000-0000-4000-8000-000000009402','34E0000041',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '41 minutes'),
 ('00000000-0000-4000-8000-000000008462','00000000-0000-4000-8000-000000009402','34E0000042',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '42 minutes'),
 ('00000000-0000-4000-8000-000000008463','00000000-0000-4000-8000-000000009402','34E0000043',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '43 minutes'),
 ('00000000-0000-4000-8000-000000008464','00000000-0000-4000-8000-000000009402','34E0000044',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '44 minutes'),
 ('00000000-0000-4000-8000-000000008465','00000000-0000-4000-8000-000000009402','34E0000045',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '45 minutes'),
 ('00000000-0000-4000-8000-000000008466','00000000-0000-4000-8000-000000009402','34E0000046',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '46 minutes'),
 ('00000000-0000-4000-8000-000000008467','00000000-0000-4000-8000-000000009402','34E0000047',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '47 minutes'),
 ('00000000-0000-4000-8000-000000008468','00000000-0000-4000-8000-000000009402','34E0000048',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '48 minutes'),
 ('00000000-0000-4000-8000-000000008469','00000000-0000-4000-8000-000000009402','34E0000049',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '49 minutes'),
 ('00000000-0000-4000-8000-000000008470','00000000-0000-4000-8000-000000009402','34E0000050',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '50 minutes'),
 ('00000000-0000-4000-8000-000000008471','00000000-0000-4000-8000-000000009402','34E0000051',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '51 minutes'),
 ('00000000-0000-4000-8000-000000008472','00000000-0000-4000-8000-000000009402','34E0000052',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '52 minutes'),
 ('00000000-0000-4000-8000-000000008473','00000000-0000-4000-8000-000000009402','34E0000053',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '53 minutes'),
 ('00000000-0000-4000-8000-000000008474','00000000-0000-4000-8000-000000009402','34E0000054',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '54 minutes'),
 ('00000000-0000-4000-8000-000000008475','00000000-0000-4000-8000-000000009402','34E0000055',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '55 minutes'),
 ('00000000-0000-4000-8000-000000008476','00000000-0000-4000-8000-000000009402','34E0000056',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '56 minutes'),
 ('00000000-0000-4000-8000-000000008477','00000000-0000-4000-8000-000000009402','34E0000057',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '57 minutes'),
 ('00000000-0000-4000-8000-000000008478','00000000-0000-4000-8000-000000009402','34E0000058',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '58 minutes'),
 ('00000000-0000-4000-8000-000000008479','00000000-0000-4000-8000-000000009402','34E0000059',true,true,true,53,-6,now()-interval '10 years',timestamptz '2024-05-01 10:00+00'+interval '59 minutes');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000009401',true);
set local role authenticated;
do $$
declare
  a uuid := '00000000-0000-4000-8000-000000009402';
  b uuid := '00000000-0000-4000-8000-000000009403';
  result jsonb; first_page jsonb; second_page jsonb; last_page jsonb; item jsonb; invalid_date date;
begin
  result := public.read_team_activity(p_date=>'2024-03-31',p_employee_id=>a);
  if (result->>'total')::integer <> 2 or (result->>'valid')::integer <> 1 or (result->>'invalid')::integer <> 1
    or result->'items'->0->>'id' <> '00000000-0000-4000-8000-000000008402'
    or result->'items'->0->>'duplicate_of' <> '00000000-0000-4000-8000-000000008401'
    or result->'items'->1->'duplicate_of' <> 'null'::jsonb
  then raise exception 'FAIL: classification, deterministic tie ordering or duplicate reference'; end if;
  result := public.read_team_activity(p_date=>'2024-03-31',p_employee_id=>a,p_validity=>'invalid',p_bike_query=>' h02911 ');
  if result->>'bike_query' <> 'H02911' or (result->>'total')::integer <> 1 or (result->>'valid')::integer <> 0
    or result->'items'->0->>'duplicate_of' <> '00000000-0000-4000-8000-000000008401'
  then raise exception 'FAIL: search/validity filtering must not reclassify the duplicate'; end if;
  result := public.read_team_activity(p_date=>'2024-03-31',p_employee_id=>b);
  if (result->>'valid')::integer <> 1 or result->'items'->0->>'employee_id' <> b::text
  then raise exception 'FAIL: historical collaborator and independent same-bike classification'; end if;
  result := public.read_team_activity(p_date=>'2024-04-01',p_employee_id=>a);
  if (result->>'total')::integer <> 1 then raise exception 'FAIL: Dublin spring midnight boundary'; end if;
  result := public.read_team_activity(p_date=>'2024-10-27',p_employee_id=>a,p_validity=>'invalid');
  if (result->>'total')::integer <> 1 or result->'items'->0->>'duplicate_of' <> '00000000-0000-4000-8000-000000008405'
  then raise exception 'FAIL: repeated DST hour'; end if;
  result := public.read_team_activity(p_employee_id=>a);
  if (result->>'total')::integer <> 2 or (result->>'valid')::integer <> 1
    or result->>'period' <> ((statement_timestamp() at time zone 'Europe/Dublin')::date)::text
  then raise exception 'FAIL: default today uses created_at, never performed_at or future submissions'; end if;
  result := public.read_team_activity(p_date=>'1900-01-01',p_employee_id=>a);
  if result->'items' <> '[]'::jsonb or (result->>'total')::integer <> 0 or (result->>'has_more')::boolean
  then raise exception 'FAIL: genuine empty date'; end if;
  first_page := public.read_team_activity('month','2024-05-01',a);
  second_page := public.read_team_activity('month','2024-05-01',a,p_offset=>25,p_as_of=>(first_page->>'as_of')::timestamptz);
  last_page := public.read_team_activity('month','2024-05-01',a,p_offset=>50,p_as_of=>(first_page->>'as_of')::timestamptz);
  if (first_page->>'total')::integer <> 60 or jsonb_array_length(first_page->'items') <> 25
    or jsonb_array_length(second_page->'items') <> 25 or jsonb_array_length(last_page->'items') <> 10
    or not (first_page->>'has_more')::boolean or not (second_page->>'has_more')::boolean or (last_page->>'has_more')::boolean
    or first_page->>'as_of' <> second_page->>'as_of'
    or first_page->'items'->0->>'id' <> '00000000-0000-4000-8000-000000008479'
    or second_page->'items'->0->>'id' <> '00000000-0000-4000-8000-000000008454'
    or (select count(distinct value->>'id') from jsonb_array_elements((first_page->'items') || (second_page->'items') || (last_page->'items'))) <> 60
  then raise exception 'FAIL: stable paginated total, order or overlapping pages'; end if;
  result := public.read_team_activity('month','2024-05-01',a,p_offset=>75,p_as_of=>(first_page->>'as_of')::timestamptz);
  if result->'items' <> '[]'::jsonb or (result->>'has_more')::boolean or (result->>'total')::integer <> 60
  then raise exception 'FAIL: beyond-last page must preserve total without fabricated items'; end if;
  for item in select value from jsonb_array_elements(first_page->'items') loop
    if (select count(*) from jsonb_object_keys(item)) <> 10 or item ? 'notes' or item ? 'latitude' or item ? 'storage_path'
    then raise exception 'FAIL: list exposes unnecessary detail fields'; end if;
  end loop;
  -- Snapshot excludes later submissions, and a cutoff still keeps duplicate classification.
  result := public.read_team_activity('month','2024-05-01',a,p_as_of=>'2024-05-01 10:29:00+00');
  if (result->>'total')::integer <> 30 then raise exception 'FAIL: snapshot cutoff'; end if;
  result := public.read_team_activity('month','2024-03-01',a,p_validity=>'valid');
  if (result->>'total')::integer <> 1 or result->'items'->0->>'id' <> '00000000-0000-4000-8000-000000008401'
  then raise exception 'FAIL: valid-only monthly filter'; end if;
  for invalid_date in select unnest(array[date 'infinity',date '-infinity',date '1899-12-31',
    (statement_timestamp() at time zone 'Europe/Dublin')::date+1]) loop
    begin perform public.read_team_activity(p_date=>invalid_date); raise exception 'FAIL: invalid date accepted'; exception when sqlstate '22023' then null; end;
  end loop;
  begin perform public.read_team_activity('month','2024-03-02'); raise exception 'FAIL: invalid month accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_view=>null); raise exception 'FAIL: null view accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_validity=>'unknown'); raise exception 'FAIL: invalid status accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_offset=>1); raise exception 'FAIL: invalid page accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_offset=>-25); raise exception 'FAIL: negative page accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_bike_query=>'%' ); raise exception 'FAIL: wildcard accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_bike_query=>'ABCDEFGHIJK'); raise exception 'FAIL: oversized search accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_as_of=>statement_timestamp()+interval '1 day'); raise exception 'FAIL: future snapshot accepted'; exception when sqlstate '22023' then null; end;
  begin perform public.read_team_activity(p_employee_id=>'00000000-0000-4000-8000-000000009499'); raise exception 'FAIL: missing person accepted'; exception when sqlstate '22023' then null; end;
  if exists(select 1 from public.public_order_actions where employee_id<>auth.uid()) or exists(select 1 from public.profiles where id<>auth.uid())
  then raise exception 'FAIL: direct RLS broadened'; end if;
end; $$;

do $$ declare subject text; begin
  perform set_config('request.jwt.claim.role','supervisor',true);
  foreach subject in array array['00000000-0000-4000-8000-000000009402','00000000-0000-4000-8000-000000009404','00000000-0000-4000-8000-000000009499',''] loop
    perform set_config('request.jwt.claim.sub',subject,true);
    begin perform public.read_team_activity(); raise exception 'FAIL: unauthorized public RPC accepted'; exception when sqlstate '42501' then null; end;
    begin perform moby_ops_private.team_activity('day',null,null,null,'all',0,null); raise exception 'FAIL: unauthorized private engine accepted'; exception when sqlstate '42501' then null; end;
  end loop;
end; $$;
reset role;
do $$ declare fn regprocedure; begin
  foreach fn in array array['public.read_team_activity(text,date,uuid,text,text,integer,timestamptz)'::regprocedure,
    'moby_ops_private.team_activity(text,date,uuid,text,text,integer,timestamptz)'::regprocedure] loop
    if has_function_privilege('anon',fn,'EXECUTE') or exists(select 1 from pg_proc p,
      lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) acl where p.oid=fn and acl.grantee=0 and acl.privilege_type='EXECUTE')
    then raise exception 'FAIL: anonymous or PUBLIC execute privilege'; end if;
  end loop;
end; $$;
set local role anon;
do $$ begin
  begin perform public.read_team_activity(); raise exception 'FAIL: anonymous RPC accepted'; exception when sqlstate '42501' then null; end;
end; $$;
reset role;
select 'OK: activity filters, day/month, search, validity, duplicates, DST, stable pagination, minimal fields, authorization and unchanged direct RLS' as resultado;
rollback;
