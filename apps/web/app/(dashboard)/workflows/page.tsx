// WorkflowsPage: Übersicht über automatisierte n8n-Pipelines.
import { Button } from '../../../components/ui/button';

// Mock-Daten für Workflows – dienen als visuelle Platzhalter
const workflows = [
  {
    name: 'Ticket Sync',
    nodes: 12,
    description: 'Erstellt strukturierte Tickets aus Voice Transkripten, inklusive KPI Logging.',
    status: 'LIVE'
  },
  {
    name: 'Invoice Guard',
    nodes: 18,
    description: 'Validiert Rechnungen, ruft ERP APIs auf und löst bei Fehlern Guardrails aus.',
    status: 'LIVE'
  }
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Workflows</h1>
          <p className="mt-2 text-sm text-slate-300">Visual Builder mit n8n-ähnlicher Experience für Ihre Automationsketten.</p>
        </div>
        <Button variant="accent">Workflow erstellen</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {workflows.map((workflow) => (
          <div key={workflow.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{workflow.name}</h2>
              <span className="rounded-full border border-primary/40 px-3 py-1 text-xs text-primary">{workflow.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{workflow.description}</p>
            <div className="mt-4 text-xs text-slate-400">{workflow.nodes} Nodes</div>
          </div>
        ))}
      </div>
    </div>
  );
}
