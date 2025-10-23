import { Button } from '@/components/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-300">Teamverwaltung, API Keys, Webhook Targets & Security Policies.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Team</h2>
          <p className="mt-2 text-sm text-slate-300">Owner, Admins, Member, Viewer – verwalten Sie Zugänge und Rollen.</p>
          <Button className="mt-4" variant="accent">
            Teammitglied einladen
          </Button>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">API Keys</h2>
          <p className="mt-2 text-sm text-slate-300">Erstellen Sie Tenant-spezifische Schlüssel mit Rate Limits & Berechtigungen.</p>
          <Button className="mt-4" variant="outline">
            Neuer Key
          </Button>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Webhooks</h2>
          <p className="mt-2 text-sm text-slate-300">Call Started, Call Ended, Transcript Ready – konfigurieren Sie Targets.</p>
          <Button className="mt-4" variant="outline">
            Webhook hinzufügen
          </Button>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Security</h2>
          <p className="mt-2 text-sm text-slate-300">Row-Level Security, Field Encryption und Audit Logs steuern.</p>
          <Button className="mt-4" variant="outline">
            Richtlinie anpassen
          </Button>
        </div>
      </div>
    </div>
  );
}
