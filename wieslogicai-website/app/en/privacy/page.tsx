'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserX, FileText } from 'lucide-react'

const sections = [
  {
    icon: Shield,
    title: '1. Privacy at a Glance',
    content: `
      <h3>General Information</h3>
      <p>The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can personally identify you.</p>

      <h3>Data Collection on this Website</h3>
      <h4>Who is responsible for data collection on this website?</h4>
      <p>Data processing on this website is carried out by the website operator. You can find their contact details in the imprint of this website.</p>

      <h4>How do we collect your data?</h4>
      <p>Your data is collected in part by you providing it to us. This could, for example, be data you enter in a contact form.</p>
      <p>Other data is collected automatically by our IT systems when you visit the website. This is mainly technical data (e.g., internet browser, operating system, or time of page access).</p>
    `
  },
  {
    icon: Lock,
    title: '2. Hosting and Content Delivery Networks (CDN)',
    content: `
      <h3>External Hosting</h3>
      <p>This website is hosted by an external service provider (host). The personal data collected on this website is stored on the host's servers.</p>
      <p><strong>Server Location:</strong> Germany (Frankfurt am Main)</p>
      <p><strong>GDPR compliant:</strong> Yes, data processing agreement in place</p>
      <p>The use of the host is for the purpose of fulfilling the contract with our potential and existing customers (Art. 6 Abs. 1 lit. b GDPR) and in the interest of a secure, fast and efficient provision of our online offer by a professional provider (Art. 6 Abs. 1 lit. f GDPR).</p>
    `
  },
  {
    icon: Database,
    title: '3. General Information and Mandatory Information',
    content: `
      <h3>Privacy</h3>
      <p>We take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with statutory data protection regulations and this privacy policy.</p>

      <h3>Notice on the Responsible Party</h3>
      <p>The responsible party for data processing on this website is:</p>
      <p>
        <strong>Tenify.AI</strong><br>
        Daniel Wies<br>
        Charleville-Mezieres-Platz 5<br>
        48249 Dülmen<br>
        Germany
      </p>
      <p>Phone: +49 151 404 32 992<br>
      Email: hello@tenify.ai</p>

      <h3>Storage Duration</h3>
      <p>Unless a more specific storage period is stated in this privacy policy, your personal data will remain with us until the purpose for data processing no longer applies. If you assert a legitimate request for deletion or revoke consent for data processing, your data will be deleted unless we have other legally permissible reasons for storing your personal data.</p>
    `
  },
  {
    icon: Eye,
    title: '4. Data Collection on this Website',
    content: `
      <h3>Contact Form</h3>
      <p>If you send us inquiries via the contact form, your information from the inquiry form, including the contact data you provide there, will be stored by us for the purpose of processing the inquiry and in case of follow-up questions.</p>
      <p><strong>Legal Basis:</strong> Art. 6 Abs. 1 lit. b GDPR (contract initiation)</p>
      <p><strong>Storage Duration:</strong> Until your inquiry is fully processed, then 30 days, unless a business relationship develops</p>

      <h3>Inquiry by Email, Phone, or Fax</h3>
      <p>If you contact us by email, phone, or fax, your inquiry including all resulting personal data (name, inquiry) will be stored and processed by us for the purpose of handling your request.</p>

      <h3>Server Log Files</h3>
      <p>The page provider automatically collects and stores information in so-called server log files, which your browser automatically transmits to us:</p>
      <ul>
        <li>Browser type and browser version</li>
        <li>Operating system used</li>
        <li>Referrer URL</li>
        <li>Hostname of the accessing computer</li>
        <li>Time of server request</li>
        <li>IP address (anonymized)</li>
      </ul>
      <p>This data is not merged with other data sources. The collection of this data is based on Art. 6 Abs. 1 lit. f GDPR.</p>
    `
  },
  {
    icon: FileText,
    title: '5. Your Rights',
    content: `
      <h3>Right to Information</h3>
      <p>You have the right to receive information about your personal data stored by us at any time.</p>

      <h3>Right to Correction, Deletion, and Restriction</h3>
      <p>You have the right to request the correction, deletion, or restriction of the processing of your personal data at any time.</p>

      <h3>Right to Data Portability</h3>
      <p>You have the right to have data that we process automatically based on your consent or in fulfillment of a contract handed over to you or to a third party in a common, machine-readable format.</p>

      <h3>Right to Object</h3>
      <p>You have the right to object at any time to the processing of your personal data if the processing is based on Art. 6 Abs. 1 lit. f GDPR.</p>

      <h3>Right to Lodge a Complaint with the Supervisory Authority</h3>
      <p>In the event of violations of the GDPR, data subjects have the right to lodge a complaint with a supervisory authority. The right to lodge a complaint exists without prejudice to other administrative or judicial remedies.</p>
    `
  },
  {
    icon: UserX,
    title: '6. Revocation of Your Consent to Data Processing',
    content: `
      <p>Many data processing operations are only possible with your express consent. You can revoke consent you have already given at any time. The lawfulness of data processing carried out until the revocation remains unaffected by the revocation.</p>

      <h3>Contact for Privacy Questions</h3>
      <p>If you have questions about privacy, please send us an email:</p>
      <p><strong className="text-electric-500">privacy@tenify.ai</strong></p>
    `
  }
]

export default function PrivacyPage() {
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
              <Shield className="w-4 h-4" />
              GDPR Compliant
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Privacy
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-neon-500">
                Policy
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your data is safe with us. Transparency and data protection are important to us.
            </p>
          </div>

          {/* Last Updated */}
          <div className="mb-12 p-4 bg-electric-500/10 border border-electric-500/30 rounded-xl text-center">
            <p className="text-gray-300">
              <span className="text-white font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-gradient-to-br from-primary-800/50 to-primary-900/50
                  backdrop-blur-xl border border-white/10 rounded-3xl"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-electric-500/10 rounded-xl
                    flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-electric-500" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white pt-2">
                    {section.title}
                  </h2>
                </div>

                <div
                  className="prose prose-invert prose-lg max-w-none
                    [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3
                    [&_h4]:font-semibold [&_h4]:text-lg [&_h4]:text-gray-200 [&_h4]:mt-4 [&_h4]:mb-2
                    [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:text-gray-300 [&_ul]:space-y-2 [&_ul]:mb-4
                    [&_li]:pl-2
                    [&_strong]:text-white [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </motion.div>
            ))}
          </div>

          {/* Important Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-r from-gold-500/10 to-electric-500/10
              border border-gold-500/30 rounded-2xl"
          >
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              Important Note
            </h3>
            <div className="text-gray-300 space-y-4">
              <p>
                This privacy policy is a template and must be adapted to your specific circumstances.
              </p>
              <p>
                <span className="text-gold-500 font-semibold">Please replace:</span>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>All placeholders in [square brackets] with your actual data</li>
                <li>If you use analytics, cookies, or other tracking tools: Add corresponding sections</li>
                <li>If you use social media plugins: Add corresponding notices</li>
              </ul>
              <p className="mt-6 text-white font-semibold">
                For a legally secure privacy policy, we recommend consulting a lawyer specializing in IT law
                or using professional privacy policy generators.
              </p>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-300 mb-6 text-lg">
              Questions about privacy?
            </p>
            <motion.a
              href="mailto:privacy@tenify.ai"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4
                bg-gradient-to-r from-electric-500 to-neon-500
                text-primary-900 rounded-full font-display font-bold text-lg
                shadow-[0_0_40px_rgba(0,240,255,0.4)]
                hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]
                transition-all duration-300"
            >
              Contact Us
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
