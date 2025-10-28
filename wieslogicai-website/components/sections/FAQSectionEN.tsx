'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqCategories = [
  {
    name: 'General',
    id: 'general',
    questions: [
      {
        q: 'What exactly does Tenify.AI do?',
        a: 'We implement AI-powered workflows for your business. From consulting to technical implementation to ongoing operations - everything from one source. You get a complete, working system, not software to build yourself.'
      },
      {
        q: 'Which industries is this suitable for?',
        a: 'Our solutions work excellently for medical practices, hair salons, law firms, tax advisors, B2B service providers and general SMEs. Anywhere phone, lead management or customer service plays a role.'
      },
      {
        q: 'Do I need technical know-how?',
        a: 'No, absolutely not! We set everything up for you, train your team and handle maintenance. You just need to tell us what should be automated - we do the rest.'
      }
    ]
  },
  {
    name: 'Pricing & Contracts',
    id: 'pricing',
    questions: [
      {
        q: 'What does the setup cost?',
        a: 'Basic setup is already included in the Starter package (€249/month) (value: €500). The Professional package includes premium setup (value: €1,500). No hidden costs!'
      },
      {
        q: 'Are there contract terms?',
        a: 'No! All packages can be cancelled monthly. We are confident in our performance - you should stay because it works, not because of a contract.'
      },
      {
        q: 'What happens if I need more interactions?',
        a: 'Additional quotas can be flexibly added (€0.50 per additional interaction). We proactively contact you when you reach your limit, so nothing gets lost.'
      },
      {
        q: 'Can I switch packages?',
        a: 'Yes, anytime! You can upgrade or downgrade. Upgrades take effect immediately, downgrades at the next billing cycle.'
      }
    ]
  },
  {
    name: 'Technical',
    id: 'technical',
    questions: [
      {
        q: 'How long does setup take?',
        a: 'Starter workflows: 3-5 business days. Professional: 1-2 weeks. Enterprise: 2-4 weeks, depending on complexity. Express setup is also possible in urgent cases (for an additional fee).'
      },
      {
        q: 'Which systems can you integrate?',
        a: 'We integrate Google Calendar, Microsoft Outlook, all common CRM systems (HubSpot, Salesforce, Pipedrive etc.), practice software (Medatixx, CGM, Turbomed), Excel/Google Sheets, n8n, Make, Zapier and many more. If your system isn\'t listed, just ask!'
      },
      {
        q: 'What if there are technical problems?',
        a: 'Starter customers: Email support with 24h response time. Professional: Priority support with 4h response time. Enterprise: Dedicated hotline. Critical outages are always handled immediately.'
      },
      {
        q: 'Can the AI handle multiple languages?',
        a: 'Yes! German, English, French, Spanish, Turkish and many more. The AI automatically detects the caller\'s language and responds accordingly.'
      }
    ]
  },
  {
    name: 'Data Protection',
    id: 'privacy',
    questions: [
      {
        q: 'Is this GDPR compliant?',
        a: 'Absolutely. Server location Germany, all data encrypted (TLS/SSL), GDPR audit available. We have a data protection officer and provide you with all necessary documentation for your data protection records.'
      },
      {
        q: 'Where is the data stored?',
        a: 'All data is stored exclusively on servers in Germany (Frankfurt/Main data center). No cloud providers outside the EU. Made in Germany, hosted in Germany.'
      },
      {
        q: 'Who has access to our data?',
        a: 'Only you and your authorized team. We as service providers only have temporary access for support requests and with your explicit permission. No disclosure to third parties.'
      },
      {
        q: 'What happens to the data after contract termination?',
        a: 'You receive a complete export of all data (CSV/JSON). After 30 days, all data is irrevocably deleted. You receive written confirmation of deletion.'
      }
    ]
  },
  {
    name: 'Integration',
    id: 'integration',
    questions: [
      {
        q: 'Does AI replace my employees?',
        a: 'No, it supports your team! AI handles repetitive tasks (appointment booking, initial inquiries, standard support), so your employees have more time for truly important tasks. Happier employees, happier customers.'
      },
      {
        q: 'How do we train our team?',
        a: 'We offer a 1-hour live training session (Starter), detailed optimization calls (Professional) or on-site training (Enterprise). Additionally, there are video tutorials and a knowledge base.'
      },
      {
        q: 'Can I customize the AI to our processes?',
        a: 'Yes! Professional and Enterprise customers can have workflows individually customized. We advise you which processes have the most potential and implement tailored solutions.'
      }
    ]
  }
]

export default function FAQSectionEN() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

  const activeQuestions = faqCategories.find(cat => cat.id === activeCategory)?.questions || []

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden bg-primary-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px]
        bg-purple-500/5 blur-[200px]" />

      <div className="relative max-w-5xl mx-auto px-6">
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
            bg-purple-500/10 border border-purple-500/30
            text-purple-500 text-sm font-semibold uppercase tracking-wider mb-6">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">Still have questions?</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-electric-500">
                We have answers
              </span>
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The most important answers about AI automation, pricing and data protection
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id)
                setOpenQuestion(0)
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300
                ${activeCategory === category.id
                  ? 'bg-electric-500 text-primary-900 shadow-[0_0_30px_rgba(0,240,255,0.4)]'
                  : 'bg-primary-800/50 text-gray-300 border border-white/10 hover:border-electric-500/50'
                }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {activeQuestions.map((faq, index) => {
            const isOpen = openQuestion === index

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`overflow-hidden rounded-2xl border transition-all duration-300
                  ${isOpen
                    ? 'bg-gradient-to-br from-primary-800/50 to-primary-900/50 border-electric-500/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                    : 'bg-primary-800/30 border-white/10 hover:border-white/20'
                  }`}
              >
                {/* Question */}
                <button
                  onClick={() => setOpenQuestion(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                >
                  <span className={`font-semibold text-lg transition-colors
                    ${isOpen ? 'text-electric-500' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-6 h-6 flex-shrink-0 transition-colors
                      ${isOpen ? 'text-electric-500' : 'text-gray-400'}`} />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-300 mb-6">
            Your question isn't listed?
          </p>
          <motion.a
            href="/en/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4
              bg-gradient-to-r from-purple-500 to-electric-500
              text-white rounded-full font-display font-bold text-lg
              shadow-[0_0_40px_rgba(168,85,247,0.4)]
              hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]
              transition-all duration-300"
          >
            Get Personal Consultation
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
