begin;

create table public.profiles (
  id uuid primary key
    references auth.users (id) on delete restrict,

  full_name text not null
    constraint profiles_full_name_not_blank
    check (length(btrim(full_name)) > 0),

  role text not null default 'employee'
    constraint profiles_role_valid
    check (role in ('employee', 'supervisor')),

  preferred_locale text not null default 'en'
    constraint profiles_locale_valid
    check (preferred_locale in ('en', 'es')),

  is_active boolean not null default false,

  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all privileges
  on table public.profiles
  from public, anon, authenticated;

grant select
  on table public.profiles
  to authenticated;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

commit;