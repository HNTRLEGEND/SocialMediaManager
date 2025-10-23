'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const links = [
  { href: '#leistungen', label: 'Leistungen' },
  { href: '#workflow', label: 'Ablauf' },
  { href: '#mission', label: 'Mission' },
  { href: '#cases', label: 'Case Studies' },
  { href: '#kontakt', label: 'Kontakt' }
];

export function MainNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center space-x-2 text-xl font-display">
          <span className="text-primary">WIES</span>
          <span className="text-white">LOGIC</span>
        </Link>
        <nav className="hidden items-center space-x-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-200 transition hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center space-x-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link href="#kontakt">Kostenlose Potenzialanalyse</Link>
          </Button>
        </div>
        <button
          aria-label="Navigation öffnen"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden"
        >
          <span className="sr-only">Menü</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">
            <div className="space-y-1">
              <span className={cn('block h-0.5 w-5 bg-white transition-transform', open && 'translate-y-1.5 rotate-45')}></span>
              <span className={cn('block h-0.5 w-4 bg-white transition-opacity', open && 'opacity-0')}></span>
              <span className={cn('block h-0.5 w-5 bg-white transition-transform', open && '-translate-y-1.5 -rotate-45')}></span>
            </div>
          </div>
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/5 bg-background/95 px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-slate-200 transition hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="#kontakt">Kostenlose Potenzialanalyse</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
