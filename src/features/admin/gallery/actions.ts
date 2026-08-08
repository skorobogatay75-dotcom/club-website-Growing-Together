"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/admin/slug";
import {
  deleteStorageObject,
  isMediaPathReferenced,
  uploadPublicMedia,
} from "@/lib/admin/media";
import type { ContentStatus } from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function uniqueAlbumSlug(base: string, excludeId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return base || `album-${Date.now()}`;
  const slug = base || `album-${Date.now()}`;
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    let query = supabase.from("albums").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

function revalidateGallery(slug?: string) {
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  if (slug) revalidatePath(`/gallery/${slug}`);
}

export async function saveAlbumAction(formData: FormData): Promise<void> {
  const session = await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/gallery?error=save");

  const id = str(formData, "id") || null;
  const title = str(formData, "title");
  if (!title) redirect("/admin/gallery?error=title");

  const requestedSlug = str(formData, "slug") || slugify(title);
  const slug = await uniqueAlbumSlug(
    slugify(requestedSlug) || slugify(title),
    id ?? undefined,
  );

  const payload = {
    title,
    slug,
    description: str(formData, "description") || null,
    event_id: str(formData, "event_id") || null,
    event_date: str(formData, "event_date") || null,
    status: (str(formData, "status") || "draft") as ContentStatus,
    seo_title: str(formData, "seo_title") || null,
    seo_description: str(formData, "seo_description") || null,
    updated_by: session.userId,
  };

  if (id) {
    const { error } = await supabase.from("albums").update(payload).eq("id", id);
    if (error) {
      console.error("albums.update_failed");
      redirect("/admin/gallery?error=save");
    }
    revalidateGallery(slug);
    redirect(`/admin/gallery/${id}?ok=1`);
  }

  const { data, error } = await supabase
    .from("albums")
    .insert({ ...payload, created_by: session.userId })
    .select("id")
    .single();
  if (error || !data) {
    console.error("albums.insert_failed");
    redirect("/admin/gallery?error=save");
  }
  revalidateGallery(slug);
  redirect(`/admin/gallery/${data.id}?ok=1`);
}

export async function deleteAlbumAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/gallery?error=delete");

  const { data: photos } = await supabase
    .from("photos")
    .select("id, storage_path")
    .eq("album_id", id);

  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) {
    console.error("albums.delete_failed");
    redirect("/admin/gallery?error=delete");
  }

  for (const photo of photos ?? []) {
    const path = photo.storage_path as string;
    const used = await isMediaPathReferenced(path);
    if (!used) await deleteStorageObject("public-media", path);
  }

  revalidateGallery();
  redirect("/admin/gallery?ok=deleted");
}

export async function setAlbumStatusAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const status = str(formData, "status") as ContentStatus;
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/gallery?error=save");

  const { error } = await supabase.from("albums").update({ status }).eq("id", id);
  if (error) {
    console.error("albums.status_failed");
    redirect("/admin/gallery?error=save");
  }

  revalidateGallery();
  redirect(`/admin/gallery/${id}?ok=1`);
}

export async function uploadPhotosAction(formData: FormData): Promise<void> {
  await requireStaff();
  const albumId = str(formData, "album_id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !albumId) redirect("/admin/gallery?error=upload");

  const files = formData.getAll("photos").filter((item): item is File => {
    return typeof File !== "undefined" && item instanceof File && item.size > 0;
  });

  if (files.length === 0) {
    redirect(`/admin/gallery/${albumId}?error=${encodeURIComponent("Выберите файлы")}`);
  }

  const { data: existing } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1);
  let nextOrder = ((existing?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  for (const file of files) {
    const uploaded = await uploadPublicMedia(file, `albums/${albumId}`);
    if (!uploaded.ok) {
      redirect(`/admin/gallery/${albumId}?error=${encodeURIComponent(uploaded.message)}`);
    }
    const alt = file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "Фото";
    const { error } = await supabase.from("photos").insert({
      album_id: albumId,
      storage_path: uploaded.path,
      alt,
      sort_order: nextOrder,
    });
    if (error) {
      console.error("photos.insert_failed");
      await deleteStorageObject("public-media", uploaded.path);
      redirect(`/admin/gallery/${albumId}?error=upload`);
    }
    nextOrder += 1;
  }

  revalidateGallery();
  redirect(`/admin/gallery/${albumId}?ok=1`);
}

export async function updatePhotoAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const albumId = str(formData, "album_id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id || !albumId) redirect("/admin/gallery?error=save");

  const sortOrder = Number(str(formData, "sort_order") || "0");
  const { error } = await supabase
    .from("photos")
    .update({
      alt: str(formData, "alt") || "Фото",
      caption: str(formData, "caption") || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("id", id);

  if (error) {
    console.error("photos.update_failed");
    redirect(`/admin/gallery/${albumId}?error=save`);
  }

  revalidateGallery();
  redirect(`/admin/gallery/${albumId}?ok=1`);
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const albumId = str(formData, "album_id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id || !albumId) redirect("/admin/gallery?error=delete");

  const { data } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  await supabase
    .from("albums")
    .update({ cover_photo_id: null })
    .eq("id", albumId)
    .eq("cover_photo_id", id);

  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) {
    console.error("photos.delete_failed");
    redirect(`/admin/gallery/${albumId}?error=delete`);
  }

  const path = data?.storage_path as string | undefined;
  if (path) {
    const used = await isMediaPathReferenced(path);
    if (!used) await deleteStorageObject("public-media", path);
  }

  revalidateGallery();
  redirect(`/admin/gallery/${albumId}?ok=1`);
}

export async function setAlbumCoverAction(formData: FormData): Promise<void> {
  await requireStaff();
  const albumId = str(formData, "album_id");
  const photoId = str(formData, "photo_id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !albumId || !photoId) redirect("/admin/gallery?error=save");

  const { error } = await supabase
    .from("albums")
    .update({ cover_photo_id: photoId })
    .eq("id", albumId);
  if (error) {
    console.error("albums.cover_failed");
    redirect(`/admin/gallery/${albumId}?error=save`);
  }

  revalidateGallery();
  redirect(`/admin/gallery/${albumId}?ok=1`);
}
