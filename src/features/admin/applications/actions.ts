"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateApplicationAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/applications?error=save");

  const status = str(formData, "status") as ApplicationStatus;
  const managerNote = str(formData, "manager_note");

  const { error } = await supabase
    .from("applications")
    .update({
      status,
      manager_note: managerNote || null,
    })
    .eq("id", id);

  if (error) {
    console.error("applications.update_failed");
    redirect(`/admin/applications/${id}?error=save`);
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  redirect(`/admin/applications/${id}?ok=1`);
}

export async function setApplicationStatusAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const status = str(formData, "status") as ApplicationStatus;
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id || !status) redirect("/admin/applications?error=save");

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("applications.status_failed");
    redirect("/admin/applications?error=save");
  }

  revalidatePath("/admin/applications");
  redirect("/admin/applications?ok=1");
}
