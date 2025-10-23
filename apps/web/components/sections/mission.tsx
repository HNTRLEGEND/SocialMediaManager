'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function MissionSection() {
  return (
    <section id="mission" className="px-4 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Mission</span>
          <h2 className="section-heading mt-4 text-white">Intelligente Automatisierung für den Mittelstand</h2>
          <p className="mt-6 text-base text-slate-200">
            Wir helfen Unternehmen, ihre Prozesse durch KI zu automatisieren, Voice Agents einzusetzen und dadurch Kosten, Zeit und
            Fehler zu reduzieren. Unser Team kombiniert Business-Verständnis, Enterprise-Architektur und Deep-Tech-Know-how.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { label: 'ElevenLabs Partner', value: 'Voice Agents ready' },
              { label: 'OpenTelemetry First', value: 'Observability integriert' },
              { label: 'Security & Compliance', value: 'EU-Cloud, DSGVO, RLS' },
              { label: 'Automation Library', value: '30+ Workflows, Templates' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-background/60 p-5">
                <div className="text-xs uppercase tracking-[0.4rem] text-primary/70">{item.label}</div>
                <div className="mt-3 text-lg font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
          <div className="absolute -left-10 -top-10 hidden h-24 w-24 rounded-full bg-primary/30 blur-2xl md:block" />
          <div className="glow-border rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80"
                alt="Team WIES.AI"
                width={540}
                height={540}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>Strategen, AI Engineers, Voice Architects und Prozess-Designer – vereint in einer Mission.</p>
              <p>Wir denken 10x, testen schnell und liefern produktionsreife Lösungen mit klarer Governance.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
