-- Destructive: run manually ONLY when you decide to remove this exact demo batch.
-- Leaves original rows/photos, Auth accounts, profiles and Jersson's corrected name.
begin;
set local lock_timeout = '5s';
create temporary table demo_remove_ids on commit drop as
select md5('moby-dashboard-demo-20261012-v1:action:' || i)::uuid as id from generate_series(1,600) i;

do $$ begin
  if exists (select 1 from public.public_order_actions a join demo_remove_ids d using(id)
      where a.notes is distinct from '[DEMO:dashboard-20261012-v1] Simulación sin fotografía.'
        or a.bike_external_id not between '39E9900001' and '39E9900600') then
    raise exception 'Reserved action changed; stop without deleting anything';
  end if;
  if exists (select 1 from public.action_evidence e join demo_remove_ids d on d.id=e.action_id)
    or exists (select 1 from public.action_events e join demo_remove_ids d on d.id=e.action_id) then
    raise exception 'Demo actions now have evidence/events; stop for review';
  end if;
end; $$;
with removed as (
  delete from public.public_order_actions a using demo_remove_ids d
  where a.id=d.id and a.notes='[DEMO:dashboard-20261012-v1] Simulación sin fotografía.' returning a.id
) select count(*) as actuaciones_demo_eliminadas from removed;
commit;
