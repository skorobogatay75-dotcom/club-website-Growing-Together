-- Этап 2: Storage buckets и политики
-- public-media — изображения (JPEG/PNG/WebP)
-- public-documents — PDF/DOCX
-- Публичное чтение объектов; запись/обновление/удаление — только staff.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-media',
  'public-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-documents',
  'public-documents',
  true,
  20971520,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- public-media
drop policy if exists public_media_read on storage.objects;
create policy public_media_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'public-media');

drop policy if exists public_media_staff_insert on storage.objects;
create policy public_media_staff_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'public-media' and public.is_staff());

drop policy if exists public_media_staff_update on storage.objects;
create policy public_media_staff_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'public-media' and public.is_staff())
  with check (bucket_id = 'public-media' and public.is_staff());

drop policy if exists public_media_staff_delete on storage.objects;
create policy public_media_staff_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'public-media' and public.is_staff());

-- public-documents
drop policy if exists public_documents_read on storage.objects;
create policy public_documents_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'public-documents');

drop policy if exists public_documents_staff_insert on storage.objects;
create policy public_documents_staff_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'public-documents' and public.is_staff());

drop policy if exists public_documents_staff_update on storage.objects;
create policy public_documents_staff_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'public-documents' and public.is_staff())
  with check (bucket_id = 'public-documents' and public.is_staff());

drop policy if exists public_documents_staff_delete on storage.objects;
create policy public_documents_staff_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'public-documents' and public.is_staff());
