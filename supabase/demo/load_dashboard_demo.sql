-- Manual SQL Editor only. Requires four demo accounts created via Supabase Auth.
-- Keeps original actions/photos. No Storage, Auth, schema or permission writes.
begin;
set local lock_timeout = '5s';

create temporary table demo_people (
  slot integer primary key, email text, full_name text not null, id uuid
) on commit drop;
insert into demo_people values
 (0,null,'Jersson Gamboa','aa116607-be9b-4297-81e9-c63d8425b121'),
 (1,'demo.ubaldo@moby-ops.example.com','Ubaldo Gonzalez',null),
 (2,'demo.victor@moby-ops.example.com','Victor Benitez',null),
 (3,'demo.jimfranc@moby-ops.example.com','Jimfranc Delgado',null),
 (4,'demo.papa@moby-ops.example.com','Papa Alioune',null);

-- Lock only the known existing profile before renaming it.
select id from public.profiles where id = 'aa116607-be9b-4297-81e9-c63d8425b121' for update;
do $$ begin
  if not exists (select 1 from public.profiles where id = 'aa116607-be9b-4297-81e9-c63d8425b121'
      and role = 'supervisor' and is_active and full_name in ('Empleado de prueba','Jersson Gamboa')) then
    raise exception 'Expected existing supervisor profile; no changes applied';
  end if;
  if exists (select 1 from demo_people p where p.slot > 0 and
      (select count(*) from auth.users u where lower(u.email) = p.email) <> 1) then
    raise exception 'Create the four specified demo accounts in Supabase Auth first; no changes applied';
  end if;
end; $$;
update demo_people p set id = u.id from auth.users u where p.slot > 0 and lower(u.email) = p.email;

do $$ begin
  if (select count(distinct id) from demo_people) <> 5 then
    raise exception 'Demo identities must be distinct';
  end if;
  if exists (select 1 from public.profiles p join demo_people d on d.id = p.id where d.slot > 0) then
    raise exception 'Demo profile already exists. Stop to inspect instead of overwriting it';
  end if;
  if exists (select 1 from public.public_order_actions where
      notes = '[DEMO:dashboard-20261012-v1] Simulación sin fotografía.'
      or bike_external_id between '39E9900001' and '39E9900600'
      or id in (select md5('moby-dashboard-demo-20261012-v1:action:' || i)::uuid from generate_series(1,600) i)) then
    raise exception 'Demo batch or reserved IDs already present. Stop; do not load twice';
  end if;
end; $$;

update public.profiles set full_name = 'Jersson Gamboa'
where id = 'aa116607-be9b-4297-81e9-c63d8425b121';
insert into public.profiles(id,full_name,role,is_active)
select id,full_name,'employee',false from demo_people where slot > 0;

create temporary table demo_rows on commit drop as
with months as (
  select m, 50 + 20*m as n,
    (date_trunc('month',statement_timestamp() at time zone 'Europe/Dublin')
      - (5-m)*interval '1 month')::date as month_start
  from generate_series(0,5) m
), numbered as (
  select m,n,month_start,j,
    (select coalesce(sum(50+20*k),0)::integer from generate_series(0,m-1) k) + j as seq,
    case when j % 10 = 0 then j-1 else j end as base
  from months cross join lateral generate_series(1,n) j
), mapped as (
  select *, seq-j+base as global_base,
    case (((seq-j+base-1)/10)%10) when 0 then 0 when 1 then 0 when 2 then 0
      when 3 then 1 when 4 then 1 when 5 then 2 when 6 then 2 when 7 then 3 else 4 end as slot
  from numbered
)
select md5('moby-dashboard-demo-20261012-v1:action:' || seq)::uuid as id,
  p.id as employee_id, '39E' || (9900000+global_base)::text as bike_external_id,
  seq % 3 <> 0 as kickstand_positioned, seq % 3 <> 1 as bike_locked,
  seq % 3 <> 2 as bike_repositioned,
  case when m = 5 then
    (date_trunc('day',statement_timestamp() at time zone 'Europe/Dublin') at time zone 'Europe/Dublin')
    + (statement_timestamp() - (date_trunc('day',statement_timestamp() at time zone 'Europe/Dublin') at time zone 'Europe/Dublin'))
      * ((base + case when j % 10 = 0 then 0.5 else 0 end)/(n+1.0))::double precision
  else ((month_start + ((base-1)%28))::timestamp + interval '9 hours'
    + (base + case when j % 10 = 0 then 0.5 else 0 end)*interval '1 minute') at time zone 'Europe/Dublin'
  end as created_at
from mapped join demo_people p using(slot);

insert into public.public_order_actions
 (id,employee_id,bike_external_id,kickstand_positioned,bike_locked,bike_repositioned,notes,latitude,longitude,performed_at,created_at)
select id,employee_id,bike_external_id,kickstand_positioned,bike_locked,bike_repositioned,
 '[DEMO:dashboard-20261012-v1] Simulación sin fotografía.',53.3498,-6.2603,created_at,created_at
from demo_rows;

do $$ begin
  if (select count(*) from demo_rows) <> 600 or
     (select count(*) from demo_rows where created_at > statement_timestamp()) > 0 or
     (select count(*) from (select employee_id,bike_external_id,(created_at at time zone 'Europe/Dublin')::date
       from demo_rows group by 1,2,3) valid) <> 540 then
    raise exception 'Unexpected demo count/date/duplicate distribution; transaction aborted';
  end if;
end; $$;

-- This result describes only this batch, excluding original operational rows.
select jsonb_build_object('resultado','OK: 600 actuaciones demo, 540 válidas, 60 inválidas; sin fotos',
  'por_mes',(select jsonb_agg(x order by mes) from (
    select to_char(created_at at time zone 'Europe/Dublin','YYYY-MM') as mes,count(*) as actuaciones
    from demo_rows group by 1) x),
  'por_colaborador',(select jsonb_agg(x order by nombre) from (
    select p.full_name as nombre,count(*) as actuaciones from demo_rows r join demo_people p on p.id = r.employee_id group by 1) x)) as resultado;
commit;
