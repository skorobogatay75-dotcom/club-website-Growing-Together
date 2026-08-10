import Link from "next/link";
import { BrandMark } from "./BrandMark";

type Props = {
  className?: string;
  /** Крупный логотип для hero / первого экрана */
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const SIZES = {
  sm: { mark: 40, word: "text-base sm:text-lg", gap: "gap-2.5" },
  md: { mark: 52, word: "text-lg sm:text-xl", gap: "gap-3" },
  lg: { mark: 64, word: "text-2xl sm:text-3xl lg:text-[2.75rem]", gap: "gap-3 sm:gap-4 lg:gap-5" },
} as const;

export function SiteLogo({
  className = "",
  size = "sm",
  showWordmark = true,
}: Props) {
  const s = SIZES[size];

  return (
    <Link
      href="/"
      className={`group inline-flex items-center ${s.gap} rounded-[var(--radius-button)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring ${className}`}
      aria-label="Вместе растём — на главную"
    >
      <BrandMark
        size={s.mark}
        className="shrink-0 transition-transform duration-500 ease-out group-hover:scale-[1.04] group-hover:-rotate-1"
      />
      {showWordmark ? (
        <span className="flex flex-col leading-[1.05]">
          <span
            className={`font-semibold tracking-tight text-foreground ${s.word}`}
          >
            Вместе
          </span>
          <span
            className={`font-semibold tracking-tight text-accent ${s.word}`}
          >
            растём
          </span>
          {size === "sm" ? (
            <span className="mt-0.5 text-[0.7rem] font-medium tracking-[0.04em] text-muted">
              Семейный клуб
            </span>
          ) : null}
          {size === "lg" ? (
            <span className="mt-2 text-sm font-medium tracking-[0.08em] text-muted sm:text-base">
              пространство для семьи
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
