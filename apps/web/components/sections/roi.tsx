'use client';

// RoiSection: Interaktiver Rechner zur Visualisierung des finanziellen Nutzens.
// Besucher:innen können vier Kennzahlen anpassen und erhalten sofort die Einsparung.

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

// Ausgangswerte für den Rechner (realistische Default-Annahmen)
const baseline = {
  volume: 1200,
  avgHandleTime: 6,
  costPerHour: 55,
  automationRate: 0.45
};

export function RoiSection() {
  const [inputs, setInputs] = useState(baseline);

  // Berechnung der Kennzahlen erfolgt memoisiert, damit bei jeder Slider-Änderung
  // nur die relevanten Werte neu ermittelt werden.
  const result = useMemo(() => {
    const hours = (inputs.volume * inputs.avgHandleTime) / 60;
    const automatedHours = hours * inputs.automationRate;
    const savings = automatedHours * inputs.costPerHour;
    const roi = ((savings - 3500) / 3500) * 100; // 3500 € subscription baseline
    return {
      hours: Math.round(automatedHours),
      savings: Math.round(savings),
      roi: Math.round(roi)
    };
  }, [inputs]);

  return (
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="text-sm uppercase tracking-[0.45rem] text-primary">ROI-Rechner</span>
          <h2 className="section-heading mt-4 text-white">Berechnen Sie Ihr 10x-Potenzial</h2>
          <p className="section-subtitle mt-4">
            Spielen Sie Szenarien durch und erhalten Sie ein PDF mit allen Kennzahlen. Unser Team sendet Ihnen individuelle Benchmarks
            innerhalb von 24 Stunden.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[{ label: 'Monatliche Anfragen', key: 'volume', min: 100, max: 5000, step: 100 },
            { label: 'Ø Bearbeitungszeit (Minuten)', key: 'avgHandleTime', min: 1, max: 15, step: 1 },
            { label: 'Kosten je Stunde (€)', key: 'costPerHour', min: 20, max: 120, step: 5 },
            { label: 'Automationsrate', key: 'automationRate', min: 0.1, max: 0.95, step: 0.05 }].map((field) => (
              <label key={field.key} className="flex flex-col gap-3 text-sm text-slate-200">
                {/* Slider zum Einstellen der Geschäftskennzahl */}
                {field.label}
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={inputs[field.key as keyof typeof baseline] as number}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      [field.key]: Number(event.target.value)
                    }))
                  }
                />
                <div className="text-xs text-primary">
                  {field.key === 'automationRate'
                    ? `${Math.round((inputs.automationRate ?? 0) * 100)}%`
                    : inputs[field.key as keyof typeof baseline]}
                </div>
              </label>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glow-border rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="text-xs uppercase tracking-[0.4rem] text-primary/70">Ihre Ergebnisse</div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[{ label: 'Automatisierte Stunden', value: `${result.hours} h` },
            { label: 'Einsparung / Monat', value: `${result.savings.toLocaleString('de-DE')} €` },
            { label: 'ROI (nach Kosten)', value: `${result.roi}%` }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-background/70 p-5">
                <div className="text-xs uppercase tracking-[0.3rem] text-primary/60">{item.label}</div>
                <div className="mt-3 text-2xl font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-300">
            Sie erhalten automatisch eine E-Mail mit detailliertem Report inklusive Implementierungsvorschlag, Guardrails und Templates.
          </p>
          <Button className="mt-6 w-full" variant="accent">
            ROI-Report anfordern
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
