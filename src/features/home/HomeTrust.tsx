import Link from "next/link";
import Image from "next/image";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";
import type { TeamMember } from "@/types/database";

type Props = {
  members: TeamMember[];
};

export function HomeTrust({ members }: Props) {
  const visibleMembers = members.filter(
    (member) =>
      isPublicText(member.full_name) &&
      !/нужно\s+заполнить/i.test(member.full_name),
  );

  return (
    <section className="section-space border-b border-border bg-surface/60">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="relative min-h-[16rem] overflow-hidden rounded-[var(--radius-card)] shadow-soft sm:min-h-[22rem]">
          <Image
            src="/brand/team-founders.png"
            alt="Основатели семейного клуба «Вместе растём»"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-[center_20%]"
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Команда и доверие
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Клуб создан педагогами и руководителями школы с многолетним опытом.
            Мы бережно выстраиваем общение и понятный сценарий каждой встречи.
          </p>

          {visibleMembers.length > 0 ? (
            <ul className="mt-8 space-y-4">
              {visibleMembers.map((member) => {
                const role = publicTextOrNull(member.role_title);
                return (
                  <li key={member.id}>
                    <p className="font-semibold text-foreground">
                      {member.full_name}
                    </p>
                    {role ? <p className="text-sm text-muted">{role}</p> : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

          <Link href="/about" className="btn-secondary mt-8 inline-flex">
            О клубе
          </Link>
        </div>
      </div>
    </section>
  );
}
