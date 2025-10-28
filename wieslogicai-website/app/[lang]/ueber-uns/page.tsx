import { Metadata } from 'next'
import { motion } from 'framer-motion'
import Image from 'next/image'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'Über uns - WiesLogicAI | KI-Automatisierung Made in Germany',
  description: 'Lernen Sie das Team hinter WiesLogicAI kennen. Wir sind spezialisiert auf KI-Automatisierung für den deutschen Mittelstand - persönlich, transparent, erfolgsorientiert.',
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-primary-950">
      <AboutContent />
    </main>
  )
}
