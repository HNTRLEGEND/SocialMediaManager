// BillingPage: Darstellung der Preispläne und Export-Aktion.
import { Button } from '../../../components/ui/button';

// Beispielpläne – dienen als Gesprächsgrundlage für Kund:innen
const plans = [
  {
    name: 'Growth',
    price: '€3.500/Monat + Usage',
    features: ['10 Seats inklusive', 'Voice Minutes: €0.09', 'AI Runs: €0.003', 'n8n Workflows included']
  },
  {
    name: 'Scale',
    price: 'Custom',
    features: ['Unbegrenzte Seats', 'Dedicated Support', 'SLA 99.99%', 'Enterprise Guardrails']
  }
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Billing</h1>
          <p className="mt-2 text-sm text-slate-300">Stripe Subscriptions, Seats & Usage-based Billing im Überblick.</p>
        </div>
        <Button variant="accent">Rechnung exportieren</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">Plan</div>
            <h2 className="mt-3 text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-2 text-sm text-slate-300">{plan.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
