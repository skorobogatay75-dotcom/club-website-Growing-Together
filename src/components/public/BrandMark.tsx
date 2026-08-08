type Props = {
  className?: string;
  size?: number;
};

/** Марка «Дом и объятие» из фирменного стиля клуба. */
export function BrandMark({ className = "", size = 40 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M28 42 L48 24 L68 42"
        stroke="var(--brand-terracotta)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 40 V68 H64 V40"
        stroke="var(--brand-terracotta)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="46" r="6.5" fill="var(--brand-honey)" />
      <path
        d="M36 62 C40 54 56 54 60 62"
        stroke="var(--brand-honey)"
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 78 C34 88 62 88 74 78"
        stroke="var(--brand-turquoise)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
