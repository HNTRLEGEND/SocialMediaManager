import { Button } from '../../../components/ui/button';

const tenants = [
  { name: 'Aperture Industries', usage: '4.982 calls', incidents: 1, featureFlags: ['beta_voice_router'] },
  { name: 'Wayne Logistics', usage: '2.318 calls', incidents: 0, featureFlags: ['lead_scoring'] },
  { name: 'NovaMed', usage: '6.442 calls', incidents: 2, featureFlags: ['voice_guardrails', 'sla_premium'] }
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Admin Cockpit</h1>
          <p className="mt-2 text-sm text-slate-300">Global Overview: Tenants, Usage, Incidents, Feature Flags.</p>
        </div>
        <Button variant="accent">Neuer Feature-Flag</Button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {tenants.map((tenant) => (
          <div key={tenant.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{tenant.name}</h2>
              <span className="text-xs text-primary">{tenant.usage}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Incidents: {tenant.incidents}</p>
            <div className="mt-4 text-xs text-slate-400">
              Feature Flags: {tenant.featureFlags.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
