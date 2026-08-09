-- Видеофрагменты в альбомах фоторепортажей
-- media_type: image | video; bucket public-media принимает MP4/WebM до 50 МБ

alter table public.photos
  add column if not exists media_type text not null default 'image';

alter table public.photos
  add column if not exists mime_type text;

do $$ begin
  alter table public.photos
    add constraint photos_media_type_check
    check (media_type in ('image', 'video'));
exception
  when duplicate_object then null;
end $$;

update public.photos
set media_type = 'image'
where media_type is null or media_type = '';

update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]::text[]
where id = 'public-media';
