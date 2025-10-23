'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function MissionSection() {
  return (
    <section id="ueber-uns" className="px-4 py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Über uns</span>
          <h2 className="section-heading mt-4 text-white">WIES.AI steht für pragmatische, sichere & wirkungsvolle KI-Lösungen</h2>
          <p className="mt-6 text-base text-slate-200">
            Wir helfen Unternehmen, ihre Prozesse mit KI zu automatisieren, Voice Agents einzusetzen und dadurch Kosten, Zeit und
            Fehler zu reduzieren. Unsere Projekte kombinieren Business-Verständnis, Enterprise-Architektur und Deep-Tech-Know-how.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { label: 'ElevenLabs Partner', value: 'Voice Agents ready' },
              { label: 'Security & Compliance', value: 'EU-Cloud, DSGVO, RLS' },
              { label: 'Automation Library', value: '30+ Workflows & Playbooks' },
              { label: 'Business Value Focus', value: 'ROI in Wochen statt Monaten' }
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
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
                alt="Daniel Wies – Gründer WIES.AI"
                width={540}
                height={540}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>"Ich habe WIES.AI gegründet, um Mittelstandsunternehmen eine skalierbare, sichere und ergebnisorientierte KI-Einführung zu ermöglichen."</p>
              <p className="text-white">Daniel Wies · Gründer & AI Strategist</p>
              <p>Strategen, AI Engineers und Prozess-Designer arbeiten gemeinsam an Lösungen, die sofort Wirkung zeigen.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
