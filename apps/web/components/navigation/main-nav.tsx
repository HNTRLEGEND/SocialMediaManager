'use client';

// MainNav: Sticky Navigation mit Desktop- und Mobile-Menü.

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

// Menülinks für die Sections der Landingpage
const links = [
  { href: '#leistungen', label: 'Leistungen' },
  { href: '#ablauf', label: 'Ablauf' },
  { href: '#mission', label: 'Über uns' },
  { href: '#cases', label: 'Projekte' },
  { href: '#insights', label: 'Insights' },
  { href: '#kontakt', label: 'Kontakt' }
];

export function MainNav() {
  const [open, setOpen] = useState(false);
  // Mobile Navigation wird über useState ein- bzw. ausgeblendet

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center space-x-2 text-lg font-display uppercase tracking-[0.35rem] text-navy">
          <span>WIES</span>
          <span className="text-primary">.AI</span>
        </Link>
        <nav className="hidden items-center space-x-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-navy/70 transition hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center space-x-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link href="#kontakt">Potenzialanalyse starten</Link>
          </Button>
        </div>
        <button
          aria-label="Navigation öffnen"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden"
        >
          <span className="sr-only">Menü</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/10">
            <div className="space-y-1">
              <span className={cn('block h-0.5 w-5 bg-navy transition-transform', open && 'translate-y-1.5 rotate-45')}></span>
              <span className={cn('block h-0.5 w-4 bg-navy transition-opacity', open && 'opacity-0')}></span>
              <span className={cn('block h-0.5 w-5 bg-navy transition-transform', open && '-translate-y-1.5 -rotate-45')}></span>
            </div>
          </div>
        </button>
      </div>
      {open ? (
        <div className="border-t border-navy/10 bg-white/95 px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-navy/80 transition hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link href="#kontakt">Potenzialanalyse starten</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
