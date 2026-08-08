/** Утилиты месячного календаря (неделя с понедельника). */

export type CalendarDayCell = {
  /** Локальная дата YYYY-MM-DD */
  dateKey: string;
  year: number;
  month: number; // 1-12
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

export type MonthGrid = {
  year: number;
  month: number;
  label: string;
  weeks: CalendarDayCell[][];
  /** Включительно: первый день сетки (может быть из предыдущего месяца) */
  rangeStart: string;
  /** Включительно: последний день сетки */
  rangeEnd: string;
};

const WEEKDAY_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;
const WEEKDAY_LONG = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
] as const;

export function getWeekdayShortLabels(): readonly string[] {
  return WEEKDAY_SHORT;
}

export function getWeekdayLongLabels(): readonly string[] {
  return WEEKDAY_LONG;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseDateKey(dateKey: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  return { year: y, month: m, day: d };
}

/** Понедельник = 0 … Воскресенье = 6 */
export function mondayBasedWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function getTodayParts(timeZone?: string): {
  year: number;
  month: number;
  day: number;
  dateKey: string;
} {
  const now = new Date();
  if (!timeZone) {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return { year, month, day, dateKey: toDateKey(year, month, day) };
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day, dateKey: toDateKey(year, month, day) };
}

export function formatMonthLabel(year: number, month: number): string {
  const label = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Строит сетку месяца: ровно 6 недель × 7 дней (42 ячейки),
 * дни соседних месяцев помечены inCurrentMonth=false.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  todayKey?: string,
): MonthGrid {
  const today = todayKey ?? getTodayParts().dateKey;
  const first = new Date(year, month - 1, 1);
  const startOffset = mondayBasedWeekday(first);
  const gridStart = new Date(year, month - 1, 1 - startOffset);

  const weeks: CalendarDayCell[][] = [];
  const cursor = new Date(gridStart);

  for (let w = 0; w < 6; w += 1) {
    const week: CalendarDayCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const day = cursor.getDate();
      const dateKey = toDateKey(y, m, day);
      week.push({
        dateKey,
        year: y,
        month: m,
        day,
        inCurrentMonth: m === month && y === year,
        isToday: dateKey === today,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const flat = weeks.flat();
  return {
    year,
    month,
    label: formatMonthLabel(year, month),
    weeks,
    rangeStart: flat[0].dateKey,
    rangeEnd: flat[flat.length - 1].dateKey,
  };
}

/** Границы месяца в UTC ISO для запросов (весь месяц + запас не нужен если range из сетки). */
export function monthRangeUtcIso(
  rangeStart: string,
  rangeEnd: string,
  timeZone: string,
): { startIso: string; endIso: string } {
  // Интерпретируем ключи как календарные даты в TZ клуба: start 00:00, end 23:59:59.999
  const startIso = zonedDayBoundaryToUtcIso(rangeStart, timeZone, "start");
  const endIso = zonedDayBoundaryToUtcIso(rangeEnd, timeZone, "end");
  return { startIso, endIso };
}

function zonedDayBoundaryToUtcIso(
  dateKey: string,
  timeZone: string,
  boundary: "start" | "end",
): string {
  const { year, month, day } = parseDateKey(dateKey);
  const wall = boundary === "start" ? "00:00:00.000" : "23:59:59.999";
  // Смещение TZ через сравнение UTC и локального форматирования
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const inTz = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(probe);

  const offsetPart = inTz.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const offset = parseGmtOffset(offsetPart);
  const [hh, mm, ssMs] = wall.split(":");
  const [ss, ms] = ssMs.split(".");
  const asUtc = Date.UTC(
    year,
    month - 1,
    day,
    Number(hh),
    Number(mm),
    Number(ss),
    Number(ms),
  );
  // wall time in TZ = UTC + offset => UTC = wall - offset
  return new Date(asUtc - offset).toISOString();
}

function parseGmtOffset(value: string): number {
  // GMT, GMT+3, GMT+03:00, GMT-5:30
  if (value === "GMT" || value === "UTC") return 0;
  const match = value.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return sign * (hours * 60 + minutes) * 60_000;
}

export function dateKeyInTimeZone(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}
