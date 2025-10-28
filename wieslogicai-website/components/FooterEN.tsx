'use client'

import { motion } from 'framer-motion'
import { Zap, Mail, MapPin, Linkedin, Twitter, Github, Phone } from 'lucide-react'

const footerLinks = {
  solutions: [
    { name: 'AI Voice Agent', href: '/#workflows' },
    { name: 'Lead Qualification', href: '/#workflows' },
    { name: 'Sales Automation', href: '/#workflows' },
    { name: 'Service Workflows', href: '/#workflows' }
  ],
  company: [
    { name: 'About us', href: '/en/about' },
    { name: 'References', href: '/#testimonials' },
    { name: 'Contact', href: '/en/contact' }
  ],
  resources: [
    { name: 'FAQ', href: '/#faq' },
    { name: 'ROI Calculator', href: '/#roi' }
  ],
  legal: [
    { name: 'Privacy', href: '/en/privacy' },
    { name: 'Imprint', href: '/en/imprint' }
  ]
}

export default function FooterEN() {
  return (
    <footer className="relative bg-primary-950 border-t border-white/10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-neon-500
                  rounded-xl flex items-center justify-center
                  shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-display text-xl font-bold text-white">
                  Tenify.AI
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                10X growth through AI automation. We implement intelligent workflows that work for you 24/7.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-electric-500" />
                  <a href="mailto:hello@tenify.ai" className="hover:text-electric-500 transition-colors">
                    hello@tenify.ai
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-4 h-4 text-electric-500" />
                  <a href="tel:+4915140432992" className="hover:text-electric-500 transition-colors">
                    +49 151 404 32 992
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-electric-500" />
                  <span>Dülmen, Germany & Remote</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-electric-500 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-12 pb-8"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-2xl font-bold text-white mb-3">
              Stay up to date
            </h3>
            <p className="text-gray-400 mb-6">
              Receive weekly insights on AI automation, industry trends, and exclusive tips.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-3 bg-primary-800/50 border border-white/10
                  rounded-full text-white placeholder-gray-500
                  focus:outline-none focus:border-electric-500/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-electric-500 text-primary-900
                  rounded-full font-display font-bold
                  shadow-[0_0_30px_rgba(0,240,255,0.4)]
                  hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]
                  transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Tenify.AI. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {[
              { icon: Linkedin, href: 'https://linkedin.com' },
              { icon: Twitter, href: 'https://twitter.com' },
              { icon: Github, href: 'https://github.com' }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 bg-primary-800/50 border border-white/10
                  rounded-full flex items-center justify-center
                  text-gray-400 hover:text-electric-500 hover:border-electric-500/50
                  transition-all duration-300"
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          {/* Badge */}
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span>Made in Germany</span>
            <span className="text-electric-500">⚡</span>
            <span>GDPR compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
