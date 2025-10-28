'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqCategories = [
  {
    name: 'Allgemein',
    id: 'general',
    questions: [
      {
        q: 'Was genau macht WiesLogicAI?',
        a: 'Wir implementieren KI-gestützte Workflows für Ihr Unternehmen. Von der Beratung über die technische Umsetzung bis zum laufenden Betrieb - alles aus einer Hand. Sie bekommen ein fertiges, funktionierendes System, keine Software zum Selbstbauen.'
      },
      {
        q: 'Für welche Branchen eignet sich das?',
        a: 'Unsere Lösungen funktionieren hervorragend für Arztpraxen, Friseursalons, Anwaltskanzleien, Steuerberater, B2B-Dienstleister und den allgemeinen Mittelstand. Überall, wo Telefon, Lead-Management oder Kundenservice eine Rolle spielen.'
      },
      {
        q: 'Muss ich technisches Know-how haben?',
        a: 'Nein, absolut nicht! Wir richten alles für Sie ein, schulen Ihr Team und übernehmen die Wartung. Sie müssen uns nur sagen, was automatisiert werden soll - den Rest machen wir.'
      }
    ]
  },
  {
    name: 'Preise & Verträge',
    id: 'pricing',
    questions: [
      {
        q: 'Was kostet die Einrichtung?',
        a: 'Die Basis-Einrichtung ist im Starter-Paket (€249/Monat) bereits enthalten (Wert: €500). Beim Professional-Paket ist ein Premium-Setup inklusive (Wert: €1.500). Keine versteckten Kosten!'
      },
      {
        q: 'Gibt es Vertragslaufzeiten?',
        a: 'Nein! Alle Pakete sind monatlich kündbar. Wir sind überzeugt von unserer Leistung - Sie sollen bleiben, weil es funktioniert, nicht wegen eines Vertrags.'
      },
      {
        q: 'Was passiert, wenn ich mehr Interaktionen brauche?',
        a: 'Zusätzliche Kontingente können flexibel dazugebucht werden (€0,50 pro zusätzliche Interaktion). Wir melden uns proaktiv, wenn Sie Ihr Limit erreichen, damit nichts verloren geht.'
      },
      {
        q: 'Kann ich das Paket wechseln?',
        a: 'Ja, jederzeit! Sie können upgraden oder downgraden. Beim Upgrade erfolgt die Umstellung sofort, beim Downgrade zum nächsten Abrechnungszeitraum.'
      }
    ]
  },
  {
    name: 'Technisch',
    id: 'technical',
    questions: [
      {
        q: 'Wie lange dauert die Einrichtung?',
        a: 'Starter-Workflows: 3-5 Werktage. Professional: 1-2 Wochen. Enterprise: 2-4 Wochen, je nach Komplexität. In dringenden Fällen ist auch ein Express-Setup möglich (gegen Aufpreis).'
      },
      {
        q: 'Welche Systeme könnt ihr anbinden?',
        a: 'Wir integrieren Google Kalender, Microsoft Outlook, alle gängigen CRM-Systeme (HubSpot, Salesforce, Pipedrive etc.), Praxis-Software (Medatixx, CGM, Turbomed), Excel/Google Sheets, n8n, Make, Zapier und viele mehr. Falls Ihr System nicht dabei ist, fragen Sie einfach!'
      },
      {
        q: 'Was ist, wenn es technische Probleme gibt?',
        a: 'Starter-Kunden: E-Mail-Support mit 24h Reaktionszeit. Professional: Priority Support mit 4h Reaktionszeit. Enterprise: Dedizierte Hotline. Kritische Ausfälle werden immer sofort bearbeitet.'
      },
      {
        q: 'Kann die KI auch mehrere Sprachen?',
        a: 'Ja! Deutsch, Englisch, Französisch, Spanisch, Türkisch und viele weitere. Die KI erkennt automatisch die Sprache des Anrufers und antwortet entsprechend.'
      }
    ]
  },
  {
    name: 'Datenschutz',
    id: 'privacy',
    questions: [
      {
        q: 'Ist das DSGVO-konform?',
        a: 'Absolut. Serverstandort Deutschland, alle Daten verschlüsselt (TLS/SSL), DSGVO-Audit verfügbar. Wir haben einen Datenschutzbeauftragten und stellen Ihnen alle nötigen Unterlagen für Ihre Datenschutzdokumentation bereit.'
      },
      {
        q: 'Wo werden die Daten gespeichert?',
        a: 'Alle Daten werden ausschließlich auf Servern in Deutschland gespeichert (Rechenzentrum Frankfurt/Main). Keine Cloud-Anbieter außerhalb der EU. Made in Germany, hosted in Germany.'
      },
      {
        q: 'Wer hat Zugriff auf unsere Daten?',
        a: 'Nur Sie und Ihr autorisiertes Team. Wir als Dienstleister haben nur im Rahmen von Support-Anfragen und mit Ihrer ausdrücklichen Genehmigung temporären Zugriff. Keine Weitergabe an Dritte.'
      },
      {
        q: 'Was passiert mit den Daten nach Vertragsende?',
        a: 'Sie bekommen einen vollständigen Export aller Daten (CSV/JSON). Nach 30 Tagen werden alle Daten unwiderruflich gelöscht. Sie erhalten eine schriftliche Löschbestätigung.'
      }
    ]
  },
  {
    name: 'Integration',
    id: 'integration',
    questions: [
      {
        q: 'Ersetzt die KI meine Mitarbeiter?',
        a: 'Nein, sie unterstützt Ihr Team! Die KI übernimmt repetitive Aufgaben (Terminbuchung, erste Anfragen, Standard-Support), sodass Ihre Mitarbeiter mehr Zeit für die wirklich wichtigen Aufgaben haben. Zufriedenere Mitarbeiter, zufriedenere Kunden.'
      },
      {
        q: 'Wie schulen wir unser Team?',
        a: 'Wir bieten eine 1-stündige Live-Schulung (Starter), ausführliche Optimierungs-Calls (Professional) oder Vor-Ort-Training (Enterprise). Zusätzlich gibt es Video-Tutorials und eine Wissensdatenbank.'
      },
      {
        q: 'Kann ich die KI an unsere Prozesse anpassen?',
        a: 'Ja! Professional und Enterprise-Kunden können Workflows individuell anpassen lassen. Wir beraten Sie, welche Prozesse am meisten Potenzial haben und setzen maßgeschneiderte Lösungen um.'
      }
    ]
  }
]

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

  const activeQuestions = faqCategories.find(cat => cat.id === activeCategory)?.questions || []

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden bg-primary-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px]
        bg-purple-500/5 blur-[200px]" />

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Kicker */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-purple-500/10 border border-purple-500/30
            text-purple-500 text-sm font-semibold uppercase tracking-wider mb-6">
            <HelpCircle className="w-4 h-4" />
            Häufige Fragen
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">Noch Fragen?</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-electric-500">
                Wir antworten
              </span>
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Die wichtigsten Antworten zu KI-Automatisierung, Preisen und Datenschutz
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id)
                setOpenQuestion(0)
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300
                ${activeCategory === category.id
                  ? 'bg-electric-500 text-primary-900 shadow-[0_0_30px_rgba(0,240,255,0.4)]'
                  : 'bg-primary-800/50 text-gray-300 border border-white/10 hover:border-electric-500/50'
                }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {activeQuestions.map((faq, index) => {
            const isOpen = openQuestion === index

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`overflow-hidden rounded-2xl border transition-all duration-300
                  ${isOpen
                    ? 'bg-gradient-to-br from-primary-800/50 to-primary-900/50 border-electric-500/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                    : 'bg-primary-800/30 border-white/10 hover:border-white/20'
                  }`}
              >
                {/* Question */}
                <button
                  onClick={() => setOpenQuestion(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                >
                  <span className={`font-semibold text-lg transition-colors
                    ${isOpen ? 'text-electric-500' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-6 h-6 flex-shrink-0 transition-colors
                      ${isOpen ? 'text-electric-500' : 'text-gray-400'}`} />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-300 mb-6">
            Ihre Frage ist nicht dabei?
          </p>
          <motion.a
            href="/de/kontakt"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4
              bg-gradient-to-r from-purple-500 to-electric-500
              text-white rounded-full font-display font-bold text-lg
              shadow-[0_0_40px_rgba(168,85,247,0.4)]
              hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]
              transition-all duration-300"
          >
            Persönlich beraten lassen
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
