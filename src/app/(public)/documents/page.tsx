import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Документы",
  "Публичные документы семейного клуба «Вместе растём».",
);

export default function DocumentsPage() {
  return (
    <SectionPlaceholder
      title="Документы"
      description="Категории и файлы для скачивания появятся после публикации документов в админ-панели."
    />
  );
}
