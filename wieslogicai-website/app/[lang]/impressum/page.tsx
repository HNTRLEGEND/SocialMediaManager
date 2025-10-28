'use client'

import { motion } from 'framer-motion'
import { Scale } from 'lucide-react'

export default function ImpressumPage() {
  return (
    <main className="relative min-h-screen bg-primary-950 pt-32 pb-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-electric-500/10 border border-electric-500/30
              text-electric-500 text-sm font-semibold uppercase tracking-wider mb-6">
              <Scale className="w-4 h-4" />
              Rechtliche Informationen
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Impressum
            </h1>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
              backdrop-blur-xl border border-white/10 rounded-3xl space-y-8">

              {/* Angaben gemäß § 5 TMG */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Angaben gemäß § 5 TMG
                </h2>
                <div className="text-gray-300 space-y-2">
                  <p className="text-white font-semibold">
                    Tenify.AI
                  </p>
                  <p>Daniel Wies</p>
                  <p>Charleville-Mezieres-Platz 5</p>
                  <p>48249 Dülmen</p>
                  <p>Deutschland</p>
                </div>
              </section>

              {/* Kontakt */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Kontakt
                </h2>
                <div className="text-gray-300 space-y-2">
                  <p>Telefon: +49 151 404 32 992</p>
                  <p>E-Mail: hello@tenify.ai</p>
                </div>
              </section>

              {/* Umsatzsteuer-ID */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Umsatzsteuer-ID
                </h2>
                <div className="text-gray-300">
                  <p>
                    Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                  </p>
                  <p className="text-electric-500 font-semibold">
                    [Ihre USt-IdNr. - falls vorhanden]
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Falls Sie keine USt-ID haben, können Sie diesen Abschnitt entfernen oder durch "Wird beantragt" ersetzen.
                  </p>
                </div>
              </section>

              {/* Berufsbezeichnung */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Berufsbezeichnung
                </h2>
                <div className="text-gray-300">
                  <p>IT-Beratung und Software-Dienstleistungen</p>
                </div>
              </section>

              {/* Verantwortlich für den Inhalt */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                </h2>
                <div className="text-gray-300">
                  <p>Daniel Wies</p>
                  <p>Charleville-Mezieres-Platz 5</p>
                  <p>48249 Dülmen</p>
                </div>
              </section>

              {/* EU-Streitschlichtung */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  EU-Streitschlichtung
                </h2>
                <div className="text-gray-300">
                  <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                  </p>
                  <p>
                    <a
                      href="https://ec.europa.eu/consumers/odr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-electric-500 hover:underline"
                    >
                      https://ec.europa.eu/consumers/odr/
                    </a>
                  </p>
                  <p className="mt-2">
                    Unsere E-Mail-Adresse finden Sie oben im Impressum.
                  </p>
                </div>
              </section>

              {/* Verbraucherstreitbeilegung */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Verbraucherstreitbeilegung / Universalschlichtungsstelle
                </h2>
                <div className="text-gray-300">
                  <p>
                    Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </div>
              </section>

              {/* Haftungsausschluss */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Haftung für Inhalte
                </h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                    nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                    Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                    Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                    rechtswidrige Tätigkeit hinweisen.
                  </p>
                  <p>
                    Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
                    allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
                    erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
                    Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
                    entfernen.
                  </p>
                </div>
              </section>

              {/* Haftung für Links */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Haftung für Links
                </h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
                    Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
                    übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
                    Betreiber der Seiten verantwortlich.
                  </p>
                </div>
              </section>

              {/* Urheberrecht */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Urheberrecht
                </h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                    unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung
                    und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                    schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>
              </section>

              {/* Note */}
              <div className="mt-12 p-6 bg-gold-500/10 border border-gold-500/30 rounded-xl">
                <p className="text-sm text-gray-300">
                  <span className="text-gold-500 font-semibold">Hinweis:</span> Bitte ersetzen Sie die
                  Platzhalter (in [eckigen Klammern]) durch Ihre tatsächlichen Daten. Für eine rechtssichere
                  Absicherung empfehlen wir die Nutzung eines professionellen Impressum-Generators oder die
                  Beratung durch einen Rechtsanwalt.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
