interface MetricsSummary {
  customers: number;
  totalCalls: number;
  totalVoiceMinutes: number;
  automationCoverage: number;
  csat: number;
  leadCount: number;
  activeWorkflows: number;
}

export function KpiGrid({ metrics }: { metrics: MetricsSummary }) {
  const items = [
    {
      label: 'Calls heute',
      value: metrics.totalCalls.toLocaleString('de-DE'),
      helper: `${metrics.activeWorkflows} aktive Workflows`
    },
    {
      label: 'Voice Minuten',
      value: metrics.totalVoiceMinutes.toLocaleString('de-DE'),
      helper: `${metrics.customers} Kunden`
    },
    {
      label: 'Automation Coverage',
      value: `${metrics.automationCoverage}%`,
      helper: `${metrics.leadCount} Leads in Pipeline`
    },
    {
      label: 'CSAT',
      value: metrics.csat.toFixed(2),
      helper: 'durchschnittliche Kundenzufriedenheit'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 via-white/0 to-primary/20 p-6 text-slate-100 shadow-card"
        >
          <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">{item.label}</div>
          <div className="mt-4 text-3xl font-semibold text-white">{item.value}</div>
          <div className="text-xs text-primary/80">{item.helper}</div>
        </div>
      ))}
    </div>
  );
}
