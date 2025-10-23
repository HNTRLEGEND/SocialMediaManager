// AgentsPage: Übersicht über konfigurierte Voice Agents.
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

// Beispielagenten zur Demonstration der UI
const agents = [
  {
    id: 'voice-concierge',
    name: 'Voice Concierge',
    persona: 'Warm, hilfsbereit, 4 Sprachen',
    voice: 'ElevenLabs – WiesPulse',
    guardrails: ['PII Masking', 'Max 2 min Gespräch', 'Fallback → Human'],
    status: 'LIVE'
  },
  {
    id: 'sales-navigator',
    name: 'Sales Navigator',
    persona: 'Berater, ROI-orientiert',
    voice: 'ElevenLabs – Gradient',
    guardrails: ['CRM Logging', 'No Pricing', 'Handover to SDR'],
    status: 'LIVE'
  }
];

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Agents</h1>
          <p className="mt-2 text-sm text-slate-300">Konfigurieren Sie Voice, Chat und Backoffice Agents granular.</p>
        </div>
        <Button variant="accent">Agent erstellen</Button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                <p className="text-xs uppercase tracking-[0.3rem] text-primary/60">{agent.status}</p>
              </div>
              <Link href={`/agents/${agent.id}`} className="text-xs text-primary">
                Editieren →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-300 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2rem] text-primary/70">Persona</div>
                <p>{agent.persona}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2rem] text-primary/70">Voice</div>
                <p>{agent.voice}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2rem] text-primary/70">Guardrails</div>
                <p>{agent.guardrails.join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
