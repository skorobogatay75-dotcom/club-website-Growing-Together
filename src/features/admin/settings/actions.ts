"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteStorageObject,
  isMediaPathReferenced,
  uploadPublicMedia,
} from "@/lib/admin/media";
import {
  contactsStatusNote,
  type ContactsSettings,
} from "@/features/admin/settings/parse";
import type { ContentStatus } from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

async function upsertSetting(key: string, value_json: Record<string, unknown>, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { error } = await supabase.from("site_settings").upsert(
    {
      key,
      value_json,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) {
    console.error("settings.upsert_failed");
    return false;
  }
  return true;
}

export async function saveClubSettingsAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const name = str(formData, "name") || "Вместе растём";
  const tagline = str(formData, "tagline");
  const timezone = str(formData, "timezone") || "Europe/Moscow";

  const ok =
    (await upsertSetting("club.name", { value: name }, session.userId)) &&
    (await upsertSetting("club.tagline", { value: tagline }, session.userId)) &&
    (await upsertSetting("club.timezone", { value: timezone }, session.userId));

  if (!ok) redirect("/admin/settings?error=club");

  revalidatePath("/");
  revalidatePath("/contacts");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=club");
}

export async function saveContactsSettingsAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const contacts: ContactsSettings = {
    address: str(formData, "address"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    hours: str(formData, "hours"),
    telegram: str(formData, "telegram"),
    whatsapp: str(formData, "whatsapp"),
  };

  const payload = {
    address: contacts.address || null,
    phone: contacts.phone || null,
    email: contacts.email || null,
    hours: contacts.hours || null,
    messengers: {
      telegram: contacts.telegram || null,
      whatsapp: contacts.whatsapp || null,
    },
  };

  const status = contactsStatusNote(contacts);
  const ok =
    (await upsertSetting("contacts.public", payload, session.userId)) &&
    (await upsertSetting(
      "contacts.status",
      {
        value: status,
        note:
          status === "ready"
            ? "Контакты заполнены"
            : "НУЖНО ЗАПОЛНИТЬ: адрес, телефон, email, часы работы",
      },
      session.userId,
    ));

  if (!ok) redirect("/admin/settings?error=contacts");

  revalidatePath("/");
  revalidatePath("/contacts");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=contacts");
}

export async function saveTeamMemberAction(formData: FormData): Promise<void> {
  await requireStaff();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/team?error=team");

  const id = str(formData, "id") || null;
  const fullName = str(formData, "full_name");
  if (!fullName) redirect("/admin/team?error=team");

  const photoFile = formData.get("photo") as File | null;
  let photoPath = str(formData, "photo_path") || null;
  if (photoFile && photoFile.size > 0) {
    const uploaded = await uploadPublicMedia(photoFile, "team");
    if (!uploaded.ok) {
      redirect(`/admin/team?error=${encodeURIComponent(uploaded.message)}`);
    }
    if (photoPath && photoPath !== uploaded.path) {
      const used = await isMediaPathReferenced(photoPath);
      if (!used) await deleteStorageObject("public-media", photoPath);
    }
    photoPath = uploaded.path;
  }

  const payload = {
    full_name: fullName,
    role_title: str(formData, "role_title") || null,
    bio: str(formData, "bio") || null,
    photo_path: photoPath,
    sort_order: Number(str(formData, "sort_order") || "0") || 0,
    is_active: bool(formData, "is_active"),
    status: (str(formData, "status") || "draft") as ContentStatus,
  };

  if (id) {
    const { error } = await supabase.from("team_members").update(payload).eq("id", id);
    if (error) {
      console.error("team.update_failed");
      redirect("/admin/team?error=team");
    }
  } else {
    const { error } = await supabase.from("team_members").insert(payload);
    if (error) {
      console.error("team.insert_failed");
      redirect("/admin/team?error=team");
    }
  }

  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/admin/team");
  redirect("/admin/team?ok=team");
}

export async function deleteTeamMemberAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = str(formData, "id");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/team?error=team");

  const { data } = await supabase
    .from("team_members")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) {
    console.error("team.delete_failed");
    redirect("/admin/team?error=team");
  }

  const photo = data?.photo_path as string | null | undefined;
  if (photo) {
    const used = await isMediaPathReferenced(photo);
    if (!used) await deleteStorageObject("public-media", photo);
  }

  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/admin/team");
  redirect("/admin/team?ok=deleted");
}
