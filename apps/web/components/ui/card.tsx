// Card-Komponenten: Wiederverwendbare Layout-Bausteine für Kacheln & Kennzahlen.
import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

// Basis-Karte mit Glas-Optik und Blur-Effekt
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden rounded-3xl border border-navy/10 bg-white/90 p-6 shadow-[0_20px_45px_-24px_rgba(10,25,47,0.35)] backdrop-blur-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

// Titelstil für Karten
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold text-navy', className)} {...props} />
);

// Beschreibungstext für Karten
const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('mt-3 text-sm text-slate-600', className)} {...props} />
);

// Highlight für Kennzahlen (Uppercase, Tracking)
const CardMetric = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('mt-6 inline-flex text-xs uppercase tracking-[0.3rem] text-primary', className)} {...props} />
);

export { Card, CardTitle, CardDescription, CardMetric };
