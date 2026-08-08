import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Политика конфиденциальности",
  "Политика конфиденциальности семейного клуба «Вместе растём».",
);

export default function PrivacyPage() {
  return (
    <SectionPlaceholder
      title="Политика конфиденциальности"
      description="Утверждённый юридический текст будет размещён здесь после согласования. До этого страница не содержит выдуманных положений."
    />
  );
}
