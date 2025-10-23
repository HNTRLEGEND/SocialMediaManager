'use client';

// ProcessSection: Beschreibt den Projektablauf in drei Schritten, um Klarheit zu schaffen.

import { motion } from 'framer-motion';
import { process } from '../../lib/data';

export function ProcessSection() {
  return (
    <section id="ablauf" className="bg-slate-100 px-4 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Ablauf</span>
          <h2 className="section-heading">So bringen wir KI in Ihr Unternehmen</h2>
          <p className="section-subtitle">
            Transparente Projektphasen mit klaren Meilensteinen – von der ersten Analyse bis zum rollierenden Enablement Ihrer Teams.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {process.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="rounded-3xl border border-navy/10 bg-white p-8 shadow-[0_30px_60px_-35px_rgba(10,25,47,0.45)]"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.4rem] text-primary/80">Step {String(index + 1).padStart(2, '0')}</div>
              <h3 className="mt-4 text-2xl font-display text-navy">{step.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
