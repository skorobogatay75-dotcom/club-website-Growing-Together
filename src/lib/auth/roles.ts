export type StaffRole = "admin" | "editor";

export function canManageSettings(role: StaffRole): boolean {
  return role === "admin";
}

export function canManageContent(role: StaffRole): boolean {
  return role === "admin" || role === "editor";
}
