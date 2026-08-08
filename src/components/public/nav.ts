export const SITE_NAV = [
  { href: "/about", label: "О клубе" },
  { href: "/programs", label: "Программы" },
  { href: "/membership", label: "Членство" },
  { href: "/events", label: "Календарь" },
  { href: "/news", label: "Новости" },
  { href: "/gallery", label: "Фоторепортажи" },
  { href: "/documents", label: "Документы" },
] as const;

export type SiteNavItem = (typeof SITE_NAV)[number];
