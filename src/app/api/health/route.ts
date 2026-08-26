import { APP_VERSION } from "@/lib/app-version";

/** Проверка, что на сервере актуальная сборка (без входа в админку). */
export async function GET() {
  return Response.json({
    ok: true,
    version: APP_VERSION,
    features: {
      ageTextField: true,
      moscowTimezoneSave: true,
    },
  });
}
