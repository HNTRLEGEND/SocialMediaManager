'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserX, FileText } from 'lucide-react'

const sections = [
  {
    icon: Shield,
    title: '1. Datenschutz auf einen Blick',
    content: `
      <h3>Allgemeine Hinweise</h3>
      <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>

      <h3>Datenerfassung auf dieser Website</h3>
      <h4>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
      <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>

      <h4>Wie erfassen wir Ihre Daten?</h4>
      <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
      <p>Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>
    `
  },
  {
    icon: Lock,
    title: '2. Hosting und Content Delivery Networks (CDN)',
    content: `
      <h3>Externes Hosting</h3>
      <p>Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.</p>
      <p><strong>Serverstandort:</strong> Deutschland (Frankfurt am Main)</p>
      <p><strong>DSGVO-konform:</strong> Ja, Auftragsverarbeitungsvertrag vorhanden</p>
      <p>Der Einsatz des Hosters erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).</p>
    `
  },
  {
    icon: Database,
    title: '3. Allgemeine Hinweise und Pflichtinformationen',
    content: `
      <h3>Datenschutz</h3>
      <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>

      <h3>Hinweis zur verantwortlichen Stelle</h3>
      <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
      <p>
        <strong>Tenify.AI</strong><br>
        Daniel Wies<br>
        Charleville-Mezieres-Platz 5<br>
        48249 Dülmen<br>
        Deutschland
      </p>
      <p>Telefon: +49 151 404 32 992<br>
      E-Mail: hello@tenify.ai</p>

      <h3>Speicherdauer</h3>
      <p>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.</p>
    `
  },
  {
    icon: Eye,
    title: '4. Datenerfassung auf dieser Website',
    content: `
      <h3>Kontaktformular</h3>
      <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.</p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung)</p>
      <p><strong>Speicherdauer:</strong> Bis zur vollständigen Bearbeitung Ihrer Anfrage, danach 30 Tage, sofern keine geschäftliche Beziehung entsteht</p>

      <h3>Anfrage per E-Mail, Telefon oder Telefax</h3>
      <p>Wenn Sie uns per E-Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet.</p>

      <h3>Server-Log-Dateien</h3>
      <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt:</p>
      <ul>
        <li>Browsertyp und Browserversion</li>
        <li>Verwendetes Betriebssystem</li>
        <li>Referrer URL</li>
        <li>Hostname des zugreifenden Rechners</li>
        <li>Uhrzeit der Serveranfrage</li>
        <li>IP-Adresse (anonymisiert)</li>
      </ul>
      <p>Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
    `
  },
  {
    icon: FileText,
    title: '5. Ihre Rechte',
    content: `
      <h3>Auskunftsrecht</h3>
      <p>Sie haben das Recht, jederzeit Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten.</p>

      <h3>Recht auf Berichtigung, Löschung und Einschränkung</h3>
      <p>Sie haben das Recht, jederzeit die Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.</p>

      <h3>Recht auf Datenübertragbarkeit</h3>
      <p>Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.</p>

      <h3>Widerspruchsrecht</h3>
      <p>Sie haben das Recht, jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen, wenn die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO erfolgt.</p>

      <h3>Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
      <p>Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde zu. Das Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe.</p>
    `
  },
  {
    icon: UserX,
    title: '6. Widerruf Ihrer Einwilligung zur Datenverarbeitung',
    content: `
      <p>Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.</p>

      <h3>Kontakt für Datenschutzfragen</h3>
      <p>Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail:</p>
      <p><strong className="text-electric-500">datenschutz@tenify.ai</strong></p>
    `
  }
]

export default function DatenschutzPage() {
  return (
    <main className="relative min-h-screen bg-primary-950 pt-32 pb-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-electric-500/10 border border-electric-500/30
              text-electric-500 text-sm font-semibold uppercase tracking-wider mb-6">
              <Shield className="w-4 h-4" />
              DSGVO-konform
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Datenschutz
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
                erklärung
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ihre Daten sind bei uns sicher. Transparenz und Datenschutz sind uns wichtig.
            </p>
          </div>

          {/* Last Updated */}
          <div className="mb-12 p-4 bg-electric-500/10 border border-electric-500/30 rounded-xl text-center">
            <p className="text-gray-300">
              <span className="text-white font-semibold">Stand:</span> {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
                  backdrop-blur-xl border border-white/10 rounded-3xl"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-electric-500/10 rounded-xl
                    flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-electric-500" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white pt-2">
                    {section.title}
                  </h2>
                </div>

                <div
                  className="prose prose-invert prose-lg max-w-none
                    [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3
                    [&_h4]:font-semibold [&_h4]:text-lg [&_h4]:text-gray-200 [&_h4]:mt-4 [&_h4]:mb-2
                    [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:text-gray-300 [&_ul]:space-y-2 [&_ul]:mb-4
                    [&_li]:pl-2
                    [&_strong]:text-white [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </motion.div>
            ))}
          </div>

          {/* Important Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-r from-gold-500/10 to-electric-500/10
              border border-gold-500/30 rounded-2xl"
          >
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              Wichtiger Hinweis
            </h3>
            <div className="text-gray-300 space-y-4">
              <p>
                Diese Datenschutzerklärung ist ein Template und muss an Ihre konkreten Gegebenheiten angepasst werden.
              </p>
              <p>
                <span className="text-gold-500 font-semibold">Bitte ersetzen Sie:</span>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Alle Platzhalter in [eckigen Klammern] durch Ihre tatsächlichen Daten</li>
                <li>Falls Sie Analytics, Cookies oder andere Tracking-Tools verwenden: Entsprechende Abschnitte ergänzen</li>
                <li>Falls Sie Social Media Plugins nutzen: Entsprechende Hinweise hinzufügen</li>
              </ul>
              <p className="mt-6 text-white font-semibold">
                Für eine rechtssichere Datenschutzerklärung empfehlen wir die Beratung durch einen Fachanwalt für IT-Recht
                oder die Nutzung von professionellen Datenschutz-Generatoren.
              </p>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-300 mb-6 text-lg">
              Fragen zum Datenschutz?
            </p>
            <motion.a
              href="mailto:datenschutz@tenify.ai"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4
                bg-gradient-to-r from-electric-500 to-neon-500
                text-primary-900 rounded-full font-display font-bold text-lg
                shadow-[0_0_40px_rgba(0,240,255,0.4)]
                hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]
                transition-all duration-300"
            >
              Kontaktieren Sie uns
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
