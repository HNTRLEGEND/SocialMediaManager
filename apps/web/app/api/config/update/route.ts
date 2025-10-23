import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../../lib/backend';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const response = await fetch(`${getBackendBaseUrl()}/config/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(data ?? { message: 'Konfiguration konnte nicht gespeichert werden.' }, { status: response.status });
  }

  return NextResponse.json(data);
}
