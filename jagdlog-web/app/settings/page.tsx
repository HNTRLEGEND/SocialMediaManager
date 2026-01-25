'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { initDatabase, now, exportDatabase } from '@/lib/database';
import { performSync, startAutoSync, stopAutoSync } from '@/lib/sync';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: 5,
    notifications: true,
    darkMode: false,
    gpsTracking: true,
    offlineMode: true,
  });

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadSettings();
  }, [router]);

  const loadSettings = () => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));

    // Apply settings
    if (newSettings.autoSync) {
      startAutoSync();
    } else {
      stopAutoSync();
    }

    alert('✅ Einstellungen gespeichert!');
  };

  const handleExport = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jagdlog-backup-${new Date().toISOString().slice(0, 10)}.db`;
      a.click();
      URL.revokeObjectURL(url);
      alert('✅ Datenbank exportiert!');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Export fehlgeschlagen!');
    }
  };

  const handleSync = async () => {
    try {
      const result = await performSync();
      if (result.success) {
        alert(`✅ Sync erfolgreich!\n\nGepusht: ${result.pushed}\nGepullt: ${result.pulled}`);
      } else {
        alert(`⚠️ Sync teilweise fehlgeschlagen:\n\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Sync fehlgeschlagen!');
    }
  };

  const clearCache = async () => {
    if (!confirm('🗑️ Cache wirklich leeren?')) return;

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      alert('✅ Cache geleert!');
    } catch (error) {
      console.error('Clear cache error:', error);
      alert('❌ Fehler beim Leeren!');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-6xl">⚙️</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">⚙️ Einstellungen</h1>

      {/* Sync Settings */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">🔄 Synchronisation</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Auto-Sync aktiviert</p>
              <p className="text-sm text-gray-600">
                Automatische Synchronisierung alle {settings.syncInterval} Minuten
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) =>
                  saveSettings({ ...settings, autoSync: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sync-Intervall (Minuten)</label>
            <select
              value={settings.syncInterval}
              onChange={(e) =>
                saveSettings({ ...settings, syncInterval: Number(e.target.value) })
              }
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Minute</option>
              <option value={5}>5 Minuten</option>
              <option value={15}>15 Minuten</option>
              <option value={30}>30 Minuten</option>
              <option value={60}>1 Stunde</option>
            </select>
          </div>

          <button
            onClick={handleSync}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            🔄 Jetzt synchronisieren
          </button>
        </div>
      </div>

      {/* App Settings */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">📱 App-Einstellungen</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Benachrichtigungen</p>
              <p className="text-sm text-gray-600">Push-Benachrichtigungen aktivieren</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  saveSettings({ ...settings, notifications: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">GPS-Tracking</p>
              <p className="text-sm text-gray-600">Standort für Karten-Features verwenden</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.gpsTracking}
                onChange={(e) =>
                  saveSettings({ ...settings, gpsTracking: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Offline-Modus</p>
              <p className="text-sm text-gray-600">App auch ohne Internet nutzen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.offlineMode}
                onChange={(e) =>
                  saveSettings({ ...settings, offlineMode: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">💾 Datenverwaltung</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3 border border-gray-300 rounded hover:bg-gray-50 font-semibold"
          >
            📦 Datenbank exportieren
          </button>
          <button
            onClick={clearCache}
            className="w-full py-3 border border-gray-300 rounded hover:bg-gray-50 font-semibold"
          >
            🗑️ Cache leeren
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border-l-4 border-blue-600">
        <h3 className="font-bold text-lg mb-2">ℹ️ App-Informationen</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Version:</strong> 2.8.0</p>
          <p><strong>Datenbank:</strong> SQL.js + IndexedDB</p>
          <p><strong>PWA:</strong> Installierbar</p>
          <p><strong>Offline:</strong> Verfügbar</p>
          <p><strong>User:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
}
