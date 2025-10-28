'use client'

import { motion } from 'framer-motion'
import { Calendar, MessageCircle, Phone, ArrowRight, Sparkles } from 'lucide-react'

const ctaOptions = [
  {
    icon: Calendar,
    title: 'Book Demo',
    description: '15-minute live demo – see the AI in action',
    cta: 'Choose appointment',
    href: '/en/contact',
    color: 'electric',
    popular: true
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Direct chat – our team responds within 2 hours',
    cta: 'Start chat',
    href: 'https://wa.me/4915140432992',
    color: 'neon',
    popular: false
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak with an expert – Mon-Fri 9AM-6PM',
    cta: '+49 151 404 32 992',
    href: 'tel:+4915140432992',
    color: 'gold',
    popular: false
  }
]

const colorClasses = {
  electric: {
    text: 'text-electric-500',
    bg: 'bg-electric-500',
    bgOpacity: 'bg-electric-500/10',
    border: 'border-electric-500/30',
    hoverBorder: 'hover:border-electric-500/60',
    shadow: 'shadow-[0_0_40px_rgba(0,240,255,0.4)]',
    hoverShadow: 'hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]'
  },
  neon: {
    text: 'text-neon-500',
    bg: 'bg-neon-500',
    bgOpacity: 'bg-neon-500/10',
    border: 'border-neon-500/30',
    hoverBorder: 'hover:border-neon-500/60',
    shadow: 'shadow-[0_0_40px_rgba(255,0,128,0.4)]',
    hoverShadow: 'hover:shadow-[0_0_60px_rgba(255,0,128,0.6)]'
  },
  gold: {
    text: 'text-gold-500',
    bg: 'bg-gold-500',
    bgOpacity: 'bg-gold-500/10',
    border: 'border-gold-500/30',
    hoverBorder: 'hover:border-gold-500/60',
    shadow: 'shadow-[0_0_40px_rgba(255,215,0,0.4)]',
    hoverShadow: 'hover:shadow-[0_0_60px_rgba(255,215,0,0.6)]'
  }
}

export default function CTASectionEN() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px]
          bg-gradient-to-r from-electric-500/10 via-neon-500/10 to-gold-500/10 blur-[200px]"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

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
            bg-electric-500/10 border border-electric-500/30
            text-electric-500 text-sm font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            Ready for 10X Growth?
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            <span className="block">Start your</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 via-neon-500 to-gold-500 animate-glow">
                AI Transformation
              </span>
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Book a free 15-minute consultation and learn{' '}
            <span className="text-white font-semibold">how much time and money</span>{' '}
            you can save with AI automation.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>No Obligation</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Free Initial Consultation</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Individual Potential Analysis</span>
            </div>
          </div>
        </motion.div>

        {/* CTA Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {ctaOptions.map((option, index) => {
            const colors = colorClasses[option.color as keyof typeof colorClasses]

            return (
              <motion.a
                key={index}
                href={option.href}
                target={option.href.startsWith('http') ? '_blank' : undefined}
                rel={option.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group overflow-hidden
                  bg-gradient-to-br from-primary-800/50 to-primary-900/50
                  backdrop-blur-xl border ${colors.border}
                  rounded-3xl p-8
                  ${colors.hoverBorder} ${colors.hoverShadow}
                  transition-all duration-500 cursor-pointer
                  ${option.popular ? 'ring-2 ring-electric-500/50' : ''}`}
              >
                {/* Popular badge */}
                {option.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1
                    bg-electric-500 text-primary-900 rounded-full
                    text-xs font-bold uppercase tracking-wider">
                    Popular
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 ${colors.bgOpacity} rounded-2xl
                  flex items-center justify-center mb-6
                  group-hover:scale-110 transition-transform duration-500`}>
                  <option.icon className={`w-8 h-8 ${colors.text}`} />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-white mb-3">
                    {option.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* CTA */}
                <div className={`flex items-center gap-2 ${colors.text} font-semibold
                  group-hover:gap-4 transition-all duration-300`}>
                  <span>{option.cta}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${option.color}-500/0 to-${option.color}-500/10
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-${option.color}-500/0 via-${option.color}-500/20 to-${option.color}-500/0
                  opacity-0 group-hover:opacity-100 blur-xl -z-10 transition-opacity duration-500`} />
              </motion.a>
            )
          })}
        </div>

        {/* Bottom guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center p-6 bg-gold-500/10 border border-gold-500/30 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-300">
            <Sparkles className="w-6 h-6 text-gold-500" />
            <p className="text-lg">
              <span className="text-white font-semibold">Test 14 days free,</span> then 30-day money-back guarantee
            </p>
            <Sparkles className="w-6 h-6 text-gold-500" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
