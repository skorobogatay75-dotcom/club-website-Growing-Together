import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Контакты",
  "Как связаться с семейным клубом «Вместе растём».",
);

export default function ContactsPage() {
  return (
    <SectionPlaceholder
      title="Контакты"
      description="Адрес, часы работы, телефон, email и мессенджеры будут показаны из настроек сайта после их заполнения сотрудниками клуба."
      note="Мы не публикуем выдуманные контакты. Карта подключается только после согласования провайдера."
    />
  );
}
