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
