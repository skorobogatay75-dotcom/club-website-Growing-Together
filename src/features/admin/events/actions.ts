"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/admin/slug";
import { textToContentJson } from "@/lib/admin/content-json";
import {
  deleteStorageObject,
  isMediaPathReferenced,
  uploadPublicMedia,
} from "@/lib/admin/media";
import { localInputToIso } from "@/lib/admin/datetime";
import { adminSaveErrorParam } from "@/lib/admin/save-error";
import type {
  AudienceType,
  ContentStatus,
  EventFormat,
  RegistrationStatus,
} from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

async function uniqueEventSlug(base: string, excludeId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return base || `event-${Date.now()}`;
  const slug = base || `event-${Date.now()}`;
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    let query = supabase.from("events").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function saveEventAction(formData: FormData): Promise<void> {
  const session = await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/events?error=save");

  const id = str(formData, "id") || null;
  const title = str(formData, "title");
  if (!title) redirect("/admin/events?error=title");

  const timezone = str(formData, "timezone") || "Europe/Moscow";
  const startsAt = localInputToIso(str(formData, "starts_at"), timezone);
  const endsAt = localInputToIso(str(formData, "ends_at"), timezone);
  if (!startsAt || !endsAt || endsAt < startsAt) {
    redirect("/admin/events?error=time");
  }

  const requestedSlug = str(formData, "slug") || slugify(title);
  const slug = await uniqueEventSlug(
    slugify(requestedSlug) || slugify(title),
    id ?? undefined,
  );

  const coverFile = formData.get("cover") as File | null;
  let coverPath = str(formData, "cover_path") || null;
  if (coverFile && coverFile.size > 0) {
    const uploaded = await uploadPublicMedia(coverFile, "events");
    if (!uploaded.ok) {
      redirect(`/admin/events?error=${encodeURIComponent(uploaded.message)}`);
    }
    if (coverPath && coverPath !== uploaded.path) {
      const used = await isMediaPathReferenced(coverPath);
      if (!used) await deleteStorageObject("public-media", coverPath);
    }
    coverPath = uploaded.path;
  }

  const capacityRaw = str(formData, "capacity");
  const payload = {
    title,
    slug,
    excerpt: str(formData, "excerpt") || null,
    content_json: textToContentJson(str(formData, "content")),
    cover_path: coverPath,
    program_id: str(formData, "program_id") || null,
    age_category_id: null,
    age_text: str(formData, "age_text") || null,
    audience_type: (str(formData, "audience_type") || "family") as AudienceType,
    format: (str(formData, "format") || "workshop") as EventFormat,
    starts_at: startsAt,
    ends_at: endsAt,
    timezone: timezone,
    venue: str(formData, "venue") || null,
    price_text: str(formData, "price_text") || null,
    capacity: capacityRaw ? Number(capacityRaw) : null,
    registration_status: (str(formData, "registration_status") ||
      "open") as RegistrationStatus,
    featured: bool(formData, "featured"),
    status: (str(formData, "status") || "draft") as ContentStatus,
    seo_title: str(formData, "seo_title") || null,
    seo_description: str(formData, "seo_description") || null,
    updated_by: session.userId,
  };

  if (id) {
    const { error } = await supabase.from("events").update(payload).eq("id", id);
    if (error) {
      console.error("events.update_failed", error.message);
      redirect(`/admin/events/${id}?error=${adminSaveErrorParam(error)}`);
    }
  } else {
    const { data, error } = await supabase
      .from("events")
      .insert({
        ...payload,
        created_by: session.userId,
      })
      .select("id")
      .single();
    if (error || !data?.id) {
      console.error("events.insert_failed", error?.message);
      redirect(`/admin/events/new?error=${adminSaveErrorParam(error)}`);
    }
  }

  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  redirect("/admin/events?ok=1");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/events?error=delete");

  const { data } = await supabase
    .from("events")
    .select("cover_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    console.error("events.delete_failed");
    redirect("/admin/events?error=delete");
  }

  const cover = data?.cover_path as string | null | undefined;
  if (cover) {
    const used = await isMediaPathReferenced(cover);
    if (!used) await deleteStorageObject("public-media", cover);
  }

  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  redirect("/admin/events?ok=deleted");
}

export async function setEventStatusAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const status = str(formData, "status") as ContentStatus;
  const registration = str(formData, "registration_status");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/events?error=save");

  const patch: Record<string, string> = {};
  if (status) patch.status = status;
  if (registration) patch.registration_status = registration;

  const { error } = await supabase.from("events").update(patch).eq("id", id);
  if (error) {
    console.error("events.status_failed");
    redirect("/admin/events?error=save");
  }

  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  redirect("/admin/events?ok=1");
}
