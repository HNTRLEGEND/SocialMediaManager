import { Metadata } from 'next'
import ContactContent from './ContactContent'

export const metadata: Metadata = {
  title: 'Kontakt - WiesLogicAI | Kostenlose Beratung zu KI-Automatisierung',
  description: 'Kontaktieren Sie WiesLogicAI für eine kostenlose Beratung. Telefon, E-Mail, WhatsApp - wir sind für Sie da. Reaktionszeit: 24h.',
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-primary-950">
      <ContactContent />
    </main>
  )
}
