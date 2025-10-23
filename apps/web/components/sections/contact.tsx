'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../ui/button';

export function ContactSection() {
  return (
    <section id="kontakt" className="bg-background/80 px-4 pb-20 pt-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Kontakt</span>
          <h2 className="section-heading mt-4 text-white">Kostenlose Potenzialanalyse sichern</h2>
          <p className="mt-6 text-base text-slate-200">
            Erzählen Sie uns von Ihren Prozessen, Voice-Use-Cases oder Automationsideen. Wir melden uns innerhalb von 24 Stunden mit
            konkreten Next Steps.
          </p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <div>
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">Kontakt</div>
              <a href="mailto:hello@wieslogic.de" className="text-lg text-white">
                hello@wieslogic.de
              </a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">Social</div>
              <div className="flex gap-4">
                {[
                  { href: 'https://www.linkedin.com', label: 'LinkedIn' },
                  { href: 'https://www.youtube.com', label: 'YouTube' },
                  { href: 'https://www.twitter.com', label: 'X/Twitter' }
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="text-white/80 transition hover:text-primary">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="https://cal.com" target="_blank" rel="noopener noreferrer">
                Termin vereinbaren
              </Link>
            </Button>
          </div>
        </motion.div>
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glow-border rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Vorname
              <input className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none" placeholder="Max" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Nachname
              <input className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none" placeholder="Mustermann" />
            </label>
          </div>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            E-Mail
            <input type="email" className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none" placeholder="you@company.com" />
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Unternehmen
            <input className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none" placeholder="WIES.AI" />
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Wie können wir helfen?
            <textarea rows={4} className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none" placeholder="Beschreiben Sie Prozesse, Use Cases oder Ziele." />
          </label>
          <div className="mt-6 flex flex-col gap-3">
            <label className="flex items-center gap-3 text-xs text-slate-300">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-background/80" /> Ich akzeptiere die{' '}
              <a href="/impressum" className="text-primary underline">
                Datenschutzerklärung
              </a>
            </label>
            <Button type="submit" size="lg" variant="accent">
              Senden
            </Button>
          </div>
        </motion.form>
      </div>
      <footer className="mx-auto mt-16 flex w-full max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-slate-400 sm:flex-row">
        <span>© {new Date().getFullYear()} WIES.AI – KI Prozessautomation & Beratung</span>
        <div className="flex gap-4">
          <Link href="/impressum" className="hover:text-primary">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-primary">
            Datenschutz
          </Link>
          <Link href="/agb" className="hover:text-primary">
            AGB
          </Link>
        </div>
      </footer>
    </section>
  );
}
