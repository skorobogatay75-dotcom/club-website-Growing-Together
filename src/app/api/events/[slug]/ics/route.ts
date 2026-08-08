import { NextResponse } from "next/server";
import { getPublishedEventBySlug } from "@/features/content/queries";

type Params = { params: Promise<{ slug: string }> };

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toIcsUtc(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vmeste Rastem//Events//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@vmeste-rastem`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(event.starts_at)}`,
    `DTEND:${toIcsUtc(event.ends_at)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    event.excerpt ? `DESCRIPTION:${icsEscape(event.excerpt)}` : null,
    event.venue ? `LOCATION:${icsEscape(event.venue)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
