'use client';

// InsightsSection: Teasert aktuelle Inhalte, um Thought Leadership und Kompetenz zu unterstreichen.

import { motion } from 'framer-motion';
import Link from 'next/link';

const posts = [
  {
    title: 'AI Voice Agents als Umsatz-Booster im Customer Service',
    excerpt: 'Wie intelligente Sprachassistenten Self-Service-Quoten erhöhen und Kundenzufriedenheit steigern.',
    category: 'Voice Automation'
  },
  {
    title: 'Von manuellen Prozessen zu autonomen Workflows in 90 Tagen',
    excerpt: 'Unser Blueprint für mittelständische Unternehmen mit komplexen Legacy-Systemen.',
    category: 'Prozessautomation'
  },
  {
    title: 'Der Compliance-Leitfaden für KI-Einführungen 2025',
    excerpt: 'Regulatorische Anforderungen verstehen und sichere Governance-Strukturen schaffen.',
    category: 'Compliance'
  }
];

export function InsightsSection() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Insights</span>
          <h2 className="section-heading">Thought Leadership & AI-News</h2>
          <p className="section-subtitle">
            Bleiben Sie informiert: Trends, Best Practices und Branchenreports rund um KI, Automatisierung und Voice Interfaces.
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
              className="flex h-full flex-col rounded-3xl border border-navy/10 bg-white p-6 shadow-[0_30px_70px_-40px_rgba(10,25,47,0.35)]"
            >
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/80">{post.category}</div>
              <h3 className="mt-4 text-xl font-semibold text-navy">{post.title}</h3>
              <p className="mt-3 flex-1 text-sm text-slate-600">{post.excerpt}</p>
              <Link href="/insights" className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3rem] text-primary">
                Weiterlesen →
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
