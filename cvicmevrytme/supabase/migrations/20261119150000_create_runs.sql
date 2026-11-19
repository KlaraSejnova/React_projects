create table if not exists public.runs (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  run jsonb not null check (jsonb_typeof(run) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.runs enable row level security;

create policy "Users can read their own runs"
  on public.runs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own runs"
  on public.runs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own runs"
  on public.runs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own runs"
  on public.runs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_run_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_runs_updated_at
  before update on public.runs
  for each row
  execute function public.set_run_updated_at();
