begin;

-- No direct INSERT permission is granted on operational tables.
create function public.prepare_public_order()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  employee uuid := auth.uid();
  action_id uuid := gen_random_uuid();
begin
  if employee is null or not exists (
    select 1 from public.profiles where id = employee and is_active
  ) then raise exception 'Operational access required' using errcode = '42501'; end if;
  return jsonb_build_object(
    'action_id', action_id,
    'before_path', employee::text || '/' || action_id::text || '/before/' || gen_random_uuid()::text || '.webp',
    'after_path', employee::text || '/' || action_id::text || '/after/' || gen_random_uuid()::text || '.webp'
  );
end;
$$;

create function public.public_order_receipt(p_action_id uuid)
returns uuid language sql stable security invoker set search_path = '' as $$
  select id from public.public_order_actions where id = p_action_id;
$$;

create function public.submit_public_order(
  p_action_id uuid, p_bike_id text, p_kickstand boolean, p_locked boolean,
  p_repositioned boolean, p_notes text, p_latitude double precision,
  p_longitude double precision, p_performed_at timestamptz,
  p_before_path text, p_after_path text, p_before_at timestamptz, p_after_at timestamptz
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  employee uuid := auth.uid();
  prior_employee uuid;
  before_size bigint;
  after_size bigint;
  prefix text;
  file_pattern text := '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]webp$';
begin
  -- Lock the profile so activation cannot change mid-transaction.
  perform 1 from public.profiles where id = employee and is_active for share;
  if not found then raise exception 'Operational access required' using errcode = '42501'; end if;
  if p_action_id is null then raise exception 'Invalid action' using errcode = '22023'; end if;

  -- Serialises retries of the same action, including concurrent requests.
  perform pg_advisory_xact_lock(hashtextextended(p_action_id::text, 0));
  select employee_id into prior_employee from public.public_order_actions where id = p_action_id;
  if found then
    if prior_employee <> employee then raise exception 'Action unavailable' using errcode = '42501'; end if;
    return p_action_id;
  end if;

  if p_bike_id is null or length(p_bike_id) <> 10 or
    p_bike_id !~ '^(IE12H[0-9]{5}|(34|39)E[0-9]{7})$' or
    p_kickstand is null or p_locked is null or p_repositioned is null or
    not (p_kickstand or p_locked or p_repositioned) or
    p_latitude is null or not (p_latitude between -90 and 90) or
    p_longitude is null or not (p_longitude between -180 and 180) or
    p_performed_at is null or not isfinite(p_performed_at) or
    p_before_at is null or not isfinite(p_before_at) or
    p_after_at is null or not isfinite(p_after_at) or
    p_before_at > p_after_at or p_after_at > p_performed_at or
    p_performed_at > now() + interval '5 minutes'
  then raise exception 'Invalid action data' using errcode = '22023'; end if;

  prefix := '^' || employee::text || '/' || p_action_id::text;
  if p_before_path is null or p_after_path is null or
    p_before_path !~ (prefix || '/before/' || file_pattern) or
    p_after_path !~ (prefix || '/after/' || file_pattern)
  then raise exception 'Invalid evidence paths' using errcode = '22023'; end if;

  -- Metadata is written by Storage; do not trust client-reported MIME or size.
  select (metadata->>'size')::bigint into before_size from storage.objects
    where bucket_id = 'public-order-evidence' and name = p_before_path
      and owner_id = employee::text and metadata->>'mimetype' = 'image/webp' for share;
  select (metadata->>'size')::bigint into after_size from storage.objects
    where bucket_id = 'public-order-evidence' and name = p_after_path
      and owner_id = employee::text and metadata->>'mimetype' = 'image/webp' for share;
  if before_size is null or before_size not between 1 and 5242880 or
    after_size is null or after_size not between 1 and 5242880
  then raise exception 'Two valid evidence files are required' using errcode = '22023'; end if;

  insert into public.public_order_actions
    (id, employee_id, bike_external_id, kickstand_positioned, bike_locked,
     bike_repositioned, notes, latitude, longitude, performed_at)
    values (p_action_id, employee, p_bike_id, p_kickstand, p_locked,
      p_repositioned, nullif(btrim(p_notes), ''), p_latitude, p_longitude, p_performed_at);
  insert into public.action_evidence (action_id, phase, storage_path, mime_type, file_size, captured_at)
    values (p_action_id, 'before', p_before_path, 'image/webp', before_size, p_before_at),
           (p_action_id, 'after', p_after_path, 'image/webp', after_size, p_after_at);
  insert into public.action_events (action_id, actor_id, event_type)
    values (p_action_id, employee, 'created');
  return p_action_id;
end;
$$;

revoke all on function public.prepare_public_order() from public, anon, authenticated;
revoke all on function public.public_order_receipt(uuid) from public, anon, authenticated;
revoke all on function public.submit_public_order(uuid,text,boolean,boolean,boolean,text,double precision,double precision,timestamptz,text,text,timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.prepare_public_order() to authenticated;
grant execute on function public.public_order_receipt(uuid) to authenticated;
grant execute on function public.submit_public_order(uuid,text,boolean,boolean,boolean,text,double precision,double precision,timestamptz,text,text,timestamptz,timestamptz) to authenticated;

commit;
