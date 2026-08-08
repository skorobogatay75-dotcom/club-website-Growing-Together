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
import type { ContentStatus } from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

async function uniqueNewsSlug(base: string, excludeId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return base || `news-${Date.now()}`;
  const slug = base || `news-${Date.now()}`;
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    let query = supabase.from("news_posts").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function saveNewsAction(formData: FormData): Promise<void> {
  const session = await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/news?error=save");

  const id = str(formData, "id") || null;
  const title = str(formData, "title");
  if (!title) redirect("/admin/news?error=title");

  const requestedSlug = str(formData, "slug") || slugify(title);
  const slug = await uniqueNewsSlug(
    slugify(requestedSlug) || slugify(title),
    id ?? undefined,
  );

  const coverFile = formData.get("cover") as File | null;
  let coverPath = str(formData, "cover_path") || null;
  if (coverFile && coverFile.size > 0) {
    const uploaded = await uploadPublicMedia(coverFile, "news");
    if (!uploaded.ok) {
      redirect(`/admin/news?error=${encodeURIComponent(uploaded.message)}`);
    }
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
    is_pinned: bool(formData, "is_pinned"),
    status: (str(formData, "status") || "draft") as ContentStatus,
    seo_title: str(formData, "seo_title") || null,
    seo_description: str(formData, "seo_description") || null,
    updated_by: session.userId,
  };

  if (id) {
    const { error } = await supabase.from("news_posts").update(payload).eq("id", id);
    if (error) {
      console.error("news.update_failed");
      redirect("/admin/news?error=save");
    }
  } else {
    const { error } = await supabase.from("news_posts").insert({
      ...payload,
      created_by: session.userId,
    });
    if (error) {
      console.error("news.insert_failed");
      redirect("/admin/news?error=save");
    }
  }

  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  redirect("/admin/news?ok=1");
}

export async function deleteNewsAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/news?error=delete");

  const { data } = await supabase
    .from("news_posts")
    .select("cover_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("news_posts").delete().eq("id", id);
  if (error) {
    console.error("news.delete_failed");
    redirect("/admin/news?error=delete");
  }

  const cover = data?.cover_path as string | null | undefined;
  if (cover) {
    const used = await isMediaPathReferenced(cover);
    if (!used) await deleteStorageObject("public-media", cover);
  }

  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  redirect("/admin/news?ok=deleted");
}

export async function setNewsStatusAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const status = str(formData, "status") as ContentStatus;
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/news?error=save");

  const { error } = await supabase
    .from("news_posts")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("news.status_failed");
    redirect("/admin/news?error=save");
  }

  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  redirect("/admin/news?ok=1");
}
