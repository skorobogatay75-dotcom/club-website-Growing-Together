-- Возрастные категории для программ и событий.
-- Выполните в Supabase → SQL Editor (можно повторно).

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
