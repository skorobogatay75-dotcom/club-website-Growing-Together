import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedTeamMembers } from "@/features/home/queries";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";

export const metadata: Metadata = {
  title: "О клубе",
  description:
    "Миссия, формат встреч и команда семейного клуба «Вместе растём».",
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
          <p className="mt-5 text-lg text-muted">
            «Вместе растём» — семейный клуб, созданный педагогами и
            руководителями общеобразовательной школы. Мы проводим игровые
            мастер-классы, квизы и развивающие встречи в спокойной и безопасной
            атмосфере.
          </p>
        </div>
      </section>

      <section className="section-space border-b border-border bg-surface/50">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground">
            Как проходит встреча
          </h2>
          <ol className="mt-6 space-y-4 text-muted">
            <li>
              <strong className="text-foreground">Общий старт.</strong> Семья
              собирается вместе и знакомится с темой встречи.
            </li>
            <li>
              <strong className="text-foreground">Две аудитории.</strong> Дети и
              родители занимаются параллельно: тема одна, задачи адаптированы
              под возраст.
            </li>
            <li>
              <strong className="text-foreground">Общий финал.</strong> Можно
              обменяться впечатлениями и унести общий семейный опыт.
            </li>
          </ol>
        </div>
      </section>

      <section className="section-space border-b border-border">
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
