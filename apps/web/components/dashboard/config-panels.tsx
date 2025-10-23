'use client';

import { FormEvent, useState } from 'react';
import { Button } from '../ui/button';

type ConfigType = 'n8n' | 'elevenlabs';

type ConfigPanelProps = {
  n8nConfig: Record<string, unknown>;
  elevenConfig: Record<string, unknown>;
};

function toInput<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null) {
    return fallback;
  }
  return value as T;
}

function ConfigForm({
  type,
  title,
  description,
  initialData
}: {
  type: ConfigType;
  title: string;
  description: string;
  initialData: Record<string, unknown>;
}) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formState, setFormState] = useState(() => {
    if (type === 'n8n') {
      return {
        baseUrl: toInput(initialData.baseUrl, ''),
        webhookUrl: toInput(initialData.webhookUrl, ''),
        tokens: Array.isArray(initialData.tokens) ? (initialData.tokens as string[]).join(', ') : '',
        automationCoverage: Number(toInput(initialData.automationCoverage, 0)),
        status: toInput(initialData.status, 'inactive')
      };
    }

    return {
      voiceId: toInput(initialData.voiceId, ''),
      stability: Number(toInput(initialData.stability, 0.5)),
      similarity: Number(toInput(initialData.similarity, 0.5)),
      style: toInput(initialData.style, 'balanced'),
      apiKey: toInput(initialData.apiKey, ''),
      language: toInput(initialData.language, 'de-DE')
    };
  });

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    setErrorMessage(null);

    const payload =
      type === 'n8n'
        ? {
            baseUrl: formState.baseUrl,
            webhookUrl: formState.webhookUrl,
            tokens: formState.tokens
              ? formState.tokens
                  .split(',')
                  .map((token: string) => token.trim())
                  .filter(Boolean)
              : [],
            automationCoverage: Number(formState.automationCoverage) || 0,
            status: formState.status
          }
        : {
            voiceId: formState.voiceId,
            stability: Number(formState.stability) || 0.5,
            similarity: Number(formState.similarity) || 0.5,
            style: formState.style,
            apiKey: formState.apiKey,
            language: formState.language
          };

    try {
      const response = await fetch('/api/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: payload })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? 'Update fehlgeschlagen');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-slate-300">{description}</p>
      </div>
      {type === 'n8n' ? (
        <>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Base URL
            <input
              value={formState.baseUrl as string}
              onChange={(event) => handleChange('baseUrl', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="https://n8n.yourdomain.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Webhook URL
            <input
              value={formState.webhookUrl as string}
              onChange={(event) => handleChange('webhookUrl', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="https://n8n.yourdomain.com/webhook/..."
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Tokens (kommasepariert)
            <input
              value={formState.tokens as string}
              onChange={(event) => handleChange('tokens', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="token-123, token-456"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Automation Coverage (%)
            <input
              value={formState.automationCoverage as number}
              onChange={(event) => handleChange('automationCoverage', event.target.value)}
              type="number"
              step="1"
              min="0"
              max="100"
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Status
            <input
              value={formState.status as string}
              onChange={(event) => handleChange('status', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="active / inactive"
            />
          </label>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Voice ID
            <input
              value={formState.voiceId as string}
              onChange={(event) => handleChange('voiceId', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="voice_abc123"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Stability
            <input
              value={formState.stability as number}
              onChange={(event) => handleChange('stability', event.target.value)}
              type="number"
              step="0.1"
              min="0"
              max="1"
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Similarity Boost
            <input
              value={formState.similarity as number}
              onChange={(event) => handleChange('similarity', event.target.value)}
              type="number"
              step="0.1"
              min="0"
              max="1"
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Stil
            <input
              value={formState.style as string}
              onChange={(event) => handleChange('style', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="balanced, conversational..."
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            API Key
            <input
              value={formState.apiKey as string}
              onChange={(event) => handleChange('apiKey', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="sk_live_..."
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Sprache
            <input
              value={formState.language as string}
              onChange={(event) => handleChange('language', event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="de-DE"
            />
          </label>
        </>
      )}
      <div className="mt-auto space-y-2 pt-2">
        <Button type="submit" size="sm" variant="accent" disabled={submitting}>
          {submitting ? 'Speichern…' : 'Konfiguration speichern'}
        </Button>
        {status === 'success' ? <p className="text-xs text-primary">Konfiguration aktualisiert.</p> : null}
        {status === 'error' && errorMessage ? <p className="text-xs text-red-400">{errorMessage}</p> : null}
      </div>
    </form>
  );
}

export function ConfigPanels({ n8nConfig, elevenConfig }: ConfigPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ConfigForm
        type="n8n"
        title="n8n Workflow Config"
        description="Webhook URLs, Tokens und Automationsgrad für Ihre Workflows."
        initialData={n8nConfig}
      />
      <ConfigForm
        type="elevenlabs"
        title="ElevenLabs Voice Agents"
        description="Standardstimme, Guardrails und API-Keys für Voice Agents."
        initialData={elevenConfig}
      />
    </div>
  );
}
