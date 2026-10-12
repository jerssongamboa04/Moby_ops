begin;

-- Run as administrator in SQL Editor after the migration. All rows roll back.
do $$
declare
  test_employee uuid;
  bike_id text;
  failed_constraint text;
begin
  select id into test_employee from public.profiles limit 1;
  if test_employee is null then
    raise exception 'La prueba necesita un perfil existente';
  end if;

  foreach bike_id in array array['IE12H02911', '39E1200806', '34E1200012'] loop
    insert into public.public_order_actions
      (employee_id, bike_external_id, bike_locked, latitude, longitude, performed_at)
    values (test_employee, bike_id, true, 53.3498, -6.2603, now());
  end loop;

  foreach bike_id in array array[
    '2024120074', '1234567890123', 'IE12H0291', 'IE12H029111',
    '35E1200806', 'IE12HO2911', 'ie12h02911', 'IE12H 2911',
    E'IE12H02911\n', ' IE12H02911',
    'https://mobymove.page.link/scan?bn=IE12H02911'
  ] loop
    begin
      insert into public.public_order_actions
        (employee_id, bike_external_id, bike_locked, latitude, longitude, performed_at)
      values (test_employee, bike_id, true, 53.3498, -6.2603, now());
      raise exception 'FALLO: se aceptó un ID inválido: %', bike_id;
    exception when check_violation then
      get stacked diagnostics failed_constraint = constraint_name;
      if failed_constraint <> 'public_order_bike_id_format' then
        raise exception 'FALLO: rechazo por otra restricción: %', failed_constraint;
      end if;
    end;
  end loop;
end;
$$;

select 'OK: formatos válidos aceptados e inválidos rechazados' as resultado;
rollback;
