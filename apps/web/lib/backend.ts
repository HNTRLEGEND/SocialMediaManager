// Hilfsfunktionen für API-Aufrufe aus dem Frontend.

export function getBackendBaseUrl() {
  // Serverseitig greifen wir auf die .env Variablen zu, clientseitig auf NEXT_PUBLIC
  if (typeof window === 'undefined') {
    return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';
  }

  return process.env.NEXT_PUBLIC_API_URL ?? '';
}

export async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Normalisierung des Pfads, sodass sowohl '/foo' als auch 'foo' funktionieren
  const baseUrl = getBackendBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;

  // Standard-Header ergänzen und Request ausführen
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    // Fehlertexte weiterreichen, damit der Aufrufer differenziert reagieren kann
    const message = await response.text();
    throw new Error(message || `Request to ${normalizedPath} failed`);
  }

  return response.json() as Promise<T>;
}
