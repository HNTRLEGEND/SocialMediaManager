'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import HeroDashboardEN from './HeroDashboardEN'

export default function HeroSectionEN() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-900">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-20 -right-40 w-[600px] h-[600px] bg-electric-500/20 rounded-full blur-[150px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-neon-500/20 rounded-full blur-[150px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-electric-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Kicker Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                bg-electric-500/10 border border-electric-500/30
                text-electric-500 text-sm font-semibold uppercase tracking-wider
                mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI Automation 2025
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              <span className="block">10X Growth through</span>
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500 animate-glow">
                  AI Automation
                </span>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 max-w-2xl"
            >
              <span className="font-semibold text-white">Tenify.AI</span> automates your business processes.{' '}
              <span className="text-electric-500 font-semibold">24/7</span> available,{' '}
              <span className="text-electric-500 font-semibold">GDPR compliant</span>, without staffing costs.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-3 gap-6 mb-10"
            >
              {[
                { value: '500+', label: 'Hours saved' },
                { value: '10X', label: 'Average ROI' },
                { value: '24/7', label: 'AI availability' },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-display font-bold text-electric-500 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Primary CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-electric-500 text-primary-900
                  rounded-full font-display font-bold text-lg
                  shadow-[0_0_40px_rgba(0,240,255,0.4)]
                  hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]
                  transition-all duration-300
                  flex items-center justify-center gap-3"
              >
                <Zap className="w-5 h-5" />
                Book Free Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* Secondary CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoOpen(true)}
                className="px-8 py-4 border-2 border-neon-500 text-neon-500
                  rounded-full font-display font-semibold text-lg
                  hover:bg-neon-500 hover:text-white
                  transition-all duration-300
                  flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Watch Live Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-12 flex items-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-500" />
                <span>200% efficiency increase on average</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
              <div>Ready in 48 hours</div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <HeroDashboardEN />

            {/* Orbiting Icons */}
            {[
              { icon: Zap, delay: 0 },
              { icon: Sparkles, delay: 1 },
              { icon: TrendingUp, delay: 2 },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="absolute w-12 h-12 bg-primary-800/80 backdrop-blur-xl
                  border border-electric-500/30 rounded-2xl
                  flex items-center justify-center"
                style={{
                  top: `${20 + index * 25}%`,
                  right: index % 2 === 0 ? '-6%' : 'auto',
                  left: index % 2 === 1 ? '-6%' : 'auto',
                }}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: item.delay,
                  ease: "easeInOut"
                }}
              >
                <item.icon className="w-6 h-6 text-electric-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-electric-500/50 rounded-full
            flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-electric-500 rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      {isVideoOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setIsVideoOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full max-w-5xl aspect-video bg-primary-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Tenify.AI Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-xl
                rounded-full flex items-center justify-center text-white
                hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
