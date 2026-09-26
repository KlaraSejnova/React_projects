-- Spusť v Supabase SQL editoru pro povolení fotek u výletů.
alter table public.trips
add column if not exists photo_url text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'trip-photos',
  'trip-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Signed-in users can upload trip photos" on storage.objects;
create policy "Signed-in users can upload trip photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'trip-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);