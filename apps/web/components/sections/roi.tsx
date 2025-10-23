'use client';

// RoiSection: Visualisiert das Einsparpotenzial anhand von Teamgröße und Prozesskosten.
// Die Light-Version orientiert sich am Briefing und zeigt direkt verständliche Kennzahlen.

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

const defaults = {
  teamSize: 40,
  monthlyCost: 12000
};

export function RoiSection() {
  const [teamSize, setTeamSize] = useState(defaults.teamSize);
  const [monthlyCost, setMonthlyCost] = useState(defaults.monthlyCost);

  const result = useMemo(() => {
    const automationRate = 0.6;
    const efficiencyGain = 0.4;

    const yearlySavings = Math.round(monthlyCost * automationRate * 12);
    const freedHours = Math.round(teamSize * 160 * efficiencyGain);
    const implementationCost = Math.max(24000, monthlyCost * 4);
    const roi = Math.round((yearlySavings / implementationCost) * 100);

    return {
      yearlySavings,
      freedHours,
      roi
    };
  }, [monthlyCost, teamSize]);

  const handleMailClick = () => {
    const subject = encodeURIComponent('ROI-Ergebnis für Automatisierung');
    const body = encodeURIComponent(
      `Teamgröße: ${teamSize} Personen\nMonatliche Prozesskosten: € ${monthlyCost.toLocaleString('de-DE')}\nJährliche Einsparung: € ${result.yearlySavings.toLocaleString('de-DE')}\nFreigesetzte Stunden: ${result.freedHours.toLocaleString('de-DE')}\nErwarteter ROI: ${result.roi}%`
    );

    window.location.href = `mailto:hello@wies.ai?subject=${subject}&body=${body}`;
  };

  return (
    <section className="px-4 py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">ROI-Kalkulator</span>
          <h2 className="section-heading mt-4">Berechnen Sie Ihren Automatisierungs-Impact</h2>
          <p className="section-subtitle mt-4">
            Wählen Sie Teamgröße und Prozesskosten – wir zeigen, wie viel Budget und Zeit KI-Lösungen freisetzen können.
          </p>
          <div className="mt-10 space-y-6">
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              <span>Teamgröße</span>
              <input
                type="range"
                min={5}
                max={200}
                value={teamSize}
                onChange={(event) => setTeamSize(Number(event.target.value))}
                className="accent-primary"
              />
              <span className="text-xs uppercase tracking-[0.3rem] text-primary/80">{teamSize} Mitarbeitende</span>
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              <span>Durchschnittliche Prozesskosten pro Monat</span>
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={monthlyCost}
                onChange={(event) => setMonthlyCost(Number(event.target.value))}
                className="accent-primary"
              />
              <span className="text-xs uppercase tracking-[0.3rem] text-primary/80">€ {monthlyCost.toLocaleString('de-DE')}</span>
            </label>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[32px] border border-navy/10 bg-white p-10 shadow-[0_60px_140px_-50px_rgba(10,25,47,0.45)]"
        >
          <div className="text-xs uppercase tracking-[0.4rem] text-primary/80">Ihr Potenzial</div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[{ label: 'Jährliche Einsparung', value: `€ ${result.yearlySavings.toLocaleString('de-DE')}` },
            { label: 'Freigesetzte Stunden', value: result.freedHours.toLocaleString('de-DE') },
            { label: 'Erwarteter ROI', value: `${result.roi}%` }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-navy/10 bg-slate-100 p-5">
                <div className="text-xs uppercase tracking-[0.3rem] text-primary/80">{item.label}</div>
                <div className="mt-3 text-2xl font-semibold text-navy">{item.value}</div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-600">
            Wir senden Ihnen auf Wunsch einen detaillierten Report inklusive Quick Wins, Budgetindikatoren und Umsetzungshorizont.
          </p>
          <Button className="mt-8 w-full" variant="accent" onClick={handleMailClick}>
            Ergebnis per E-Mail erhalten
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
