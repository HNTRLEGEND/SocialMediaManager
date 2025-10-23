import { cn } from '../../lib/utils';

const kpis = [
  { label: 'Calls today', value: '1.284', delta: '+18%' },
  { label: 'Voice Minutes', value: '3.982', delta: '+9%' },
  { label: 'Automation Coverage', value: '64%', delta: '+7%' },
  { label: 'CSAT', value: '4.8', delta: '+0.2' }
];

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => (
        <div
          key={kpi.label}
          className={cn(
            'rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 via-white/0 to-primary/20 p-6 text-slate-100 shadow-card',
            index === 0 && 'shadow-glow'
          )}
        >
          <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">{kpi.label}</div>
          <div className="mt-4 text-3xl font-semibold text-white">{kpi.value}</div>
          <div className="text-xs text-primary">{kpi.delta}</div>
        </div>
      ))}
    </div>
  );
}
