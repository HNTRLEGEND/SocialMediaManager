// CustomerTable: Zeigt Kundendaten in Tabellenform für schnelle Übersicht.

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  projectType?: string | null;
  interest?: string | null;
  workflowStatus: string;
  callCount: number;
  voiceMinutes: number;
  automationCoverage: number;
  csat: number;
  lastActivity?: string | null;
  createdAt: string;
}

const formatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

function formatDate(value?: string | null) {
  // Datum sicher formatieren; ungültige Werte werden abgefangen
  if (!value) return '–';
  try {
    return formatter.format(new Date(value));
  } catch {
    return '–';
  }
}

export function CustomerTable({ customers }: { customers: Customer[] }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Kunden & Leads</h3>
        <span className="text-xs text-primary/80">{customers.length} Einträge</span>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="text-xs uppercase tracking-[0.25rem] text-primary/70">
            <tr>
              <th className="pb-3">Kunde</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Projekt</th>
              <th className="pb-3">Interesse</th>
              <th className="pb-3 text-right">Calls</th>
              <th className="pb-3 text-right">Voice Min.</th>
              <th className="pb-3 text-right">Automation %</th>
              <th className="pb-3">Letzte Aktivität</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((customer) => (
              <tr key={customer.id} className="transition hover:bg-white/5">
                <td className="py-4">
                  <div className="font-medium text-white">{customer.name}</div>
                  <div className="text-xs text-slate-400">{customer.company}</div>
                  <div className="text-xs text-slate-500">{customer.email}</div>
                </td>
                <td className="py-4">
                  <span className="rounded-full border border-primary/40 px-3 py-1 text-xs text-primary capitalize">
                    {customer.status}
                  </span>
                  <div className="mt-1 text-xs text-slate-400">{customer.workflowStatus}</div>
                </td>
                <td className="py-4 text-sm text-slate-200">{customer.projectType ?? '–'}</td>
                <td className="py-4 text-sm text-slate-200">{customer.interest ?? '–'}</td>
                <td className="py-4 text-right text-white/90">{customer.callCount}</td>
                <td className="py-4 text-right text-white/80">{customer.voiceMinutes}</td>
                <td className="py-4 text-right text-white/80">{customer.automationCoverage}%</td>
                <td className="py-4 text-sm text-slate-200">{formatDate(customer.lastActivity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
