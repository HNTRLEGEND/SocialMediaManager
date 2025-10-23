'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-28 pt-36" id="hero">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-background via-background/80 to-[#0f2747]" />
      <video
        className="pointer-events-none absolute inset-0 -z-30 h-full w-full object-cover opacity-40"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="https://cdn.coverr.co/videos/coverr-a-digital-wave-3189/1080p.mp4" type="video/mp4" />
      </video>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex max-w-max items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[10px] uppercase tracking-[0.45rem] text-primary/90"
        >
          <span>Intelligente Automatisierung für den Mittelstand</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-4xl text-4xl font-display leading-tight text-white md:text-6xl"
        >
          Wir automatisieren Ihre Geschäftsprozesse mit <span className="gradient-text">Künstlicher Intelligenz</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-2xl text-lg text-slate-200"
        >
          Von der Analyse bis zur Umsetzung – wir entwickeln maßgeschneiderte KI-Workflows, Voice Agents und Automationskonzepte
          mit n8n, OpenAI und ElevenLabs, die sofort messbaren Impact liefern.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Button size="lg" variant="accent" asChild className="min-w-[220px]">
            <Link href="#kontakt">Kostenlose Potenzialanalyse starten</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#cases">Beispiele ansehen</Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="grid grid-cols-1 gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: 'Realtime KPI Monitoring',
              value: 'Live Calls, Minuten & Conversion'
            },
            {
              label: 'Voice Agents as a Service',
              value: 'ElevenLabs Voices + Guardrails'
            },
            {
              label: 'Automation Fabric',
              value: 'n8n Workflows, API Layer, CRM'
            },
            {
              label: 'Security by Design',
              value: 'DSGVO, Audit Trails, Zugriffsmatrix'
            }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-background/60 p-5 shadow-card">
              <span className="text-[11px] uppercase tracking-[0.35rem] text-primary/80">{item.label}</span>
              <span className="mt-4 block text-lg font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
