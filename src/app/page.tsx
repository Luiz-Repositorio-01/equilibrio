import {
  getFeaturedArticle,
  getPopularArticles,
  getRecentArticles,
} from "@/lib/articles";
import { getTodaysReflection } from "@/lib/daily";
import { AmbientPointer } from "@/components/cinema/AmbientPointer";
import { HomeHero } from "@/components/home/HomeHero";
import { DailyPill } from "@/components/home/DailyPill";
import {
  HomeContentHub,
  HomeFAQ,
  HomeFeatureRail,
  HomeSponsors,
  HomeTestimonials,
  HomeTrustStrip,
  SocialRail,
} from "@/components/home/HomeSections";
import { AdSlot } from "@/components/ui/AdSlot";
import { Reveal } from "@/components/cinema/Reveal";

export const revalidate = 300;

export default async function HomePage() {
  const featured = await getFeaturedArticle();
  const popular = await getPopularArticles(6);
  const recent = await getRecentArticles(12);
  const daily = getTodaysReflection();

  return (
    <div className="cinema">
      <AmbientPointer />
      <SocialRail />
      <HomeHero featured={featured} />

      <div className="cinema-container" style={{ paddingBlock: "0.75rem 0.5rem" }}>
        <Reveal>
          <HomeFeatureRail />
        </Reveal>
      </div>

      <DailyPill reflection={daily} />

      <AdSlot id="home-top" label="Leaderboard — topo editorial" minHeight={56} frame="home-top" />

      <HomeTrustStrip />
      <HomeContentHub featured={featured} popular={popular} recent={recent} />
      <HomeSponsors />
      <HomeTestimonials />
      <HomeFAQ />
    </div>
  );
}
