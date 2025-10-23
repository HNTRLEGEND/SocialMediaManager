// API-Route: nimmt Formular-Leads entgegen und leitet sie an das Backend weiter.
import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../lib/backend';

export async function POST(request: NextRequest) {
  // Body des Formulars auslesen
  const payload = await request.json();
  const baseUrl = getBackendBaseUrl();
  // Proxy-Request an NestJS Backend senden
  const response = await fetch(`${baseUrl}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Fehler sauber an den Client weitergeben (z. B. Validierungsfehler)
    const status = response.status || 500;
    return NextResponse.json(data ?? { message: 'Lead konnte nicht erstellt werden.' }, { status });
  }

  return NextResponse.json(data, { status: 201 });
}
