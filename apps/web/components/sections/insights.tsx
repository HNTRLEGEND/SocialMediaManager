'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const posts = [
  {
    title: 'AI Voice Agents: Leitfaden für Mittelstand 2026',
    excerpt: 'Welche Prozesse sich eignen, wie Guardrails aussehen und warum Voice + Automatisierung zusammengehören.',
    category: 'Voice Automation'
  },
  {
    title: 'Row-Level Security & Audit Trails in Multi-Tenant Systemen',
    excerpt: 'Best Practices aus unseren NestJS + Prisma Projekten inklusive OpenTelemetry Stack.',
    category: 'Architecture'
  },
  {
    title: 'Usage-Based Billing mit Stripe & BullMQ orchestrieren',
    excerpt: 'So bauen wir skalierbare, faire Preis-Modelle für Seats + Verbrauch.',
    category: 'Growth'
  }
];

export function InsightsSection() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Insights</span>
          <h2 className="section-heading text-white">Thought Leadership & Roadmap Transparenz</h2>
          <p className="section-subtitle">
            Wir teilen Playbooks, Benchmarks und technische Deep-Dives – damit Ihr Team 10x schneller lernt.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">{post.category}</div>
              <h3 className="mt-4 text-xl font-semibold text-white">{post.title}</h3>
              <p className="mt-3 flex-1 text-sm text-slate-300">{post.excerpt}</p>
              <Link href="/insights" className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3rem] text-primary">
                Artikel lesen →
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
