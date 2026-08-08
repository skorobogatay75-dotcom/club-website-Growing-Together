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
} from "../src/features/admin/settings/parse.ts";

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
          messengers: { telegram: "@club", whatsapp: null },
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
        whatsapp: "",
      }),
      "needs_fill",
    );
  });
});
