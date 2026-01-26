'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if PWA is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/hunt-log', label: 'Jagdtagebuch', icon: '📋' },
    { href: '/shot-analysis', label: 'Shot Analysis', icon: '🎯' },
    { href: '/gesellschaftsjagd', label: 'Gesellschaftsjagd', icon: '🎯' },
    { href: '/map', label: 'Karte', icon: '🗺️' },
    { href: '/reviere', label: 'Reviere', icon: '🏞️' },
    { href: '/statistics', label: 'Statistiken', icon: '📊' },
    { href: '/crowdsourcing', label: 'Community', icon: '🤝' },
    { href: '/profile', label: 'Profil', icon: '👤' },
    { href: '/settings', label: 'Einstellungen', icon: '⚙️' },
  ];

  // Don't show nav on login/register pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${isOnline ? 'bg-green-600' : 'bg-red-600'} text-white text-center py-1 text-sm`}>
        {isOnline ? (
          <span>🌐 Online {isInstalled && '• 📱 PWA Installiert'}</span>
        ) : (
          <span>📵 Offline-Modus • Änderungen werden synchronisiert sobald du online bist</span>
        )}
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-10 left-0 right-0 bg-white border-b shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">🦌</span>
              <span className="text-xl font-bold">JagdLog</span>
            </Link>

            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded transition ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 rounded transition ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 p-2 pt-0">
          {navItems.slice(5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 rounded transition ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-10 md:h-26"></div>
    </>
  );
}
