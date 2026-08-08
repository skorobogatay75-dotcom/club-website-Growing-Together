import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const calendarUrl = pathToFileURL(
  join(root, "src/features/events/calendar-math.ts"),
).href;

describe("stage 4 calendar math", async () => {
  const math = await import(calendarUrl);

  it("builds a 6x7 monday-start grid", () => {
    const grid = math.buildMonthGrid(2026, 8, "2026-08-08");
    assert.equal(grid.weeks.length, 6);
    assert.equal(grid.weeks[0].length, 7);
    assert.equal(grid.weeks.flat().length, 42);
    assert.equal(grid.weeks[0][0].dateKey, "2026-07-27");
    assert.equal(math.mondayBasedWeekday(new Date(2026, 7, 1)), 5);
    const todayCell = grid.weeks.flat().find((c) => c.dateKey === "2026-08-08");
    assert.ok(todayCell?.isToday);
    assert.ok(todayCell?.inCurrentMonth);
  });

  it("shifts months across year boundary", () => {
    assert.deepEqual(math.shiftMonth(2026, 1, -1), { year: 2025, month: 12 });
    assert.deepEqual(math.shiftMonth(2026, 12, 1), { year: 2027, month: 1 });
  });

  it("formats russian month label", () => {
    const label = math.formatMonthLabel(2026, 8);
    assert.match(label, /август/i);
    assert.match(label, /2026/);
  });
});

describe("stage 4 remaining seats", () => {
  it("never goes below zero and null capacity stays null", () => {
    const source = readFileSync(
      join(root, "src/features/events/queries.ts"),
      "utf8",
    );
    assert.match(source, /function computeRemainingSeats/);

    function computeRemainingSeats(capacity, confirmedCount) {
      if (capacity === null) return null;
      return Math.max(capacity - confirmedCount, 0);
    }

    assert.equal(computeRemainingSeats(null, 5), null);
    assert.equal(computeRemainingSeats(10, 3), 7);
    assert.equal(computeRemainingSeats(10, 15), 0);
  });

  it("events page uses monthly calendar module", () => {
    const page = readFileSync(
      join(root, "src/app/(public)/events/page.tsx"),
      "utf8",
    );
    assert.match(page, /EventsCalendar/);
    assert.match(page, /getPublishedEventsInRange/);
  });

  it("includes seats migration", () => {
    const files = readdirSync(join(root, "supabase/migrations"))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    assert.ok(files.includes("20260808130001_event_remaining_seats.sql"));
  });
});
