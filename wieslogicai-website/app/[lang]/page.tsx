import HeroSectionDE from '@/components/sections/HeroSectionDE'
import SocialProofBar from '@/components/sections/SocialProofBar'
import FeaturesSectionDE from '@/components/sections/FeaturesSectionDE'
import ROICalculator from '@/components/sections/ROICalculator'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import PricingSectionDE from '@/components/sections/PricingSectionDE'
import FAQSection from '@/components/sections/FAQSection'
import CTASection from '@/components/sections/CTASection'

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <HeroSectionDE />
      <SocialProofBar />
      <FeaturesSectionDE />
      <ROICalculator />
      <TestimonialsSection />
      <PricingSectionDE />
      <FAQSection />
      <CTASection />
    </main>
  )
}
