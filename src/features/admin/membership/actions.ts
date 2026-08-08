"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/admin/slug";
import { benefitsFromText } from "@/lib/admin/benefits";
import type { ContentStatus } from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function uniquePlanSlug(base: string, excludeId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return base || `plan-${Date.now()}`;
  const slug = base || `plan-${Date.now()}`;
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    let query = supabase
      .from("membership_plans")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function saveMembershipPlanAction(formData: FormData): Promise<void> {
  const session = await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/membership?error=save");

  const id = str(formData, "id") || null;
  const name = str(formData, "name");
  if (!name) redirect("/admin/membership?error=title");

  const requestedSlug = str(formData, "slug") || slugify(name);
  const slug = await uniquePlanSlug(
    slugify(requestedSlug) || slugify(name),
    id ?? undefined,
  );

  const payload = {
    name,
    slug,
    description: str(formData, "description") || null,
    benefits_json: benefitsFromText(str(formData, "benefits")),
    price_text: str(formData, "price_text") || null,
    period_text: str(formData, "period_text") || null,
    sort_order: Number(str(formData, "sort_order") || "0") || 0,
    status: (str(formData, "status") || "draft") as ContentStatus,
    updated_by: session.userId,
  };

  if (id) {
    const { error } = await supabase
      .from("membership_plans")
      .update(payload)
      .eq("id", id);
    if (error) {
      console.error("membership.update_failed");
      redirect("/admin/membership?error=save");
    }
  } else {
    const { error } = await supabase.from("membership_plans").insert({
      ...payload,
      created_by: session.userId,
    });
    if (error) {
      console.error("membership.insert_failed");
      redirect("/admin/membership?error=save");
    }
  }

  revalidatePath("/membership");
  revalidatePath("/");
  revalidatePath("/admin/membership");
  redirect("/admin/membership?ok=1");
}

export async function deleteMembershipPlanAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/membership?error=delete");

  const { error } = await supabase.from("membership_plans").delete().eq("id", id);
  if (error) {
    console.error("membership.delete_failed");
    redirect("/admin/membership?error=delete");
  }

  revalidatePath("/membership");
  revalidatePath("/");
  revalidatePath("/admin/membership");
  redirect("/admin/membership?ok=deleted");
}
