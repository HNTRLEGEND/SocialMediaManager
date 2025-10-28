'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    subtitle: 'For Small Teams',
    price: '€2,500',
    period: '/month',
    description: 'Perfect for teams getting started with AI automation',
    icon: Rocket,
    features: [
      '1 AI Agent (Voice or Service)',
      'Up to 1,000 interactions/month',
      'Basic analytics dashboard',
      'Email support',
      '30-day onboarding',
      'Monthly strategy call'
    ],
    cta: 'Start Free Trial',
    popular: false,
    gradient: 'from-electric-500/10 to-electric-600/10',
    borderColor: 'border-electric-500/30',
    buttonClass: 'bg-electric-500 text-primary-900 hover:bg-electric-600'
  },
  {
    name: 'Pro',
    subtitle: 'Most Popular',
    price: '€7,500',
    period: '/month',
    description: 'For growing businesses ready to 10X their automation',
    icon: Zap,
    features: [
      '3 AI Agents (mix & match)',
      'Up to 10,000 interactions/month',
      'Advanced analytics & reporting',
      'Priority support (24/7)',
      'Full integration suite',
      'Weekly optimization calls',
      'Custom workflow builder',
      'Dedicated account manager'
    ],
    cta: 'Book Demo Now',
    popular: true,
    gradient: 'from-neon-500/20 to-neon-600/20',
    borderColor: 'border-neon-500/60',
    buttonClass: 'bg-gradient-to-r from-electric-500 to-neon-500 text-white'
  },
  {
    name: 'Enterprise',
    subtitle: 'Unlimited Scale',
    price: 'Custom',
    period: '',
    description: 'For enterprises dominating with AI at scale',
    icon: Crown,
    features: [
      'Unlimited AI Agents',
      'Unlimited interactions',
      'White-label options',
      'Dedicated infrastructure',
      'SLA guarantees',
      'On-site training',
      'Custom development',
      'Strategic consulting'
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-gold-500/10 to-gold-600/10',
    borderColor: 'border-gold-500/30',
    buttonClass: 'bg-gold-500 text-primary-900 hover:bg-gold-600'
  }
]

export default function PricingSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-primary-900">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-electric-500/10
            border border-electric-500/30 text-electric-500 text-sm font-semibold
            uppercase tracking-wider mb-6">
            Transparent Pricing
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
              Growth Plan
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start small, scale fast. No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`relative group
                bg-gradient-to-br ${plan.gradient}
                backdrop-blur-xl border-2 ${plan.borderColor}
                rounded-3xl p-8
                ${plan.popular ? 'scale-105 shadow-[0_0_60px_rgba(255,0,128,0.4)]' : ''}
                hover:shadow-[0_0_60px_rgba(0,240,255,0.3)]
                transition-all duration-500`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2
                  px-4 py-1 bg-gradient-to-r from-electric-500 to-neon-500
                  text-white text-xs font-bold uppercase tracking-wider
                  rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient}
                  rounded-2xl flex items-center justify-center`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">{plan.subtitle}</div>
                </div>
              </div>

              {/* Plan Name */}
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-6">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-electric-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 rounded-full font-display font-bold
                  ${plan.buttonClass}
                  shadow-[0_10px_40px_rgba(0,0,0,0.3)]
                  transition-all duration-300
                  flex items-center justify-center gap-2`}
              >
                {plan.cta}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Money-Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3
            bg-green-500/10 border border-green-500/30 rounded-full">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-400 font-semibold">
              30-Day Money-Back Guarantee • No Questions Asked
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
