import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Согласие на обработку данных",
  "Текст согласия на обработку персональных данных.",
);

export default function ConsentPage() {
  return (
    <SectionPlaceholder
      title="Согласие на обработку данных"
      description="Утверждённый текст согласия появится после юридической проверки. Форма заявки будет ссылаться на эту страницу."
    />
  );
}
