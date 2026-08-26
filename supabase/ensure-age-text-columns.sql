-- Колонки свободного текста для возраста (программы и события).
-- Выполните один раз в Supabase → SQL Editor, затем:
-- Project Settings → API → Reload schema cache

alter table public.programs
  add column if not exists age_text text;

comment on column public.programs.age_text is
  'Возраст — произвольный текст для карточки программы';

alter table public.events
  add column if not exists age_text text;

comment on column public.events.age_text is
  'Возраст — произвольный текст для календаря и карточки события';
