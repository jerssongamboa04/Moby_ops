begin;

do $$ begin
  if to_regprocedure('moby_ops_private.team_activity(text,date,uuid,text,text,integer,timestamptz)') is null then
    raise exception 'Apply the validated activity list migration first';
  end if;
  if not exists (select 1 from storage.buckets where id = 'public-order-evidence'
    and not public and file_size_limit = 5242880 and allowed_mime_types = array['image/webp']::text[]) then
    raise exception 'Expected private WebP evidence bucket configuration';
  end if;
end; $$;

-- Used by Storage RLS. Never accepts a caller identity or role from the client.
-- Does not query storage.objects, avoiding recursive evaluation of its policy.
create function moby_ops_private.supervisor_can_read_evidence(p_path text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles caller
    where caller.id = (select auth.uid()) and caller.is_active and caller.role = 'supervisor'
  ) and exists (
    select 1 from public.action_evidence evidence
    join public.public_order_actions action on action.id = evidence.action_id
    where evidence.storage_path = p_path
      and evidence.mime_type = 'image/webp' and evidence.file_size between 1 and 5242880
      and evidence.phase in ('before','after')
      and split_part(p_path,'/',1) = action.employee_id::text
      and split_part(p_path,'/',2) = action.id::text
      and split_part(p_path,'/',3) = evidence.phase
      and p_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/(before|after)/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]webp$'
  );
$$;
revoke all on function moby_ops_private.supervisor_can_read_evidence(text) from public,anon,authenticated;
grant execute on function moby_ops_private.supervisor_can_read_evidence(text) to authenticated;

create policy evidence_read_registered_supervisor
on storage.objects for select to authenticated
using (bucket_id = 'public-order-evidence'
  and moby_ops_private.supervisor_can_read_evidence(name));

create function moby_ops_private.team_activity_detail(p_action_id uuid, p_as_of timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  cutoff timestamptz := coalesce(p_as_of,statement_timestamp());
  selected public.public_order_actions%rowtype;
  first_id uuid;
  result jsonb;
begin
  if caller is null or not exists (select 1 from public.profiles
    where id = caller and is_active and role = 'supervisor') then
    raise exception 'Supervisor access required' using errcode = '42501';
  end if;
  if p_action_id is null or not isfinite(cutoff) or cutoff < timestamptz '1900-01-01 00:00+00'
    or cutoff > statement_timestamp() then
    raise exception 'Invalid activity detail parameters' using errcode = '22023';
  end if;
  select * into selected from public.public_order_actions where id = p_action_id and created_at <= cutoff;
  if not found then return null; end if;

  select action.id into first_id from public.public_order_actions action
  where action.employee_id = selected.employee_id and action.bike_external_id = selected.bike_external_id
    and action.created_at <= cutoff
    and action.created_at >= (((selected.created_at at time zone 'Europe/Dublin')::date)::timestamp at time zone 'Europe/Dublin')
    and action.created_at < ((((selected.created_at at time zone 'Europe/Dublin')::date + 1)::timestamp) at time zone 'Europe/Dublin')
  order by action.created_at,action.id limit 1;

  select jsonb_build_object(
    'id',selected.id, 'employee_id',selected.employee_id, 'full_name',btrim(profile.full_name),
    'bike_external_id',selected.bike_external_id, 'created_at',selected.created_at,
    'bike_locked',selected.bike_locked, 'kickstand_positioned',selected.kickstand_positioned,
    'bike_repositioned',selected.bike_repositioned, 'counted',selected.id = first_id,
    'duplicate_of',case when selected.id = first_id then null else first_id end,
    'notes',selected.notes, 'latitude',selected.latitude, 'longitude',selected.longitude,
    'as_of',cutoff,
    'evidence',coalesce((select jsonb_agg(jsonb_build_object(
      'id',evidence.id, 'phase',evidence.phase, 'storage_path',evidence.storage_path,
      'captured_at',evidence.captured_at) order by evidence.phase desc,evidence.created_at,evidence.id)
      from public.action_evidence evidence where evidence.action_id = selected.id
        and moby_ops_private.supervisor_can_read_evidence(evidence.storage_path)),'[]'::jsonb)
  ) into result from public.profiles profile where profile.id = selected.employee_id;
  return result;
end; $$;
revoke all on function moby_ops_private.team_activity_detail(uuid,timestamptz) from public,anon,authenticated;
grant execute on function moby_ops_private.team_activity_detail(uuid,timestamptz) to authenticated;

create function public.read_team_activity_detail(p_action_id uuid,p_as_of timestamptz default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select moby_ops_private.team_activity_detail(p_action_id,p_as_of);
$$;
revoke all on function public.read_team_activity_detail(uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.read_team_activity_detail(uuid,timestamptz) to authenticated;
notify pgrst,'reload schema';
commit;
