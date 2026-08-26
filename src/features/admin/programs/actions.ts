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
import type {
  AudienceType,
  ContentStatus,
  EnrollmentStatus,
  EventFormat,
} from "@/types/database";

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

async function uniqueProgramSlug(base: string, excludeId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return base || `program-${Date.now()}`;
  const slug = base || `program-${Date.now()}`;
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    let query = supabase.from("programs").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function saveProgramAction(formData: FormData): Promise<void> {
  const session = await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/programs?error=save");
  }

  const id = str(formData, "id") || null;
  const title = str(formData, "title");
  if (!title) redirect("/admin/programs?error=title");

  const requestedSlug = str(formData, "slug") || slugify(title);
  const slug = await uniqueProgramSlug(slugify(requestedSlug) || slugify(title), id ?? undefined);
  const status = (str(formData, "status") || "draft") as ContentStatus;
  const coverFile = formData.get("cover") as File | null;
  let coverPath = str(formData, "cover_path") || null;

  if (coverFile && coverFile.size > 0) {
    const uploaded = await uploadPublicMedia(coverFile, "programs");
    if (!uploaded.ok) redirect(`/admin/programs?error=${encodeURIComponent(uploaded.message)}`);
    if (coverPath && coverPath !== uploaded.path) {
      const used = await isMediaPathReferenced(coverPath);
      if (!used) await deleteStorageObject("public-media", coverPath);
    }
    coverPath = uploaded.path;
  }

  const payload = {
    title,
    slug,
    excerpt: str(formData, "excerpt") || null,
    content_json: textToContentJson(str(formData, "content")),
    cover_path: coverPath,
    age_category_id: str(formData, "age_category_id") || null,
    audience_type: (str(formData, "audience_type") || "family") as AudienceType,
    format: (str(formData, "format") || "workshop") as EventFormat,
    duration_text: str(formData, "duration_text") || null,
    price_text: str(formData, "price_text") || null,
    enrollment_status: (str(formData, "enrollment_status") ||
      "open") as EnrollmentStatus,
    featured: bool(formData, "featured"),
    sort_order: Number(str(formData, "sort_order") || "0") || 0,
    status,
    seo_title: str(formData, "seo_title") || null,
    seo_description: str(formData, "seo_description") || null,
    updated_by: session.userId,
  };

  const documentIds = Array.from(
    new Set(
      formData
        .getAll("document_ids")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  let programId = id;

  if (id) {
    const { error } = await supabase.from("programs").update(payload).eq("id", id);
    if (error) {
      console.error("programs.update_failed");
      redirect("/admin/programs?error=save");
    }
  } else {
    const { data, error } = await supabase
      .from("programs")
      .insert({
        ...payload,
        created_by: session.userId,
      })
      .select("id")
      .single();
    if (error || !data?.id) {
      console.error("programs.insert_failed");
      redirect("/admin/programs?error=save");
    }
    programId = data.id as string;
  }

  if (programId) {
    const { error: clearError } = await supabase
      .from("program_documents")
      .delete()
      .eq("program_id", programId);
    if (clearError) {
      console.error("programs.documents_clear_failed");
      redirect("/admin/programs?error=save");
    }

    if (documentIds.length > 0) {
      const { error: linkError } = await supabase.from("program_documents").insert(
        documentIds.map((documentId, index) => ({
          program_id: programId,
          document_id: documentId,
          sort_order: index,
        })),
      );
      if (linkError) {
        console.error("programs.documents_link_failed");
        redirect("/admin/programs?error=save");
      }
    }
  }

  revalidatePath("/programs");
  revalidatePath("/");
  revalidatePath("/admin/programs");
  redirect("/admin/programs?ok=1");
}

export async function deleteProgramAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/programs?error=delete");

  const { data } = await supabase
    .from("programs")
    .select("cover_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) {
    console.error("programs.delete_failed");
    redirect("/admin/programs?error=delete");
  }

  const cover = data?.cover_path as string | null | undefined;
  if (cover) {
    const used = await isMediaPathReferenced(cover);
    if (!used) await deleteStorageObject("public-media", cover);
  }

  revalidatePath("/programs");
  revalidatePath("/");
  revalidatePath("/admin/programs");
  redirect("/admin/programs?ok=deleted");
}

export async function setProgramStatusAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const status = str(formData, "status") as ContentStatus;
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/programs?error=save");

  const { error } = await supabase
    .from("programs")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("programs.status_failed");
    redirect("/admin/programs?error=save");
  }

  revalidatePath("/programs");
  revalidatePath("/");
  revalidatePath("/admin/programs");
  redirect("/admin/programs?ok=1");
}
