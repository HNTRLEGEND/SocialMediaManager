import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(_request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const push = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      push({ type: 'welcome', message: 'Realtime telemetry active' });
      push({ type: 'calls', value: 38, timestamp: Date.now() });
      push({ type: 'uptime', value: 99.98, timestamp: Date.now() });

      const interval = setInterval(() => {
        push({ type: 'calls', value: Math.floor(35 + Math.random() * 10), timestamp: Date.now() });
      }, 3000);

      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 15000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
