'use client';

import { motion } from 'framer-motion';
import { dashboardKpis, workflowNodes } from '@/lib/data';
import { Button } from '@/components/ui';

export function PlatformSection() {
  return (
    <section className="bg-background/60 px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Plattform</span>
          <h2 className="section-heading text-white">Alles an einem Ort – Dashboard, Agents, Workflows, Billing</h2>
          <p className="section-subtitle">
            Multi-Tenant-fähig, rollenbasiert und mit Echtzeit-Metriken. WIESLOGIC.DE bündelt die Steuerzentrale für Ihre KI-Assets und Voice Agents.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">Org Overview</h3>
                <p className="text-sm text-slate-300">Kosten, Calls, ROI und aktive Agents im Sekundentakt.</p>
              </div>
              <Button variant="outline" size="sm">
                Dashboard öffnen
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {dashboardKpis.map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-white/5 bg-background/70 p-5">
                  <div className="text-xs uppercase tracking-[0.4rem] text-primary/60">{kpi.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{kpi.value}</div>
                  <div className="text-xs text-primary">{kpi.trend}</div>
                  <p className="mt-3 text-xs text-slate-300">{kpi.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-background/70 via-white/0 to-primary/10 p-8"
          >
            <div className="text-xs uppercase tracking-[0.4rem] text-primary/60">Workflow Builder</div>
            <h3 className="mt-4 text-2xl font-semibold text-white">Visuelles Routing mit Guardrails</h3>
            <p className="mt-4 text-sm text-slate-300">
              Konfigurieren Sie Voice-, Chat- und Backoffice-Agents mit Tools, Guardrails, Webhooks und Observability – per Drag & Drop.
            </p>
            <div className="mt-6 space-y-4">
              {workflowNodes.map((node) => (
                <div key={node.id} className="rounded-2xl border border-white/10 bg-background/70 p-4">
                  <div className="text-sm font-semibold text-white">{node.title}</div>
                  <div className="text-xs text-slate-300">{node.description}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: 'Clerk Auth + Rollen',
              description: 'Owner, Admin, Member, Viewer – inkl. Mandantenfähigkeit & SCIM-ready.'
            },
            {
              title: 'Realtime Telemetrie',
              description: 'Socket.IO liefert Live-Events zu Calls, Kosten, Fehlern & Feature-Flags.'
            },
            {
              title: 'Stripe Billing',
              description: 'Seat- und Usage-basierte Abrechnung mit Self-Service-Upgrades.'
            }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/5 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.4rem] text-primary/70">Feature</div>
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
