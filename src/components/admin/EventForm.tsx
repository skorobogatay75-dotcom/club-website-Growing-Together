import Link from "next/link";
import {
  saveEventAction,
  deleteEventAction,
  setEventStatusAction,
} from "@/features/admin/events/actions";
import { isoToLocalInput } from "@/lib/admin/datetime";
import { contentJsonToText } from "@/lib/admin/content-json";
import { Field } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { AgeCategory, Event, Program } from "@/types/database";

type Props = {
  event?: Event | null;
  categories: AgeCategory[];
  programs: Pick<Program, "id" | "title">[];
};

export function EventForm({ event, categories, programs }: Props) {
  return (
    <div className="space-y-8">
      <form action={saveEventAction} className="space-y-5" encType="multipart/form-data">
        {event ? <input type="hidden" name="id" value={event.id} /> : null}
        <input type="hidden" name="cover_path" value={event?.cover_path ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Название">
            <input className="field-input" name="title" required defaultValue={event?.title ?? ""} />
          </Field>
          <Field label="Slug">
            <input className="field-input" name="slug" defaultValue={event?.slug ?? ""} />
          </Field>
          <Field label="Начало">
            <input
              className="field-input"
              type="datetime-local"
              name="starts_at"
              required
              defaultValue={isoToLocalInput(event?.starts_at)}
            />
          </Field>
          <Field label="Окончание">
            <input
              className="field-input"
              type="datetime-local"
              name="ends_at"
              required
              defaultValue={isoToLocalInput(event?.ends_at)}
            />
          </Field>
          <Field label="Часовой пояс">
            <input
              className="field-input"
              name="timezone"
              defaultValue={event?.timezone ?? "Europe/Moscow"}
            />
          </Field>
          <Field label="Место">
            <input className="field-input" name="venue" defaultValue={event?.venue ?? ""} />
          </Field>
          <Field label="Программа">
            <select className="field-input" name="program_id" defaultValue={event?.program_id ?? ""}>
              <option value="">Не привязано</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Возраст">
            <select
              className="field-input"
              name="age_category_id"
              defaultValue={event?.age_category_id ?? ""}
            >
              <option value="">Не выбрано</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Аудитория">
            <select className="field-input" name="audience_type" defaultValue={event?.audience_type ?? "family"}>
              <option value="family">family</option>
              <option value="children">children</option>
              <option value="parents">parents</option>
              <option value="mixed">mixed</option>
            </select>
          </Field>
          <Field label="Формат">
            <select className="field-input" name="format" defaultValue={event?.format ?? "workshop"}>
              <option value="workshop">workshop</option>
              <option value="quiz">quiz</option>
              <option value="game">game</option>
              <option value="meeting">meeting</option>
              <option value="other">other</option>
            </select>
          </Field>
          <Field label="Регистрация">
            <select
              className="field-input"
              name="registration_status"
              defaultValue={event?.registration_status ?? "open"}
            >
              <option value="open">open</option>
              <option value="closed">closed</option>
              <option value="waitlist">waitlist</option>
              <option value="cancelled">cancelled</option>
            </select>
          </Field>
          <Field label="Публикация">
            <select className="field-input" name="status" defaultValue={event?.status ?? "draft"}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
          <Field label="Вместимость">
            <input
              className="field-input"
              type="number"
              min={0}
              name="capacity"
              defaultValue={event?.capacity ?? ""}
            />
          </Field>
          <Field label="Стоимость">
            <input className="field-input" name="price_text" defaultValue={event?.price_text ?? ""} />
          </Field>
        </div>

        <Field label="Анонс">
          <textarea className="field-input min-h-20" name="excerpt" defaultValue={event?.excerpt ?? ""} />
        </Field>
        <Field
          label="Описание"
          hint="## / ### / - список. Ссылка: [текст](https://сайт.ru)"
        >
          <textarea
            className="field-input min-h-36 font-mono text-sm"
            name="content"
            defaultValue={contentJsonToText(event?.content_json)}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={event?.featured ?? false} />
          Избранное
        </label>

        <Field label="Обложка">
          <input className="field-input" type="file" name="cover" accept="image/jpeg,image/png,image/webp" />
        </Field>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            {event ? "Сохранить" : "Создать"}
          </button>
          <Link href="/admin/events" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>

      {event ? (
        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <form action={setEventStatusAction}>
            <input type="hidden" name="id" value={event.id} />
            <input type="hidden" name="status" value="published" />
            <button type="submit" className="btn-secondary">
              Опубликовать
            </button>
          </form>
          <form action={setEventStatusAction}>
            <input type="hidden" name="id" value={event.id} />
            <input type="hidden" name="registration_status" value="cancelled" />
            <button type="submit" className="btn-secondary">
              Отменить событие
            </button>
          </form>
          <form action={setEventStatusAction}>
            <input type="hidden" name="id" value={event.id} />
            <input type="hidden" name="status" value="archived" />
            <button type="submit" className="btn-secondary">
              В архив
            </button>
          </form>
          <ConfirmDeleteButton
            action={deleteEventAction}
            id={event.id}
            confirmMessage="Удалить событие?"
          />
        </div>
      ) : null}
    </div>
  );
}
