import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Записаться",
  "Заявка на программу, событие или членство в клубе «Вместе растём».",
);

export default function ApplyPage() {
  return (
    <SectionPlaceholder
      title="Записаться"
      description="Форма заявки с проверкой на сервере, защитой от спама и уведомлением сотрудникам будет подключена на этапе форм."
      note="После отправки заявки мы свяжемся с вами, чтобы уточнить детали. Сама форма появится после настройки базы данных."
    />
  );
}
