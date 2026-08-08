import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Членство",
  "Варианты членства в семейном клубе «Вместе растём».",
);

export default function MembershipPage() {
  return (
    <SectionPlaceholder
      title="Членство"
      description="Преимущества и варианты членства будут опубликованы из админ-панели. Пока тарифы не заполнены, на сайте не показываются пустые карточки."
    />
  );
}
