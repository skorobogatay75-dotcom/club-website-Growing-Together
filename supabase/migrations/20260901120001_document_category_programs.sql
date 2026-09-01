-- Категория документов «Программы» для публичного раздела и выбора в админке.
-- Можно выполнять повторно.

insert into public.document_categories (id, name, slug, description, sort_order, is_active)
values (
  'f6666666-6666-4666-8666-666666666604',
  'Программы',
  'programmy',
  'Материалы к программам клуба.',
  25,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;
