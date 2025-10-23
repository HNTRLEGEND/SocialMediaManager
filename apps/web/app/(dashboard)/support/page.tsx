import { Button } from '../../../components/ui/button';

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-white">Support</h1>
        <p className="mt-2 text-sm text-slate-300">Incident Logs, Retries und direkte Verbindung zu unserem 24/7 AI Ops Team.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Incident Feed</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="rounded-2xl border border-white/5 bg-background/60 p-4">
            04:12 – ElevenLabs Response Timeout – Retry erfolgreich nach 12 Sekunden.
            <Button variant="outline" size="sm" className="ml-4">
              Details
            </Button>
          </li>
          <li className="rounded-2xl border border-white/5 bg-background/60 p-4">
            02:51 – n8n Workflow Delay – Queue neu gestartet.
            <Button variant="outline" size="sm" className="ml-4">
              Retry
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}
