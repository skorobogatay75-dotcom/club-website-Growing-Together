import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  albumYears,
  filterAlbumsByYear,
} from "../src/features/gallery/album-filters.ts";
import {
  contactsStatusNote,
  parseClubSettings,
  parseContactsSettings,
  DEFAULT_GROUP_LINKS,
} from "../src/features/admin/settings/parse.ts";
import { messengerHref } from "../src/lib/content/messenger-link.ts";

describe("gallery year helpers", () => {
  const albums = [
    {
      event_date: "2025-03-01",
      published_at: "2025-03-02T00:00:00.000Z",
      slug: "a",
    },
    {
      event_date: "2026-01-10",
      published_at: "2026-01-11T00:00:00.000Z",
      slug: "b",
    },
  ];

  it("collects unique years descending", () => {
    assert.deepEqual(albumYears(albums), [2026, 2025]);
  });

  it("filters by year query", () => {
    assert.equal(filterAlbumsByYear(albums, "2025").length, 1);
    assert.equal(filterAlbumsByYear(albums, "2025")[0].slug, "a");
    assert.equal(filterAlbumsByYear(albums, null).length, 2);
  });
});

describe("settings parsers", () => {
  it("parses club and contacts", () => {
    const map = new Map([
      ["club.name", { value: "Вместе растём" }],
      ["club.tagline", { value: "Слоган" }],
      ["club.timezone", { value: "Europe/Moscow" }],
      [
        "contacts.public",
        {
          address: "ул. Пример",
          phone: null,
          email: "a@b.c",
          hours: "",
          messengers: {
            telegram: "@club",
            max: "https://max.ru/join/abc",
            vk: "https://vk.com/club",
          },
        },
      ],
    ]);

    const club = parseClubSettings(map);
    assert.equal(club.name, "Вместе растём");
    assert.equal(club.tagline, "Слоган");

    const contacts = parseContactsSettings(map);
    assert.equal(contacts.address, "ул. Пример");
    assert.equal(contacts.email, "a@b.c");
    assert.equal(contacts.telegram, "@club");
    assert.equal(contacts.max, "https://max.ru/join/abc");
    assert.equal(contacts.vk, "https://vk.com/club");
    assert.equal(contactsStatusNote(contacts), "ready");
  });

  it("marks empty contacts as needs_fill", () => {
    assert.equal(
      contactsStatusNote({
        address: "",
        phone: "",
        email: "",
        hours: "",
        telegram: "",
        max: "",
        vk: "",
      }),
      "needs_fill",
    );
  });

  it("fills default MAX and VK group links when messengers are empty", () => {
    const contacts = parseContactsSettings(
      new Map([["contacts.public", { messengers: {} }]]),
    );
    assert.equal(contacts.max, DEFAULT_GROUP_LINKS.max);
    assert.equal(contacts.vk, DEFAULT_GROUP_LINKS.vk);
    assert.equal(contacts.telegram, "");
  });
});

describe("messenger group links", () => {
  it("builds https links for telegram, max and vk", () => {
    assert.equal(messengerHref("telegram", "@club"), "https://t.me/club");
    assert.equal(
      messengerHref("max", "max.ru/join/abc"),
      "https://max.ru/join/abc",
    );
    assert.equal(messengerHref("vk", "vk.com/club"), "https://vk.com/club");
    assert.equal(
      messengerHref("max", "https://max.ru/c/-75505485803737/AaA_RwgOJhY"),
      "https://max.ru/c/-75505485803737/AaA_RwgOJhY",
    );
    assert.equal(
      messengerHref("vk", "https://vk.ru/club241019566"),
      "https://vk.ru/club241019566",
    );
  });

  it("rejects non-http schemes", () => {
    assert.equal(messengerHref("telegram", "javascript:alert(1)"), null);
  });
});
