import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AgeCategory,
  Album,
  Event,
  MembershipPlan,
  NewsPost,
  Program,
  TeamMember,
} from "@/types/database";

type AgeCategoryRef = Pick<AgeCategory, "name" | "slug" | "color_token">;

export type EventWithCategory = Event & {
  age_categories: AgeCategoryRef | null;
};

export type ProgramWithCategory = Program & {
  age_categories: AgeCategoryRef | null;
};

function normalizeAgeCategory(
  value: AgeCategoryRef | AgeCategoryRef[] | null | undefined,
): AgeCategoryRef | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function withAgeCategory<T extends { age_categories?: unknown }>(
  row: T,
): T & { age_categories: AgeCategoryRef | null } {
  return {
    ...row,
    age_categories: normalizeAgeCategory(
      row.age_categories as AgeCategoryRef | AgeCategoryRef[] | null | undefined,
    ),
  };
}

async function getClient() {
  return createSupabaseServerClient();
}

export async function getLatestNews(limit = 3): Promise<NewsPost[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id, title, slug, excerpt, content_json, cover_path, is_pinned, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getLatestNews failed");
    return [];
  }

  return (data ?? []) as NewsPost[];
}

export async function getUpcomingEvents(limit = 4): Promise<EventWithCategory[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, program_id, title, slug, excerpt, content_json, cover_path, age_category_id, age_text, audience_type, format, starts_at, ends_at, timezone, venue, price_text, capacity, registration_status, featured, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at, age_categories ( name, slug, color_token )",
    )
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getUpcomingEvents failed");
    return [];
  }

  return ((data ?? []) as Array<Event & { age_categories?: unknown }>).map(
    (row) => withAgeCategory(row) as EventWithCategory,
  );
}

export async function getFeaturedPrograms(limit = 6): Promise<ProgramWithCategory[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, title, slug, excerpt, content_json, cover_path, age_category_id, age_text, audience_type, format, duration_text, price_text, enrollment_status, featured, sort_order, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at, age_categories ( name, slug, color_token )",
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getFeaturedPrograms failed");
    return [];
  }

  return ((data ?? []) as Array<Program & { age_categories?: unknown }>).map(
    (row) => withAgeCategory(row) as ProgramWithCategory,
  );
}

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("team_members")
    .select(
      "id, full_name, role_title, bio, photo_path, sort_order, is_active, status, created_at, updated_at",
    )
    .eq("status", "published")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getPublishedTeamMembers failed");
    return [];
  }

  return (data ?? []) as TeamMember[];
}

export async function getPublishedMembershipPlans(): Promise<MembershipPlan[]> {
  const supabase = await getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("membership_plans")
    .select(
      "id, name, slug, description, benefits_json, price_text, period_text, sort_order, status, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getPublishedMembershipPlans failed");
    return [];
  }

  return (data ?? []) as MembershipPlan[];
}

export async function getLatestAlbum(): Promise<Album | null> {
  const supabase = await getClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("albums")
    .select(
      "id, title, slug, description, cover_photo_id, event_id, event_date, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getLatestAlbum failed");
    return null;
  }

  return (data as Album | null) ?? null;
}

export type PublicContacts = {
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: string | null;
};

export async function getPublicContacts(): Promise<PublicContacts> {
  const empty: PublicContacts = {
    address: null,
    phone: null,
    email: null,
    hours: null,
  };

  const supabase = await getClient();
  if (!supabase) return empty;

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value_json")
    .eq("key", "contacts.public")
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getPublicContacts failed");
    return empty;
  }

  const value = data.value_json as Record<string, unknown> | null;
  if (!value || typeof value !== "object") return empty;

  const asText = (v: unknown) =>
    typeof v === "string" && v.trim() && !/нужно\s+заполнить/i.test(v)
      ? v.trim()
      : null;

  return {
    address: asText(value.address),
    phone: asText(value.phone),
    email: asText(value.email),
    hours: asText(value.hours),
  };
}

export function hasAnyContact(contacts: PublicContacts): boolean {
  return Boolean(
    contacts.address || contacts.phone || contacts.email || contacts.hours,
  );
}
