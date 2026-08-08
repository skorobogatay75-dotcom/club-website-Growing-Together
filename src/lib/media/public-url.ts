import { getSupabasePublicEnv } from "@/lib/supabase/env";

/** Публичный URL объекта Storage или null. */
export function publicStorageUrl(
  bucket: "public-media" | "public-documents",
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const env = getSupabasePublicEnv();
  if (!env) return null;
  const clean = path.replace(/^\/+/, "");
  return `${env.url}/storage/v1/object/public/${bucket}/${clean}`;
}
