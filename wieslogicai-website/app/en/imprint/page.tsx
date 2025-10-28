'use client'

import { motion } from 'framer-motion'
import { Scale } from 'lucide-react'

export default function ImprintPage() {
  return (
    <main className="relative min-h-screen bg-primary-950 pt-32 pb-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-electric-500/10 border border-electric-500/30
              text-electric-500 text-sm font-semibold uppercase tracking-wider mb-6">
              <Scale className="w-4 h-4" />
              Legal Information
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Imprint
            </h1>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
              backdrop-blur-xl border border-white/10 rounded-3xl space-y-8">

              {/* Information according to § 5 TMG */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Information according to § 5 TMG
                </h2>
                <div className="text-gray-300 space-y-2">
                  <p className="text-white font-semibold">
                    Tenify.AI
                  </p>
                  <p>Daniel Wies</p>
                  <p>Charleville-Mezieres-Platz 5</p>
                  <p>48249 Dülmen</p>
                  <p>Germany</p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Contact
                </h2>
                <div className="text-gray-300 space-y-2">
                  <p>Phone: +49 151 404 32 992</p>
                  <p>Email: hello@tenify.ai</p>
                </div>
              </section>

              {/* VAT ID */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  VAT ID
                </h2>
                <div className="text-gray-300">
                  <p>
                    VAT identification number according to § 27 a Umsatzsteuergesetz (German VAT law):
                  </p>
                  <p className="text-electric-500 font-semibold">
                    [Your VAT ID - if available]
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    If you don't have a VAT ID, you can remove this section or replace it with "Applied for".
                  </p>
                </div>
              </section>

              {/* Professional Title */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Professional Title
                </h2>
                <div className="text-gray-300">
                  <p>IT Consulting and Software Services</p>
                </div>
              </section>

              {/* Responsible for Content */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Responsible for Content according to § 55 Abs. 2 RStV
                </h2>
                <div className="text-gray-300">
                  <p>Daniel Wies</p>
                  <p>Charleville-Mezieres-Platz 5</p>
                  <p>48249 Dülmen</p>
                </div>
              </section>

              {/* EU Dispute Resolution */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  EU Dispute Resolution
                </h2>
                <div className="text-gray-300">
                  <p>
                    The European Commission provides a platform for online dispute resolution (ODR):
                  </p>
                  <p>
                    <a
                      href="https://ec.europa.eu/consumers/odr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-electric-500 hover:underline"
                    >
                      https://ec.europa.eu/consumers/odr/
                    </a>
                  </p>
                  <p className="mt-2">
                    Our email address can be found above in the imprint.
                  </p>
                </div>
              </section>

              {/* Consumer Dispute Resolution */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Consumer Dispute Resolution / Universal Conciliation Body
                </h2>
                <div className="text-gray-300">
                  <p>
                    We are not willing or obligated to participate in dispute resolution proceedings before a consumer arbitration board.
                  </p>
                </div>
              </section>

              {/* Liability for Content */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Liability for Content
                </h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    As a service provider, we are responsible for our own content on these pages according to general laws in accordance with § 7 Abs.1 TMG. However, according to §§ 8 to 10 TMG, we are not obligated as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
                  </p>
                  <p>
                    Obligations to remove or block the use of information according to general laws remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific legal violation. Upon becoming aware of corresponding legal violations, we will remove this content immediately.
                  </p>
                </div>
              </section>

              {/* Liability for Links */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Liability for Links
                </h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    Our offer contains links to external third-party websites over whose content we have no influence. Therefore, we cannot assume any liability for this third-party content. The respective provider or operator of the pages is always responsible for the content of the linked pages.
                  </p>
                </div>
              </section>

              {/* Copyright */}
              <section>
                <h2 className="font-display text-2xl font-bold text-white mb-4">
                  Copyright
                </h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, editing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.
                  </p>
                </div>
              </section>

              {/* Note */}
              <div className="mt-12 p-6 bg-gold-500/10 border border-gold-500/30 rounded-xl">
                <p className="text-sm text-gray-300">
                  <span className="text-gold-500 font-semibold">Note:</span> Please replace the placeholders (in [square brackets]) with your actual data. For legally secure protection, we recommend using a professional imprint generator or consulting a lawyer.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
