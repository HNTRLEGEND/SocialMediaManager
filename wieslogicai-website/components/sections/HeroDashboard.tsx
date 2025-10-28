'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Phone, Workflow, TrendingUp, Clock, Scissors } from 'lucide-react'

const dashboardSlides = [
  {
    id: 1,
    title: 'AI Voice Agent',
    subtitle: 'Arztpraxis Beispiel',
    icon: Phone,
    color: 'electric',
    stats: [
      { label: 'Verpasste Anrufe/Tag', value: '30', subtext: 'vorher' },
      { label: 'Durchschn. Auftragswert', value: '80€', subtext: 'pro Behandlung' },
      { label: 'Entgangener Umsatz', value: '72.000€', subtext: 'pro Jahr' }
    ],
    savings: {
      label: 'Ersparnis mit KI Agent',
      value: '71.000€',
      period: '/Jahr',
      description: 'bei 95% Anrufautomatisierung'
    },
    timeSavings: {
      label: 'Zeitersparnis',
      value: '20h',
      period: '/Woche',
      description: 'für Terminplanung & Organisation'
    }
  },
  {
    id: 2,
    title: 'AI Voice Agent',
    subtitle: 'Friseursalon Beispiel',
    icon: Scissors,
    color: 'purple',
    stats: [
      { label: 'Verpasste Anfrufe/Tag', value: '15', subtext: 'während Öffnungszeiten' },
      { label: 'Verpasste Anrufe außerhalb', value: '12', subtext: 'nach Feierabend' },
      { label: 'Durchschn. Auftragswert', value: '25€', subtext: 'pro Kunde' }
    ],
    savings: {
      label: 'Entgangener Umsatz gespart',
      value: '246.750€',
      period: '/Jahr',
      description: '27 Anrufe/Tag × 25€ × 365 Tage'
    },
    timeSavings: {
      label: 'Zeitersparnis',
      value: '15h',
      period: '/Woche',
      description: 'für Terminverwaltung am Telefon'
    }
  },
  {
    id: 3,
    title: 'Lead Qualifizierung',
    subtitle: 'B2B Dienstleister Beispiel',
    icon: TrendingUp,
    color: 'neon',
    stats: [
      { label: 'Leads/Monat', value: '200', subtext: 'eingehend' },
      { label: 'Zeit pro Lead', value: '15 Min', subtext: 'manuelle Qualifizierung' },
      { label: 'Personalkosten', value: '3.000€', subtext: 'pro Monat' }
    ],
    savings: {
      label: 'Ersparnis mit KI',
      value: '2.400€',
      period: '/Monat',
      description: 'durch 80% Automatisierung'
    },
    timeSavings: {
      label: 'Zeitersparnis',
      value: '40h',
      period: '/Monat',
      description: 'für manuelle Lead-Bearbeitung'
    }
  },
  {
    id: 4,
    title: 'Workflow Automatisierung',
    subtitle: 'Mittelstand Beispiel',
    icon: Workflow,
    color: 'gold',
    stats: [
      { label: 'Manuelle Prozesse', value: '25h', subtext: 'pro Woche' },
      { label: 'Stundensatz', value: '50€', subtext: 'intern' },
      { label: 'Jährliche Kosten', value: '65.000€', subtext: 'für Routineaufgaben' }
    ],
    savings: {
      label: 'Ersparnis durch Automation',
      value: '45.000€',
      period: '/Jahr',
      description: 'bei 70% Automatisierung'
    },
    timeSavings: {
      label: 'Zeitersparnis',
      value: '17.5h',
      period: '/Woche',
      description: 'für strategische Aufgaben'
    }
  }
]

const colorClasses = {
  electric: {
    from: 'from-electric-500',
    to: 'to-electric-600',
    text: 'text-electric-500',
    bg: 'bg-electric-500/20',
    border: 'border-electric-500/30'
  },
  neon: {
    from: 'from-neon-500',
    to: 'to-neon-600',
    text: 'text-neon-500',
    bg: 'bg-neon-500/20',
    border: 'border-neon-500/30'
  },
  gold: {
    from: 'from-gold-500',
    to: 'to-gold-600',
    text: 'text-gold-500',
    bg: 'bg-gold-500/20',
    border: 'border-gold-500/30'
  },
  purple: {
    from: 'from-purple-500',
    to: 'to-purple-600',
    text: 'text-purple-500',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30'
  }
}

export default function HeroDashboard() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const slide = dashboardSlides[currentSlide]
  const colors = colorClasses[slide.color as keyof typeof colorClasses]

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dashboardSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setIsAutoPlaying(false)
    setCurrentSlide((prev) => (prev + 1) % dashboardSlides.length)
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentSlide((prev) => (prev - 1 + dashboardSlides.length) % dashboardSlides.length)
  }

  return (
    <div className="relative bg-gradient-to-br from-primary-800/50 to-primary-900/50
      backdrop-blur-xl border border-electric-500/20 rounded-3xl p-8
      shadow-[0_0_80px_rgba(0,240,255,0.2)]">

      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
            ROI Beispiele
          </div>
          <div className="text-2xl font-display font-bold text-white">
            Tenify Dashboard
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="w-8 h-8 bg-primary-800/50 border border-white/10 rounded-lg
              flex items-center justify-center text-gray-400 hover:text-white
              hover:border-electric-500/50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1">
            {dashboardSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index)
                  setIsAutoPlaying(false)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentSlide
                    ? 'w-6 bg-electric-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                  }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="w-8 h-8 bg-primary-800/50 border border-white/10 rounded-lg
              flex items-center justify-center text-gray-400 hover:text-white
              hover:border-electric-500/50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Animated Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title with Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
              <slide.icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white">
                {slide.title}
              </h3>
              <p className="text-sm text-gray-400">{slide.subtitle}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="space-y-3 mb-6">
            {slide.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3
                  bg-primary-800/50 rounded-xl border border-white/5"
              >
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="text-right">
                  <div className={`text-xl font-display font-bold ${colors.text}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.subtext}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Savings Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`p-4 bg-gradient-to-r ${colors.from}/10 ${colors.to}/10
              border ${colors.border} rounded-xl mb-4`}
          >
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              {slide.savings.label}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-display font-bold ${colors.text}`}>
                {slide.savings.value}
              </span>
              <span className="text-lg text-gray-400">{slide.savings.period}</span>
            </div>
            <div className="text-sm text-gray-300">
              {slide.savings.description}
            </div>
          </motion.div>

          {/* Time Savings */}
          {slide.timeSavings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10
                border border-gold-500/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-gold-500" />
                </div>
                <div className="flex-grow">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    {slide.timeSavings.label}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-bold text-gold-500">
                      {slide.timeSavings.value}
                    </span>
                    <span className="text-sm text-gray-400">{slide.timeSavings.period}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {slide.timeSavings.description}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.from}/20 ${colors.to}/20
        rounded-3xl blur-xl -z-10 opacity-50 transition-all duration-500`} />
    </div>
  )
}
