'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    details: '+49 151 404 32 992',
    href: 'tel:+4915140432992',
    description: 'Mon-Fri 9:00 AM - 6:00 PM',
    color: 'electric'
  },
  {
    icon: Mail,
    title: 'Email',
    details: 'hello@tenify.ai',
    href: 'mailto:hello@tenify.ai',
    description: 'Response within 24h',
    color: 'neon'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    details: '+49 151 404 32 992',
    href: 'https://wa.me/4915140432992',
    description: 'Direct chat',
    color: 'gold'
  },
  {
    icon: MapPin,
    title: 'Location',
    details: 'Dülmen, NRW',
    href: '#',
    description: 'In-person or Remote',
    color: 'purple'
  }
]

const colorClasses = {
  electric: {
    text: 'text-electric-500',
    bg: 'bg-electric-500/10',
    border: 'border-electric-500/30',
    hoverBorder: 'hover:border-electric-500/60'
  },
  neon: {
    text: 'text-neon-500',
    bg: 'bg-neon-500/10',
    border: 'border-neon-500/30',
    hoverBorder: 'hover:border-neon-500/60'
  },
  gold: {
    text: 'text-gold-500',
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/30',
    hoverBorder: 'hover:border-gold-500/60'
  },
  purple: {
    text: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/60'
  }
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-primary-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px]
          bg-electric-500/10 blur-[200px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-electric-500/10 border border-electric-500/30
              text-electric-500 text-sm font-semibold uppercase tracking-wider mb-6">
              <Send className="w-4 h-4" />
              Contact
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              <span className="block">Let's</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
                talk
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Free Initial Consultation · Individual Potential Analysis · No Obligation
            </p>
          </motion.div>

          {/* Contact Methods Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {contactMethods.map((method, index) => {
              const colors = colorClasses[method.color as keyof typeof colorClasses]

              return (
                <motion.a
                  key={index}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`group p-6 bg-gradient-to-br from-primary-800/50 to-primary-900/50
                    backdrop-blur-xl border ${colors.border}
                    rounded-2xl ${colors.hoverBorder}
                    transition-all duration-300`}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl
                    flex items-center justify-center mb-4
                    group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  <h3 className="font-semibold text-white mb-1">
                    {method.title}
                  </h3>
                  <p className={`text-sm ${colors.text} font-semibold mb-2`}>
                    {method.details}
                  </p>
                  <p className="text-xs text-gray-400">
                    {method.description}
                  </p>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Or write to us directly
            </h2>
            <p className="text-gray-300 text-lg">
              We'll get back to you within <span className="text-electric-500 font-semibold">24 hours</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden
              bg-gradient-to-br from-primary-800/50 to-primary-900/50
              backdrop-blur-xl border border-white/10
              rounded-3xl p-8 md:p-12
              shadow-[0_0_60px_rgba(0,240,255,0.1)]"
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* Response Time Guarantee */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-gradient-to-r from-electric-500/10 to-neon-500/10
              border border-electric-500/30 rounded-2xl text-center"
          >
            <Clock className="w-12 h-12 text-electric-500 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              Response Time Guarantee
            </h3>
            <p className="text-gray-300 text-lg">
              We respond to every inquiry within 24 hours (business days).
              For urgent matters, just give us a call!
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="relative py-16 bg-primary-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-3xl font-bold text-white mb-4">
              Have questions?
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Check out our FAQ - you might find your answer there
            </p>
            <motion.a
              href="/#faq"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3
                border-2 border-electric-500 text-electric-500
                rounded-full font-semibold
                hover:bg-electric-500 hover:text-primary-900
                transition-all duration-300"
            >
              To the FAQ
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
