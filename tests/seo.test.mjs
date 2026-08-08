import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { absoluteUrl, getSiteUrl } from "../src/lib/seo/site-url.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("seo site url", () => {
  it("normalizes site url without trailing slash", () => {
    const prev = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    assert.equal(getSiteUrl(), "https://example.com");
    assert.equal(absoluteUrl("/events"), "https://example.com/events");
    assert.equal(absoluteUrl("/"), "https://example.com/");
    process.env.NEXT_PUBLIC_SITE_URL = prev;
  });
});

describe("seo routes and a11y", () => {
  it("has sitemap and robots app routes", () => {
    assert.equal(existsSync(join(root, "src/app/sitemap.ts")), true);
    assert.equal(existsSync(join(root, "src/app/robots.ts")), true);
  });

  it("public layout includes skip link and main landmark", () => {
    const layout = readFileSync(
      join(root, "src/app/(public)/layout.tsx"),
      "utf8",
    );
    assert.match(layout, /SkipToContent/);
    assert.match(layout, /id="main-content"/);
  });

  it("robots disallows admin", () => {
    const robots = readFileSync(join(root, "src/app/robots.ts"), "utf8");
    assert.match(robots, /\/admin\//);
    assert.match(robots, /sitemap\.xml/);
  });

  it("json-ld helpers cover organization event article breadcrumbs", () => {
    const source = readFileSync(join(root, "src/lib/seo/json-ld.ts"), "utf8");
    assert.match(source, /Organization/);
    assert.match(source, /EventCancelled/);
    assert.match(source, /Article/);
    assert.match(source, /BreadcrumbList/);
  });

  it("security headers configured", () => {
    const config = readFileSync(join(root, "next.config.ts"), "utf8");
    assert.match(config, /X-Content-Type-Options/);
    assert.match(config, /X-Robots-Tag/);
  });
});
