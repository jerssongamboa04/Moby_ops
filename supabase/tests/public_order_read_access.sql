begin;

-- Preparación administrativa, solo dentro de esta prueba.
update public.profiles
set is_active = true
where id = 'aa116607-be9b-4297-81e9-c63d8425b121';

insert into public.public_order_actions (
  id,
  employee_id,
  bike_external_id,
  kickstand_positioned,
  latitude,
  longitude,
  performed_at
)
values (
  '10000000-0000-4000-8000-000000000001',
  'aa116607-be9b-4297-81e9-c63d8425b121',
  'TEST-RLS-BIKE',
  true,
  53.3498,
  -6.2603,
  now()
);

insert into public.action_evidence (
  action_id,
  phase,
  storage_path,
  mime_type,
  file_size,
  captured_at
)
values
(
  '10000000-0000-4000-8000-000000000001',
  'before',
  'test-rls/before.jpg',
  'image/jpeg',
  100,
  now()
),
(
  '10000000-0000-4000-8000-000000000001',
  'after',
  'test-rls/after.jpg',
  'image/jpeg',
  100,
  now()
);

insert into public.action_events (
  action_id,
  actor_id,
  event_type
)
values (
  '10000000-0000-4000-8000-000000000001',
  'aa116607-be9b-4297-81e9-c63d8425b121',
  'test_created'
);

-- Caso 1: el propietario activo ve los registros.
set local role authenticated;

set local "request.jwt.claim.sub" =
  'aa116607-be9b-4297-81e9-c63d8425b121';

do $$
begin
  if (
    select count(*) from public.public_order_actions
    where id = '10000000-0000-4000-8000-000000000001'
  ) <> 1 or (
    select count(*) from public.action_evidence
    where action_id = '10000000-0000-4000-8000-000000000001'
  ) <> 2 or (
    select count(*) from public.action_events
    where action_id = '10000000-0000-4000-8000-000000000001'
  ) <> 1 then
    raise exception 'FALLO: lectura del propietario activo';
  end if;
end;
$$;

-- Caso 2: el mismo propietario, inactivo, no ve ninguno.
reset role;

update public.profiles
set is_active = false
where id = 'aa116607-be9b-4297-81e9-c63d8425b121';

set local role authenticated;

do $$
begin
  if exists (
    select 1 from public.public_order_actions
    where id = '10000000-0000-4000-8000-000000000001'
  ) or exists (
    select 1 from public.action_evidence
    where action_id = '10000000-0000-4000-8000-000000000001'
  ) or exists (
    select 1 from public.action_events
    where action_id = '10000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'FALLO: acceso de propietario inactivo';
  end if;
end;
$$;

-- Caso 3: otra identidad no ve los registros del propietario.
reset role;

update public.profiles
set is_active = true
where id = 'aa116607-be9b-4297-81e9-c63d8425b121';

set local role authenticated;

set local "request.jwt.claim.sub" =
  '00000000-0000-4000-8000-000000000002';

do $$
begin
  if exists (
    select 1 from public.public_order_actions
    where id = '10000000-0000-4000-8000-000000000001'
  ) or exists (
    select 1 from public.action_evidence
    where action_id = '10000000-0000-4000-8000-000000000001'
  ) or exists (
    select 1 from public.action_events
    where action_id = '10000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'FALLO: acceso de otra identidad';
  end if;
end;
$$;

reset role;

select 'OK: los tres escenarios de lectura han pasado' as resultado;

rollback;