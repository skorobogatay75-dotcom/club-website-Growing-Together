import {
  messengerHref,
  type MessengerKind,
} from "@/lib/content/messenger-link";

const GROUPS: Array<{ kind: MessengerKind; label: string }> = [
  { kind: "telegram", label: "Telegram" },
  { kind: "max", label: "MAX" },
  { kind: "vk", label: "ВКонтакте" },
];

type Props = {
  telegram: string | null;
  max: string | null;
  vk: string | null;
};

export function ContactGroups({ telegram, max, vk }: Props) {
  const values = { telegram, max, vk };
  const items = GROUPS.flatMap((group) => {
    const value = values[group.kind];
    if (!value) return [];
    const href = messengerHref(group.kind, value);
    if (!href) return [];
    return [{ ...group, href }];
  });

  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Группы для общения
      </h2>
      <p className="mt-2 text-muted">
        Присоединяйтесь к семейным чатам в Telegram, MAX и ВКонтакте.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.kind}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 shadow-soft transition-colors hover:border-accent-secondary/60 hover:bg-surface-soft"
            >
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-accent">Перейти в группу</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
