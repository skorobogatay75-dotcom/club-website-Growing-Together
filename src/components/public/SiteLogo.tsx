import Link from "next/link";
import Image from "next/image";

type Props = {
  className?: string;
  /** Крупный логотип для hero / первого экрана */
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const SIZES = {
  sm: {
    mark: 56,
    word: "text-lg sm:text-xl",
    gap: "gap-3",
    tag: "mt-0.5 text-[0.75rem] font-medium tracking-[0.04em] text-muted",
  },
  md: {
    mark: 72,
    word: "text-xl sm:text-2xl",
    gap: "gap-3.5",
    tag: "mt-1 text-sm font-medium tracking-[0.04em] text-muted",
  },
  lg: {
    mark: 128,
    word: "text-4xl sm:text-5xl lg:text-[3.25rem]",
    gap: "gap-4 sm:gap-5 lg:gap-6",
    tag: "mt-2 text-base font-medium tracking-[0.08em] text-muted sm:text-lg",
  },
} as const;

export function SiteLogo({
  className = "",
  size = "sm",
  showWordmark = true,
}: Props) {
  const s = SIZES[size];
  const markHeight = Math.round(s.mark * (699 / 787));

  return (
    <Link
      href="/"
      className={`group inline-flex items-center ${s.gap} rounded-[var(--radius-button)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring ${className}`}
      aria-label="Вместе растём — на главную"
    >
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={s.mark}
        height={markHeight}
        className="shrink-0 object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] group-hover:-rotate-1"
        priority={size === "lg"}
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
            <span className={s.tag}>Семейный клуб</span>
          ) : null}
          {size === "lg" ? (
            <span className={s.tag}>пространство для семьи</span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
