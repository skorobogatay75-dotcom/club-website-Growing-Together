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
