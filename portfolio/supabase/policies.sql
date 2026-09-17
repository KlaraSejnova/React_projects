alter table public.trips enable row level security;

create policy "Anyone can read trips"
on public.trips
for select
using (true);

create policy "Signed-in users can add trips"
on public.trips
for insert
to authenticated
with check (true);

create policy "Signed-in users can edit trips"
on public.trips
for update
to authenticated
using (true)
with check (true);

create policy "Signed-in users can delete trips"
on public.trips
for delete
to authenticated
using (true);