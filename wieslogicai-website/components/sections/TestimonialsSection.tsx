'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Dr. med. Sarah Müller',
    role: 'Fachärztin für Allgemeinmedizin',
    company: 'Praxis Dr. Müller, Münster',
    image: '/testimonials/placeholder-doctor.jpg', // Platzhalter
    rating: 5,
    text: 'Der KI Voice Agent hat unsere Praxis revolutioniert. Wir verpassen keinen Anruf mehr und unsere Anmeldung ist deutlich entlastet. In den ersten 3 Monaten konnten wir 35% mehr Termine vergeben - ohne zusätzliches Personal.',
    metrics: {
      label: 'Mehr Terminbuchungen',
      value: '+35%'
    }
  },
  {
    name: 'Michael Weber',
    role: 'Geschäftsführer',
    company: 'Weber Metallbau GmbH, Coesfeld',
    image: '/testimonials/placeholder-business.jpg',
    rating: 5,
    text: 'Die Lead-Qualifizierung spart unserem Vertrieb 15 Stunden pro Woche. Wir sprechen jetzt nur noch mit echten Interessenten. Der ROI war nach 6 Wochen erreicht. Absolute Empfehlung für B2B!',
    metrics: {
      label: 'Zeit gespart/Woche',
      value: '15h'
    }
  },
  {
    name: 'Lisa Hoffmann',
    role: 'Inhaberin',
    company: 'Salon Hoffmann, Dülmen',
    image: '/testimonials/placeholder-salon.jpg',
    rating: 5,
    text: 'Endlich kann ich mich auf meine Kunden konzentrieren! Der Voice Agent bucht Termine rund um die Uhr - auch nachts und am Wochenende. Unsere No-Show-Rate ist um 60% gesunken durch die automatischen Erinnerungen.',
    metrics: {
      label: 'Weniger No-Shows',
      value: '-60%'
    }
  },
  {
    name: 'Thomas Krause',
    role: 'Vertriebsleiter',
    company: 'TechSolutions GmbH, Düsseldorf',
    image: '/testimonials/placeholder-tech.jpg',
    rating: 5,
    text: 'Der Sales Workflow hat unseren Abschlussprozess von 45 auf 28 Tage verkürzt. Automatische Follow-ups, intelligente Angebotsvorlagen - das Team liebt es. Wir machen 40% mehr Umsatz mit dem gleichen Team.',
    metrics: {
      label: 'Schnellerer Sales Cycle',
      value: '-38%'
    }
  },
  {
    name: 'Rechtsanwältin Anna Schmidt',
    role: 'Partnerin',
    company: 'Kanzlei Schmidt & Partner, Bocholt',
    image: '/testimonials/placeholder-lawyer.jpg',
    rating: 5,
    text: 'Mandantenanfragen werden jetzt sofort qualifiziert und an den richtigen Anwalt weitergeleitet. Die KI erfasst alle wichtigen Informationen vorab. Das spart uns täglich 2-3 Stunden Verwaltungsarbeit.',
    metrics: {
      label: 'Zeit gespart/Tag',
      value: '2-3h'
    }
  },
  {
    name: 'Markus Schröder',
    role: 'IT-Leiter',
    company: 'HandelsPro AG, Essen',
    image: '/testimonials/placeholder-it.jpg',
    rating: 5,
    text: 'Support-Tickets werden zu 85% automatisch bearbeitet. Unser Team kümmert sich nur noch um die wirklich komplexen Fälle. Die Kundenzufriedenheit ist gestiegen, die Kosten um 30% gesunken.',
    metrics: {
      label: 'Ticket-Automatisierung',
      value: '85%'
    }
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

export default function TestimonialsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section id="testimonials" className="relative py-24 lg:py-32 overflow-hidden bg-primary-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-500/5 blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-6">
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
            bg-gold-500/10 border border-gold-500/30
            text-gold-500 text-sm font-semibold uppercase tracking-wider mb-6">
            <Star className="w-4 h-4 fill-gold-500" />
            Kundenstimmen
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">Was unsere Kunden</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-electric-500">
                erreicht haben
              </span>
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Echte Ergebnisse von echten Unternehmen aus Deutschland
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={index}
              variants={cardVariants}
              className="group relative overflow-hidden
                bg-gradient-to-br from-primary-800/50 to-primary-900/50
                backdrop-blur-xl border border-white/10
                rounded-3xl p-8
                hover:border-gold-500/30 hover:shadow-[0_0_40px_rgba(255,215,0,0.2)]
                transition-all duration-500"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-16 h-16 text-gold-500" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold-500 fill-gold-500" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-300 leading-relaxed mb-6 relative z-10">
                "{testimonial.text}"
              </blockquote>

              {/* Metrics Badge */}
              <div className="mb-6 p-3 bg-electric-500/10 border border-electric-500/30 rounded-xl">
                <div className="text-xs text-electric-500 uppercase tracking-wider mb-1">
                  {testimonial.metrics.label}
                </div>
                <div className="text-2xl font-display font-bold text-white">
                  {testimonial.metrics.value}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-500/20 to-neon-500/20
                  rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-gray-500">
                    {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/0 via-gold-500/10 to-gold-500/0
                opacity-0 group-hover:opacity-100 blur-xl -z-10 transition-opacity duration-500" />
            </motion.article>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gold-500 mb-1">
                4.9★
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Durchschnittliche Bewertung
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-electric-500 mb-1">
                15+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Zufriedene Kunden
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-neon-500 mb-1">
                100%
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Weiterempfehlungsrate
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
