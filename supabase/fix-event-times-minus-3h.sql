-- Разовое исправление времени событий.
-- Раньше «18:00» по Москве сохранялось как 18:00 UTC (= 21:00 МСК на сайте).
-- Сдвигаем starts_at / ends_at на −3 часа.
--
-- Выполните ОДИН раз в Supabase → SQL Editor.
-- Если какие-то события уже пересохранили правильно после фикса —
-- поправьте их вручную в админке после этого скрипта.

update public.events
set
  starts_at = starts_at - interval '3 hours',
  ends_at = ends_at - interval '3 hours',
  updated_at = now()
where starts_at is not null;
