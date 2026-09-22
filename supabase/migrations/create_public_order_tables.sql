begin;

-- Una fila representa una actuación enviada.
create table public.public_order_actions (
  id uuid primary key default gen_random_uuid(),

  employee_id uuid not null
    references public.profiles (id) on delete restrict,

  bike_external_id text not null
    constraint public_order_bike_id_not_blank
    check (length(btrim(bike_external_id)) > 0),

  kickstand_positioned boolean not null default false,
  bike_locked boolean not null default false,
  bike_repositioned boolean not null default false,

  notes text,

  latitude double precision not null
    constraint public_order_latitude_valid
    check (latitude between -90 and 90),

  longitude double precision not null
    constraint public_order_longitude_valid
    check (longitude between -180 and 180),

  performed_at timestamptz not null,
  created_at timestamptz not null default now(),

  constraint public_order_at_least_one_action
    check (
      kickstand_positioned
      or bike_locked
      or bike_repositioned
    )
);

-- Una fila por fotografía.
create table public.action_evidence (
  id uuid primary key default gen_random_uuid(),

  action_id uuid not null
    references public.public_order_actions (id)
    on delete restrict,

  phase text not null
    constraint action_evidence_phase_valid
    check (phase in ('before', 'after')),

  storage_path text not null unique
    constraint action_evidence_path_not_blank
    check (length(btrim(storage_path)) > 0),

  mime_type text not null
    constraint action_evidence_mime_not_blank
    check (length(btrim(mime_type)) > 0),

  file_size bigint not null
    constraint action_evidence_size_positive
    check (file_size > 0),

  captured_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Historial de eventos vinculados a la actuación.
create table public.action_events (
  id uuid primary key default gen_random_uuid(),

  action_id uuid not null
    references public.public_order_actions (id)
    on delete restrict,

  actor_id uuid not null
    references public.profiles (id) on delete restrict,

  event_type text not null
    constraint action_events_type_not_blank
    check (length(btrim(event_type)) > 0),

  metadata jsonb not null default '{}'::jsonb
    constraint action_events_metadata_object
    check (jsonb_typeof(metadata) = 'object'),

  created_at timestamptz not null default now()
);

-- Índices para historial y relaciones.
create index public_order_employee_date_idx
  on public.public_order_actions (
    employee_id,
    performed_at desc
  );

create index public_order_bike_date_idx
  on public.public_order_actions (
    bike_external_id,
    performed_at desc
  );

create index action_evidence_action_idx
  on public.action_evidence (action_id);

create index action_events_action_date_idx
  on public.action_events (action_id, created_at);

create index action_events_actor_idx
  on public.action_events (actor_id);

-- Protección desde la creación.
alter table public.public_order_actions enable row level security;
alter table public.action_evidence enable row level security;
alter table public.action_events enable row level security;

revoke all privileges
  on table
    public.public_order_actions,
    public.action_evidence,
    public.action_events
  from public, anon, authenticated;

grant select
  on table
    public.public_order_actions,
    public.action_evidence,
    public.action_events
  to authenticated;

-- Lectura propia, únicamente con perfil activo.
create policy public_order_select_own_active
  on public.public_order_actions
  for select
  to authenticated
  using (
    employee_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.is_active = true
    )
  );

-- La actuación padre debe ser visible mediante su propia RLS.
create policy action_evidence_select_visible_action
  on public.action_evidence
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.public_order_actions as action
      where action.id = action_evidence.action_id
    )
  );

create policy action_events_select_visible_action
  on public.action_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.public_order_actions as action
      where action.id = action_events.action_id
    )
  );

commit;