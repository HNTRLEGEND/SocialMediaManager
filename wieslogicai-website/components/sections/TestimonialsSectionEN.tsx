'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Dr. Sarah Miller',
    role: 'General Practitioner',
    company: 'Dr. Miller Practice, Münster',
    image: '/testimonials/placeholder-doctor.jpg',
    rating: 5,
    text: 'The AI Voice Agent has revolutionized our practice. We never miss a call anymore and our reception is significantly relieved. In the first 3 months, we were able to schedule 35% more appointments - without additional staff.',
    metrics: {
      label: 'More Appointments',
      value: '+35%'
    }
  },
  {
    name: 'Michael Weber',
    role: 'Managing Director',
    company: 'Weber Metal Construction GmbH, Coesfeld',
    image: '/testimonials/placeholder-business.jpg',
    rating: 5,
    text: 'Lead qualification saves our sales team 15 hours per week. We now only talk to real prospects. ROI was achieved after 6 weeks. Absolute recommendation for B2B!',
    metrics: {
      label: 'Time Saved/Week',
      value: '15h'
    }
  },
  {
    name: 'Lisa Hoffmann',
    role: 'Owner',
    company: 'Salon Hoffmann, Dülmen',
    image: '/testimonials/placeholder-salon.jpg',
    rating: 5,
    text: 'Finally, I can focus on my customers! The Voice Agent books appointments around the clock - even at night and on weekends. Our no-show rate has dropped by 60% thanks to automatic reminders.',
    metrics: {
      label: 'Fewer No-Shows',
      value: '-60%'
    }
  },
  {
    name: 'Thomas Krause',
    role: 'Sales Director',
    company: 'TechSolutions GmbH, Düsseldorf',
    image: '/testimonials/placeholder-tech.jpg',
    rating: 5,
    text: 'The Sales Workflow has shortened our closing process from 45 to 28 days. Automatic follow-ups, intelligent quote templates - the team loves it. We generate 40% more revenue with the same team.',
    metrics: {
      label: 'Faster Sales Cycle',
      value: '-38%'
    }
  },
  {
    name: 'Attorney Anna Schmidt',
    role: 'Partner',
    company: 'Schmidt & Partners Law Firm, Bocholt',
    image: '/testimonials/placeholder-lawyer.jpg',
    rating: 5,
    text: 'Client inquiries are now immediately qualified and forwarded to the right attorney. The AI captures all important information upfront. This saves us 2-3 hours of administrative work daily.',
    metrics: {
      label: 'Time Saved/Day',
      value: '2-3h'
    }
  },
  {
    name: 'Markus Schröder',
    role: 'IT Manager',
    company: 'HandelsPro AG, Essen',
    image: '/testimonials/placeholder-it.jpg',
    rating: 5,
    text: 'Support tickets are automatically processed at 85%. Our team only deals with really complex cases. Customer satisfaction has increased, costs have decreased by 30%.',
    metrics: {
      label: 'Ticket Automation',
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

export default function TestimonialsSectionEN() {
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
            Customer Testimonials
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">What our customers</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-electric-500">
                have achieved
              </span>
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real results from real companies in Germany
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
                Average Rating
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-electric-500 mb-1">
                15+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Happy Clients
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-neon-500 mb-1">
                100%
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Recommendation Rate
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
