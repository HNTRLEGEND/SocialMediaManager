'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showPrompt || localStorage.getItem('pwa_install_dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border-2 border-blue-600 rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="text-4xl">📱</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">App installieren</h3>
          <p className="text-sm text-gray-600 mb-3">
            Installiere JagdLog als App für schnelleren Zugriff und Offline-Nutzung!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              📲 Installieren
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
