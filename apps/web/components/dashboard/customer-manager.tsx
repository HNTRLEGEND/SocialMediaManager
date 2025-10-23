'use client';

// CustomerManager: Ermöglicht im Dashboard das Anlegen und Bearbeiten von Kund:innen.
// Alle Texte, Statusmeldungen und Fehlermeldungen sind deutsch lokalisiert.

import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';

// Vereinfachte Kundentypen für das Frontend-Handling
interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  projectType?: string | null;
  interest?: string | null;
}

export function CustomerManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  // State-Hooks für Kundenliste, Formulare und Rückmeldungen
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ status: string; projectType: string; interest: string }>({
    status: 'active',
    projectType: '',
    interest: ''
  });
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    projectType: '',
    interest: ''
  });

  const refresh = async () => {
    // Kundenliste nach Änderungen erneut laden
    const response = await fetch('/api/customers', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Kunden konnten nicht aktualisiert werden.');
    }
    const data = (await response.json()) as Customer[];
    setCustomers(data);
  };

  const resetNotifications = () => {
    // Hilfsfunktion um Statusanzeigen zurückzusetzen
    setError(null);
    setSuccess(null);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    // Anlageformular absenden und Lead im Backend erzeugen
    event.preventDefault();
    resetNotifications();
    setLoading(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'lead', source: 'portal' })
      });

      if (!response.ok) {
        // Fehlermeldung des Backends anzeigen
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? 'Kunde konnte nicht angelegt werden.');
      }

      await refresh();
      setForm({ name: '', company: '', email: '', projectType: '', interest: '' });
      setSuccess('Kunde erfolgreich angelegt.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (customer: Customer) => {
    // Ausgewählten Kunden in den Bearbeitungsmodus versetzen
    setEditingId(customer.id);
    setEditForm({
      status: customer.status,
      projectType: customer.projectType ?? '',
      interest: customer.interest ?? ''
    });
    resetNotifications();
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    // Update-Formular absenden
    event.preventDefault();
    if (!editingId) return;

    resetNotifications();
    setLoading(true);

    try {
      const response = await fetch(`/api/customers/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        // Fehlertexte weitergeben
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? 'Kunde konnte nicht aktualisiert werden.');
      }

      await refresh();
      setSuccess('Kunde gespeichert.');
      setEditingId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Neuen Kunden anlegen</h2>
        <p className="mt-1 text-xs text-slate-300">Schnell Leads erfassen und sie automatisch ins CRM übertragen.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Unternehmen
            <input
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
              required
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            E-Mail
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Projektfokus
            <input
              value={form.projectType}
              onChange={(event) => setForm((prev) => ({ ...prev, projectType: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="z. B. Support Automation"
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
          Interesse
          <input
            value={form.interest}
            onChange={(event) => setForm((prev) => ({ ...prev, interest: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            placeholder="Welche Lösung wird benötigt?"
          />
        </label>
        <Button type="submit" size="sm" variant="accent" className="mt-4" disabled={loading}>
          {loading ? 'Speichern…' : 'Kunde anlegen'}
        </Button>
      </form>

      {customers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          Noch keine Kunden angelegt.
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-3xl border border-white/10 bg-background/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{customer.name}</h3>
                  <p className="text-sm text-slate-300">{customer.company}</p>
                  <p className="text-xs text-slate-500">{customer.email}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>Status: {customer.status}</div>
                  <div>Interesse: {customer.interest ?? '–'}</div>
                </div>
              </div>
              {editingId === customer.id ? (
                <form onSubmit={handleUpdate} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Status
                    <input
                      value={editForm.status}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Projekt
                    <input
                      value={editForm.projectType}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, projectType: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    Interesse
                    <input
                      value={editForm.interest}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, interest: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
                    />
                  </label>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <Button type="submit" size="sm" variant="accent" disabled={loading}>
                      Speichern
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Abbrechen
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 px-3 py-1">{customer.projectType ?? 'Kein Projekt'}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">{customer.interest ?? 'Kein Interesse'}</span>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(customer)}>
                    Bearbeiten
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}
    </div>
  );
}
