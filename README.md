# Вместе растём — сайт семейного клуба

Многостраничный сайт с Supabase (PostgreSQL, Auth, Storage, RLS) и защищённой админ-панелью для программ, событий, новостей, фотоальбомов, документов, членства и заявок.

На `/events` — полноценный **месячный календарь** (сетка 7 колонок, переключение месяцев, «Сегодня», фильтры, мобильная повестка). Календарь не заменяется списком карточек.

## Стек

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS 4
- Supabase (этап 2+)
- Zod, React Hook Form, Lucide React (по мере необходимости)
- Деплой: Vercel

## Требования

- Node.js 20+
- npm 10+
- Аккаунт Supabase (со этапа 2)

## Быстрый старт

```bash
npm ci
cp .env.example .env.local
# заполните переменные после создания проекта Supabase
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## База данных (этап 2)

Миграции и seed лежат в `supabase/`. Подробности: [`supabase/README.md`](./supabase/README.md).

```bash
npx supabase db push
npx supabase db query --file supabase/seed.sql
# или локально: npx supabase db reset
```

Seed: 3 возрастные категории, 3 программы, 3 будущих + 1 прошедшее событие, черновик события (для проверки RLS), 3 новости, демо-альбом, категории документов, настройки без выдуманных контактов/цен.

Buckets: `public-media` (JPEG/PNG/WebP до 10 МБ), `public-documents` (PDF/DOCX до 20 МБ).

## Скрипты

| Команда | Назначение |
|---------|------------|
| `npm run dev` | Локальная разработка |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Unit/smoke-тесты |
| `npm run build` | Production build |
| `npm start` | Запуск production-сборки |

## Структура

```
src/app/(public)/     # публичные страницы
src/app/admin/        # админ-панель
src/app/api/          # API routes
src/components/       # ui, public, admin, forms
src/features/         # доменные модули
src/lib/              # supabase, auth, validation, seo, email
src/styles/           # дизайн-токены
src/types/            # TypeScript-типы схемы БД
supabase/migrations/  # SQL + RLS + Storage
supabase/seed.sql     # демо-данные
public/brand/         # логотип и бренд-ассеты
```

## Переменные окружения

См. `.env.example`. Важно:

- `NEXT_PUBLIC_*` — только публичные значения (URL, anon key)
- `SUPABASE_SERVICE_ROLE_KEY` — **только сервер**, никогда в браузер и в git
- Секреты не коммитить; `.env.local` в `.gitignore`

## Этапы разработки

1. Инициализация, токены, layout, README, `.env.example` — готово
2. SQL, RLS, Storage policies, seed — готово
3. Публичный каркас и главная на данных БД — готово
4. Каталоги и детальные страницы (включая месячный календарь) — готово
5. Формы, уведомления, антиспам — готово
6. Auth, роли, admin layout — готово
7. CRUD и медиа ← следующий
8. Галерея, документы, членство, настройки
9. SEO, a11y, performance, tests
10. Production deploy и инструкция администратора

## Дизайн

Концепция «дом и объятие». Токены в `src/styles/tokens.css`:

- Терракота `#A85645` — CTA
- Медовый `#E6A64C` — точечный акцент
- Бирюза `#80B4B2` — инфо / календарь
- Пудровый `#F2D8C9`, сливочный `#FFF3EA`
- Текст `#2F2926` / `#746860`

Шрифт: Manrope (кириллица) через `next/font`.

Логотип: пока текстовая заглушка `ВР` в шапке — замените на исходник в `public/brand/logo.svg`.

## Безопасность (принципы)

- RLS на всех таблицах `public`
- Аноним не читает `applications`
- Проверка ролей на сервере + RLS
- Service role только на сервере
- PII не писать в console и клиентские логи

## Контент без выдумок

Не публикуются выдуманные контакты, цены, адреса, биографии и юридические тексты. Значения «НУЖНО ЗАПОЛНИТЬ» допустимы только в админке и не выводятся на публичных страницах.

## Лицензия

Приватный проект семейного клуба «Вместе растём».
