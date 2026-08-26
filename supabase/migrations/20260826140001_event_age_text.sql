-- Свободный текст возраста для событий (календарь).

alter table public.events
  add column if not exists age_text text;

comment on column public.events.age_text is
  'Возраст — произвольный текст для календаря и карточки события';
