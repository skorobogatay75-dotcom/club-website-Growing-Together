-- Этап 2: расширения и доменные типы
-- Семейный клуб «Вместе растём»

create extension if not exists "pgcrypto";

-- Роли сотрудников
do $$ begin
  create type public.user_role as enum ('admin', 'editor');
exception when duplicate_object then null;
end $$;

-- Публикация контента
do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

-- Набор на программы
do $$ begin
  create type public.enrollment_status as enum ('open', 'closed', 'waitlist', 'full');
exception when duplicate_object then null;
end $$;

-- Регистрация на события (cancelled остаётся видимым при status=published)
do $$ begin
  create type public.registration_status as enum ('open', 'closed', 'waitlist', 'cancelled');
exception when duplicate_object then null;
end $$;

-- Аудитория
do $$ begin
  create type public.audience_type as enum ('children', 'parents', 'family', 'mixed');
exception when duplicate_object then null;
end $$;

-- Формат встречи
do $$ begin
  create type public.event_format as enum ('workshop', 'quiz', 'game', 'meeting', 'other');
exception when duplicate_object then null;
end $$;

-- Тип заявки
do $$ begin
  create type public.application_type as enum ('program', 'event', 'membership', 'general');
exception when duplicate_object then null;
end $$;

-- Статус заявки
do $$ begin
  create type public.application_status as enum (
    'new',
    'contacted',
    'confirmed',
    'waitlist',
    'completed',
    'cancelled',
    'spam'
  );
exception when duplicate_object then null;
end $$;

-- Предпочтительный способ связи
do $$ begin
  create type public.preferred_contact as enum ('phone', 'email', 'telegram', 'whatsapp', 'any');
exception when duplicate_object then null;
end $$;
