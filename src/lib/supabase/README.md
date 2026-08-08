/**
 * Клиенты Supabase:
 * - `server.ts` — Server Components / Route Handlers (anon + cookies, RLS)
 * - `client.ts` — браузер (только NEXT_PUBLIC_*)
 * - `admin.ts` — service role, только сервер
 *
 * Без env сайт собирается: запросы возвращают пустые списки.
 */
