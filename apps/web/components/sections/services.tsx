'use client';

import { motion } from 'framer-motion';
import { services } from '@/lib/data';
import { Card, CardDescription, CardMetric, CardTitle } from '@/components/ui';

export function ServicesSection() {
  return (
    <section id="leistungen" className="px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Leistungen</span>
          <h2 className="section-heading text-white">AI-Power, gebaut für Mittelstand & KMU</h2>
          <p className="section-subtitle">
            Unser modulares Angebot liefert sichtbare Ergebnisse in Wochen statt Monaten – vollständig integriert in Ihre
            bestehende Systemlandschaft.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Card className="h-full bg-gradient-to-br from-white/5 via-white/0 to-white/5">
                <CardMetric>{service.metric}</CardMetric>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
