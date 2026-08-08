import {
  getFeaturedPrograms,
  getLatestNews,
  getPublishedMembershipPlans,
  getPublishedTeamMembers,
} from "@/features/home/queries";
import { getLatestAlbumWithCover } from "@/features/gallery/queries";
import { HomeApplyCta } from "@/features/home/HomeApplyCta";
import { HomeCalendar } from "@/features/home/HomeCalendar";
import { HomeFormatSchema } from "@/features/home/HomeFormatSchema";
import { HomeGallery } from "@/features/home/HomeGallery";
import { HomeHero } from "@/features/home/HomeHero";
import { HomeMembership } from "@/features/home/HomeMembership";
import { HomeNews } from "@/features/home/HomeNews";
import { HomePrograms } from "@/features/home/HomePrograms";
import { HomeTrust } from "@/features/home/HomeTrust";

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const [news, programs, team, plans, album] = await Promise.all([
    getLatestNews(3),
    getFeaturedPrograms(6),
    getPublishedTeamMembers(),
    getPublishedMembershipPlans(),
    getLatestAlbumWithCover(),
  ]);

  return (
    <>
      <HomeHero />
      <HomeNews posts={news} />
      <HomeCalendar
        yearParam={first(params.year)}
        monthParam={first(params.month)}
        viewParam={first(params.view)}
      />
      <HomeFormatSchema />
      <HomePrograms programs={programs} />
      <HomeTrust members={team} />
      <HomeMembership plans={plans} />
      <HomeGallery album={album} />
      <HomeApplyCta />
    </>
  );
}
