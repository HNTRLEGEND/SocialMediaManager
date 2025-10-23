// API-Route: holt Konfigurationen (n8n oder ElevenLabs) aus dem Backend.
import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../../lib/backend';

const allowed = ['n8n', 'elevenlabs'];

export async function GET(_request: NextRequest, { params }: { params: { type: string } }) {
  const { type } = params;

  if (!allowed.includes(type)) {
    // Sicherheit: nur whitelisted Konfigurations-Typen zulassen
    return NextResponse.json({ message: 'Konfiguration nicht gefunden.' }, { status: 404 });
  }

  // Proxy-Request an NestJS Backend
  const response = await fetch(`${getBackendBaseUrl()}/config/${type}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(data ?? { message: 'Konfiguration konnte nicht geladen werden.' }, { status: response.status });
  }

  return NextResponse.json(data);
}
