-- Dashboard tables for the existing portfolio Supabase project.

create table if not exists public.dashboard_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  vocative text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.dashboard_routines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  detail text,
  color text not null default '#3aa0d1',
  weekend_only boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.dashboard_weeks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  unique (owner_id, week_start)
);

create table if not exists public.dashboard_completions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_id uuid not null references public.dashboard_weeks(id) on delete cascade,
  profile_id uuid not null references public.dashboard_profiles(id) on delete cascade,
  routine_id uuid not null references public.dashboard_routines(id) on delete cascade,
  day date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (profile_id, week_id, routine_id, day)
);

create table if not exists public.dashboard_progress (
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  completion_key text not null,
  completed boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (owner_id, week_start, completion_key)
);

alter table public.dashboard_profiles enable row level security;
alter table public.dashboard_routines enable row level security;
alter table public.dashboard_weeks enable row level security;
alter table public.dashboard_completions enable row level security;
alter table public.dashboard_progress enable row level security;

drop policy if exists "Owners manage dashboard profiles" on public.dashboard_profiles;
drop policy if exists "Owners manage dashboard routines" on public.dashboard_routines;
drop policy if exists "Owners manage dashboard weeks" on public.dashboard_weeks;
drop policy if exists "Owners manage dashboard completions" on public.dashboard_completions;
drop policy if exists "Owners manage dashboard progress" on public.dashboard_progress;

create policy "Owners manage dashboard profiles"
on public.dashboard_profiles for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners manage dashboard routines"
on public.dashboard_routines for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners manage dashboard weeks"
on public.dashboard_weeks for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners manage dashboard completions"
on public.dashboard_completions for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners manage dashboard progress"
on public.dashboard_progress for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || '{"profile": "terka"}'::jsonb
where email = 'teri.synkova@gmail.com';

update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || '{"profile": "barca"}'::jsonb
where email = 'barus.synkova@gmail.com';
