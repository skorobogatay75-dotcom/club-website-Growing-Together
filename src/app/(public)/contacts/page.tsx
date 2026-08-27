import type { Metadata } from "next";
import Link from "next/link";
import { ContactGroups } from "@/components/public/ContactGroups";
import {
  getPublicContacts,
  hasAnyContact,
} from "@/features/home/queries";
import { getSettingMap } from "@/features/admin/settings/queries";
import { parseContactsSettings } from "@/features/admin/settings/parse";
import { publicTextOrNull } from "@/lib/content/public-text";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Как связаться с семейным клубом «Вместе растём».",
};

export const revalidate = 60;

export default async function ContactsPage() {
  const contacts = await getPublicContacts();
  const map = await getSettingMap();
  const messengers = parseContactsSettings(map);
  const telegram = publicTextOrNull(messengers.telegram);
  const max = publicTextOrNull(messengers.max);
  const vk = publicTextOrNull(messengers.vk);
  const showContacts = hasAnyContact(contacts);
  const showGroups = Boolean(telegram || max || vk);
  const show = showContacts || showGroups;

  return (
    <section className="section-space">
      <div className="container-page max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Контакты
        </h1>
        <p className="mt-4 text-muted">
          Актуальные данные берутся из настроек сайта. Карта появится только после
          согласования провайдера.
        </p>

        {show ? (
          <>
            {showContacts ? (
              <address className="mt-8 space-y-3 text-base not-italic text-foreground">
                {contacts.address ? <p>{contacts.address}</p> : null}
                {contacts.hours ? <p>{contacts.hours}</p> : null}
                {contacts.phone ? (
                  <p>
                    Телефон:{" "}
                    <a
                      className="text-accent hover:text-accent-hover"
                      href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}
                    >
                      {contacts.phone}
                    </a>
                  </p>
                ) : null}
                {contacts.email ? (
                  <p>
                    Email:{" "}
                    <a
                      className="text-accent hover:text-accent-hover"
                      href={`mailto:${contacts.email}`}
                    >
                      {contacts.email}
                    </a>
                  </p>
                ) : null}
              </address>
            ) : null}

            <ContactGroups telegram={telegram} max={max} vk={vk} />
          </>
        ) : (
          <p className="mt-8 rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 text-sm text-muted">
            Контакты ещё не опубликованы. Вы можете оставить заявку — мы свяжемся
            с вами сами.
          </p>
        )}

        <Link href="/apply" className="btn-primary mt-8 inline-flex">
          Записаться
        </Link>
      </div>
    </section>
  );
}
