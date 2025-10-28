'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Clock, TrendingUp, Phone, ArrowRight, Star } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface WorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  workflow: {
    id: string
    icon: LucideIcon
    title: string
    subtitle: string
    description: string
    problem: string
    solution: string
    roi: {
      before: { label: string; value: string; pain: string }
      after: { label: string; value: string; gain: string }
      savings: { value: string; period: string }
      timeSavings: { value: string; period: string }
    }
    features: string[]
    testimonial?: {
      quote: string
      author: string
      role: string
      company: string
      result: string
    }
    color: 'electric' | 'neon' | 'gold' | 'purple'
    urgency: string
  }
}

const colorClasses = {
  electric: {
    gradient: 'from-electric-500 to-electric-600',
    text: 'text-electric-500',
    bg: 'bg-electric-500',
    border: 'border-electric-500',
    shadow: 'shadow-[0_0_60px_rgba(0,240,255,0.4)]'
  },
  neon: {
    gradient: 'from-neon-500 to-neon-600',
    text: 'text-neon-500',
    bg: 'bg-neon-500',
    border: 'border-neon-500',
    shadow: 'shadow-[0_0_60px_rgba(255,0,128,0.4)]'
  },
  gold: {
    gradient: 'from-gold-500 to-gold-600',
    text: 'text-gold-500',
    bg: 'bg-gold-500',
    border: 'border-gold-500',
    shadow: 'shadow-[0_0_60px_rgba(255,215,0,0.4)]'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    text: 'text-purple-500',
    bg: 'bg-purple-500',
    border: 'border-purple-500',
    shadow: 'shadow-[0_0_60px_rgba(168,85,247,0.4)]'
  }
}

export default function WorkflowModal({ isOpen, onClose, workflow }: WorkflowModalProps) {
  const colors = colorClasses[workflow.color]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-5xl bg-gradient-to-br from-primary-900 to-primary-950
                  border-2 border-white/10 rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20
                    rounded-full flex items-center justify-center transition-all z-10
                    hover:rotate-90 duration-300"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {/* Urgency Banner */}
                <motion.div
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`bg-gradient-to-r ${colors.gradient} py-3 px-6 text-center`}
                >
                  <div className="flex items-center justify-center gap-2 text-white font-bold">
                    <Zap className="w-5 h-5 animate-pulse" />
                    <span className="uppercase tracking-wider">{workflow.urgency}</span>
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                </motion.div>

                <div className="p-8 md:p-12">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${colors.gradient} rounded-2xl
                      flex items-center justify-center flex-shrink-0 ${colors.shadow}`}>
                      <workflow.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                        {workflow.subtitle}
                      </div>
                      <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                        {workflow.title}
                      </h2>
                      <p className="text-xl text-gray-300 leading-relaxed">
                        {workflow.description}
                      </p>
                    </div>
                  </div>

                  {/* Problem/Solution Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Problem */}
                    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <div className="text-red-500 font-bold uppercase tracking-wider mb-3">
                        ❌ Das Problem
                      </div>
                      <p className="text-gray-300 leading-relaxed">{workflow.problem}</p>
                    </div>

                    {/* Solution */}
                    <div className={`p-6 bg-${workflow.color}-500/10 border border-${workflow.color}-500/30 rounded-2xl`}>
                      <div className={`${colors.text} font-bold uppercase tracking-wider mb-3`}>
                        ✅ Die Lösung
                      </div>
                      <p className="text-gray-300 leading-relaxed">{workflow.solution}</p>
                    </div>
                  </div>

                  {/* ROI Section - GRAND CARDONE STYLE */}
                  <div className="mb-8 p-8 bg-gradient-to-r from-primary-800/50 to-primary-900/50
                    border-2 border-electric-500/30 rounded-3xl">
                    <h3 className="text-center font-display text-2xl font-bold text-white mb-8">
                      DIE ZAHLEN SPRECHEN FÜR SICH
                    </h3>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Before */}
                      <div className="text-center">
                        <div className="text-red-500 uppercase tracking-wider text-sm mb-3">
                          {workflow.roi.before.label}
                        </div>
                        <div className="text-6xl font-display font-bold text-red-500 mb-3">
                          {workflow.roi.before.value}
                        </div>
                        <p className="text-gray-400">{workflow.roi.before.pain}</p>
                      </div>

                      {/* After */}
                      <div className="text-center">
                        <div className={`${colors.text} uppercase tracking-wider text-sm mb-3`}>
                          {workflow.roi.after.label}
                        </div>
                        <div className={`text-6xl font-display font-bold ${colors.text} mb-3`}>
                          {workflow.roi.after.value}
                        </div>
                        <p className="text-gray-300 font-semibold">{workflow.roi.after.gain}</p>
                      </div>
                    </div>

                    {/* Savings Highlights */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className={`p-6 bg-gradient-to-r ${colors.gradient}/20 border ${colors.border}/30 rounded-2xl`}>
                        <div className="flex items-center gap-3 mb-2">
                          <TrendingUp className={`w-6 h-6 ${colors.text}`} />
                          <span className="text-sm text-gray-400 uppercase tracking-wider">
                            Kosteneinsparung
                          </span>
                        </div>
                        <div className={`text-4xl font-display font-bold ${colors.text}`}>
                          {workflow.roi.savings.value}
                          <span className="text-2xl text-gray-400">{workflow.roi.savings.period}</span>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-6 h-6 text-gold-500" />
                          <span className="text-sm text-gray-400 uppercase tracking-wider">
                            Zeitersparnis
                          </span>
                        </div>
                        <div className="text-4xl font-display font-bold text-gold-500">
                          {workflow.roi.timeSavings.value}
                          <span className="text-2xl text-gray-400">{workflow.roi.timeSavings.period}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="font-display text-2xl font-bold text-white mb-6">
                      Was Sie bekommen:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {workflow.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-start gap-3 p-4 bg-primary-800/30 rounded-xl"
                        >
                          <Check className={`w-6 h-6 ${colors.text} flex-shrink-0 mt-0.5`} />
                          <span className="text-gray-300">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial */}
                  {workflow.testimonial && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-gold-500/10 to-electric-500/10
                      border border-gold-500/30 rounded-2xl">
                      <div className="flex items-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-gold-500 fill-gold-500" />
                        ))}
                      </div>
                      <blockquote className="text-lg text-gray-300 leading-relaxed mb-4">
                        "{workflow.testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{workflow.testimonial.author}</div>
                          <div className="text-sm text-gray-400">{workflow.testimonial.role}, {workflow.testimonial.company}</div>
                        </div>
                        <div className={`text-2xl font-display font-bold ${colors.text}`}>
                          {workflow.testimonial.result}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Section - GRAND CARDONE STYLE */}
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full md:w-auto px-12 py-6 bg-gradient-to-r ${colors.gradient}
                        text-white rounded-full font-display font-bold text-xl
                        ${colors.shadow} hover:shadow-[0_0_80px_rgba(0,240,255,0.6)]
                        transition-all duration-300
                        flex items-center justify-center gap-3 mx-auto mb-4`}
                    >
                      <Zap className="w-6 h-6" />
                      JETZT KOSTENLOSE DEMO BUCHEN
                      <ArrowRight className="w-6 h-6" />
                    </motion.button>
                    <p className="text-gray-400 text-sm">
                      ⚡ In 15 Minuten sehen Sie, wie viel Sie sparen können
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
