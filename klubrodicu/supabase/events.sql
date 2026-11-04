create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  starts_at timestamptz not null,
  location text check (location is null or char_length(location) <= 200),
  description text check (description is null or char_length(description) <= 2000),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists events_published_starts_at_idx
  on public.events (starts_at)
  where is_published = true;

create table if not exists public.event_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.event_admins enable row level security;

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
  on public.events
  for select
  to anon, authenticated
  using (
    is_published
    or exists (
      select 1
      from public.event_admins
      where event_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Event admins can insert events" on public.events;
create policy "Event admins can insert events"
  on public.events
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.event_admins
      where event_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Event admins can update events" on public.events;
create policy "Event admins can update events"
  on public.events
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.event_admins
      where event_admins.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.event_admins
      where event_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Event admins can delete events" on public.events;
create policy "Event admins can delete events"
  on public.events
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.event_admins
      where event_admins.user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can read their own access" on public.event_admins;
create policy "Admins can read their own access"
  on public.event_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant select on public.event_admins to authenticated;
