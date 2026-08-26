import Link from "next/link";
import {
  saveNewsAction,
  deleteNewsAction,
  setNewsStatusAction,
} from "@/features/admin/news/actions";
import { contentJsonToText } from "@/lib/admin/content-json";
import { Field } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { NewsPost } from "@/types/database";

type Props = { news?: NewsPost | null };

export function NewsForm({ news }: Props) {
  return (
    <div className="space-y-8">
      <form action={saveNewsAction} className="space-y-5" encType="multipart/form-data">
        {news ? <input type="hidden" name="id" value={news.id} /> : null}
        <input type="hidden" name="cover_path" value={news?.cover_path ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Заголовок">
            <input className="field-input" name="title" required defaultValue={news?.title ?? ""} />
          </Field>
          <Field label="Slug">
            <input className="field-input" name="slug" defaultValue={news?.slug ?? ""} />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue={news?.status ?? "draft"}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
        </div>

        <Field label="Анонс">
          <textarea className="field-input min-h-20" name="excerpt" defaultValue={news?.excerpt ?? ""} />
        </Field>
        <Field
          label="Текст"
          hint="## / ### / - список. Ссылка: [текст](https://...) или просто https://..."
        >
          <textarea
            className="field-input min-h-40 font-mono text-sm"
            name="content"
            defaultValue={contentJsonToText(news?.content_json)}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_pinned" defaultChecked={news?.is_pinned ?? false} />
          Закрепить
        </label>

        <Field label="Обложка">
          <input className="field-input" type="file" name="cover" accept="image/jpeg,image/png,image/webp" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO title">
            <input className="field-input" name="seo_title" defaultValue={news?.seo_title ?? ""} />
          </Field>
          <Field label="SEO description">
            <input
              className="field-input"
              name="seo_description"
              defaultValue={news?.seo_description ?? ""}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            {news ? "Сохранить" : "Создать"}
          </button>
          <Link href="/admin/news" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>

      {news ? (
        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <form action={setNewsStatusAction}>
            <input type="hidden" name="id" value={news.id} />
            <input type="hidden" name="status" value="published" />
            <button type="submit" className="btn-secondary">
              Опубликовать
            </button>
          </form>
          <form action={setNewsStatusAction}>
            <input type="hidden" name="id" value={news.id} />
            <input type="hidden" name="status" value="archived" />
            <button type="submit" className="btn-secondary">
              В архив
            </button>
          </form>
          <ConfirmDeleteButton
            action={deleteNewsAction}
            id={news.id}
            confirmMessage="Удалить новость?"
          />
        </div>
      ) : null}
    </div>
  );
}
