import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("stage 10 docs", () => {
  it("includes deploy and admin handbooks", () => {
    const deploy = join(root, "docs/DEPLOY.md");
    const admin = join(root, "docs/ADMIN.md");
    assert.equal(existsSync(deploy), true);
    assert.equal(existsSync(admin), true);

    const deployText = readFileSync(deploy, "utf8");
    assert.match(deployText, /Vercel/i);
    assert.match(deployText, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(deployText, /profiles/);

    const adminText = readFileSync(admin, "utf8");
    assert.match(adminText, /\/admin\/events/);
    assert.match(adminText, /НУЖНО ЗАПОЛНИТЬ/);
    assert.match(adminText, /JPEG/);
  });

  it("readme links to deploy and admin docs", () => {
    const readme = readFileSync(join(root, "README.md"), "utf8");
    assert.match(readme, /docs\/DEPLOY\.md/);
    assert.match(readme, /docs\/ADMIN\.md/);
    assert.match(readme, /готово/);
  });
});
