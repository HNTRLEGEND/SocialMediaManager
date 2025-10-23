'use client';

import { motion } from 'framer-motion';
import { services } from '../../lib/data';
import { Card, CardDescription, CardMetric, CardTitle } from '../ui/card';

export function ServicesSection() {
  return (
    <section id="leistungen" className="px-4 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Leistungen</span>
          <h2 className="section-heading text-white">End-to-End Automatisierung aus einer Hand</h2>
          <p className="section-subtitle">
            Von der Potenzialanalyse bis zum Voice Agent: WIES.AI liefert die komplette Automations-Experience – inklusive
            Architektur, Betrieb und Erfolgsmessung.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Card className="h-full bg-gradient-to-br from-white/10 via-white/0 to-primary/10">
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
