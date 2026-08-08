export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[] };

/**
 * Простой безопасный редактор: текст → content_json.
 * ## заголовок, ### подзаголовок, - пункт списка, иначе абзац.
 */
export function textToContentJson(raw: string): ContentBlock[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      flushParagraph();
      blocks.push({ type: "heading", level: 3, text: trimmed.slice(4).trim() });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      flushParagraph();
      blocks.push({ type: "heading", level: 2, text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2).trim());
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }

  flushList();
  flushParagraph();
  return blocks;
}

export function contentJsonToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const lines: string[] = [];
  for (const block of value) {
    if (!block || typeof block !== "object") continue;
    const item = block as Record<string, unknown>;
    if (item.type === "heading" && typeof item.text === "string") {
      lines.push(`${item.level === 3 ? "###" : "##"} ${item.text}`);
      lines.push("");
      continue;
    }
    if (item.type === "list" && Array.isArray(item.items)) {
      for (const entry of item.items) {
        if (typeof entry === "string" && entry.trim()) {
          lines.push(`- ${entry.trim()}`);
        }
      }
      lines.push("");
      continue;
    }
    if (typeof item.text === "string" && item.text.trim()) {
      lines.push(item.text.trim());
      lines.push("");
    }
  }
  return lines.join("\n").trim();
}
