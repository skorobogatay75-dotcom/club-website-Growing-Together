import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canManageContent, canManageSettings } from "@/lib/auth/roles";
import type { Profile } from "@/types/database";

export type StaffSession = {
  userId: string;
  email: string | null;
  profile: Profile;
};

export async function getStaffSession(): Promise<StaffSession | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return null;
  if (!profile.is_active) return null;
  if (!canManageContent(profile.role)) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile as Profile,
  };
}

export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdmin(): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canManageSettings(session.profile.role)) {
    redirect("/admin?error=admin-only");
  }
  return session;
}

export { canManageContent, canManageSettings };
