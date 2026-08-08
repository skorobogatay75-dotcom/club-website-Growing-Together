const STEPS = [
  {
    title: "Одна тема",
    text: "Семья приходит на общую встречу с понятным смыслом и спокойной атмосферой.",
  },
  {
    title: "Два адаптированных формата",
    text: "Дети и родители занимаются параллельно в двух аудиториях — содержание подобрано по возрасту.",
  },
  {
    title: "Общий семейный опыт",
    text: "В финале можно обменяться впечатлениями и унести домой общий результат встречи.",
  },
] as const;

export function HomeFormatSchema() {
  return (
    <section className="section-space border-b border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-turquoise)_10%,transparent),transparent)]">
      <div className="container-page">
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Одна тема — два формата — общий опыт
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Так устроены встречи клуба: рядом, но с задачами, которые подходят
          каждому возрасту.
        </p>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent-secondary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
