'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

export function FloatingActionCenter() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => {
      if (window.scrollY > 480) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 px-4">
      <div className="pointer-events-auto flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-background/95 px-6 py-4 text-sm text-slate-200 shadow-glow backdrop-blur-lg md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.35rem] text-primary/80">Bereit für 10x Wachstum?</p>
          <p className="mt-1 text-sm text-white/80">
            Sichere dir eine kostenlose Potenzialanalyse oder fordere das ROI-Canvas über unser Team an.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <Button variant="accent" asChild>
            <Link href="#kontakt">Potenzialanalyse buchen</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="mailto:hello@wieslogic.de?subject=ROI%20Canvas%20anfordern">
              ROI Canvas erhalten
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
