import Link from "next/link";
import Image from "next/image";
import { SiteLogo } from "@/components/public/SiteLogo";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[calc(100dvh-4.25rem)] overflow-hidden">
      <Image
        src="/brand/team-founders.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="animate-hero-ken object-cover object-[center_18%] scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgb(255_243_234_/_94%)_0%,rgb(255_243_234_/_78%)_38%,rgb(242_216_201_/_35%)_62%,rgb(47_41_38_/_28%)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply [background-image:radial-gradient(circle_at_1px_1px,rgb(168_86_69_/_18%)_1px,transparent_0)] [background-size:18px_18px]"
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

          <div
            aria-hidden="true"
            className="mt-12 flex items-center gap-3 animate-fade-up [animation-delay:320ms]"
          >
            <span className="h-px w-10 bg-accent-warm/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent-secondary" />
            <span className="h-px w-16 bg-accent/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
