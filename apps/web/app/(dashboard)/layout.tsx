import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/customers', label: 'Kunden' },
  { href: '/workflows', label: 'Workflows' },
  { href: '/agents', label: 'Voice Agents' },
  { href: '/settings', label: 'Einstellungen' },
  { href: '/support', label: 'Support' }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[280px_1fr] bg-[#050d1c] text-slate-100">
      <aside className="flex flex-col border-r border-white/5 bg-background/80 px-6 py-8">
        <Link href="/dashboard" className="text-xl font-display text-white uppercase tracking-[0.3rem]">
          WIES<span className="text-primary">.AI</span>
        </Link>
        <nav className="mt-8 flex flex-col space-y-3 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 text-xs text-slate-400">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.3rem] text-primary">Quota</div>
            <p className="mt-2 text-sm text-white">9/15 Seats aktiv</p>
            <p className="text-xs text-slate-400">Upgrade für zusätzliche Voice-Lizenzen</p>
            <Button size="sm" variant="accent" className="mt-3 w-full">
              Upgrade
            </Button>
          </div>
          <Link href="/settings" className="block text-slate-400 hover:text-primary">
            Einstellungen
          </Link>
          <Link href="/support" className="block text-slate-400 hover:text-primary">
            Support
          </Link>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-background/70 px-8 py-6">
          <div>
          <div className="text-xs uppercase tracking-[0.3rem] text-primary">Mandant</div>
          <div className="text-sm font-semibold text-white">WIES.AI Automation Hub</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full border border-white/10 px-3 py-1 text-slate-200">LIVE</span>
            <span>calls/min: 38</span>
            <span>uptime: 99.98%</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-[#081327] px-8 py-10">{children}</main>
      </div>
    </div>
  );
}
