// HomePage: Zusammensetzung der Landingpage-Sektionen.
import { MainNav } from '../components/navigation/main-nav';
import { HeroSection } from '../components/sections/hero';
import { ServicesSection } from '../components/sections/services';
import { MissionSection } from '../components/sections/mission';
import { CaseStudiesSection } from '../components/sections/case-studies';
import { ProcessSection } from '../components/sections/process';
import { RoiSection } from '../components/sections/roi';
import { InsightsSection } from '../components/sections/insights';
import { ContactSection } from '../components/sections/contact';

export default function HomePage() {
  return (
    <main>
      <MainNav />
      <HeroSection />
      <ServicesSection />
      <ProcessSection />
      <MissionSection />
      <CaseStudiesSection />
      <RoiSection />
      <InsightsSection />
      <ContactSection />
    </main>
  );
}
