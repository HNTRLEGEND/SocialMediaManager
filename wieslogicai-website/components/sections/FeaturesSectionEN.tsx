'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import {
  Phone,
  Bot,
  TrendingUp,
  Headphones,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Users
} from 'lucide-react'
import WorkflowModal from '@/components/WorkflowModal'
import { workflowsEN } from '@/lib/workflowData'

const features = [
  {
    id: 'voice-agent',
    icon: Phone,
    title: 'AI Voice Agent',
    subtitle: '24/7 Phone Automation',
    description: 'Never miss a call again. Our AI Voice Agent answers calls, books appointments and qualifies leads - around the clock.',
    benefits: [
      'Automatic appointment booking',
      'Real-time lead qualification',
      'Multilingual (EN, DE, FR, ES)',
      'Seamless CRM integration'
    ],
    gradient: 'from-electric-500 to-electric-600',
    iconBg: 'bg-electric-500/10',
    iconColor: 'text-electric-500',
    borderColor: 'border-electric-500/20',
    hoverBorder: 'group-hover:border-electric-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(0,240,255,0.3)]'
  },
  {
    id: 'sales-agent',
    icon: TrendingUp,
    title: 'Sales Agent Workflow',
    subtitle: 'Automated Sales Process',
    description: 'From lead qualification to closing. We implement your complete sales workflow with AI-powered follow-ups.',
    benefits: [
      'Automatic lead scoring',
      'Personalized follow-ups',
      'Upselling & cross-selling',
      'Pipeline management'
    ],
    gradient: 'from-neon-500 to-neon-600',
    iconBg: 'bg-neon-500/10',
    iconColor: 'text-neon-500',
    borderColor: 'border-neon-500/20',
    hoverBorder: 'group-hover:border-neon-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(255,0,128,0.3)]'
  },
  {
    id: 'service-agent',
    icon: Headphones,
    title: 'Service Agent Workflow',
    subtitle: 'Intelligent Customer Support',
    description: 'Automatically process support tickets, answer FAQs and route complex requests to your team - fully automated.',
    benefits: [
      '95% ticket automation',
      'Intelligent routing',
      'Knowledge base integration',
      'Escalation management'
    ],
    gradient: 'from-gold-500 to-gold-600',
    iconBg: 'bg-gold-500/10',
    iconColor: 'text-gold-500',
    borderColor: 'border-gold-500/20',
    hoverBorder: 'group-hover:border-gold-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(255,215,0,0.3)]'
  },
  {
    id: 'technical-agent',
    icon: Bot,
    title: 'Technical Agent Workflow',
    subtitle: 'Technical Ticket Management',
    description: 'Automatically categorize, prioritize and route technical requests to the right experts. With intelligent pre-qualification.',
    benefits: [
      'Automatic categorization',
      'Priority assessment',
      'Department routing',
      'SLA monitoring'
    ],
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
    hoverBorder: 'group-hover:border-purple-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]'
  },
  {
    id: 'lead-generator',
    icon: Target,
    title: 'Lead Generator Workflow',
    subtitle: 'Automatic Lead Generation',
    description: 'Identify, qualify and contact potential customers automatically - while you sleep.',
    benefits: [
      'Automatic lead identification',
      'AI-powered lead scoring',
      'Personalized outreach campaigns',
      'Multi-channel follow-up'
    ],
    gradient: 'from-electric-500 to-electric-600',
    iconBg: 'bg-electric-500/10',
    iconColor: 'text-electric-500',
    borderColor: 'border-electric-500/20',
    hoverBorder: 'group-hover:border-electric-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(0,240,255,0.3)]'
  },
  {
    id: 'lead-manager',
    icon: Users,
    title: 'Lead Manager Workflow',
    subtitle: 'Intelligent Lead Management',
    description: 'Organize, prioritize and nurture your leads automatically with AI-powered insights and recommendations.',
    benefits: [
      'Automatic lead segmentation',
      'Conversion probability scoring',
      'Smart follow-up reminders',
      'Nurturing campaigns automated'
    ],
    gradient: 'from-neon-500 to-neon-600',
    iconBg: 'bg-neon-500/10',
    iconColor: 'text-neon-500',
    borderColor: 'border-neon-500/20',
    hoverBorder: 'group-hover:border-neon-500/60',
    hoverShadow: 'group-hover:shadow-[0_0_40px_rgba(255,0,128,0.3)]'
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

export default function FeaturesSectionEN() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const openModal = (workflowId: string) => {
    setSelectedWorkflow(workflowId)
  }

  const closeModal = () => {
    setSelectedWorkflow(null)
  }

  const activeWorkflowData = workflowsEN.find(w => w.id === selectedWorkflow)

  return (
    <>
      <section className="relative py-24 lg:py-32 overflow-hidden bg-primary-950" id="workflows">
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
            Implemented AI Workflows
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">Ready-Made AI Workflows</span>
            <span className="block">
              for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
                SMEs
              </span>
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We consult, implement and support your AI workflows. From analysis to go-live -{' '}
            <span className="text-electric-500 font-semibold">all from one source</span>.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.article
              key={index}
              variants={cardVariants}
              onClick={() => openModal(feature.id)}
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
                <span>Learn more</span>
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

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12 p-6 bg-electric-500/10 border border-electric-500/30 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-electric-500/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-electric-500" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-white font-display font-bold text-xl mb-2">
                Done-for-You Service
              </h3>
              <p className="text-gray-300">
                You don't just get software, but a <strong className="text-white">fully configured system</strong>.
                We analyze your processes, implement the workflows and train your team. Ready in 48 hours.
              </p>
            </div>
          </div>
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
            Not sure which workflow is right for you?
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
            Book Free Potential Analysis
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

      {/* Workflow Modal */}
      {activeWorkflowData && (
        <WorkflowModal
          isOpen={!!selectedWorkflow}
          onClose={closeModal}
          workflow={activeWorkflowData}
        />
      )}
    </>
  )
}
