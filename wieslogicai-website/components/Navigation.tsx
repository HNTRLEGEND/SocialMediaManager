'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Menu, X, Zap, ArrowRight } from 'lucide-react'

const navLinks = [
  { name: 'Solutions', href: '#solutions' },
  { name: 'How It Works', href: '#process' },
  { name: 'Case Studies', href: '#cases' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' }
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(10, 14, 39, 0)', 'rgba(10, 14, 39, 0.95)']
  )

  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(20px)']
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'border-b border-white/10 shadow-2xl' : ''}`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-neon-500
              rounded-xl flex items-center justify-center
              shadow-[0_0_20px_rgba(0,240,255,0.4)]
              group-hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]
              transition-all duration-300">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white
              group-hover:text-electric-500 transition-colors">
              WiesLogicAI
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-gray-300 hover:text-electric-500
                  font-medium transition-colors duration-300
                  relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5
                  bg-electric-500 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-electric-500 text-primary-900
                rounded-full font-display font-bold
                shadow-[0_0_30px_rgba(0,240,255,0.4)]
                hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]
                transition-all duration-300
                flex items-center gap-2"
            >
              Book Demo
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center
              text-white hover:text-electric-500 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-electric-500
                  font-medium py-2 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-3 bg-electric-500 text-primary-900
                rounded-full font-display font-bold mt-4
                flex items-center justify-center gap-2"
            >
              Book Demo
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  )
}
