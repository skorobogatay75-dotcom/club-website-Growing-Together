import Link from "next/link";

export function HomeApplyCta() {
  return (
    <section className="section-space">
      <div className="container-page">
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-powder)_70%,white),color-mix(in_srgb,var(--brand-turquoise)_18%,white))] px-6 py-10 sm:px-10">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Готовы присоединиться?
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Оставьте короткую заявку — мы свяжемся с вами, чтобы уточнить
            детали и подобрать подходящую встречу.
          </p>
          <Link href="/apply" className="btn-primary mt-8 inline-flex">
            Записаться
          </Link>
        </div>
      </div>
    </section>
  );
}
