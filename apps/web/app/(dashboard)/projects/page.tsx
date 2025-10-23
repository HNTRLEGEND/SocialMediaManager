import Link from 'next/link';
import { Button } from '../../../components/ui/button';

const projects = [
  {
    name: 'Customer Care Automation',
    description: 'Voice Concierge & Ticket-Triage mit Guardrails und CRM-Sync.',
    agents: 4,
    status: 'LIVE'
  },
  {
    name: 'Revenue Operations',
    description: 'Conversational Sales Agents inkl. Stripe Usage Tracking.',
    agents: 3,
    status: 'LIVE'
  },
  {
    name: 'Finance Automation',
    description: 'Backoffice-Workflows mit n8n & SAP S/4 Schnittstellen.',
    agents: 5,
    status: 'BUILD'
  }
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Projects</h1>
          <p className="mt-2 text-sm text-slate-300">Mandantenfähige Container für Agents, Workflows und Integrationen.</p>
        </div>
        <Button variant="accent">Neues Projekt</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <div key={project.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{project.name}</h2>
              <span className="rounded-full border border-primary/40 px-3 py-1 text-xs text-primary">{project.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{project.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{project.agents} Agents</span>
              <Link href={`/projects/${encodeURIComponent(project.name)}`} className="text-primary">
                Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
