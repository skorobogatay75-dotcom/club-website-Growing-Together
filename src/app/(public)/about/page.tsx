import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "О клубе",
  "Миссия, история и принципы семейного клуба «Вместе растём».",
);

export default function AboutPage() {
  return (
    <SectionPlaceholder
      title="О клубе"
      description="Расскажем о формате встреч, команде педагогов и принципах безопасного общения — после заполнения материалов в админ-панели."
    />
  );
}
