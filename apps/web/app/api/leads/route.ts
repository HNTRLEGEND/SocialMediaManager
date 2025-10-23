import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../lib/backend';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const baseUrl = getBackendBaseUrl();
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
    const status = response.status || 500;
    return NextResponse.json(data ?? { message: 'Lead konnte nicht erstellt werden.' }, { status });
  }

  return NextResponse.json(data, { status: 201 });
}
