import Link from "next/link";
import {
  saveProgramAction,
  deleteProgramAction,
  setProgramStatusAction,
} from "@/features/admin/programs/actions";
import { contentJsonToText } from "@/lib/admin/content-json";
import { Field } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { Document, Program } from "@/types/database";
import { slugify } from "@/lib/admin/slug";

type Props = {
  program?: Program | null;
  documents?: Pick<Document, "id" | "title" | "status" | "mime_type">[];
  selectedDocumentIds?: string[];
};

export function ProgramForm({
  program,
  documents = [],
  selectedDocumentIds = [],
}: Props) {
  const isEdit = Boolean(program);
  const selected = new Set(selectedDocumentIds);

  return (
    <div className="space-y-8">
      <form action={saveProgramAction} className="space-y-5">
        {program ? <input type="hidden" name="id" value={program.id} /> : null}
        <input type="hidden" name="cover_path" value={program?.cover_path ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Название">
            <input
              className="field-input"
              name="title"
              required
              defaultValue={program?.title ?? ""}
            />
          </Field>
          <Field label="Slug" hint="Латиница; можно поправить вручную">
            <input
              className="field-input"
              name="slug"
              defaultValue={program?.slug ?? ""}
              placeholder={slugify(program?.title ?? "programma")}
            />
          </Field>
        </div>

        <Field label="Краткое описание">
          <textarea
            className="field-input min-h-24"
            name="excerpt"
            defaultValue={program?.excerpt ?? ""}
          />
        </Field>

        <Field
          label="Содержание"
          hint="## заголовок, ### подзаголовок, - список. Ссылка: [текст](https://сайт.ru). Без HTML."
        >
          <textarea
            className="field-input min-h-40 font-mono text-sm"
            name="content"
            defaultValue={contentJsonToText(program?.content_json)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Возраст"
            hint="Свободный текст, например: 7–10 лет, подростки, вся семья"
          >
            <input
              className="field-input"
              name="age_text"
              defaultValue={program?.age_text ?? ""}
              placeholder="Например: 7–10 лет"
            />
          </Field>
          <Field label="Статус">
            <select
              className="field-input"
              name="status"
              defaultValue={program?.status ?? "draft"}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
          <Field label="Аудитория">
            <select
              className="field-input"
              name="audience_type"
              defaultValue={program?.audience_type ?? "family"}
            >
              <option value="family">family</option>
              <option value="children">children</option>
              <option value="parents">parents</option>
              <option value="mixed">mixed</option>
            </select>
          </Field>
          <Field label="Формат">
            <select
              className="field-input"
              name="format"
              defaultValue={program?.format ?? "workshop"}
            >
              <option value="workshop">workshop</option>
              <option value="quiz">quiz</option>
              <option value="game">game</option>
              <option value="meeting">meeting</option>
              <option value="other">other</option>
            </select>
          </Field>
          <Field label="Длительность">
            <input
              className="field-input"
              name="duration_text"
              defaultValue={program?.duration_text ?? ""}
            />
          </Field>
          <Field label="Стоимость (текст)">
            <input
              className="field-input"
              name="price_text"
              defaultValue={program?.price_text ?? ""}
            />
          </Field>
          <Field label="Набор">
            <select
              className="field-input"
              name="enrollment_status"
              defaultValue={program?.enrollment_status ?? "open"}
            >
              <option value="open">open</option>
              <option value="closed">closed</option>
              <option value="waitlist">waitlist</option>
              <option value="full">full</option>
            </select>
          </Field>
          <Field label="Порядок">
            <input
              className="field-input"
              type="number"
              name="sort_order"
              defaultValue={program?.sort_order ?? 0}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={program?.featured ?? false}
          />
          Показывать как избранную
        </label>

        <Field label="Обложка (JPEG/PNG/WebP)">
          <input
            className="field-input"
            type="file"
            name="cover"
            accept="image/jpeg,image/png,image/webp"
          />
          {program?.cover_path ? (
            <span className="mt-1 block text-xs text-muted">
              Текущий файл: {program.cover_path}
            </span>
          ) : null}
        </Field>

        <Field
          label="Документы программы"
          hint="Отметьте файлы из раздела «Документы». На сайте покажутся только опубликованные."
        >
          {documents.length === 0 ? (
            <p className="text-sm text-muted">
              Пока нет документов.{" "}
              <Link href="/admin/documents/new" className="text-accent hover:text-accent-hover">
                Загрузить документ
              </Link>
              , затем вернитесь сюда.
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-[var(--radius-card)] border border-border bg-surface px-3 py-3">
              {documents.map((doc) => {
                const ext =
                  doc.mime_type === "application/pdf"
                    ? "PDF"
                    : doc.mime_type.includes("word")
                      ? "DOCX"
                      : "файл";
                return (
                  <li key={doc.id}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="document_ids"
                        value={doc.id}
                        defaultChecked={selected.has(doc.id)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="font-medium text-foreground">{doc.title}</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {ext} · {doc.status}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO title">
            <input
              className="field-input"
              name="seo_title"
              defaultValue={program?.seo_title ?? ""}
            />
          </Field>
          <Field label="SEO description">
            <input
              className="field-input"
              name="seo_description"
              defaultValue={program?.seo_description ?? ""}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            {isEdit ? "Сохранить" : "Создать"}
          </button>
          <Link href="/admin/programs" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>

      {program ? (
        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <form action={setProgramStatusAction}>
            <input type="hidden" name="id" value={program.id} />
            <input type="hidden" name="status" value="published" />
            <button type="submit" className="btn-secondary">
              Опубликовать
            </button>
          </form>
          <form action={setProgramStatusAction}>
            <input type="hidden" name="id" value={program.id} />
            <input type="hidden" name="status" value="draft" />
            <button type="submit" className="btn-secondary">
              Снять с публикации
            </button>
          </form>
          <form action={setProgramStatusAction}>
            <input type="hidden" name="id" value={program.id} />
            <input type="hidden" name="status" value="archived" />
            <button type="submit" className="btn-secondary">
              В архив
            </button>
          </form>
          <ConfirmDeleteButton
            action={deleteProgramAction}
            id={program.id}
            confirmMessage="Удалить программу безвозвратно?"
          />
        </div>
      ) : null}
    </div>
  );
}
