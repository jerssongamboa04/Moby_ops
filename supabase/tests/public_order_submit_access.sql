begin;

-- Uses one existing test profile, restoring it at the end with ROLLBACK.
do $$
declare employee uuid;
begin
  select id into employee from public.profiles limit 1;
  if employee is null then raise exception 'Se necesita un perfil de prueba'; end if;
  perform set_config('request.jwt.claim.sub', employee::text, true);
  update public.profiles set is_active = true where id = employee;
  if has_function_privilege('anon', 'public.prepare_public_order()', 'EXECUTE') then
    raise exception 'FALLO: anon puede preparar actuaciones';
  end if;
end;
$$;

set local role authenticated;
do $$
declare ticket jsonb;
begin
  ticket := public.prepare_public_order();
  begin
    perform public.submit_public_order(
      (ticket->>'action_id')::uuid, 'IE12H02911', true, false, false, '',
      53.3498, -6.2603, now(), ticket->>'before_path', ticket->>'after_path', now(), now()
    );
    raise exception 'FALLO: aceptó una actuación sin fotos';
  exception when sqlstate '22023' then
    if sqlerrm <> 'Two valid evidence files are required' then raise; end if;
  end;
  if public.public_order_receipt((ticket->>'action_id')::uuid) is not null then
    raise exception 'FALLO: dejó una actuación parcial';
  end if;
end;
$$;
reset role;
update public.profiles set is_active = false where id = auth.uid();
set local role authenticated;
do $$
begin
  begin
    perform public.prepare_public_order();
    raise exception 'FALLO: perfil inactivo autorizado';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
select 'OK: sin fotos no se guarda, no hay registro parcial y se rechaza el perfil inactivo' as resultado;
rollback;
