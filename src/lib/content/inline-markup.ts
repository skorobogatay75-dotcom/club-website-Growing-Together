export type InlinePart =
  | { type: "text"; value: string }
  | { type: "link"; text: string; href: string };

/** Только http/https — без javascript:, data: и т.п. */
export function isSafeHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const BARE_URL_PATTERN = /https?:\/\/[^\s<>[\]"']+/g;

function parseBareUrls(text: string): InlinePart[] {
  if (!text) return [];

  const parts: InlinePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  BARE_URL_PATTERN.lastIndex = 0;
  while ((match = BARE_URL_PATTERN.exec(text)) !== null) {
    const href = match[0].trim();
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (isSafeHttpUrl(href)) {
      parts.push({ type: "link", text: href, href });
    } else {
      parts.push({ type: "text", value: href });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

/**
 * Разбирает `[текст](https://...)` и голые https://... в части для безопасного рендера.
 * Небезопасные URL остаются обычным текстом.
 */
export function parseInlineMarkup(input: string): InlinePart[] {
  const text = input ?? "";
  if (!text) return [];

  const parts: InlinePart[] = [];
  MARKDOWN_LINK_PATTERN.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MARKDOWN_LINK_PATTERN.exec(text)) !== null) {
    const [full, label, hrefRaw] = match;
    if (match.index > lastIndex) {
      parts.push(...parseBareUrls(text.slice(lastIndex, match.index)));
    }

    const href = hrefRaw.trim();
    const linkText = label.trim();
    if (linkText && isSafeHttpUrl(href)) {
      parts.push({ type: "link", text: linkText, href });
    } else {
      parts.push({ type: "text", value: full });
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(...parseBareUrls(text.slice(lastIndex)));
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}
