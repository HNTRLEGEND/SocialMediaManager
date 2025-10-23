'use client';

// ServicesSection: Präsentiert die vier Kernleistungen als Karten mit Icon, KPI und Kurztext.
// Die Inhalte stammen aus `lib/data.ts` und werden mit Framer Motion sanft eingeblendet.

import { AdjustmentsHorizontalIcon, Cog6ToothIcon, MicrophoneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { services } from '../../lib/data';
import { Card, CardDescription, CardMetric, CardTitle } from '../ui/card';

const serviceIcons = {
  sparkle: SparklesIcon,
  compass: AdjustmentsHorizontalIcon,
  workflow: Cog6ToothIcon,
  headset: MicrophoneIcon
} as const;

export function ServicesSection() {
  return (
    <section id="leistungen" className="bg-white/80 px-4 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Leistungen</span>
          <h2 className="section-heading">Skalierbare KI-Bausteine für den Mittelstand</h2>
          <p className="section-subtitle">
            Modular, schnell implementierbar und nahtlos in Ihre Systeme integrierbar. Wir begleiten Sie von der Idee bis zum Betrieb.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = serviceIcons[service.icon as keyof typeof serviceIcons];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {Icon ? <Icon className="h-6 w-6" aria-hidden /> : null}
                  </div>
                  <CardMetric>{service.metric}</CardMetric>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
