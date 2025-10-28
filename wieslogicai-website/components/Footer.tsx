'use client'

import { motion } from 'framer-motion'
import { Zap, Mail, MapPin, Linkedin, Twitter, Github } from 'lucide-react'

const footerLinks = {
  solutions: [
    { name: 'AI Voice Agents', href: '#' },
    { name: 'AI Service Agents', href: '#' },
    { name: 'AI Personal Assistants', href: '#' },
    { name: 'Process Workflows', href: '#' }
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Case Studies', href: '#cases' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#contact' }
  ],
  resources: [
    { name: 'Blog', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'Support Center', href: '#' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
    { name: 'GDPR Compliance', href: '#' }
  ]
}

export default function Footer() {
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
                  WiesLogicAI
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                10X your business with AI automation. We build intelligent systems that work 24/7, so you don't have to.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-electric-500" />
                  <a href="mailto:hello@wieslogic.ai" className="hover:text-electric-500 transition-colors">
                    hello@wieslogic.ai
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-electric-500" />
                  <span>München & Remote Europe</span>
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
              Stay Ahead of the AI Curve
            </h3>
            <p className="text-gray-400 mb-6">
              Get weekly insights on AI automation, industry trends, and exclusive tips.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
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
            © {new Date().getFullYear()} WiesLogicAI. All rights reserved.
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
            <span>Built with</span>
            <span className="text-electric-500">⚡</span>
            <span>by WiesLogicAI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
