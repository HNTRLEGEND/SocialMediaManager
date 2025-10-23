// API-Route: holt Kundenliste und erstellt neue Kund:innen.
import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../lib/backend';

export async function GET() {
  // Kundenliste vom Backend abrufen
  const response = await fetch(`${getBackendBaseUrl()}/customers`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    // Backend-Fehler durchreichen (z. B. Validierung)
    return NextResponse.json(data ?? { message: 'Kunden konnten nicht geladen werden.' }, { status: response.status });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // Eingehenden Body lesen
  const payload = await request.json();
  const response = await fetch(`${getBackendBaseUrl()}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Fehlerantwort zurück an den Client
    return NextResponse.json(data ?? { message: 'Kunde konnte nicht erstellt werden.' }, { status: response.status });
  }

  return NextResponse.json(data, { status: 201 });
}
