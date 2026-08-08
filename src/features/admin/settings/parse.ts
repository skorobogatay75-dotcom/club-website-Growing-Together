type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClubSettings = {
  name: string;
  tagline: string;
  timezone: string;
};

export type ContactsSettings = {
  address: string;
  phone: string;
  email: string;
  hours: string;
  telegram: string;
  whatsapp: string;
};

function asRecord(value: Json | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function textField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function hasPublicValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/нужно\s+заполнить/i.test(trimmed)) return false;
  return true;
}

export function parseClubSettings(map: Map<string, Json>): ClubSettings {
  const name = asRecord(map.get("club.name"));
  const tagline = asRecord(map.get("club.tagline"));
  const timezone = asRecord(map.get("club.timezone"));
  return {
    name: textField(name.value) || "Вместе растём",
    tagline: textField(tagline.value),
    timezone: textField(timezone.value) || "Europe/Moscow",
  };
}

export function parseContactsSettings(map: Map<string, Json>): ContactsSettings {
  const contacts = asRecord(map.get("contacts.public"));
  const messengers = asRecord(contacts.messengers as Json);
  return {
    address: textField(contacts.address),
    phone: textField(contacts.phone),
    email: textField(contacts.email),
    hours: textField(contacts.hours),
    telegram: textField(messengers.telegram),
    whatsapp: textField(messengers.whatsapp),
  };
}

export function contactsStatusNote(contacts: ContactsSettings): string {
  const filled = [
    contacts.address,
    contacts.phone,
    contacts.email,
    contacts.hours,
    contacts.telegram,
    contacts.whatsapp,
  ].some((value) => hasPublicValue(value));
  return filled ? "ready" : "needs_fill";
}
