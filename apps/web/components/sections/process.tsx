'use client';

import { motion } from 'framer-motion';
import { process } from '@/lib/data';
import { Card } from '@/components/ui';

export function ProcessSection() {
  return (
    <section id="workflow" className="bg-white/2 px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Ablauf</span>
          <h2 className="section-heading text-white">Analyse → Implementierung → Optimierung</h2>
          <p className="section-subtitle">
            Ein klarer Delivery-Prozess mit Meilensteinen, KPIs und Enablement – damit Ihr Team jederzeit steuernd eingreifen kann.
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
            >
              <Card className="h-full border-primary/20 bg-background/70 p-8">
                <div className="text-sm uppercase tracking-[0.4rem] text-primary/70">Step {index + 1}</div>
                <h3 className="mt-4 text-2xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
