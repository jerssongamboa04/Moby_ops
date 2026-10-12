begin;

-- Run as administrator in SQL Editor. All fixtures and profile changes roll back.
-- No photo objects or existing actions are edited.
do $$
declare employee uuid;
begin
  select id into employee from public.profiles order by id limit 1;
  if employee is null then raise exception 'Se necesita un perfil de prueba existente'; end if;
  if exists (select 1 from public.public_order_actions where employee_id = employee
    and created_at >= '1900-01-01'::timestamptz and created_at < '1900-04-01'::timestamptz)
  then raise exception 'El periodo reservado de prueba 1900 ya contiene datos'; end if;
  perform set_config('request.jwt.claim.sub', employee::text, true);
  update public.profiles set is_active = true where id = employee;
  insert into public.public_order_actions
    (employee_id, bike_external_id, kickstand_positioned, latitude, longitude, performed_at, created_at)
  values
    (employee,'IE12H02911',true,53,-6,now(),'1900-01-01 12:00 Europe/Dublin'),
    (employee,'IE12H02911',true,53,-6,now(),'1900-01-01 13:00 Europe/Dublin'),
    (employee,'IE12H02911',true,53,-6,now(),'1900-01-02 00:01 Europe/Dublin');
  if has_function_privilege('anon', 'public.read_own_tasks(text,date,integer)', 'EXECUTE') then
    raise exception 'FALLO: acceso anónimo';
  end if;
end;
$$;

set local role authenticated;
do $$
declare result jsonb;
begin
  result := public.read_own_tasks('month', '1900-01-01', 0);
  if (result->>'total')::int <> 3 or (result->>'counted')::int <> 2 or
    (result->>'repeated')::int <> 1 or jsonb_array_length(result->'days') <> 2
  then raise exception 'FALLO: recuento diario/mensual o fecha controlada por el teléfono'; end if;
  result := public.read_own_tasks('month', '1900-02-01', 0);
  if (result->>'total')::int <> 0 then raise exception 'FALLO: periodo vacío'; end if;
  begin
    perform public.read_own_tasks('other');
    raise exception 'FALLO: periodo inválido permitido';
  exception when invalid_parameter_value then null;
  end;
end;
$$;

reset role;
update public.profiles set is_active = false where id = auth.uid();
set local role authenticated;
do $$
begin
  begin
    perform public.read_own_tasks();
    raise exception 'FALLO: perfil inactivo autorizado';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
select 'OK: recuentos, fecha del servidor, periodo vacío, parámetros y permisos' as resultado;
rollback;
