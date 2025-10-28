'use client'

import { motion } from 'framer-motion'
import { Target, Heart, Shield, Zap, Users, MapPin, TrendingUp, Award } from 'lucide-react'

const values = [
  {
    icon: Shield,
    title: 'DSGVO-Konformität',
    description: 'Datenschutz ist nicht verhandelbar. Alle unsere Systeme sind DSGVO-konform, Server in Deutschland, höchste Sicherheitsstandards.',
    color: 'electric'
  },
  {
    icon: Heart,
    title: 'Mittelstand im Fokus',
    description: 'Wir verstehen die Herausforderungen von KMU. Keine überteuerten Enterprise-Lösungen, sondern bezahlbare Automation für den Mittelstand.',
    color: 'neon'
  },
  {
    icon: Zap,
    title: 'Schnelle Umsetzung',
    description: 'Zeit ist Geld. Unsere Workflows sind in 48 Stunden einsatzbereit - nicht in 6 Monaten. Agil, pragmatisch, ergebnisorientiert.',
    color: 'gold'
  },
  {
    icon: Users,
    title: 'Persönlicher Service',
    description: 'Keine Ticket-Systeme, keine Bot-Antworten. Sie haben einen persönlichen Ansprechpartner, der Ihr Business versteht.',
    color: 'purple'
  }
]

const stats = [
  { value: '2024', label: 'Gegründet' },
  { value: '15+', label: 'Kunden' },
  { value: '500+', label: 'Stunden gespart' },
  { value: '100%', label: 'Weiterempfehlung' }
]

const colorClasses = {
  electric: 'from-electric-500 to-electric-600',
  neon: 'from-neon-500 to-neon-600',
  gold: 'from-gold-500 to-gold-600',
  purple: 'from-purple-500 to-purple-600'
}

export default function AboutContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-electric-500/10 blur-[200px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-electric-500/10 border border-electric-500/30
              text-electric-500 text-sm font-semibold uppercase tracking-wider mb-6">
              <Award className="w-4 h-4" />
              Über WiesLogicAI
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              <span className="block">KI-Automatisierung</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
                Made in Germany
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Wir helfen deutschen Unternehmen, mit KI-Automatisierung Zeit zu sparen, Kosten zu senken und zu wachsen -
              ohne technische Komplexität, ohne lange Projektlaufzeiten.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-electric-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-24 bg-primary-900">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-lg text-gray-300 leading-relaxed"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-8">
              Unsere Geschichte
            </h2>

            <p>
              Tenify.AI wurde 2024 aus einer einfachen Erkenntnis heraus gegründet:
              <span className="text-white font-semibold"> KI-Automatisierung ist kein Luxus für Konzerne, sondern eine Notwendigkeit für jeden Mittelständler.</span>
            </p>

            <p>
              Als ich als Berater durch Deutschland reiste, sah ich immer wieder dasselbe Muster:
              Arztpraxen, die täglich Dutzende Anrufe verpassen. Salons, die händisch Termine jonglieren.
              B2B-Firmen, die hunderte Leads qualifizieren müssen. Überall verschenktes Potenzial.
            </p>

            <p className="text-white font-semibold text-xl">
              Die Lösung existierte bereits - aber niemand machte sie für den Mittelstand zugänglich.
            </p>

            <p>
              Große Beratungen verkaufen 6-monatige Projekte für 100.000€+. Software-Anbieter erwarten,
              dass Sie selbst zum Entwickler werden. Wir wollten einen <span className="text-electric-500 font-semibold">anderen Weg</span>:
              Fertige Workflows, faire Preise, schnelle Umsetzung.
            </p>

            <p>
              Heute automatisieren wir über <span className="text-neon-500 font-semibold">10.000 Anrufe pro Monat</span>,
              haben unseren Kunden <span className="text-gold-500 font-semibold">500+ Stunden</span> gespart und
              dabei geholfen, Umsätze im sechsstelligen Bereich zu generieren.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
                backdrop-blur-xl border border-electric-500/20 rounded-3xl"
            >
              <Target className="w-12 h-12 text-electric-500 mb-6" />
              <h3 className="font-display text-3xl font-bold text-white mb-4">
                Unsere Mission
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Wir demokratisieren KI-Automatisierung für den deutschen Mittelstand.
                Jedes Unternehmen - egal ob Arztpraxis mit 5 Mitarbeitern oder Handwerksbetrieb mit 50 -
                soll Zugang zu modernster Technologie haben. <span className="text-white font-semibold">Bezahlbar, verständlich, wirksam.</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
                backdrop-blur-xl border border-neon-500/20 rounded-3xl"
            >
              <TrendingUp className="w-12 h-12 text-neon-500 mb-6" />
              <h3 className="font-display text-3xl font-bold text-white mb-4">
                Unsere Vision
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Bis 2027 wollen wir <span className="text-neon-500 font-semibold">1.000 deutschen Unternehmen</span> geholfen haben,
                ihre Prozesse zu automatisieren. Wir sehen eine Zukunft, in der KI-Assistenten so selbstverständlich sind
                wie ein Telefon - und <span className="text-white font-semibold">wir bauen diese Zukunft.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 bg-primary-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Unsere Werte
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Was uns antreibt und wie wir arbeiten
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
                  backdrop-blur-xl border border-white/10 rounded-3xl
                  hover:border-electric-500/30 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[value.color as keyof typeof colorClasses]}
                  rounded-2xl flex items-center justify-center mb-6
                  group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-500/10 blur-[200px]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <MapPin className="w-16 h-16 text-gold-500 mx-auto mb-6" />

            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Wir sind in <span className="text-gold-500">Dülmen, NRW</span>
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Im Herzen des Münsterlandes entwickeln wir KI-Lösungen für ganz Deutschland.
              Lokal verwurzelt, digital vernetzt. Persönliche Beratung vor Ort oder remote - ganz wie Sie möchten.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Made in Germany</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Hosted in Germany</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Support auf Deutsch</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-gradient-to-r from-electric-500/10 to-neon-500/10 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Lernen Sie uns kennen
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Buchen Sie ein kostenloses 15-Minuten-Gespräch und lassen Sie uns gemeinsam schauen,
              wie wir Ihr Business automatisieren können.
            </p>

            <motion.a
              href="/de/kontakt"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4
                bg-gradient-to-r from-electric-500 to-neon-500
                text-primary-900 rounded-full font-display font-bold text-lg
                shadow-[0_0_40px_rgba(0,240,255,0.4)]
                hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]
                transition-all duration-300"
            >
              Jetzt Kennenlernen
              <Zap className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
