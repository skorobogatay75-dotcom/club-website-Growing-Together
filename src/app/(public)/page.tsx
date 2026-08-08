import {
  getFeaturedPrograms,
  getLatestAlbum,
  getLatestNews,
  getPublishedMembershipPlans,
  getPublishedTeamMembers,
  getUpcomingEvents,
} from "@/features/home/queries";
import { HomeApplyCta } from "@/features/home/HomeApplyCta";
import { HomeEvents } from "@/features/home/HomeEvents";
import { HomeFormatSchema } from "@/features/home/HomeFormatSchema";
import { HomeGallery } from "@/features/home/HomeGallery";
import { HomeHero } from "@/features/home/HomeHero";
import { HomeMembership } from "@/features/home/HomeMembership";
import { HomeNews } from "@/features/home/HomeNews";
import { HomePrograms } from "@/features/home/HomePrograms";
import { HomeTrust } from "@/features/home/HomeTrust";

export const revalidate = 60;

export default async function HomePage() {
  const [news, events, programs, team, plans, album] = await Promise.all([
    getLatestNews(3),
    getUpcomingEvents(4),
    getFeaturedPrograms(6),
    getPublishedTeamMembers(),
    getPublishedMembershipPlans(),
    getLatestAlbum(),
  ]);

  return (
    <>
      <HomeHero />
      <HomeNews posts={news} />
      <HomeEvents events={events} />
      <HomeFormatSchema />
      <HomePrograms programs={programs} />
      <HomeTrust members={team} />
      <HomeMembership plans={plans} />
      <HomeGallery album={album} />
      <HomeApplyCta />
    </>
  );
}
