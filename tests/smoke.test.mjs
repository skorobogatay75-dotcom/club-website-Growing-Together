import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("stage 1 project smoke", () => {
  it("defines brand design tokens", () => {
    const tokens = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
    assert.match(tokens, /--brand-terracotta:\s*#a85645/i);
    assert.match(tokens, /--brand-cream:\s*#fff3ea/i);
    assert.match(tokens, /--brand-turquoise:\s*#80b4b2/i);
  });

  it("keeps service role key out of public env prefix in example", () => {
    const envExample = readFileSync(join(root, ".env.example"), "utf8");
    assert.match(envExample, /^SUPABASE_SERVICE_ROLE_KEY=/m);
    assert.doesNotMatch(envExample, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE/);
  });
});
