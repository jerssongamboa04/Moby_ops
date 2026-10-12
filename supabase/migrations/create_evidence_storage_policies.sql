begin;

create policy evidence_upload_own_active
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'public-order-evidence'

    and owner_id = (select auth.uid()::text)

    and (storage.foldername(name))[1] =
      (select auth.uid()::text)

    -- Ruta: usuario/actuacion/before|after/foto.webp
    and name ~ (
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-'
      '[0-9a-f]{4}-[0-9a-f]{12}/'
      '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-'
      '[0-9a-f]{4}-[0-9a-f]{12}/'
      '(before|after)/'
      '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-'
      '[0-9a-f]{4}-[0-9a-f]{12}[.]webp$'
    )

    and exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.is_active = true
    )
  );

create policy evidence_read_own_active
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'public-order-evidence'

    and owner_id = (select auth.uid()::text)

    and (storage.foldername(name))[1] =
      (select auth.uid()::text)

    and exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.is_active = true
    )
  );

commit;