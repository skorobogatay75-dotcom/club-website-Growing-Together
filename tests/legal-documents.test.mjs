import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("legal document matching", async () => {
  const mod = await import(
    pathToFileURL(join(root, "src/features/documents/legal.ts")).href
  );

  const docs = [
    {
      title: "Политика конфиденциальности",
      public_filename: "Политика конфиденицальности.pdf",
      storage_path: "privacy.pdf",
      updated_at: "2026-08-28T10:00:00Z",
      sort_order: 10,
    },
    {
      title: "Согласие на обработку персональных данных",
      public_filename: "Согласие_на_обработку_персональных_данных.pdf",
      storage_path: "consent.pdf",
      updated_at: "2026-08-28T10:00:00Z",
      sort_order: 20,
    },
    {
      title: "Публичная оферта на заключение договора оказания услуг",
      public_filename: "offer-old.pdf",
      storage_path: "offer-old.pdf",
      updated_at: "2026-08-01T10:00:00Z",
      sort_order: 30,
    },
    {
      title: "Оферта информационный продукт",
      public_filename: "Оферта информационный продукт.pdf",
      storage_path: "offer-product.pdf",
      updated_at: "2026-08-28T12:00:00Z",
      sort_order: 40,
    },
  ];

  it("picks privacy, consent and latest offer", () => {
    assert.equal(mod.pickLegalDocument(docs, "privacy")?.title, docs[0].title);
    assert.equal(mod.pickLegalDocument(docs, "consent")?.title, docs[1].title);
    assert.equal(mod.pickLegalDocument(docs, "offer")?.title, docs[3].title);
  });

  it("returns null when nothing matches", () => {
    assert.equal(mod.pickLegalDocument([], "privacy"), null);
  });
});
