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
