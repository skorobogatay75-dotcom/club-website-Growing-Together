import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/session";
import { listAdminApplications } from "@/features/admin/applications/queries";

export const dynamic = "force-dynamic";

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  await requireStaff();
  const { searchParams } = new URL(request.url);
  const apps = await listAdminApplications({
    status: searchParams.get("status") || undefined,
    type: searchParams.get("type") || undefined,
    q: searchParams.get("q") || undefined,
  });

  const header = [
    "created_at",
    "status",
    "type",
    "parent_name",
    "phone",
    "email",
    "preferred_contact",
    "child_age_text",
    "related",
    "comment",
    "manager_note",
  ];

  const rows = apps.map((app) => {
    const related =
      app.programs?.title ||
      app.events?.title ||
      app.membership_plans?.name ||
      "";
    return [
      app.created_at,
      app.status,
      app.type,
      app.parent_name,
      app.phone,
      app.email ?? "",
      app.preferred_contact,
      app.child_age_text ?? "",
      related,
      app.comment ?? "",
      app.manager_note ?? "",
    ]
      .map((cell) => csvEscape(String(cell)))
      .join(",");
  });

  const body = `\uFEFF${header.join(",")}\n${rows.join("\n")}\n`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="applications.csv"',
      "Cache-Control": "no-store",
    },
  });
}
