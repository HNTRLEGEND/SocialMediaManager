'use client';

import { motion } from 'framer-motion';
import { caseStudies } from '../../lib/data';

export function CaseStudiesSection() {
  return (
    <section id="cases" className="px-4 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Beispiele</span>
          <h2 className="section-heading text-white">So setzen Unternehmen WIES.AI bereits ein</h2>
          <p className="section-subtitle">
            Drei Use-Cases, die zeigen, wie wir komplexe Abläufe automatisieren, Service erlebbar machen und neue Umsatzpotenziale freischalten.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {caseStudies.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-background/60 to-white/5 p-6"
            >
              <div className="text-xs uppercase tracking-[0.4rem] text-primary/70">{item.industry}</div>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3rem] text-primary">
                Mehr erfahren →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
