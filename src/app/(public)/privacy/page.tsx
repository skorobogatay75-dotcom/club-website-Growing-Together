import { createSectionMetadata } from "@/components/public/SectionPlaceholder";
import { LegalDocumentPage } from "@/components/public/LegalDocumentPage";

export const metadata = createSectionMetadata(
  "Политика конфиденциальности",
  "Политика конфиденциальности семейного клуба «Вместе растём».",
);

export const revalidate = 60;

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      kind="privacy"
      title="Политика конфиденциальности"
      description="Утверждённый документ о том, как клуб обрабатывает персональные данные."
    />
  );
}
