'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32" id="hero">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-60"></div>
      <div className="absolute inset-x-0 top-16 -z-10 h-64 w-[600px] translate-x-1/2 rounded-full bg-primary/20 blur-[120px] md:w-[900px]"></div>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 text-left">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex max-w-max items-center gap-2 rounded-full border border-primary/30 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.45rem] text-primary"
        >
          The Control Hub for AI Automation
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-3xl text-4xl font-display leading-tight text-white md:text-6xl"
        >
          Wir automatisieren Ihre Geschäftsprozesse mit <span className="gradient-text">Künstlicher Intelligenz</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-2xl text-lg text-slate-200"
        >
          Von der Analyse bis zur Implementierung – WIES.AI liefert KI-gestützte Workflows, Voice Agents und Dashboards, die den
          Mittelstand skalierbar machen.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col gap-4 md:flex-row"
        >
          <Button size="lg" variant="accent" asChild>
            <Link href="#kontakt">Kostenlose Potenzialanalyse starten</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#cases">Case Studies ansehen</Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative mt-16 grid grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4"
        >
          {[{
            label: 'Realtime KPI Monitoring',
            value: 'Live Calls, Minutes, ROI'
          },
          {
            label: 'Voice Agents as a Service',
            value: 'ElevenLabs + Guardrails'
          },
          {
            label: 'Automation Fabric',
            value: 'n8n, APIs & Workflows'
          },
          {
            label: 'Security by Design',
            value: 'RLS, Encryption, Audit Logs'
          }].map((item) => (
            <div key={item.label} className="flex flex-col rounded-2xl bg-background/40 p-4">
              <span className="text-xs uppercase tracking-[0.4rem] text-primary/80">{item.label}</span>
              <span className="mt-4 text-lg font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
