# Деплой в production (Supabase + Vercel или Timeweb Cloud)

Пошаговая инструкция для запуска сайта «Вместе растём» в интернете.

## 1. Подготовка Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. В **Project Settings → API** скопируйте:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**только сервер**, не публиковать)
3. Примените миграции:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Либо выполните SQL-файлы из `supabase/migrations/` по порядку в SQL Editor.

4. (Опционально) для демо-контента:

```bash
npx supabase db query --file supabase/seed.sql
```

На production seed можно не применять — заполняйте контент через админку.

5. **Authentication → URL Configuration**
   - Site URL: `https://ваш-домен.ru`
   - Redirect URLs:
     - `https://ваш-домен.ru/admin/auth/callback`
     - `http://localhost:3000/admin/auth/callback` (для локальной разработки)

6. **Storage** — buckets `public-media` и `public-documents` создаются миграцией `…_storage.sql`. Проверьте, что они есть и политики применены.

## 2. Первый администратор

Публичной регистрации нет.

1. **Authentication → Users → Add user** (email + пароль).
2. В SQL Editor:

```sql
insert into public.profiles (id, full_name, role, is_active)
values (
  '<UUID пользователя из Auth>',
  'Администратор',
  'admin',
  true
);
```

3. Вход: `https://ваш-домен.ru/admin/login`

Редактора создайте так же с `role = 'editor'`.

## 3. Деплой на Vercel

1. Залейте репозиторий на GitHub/GitLab.
2. [vercel.com](https://vercel.com) → **Add New Project** → выберите репозиторий.
3. Framework Preset: **Next.js** (определится сам).
4. Environment Variables (Production + Preview по необходимости):

| Переменная | Обязательно | Комментарий |
|------------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | да | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | да | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | да | только сервер; для заявок |
| `NEXT_PUBLIC_SITE_URL` | да | `https://ваш-домен.ru` без слэша в конце |
| `CLUB_TIMEZONE` | желательно | например `Europe/Moscow` |
| `RESEND_API_KEY` | нет | уведомления о заявках |
| `EMAIL_FROM` | нет | отправитель Resend |
| `EMAIL_REPLY_TO` | нет | reply-to |
| `APPLICATION_NOTIFY_EMAIL` | нет | куда слать заявки |
| `TELEGRAM_BOT_TOKEN` | нет | опционально |
| `TELEGRAM_CHAT_ID` | нет | опционально |
| `TELEGRAM_API_BASE` | нет | если Timeweb не достучится до `api.telegram.org` — URL своего Cloudflare Worker без `/` в конце (см. ниже) |

### Telegram с Timeweb (если `network_error`)

Диагностика: `/api/admin/telegram-test` → «Отправить тест».  
Если `description: network_error` — сервер Timeweb не достучится до Telegram. Решение: свой бесплатный прокси на Cloudflare Workers.

1. Зарегистрируйтесь на [dash.cloudflare.com](https://dash.cloudflare.com) (бесплатно).
2. **Workers & Pages** → **Create** → **Create Worker**.
3. Вставьте код из [`scripts/telegram-cloudflare-worker.js`](../scripts/telegram-cloudflare-worker.js) → **Deploy**.
4. Скопируйте URL вида `https://имя.аккаунт.workers.dev` (без `/` в конце).
5. В Timeweb добавьте переменную `TELEGRAM_API_BASE` = этот URL → **Redeploy**.
6. Снова нажмите «Отправить тест» на `/api/admin/telegram-test`.

Не используйте чужие публичные прокси — через них проходит токен бота.

5. Deploy. После первого деплоя привяжите свой домен в **Project → Settings → Domains**.
6. Убедитесь, что `NEXT_PUBLIC_SITE_URL` совпадает с финальным доменом, и обновите Redirect URLs в Supabase.

## 3.1. Деплой на Timeweb Cloud (App Platform)

Сайт — полноценный Next.js с SSR, middleware и server actions. На Timeweb нужен режим **с поддержкой SSR**, не static-only.

1. Репозиторий уже на GitHub.
2. [timeweb.cloud](https://timeweb.cloud) → **App Platform** → **Создать**.
3. Тип: **Next.js**, Node.js **20+**.
4. **Включите поддержку SSR** (иначе админка, заявки и календарь не будут работать как задумано).
5. Репозиторий + ветка `main` (или ваша рабочая), автодеплой по желанию.
6. Команды (если не подставились сами):
   - установка: `npm ci` или `npm install`
   - сборка: `npm run build`
   - запуск: `npm start`
7. Те же Environment Variables, что в таблице выше.  
   `NEXT_PUBLIC_SITE_URL` = URL приложения Timeweb или ваш домен, **без** `/` в конце.
8. После деплоя скопируйте публичный URL и добавьте в Supabase Auth → Redirect URLs:
   - `https://ваш-url.timeweb.cloud/admin/auth/callback`
9. Проверьте чеклист из раздела 4.

Подробности Timeweb: [деплой Next.js](https://timeweb.cloud/docs/apps/deploying-frontend-apps/nextjs).

## 4. Проверка после деплоя

- [ ] Главная открывается, меню работает
- [ ] `/events` — календарь на месяц
- [ ] `/admin/login` — вход админа
- [ ] Создание черновика события и публикация → видно в календаре
- [ ] Заявка с `/apply` появляется в `/admin/applications`
- [ ] Загрузка JPEG/PNG/WebP и видео MP4/WebM в альбом; PDF/DOCX в документы
- [ ] `/sitemap.xml` и `/robots.txt` отдают XML/текст
- [ ] Письмо сброса пароля (если настроен SMTP/Resend в Auth) ведёт на `/admin/update-password`

## 5. Типичные ошибки

| Симптом | Что проверить |
|---------|----------------|
| Пустой сайт, нет контента | Env Supabase, миграции, статус `published` |
| Нельзя войти в админку | `profiles` с `is_active` и ролью `admin`/`editor` |
| Заявки не сохраняются | `SUPABASE_SERVICE_ROLE_KEY` на Vercel |
| Фото/видео не грузятся | Storage buckets + политики; MIME JPEG/PNG/WebP/MP4/WebM; лимит 50 МБ для видео |
| Сброс пароля не работает | Redirect URLs + Site URL в Supabase Auth |
| Неверные canonical/OG URL | `NEXT_PUBLIC_SITE_URL` |
| В админке возраст — выпадающий список «Не выбрано» | Старая сборка на хостинге. Откройте `/api/health` — должно быть `"version":"0.1.1"` и `"ageTextField":true`. Пересоберите из ветки `main` без кэша. |
| В админке 18:00, на сайте 21:00 | Та же старая сборка: время сохранялось как UTC сервера. После деплика 0.1.1 выполните `supabase/fix-event-times-minus-3h.sql` **или** пересохраните события в админке. |

## 6. Обновления

```bash
git push   # Vercel подхватит main/master
npx supabase db push   # если есть новые миграции
```

Секреты не коммитить. `.env.local` только локально.
