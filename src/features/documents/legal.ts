export const legalDocumentKinds = ["privacy", "consent", "offer"] as const;

export type LegalDocumentKind = (typeof legalDocumentKinds)[number];

export type LegalDocumentCandidate = {
  title: string;
  public_filename: string;
  storage_path: string;
  updated_at: string;
  sort_order: number;
};

function haystack(doc: LegalDocumentCandidate): string {
  return [doc.title, doc.public_filename, doc.storage_path]
    .join(" ")
    .toLowerCase()
    .replace(/ё/g, "е");
}

function matchesKind(text: string, kind: LegalDocumentKind): boolean {
  switch (kind) {
    case "privacy":
      return text.includes("политик") || text.includes("конфиден");
    case "consent":
      return (
        text.includes("согласи") &&
        !text.includes("политик") &&
        !text.includes("оферт")
      );
    case "offer":
      return text.includes("оферт");
  }
}

export function pickLegalDocument<T extends LegalDocumentCandidate>(
  documents: T[],
  kind: LegalDocumentKind,
): T | null {
  const matches = documents.filter((doc) => matchesKind(haystack(doc), kind));
  if (matches.length === 0) return null;

  return [...matches].sort((a, b) => {
    const updated = b.updated_at.localeCompare(a.updated_at);
    if (updated !== 0) return updated;
    return a.sort_order - b.sort_order;
  })[0];
}
