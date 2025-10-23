// AgentDetailPage: Detailansicht für einzelne Voice Agents.
import { notFound } from 'next/navigation';
import { Button } from '../../../../components/ui/button';

// Hardcodierte Beispielkonfigurationen – können später via Backend geladen werden
const agents = {
  'voice-concierge': {
    name: 'Voice Concierge',
    tabs: {
      General: {
        description:
          'Voice Concierge beantwortet Serviceanfragen, authentifiziert Kunden per VoicePIN und erstellt Tickets in Zendesk.',
        fields: [
          { label: 'System Prompt', value: 'Du bist Voice Concierge von WIES.AI. Begrüße freundlich, validiere Kundendaten.' },
          { label: 'Tools', value: 'Zendesk API, CRM Lookup, Knowledge Base' },
          { label: 'Webhook', value: 'https://api.wieslogic.de/webhooks/agents/voice-concierge' }
        ]
      },
      Voice: {
        description: 'ElevenLabs Voice Preset mit hoher Stabilität, 0.6 Similarity, 0.35 Style.',
        fields: [
          { label: 'voice_id', value: 'elevenlabs_wiespulse' },
          { label: 'Stability', value: '0.65' },
          { label: 'Similarity', value: '0.72' }
        ]
      },
      Guardrails: {
        description: 'Definierte Policies für Datenschutz, Gesprächsdauer und Weiterleitung an menschliche Agenten.',
        fields: [
          { label: 'PII Filter', value: 'Enabled' },
          { label: 'Max Duration', value: '120 Sekunden' },
          { label: 'Escalation', value: 'SLA 30 Sekunden zu Human' }
        ]
      },
      Routing: {
        description: 'Skill-based Routing basierend auf Anliegen, Sprache und Sentiment.'
      },
      Tools: {
        description: 'n8n Workflows, Wissensgraph und ERP Connectoren.'
      }
    }
  }
};

type AgentKey = keyof typeof agents;

export default function AgentDetailPage({ params }: { params: { id: AgentKey } }) {
  const agent = agents[params.id];
  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">{agent.name}</h1>
          <p className="mt-2 text-sm text-slate-300">Konfiguration, Guardrails und Routing-Kontrollen.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Test Call</Button>
          <Button variant="accent">Deploy</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Object.entries(agent.tabs).map(([tab, config]) => (
          <div key={tab} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">{tab}</h2>
            {'description' in config && config.description ? (
              <p className="mt-3 text-sm text-slate-300">{config.description}</p>
            ) : null}
            {'fields' in config && config.fields ? (
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {config.fields.map((field) => (
                  <div key={field.label} className="rounded-2xl border border-white/5 bg-background/60 p-4">
                    <div className="text-xs uppercase tracking-[0.2rem] text-primary/70">{field.label}</div>
                    <div className="mt-2 text-white/90">{field.value}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
