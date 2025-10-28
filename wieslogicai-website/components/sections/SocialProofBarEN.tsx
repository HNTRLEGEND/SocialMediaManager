'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Phone, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

const stats = [
  {
    icon: Phone,
    value: 10247,
    increment: 3,
    label: 'Automated Calls',
    suffix: '+',
    color: 'electric'
  },
  {
    icon: Clock,
    value: 542,
    increment: 2,
    label: 'Hours saved this week',
    suffix: 'h',
    color: 'neon'
  },
  {
    icon: Users,
    value: 15,
    increment: 0,
    label: 'Happy Clients',
    suffix: '+',
    color: 'gold'
  },
  {
    icon: TrendingUp,
    value: 200,
    increment: 0,
    label: 'Avg. Efficiency Increase',
    suffix: '%',
    color: 'purple'
  }
]

const colorClasses = {
  electric: {
    text: 'text-electric-500',
    bg: 'bg-electric-500/10',
    border: 'border-electric-500/30',
    glow: 'shadow-[0_0_20px_rgba(0,240,255,0.3)]'
  },
  neon: {
    text: 'text-neon-500',
    bg: 'bg-neon-500/10',
    border: 'border-neon-500/30',
    glow: 'shadow-[0_0_20px_rgba(255,0,128,0.3)]'
  },
  gold: {
    text: 'text-gold-500',
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/30',
    glow: 'shadow-[0_0_20px_rgba(255,215,0,0.3)]'
  },
  purple: {
    text: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]'
  }
}

export default function SocialProofBarEN() {
  const [counters, setCounters] = useState(stats.map(stat => stat.value))

  // Animate counters on mount
  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    const intervals = stats.map((stat, index) => {
      const increment = stat.value / steps
      let currentValue = 0

      return setInterval(() => {
        currentValue += increment
        if (currentValue >= stat.value) {
          currentValue = stat.value
          clearInterval(intervals[index])
        }
        setCounters(prev => {
          const newCounters = [...prev]
          newCounters[index] = Math.floor(currentValue)
          return newCounters
        })
      }, stepDuration)
    })

    return () => intervals.forEach(interval => clearInterval(interval))
  }, [])

  return (
    <section className="relative py-12 overflow-hidden bg-primary-950 border-y border-white/10">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-electric-500/5 via-neon-500/5 to-gold-500/5" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const colors = colorClasses[stat.color as keyof typeof colorClasses]

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative overflow-hidden
                  ${colors.bg} ${colors.border}
                  border rounded-2xl p-6
                  hover:${colors.glow}
                  transition-all duration-300
                  group`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${colors.bg} rounded-xl
                  flex items-center justify-center mb-4
                  group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <span className={`text-3xl md:text-4xl font-display font-bold ${colors.text}`}>
                    {counters[index].toLocaleString('en-US')}
                    {stat.suffix}
                  </span>
                </div>

                {/* Label */}
                <div className="text-sm text-gray-400 leading-tight">
                  {stat.label}
                </div>

                {/* Subtle pulse animation for incrementing stats */}
                {stat.increment > 0 && (
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full ${colors.bg} ${colors.border} border`} />
                  </motion.div>
                )}

                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/0 to-${stat.color}-500/5
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            )
          })}
        </div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span>Live Metrics – Real-time Updates</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
