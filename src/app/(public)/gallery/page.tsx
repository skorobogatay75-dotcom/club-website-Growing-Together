import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Фоторепортажи",
  "Фотоальбомы встреч семейного клуба «Вместе растём».",
);

export default function GalleryPage() {
  return (
    <SectionPlaceholder
      title="Фоторепортажи"
      description="Альбомы с адаптивной сеткой и доступным lightbox появятся после загрузки материалов. Имена детей в подписях и URL не используются."
    />
  );
}
