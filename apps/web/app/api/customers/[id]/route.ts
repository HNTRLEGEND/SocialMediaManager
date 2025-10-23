// API-Route: aktualisiert bestehende Kund:innen per Proxy-Aufruf.
import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../../lib/backend';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Body und Pfad-Parameter kombinieren
  const payload = await request.json();
  const response = await fetch(`${getBackendBaseUrl()}/customers/${params.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Fehlermeldung an Frontend zurückgeben
    return NextResponse.json(data ?? { message: 'Kunde konnte nicht aktualisiert werden.' }, { status: response.status });
  }

  return NextResponse.json(data);
}
