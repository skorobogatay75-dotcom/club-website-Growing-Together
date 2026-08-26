-- Свободный текст возраста для программ (вместо выбора из справочника).

alter table public.programs
  add column if not exists age_text text;

comment on column public.programs.age_text is
  'Возраст / аудитория по возрасту — произвольный текст для карточки и фильтра';
