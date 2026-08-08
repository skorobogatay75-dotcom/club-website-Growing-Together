import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify } from "../src/lib/admin/slug.ts";
import {
  contentJsonToText,
  textToContentJson,
} from "../src/lib/admin/content-json.ts";
import { benefitsFromText, benefitsToText } from "../src/lib/admin/benefits.ts";
import {
  isoToLocalInput,
  localInputToIso,
} from "../src/lib/admin/datetime.ts";

describe("admin slugify", () => {
  it("transliterates cyrillic", () => {
    assert.equal(slugify("Вместе растём"), "vmeste-rastem");
  });

  it("collapses separators and trims", () => {
    assert.equal(slugify("  Hello__World!!  "), "hello-world");
  });
});

describe("content-json", () => {
  it("parses headings lists and paragraphs", () => {
    const blocks = textToContentJson(
      "## Заголовок\n\nАбзац один.\n\n- пункт А\n- пункт Б\n\n### Подзаголовок",
    );
    assert.deepEqual(blocks, [
      { type: "heading", level: 2, text: "Заголовок" },
      { type: "paragraph", text: "Абзац один." },
      { type: "list", items: ["пункт А", "пункт Б"] },
      { type: "heading", level: 3, text: "Подзаголовок" },
    ]);
  });

  it("round-trips to text", () => {
    const raw = "## Title\n\nHello\n\n- one\n- two";
    const again = contentJsonToText(textToContentJson(raw));
    assert.match(again, /## Title/);
    assert.match(again, /- one/);
    assert.match(again, /- two/);
  });
});

describe("benefits helpers", () => {
  it("parses bullet lines", () => {
    assert.deepEqual(benefitsFromText("- a\nb\n* c"), ["a", "b", "c"]);
  });

  it("formats benefits back", () => {
    assert.equal(benefitsToText(["a", "b"]), "- a\n- b");
  });
});

describe("datetime helpers", () => {
  it("converts local input to iso and back", () => {
    const iso = localInputToIso("2026-08-08T15:30");
    assert.ok(iso);
    assert.match(iso, /2026-08-08T/);
    const local = isoToLocalInput(iso);
    assert.match(local, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("rejects empty and invalid", () => {
    assert.equal(localInputToIso(""), null);
    assert.equal(localInputToIso("not-a-date"), null);
    assert.equal(isoToLocalInput(null), "");
  });
});

describe("media mime guards (pure)", () => {
  it("accepts jpeg png webp only for images", () => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    assert.equal(allowed.has("image/jpeg"), true);
    assert.equal(allowed.has("image/heic"), false);
    assert.equal(allowed.has("application/pdf"), false);
  });

  it("accepts pdf and docx for documents", () => {
    const allowed = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    assert.equal(allowed.has("application/pdf"), true);
    assert.equal(allowed.has("image/jpeg"), false);
  });
});
