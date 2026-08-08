# Supabase — схема, RLS, Storage, seed

## Миграции

Файлы в `migrations/` применяются по порядку:

1. `20260808120001_extensions_and_enums.sql` — расширения и enum
2. `20260808120002_tables.sql` — таблицы, CHECK, индексы
3. `20260808120003_functions_and_triggers.sql` — `is_staff` / `is_admin`, `updated_at`, `published_at`
4. `20260808120004_rls.sql` — Row Level Security
5. `20260808120005_storage.sql` — buckets `public-media`, `public-documents`
6. `20260808130001_event_remaining_seats.sql` — остаток мест для событий

## Как применить

### Вариант A: Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
npx supabase db query --file supabase/seed.sql
```

Локально:

```bash
npx supabase start
npx supabase db reset   # миграции + seed из config.toml
```

### Вариант B: SQL Editor в Dashboard

Выполните файлы миграций по порядку, затем `seed.sql`.

## Первый admin

Публичной регистрации нет. Создайте пользователя в Authentication → Users, затем:

```sql
insert into public.profiles (id, full_name, role, is_active)
values ('<AUTH_USER_UUID>', 'Администратор', 'admin', true);
```

В Redirect URLs Supabase добавьте:

- `http://localhost:3000/admin/auth/callback`
- `https://<ваш-домен>/admin/auth/callback`

Страницы: `/admin/login`, `/admin/forgot-password`, `/admin/update-password`.

Подробный production-чеклист: [`docs/DEPLOY.md`](../docs/DEPLOY.md).  
Инструкция для сотрудников: [`docs/ADMIN.md`](../docs/ADMIN.md).

## RLS — кратко

| Таблица | anon SELECT | anon INSERT | staff |
|--------|-------------|-------------|--------|
| Контент (programs, events, …) | только `published` | нет | CRUD |
| `applications` | нет | нет (только service role / staff) | select/update/insert; delete — admin |
| `profiles`, `site_settings` | settings: без `private.*` | нет | только admin на запись |

Service role обходит RLS и используется только на сервере Next.js.
