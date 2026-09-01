import Link from "next/link";
import { SiteLogo } from "./SiteLogo";
import { SITE_NAV } from "./nav";
import {
  hasAnyContact,
  type PublicContacts,
} from "@/features/home/queries";

type Props = {
  contacts: PublicContacts;
};

export function SiteFooter({ contacts }: Props) {
  const year = new Date().getFullYear();
  const showContacts = hasAnyContact(contacts);

  return (
    <footer className="border-t border-border bg-surface-soft/60">
      <div className="container-page section-space grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="max-w-sm">
          <SiteLogo />
          <p className="mt-4 text-sm text-muted">
            Семейный клуб для совместных встреч родителей и детей: одна тема,
            два адаптированных формата, общий семейный опыт.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Разделы
          </h2>
          <ul className="mt-4 space-y-2">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Информация
          </h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/contacts"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Контакты
              </Link>
            </li>
            <li>
              <Link
                href="/apply"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Записаться
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link
                href="/consent"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Согласие на обработку данных
              </Link>
            </li>
            <li>
              <Link
                href="/offer"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Оферта
              </Link>
            </li>
          </ul>

          {showContacts ? (
            <address className="mt-6 space-y-1 text-sm not-italic text-muted">
              {contacts.address ? <p>{contacts.address}</p> : null}
              {contacts.hours ? <p>{contacts.hours}</p> : null}
              {contacts.phone ? (
                <p>
                  <a
                    href={`tel:${contacts.phone.replace(/[^\d+]/g, "")}`}
                    className="hover:text-foreground"
                  >
                    {contacts.phone}
                  </a>
                </p>
              ) : null}
              {contacts.email ? (
                <p>
                  <a
                    href={`mailto:${contacts.email}`}
                    className="hover:text-foreground"
                  >
                    {contacts.email}
                  </a>
                </p>
              ) : null}
            </address>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Контактные данные появятся после заполнения настроек сайта.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Вместе растём</p>
          <p>Контент управляется через защищённую админ-панель</p>
        </div>
      </div>
    </footer>
  );
}
