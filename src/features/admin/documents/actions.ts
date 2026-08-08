"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/admin/slug";
import { deleteStorageObject, uploadPublicDocument } from "@/lib/admin/media";
import type { ContentStatus } from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateDocs() {
  revalidatePath("/documents");
  revalidatePath("/");
  revalidatePath("/admin/documents");
}

export async function saveDocumentAction(formData: FormData): Promise<void> {
  const session = await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/documents?error=save");

  const id = str(formData, "id") || null;
  const title = str(formData, "title");
  if (!title) redirect("/admin/documents?error=title");

  const file = formData.get("file") as File | null;
  let storagePath = str(formData, "storage_path") || null;
  let mimeType = str(formData, "mime_type") || "application/pdf";
  let sizeBytes = Number(str(formData, "size_bytes") || "0") || 0;
  let publicFilename = str(formData, "public_filename") || title;

  if (file && file.size > 0) {
    const uploaded = await uploadPublicDocument(file, "docs");
    if (!uploaded.ok) {
      redirect(`/admin/documents?error=${encodeURIComponent(uploaded.message)}`);
    }
    if (storagePath && storagePath !== uploaded.path) {
      await deleteStorageObject("public-documents", storagePath);
    }
    storagePath = uploaded.path;
    mimeType = uploaded.mime;
    sizeBytes = uploaded.size;
    publicFilename = uploaded.filename || title;
  }

  if (!storagePath) {
    redirect(`/admin/documents?error=${encodeURIComponent("Нужен файл PDF или DOCX")}`);
  }

  const payload = {
    title,
    category_id: str(formData, "category_id") || null,
    storage_path: storagePath,
    public_filename: publicFilename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    document_date: str(formData, "document_date") || null,
    version: str(formData, "version") || null,
    sort_order: Number(str(formData, "sort_order") || "0") || 0,
    status: (str(formData, "status") || "draft") as ContentStatus,
    updated_by: session.userId,
  };

  if (id) {
    const { error } = await supabase.from("documents").update(payload).eq("id", id);
    if (error) {
      console.error("documents.update_failed");
      redirect("/admin/documents?error=save");
    }
  } else {
    const { error } = await supabase.from("documents").insert({
      ...payload,
      created_by: session.userId,
    });
    if (error) {
      console.error("documents.insert_failed");
      redirect("/admin/documents?error=save");
    }
  }

  revalidateDocs();
  redirect("/admin/documents?ok=1");
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/documents?error=delete");

  const { data } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    console.error("documents.delete_failed");
    redirect("/admin/documents?error=delete");
  }

  if (data?.storage_path) {
    await deleteStorageObject("public-documents", data.storage_path as string);
  }

  revalidateDocs();
  redirect("/admin/documents?ok=deleted");
}

export async function saveDocumentCategoryAction(formData: FormData): Promise<void> {
  await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/documents?error=category");

  const name = str(formData, "name");
  if (!name) redirect("/admin/documents?error=category");

  const slug = slugify(str(formData, "slug") || name) || `cat-${Date.now()}`;
  const { error } = await supabase.from("document_categories").insert({
    name,
    slug,
    description: str(formData, "description") || null,
    sort_order: Number(str(formData, "sort_order") || "0") || 0,
    is_active: true,
  });

  if (error) {
    console.error("document_categories.insert_failed");
    redirect("/admin/documents?error=category");
  }

  revalidateDocs();
  redirect("/admin/documents?ok=1");
}
