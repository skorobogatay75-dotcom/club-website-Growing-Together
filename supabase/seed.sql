-- Seed для локальной разработки и демо.
-- Не содержит реальных адресов, телефонов, цен, биографий и реквизитов.
-- Значения «НУЖНО ЗАПОЛНИТЬ» не предназначены для публичного UI —
-- публичные страницы должны скрывать пустые/служебные поля.

begin;

-- Стабильные UUID для идемпотентного повторного запуска
-- age categories
insert into public.age_categories (
  id, name, slug, age_from, age_to, description, color_token, sort_order, is_active
) values
  (
    'a1111111-1111-4111-8111-111111111101',
    'Младшие школьники',
    'mladshie-shkolniki',
    7,
    10,
    'Встречи с адаптированными заданиями для младшего школьного возраста.',
    'turquoise',
    10,
    true
  ),
  (
    'a1111111-1111-4111-8111-111111111102',
    'Подростки',
    'podrostki',
    11,
    15,
    'Форматы с большей самостоятельностью и командным взаимодействием.',
    'honey',
    20,
    true
  ),
  (
    'a1111111-1111-4111-8111-111111111103',
    'Семья вместе',
    'semya-vmeste',
    null,
    null,
    'Параллельные занятия для детей и родителей в двух аудиториях.',
    'terracotta',
    30,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  age_from = excluded.age_from,
  age_to = excluded.age_to,
  description = excluded.description,
  color_token = excluded.color_token,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- programs (published, без выдуманных цен)
insert into public.programs (
  id, title, slug, excerpt, content_json, age_category_id,
  audience_type, format, duration_text, price_text, enrollment_status,
  featured, sort_order, status, published_at
) values
  (
    'b2222222-2222-4222-8222-222222222201',
    'Игровые мастер-классы',
    'igrovye-master-klassy',
    'Практические встречи, где ребёнок и взрослый пробуют одну тему в разных форматах.',
    '[{"type":"paragraph","text":"На встрече семья работает с одной темой: дети — в игровом формате, родители — в адаптированном параллельном блоке."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111101',
    'family',
    'workshop',
    '1,5–2 часа',
    null,
    'open',
    true,
    10,
    'published',
    timezone('utc', now()) - interval '14 days'
  ),
  (
    'b2222222-2222-4222-8222-222222222202',
    'Семейные квизы',
    'semejnye-kvizy',
    'Командные квизы с вопросами разной сложности для детей и взрослых.',
    '[{"type":"paragraph","text":"Квиз помогает потренировать внимание, эрудицию и умение договариваться в команде."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111103',
    'family',
    'quiz',
    'около 2 часов',
    null,
    'open',
    true,
    20,
    'published',
    timezone('utc', now()) - interval '10 days'
  ),
  (
    'b2222222-2222-4222-8222-222222222203',
    'Развивающие игры для подростков',
    'razvivayushchie-igry-dlya-podrostkov',
    'Встречи с акцентом на коммуникацию, стратегию и совместный результат.',
    '[{"type":"paragraph","text":"Формат подходит подросткам, которым важны осмысленный досуг и общение со сверстниками."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111102',
    'children',
    'game',
    '1,5 часа',
    null,
    'open',
    false,
    30,
    'published',
    timezone('utc', now()) - interval '7 days'
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  age_category_id = excluded.age_category_id,
  audience_type = excluded.audience_type,
  format = excluded.format,
  duration_text = excluded.duration_text,
  enrollment_status = excluded.enrollment_status,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

-- events: 3 будущих + 1 прошедшее
insert into public.events (
  id, program_id, title, slug, excerpt, content_json, age_category_id,
  audience_type, format, starts_at, ends_at, timezone, venue, price_text,
  capacity, registration_status, featured, status, published_at
) values
  (
    'c3333333-3333-4333-8333-333333333301',
    'b2222222-2222-4222-8222-222222222201',
    'Мастер-класс: одна тема — два формата',
    'master-klass-odna-tema-dva-formata',
    'Знакомство с форматом клуба: параллельные аудитории для детей и родителей.',
    '[{"type":"paragraph","text":"После короткого общего старта семьи расходятся по двум аудиториям и встречаются на финальном обсуждении."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111103',
    'family',
    'workshop',
    timezone('utc', now()) + interval '7 days' + interval '10 hours',
    timezone('utc', now()) + interval '7 days' + interval '12 hours',
    'Europe/Moscow',
    null,
    null,
    24,
    'open',
    true,
    'published',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    'c3333333-3333-4333-8333-333333333302',
    'b2222222-2222-4222-8222-222222222202',
    'Семейный квиз выходного дня',
    'semejnyj-kviz-vyhodnogo-dnya',
    'Командная игра с вопросами для разных возрастов.',
    '[{"type":"paragraph","text":"Регистрация открыта. Точное место будет указано сотрудниками клуба."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111103',
    'family',
    'quiz',
    timezone('utc', now()) + interval '14 days' + interval '11 hours',
    timezone('utc', now()) + interval '14 days' + interval '13 hours',
    'Europe/Moscow',
    null,
    null,
    30,
    'open',
    true,
    'published',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'c3333333-3333-4333-8333-333333333303',
    'b2222222-2222-4222-8222-222222222203',
    'Игровая встреча для подростков',
    'igrovaya-vstrecha-dlya-podrostkov',
    'Развивающие игры с акцентом на командную работу.',
    '[{"type":"paragraph","text":"Встреча рассчитана на подростковую группу; родителям сообщим детали после заявки."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111102',
    'children',
    'game',
    timezone('utc', now()) + interval '21 days' + interval '15 hours',
    timezone('utc', now()) + interval '21 days' + interval '17 hours',
    'Europe/Moscow',
    null,
    null,
    16,
    'open',
    false,
    'published',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'c3333333-3333-4333-8333-333333333304',
    'b2222222-2222-4222-8222-222222222201',
    'Прошедшая встреча: знакомство с клубом',
    'proshedshaya-vstrecha-znakomstvo-s-klubom',
    'Архивная запись для проверки календаря и прошлых дат.',
    '[{"type":"paragraph","text":"Событие уже состоялось и остаётся в календаре как прошедшее."}]'::jsonb,
    'a1111111-1111-4111-8111-111111111101',
    'family',
    'meeting',
    timezone('utc', now()) - interval '10 days' + interval '10 hours',
    timezone('utc', now()) - interval '10 days' + interval '12 hours',
    'Europe/Moscow',
    null,
    null,
    20,
    'closed',
    false,
    'published',
    timezone('utc', now()) - interval '20 days'
  )
on conflict (id) do update set
  program_id = excluded.program_id,
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  age_category_id = excluded.age_category_id,
  audience_type = excluded.audience_type,
  format = excluded.format,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  timezone = excluded.timezone,
  capacity = excluded.capacity,
  registration_status = excluded.registration_status,
  featured = excluded.featured,
  status = excluded.status,
  published_at = excluded.published_at;

-- Черновик события (не должен быть виден публично)
insert into public.events (
  id, title, slug, excerpt, age_category_id, audience_type, format,
  starts_at, ends_at, timezone, registration_status, status
) values (
  'c3333333-3333-4333-8333-333333333399',
  'Черновик: не публиковать',
  'chernovik-ne-publikovat',
  'Служебная запись для проверки RLS.',
  'a1111111-1111-4111-8111-111111111101',
  'family',
  'other',
  timezone('utc', now()) + interval '30 days',
  timezone('utc', now()) + interval '30 days' + interval '2 hours',
  'Europe/Moscow',
  'open',
  'draft'
)
on conflict (id) do update set
  status = 'draft',
  title = excluded.title;

-- news
insert into public.news_posts (
  id, title, slug, excerpt, content_json, is_pinned, status, published_at
) values
  (
    'd4444444-4444-4444-8444-444444444401',
    'Открываем набор на ближайшие встречи',
    'otkryvaem-nabor-na-blizhajshie-vstrechi',
    'Коротко о формате клуба и о том, как записаться на событие.',
    '[{"type":"paragraph","text":"Мы готовим календарь встреч. Выберите подходящую программу или событие и оставьте заявку — мы свяжемся, чтобы уточнить детали."}]'::jsonb,
    true,
    'published',
    timezone('utc', now()) - interval '3 days'
  ),
  (
    'd4444444-4444-4444-8444-444444444402',
    'Как проходит встреча: две аудитории',
    'kak-prohodit-vstrecha-dve-auditorii',
    'Разбор сценария: общий старт, параллельная работа, общий финал.',
    '[{"type":"paragraph","text":"Родители и дети занимаются параллельно: тема одна, содержание и задачи адаптированы под возраст."}]'::jsonb,
    false,
    'published',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    'd4444444-4444-4444-8444-444444444403',
    'Фоторепортажи появятся после встреч',
    'fotoreportazhi-poyavyatsya-posle-vstrech',
    'Альбомы публикуются без имён детей в подписях и адресах файлов.',
    '[{"type":"paragraph","text":"После мероприятий мы будем добавлять фотоальбомы в раздел «Фоторепортажи»."}]'::jsonb,
    false,
    'published',
    timezone('utc', now()) - interval '9 days'
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  is_pinned = excluded.is_pinned,
  status = excluded.status,
  published_at = excluded.published_at;

-- demo album (без реальных файлов Storage — фото добавятся на этапе медиа)
insert into public.albums (
  id, title, slug, description, event_id, event_date, status, published_at
) values (
  'e5555555-5555-4555-8555-555555555501',
  'Демонстрационный альбом',
  'demonstracionnyj-albom',
  'Пример альбома для проверки раздела. Фотографии загружаются через админ-панель.',
  'c3333333-3333-4333-8333-333333333304',
  (timezone('utc', now()) - interval '10 days')::date,
  'published',
  timezone('utc', now()) - interval '9 days'
)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  event_id = excluded.event_id,
  event_date = excluded.event_date,
  status = excluded.status,
  published_at = excluded.published_at;

-- document categories (файлы не сидим — нет выдуманных документов)
insert into public.document_categories (id, name, slug, description, sort_order, is_active)
values
  (
    'f6666666-6666-4666-8666-666666666601',
    'Правила и порядки',
    'pravila-i-poryadki',
    'Документы о правилах посещения и общения в клубе.',
    10,
    true
  ),
  (
    'f6666666-6666-4666-8666-666666666602',
    'Согласия и политика',
    'soglasiya-i-politika',
    'Утверждённые юридические тексты после согласования.',
    20,
    true
  ),
  (
    'f6666666-6666-4666-8666-666666666603',
    'Прочее',
    'prochee',
    'Дополнительные материалы для семей.',
    30,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- site settings: без секретов и без выдуманных контактов
insert into public.site_settings (key, value_json) values
  (
    'club.name',
    '{"value":"Вместе растём"}'::jsonb
  ),
  (
    'club.timezone',
    '{"value":"Europe/Moscow"}'::jsonb
  ),
  (
    'club.tagline',
    '{"value":"Семейный клуб: одна тема — два формата — общий опыт"}'::jsonb
  ),
  (
    'contacts.status',
    '{"value":"needs_fill","note":"НУЖНО ЗАПОЛНИТЬ: адрес, телефон, email, часы работы"}'::jsonb
  ),
  (
    'contacts.public',
    '{"address":null,"phone":null,"email":null,"hours":null,"messengers":{}}'::jsonb
  ),
  (
    'features.calendar',
    '{"enabled":true,"weekStartsOn":1}'::jsonb
  ),
  (
    'uploads.limits',
    '{"mediaMaxBytes":10485760,"documentMaxBytes":20971520}'::jsonb
  )
on conflict (key) do update set
  value_json = excluded.value_json,
  updated_at = timezone('utc', now());

-- Черновик тарифа без цены — не публикуем, чтобы на сайте не было пустых карточек
insert into public.membership_plans (
  id, name, slug, description, benefits_json, price_text, period_text, sort_order, status
) values (
  'g7777777-7777-4777-8777-777777777701',
  'Базовое членство',
  'bazovoe-chlenstvo',
  'НУЖНО ЗАПОЛНИТЬ: описание и стоимость после утверждения тарифов.',
  '["НУЖНО ЗАПОЛНИТЬ: преимущества"]'::jsonb,
  null,
  null,
  10,
  'draft'
)
on conflict (id) do update set
  description = excluded.description,
  status = 'draft',
  price_text = null;

commit;
