import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../lib/backend';

export async function GET() {
  const response = await fetch(`${getBackendBaseUrl()}/customers`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    return NextResponse.json(data ?? { message: 'Kunden konnten nicht geladen werden.' }, { status: response.status });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json(data ?? { message: 'Kunde konnte nicht erstellt werden.' }, { status: response.status });
  }

  return NextResponse.json(data, { status: 201 });
}
