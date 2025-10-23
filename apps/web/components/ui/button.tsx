// Button-Komponente: zentrale UI-Komponente für Buttons mit Tailwind Variants.
// Liefert konsistente Stile für Default, Outline, Ghost und Accent Buttons.
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

// Definition der visuellen Varianten und Größen via class-variance-authority
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-navy shadow-[0_20px_45px_-18px_rgba(0,216,255,0.55)] hover:bg-[#24ddff]',
        outline: 'border border-navy/15 bg-white/80 text-navy hover:border-primary hover:text-primary',
        ghost: 'text-navy hover:bg-primary/10 hover:text-primary',
        accent: 'bg-accent text-navy shadow-[0_20px_45px_-18px_rgba(255,138,0,0.55)] hover:bg-[#ffa033]'
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// ForwardRef, um die Komponente kompatibel mit Formularen und Radix Slots zu halten
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
