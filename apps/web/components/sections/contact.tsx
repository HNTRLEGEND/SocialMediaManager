'use client';

// ContactSection: Formularkomponente für das Lead-Capture. Enthält State-Management,
// DSGVO-Hinweise und den API-Call zum Backend. Alle Texte sind bewusst deutschsprachig gehalten.

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';

export function ContactSection() {
  const [name, setName] = useState('');
  // State-Verwaltung für alle Pflichtfelder des Formulars
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [interest, setInterest] = useState('KI-Potenzialanalyse');
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Submit-Handler: validiert die Zustimmung zur Datenschutzerklärung
    // und sendet anschließend den Lead an die API.
    event.preventDefault();
    if (!privacyAccepted) {
      setErrorMessage('Bitte stimmen Sie der Datenschutzerklärung zu.');
      setStatus('error');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setStatus('idle');

    try {
      // POST-Request an die Next.js API-Route, die den Lead im Backend speichert
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          company,
          interest,
          notes: message,
          status: 'lead',
          source: 'website'
        })
      });

      if (!response.ok) {
        // Fehlerfälle detailliert auslesen, um Nutzer:innen Feedback zu geben
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? 'Lead konnte nicht gespeichert werden.');
      }

      // Erfolgsfall: Formular zurücksetzen und Status anpassen
      setStatus('success');
      setName('');
      setEmail('');
      setCompany('');
      setInterest('KI-Potenzialanalyse');
      setMessage('');
      setPrivacyAccepted(false);
    } catch (error) {
      // Fehlermeldung anzeigen, falls der Request scheitert
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setSubmitting(false);
    }
  };

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
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glow-border rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
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
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="you@company.com"
            />
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Unternehmen
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="Ihre Firma"
            />
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Interesse
            <select
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            >
              {[
                'KI-Potenzialanalyse',
                'KI-Prozessautomation',
                'AI Voice Agents',
                'Beratung & Strategie'
              ].map((item) => (
                <option key={item} value={item} className="bg-background text-slate-900">
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
            Beschreiben Sie Ihr Projekt (optional)
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="Welche Prozesse sollen automatisiert werden?"
            />
          </label>
          <div className="mt-6 flex flex-col gap-3">
            <label className="flex items-center gap-3 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-background/80"
              />{' '}
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
                Danke! Wir melden uns mit einer individuellen Einschätzung Ihres Automatisierungspotenzials.
              </p>
            ) : null}
            {status === 'error' && errorMessage ? (
              <p className="text-sm text-red-400">{errorMessage}</p>
            ) : null}
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
