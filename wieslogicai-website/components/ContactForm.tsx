'use client'

import { motion } from 'framer-motion'
import { Send, User, Mail, Building2, MessageSquare, Phone, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const industries = [
  'Arztpraxis',
  'Zahnarztpraxis',
  'Friseursalon / Beauty',
  'Anwaltskanzlei',
  'Steuerberatung',
  'B2B Dienstleister',
  'E-Commerce',
  'Handwerk',
  'Gastronomie',
  'Sonstige'
]

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    message: '',
    gdprConsent: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Bitte geben Sie Ihren Namen ein'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Bitte beschreiben Sie Ihr Anliegen'
    }

    if (!formData.gdprConsent) {
      newErrors.gdprConsent = 'Bitte akzeptieren Sie die Datenschutzerklärung'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call - hier später n8n Webhook einbinden
    try {
      // TODO: Replace with actual n8n webhook endpoint
      // await fetch('YOUR_N8N_WEBHOOK_URL', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setIsSubmitted(true)
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ submit: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden
          bg-gradient-to-br from-primary-800/50 to-primary-900/50
          backdrop-blur-xl border border-electric-500/30
          rounded-3xl p-12 text-center
          shadow-[0_0_60px_rgba(0,240,255,0.3)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-electric-500/20 rounded-full
            flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-electric-500" />
        </motion.div>

        <h3 className="font-display text-3xl font-bold text-white mb-4">
          Vielen Dank für Ihre Anfrage!
        </h3>
        <p className="text-xl text-gray-300 mb-6">
          Wir haben Ihre Nachricht erhalten und melden uns innerhalb von <span className="text-electric-500 font-semibold">24 Stunden</span> bei Ihnen.
        </p>
        <p className="text-gray-400">
          Sie erhalten in Kürze eine Bestätigungs-E-Mail an <span className="text-white font-semibold">{formData.email}</span>
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
            Ihr Name *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-primary-800/50 border rounded-xl
                text-white placeholder-gray-500
                focus:outline-none focus:border-electric-500/50 transition-colors
                ${errors.name ? 'border-red-500/50' : 'border-white/10'}`}
              placeholder="Max Mustermann"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
            E-Mail-Adresse *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-primary-800/50 border rounded-xl
                text-white placeholder-gray-500
                focus:outline-none focus:border-electric-500/50 transition-colors
                ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
              placeholder="max@beispiel.de"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-white mb-2">
            Firma / Praxis
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Building2 className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-primary-800/50 border border-white/10 rounded-xl
                text-white placeholder-gray-500
                focus:outline-none focus:border-electric-500/50 transition-colors"
              placeholder="Musterfirma GmbH"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
            Telefon
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-primary-800/50 border border-white/10 rounded-xl
                text-white placeholder-gray-500
                focus:outline-none focus:border-electric-500/50 transition-colors"
              placeholder="+49 123 456789"
            />
          </div>
        </div>
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-semibold text-white mb-2">
          Ihre Branche
        </label>
        <select
          id="industry"
          value={formData.industry}
          onChange={(e) => handleChange('industry', e.target.value)}
          className="w-full px-4 py-3 bg-primary-800/50 border border-white/10 rounded-xl
            text-white
            focus:outline-none focus:border-electric-500/50 transition-colors"
        >
          <option value="">Bitte wählen</option>
          {industries.map((industry) => (
            <option key={industry} value={industry} className="bg-primary-800">
              {industry}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
          Ihre Nachricht *
        </label>
        <div className="relative">
          <div className="absolute left-4 top-4 text-gray-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            rows={5}
            className={`w-full pl-12 pr-4 py-3 bg-primary-800/50 border rounded-xl
              text-white placeholder-gray-500 resize-none
              focus:outline-none focus:border-electric-500/50 transition-colors
              ${errors.message ? 'border-red-500/50' : 'border-white/10'}`}
            placeholder="Beschreiben Sie kurz Ihr Anliegen und welche Prozesse Sie automatisieren möchten..."
          />
        </div>
        {errors.message && (
          <p className="mt-1 text-sm text-red-400">{errors.message}</p>
        )}
      </div>

      {/* GDPR Consent */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.gdprConsent}
            onChange={(e) => handleChange('gdprConsent', e.target.checked)}
            className={`mt-1 w-5 h-5 rounded border-2 bg-primary-800/50
              text-electric-500 focus:ring-electric-500 focus:ring-offset-0 cursor-pointer
              ${errors.gdprConsent ? 'border-red-500/50' : 'border-white/10'}`}
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Ich habe die{' '}
            <a href="/de/datenschutz" className="text-electric-500 hover:underline">
              Datenschutzerklärung
            </a>{' '}
            zur Kenntnis genommen. Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen gespeichert werden. *
          </span>
        </label>
        {errors.gdprConsent && (
          <p className="mt-1 text-sm text-red-400">{errors.gdprConsent}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className={`w-full px-8 py-4 rounded-xl font-display font-bold text-lg
          flex items-center justify-center gap-3
          transition-all duration-300
          ${isSubmitting
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-electric-500 to-neon-500 text-primary-900 shadow-[0_0_40px_rgba(0,240,255,0.4)] hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]'
          }`}
      >
        {isSubmitting ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            Wird gesendet...
          </>
        ) : (
          <>
            Nachricht senden
            <Send className="w-5 h-5" />
          </>
        )}
      </motion.button>

      {errors.submit && (
        <p className="text-center text-red-400">{errors.submit}</p>
      )}

      {/* Info text */}
      <p className="text-center text-sm text-gray-400">
        Wir melden uns innerhalb von 24 Stunden bei Ihnen
      </p>
    </form>
  )
}
