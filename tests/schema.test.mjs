import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase/migrations");

describe("stage 2 sql migrations", () => {
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  it("includes ordered migration files", () => {
    assert.deepEqual(files, [
      "20260808120001_extensions_and_enums.sql",
      "20260808120002_tables.sql",
      "20260808120003_functions_and_triggers.sql",
      "20260808120004_rls.sql",
      "20260808120005_storage.sql",
    ]);
  });

  it("defines core tables and calendar index", () => {
    const tables = readFileSync(join(migrationsDir, files[1]), "utf8");
    for (const name of [
      "profiles",
      "age_categories",
      "programs",
      "events",
      "news_posts",
      "albums",
      "photos",
      "document_categories",
      "documents",
      "membership_plans",
      "applications",
      "team_members",
      "site_settings",
    ]) {
      assert.match(tables, new RegExp(`create table if not exists public\\.${name}`, "i"));
    }
    assert.match(tables, /events_calendar_idx/i);
    assert.match(tables, /events_capacity_check/i);
  });

  it("enables RLS and blocks public applications read", () => {
    const rls = readFileSync(join(migrationsDir, files[3]), "utf8");
    assert.match(rls, /alter table public\.applications enable row level security/i);
    assert.match(rls, /applications_staff_select/i);

    const applicationPolicies = [
      ...rls.matchAll(
        /create policy\s+(\w+)\s+on public\.applications([\s\S]*?)(?=\ncreate policy|\n-- -|$)/gi,
      ),
    ];
    assert.ok(applicationPolicies.length >= 3);
    for (const [, name, body] of applicationPolicies) {
      assert.doesNotMatch(
        body,
        /\bto anon\b/i,
        `policy ${name} must not grant anon`,
      );
    }
  });

  it("creates public media and documents storage buckets", () => {
    const storage = readFileSync(join(migrationsDir, files[4]), "utf8");
    assert.match(storage, /public-media/);
    assert.match(storage, /public-documents/);
    assert.match(storage, /image\/jpeg/);
    assert.match(storage, /application\/pdf/);
  });

  it("seed covers required demo entities without fake contacts", () => {
    const seed = readFileSync(join(root, "supabase/seed.sql"), "utf8");
    assert.match(seed, /age_categories/);
    assert.match(seed, /insert into public\.programs/i);
    assert.match(seed, /insert into public\.events/i);
    assert.match(seed, /insert into public\.news_posts/i);
    assert.match(seed, /demonstracionnyj-albom/);
    assert.match(seed, /document_categories/);
    assert.match(seed, /site_settings/);
    assert.doesNotMatch(seed, /\+7\s?\(?\d{3}\)?/);
    assert.doesNotMatch(seed, /@gmail\.com/i);
    assert.doesNotMatch(seed, /\d+\s?₽/);
  });
});
