'use client';

// MissionSection: Erzählt die Vision von WIES.AI, kombiniert Storytelling mit
// Vertrauenselementen wie Gründerfoto, Werte und Partnerschaften.

import Image from 'next/image';
import { motion } from 'framer-motion';

export function MissionSection() {
  return (
    <section id="mission" className="px-4 py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Über WIES.AI</span>
          <h2 className="section-heading mt-4">Wir machen KI verständlich, sicher und messbar</h2>
          <p className="mt-6 text-base text-slate-600">
            WIES.AI steht für pragmatische Automatisierungslösungen, die schnell Wirkung zeigen. Unser Team vereint KI-Architekt:innen,
            Prozessingenieur:innen und Voice-Spezialist:innen, die komplexe Technologie in klare Business-Resultate übersetzen.
          </p>
          <p className="mt-4 text-base text-slate-600">
            Wir arbeiten transparent, dokumentiert und mit Fokus auf Enablement – damit Ihre Mitarbeitenden neue Workflows verstehen,
            steuern und ausbauen können.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { label: 'Partnerschaften', value: 'Microsoft for Startups · NVIDIA Inception' },
              { label: 'Security & Compliance', value: 'DSGVO, EU-Cloud & Guardrails by Design' },
              { label: 'Automation Library', value: '30+ Playbooks & wiederverwendbare GPT-Agents' },
              { label: 'Enablement', value: 'Trainings, Dokumentation & Change-Workshops' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_20px_45px_-28px_rgba(10,25,47,0.4)]">
                <div className="text-xs uppercase tracking-[0.4rem] text-primary/80">{item.label}</div>
                <div className="mt-3 text-lg font-semibold text-navy">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -left-8 -top-10 hidden h-32 w-32 rounded-full bg-primary/30 blur-2xl md:block" />
          <div className="rounded-[32px] border border-navy/10 bg-white shadow-[0_60px_140px_-45px_rgba(10,25,47,0.45)]">
            <div className="overflow-hidden rounded-[32px]">
              <Image
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
                alt="Daniel Wies – Gründer von WIES.AI"
                width={600}
                height={720}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-3 px-8 pb-10 pt-8 text-sm text-slate-600">
              <p className="text-navy">"Wir übersetzen KI in spürbare Effekte für Teams, Kund:innen und Ergebnisse."</p>
              <p className="font-semibold text-navy">Daniel Wies · Gründer & AI Strategist</p>
              <p>Gemeinsam mit Ihnen bauen wir Systeme, die heute performen und morgen skalieren.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
