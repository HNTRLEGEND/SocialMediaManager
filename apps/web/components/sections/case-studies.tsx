'use client';

// CaseStudiesSection: Präsentiert exemplarische Projekte als Social Proof
// und zeigt, welche Ergebnisse Kund:innen erwarten können.

import { motion } from 'framer-motion';
import Link from 'next/link';
import { caseStudies } from '../../lib/data';

export function CaseStudiesSection() {
  return (
    <section id="cases" className="px-4 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Projekte</span>
          <h2 className="section-heading">Ergebnisse, die überzeugen</h2>
          <p className="section-subtitle">
            Von Service über Vertrieb bis Finance: Diese Use Cases zeigen, wie KI-Automatisierung konkrete Kennzahlen verbessert.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {caseStudies.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="flex h-full flex-col rounded-3xl border border-navy/10 bg-white p-6 shadow-[0_30px_70px_-40px_rgba(10,25,47,0.45)]"
            >
              <div className="text-xs uppercase tracking-[0.4rem] text-primary/80">{item.industry}</div>
              <h3 className="mt-4 text-xl font-semibold text-navy">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm text-slate-600">{item.description}</p>
              <Link href="#kontakt" className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3rem] text-primary">
                Case besprechen →
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
