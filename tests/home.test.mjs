import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

describe("stage 3 public content helpers", () => {
  it("filters service placeholders from public text", () => {
    const source = readFileSync(
      join(root, "src/lib/content/public-text.ts"),
      "utf8",
    );
    assert.match(source, /нужно\\s\+заполнить/);
    assert.match(source, /export function isPublicText/);
  });

  it("keeps service role client server-only", () => {
    const admin = readFileSync(
      join(root, "src/lib/supabase/admin.ts"),
      "utf8",
    );
    assert.match(admin, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(admin, /ТОЛЬКО сервер|ONLY сервер|только сервер/i);
    assert.doesNotMatch(admin, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE/);
  });

  it("homepage loads content sections from feature queries", () => {
    const page = readFileSync(
      join(root, "src/app/(public)/page.tsx"),
      "utf8",
    );
    assert.match(page, /getLatestNews/);
    assert.match(page, /getUpcomingEvents/);
    assert.match(page, /getFeaturedPrograms/);
    assert.match(page, /HomeHero/);
  });

  it("depends on supabase packages", () => {
    const pkg = require(join(root, "package.json"));
    assert.ok(pkg.dependencies["@supabase/supabase-js"]);
    assert.ok(pkg.dependencies["@supabase/ssr"]);
  });
});
