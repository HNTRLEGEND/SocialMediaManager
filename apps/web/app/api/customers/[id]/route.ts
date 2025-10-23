import { NextRequest, NextResponse } from 'next/server';
import { getBackendBaseUrl } from '../../../../lib/backend';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    return NextResponse.json(data ?? { message: 'Kunde konnte nicht aktualisiert werden.' }, { status: response.status });
  }

  return NextResponse.json(data);
}
