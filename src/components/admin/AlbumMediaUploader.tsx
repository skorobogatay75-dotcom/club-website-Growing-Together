"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Field } from "@/components/admin/ui";
import { registerAlbumMediaAction } from "@/features/admin/gallery/actions";
import {
  extensionForMime,
  isVideoMime,
  validateAlbumMediaFile,
} from "@/lib/admin/media-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  albumId: string;
};

export function AlbumMediaUploader({ albumId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setProgress(null);

    const form = event.currentTarget;
    const input = form.elements.namedItem("photos") as HTMLInputElement | null;
    const files = Array.from(input?.files ?? []).filter((file) => file.size > 0);

    if (files.length === 0) {
      setError("Выберите файлы");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const uploaded: Array<{
          path: string;
          mime: string;
          filename: string;
        }> = [];

        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          const validated = validateAlbumMediaFile(file);
          if (!validated.ok) {
            setError(validated.message);
            return;
          }

          setProgress(
            `Загрузка ${i + 1} из ${files.length}: ${file.name}${
              isVideoMime(file.type) ? " (видео)" : ""
            }`,
          );

          const path = `albums/${albumId}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;
          const { error: uploadError } = await supabase.storage
            .from("public-media")
            .upload(path, file, {
              contentType: file.type,
              upsert: false,
              cacheControl: "3600",
            });

          if (uploadError) {
            console.error(uploadError);
            setError(
              uploadError.message.includes("mime")
                ? "Этот формат не разрешён в Storage. Выполните SQL-миграцию для видео."
                : "Не удалось загрузить файл в хранилище.",
            );
            return;
          }

          uploaded.push({
            path,
            mime: file.type,
            filename: file.name,
          });
        }

        setProgress("Сохраняем в альбом…");
        const result = await registerAlbumMediaAction({
          albumId,
          items: uploaded,
        });

        if (!result.ok) {
          setError(result.message);
          return;
        }

        form.reset();
        setProgress(null);
        router.refresh();
        router.replace(`/admin/gallery/${albumId}?ok=1`);
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки. Проверьте соединение и попробуйте снова.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Загрузить (несколько файлов)">
          <input
            className="field-input"
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            multiple
            disabled={pending}
          />
        </Field>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Загрузка…" : "Загрузить"}
        </button>
      </div>
      {progress ? <p className="text-sm text-muted">{progress}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
