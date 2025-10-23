'use client';

// ContactSection: Lead-Formular mit externem Mail-Service (FormSubmit),
// DSGVO-Hinweis und Social Proof Elementen.

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';

const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? 'https://formsubmit.co/ajax/hello@wies.ai';

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [interest, setInterest] = useState('Beratung & Strategie');
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!privacyAccepted) {
      setErrorMessage('Bitte stimmen Sie der Datenschutzerklärung zu.');
      setStatus('error');
      return;
    }

    setSubmitting(true);
    setStatus('idle');
    setErrorMessage(null);

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          company,
          interest,
          message,
          _subject: 'Neue Anfrage über wies.ai'
        })
      });

      if (!response.ok) {
        throw new Error('Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setCompany('');
      setInterest('Beratung & Strategie');
      setMessage('');
      setPrivacyAccepted(false);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="kontakt" className="bg-navy px-4 pb-24 pt-28 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">Kontakt</span>
          <h2 className="section-heading mt-4 text-white">Lassen Sie uns Ihre Automatisierung skizzieren</h2>
          <p className="mt-6 text-base text-slate-200">
            Teilen Sie uns Ihre Herausforderung mit – wir melden uns innerhalb von 24 Stunden mit Vorschlägen für den nächsten Schritt
            oder einer Demo.
          </p>
          <div className="mt-10 space-y-6 text-sm text-slate-200">
            <div>
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">Sales & Beratung</div>
              <a href="mailto:hello@wies.ai" className="text-lg font-semibold text-white">
                hello@wies.ai
              </a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">Office</div>
              <p className="text-lg text-white">München & Remote Europe</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">Follow</div>
              <div className="flex gap-4">
                {[
                  { href: 'https://www.linkedin.com/company/wies-ai', label: 'LinkedIn' },
                  { href: 'https://twitter.com/wies_ai', label: 'X / Twitter' },
                  { href: 'https://www.instagram.com', label: 'Instagram' }
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="text-white/80 transition hover:text-primary" target="_blank" rel="noreferrer">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="https://calendly.com/wies-ai/30min" target="_blank" rel="noopener noreferrer">
                Termin vereinbaren
              </Link>
            </Button>
          </div>
        </motion.div>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[32px] border border-white/15 bg-white/10 p-8 backdrop-blur-xl"
        >
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
              placeholder="Vor- und Nachname"
            />
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
              placeholder="you@company.de"
            />
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Unternehmen
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              required
              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
              placeholder="Unternehmensname"
            />
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Interesse
            <select
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
            >
              {[ 'Beratung & Strategie', 'Workflow Automation', 'AI Voice Agent' ].map((item) => (
                <option key={item} value={item} className="bg-navy text-white">
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Ihre Nachricht
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
              placeholder="Beschreiben Sie kurz Prozess, Ziel oder gewünschte Lösung"
            />
          </label>
          <div className="mt-6 flex flex-col gap-3">
            <label className="flex items-center gap-3 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                className="h-4 w-4 rounded border-white/30 bg-white/10"
              />
              Ich akzeptiere die{' '}
              <a href="/datenschutz" className="text-primary underline">
                Datenschutzerklärung
              </a>
            </label>
            <Button type="submit" size="lg" variant="accent" disabled={submitting}>
              {submitting ? 'Wird gesendet…' : 'Anfrage senden'}
            </Button>
            {status === 'success' ? (
              <p className="text-sm text-primary">
                Danke! Wir melden uns in Kürze mit einer individuellen Einschätzung.
              </p>
            ) : null}
            {status === 'error' && errorMessage ? (
              <p className="text-sm text-red-300">{errorMessage}</p>
            ) : null}
          </div>
        </motion.form>
      </div>
      <footer className="mx-auto mt-16 flex w-full max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-slate-300 sm:flex-row">
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
