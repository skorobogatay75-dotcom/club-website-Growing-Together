import {
  SectionPlaceholder,
  createSectionMetadata,
} from "@/components/public/SectionPlaceholder";

export const metadata = createSectionMetadata(
  "Календарь событий",
  "Месячный календарь событий семейного клуба «Вместе растём».",
);

export default function EventsPage() {
  return (
    <SectionPlaceholder
      title="Календарь событий"
      description="Здесь будет полноценная месячная сетка с понедельника по воскресенье, переключением месяцев, кнопкой «Сегодня», фильтрами и мобильной повесткой."
      note="Календарный модуль подключается на следующих этапах вместе с таблицей events и RLS. Список карточек календарь не заменит."
    />
  );
}
