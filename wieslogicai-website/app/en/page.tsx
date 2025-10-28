import HeroSectionEN from '@/components/sections/HeroSectionEN'
import SocialProofBarEN from '@/components/sections/SocialProofBarEN'
import FeaturesSectionEN from '@/components/sections/FeaturesSectionEN'
import ROICalculatorEN from '@/components/sections/ROICalculatorEN'
import TestimonialsSectionEN from '@/components/sections/TestimonialsSectionEN'
import PricingSectionEN from '@/components/sections/PricingSectionEN'
import FAQSectionEN from '@/components/sections/FAQSectionEN'
import CTASectionEN from '@/components/sections/CTASectionEN'

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <HeroSectionEN />
      <SocialProofBarEN />
      <FeaturesSectionEN />
      <ROICalculatorEN />
      <TestimonialsSectionEN />
      <PricingSectionEN />
      <FAQSectionEN />
      <CTASectionEN />
    </main>
  )
}
