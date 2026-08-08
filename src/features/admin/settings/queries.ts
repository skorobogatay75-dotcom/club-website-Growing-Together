import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json, SiteSetting, TeamMember } from "@/types/database";
import {
  parseClubSettings,
  parseContactsSettings,
  contactsStatusNote,
  type ClubSettings,
  type ContactsSettings,
} from "@/features/admin/settings/parse";

export type { ClubSettings, ContactsSettings };
export { parseClubSettings, parseContactsSettings, contactsStatusNote };

export async function listSiteSettings(): Promise<SiteSetting[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true });
  if (error) {
    console.error("admin.settings.list_failed");
    return [];
  }
  return (data ?? []) as SiteSetting[];
}

export async function getSettingMap(): Promise<Map<string, Json>> {
  const rows = await listSiteSettings();
  return new Map(rows.map((row) => [row.key, row.value_json]));
}

export async function listAdminTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("admin.team.list_failed");
    return [];
  }
  return (data ?? []) as TeamMember[];
}

export async function getAdminTeamMember(id: string): Promise<TeamMember | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.team.get_failed");
    return null;
  }
  return (data as TeamMember | null) ?? null;
}
