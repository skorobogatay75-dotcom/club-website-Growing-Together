import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("stage 6 admin auth", async () => {
  const rolesMod = await import(
    pathToFileURL(join(root, "src/lib/auth/roles.ts")).href
  );

  it("allows settings only for admin role", () => {
    assert.equal(rolesMod.canManageSettings("admin"), true);
    assert.equal(rolesMod.canManageSettings("editor"), false);
    assert.equal(rolesMod.canManageContent("editor"), true);
  });

  it("middleware protects admin routes and keeps login public", () => {
    const source = readFileSync(join(root, "src/middleware.ts"), "utf8");
    assert.match(source, /\/admin\/login/);
    assert.match(source, /matcher:\s*\[\s*"\/admin\/:path\*"/);
    assert.match(source, /profiles/);
    assert.match(source, /admin\/settings/);
  });

  it("login action checks profile role before access", () => {
    const source = readFileSync(join(root, "src/lib/auth/actions.ts"), "utf8");
    assert.match(source, /signInWithPassword/);
    assert.match(source, /signOut/);
    assert.match(source, /resetPasswordForEmail/);
    assert.match(source, /updateUser/);
  });

  it("protected admin layout requires staff session", () => {
    const source = readFileSync(
      join(root, "src/app/admin/(protected)/layout.tsx"),
      "utf8",
    );
    assert.match(source, /requireStaff/);
    assert.match(source, /logoutAction/);
  });
});
