import { MainNav } from '../components/navigation/main-nav';
import { HeroSection } from '../components/sections/hero';
import { ServicesSection } from '../components/sections/services';
import { MissionSection } from '../components/sections/mission';
import { CaseStudiesSection } from '../components/sections/case-studies';
import { ContactSection } from '../components/sections/contact';

export default function HomePage() {
  return (
    <main>
      <MainNav />
      <HeroSection />
      <ServicesSection />
      <MissionSection />
      <CaseStudiesSection />
      <ContactSection />
    </main>
  );
}
