import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Новости",
  "Новости и анонсы семейного клуба «Вместе растём».",
);

export default function NewsPage() {
  return (
    <SectionPlaceholder
      title="Новости"
      description="Лента публикаций появится после первых опубликованных новостей в админ-панели."
    />
  );
}
