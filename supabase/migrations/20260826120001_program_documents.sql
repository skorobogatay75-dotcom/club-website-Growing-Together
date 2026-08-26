-- Привязка документов к программам (многие-ко-многим)
-- Можно выполнять повторно: существующие объекты не ломают скрипт.

create table if not exists public.program_documents (
  program_id uuid not null references public.programs (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (program_id, document_id)
);

create index if not exists program_documents_document_id_idx
  on public.program_documents (document_id);

create index if not exists program_documents_program_sort_idx
  on public.program_documents (program_id, sort_order);

alter table public.program_documents enable row level security;

drop policy if exists program_documents_select on public.program_documents;
create policy program_documents_select
  on public.program_documents
  for select
  using (
    public.is_staff()
    or (
      exists (
        select 1
        from public.programs p
        where p.id = program_id
          and public.is_published(p.status)
      )
      and exists (
        select 1
        from public.documents d
        where d.id = document_id
          and public.is_published(d.status)
      )
    )
  );

drop policy if exists program_documents_insert on public.program_documents;
create policy program_documents_insert
  on public.program_documents
  for insert
  with check (public.is_staff());

drop policy if exists program_documents_update on public.program_documents;
create policy program_documents_update
  on public.program_documents
  for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists program_documents_delete on public.program_documents;
create policy program_documents_delete
  on public.program_documents
  for delete
  using (public.is_staff());
