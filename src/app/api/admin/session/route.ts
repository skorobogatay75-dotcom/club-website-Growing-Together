import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "config" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, reason: "unauthenticated" }, { status: 401 });
    }

    const admin = createSupabaseServiceClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    const allowed =
      !!profile &&
      profile.is_active === true &&
      (profile.role === "admin" || profile.role === "editor");

    return NextResponse.json({
      ok: allowed,
      role: profile?.role ?? null,
      reason: allowed ? "ok" : "forbidden",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        reason: "error",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}
