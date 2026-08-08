import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--brand-powder)_80%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_left,color-mix(in_srgb,var(--brand-turquoise)_22%,transparent),transparent_50%)]"
        />
        <div className="container-page relative grid min-h-[calc(100dvh-4.25rem)] items-center gap-10 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-secondary">
              Семейный клуб
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Вместе растём
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Игровые мастер-классы, квизы и развивающие встречи: родители и
              дети занимаются параллельно — тема одна, содержание адаптировано
              под возраст.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/programs" className="btn-primary">
                Выбрать программу
              </Link>
              <Link href="/events" className="btn-secondary">
                Ближайшие события
              </Link>
            </div>
          </div>

          <div className="relative min-h-[18rem] overflow-hidden rounded-[var(--radius-card)] bg-surface-soft shadow-soft lg:min-h-[26rem]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand-turquoise)_28%,white),color-mix(in_srgb,var(--brand-powder)_70%,white)_45%,color-mix(in_srgb,var(--brand-honey)_25%,white))]"
            />
            <div className="relative flex h-full min-h-[18rem] flex-col justify-end p-6 sm:p-8 lg:min-h-[26rem]">
              <p className="max-w-sm text-base font-medium text-foreground">
                Одна тема — два адаптированных формата — общий семейный опыт.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Сайт в сборке
          </h2>
          <p className="mt-4 text-muted">
            Сейчас подключены дизайн-токены, публичный каркас и маршруты.
            Новости, календарь, программы и заявки появятся после подключения
            базы данных и админ-панели — без выдуманных контактов и цен.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["О клубе", "/about"],
              ["Программы", "/programs"],
              ["Календарь событий", "/events"],
              ["Записаться", "/apply"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-11 items-center rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-soft"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
