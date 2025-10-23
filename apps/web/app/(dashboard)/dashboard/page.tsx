import { ActivityStream, AgentTable, KpiGrid } from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-white">Organisations-Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">
          Kennzahlen, Guardrails und Live-Telemetrie für alle AI Agents Ihrer Organisation.
        </p>
      </div>
      <KpiGrid />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AgentTable />
        <ActivityStream />
      </div>
    </div>
  );
}
