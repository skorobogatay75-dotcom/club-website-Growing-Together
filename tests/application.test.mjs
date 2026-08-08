import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("stage 5 application validation", async () => {
  const mod = await import(
    pathToFileURL(join(root, "src/lib/validation/application.ts")).href
  );

  it("accepts a valid general application", () => {
    const parsed = mod.applicationFormSchema.safeParse({
      type: "general",
      parentName: "Анна Иванова",
      phone: "+7 (999) 123-45-67",
      email: "",
      childAgeText: "9 лет",
      preferredContact: "phone",
      consentPersonalData: true,
      consentMarketing: false,
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.email, undefined);
      assert.equal(mod.normalizePhone(parsed.data.phone), "+79991234567");
    }
  });

  it("requires program for program type", () => {
    const parsed = mod.applicationFormSchema.safeParse({
      type: "program",
      parentName: "Анна",
      phone: "+79991234567",
      preferredContact: "any",
      consentPersonalData: true,
      consentMarketing: false,
    });
    assert.equal(parsed.success, false);
  });

  it("rejects missing consent", () => {
    const parsed = mod.applicationFormSchema.safeParse({
      type: "general",
      parentName: "Анна",
      phone: "+79991234567",
      preferredContact: "any",
      consentPersonalData: false,
      consentMarketing: false,
    });
    assert.equal(parsed.success, false);
  });

  it("server action avoids logging PII keys", () => {
    const source = readFileSync(
      join(root, "src/features/applications/actions.ts"),
      "utf8",
    );
    assert.match(source, /application\.insert_failed/);
    assert.doesNotMatch(source, /console\.(log|error|info)\([^)]*parentName/);
    assert.doesNotMatch(source, /console\.(log|error|info)\([^)]*phone/);
  });
});

describe("stage 5 rate limit", async () => {
  const mod = await import(
    pathToFileURL(join(root, "src/lib/security/rate-limit.ts")).href
  );

  it("blocks after max attempts in window", () => {
    mod.resetRateLimitStoreForTests();
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 8; i += 1) {
      assert.equal(mod.consumeRateLimit(key, { windowMs: 60_000, max: 8 }).ok, true);
    }
    const blocked = mod.consumeRateLimit(key, { windowMs: 60_000, max: 8 });
    assert.equal(blocked.ok, false);
  });
});
