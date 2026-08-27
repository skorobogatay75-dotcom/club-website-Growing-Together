import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedTeamMembers } from "@/features/home/queries";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";
import {
  ABOUT_AUDIENCES,
  ABOUT_EVENTS,
  ABOUT_FORMULA,
  ABOUT_HISTORY,
  ABOUT_INTRO,
  ABOUT_MEETING,
  ABOUT_MEMBERSHIP,
} from "@/features/about/content";

export const metadata: Metadata = {
  title: "О клубе",
  description:
    "История, программа и команда семейного клуба «Вместе растём».",
};

export const revalidate = 60;

export default async function AboutPage() {
  const members = (await getPublishedTeamMembers()).filter((member) =>
    isPublicText(member.full_name),
  );

  return (
    <div>
      <section className="section-space border-b border-border">
        <div className="container-page max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            О клубе
          </h1>
          {ABOUT_INTRO.map((paragraph) => (
            <p key={paragraph} className="mt-5 text-lg text-muted">
              {paragraph}
            </p>
          ))}
          <p className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 text-base font-semibold text-foreground">
            {ABOUT_FORMULA}
          </p>
        </div>
      </section>

      <section
        id="history"
        className="section-space border-b border-border bg-surface/50"
      >
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground">
            История клуба
          </h2>
          {ABOUT_HISTORY.map((paragraph) => (
            <p key={paragraph} className="mt-5 text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section id="program" className="section-space border-b border-border">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground">
            Программа клуба
          </h2>
          <p className="mt-4 text-muted">
            Для каждой семьи — своя задача и общий финал.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-foreground">
            Для кого наш клуб
          </h3>
          <ul className="mt-5 grid gap-4">
            {ABOUT_AUDIENCES.map((item) => (
              <li
                key={item.subtitle}
                className="rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4"
              >
                <p className="text-sm font-medium text-accent">{item.subtitle}</p>
                <p className="mt-1 font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm text-muted">{item.lead}</p>
                <p className="mt-2 text-sm text-muted">{item.format}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-12 text-xl font-semibold text-foreground">
            Как проходит встреча
          </h3>
          <p className="mt-3 text-muted">{ABOUT_MEETING.intro}</p>
          <p className="mt-2 text-sm text-muted">Формат — 2 часа.</p>
          <ol className="mt-6 space-y-5">
            {ABOUT_MEETING.steps.map((step, index) => (
              <li key={step.title}>
                <p className="font-semibold text-foreground">
                  <span className="mr-2 tabular-nums text-accent-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step.title}
                </p>
                {"children" in step ? (
                  <>
                    <p className="mt-2 text-muted">
                      <strong className="text-foreground">Дети.</strong>{" "}
                      {step.children}
                    </p>
                    <p className="mt-2 text-muted">
                      <strong className="text-foreground">Родители.</strong>{" "}
                      {step.parents}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-muted">{step.text}</p>
                )}
              </li>
            ))}
          </ol>

          <h3 className="mt-12 text-xl font-semibold text-foreground">
            Членство в клубе
          </h3>
          <p className="mt-3 text-muted">
            После первого цикла семьи могут присоединиться к сообществу.
            Семейный абонемент включает:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {ABOUT_MEMBERSHIP.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href="/membership" className="btn-secondary mt-6 inline-flex">
            Подробнее о членстве
          </Link>

          <h3 className="mt-12 text-xl font-semibold text-foreground">
            Специальные мероприятия
          </h3>
          <p className="mt-3 text-muted">
            Чтобы знакомство с нами было лёгким и интересным, мы регулярно
            проводим открытые события:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {ABOUT_EVENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-5 text-muted">
            Присоединяйтесь к ближайшему открытому квизу. Расписание — в{" "}
            <Link
              href="/events"
              className="font-medium text-accent hover:text-accent-hover"
            >
              календаре
            </Link>
            , заявка — через{" "}
            <Link
              href="/apply"
              className="font-medium text-accent hover:text-accent-hover"
            >
              форму записи
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section-space border-b border-border bg-surface/50">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[18rem] overflow-hidden rounded-[var(--radius-card)] shadow-soft sm:min-h-[24rem]">
            <Image
              src="/brand/team-founders.png"
              alt="Команда семейного клуба «Вместе растём»"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[center_20%]"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Команда</h2>
            <p className="mt-3 text-muted">
              Мы опираемся на многолетний педагогический опыт и бережное
              общение. Подробные биографии публикуются только после заполнения в
              админ-панели.
            </p>
            {members.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {members.map((member) => {
                  const role = publicTextOrNull(member.role_title);
                  const bio = publicTextOrNull(member.bio);
                  return (
                    <li key={member.id}>
                      <p className="font-semibold text-foreground">
                        {member.full_name}
                      </p>
                      {role ? <p className="text-sm text-muted">{role}</p> : null}
                      {bio ? <p className="mt-2 text-sm text-muted">{bio}</p> : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground">
            Принципы безопасного общения
          </h2>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-muted">
            <li>Уважение к границам ребёнка и взрослого</li>
            <li>Понятные правила встречи без давления и искусственного дефицита</li>
            <li>Бережная обратная связь вместо оценок и сравнений</li>
          </ul>
          <Link href="/apply" className="btn-primary mt-8 inline-flex">
            Записаться
          </Link>
        </div>
      </section>
    </div>
  );
}
