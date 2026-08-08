-- ===== supabase\migrations\20260808120001_extensions_and_enums.sql =====
-- Этап 2: расширения и доменные типы
-- Семейный клуб «Вместе растём»

create extension if not exists "pgcrypto";

-- Роли сотрудников
do $$ begin
  create type public.user_role as enum ('admin', 'editor');
exception when duplicate_object then null;
end $$;

-- Публикация контента
do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

-- Набор на программы
do $$ begin
  create type public.enrollment_status as enum ('open', 'closed', 'waitlist', 'full');
exception when duplicate_object then null;
end $$;

-- Регистрация на события (cancelled остаётся видимым при status=published)
do $$ begin
  create type public.registration_status as enum ('open', 'closed', 'waitlist', 'cancelled');
exception when duplicate_object then null;
end $$;

-- Аудитория
do $$ begin
  create type public.audience_type as enum ('children', 'parents', 'family', 'mixed');
exception when duplicate_object then null;
end $$;

-- Формат встречи
do $$ begin
  create type public.event_format as enum ('workshop', 'quiz', 'game', 'meeting', 'other');
exception when duplicate_object then null;
end $$;

-- Тип заявки
do $$ begin
  create type public.application_type as enum ('program', 'event', 'membership', 'general');
exception when duplicate_object then null;
end $$;

-- Статус заявки
do $$ begin
  create type public.application_status as enum (
    'new',
    'contacted',
    'confirmed',
    'waitlist',
    'completed',
    'cancelled',
    'spam'
  );
exception when duplicate_object then null;
end $$;

-- Предпочтительный способ связи
do $$ begin
  create type public.preferred_contact as enum ('phone', 'email', 'telegram', 'whatsapp', 'any');
exception when duplicate_object then null;
end $$;


-- ===== supabase\migrations\20260808120002_tables.sql =====
-- Этап 2: таблицы, ограничения, индексы

-- ---------------------------------------------------------------------------
-- profiles (1:1 с auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is 'Профили сотрудников; первый admin создаётся вручную.';

-- ---------------------------------------------------------------------------
-- age_categories
-- ---------------------------------------------------------------------------
create table if not exists public.age_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  age_from integer,
  age_to integer,
  description text,
  color_token text not null default 'turquoise',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint age_categories_slug_unique unique (slug),
  constraint age_categories_age_range_check check (
    age_from is null or age_to is null or age_from <= age_to
  ),
  constraint age_categories_age_nonnegative_check check (
    (age_from is null or age_from >= 0) and (age_to is null or age_to >= 0)
  )
);

create index if not exists age_categories_active_sort_idx
  on public.age_categories (is_active, sort_order);

-- ---------------------------------------------------------------------------
-- programs
-- ---------------------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  content_json jsonb not null default '[]'::jsonb,
  cover_path text,
  age_category_id uuid references public.age_categories (id) on delete set null,
  audience_type public.audience_type not null default 'family',
  format public.event_format not null default 'workshop',
  duration_text text,
  price_text text,
  enrollment_status public.enrollment_status not null default 'open',
  featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint programs_slug_unique unique (slug)
);

create index if not exists programs_status_sort_idx
  on public.programs (status, sort_order, featured);
create index if not exists programs_age_category_idx
  on public.programs (age_category_id);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs (id) on delete set null,
  title text not null,
  slug text not null,
  excerpt text,
  content_json jsonb not null default '[]'::jsonb,
  cover_path text,
  age_category_id uuid references public.age_categories (id) on delete set null,
  audience_type public.audience_type not null default 'family',
  format public.event_format not null default 'workshop',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Europe/Moscow',
  venue text,
  price_text text,
  capacity integer,
  registration_status public.registration_status not null default 'open',
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint events_slug_unique unique (slug),
  constraint events_time_range_check check (ends_at >= starts_at),
  constraint events_capacity_check check (capacity is null or capacity >= 0)
);

create index if not exists events_calendar_idx
  on public.events (starts_at, status, age_category_id);
create index if not exists events_status_starts_idx
  on public.events (status, starts_at);
create index if not exists events_program_idx
  on public.events (program_id);

-- ---------------------------------------------------------------------------
-- news_posts
-- ---------------------------------------------------------------------------
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  content_json jsonb not null default '[]'::jsonb,
  cover_path text,
  is_pinned boolean not null default false,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint news_posts_slug_unique unique (slug)
);

create index if not exists news_posts_feed_idx
  on public.news_posts (published_at desc, status, is_pinned desc);

-- ---------------------------------------------------------------------------
-- albums + photos (cover FK добавляется после photos)
-- ---------------------------------------------------------------------------
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  description text,
  cover_photo_id uuid,
  event_id uuid references public.events (id) on delete set null,
  event_date date,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint albums_slug_unique unique (slug)
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  storage_path text not null,
  width integer,
  height integer,
  alt text not null default '',
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint photos_dimensions_check check (
    (width is null or width > 0) and (height is null or height > 0)
  )
);

create index if not exists photos_album_sort_idx
  on public.photos (album_id, sort_order);

do $$ begin
  alter table public.albums
    add constraint albums_cover_photo_fk
    foreign key (cover_photo_id) references public.photos (id) on delete set null;
exception when duplicate_object then null;
end $$;

create index if not exists albums_status_published_idx
  on public.albums (status, published_at desc);

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create table if not exists public.document_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint document_categories_slug_unique unique (slug)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.document_categories (id) on delete set null,
  title text not null,
  storage_path text not null,
  public_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  document_date date,
  version text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint documents_size_check check (size_bytes > 0 and size_bytes <= 20971520),
  constraint documents_mime_check check (
    mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  )
);

create index if not exists documents_category_status_idx
  on public.documents (category_id, status, sort_order);

-- ---------------------------------------------------------------------------
-- membership_plans
-- ---------------------------------------------------------------------------
create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  benefits_json jsonb not null default '[]'::jsonb,
  price_text text,
  period_text text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint membership_plans_slug_unique unique (slug)
);

-- ---------------------------------------------------------------------------
-- applications (PII: нет публичного SELECT)
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  type public.application_type not null default 'general',
  program_id uuid references public.programs (id) on delete set null,
  event_id uuid references public.events (id) on delete set null,
  membership_plan_id uuid references public.membership_plans (id) on delete set null,
  parent_name text not null,
  phone text not null,
  email text,
  child_age_text text,
  age_category_id uuid references public.age_categories (id) on delete set null,
  preferred_contact public.preferred_contact not null default 'any',
  comment text,
  consent_personal_data boolean not null,
  consent_marketing boolean not null default false,
  status public.application_status not null default 'new',
  manager_note text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint applications_consent_required_check check (consent_personal_data = true),
  constraint applications_parent_name_check check (char_length(trim(parent_name)) >= 2),
  constraint applications_phone_check check (char_length(trim(phone)) >= 5)
);

create index if not exists applications_inbox_idx
  on public.applications (created_at desc, status, type);

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text,
  bio text,
  photo_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists team_members_public_idx
  on public.team_members (status, is_active, sort_order);

-- ---------------------------------------------------------------------------
-- site_settings (секреты не хранить)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value_json jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint site_settings_key_check check (char_length(key) >= 2)
);

comment on table public.site_settings is 'Публичные и служебные настройки сайта. API-ключи и пароли сюда не класть.';


-- ===== supabase\migrations\20260808120003_functions_and_triggers.sql =====
-- Этап 2: вспомогательные функции и триггеры

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Активный сотрудник (admin | editor)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('admin'::public.user_role, 'editor'::public.user_role)
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated, anon;

-- Только admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role = 'admin'::public.user_role
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

create or replace function public.is_published(status public.content_status)
returns boolean
language sql
immutable
as $$
  select status = 'published'::public.content_status;
$$;

-- Триггеры updated_at
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'age_categories',
    'programs',
    'events',
    'news_posts',
    'albums',
    'photos',
    'document_categories',
    'documents',
    'membership_plans',
    'applications',
    'team_members',
    'site_settings'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;

-- Синхронизация published_at при первой публикации (только таблицы с колонкой published_at)
create or replace function public.sync_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published'::public.content_status then
    if new.published_at is null then
      new.published_at = timezone('utc', now());
    end if;
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'programs',
    'events',
    'news_posts',
    'albums'
  ]
  loop
    execute format('drop trigger if exists sync_published_at on public.%I', t);
    execute format(
      'create trigger sync_published_at before insert or update of status, published_at on public.%I for each row execute function public.sync_published_at()',
      t
    );
  end loop;
end $$;


-- ===== supabase\migrations\20260808120004_rls.sql =====
-- Этап 2: Row Level Security
-- Аноним читает только published; applications — никогда публично.
-- Заявки создаёт серверный обработчик (service role) после валидации.
-- Editor: CRUD контента; admin: ещё profiles и site_settings.

alter table public.profiles enable row level security;
alter table public.age_categories enable row level security;
alter table public.programs enable row level security;
alter table public.events enable row level security;
alter table public.news_posts enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.document_categories enable row level security;
alter table public.documents enable row level security;
alter table public.membership_plans enable row level security;
alter table public.applications enable row level security;
alter table public.team_members enable row level security;
alter table public.site_settings enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists profiles_insert_admin on public.profiles;
create policy profiles_insert_admin
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- age_categories: публично активные; staff — полный доступ
-- ---------------------------------------------------------------------------
drop policy if exists age_categories_public_read on public.age_categories;
create policy age_categories_public_read
  on public.age_categories
  for select
  to anon, authenticated
  using (is_active = true or public.is_staff());

drop policy if exists age_categories_staff_write on public.age_categories;
create policy age_categories_staff_write
  on public.age_categories
  for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- programs
-- ---------------------------------------------------------------------------
drop policy if exists programs_public_read on public.programs;
create policy programs_public_read
  on public.programs
  for select
  to anon, authenticated
  using (public.is_published(status) or public.is_staff());

drop policy if exists programs_staff_insert on public.programs;
create policy programs_staff_insert
  on public.programs
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists programs_staff_update on public.programs;
create policy programs_staff_update
  on public.programs
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists programs_staff_delete on public.programs;
create policy programs_staff_delete
  on public.programs
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- events (published видны, в т.ч. с registration_status=cancelled)
-- ---------------------------------------------------------------------------
drop policy if exists events_public_read on public.events;
create policy events_public_read
  on public.events
  for select
  to anon, authenticated
  using (public.is_published(status) or public.is_staff());

drop policy if exists events_staff_insert on public.events;
create policy events_staff_insert
  on public.events
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists events_staff_update on public.events;
create policy events_staff_update
  on public.events
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists events_staff_delete on public.events;
create policy events_staff_delete
  on public.events
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- news_posts
-- ---------------------------------------------------------------------------
drop policy if exists news_public_read on public.news_posts;
create policy news_public_read
  on public.news_posts
  for select
  to anon, authenticated
  using (public.is_published(status) or public.is_staff());

drop policy if exists news_staff_insert on public.news_posts;
create policy news_staff_insert
  on public.news_posts
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists news_staff_update on public.news_posts;
create policy news_staff_update
  on public.news_posts
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists news_staff_delete on public.news_posts;
create policy news_staff_delete
  on public.news_posts
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- albums
-- ---------------------------------------------------------------------------
drop policy if exists albums_public_read on public.albums;
create policy albums_public_read
  on public.albums
  for select
  to anon, authenticated
  using (public.is_published(status) or public.is_staff());

drop policy if exists albums_staff_insert on public.albums;
create policy albums_staff_insert
  on public.albums
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists albums_staff_update on public.albums;
create policy albums_staff_update
  on public.albums
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists albums_staff_delete on public.albums;
create policy albums_staff_delete
  on public.albums
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- photos: публично только из опубликованных альбомов
-- ---------------------------------------------------------------------------
drop policy if exists photos_public_read on public.photos;
create policy photos_public_read
  on public.photos
  for select
  to anon, authenticated
  using (
    public.is_staff()
    or exists (
      select 1
      from public.albums a
      where a.id = photos.album_id
        and public.is_published(a.status)
    )
  );

drop policy if exists photos_staff_insert on public.photos;
create policy photos_staff_insert
  on public.photos
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists photos_staff_update on public.photos;
create policy photos_staff_update
  on public.photos
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists photos_staff_delete on public.photos;
create policy photos_staff_delete
  on public.photos
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- document_categories
-- ---------------------------------------------------------------------------
drop policy if exists document_categories_public_read on public.document_categories;
create policy document_categories_public_read
  on public.document_categories
  for select
  to anon, authenticated
  using (is_active = true or public.is_staff());

drop policy if exists document_categories_staff_write on public.document_categories;
create policy document_categories_staff_write
  on public.document_categories
  for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
drop policy if exists documents_public_read on public.documents;
create policy documents_public_read
  on public.documents
  for select
  to anon, authenticated
  using (public.is_published(status) or public.is_staff());

drop policy if exists documents_staff_insert on public.documents;
create policy documents_staff_insert
  on public.documents
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists documents_staff_update on public.documents;
create policy documents_staff_update
  on public.documents
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists documents_staff_delete on public.documents;
create policy documents_staff_delete
  on public.documents
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- membership_plans
-- ---------------------------------------------------------------------------
drop policy if exists membership_plans_public_read on public.membership_plans;
create policy membership_plans_public_read
  on public.membership_plans
  for select
  to anon, authenticated
  using (public.is_published(status) or public.is_staff());

drop policy if exists membership_plans_staff_insert on public.membership_plans;
create policy membership_plans_staff_insert
  on public.membership_plans
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists membership_plans_staff_update on public.membership_plans;
create policy membership_plans_staff_update
  on public.membership_plans
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists membership_plans_staff_delete on public.membership_plans;
create policy membership_plans_staff_delete
  on public.membership_plans
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- applications: нет anon SELECT/INSERT; staff SELECT/UPDATE; admin DELETE
-- INSERT только через service role (серверный API)
-- ---------------------------------------------------------------------------
drop policy if exists applications_staff_select on public.applications;
create policy applications_staff_select
  on public.applications
  for select
  to authenticated
  using (public.is_staff());

-- Публичный INSERT запрещён: форма пишет через service role после валидации.
-- Сотрудники могут создать заявку вручную в админке.
drop policy if exists applications_staff_insert on public.applications;
create policy applications_staff_insert
  on public.applications
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists applications_staff_update on public.applications;
create policy applications_staff_update
  on public.applications
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists applications_admin_delete on public.applications;
create policy applications_admin_delete
  on public.applications
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------
drop policy if exists team_members_public_read on public.team_members;
create policy team_members_public_read
  on public.team_members
  for select
  to anon, authenticated
  using (
    (public.is_published(status) and is_active = true)
    or public.is_staff()
  );

drop policy if exists team_members_staff_insert on public.team_members;
create policy team_members_staff_insert
  on public.team_members
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists team_members_staff_update on public.team_members;
create policy team_members_staff_update
  on public.team_members
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists team_members_staff_delete on public.team_members;
create policy team_members_staff_delete
  on public.team_members
  for delete
  to authenticated
  using (public.is_staff());

-- ---------------------------------------------------------------------------
-- site_settings: публичное чтение безопасных ключей; писать только admin
-- ---------------------------------------------------------------------------
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
  on public.site_settings
  for select
  to anon, authenticated
  using (
    key not like 'private.%'
    or public.is_admin()
  );

drop policy if exists site_settings_admin_insert on public.site_settings;
create policy site_settings_admin_insert
  on public.site_settings
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update
  on public.site_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists site_settings_admin_delete on public.site_settings;
create policy site_settings_admin_delete
  on public.site_settings
  for delete
  to authenticated
  using (public.is_admin());


-- ===== supabase\migrations\20260808120005_storage.sql =====
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


-- ===== supabase\migrations\20260808130001_event_remaining_seats.sql =====
-- Остаток мест: capacity − число подтверждённых заявок (не ниже 0).
-- SECURITY DEFINER: публичной странице не нужен SELECT по applications.

create or replace function public.event_confirmed_applications_count(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.applications a
  where a.event_id = p_event_id
    and a.status = 'confirmed'::public.application_status;
$$;

revoke all on function public.event_confirmed_applications_count(uuid) from public;
grant execute on function public.event_confirmed_applications_count(uuid) to anon, authenticated;

create or replace function public.event_remaining_seats(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when e.capacity is null then null
    else greatest(e.capacity - public.event_confirmed_applications_count(e.id), 0)
  end
  from public.events e
  where e.id = p_event_id;
$$;

revoke all on function public.event_remaining_seats(uuid) from public;
grant execute on function public.event_remaining_seats(uuid) to anon, authenticated;


-- ===== supabase\seed.sql =====
-- Seed для локальной разработки и демо.
-- Не содержит реальных адресов, телефонов, цен, биографий и реквизитов.
-- Значения «НУЖНО ЗАПОЛНИТЬ» не предназначены для публичного UI —
-- публичные страницы должны скрывать пустые/служебные поля.

begin;

-- Стабильные UUID для идемпотентного повторного запуска
-- age categories
insert into public.age_categories (
  id, name, slug, age_from, age_to, description, color_token, sort_order, is_active
) values
  (
    'a1111111-1111-4111-8111-111111111101',
    'Младшие школьники',
    'mladshie-shkolniki',
    7,
    10,
    'Встречи с адаптированными заданиями для младшего школьного возраста.',
    'turquoise',
    10,
    true
  ),
  (
    'a1111111-1111-4111-8111-111111111102',
    'Подростки',
    'podrostki',
    11,
    15,
    'Форматы с большей самостоятельностью и командным взаимодействием.',
    'honey',
    20,
    true
  ),
  (
    'a1111111-1111-4111-8111-111111111103',
    'Семья вместе',
    'semya-vmeste',
    null,
    null,
    'Параллельные занятия для детей и родителей в двух аудиториях.',
    'terracotta',
    30,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  age_from = excluded.age_from,
  age_to = excluded.age_to,
  description = excluded.description,
  color_token = excluded.color_token,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- programs (published, без выдуманных цен)
insert into public.programs (
  id, title, slug, excerpt, content_json, age_category_id,
  audience_type, format, duration_text, price_text, enrollment_status,
  featured, sort_order, status, published_at
) values
  (
    'b2222222-2222-4222-8222-222222222201',
    'Игровые мастер-классы',
    'igrovye-master-klassy',
    'Практические встречи, где ребёнок и взрослый пробуют одну тему в разных форматах.',
    '[{"type":"paragraph","text":"На встрече семья работает с одной темой: дети — в игровом формате, родители — в адаптированном параллельном блоке."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111101',
    'family',
    'workshop',
    '1,5–2 часа',
    null,
    'open',
    true,
    10,
    'published',
    timezone('utc', now()) - interval '14 days'
  ),
  (
    'b2222222-2222-4222-8222-222222222202',
    'Семейные квизы',
    'semejnye-kvizy',
    'Командные квизы с вопросами разной сложности для детей и взрослых.',
    '[{"type":"paragraph","text":"Квиз помогает потренировать внимание, эрудицию и умение договариваться в команде."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111103',
    'family',
    'quiz',
    'около 2 часов',
    null,
    'open',
    true,
    20,
    'published',
    timezone('utc', now()) - interval '10 days'
  ),
  (
    'b2222222-2222-4222-8222-222222222203',
    'Развивающие игры для подростков',
    'razvivayushchie-igry-dlya-podrostkov',
    'Встречи с акцентом на коммуникацию, стратегию и совместный результат.',
    '[{"type":"paragraph","text":"Формат подходит подросткам, которым важны осмысленный досуг и общение со сверстниками."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111102',
    'children',
    'game',
    '1,5 часа',
    null,
    'open',
    false,
    30,
    'published',
    timezone('utc', now()) - interval '7 days'
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  age_category_id = excluded.age_category_id,
  audience_type = excluded.audience_type,
  format = excluded.format,
  duration_text = excluded.duration_text,
  enrollment_status = excluded.enrollment_status,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

-- events: 3 будущих + 1 прошедшее
insert into public.events (
  id, program_id, title, slug, excerpt, content_json, age_category_id,
  audience_type, format, starts_at, ends_at, timezone, venue, price_text,
  capacity, registration_status, featured, status, published_at
) values
  (
    'c3333333-3333-4333-8333-333333333301',
    'b2222222-2222-4222-8222-222222222201',
    'Мастер-класс: одна тема — два формата',
    'master-klass-odna-tema-dva-formata',
    'Знакомство с форматом клуба: параллельные аудитории для детей и родителей.',
    '[{"type":"paragraph","text":"После короткого общего старта семьи расходятся по двум аудиториям и встречаются на финальном обсуждении."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111103',
    'family',
    'workshop',
    timezone('utc', now()) + interval '7 days' + interval '10 hours',
    timezone('utc', now()) + interval '7 days' + interval '12 hours',
    'Europe/Moscow',
    null,
    null,
    24,
    'open',
    true,
    'published',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    'c3333333-3333-4333-8333-333333333302',
    'b2222222-2222-4222-8222-222222222202',
    'Семейный квиз выходного дня',
    'semejnyj-kviz-vyhodnogo-dnya',
    'Командная игра с вопросами для разных возрастов.',
    '[{"type":"paragraph","text":"Регистрация открыта. Точное место будет указано сотрудниками клуба."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111103',
    'family',
    'quiz',
    timezone('utc', now()) + interval '14 days' + interval '11 hours',
    timezone('utc', now()) + interval '14 days' + interval '13 hours',
    'Europe/Moscow',
    null,
    null,
    30,
    'open',
    true,
    'published',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'c3333333-3333-4333-8333-333333333303',
    'b2222222-2222-4222-8222-222222222203',
    'Игровая встреча для подростков',
    'igrovaya-vstrecha-dlya-podrostkov',
    'Развивающие игры с акцентом на командную работу.',
    '[{"type":"paragraph","text":"Встреча рассчитана на подростковую группу; родителям сообщим детали после заявки."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111102',
    'children',
    'game',
    timezone('utc', now()) + interval '21 days' + interval '15 hours',
    timezone('utc', now()) + interval '21 days' + interval '17 hours',
    'Europe/Moscow',
    null,
    null,
    16,
    'open',
    false,
    'published',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'c3333333-3333-4333-8333-333333333304',
    'b2222222-2222-4222-8222-222222222201',
    'Прошедшая встреча: знакомство с клубом',
    'proshedshaya-vstrecha-znakomstvo-s-klubom',
    'Архивная запись для проверки календаря и прошлых дат.',
    '[{"type":"paragraph","text":"Событие уже состоялось и остаётся в календаре как прошедшее."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111101',
    'family',
    'meeting',
    timezone('utc', now()) - interval '10 days' + interval '10 hours',
    timezone('utc', now()) - interval '10 days' + interval '12 hours',
    'Europe/Moscow',
    null,
    null,
    20,
    'closed',
    false,
    'published',
    timezone('utc', now()) - interval '20 days'
  )
on conflict (id) do update set
  program_id = excluded.program_id,
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  age_category_id = excluded.age_category_id,
  audience_type = excluded.audience_type,
  format = excluded.format,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  timezone = excluded.timezone,
  capacity = excluded.capacity,
  registration_status = excluded.registration_status,
  featured = excluded.featured,
  status = excluded.status,
  published_at = excluded.published_at;

-- Черновик события (не должен быть виден публично)
insert into public.events (
  id, title, slug, excerpt, age_category_id, audience_type, format,
  starts_at, ends_at, timezone, registration_status, status
) values (
  'c3333333-3333-4333-8333-333333333399',
  'Черновик: не публиковать',
  'chernovik-ne-publikovat',
  'Служебная запись для проверки RLS.',
  'a1111111-1111-4111-8111-111111111101',
  'family',
  'other',
  timezone('utc', now()) + interval '30 days',
  timezone('utc', now()) + interval '30 days' + interval '2 hours',
  'Europe/Moscow',
  'open',
  'draft'
)
on conflict (id) do update set
  status = 'draft',
  title = excluded.title;

-- news
insert into public.news_posts (
  id, title, slug, excerpt, content_json, is_pinned, status, published_at
) values
  (
    'd4444444-4444-4444-8444-444444444401',
    'Открываем набор на ближайшие встречи',
    'otkryvaem-nabor-na-blizhajshie-vstrechi',
    'Коротко о формате клуба и о том, как записаться на событие.',
    '[{"type":"paragraph","text":"Мы готовим календарь встреч. Выберите подходящую программу или событие и оставьте заявку — мы свяжемся, чтобы уточнить детали."}]'::jsonb,
    true,
    'published',
    timezone('utc', now()) - interval '3 days'
  ),
  (
    'd4444444-4444-4444-8444-444444444402',
    'Как проходит встреча: две аудитории',
    'kak-prohodit-vstrecha-dve-auditorii',
    'Разбор сценария: общий старт, параллельная работа, общий финал.',
    '[{"type":"paragraph","text":"Родители и дети занимаются параллельно: тема одна, содержание и задачи адаптированы под возраст."}]'::jsonb,
    false,
    'published',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    'd4444444-4444-4444-8444-444444444403',
    'Фоторепортажи появятся после встреч',
    'fotoreportazhi-poyavyatsya-posle-vstrech',
    'Альбомы публикуются без имён детей в подписях и адресах файлов.',
    '[{"type":"paragraph","text":"После мероприятий мы будем добавлять фотоальбомы в раздел «Фоторепортажи»."}]'::jsonb,
    false,
    'published',
    timezone('utc', now()) - interval '9 days'
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  is_pinned = excluded.is_pinned,
  status = excluded.status,
  published_at = excluded.published_at;

-- demo album (без реальных файлов Storage — фото добавятся на этапе медиа)
insert into public.albums (
  id, title, slug, description, event_id, event_date, status, published_at
) values (
  'e5555555-5555-4555-8555-555555555501',
  'Демонстрационный альбом',
  'demonstracionnyj-albom',
  'Пример альбома для проверки раздела. Фотографии загружаются через админ-панель.',
  'c3333333-3333-4333-8333-333333333304',
  (timezone('utc', now()) - interval '10 days')::date,
  'published',
  timezone('utc', now()) - interval '9 days'
)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  event_id = excluded.event_id,
  event_date = excluded.event_date,
  status = excluded.status,
  published_at = excluded.published_at;

-- document categories (файлы не сидим — нет выдуманных документов)
insert into public.document_categories (id, name, slug, description, sort_order, is_active)
values
  (
    'f6666666-6666-4666-8666-666666666601',
    'Правила и порядки',
    'pravila-i-poryadki',
    'Документы о правилах посещения и общения в клубе.',
    10,
    true
  ),
  (
    'f6666666-6666-4666-8666-666666666602',
    'Согласия и политика',
    'soglasiya-i-politika',
    'Утверждённые юридические тексты после согласования.',
    20,
    true
  ),
  (
    'f6666666-6666-4666-8666-666666666603',
    'Прочее',
    'prochee',
    'Дополнительные материалы для семей.',
    30,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- site settings: без секретов и без выдуманных контактов
insert into public.site_settings (key, value_json) values
  (
    'club.name',
    '{"value":"Вместе растём"}'::jsonb
  ),
  (
    'club.timezone',
    '{"value":"Europe/Moscow"}'::jsonb
  ),
  (
    'club.tagline',
    '{"value":"Семейный клуб: одна тема — два формата — общий опыт"}'::jsonb
  ),
  (
    'contacts.status',
    '{"value":"needs_fill","note":"НУЖНО ЗАПОЛНИТЬ: адрес, телефон, email, часы работы"}'::jsonb
  ),
  (
    'contacts.public',
    '{"address":null,"phone":null,"email":null,"hours":null,"messengers":{}}'::jsonb
  ),
  (
    'features.calendar',
    '{"enabled":true,"weekStartsOn":1}'::jsonb
  ),
  (
    'uploads.limits',
    '{"mediaMaxBytes":10485760,"documentMaxBytes":20971520}'::jsonb
  )
on conflict (key) do update set
  value_json = excluded.value_json,
  updated_at = timezone('utc', now());

-- Черновик тарифа без цены — не публикуем, чтобы на сайте не было пустых карточек
insert into public.membership_plans (
  id, name, slug, description, benefits_json, price_text, period_text, sort_order, status
) values (
  'g7777777-7777-4777-8777-777777777701',
  'Базовое членство',
  'bazovoe-chlenstvo',
  'НУЖНО ЗАПОЛНИТЬ: описание и стоимость после утверждения тарифов.',
  '["НУЖНО ЗАПОЛНИТЬ: преимущества"]'::jsonb,
  null,
  null,
  10,
  'draft'
)
on conflict (id) do update set
  description = excluded.description,
  status = 'draft',
  price_text = null;

commit;


