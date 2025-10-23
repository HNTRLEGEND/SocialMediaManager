'use client';

// HeroSection: Modernes Intro mit CTA, Bulletpoints und KPI-Karten. Die Light-Version
// setzt auf ein dunkles Hero mit Neon-Akzenten, damit die nachfolgenden hellen Bereiche
// kontrastreich wirken und sofort Vertrauen aufbauen.

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

const bulletPoints = ['KI Prozessberatung', 'AI Voice Agents', 'Automatisierte Workflows'];

const stats = [
  { value: '200%', label: 'Effizienzsteigerung' },
  { value: '45 Tage', label: 'Time-to-Automation' },
  { value: '98%', label: 'Kundenzufriedenheit' }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy px-4 pb-24 pt-36 text-white" id="hero">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,216,255,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,138,0,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061329]/70 via-transparent to-[#0A1F3A]" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8"
        >
          <span className="inline-flex w-max items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[11px] uppercase tracking-[0.45rem] text-primary">
            Intelligente Automatisierung für den Mittelstand
          </span>
          <h1 className="max-w-3xl text-4xl font-display leading-tight md:text-6xl">
            Automatisieren Sie Ihr Unternehmen mit <span className="gradient-text">Künstlicher Intelligenz</span>.
          </h1>
          <p className="max-w-2xl text-lg text-slate-100">
            Wir analysieren, beraten und implementieren KI-gestützte Automatisierungen für kleine und mittelständische Unternehmen –
            inklusive Voice Agents, Workflow-Orchestrierung und messbarem ROI.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" variant="accent" asChild>
              <Link href="#kontakt">Kostenlose Potenzialanalyse starten</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#cases">Mehr erfahren</Link>
            </Button>
          </div>
          <ul className="grid grid-cols-1 gap-3 text-sm text-slate-100 sm:grid-cols-3">
            {bulletPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <CheckCircleIcon className="h-5 w-5 text-primary" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="relative flex flex-col gap-6"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_60px_140px_-40px_rgba(4,12,25,0.7)]">
            <Image
              src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80"
              alt="Abstrakte Darstellung eines neuronalen Netzes"
              width={900}
              height={900}
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061329]/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35rem] text-slate-200">
                  <span>Realtime Insights</span>
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-primary">Live</span>
                </div>
                <p className="mt-4 text-base text-slate-100">
                  Wir verbinden KI, Automatisierung und Voice, damit Ihr Unternehmen schneller entscheidet und Kund:innen 24/7 betreut.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-semibold text-white">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.3rem] text-slate-200">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
