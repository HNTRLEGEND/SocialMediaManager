'use client';

import { useEffect, useState } from 'react';

interface TelemetryEvent {
  type: string;
  value?: number;
  message?: string;
  timestamp?: number;
}

export function useRealtimeTelemetry() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    const source = new EventSource('/api/realtime');
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TelemetryEvent;
        setEvents((prev) => [...prev.slice(-20), data]);
      } catch (error) {
        console.error('Failed to parse event', error);
      }
    };
    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);

  return events;
}
