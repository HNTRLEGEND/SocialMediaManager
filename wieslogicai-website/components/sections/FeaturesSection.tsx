'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Phone,
  Bot,
  Brain,
  Workflow,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

const features = [
  {
    icon: Phone,
    title: 'AI Voice Agents',
    subtitle: 'Conversational AI that Converts',
    description: '24/7 automated calls that handle support, sales, and qualification like your best team member.',
    benefits: [
      'Natural language processing',
      'CRM integration & data sync',
      'Multi-language support',
      'Real-time analytics'
    ],
    gradient: 'from-electric-500 to-electric-600',
    iconBg: 'bg-electric-500/10',
    iconColor: 'text-electric-500',
    borderColor: 'border-electric-500/20',
    hoverBorder: 'group-hover:border-electric-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(0,240,255,0.3)]'
  },
  {
    icon: Bot,
    title: 'AI Service Agents',
    subtitle: 'Automate Customer Support',
    description: 'Intelligent bots that resolve tickets, answer FAQs, and escalate complex issues automatically.',
    benefits: [
      '95% ticket auto-resolution',
      'Sentiment analysis',
      'Knowledge base integration',
      '24/7 availability'
    ],
    gradient: 'from-neon-500 to-neon-600',
    iconBg: 'bg-neon-500/10',
    iconColor: 'text-neon-500',
    borderColor: 'border-neon-500/20',
    hoverBorder: 'group-hover:border-neon-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(255,0,128,0.3)]'
  },
  {
    icon: Brain,
    title: 'AI Personal Assistants',
    subtitle: 'Your Digital Executive',
    description: 'Manage emails, schedule meetings, prioritize tasks, and keep your team organized with AI precision.',
    benefits: [
      'Email management & replies',
      'Calendar optimization',
      'Task prioritization',
      'Meeting summaries'
    ],
    gradient: 'from-gold-500 to-gold-600',
    iconBg: 'bg-gold-500/10',
    iconColor: 'text-gold-500',
    borderColor: 'border-gold-500/20',
    hoverBorder: 'group-hover:border-gold-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(255,215,0,0.3)]'
  },
  {
    icon: Workflow,
    title: 'Process AI Workflows',
    subtitle: 'End-to-End Automation',
    description: 'Connect all your tools and automate complex business processes with intelligent workflow orchestration.',
    benefits: [
      'No-code automation builder',
      'API integrations (1000+)',
      'Conditional logic & routing',
      'Real-time monitoring'
    ],
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
    hoverBorder: 'group-hover:border-purple-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]'
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-primary-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px]
        bg-electric-500/5 blur-[200px]" />

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
            Our AI Solutions
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">Skalierbare KI-Bausteine</span>
            <span className="block">
              für den{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
                Mittelstand
              </span>
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Modular, schnell implementierbar und nahtlos in Ihre bestehenden Systeme integrierbar.
            Von der Idee bis zum Betrieb – in <span className="text-electric-500 font-semibold">45 Tagen</span>.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-8"
        >
          {features.map((feature, index) => (
            <motion.article
              key={index}
              variants={cardVariants}
              className={`group relative overflow-hidden
                bg-gradient-to-br from-primary-800/50 to-primary-900/50
                backdrop-blur-xl border ${feature.borderColor}
                rounded-3xl p-8
                ${feature.hoverBorder} ${feature.hoverShadow}
                transition-all duration-500 cursor-pointer`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl
                flex items-center justify-center mb-6
                group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>

              {/* Content */}
              <div className="mb-6">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                  {feature.subtitle}
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Benefits List */}
              <ul className="space-y-3 mb-6">
                {feature.benefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx, duration: 0.4 }}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <CheckCircle2 className={`w-5 h-5 ${feature.iconColor} flex-shrink-0`} />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Link */}
              <motion.div
                className="flex items-center gap-2 text-white font-semibold
                  group-hover:gap-4 transition-all duration-300"
              >
                <span>Learn More</span>
                <ArrowRight className="w-5 h-5" />
              </motion.div>

              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}
                opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />

              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-electric-500/0 via-electric-500/10 to-electric-500/0
                opacity-0 group-hover:opacity-100 blur-xl -z-10 transition-opacity duration-500" />
            </motion.article>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-300 mb-6 text-lg">
            Nicht sicher, welche Lösung zu Ihnen passt?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-3 px-8 py-4
              bg-gradient-to-r from-electric-500 to-neon-500
              text-primary-900 rounded-full font-display font-bold text-lg
              shadow-[0_0_40px_rgba(0,240,255,0.4)]
              hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]
              transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            Kostenlose Potenzialanalyse
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute bottom-10 right-10 w-20 h-20
          bg-electric-500/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </section>
  )
}
