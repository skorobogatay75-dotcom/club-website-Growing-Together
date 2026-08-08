import Link from "next/link";
import Image from "next/image";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[calc(100dvh-4.25rem)] overflow-hidden border-b border-border">
      <Image
        src="/brand/team-founders.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_18%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(105deg,rgb(255_243_234_/_92%)_0%,rgb(255_243_234_/_78%)_42%,rgb(255_243_234_/_28%)_70%,rgb(47_41_38_/_18%)_100%)]"
      />

      <div className="container-page relative flex min-h-[calc(100dvh-4.25rem)] items-center py-16 lg:py-20">
        <div className="max-w-xl animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-secondary">
            Семейный клуб
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
            Вместе растём
          </h1>
          <p className="mt-5 text-lg text-muted">
            Игровые мастер-классы, квизы и развивающие встречи: родители и дети
            занимаются параллельно — тема одна, содержание адаптировано под
            возраст.
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
      </div>
    </section>
  );
}
