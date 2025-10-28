'use client'

import { motion } from 'framer-motion'
import { Sparkles, Target, Users, Zap, Heart, TrendingUp } from 'lucide-react'

export default function AboutPage() {
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
              <Sparkles className="w-4 h-4" />
              About Us
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              AI Automation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
                for SMEs
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We make AI accessible for small and medium-sized enterprises
            </p>
          </div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
              backdrop-blur-xl border border-white/10 rounded-3xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-electric-500/10 rounded-xl
                flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-electric-500" />
              </div>
              <h2 className="font-display text-3xl font-bold text-white pt-2">
                Our Mission
              </h2>
            </div>

            <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed space-y-4">
              <p>
                Tenify.AI was founded in 2024 based on a simple insight:
                <span className="text-white font-semibold"> AI automation is not a luxury for corporations, but a necessity for every SME.</span>
              </p>
              <p>
                While large companies have entire IT departments for digitization, small and medium-sized enterprises often lack the resources, time, and technical know-how.
              </p>
              <p>
                <span className="text-electric-500 font-semibold">That's where we come in.</span> We build ready-made AI workflows that work immediately - without programming knowledge, without training period, without risk.
              </p>
            </div>
          </motion.div>

          {/* Values Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            {[
              {
                icon: Zap,
                title: 'Fast & Efficient',
                description: 'Your workflows are ready in 48 hours. No long project phases, no implementation chaos.',
                color: 'electric'
              },
              {
                icon: Heart,
                title: 'Personal & Close',
                description: 'You work directly with the founder. No call centers, no ticket systems - just direct contact.',
                color: 'neon'
              },
              {
                icon: TrendingUp,
                title: 'Results-Oriented',
                description: 'We only succeed when you succeed. Your ROI is our metric for success.',
                color: 'gold'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gradient-to-br from-primary-800/50 to-primary-900/50
                  backdrop-blur-xl border border-white/10 rounded-2xl"
              >
                <div className={`w-12 h-12 bg-${value.color}-500/10 rounded-xl
                  flex items-center justify-center mb-4`}>
                  <value.icon className={`w-6 h-6 text-${value.color}-500`} />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Location Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
              backdrop-blur-xl border border-white/10 rounded-3xl text-center"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              We are in <span className="text-gold-500">Dülmen, NRW</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Based in North Rhine-Westphalia, active throughout Germany. Whether in person or remote - we find the right way for you.
            </p>

            <motion.a
              href="/en/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4
                bg-gradient-to-r from-electric-500 to-neon-500
                text-primary-900 rounded-full font-display font-bold text-lg
                shadow-[0_0_40px_rgba(0,240,255,0.4)]
                hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]
                transition-all duration-300"
            >
              Get in Touch
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
