/** benefits_json ↔ textarea helpers for membership plans */

export function benefitsFromText(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function benefitsToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => `- ${item.trim()}`)
    .join("\n");
}
