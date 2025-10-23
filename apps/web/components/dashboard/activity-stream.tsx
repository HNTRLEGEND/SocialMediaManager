'use client';

import { useRealtimeTelemetry } from '../../lib/use-realtime';

const baseActivities = [
  {
    time: 'Gerade eben',
    message: 'Voice Concierge hat 12 Kunden authentifiziert – Guardrail "PII maskieren" ausgelöst.'
  },
  {
    time: 'vor 6 Minuten',
    message: 'Stripe Billing: Usage Threshold erreicht – zusätzlicher Seat aktiviert.'
  },
  {
    time: 'vor 14 Minuten',
    message: 'n8n Workflow "Invoice Automator" schlug fehl – Retry über BullMQ gestartet.'
  }
];

export function ActivityStream() {
  const events = useRealtimeTelemetry();

  return (
    <div className="rounded-3xl border border-white/5 bg-background/60 p-6">
      <h3 className="text-lg font-semibold text-white">Live Events</h3>
      <ul className="mt-5 space-y-4 text-sm text-slate-300">
        {[...events.slice().reverse(), ...baseActivities].map((activity, index) => (
          <li key={index} className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">
              {'timestamp' in activity && activity.timestamp
                ? new Date(activity.timestamp).toLocaleTimeString('de-DE')
                : activity.time ?? 'Event'}
            </div>
            <p className="mt-2 text-white/80">
              {'message' in activity && activity.message ? activity.message : `${activity.type ?? 'Event'}: ${activity.value}`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
