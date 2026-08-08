import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Программы",
  "Каталог программ семейного клуба «Вместе растём» с фильтрами по возрасту и формату.",
);

export default function ProgramsPage() {
  return (
    <SectionPlaceholder
      title="Программы"
      description="Каталог программ с поиском и фильтрами появится после публикации материалов в админ-панели."
    />
  );
}
