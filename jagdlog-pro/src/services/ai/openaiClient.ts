const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export interface VoiceExtractionResult {
  typ?: 'beobachtung' | 'abschuss' | 'sonstiges';
  revier?: string;
  jagdart?: 'ansitz' | 'pirsch' | 'drueckjagd' | 'einzeljagd';
  wildart?: string;
  anzahl?: number;
  notizen?: string;
  geschlecht?: 'männlich' | 'weiblich';
  altersklasse?: string;
  gewicht?: number;
  schussentfernung?: number;
}

function getApiKey() {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key fehlt');
  }
  return apiKey;
}

export async function transcribeAudioAsync(audioUri: string) {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      name: 'voice.m4a',
      type: 'audio/m4a',
    } as unknown as Blob);
    formData.append('model', 'gpt-4o-mini-transcribe');
    formData.append('language', 'de');

    const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transkription fehlgeschlagen');
    }

    const data = await response.json();
    return data.text as string;
  } catch (error) {
    console.warn('OpenAI Transcription Fehler', error);
    return null;
  }
}

export async function extractEntryFromTranscript(transcript: string) {
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content:
              'Extrahiere strukturierte Jagddaten aus dem Transcript. Antworte ausschließlich als JSON mit Feldern: typ, revier, jagdart, wildart, anzahl, notizen, geschlecht, altersklasse, gewicht, schussentfernung.',
          },
          { role: 'user', content: transcript },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI Strukturierung fehlgeschlagen');
    }

    const data = await response.json();
    const output = data.output?.[0]?.content?.[0]?.text;
    if (!output) {
      return null;
    }
    return JSON.parse(output) as VoiceExtractionResult;
  } catch (error) {
    console.warn('OpenAI Extract Fehler', error);
    return null;
  }
}

export async function getAssistantReply(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content:
              'Du bist der KI-Begleiter für Berufsjäger. Antworte kurz, praxisnah, sicherheitsbewusst und immer im Kontext Jagdpraxis.',
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI Antwort fehlgeschlagen');
    }

    const data = await response.json();
    const output = data.output?.[0]?.content?.[0]?.text;
    return output ?? 'Keine Antwort erhalten.';
  } catch (error) {
    console.warn('OpenAI Assistant Fehler', error);
    return 'Der KI-Begleiter ist gerade nicht erreichbar.';
  }
}
