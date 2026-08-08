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
supabase/migrations/  # SQL + RLS
public/brand/         # логотип и бренд-ассеты
```

## Переменные окружения

См. `.env.example`. Важно:

- `NEXT_PUBLIC_*` — только публичные значения (URL, anon key)
- `SUPABASE_SERVICE_ROLE_KEY` — **только сервер**, никогда в браузер и в git
- Секреты не коммитить; `.env.local` в `.gitignore`

## Этапы разработки

1. Инициализация, токены, layout, README, `.env.example` ← текущий
2. SQL, RLS, Storage policies, seed
3. Публичный каркас и главная на данных БД
4. Каталоги и детальные страницы
5. Формы, уведомления, антиспам
6. Auth, роли, admin layout
7. CRUD и медиа
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
