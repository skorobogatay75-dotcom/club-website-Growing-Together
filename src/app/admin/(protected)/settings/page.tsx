import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import {
  getSettingMap,
  parseClubSettings,
  parseContactsSettings,
} from "@/features/admin/settings/queries";
import {
  saveClubSettingsAction,
  saveContactsSettingsAction,
} from "@/features/admin/settings/actions";
import { AdminFlash, AdminPageHeader, Field } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Настройки" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const map = await getSettingMap();
  const club = parseClubSettings(map);
  const contacts = parseContactsSettings(map);

  const ok = first(params.ok);
  const error = first(params.error);
  const flash =
    ok === "club"
      ? "Настройки клуба сохранены."
      : ok === "contacts"
        ? "Контакты сохранены."
        : error
          ? `Ошибка: ${decodeURIComponent(error)}`
          : null;

  return (
    <div className="space-y-12">
      <AdminPageHeader
        title="Настройки"
        description="Контакты и данные клуба. Секреты (API-ключи, пароли) здесь не хранятся."
      />
      <AdminFlash message={flash} tone={error ? "error" : "ok"} />

      <section className="max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold">Клуб</h2>
        <form action={saveClubSettingsAction} className="space-y-4">
          <Field label="Название">
            <input className="field-input" name="name" required defaultValue={club.name} />
          </Field>
          <Field label="Слоган">
            <input className="field-input" name="tagline" defaultValue={club.tagline} />
          </Field>
          <Field label="Часовой пояс" hint="Например Europe/Moscow">
            <input className="field-input" name="timezone" defaultValue={club.timezone} />
          </Field>
          <button type="submit" className="btn-primary">
            Сохранить клуб
          </button>
        </form>
      </section>

      <section className="max-w-2xl space-y-4 border-t border-border pt-10">
        <h2 className="text-lg font-semibold">Публичные контакты</h2>
        <p className="text-sm text-muted">
          Пустые поля не показываются на сайте. Не вводите «НУЖНО ЗАПОЛНИТЬ».
        </p>
        <form action={saveContactsSettingsAction} className="space-y-4">
          <Field label="Адрес">
            <input className="field-input" name="address" defaultValue={contacts.address} />
          </Field>
          <Field label="Телефон">
            <input className="field-input" name="phone" defaultValue={contacts.phone} />
          </Field>
          <Field label="Email">
            <input
              className="field-input"
              type="email"
              name="email"
              defaultValue={contacts.email}
            />
          </Field>
          <Field label="Часы работы">
            <input className="field-input" name="hours" defaultValue={contacts.hours} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telegram">
              <input
                className="field-input"
                name="telegram"
                defaultValue={contacts.telegram}
                placeholder="@username или ссылка"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                className="field-input"
                name="whatsapp"
                defaultValue={contacts.whatsapp}
                placeholder="+7…"
              />
            </Field>
          </div>
          <button type="submit" className="btn-primary">
            Сохранить контакты
          </button>
        </form>
      </section>

      <section className="max-w-2xl space-y-3 border-t border-border pt-10 text-sm text-muted">
        <h2 className="text-lg font-semibold text-foreground">Связанные разделы</h2>
        <p>
          Состав команды редактируется в{" "}
          <Link href="/admin/team" className="font-medium text-accent underline">
            /admin/team
          </Link>
          .
        </p>
        <p>
          Новых сотрудников админки создавайте в Supabase Auth, затем добавьте запись в{" "}
          <code className="rounded bg-surface-soft px-1">profiles</code> с ролью{" "}
          <code className="rounded bg-surface-soft px-1">admin</code> или{" "}
          <code className="rounded bg-surface-soft px-1">editor</code>.
        </p>
      </section>
    </div>
  );
}
