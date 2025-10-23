'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  'Wie starte ich eine KI-Potenzialanalyse?',
  'Zeig mir ein Voice-Agent Beispiel.',
  'Welche Ergebnisse kann ich nach 90 Tagen erwarten?'
];

export function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [activePrompt, setActivePrompt] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPromptVisible(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!promptVisible) return;

    const prompt = SUGGESTED_PROMPTS[Math.floor(Math.random() * SUGGESTED_PROMPTS.length)];
    setActivePrompt(prompt);
  }, [promptVisible]);

  const conversation = useMemo(
    () => [
      {
        author: 'HNTR',
        text:
          'Hi, ich bin dein WIES.AI Assistent. Ich analysiere Prozesse, Voice Use Cases und ROI Potentiale für dich. Womit kann ich helfen?'
      },
      {
        author: 'Du',
        text: 'Ich möchte wissen, wie Voice Agents meine Hotline entlasten.'
      },
      {
        author: 'HNTR',
        text:
          'Wir automatisieren die Vorqualifizierung, Authentifizierung und Ticket-Erstellung. Im Schnitt sinken Wartezeiten um 80 %. Soll ich dir eine Potenzialanalyse zuschicken?'
      }
    ],
    []
  );

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {!open && promptVisible ? (
        <div className="pointer-events-auto mb-2 max-w-xs rounded-3xl border border-primary/40 bg-background/90 px-4 py-3 text-sm text-slate-200 shadow-glow">
          <span className="block text-xs uppercase tracking-[0.35rem] text-primary">HNTR</span>
          <p className="mt-1 text-white/90">{activePrompt}</p>
        </div>
      ) : null}
      {open ? (
        <div className="pointer-events-auto w-[320px] rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35rem] text-primary/80">HNTR AI</p>
              <p className="text-sm text-white/90">Dein KI-Automationsberater</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-200 hover:text-primary"
            >
              schließen
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-2xl border border-white/10 bg-background/70 px-4 py-3',
                  message.author === 'HNTR' ? 'border-primary/30' : 'border-white/10'
                )}
              >
                <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">{message.author}</div>
                <p className="mt-1 text-white/90">{message.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-xs uppercase tracking-[0.3rem] text-primary/70" htmlFor="assistant-message">
              Deine Nachricht
            </label>
            <textarea
              id="assistant-message"
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-background/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              placeholder="Beschreibe kurz deinen Prozess oder dein Ziel."
            />
            <Button className="w-full" variant="accent">
              Analyse anfordern
            </Button>
          </div>
        </div>
      ) : null}
      <Button
        className="pointer-events-auto"
        size="icon"
        variant="accent"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
      >
        AI
      </Button>
    </div>
  );
}
