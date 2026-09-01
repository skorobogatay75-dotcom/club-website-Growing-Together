import { createSectionMetadata } from "@/components/public/SectionPlaceholder";
import { LegalDocumentPage } from "@/components/public/LegalDocumentPage";

export const metadata = createSectionMetadata(
  "Согласие на обработку данных",
  "Текст согласия на обработку персональных данных.",
);

export const revalidate = 60;

export default function ConsentPage() {
  return (
    <LegalDocumentPage
      kind="consent"
      title="Согласие на обработку персональных данных"
      description="Утверждённый текст согласия, которое вы подтверждаете при отправке заявки."
    />
  );
}
