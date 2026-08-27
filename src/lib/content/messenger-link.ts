export type MessengerKind = "telegram" | "max" | "vk";

function httpsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function withHttps(value: string): string | null {
  return httpsUrl(`https://${value.replace(/^\/\//, "")}`);
}

/**
 * Строит безопасную ссылку на группу. Если значение нельзя превратить
 * в http(s)-URL, возвращает null — текст всё равно можно показать.
 */
export function messengerHref(
  kind: MessengerKind,
  raw: string | null | undefined,
): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return httpsUrl(value);

  if (/^(?:t\.me|telegram\.me|telegram\.dog)\//i.test(value)) {
    return withHttps(value);
  }
  if (/^(?:m\.)?vk\.(?:com|ru)\//i.test(value)) {
    return withHttps(value);
  }
  if (/^(?:web\.)?max\.ru\//i.test(value)) {
    return withHttps(value);
  }

  if (kind === "telegram") {
    const username = value.replace(/^@/, "");
    if (/^[A-Za-z0-9_]{3,}$/.test(username)) {
      return `https://t.me/${username}`;
    }
  }

  if (kind === "vk") {
    const slug = value.replace(/^@/, "").replace(/^\/+/, "");
    if (/^[A-Za-z0-9._/]+$/.test(slug)) {
      return `https://vk.com/${slug}`;
    }
  }

  return null;
}
