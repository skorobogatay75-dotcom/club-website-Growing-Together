import { createSectionMetadata } from "@/components/public/SectionPlaceholder";
import { LegalDocumentPage } from "@/components/public/LegalDocumentPage";

export const metadata = createSectionMetadata(
  "Оферта",
  "Публичная оферта семейного клуба «Вместе растём».",
);

export const revalidate = 60;

export default function OfferPage() {
  return (
    <LegalDocumentPage
      kind="offer"
      title="Оферта"
      description="Утверждённый документ с условиями оказания услуг и информационных продуктов клуба."
    />
  );
}
