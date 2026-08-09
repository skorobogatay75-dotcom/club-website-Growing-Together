import Link from "next/link";
import Image from "next/image";
import { SiteLogo } from "@/components/public/SiteLogo";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[calc(100dvh-4.25rem)] overflow-hidden">
      <Image
        src="/brand/hero-family.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-center"
      />
      {/* Читаемость текста слева, семья справа почти без вуали */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(105deg,rgb(var(--hero-veil)_/_92%)_0%,rgb(var(--hero-veil)_/_78%)_34%,rgb(var(--hero-veil)_/_28%)_58%,rgb(var(--hero-veil)_/_0%)_78%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(47_41_38_/_12%)_0%,transparent_28%)]"
      />

      <div className="container-page relative flex min-h-[calc(100dvh-4.25rem)] items-center py-16 lg:py-20">
        <div className="max-w-xl">
          <div className="animate-fade-up">
            <SiteLogo size="lg" />
          </div>

          <h1 className="sr-only">Вместе растём — семейный клуб</h1>

          <p className="mt-8 max-w-md animate-fade-up text-lg text-muted [animation-delay:120ms] sm:text-xl sm:leading-relaxed">
            Игровые мастер-классы и развивающие встречи: родители и дети
            занимаются параллельно — тема одна, содержание под возраст.
          </p>

          <div className="mt-9 flex flex-wrap gap-3 animate-fade-up [animation-delay:220ms]">
            <Link href="/programs" className="btn-primary">
              Выбрать программу
            </Link>
            <Link href="/#calendar" className="btn-secondary">
              Календарь событий
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
