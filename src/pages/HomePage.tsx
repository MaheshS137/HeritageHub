import { HeroSection } from '../components/home/HeroSection';
import { HomepageMapSection } from '../components/home/HomepageMapSection';
import { IntroSection } from '../components/home/IntroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { FeaturedDestinations } from '../components/home/FeaturedDestinations';
import { FestivalsAndArtsSection } from '../components/home/FestivalsAndArtsSection';
import { AboutTeaserSection } from '../components/home/AboutTeaserSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <HomepageMapSection />
      <IntroSection />
      <FeaturedCategories />
      <FeaturedDestinations />
      <FestivalsAndArtsSection />
      <AboutTeaserSection />
    </>
  );
}
