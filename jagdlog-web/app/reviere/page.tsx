'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { initDatabase, now } from '@/lib/database';
import { queueSync } from '@/lib/sync';

interface Revier {
  id: string;
  name: string;
  flaeche?: number;
  ort?: string;
  beschreibung?: string;
  grenzen_geojson?: string;
  farbe?: string;
  erstellt_am: string;
}

export default function RevierePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviere, setReviere] = useState<Revier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    flaeche: '',
    ort: '',
    beschreibung: '',
    farbe: '#3b82f6',
  });

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadReviere(currentUser);
  }, [router]);

  const loadReviere = async (user: any) => {
    setLoading(true);
    try {
      const db = await initDatabase();

      const result = db.exec(
        `SELECT id, name, flaeche, ort, beschreibung, grenzen_geojson, farbe, erstellt_am
         FROM reviere
         WHERE user_id = ? AND geloescht_am IS NULL
         ORDER BY erstellt_am DESC`,
        [user.id]
      );

      if (result.length > 0 && result[0].values.length > 0) {
        const loadedReviere = result[0].values.map((row) => ({
          id: row[0] as string,
          name: row[1] as string,
          flaeche: row[2] ? Number(row[2]) : undefined,
          ort: row[3] as string,
          beschreibung: row[4] as string,
          grenzen_geojson: row[5] as string,
          farbe: row[6] as string,
          erstellt_am: row[7] as string,
        }));
        setReviere(loadedReviere);
      } else {
        setReviere([]);
      }
    } catch (error) {
      console.error('Error loading reviere:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      alert('❌ Bitte Name eingeben!');
      return;
    }

    try {
      const db = await initDatabase();
      const id = editingId || crypto.randomUUID();
      const timestamp = now();

      if (editingId) {
        // Update
        db.run(
          `UPDATE reviere
           SET name = ?, flaeche = ?, ort = ?, beschreibung = ?, 
               farbe = ?, geaendert_am = ?
           WHERE id = ?`,
          [
            formData.name,
            formData.flaeche ? Number(formData.flaeche) : null,
            formData.ort || null,
            formData.beschreibung || null,
            formData.farbe,
            timestamp,
            editingId,
          ]
        );
        await queueSync('reviere', editingId, 'UPDATE');
      } else {
        // Insert
        db.run(
          `INSERT INTO reviere (
            id, user_id, name, flaeche, ort, beschreibung,
            farbe, erstellt_am, geaendert_am
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            user.id,
            formData.name,
            formData.flaeche ? Number(formData.flaeche) : null,
            formData.ort || null,
            formData.beschreibung || null,
            formData.farbe,
            timestamp,
            timestamp,
          ]
        );
        await queueSync('reviere', id, 'INSERT');
      }

      // Reload
      await loadReviere(user);

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        flaeche: '',
        ort: '',
        beschreibung: '',
        farbe: '#3b82f6',
      });

      alert(editingId ? '✅ Revier aktualisiert!' : '✅ Revier erstellt!');
    } catch (error) {
      console.error('Error saving revier:', error);
      alert('❌ Fehler beim Speichern!');
    }
  };

  const handleEdit = (revier: Revier) => {
    setEditingId(revier.id);
    setFormData({
      name: revier.name,
      flaeche: revier.flaeche?.toString() || '',
      ort: revier.ort || '',
      beschreibung: revier.beschreibung || '',
      farbe: revier.farbe || '#3b82f6',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('❌ Revier wirklich löschen? Alle zugehörigen Einträge bleiben erhalten.')) return;

    try {
      const db = await initDatabase();
      db.run(
        `UPDATE reviere SET geloescht_am = ? WHERE id = ?`,
        [now(), id]
      );
      await queueSync('reviere', id, 'UPDATE');
      await loadReviere(user);
      alert('✅ Revier gelöscht!');
    } catch (error) {
      console.error('Error deleting revier:', error);
      alert('❌ Fehler beim Löschen!');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const db = await initDatabase();
      
      // Remove default flag from all reviere
      db.run(
        `UPDATE reviere SET ist_standard = 0 WHERE user_id = ?`,
        [user.id]
      );
      
      // Set new default
      db.run(
        `UPDATE reviere SET ist_standard = 1 WHERE id = ?`,
        [id]
      );
      
      await queueSync('reviere', id, 'UPDATE');
      await loadReviere(user);
      alert('✅ Standard-Revier gesetzt!');
    } catch (error) {
      console.error('Error setting default:', error);
      alert('❌ Fehler beim Setzen!');
    }
  };

  const getRevierStats = async (revierId: string) => {
    try {
      const db = await initDatabase();
      
      const huntsResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE revier_id = ? AND geloescht_am IS NULL`,
        [revierId]
      );
      const hunts = Number(huntsResult[0]?.values[0]?.[0] || 0);

      const featuresResult = db.exec(
        `SELECT COUNT(*) FROM map_features WHERE revier_id = ? AND geloescht_am IS NULL`,
        [revierId]
      );
      const features = Number(featuresResult[0]?.values[0]?.[0] || 0);

      return { hunts, features };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { hunts: 0, features: 0 };
    }
  };

  const handleViewOnMap = (revier: Revier) => {
    // Navigate to map with revier filter
    router.push(`/map?revier=${revier.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🏞️</div>
          <p className="text-xl font-semibold">Lade Reviere...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">🏞️ Meine Reviere</h1>
          <p className="text-gray-600 mt-1">
            {reviere.length} {reviere.length === 1 ? 'Revier' : 'Reviere'} verwaltet
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              flaeche: '',
              ort: '',
              beschreibung: '',
              farbe: '#3b82f6',
            });
          }}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
        >
          {showForm ? '❌ Abbrechen' : '➕ Neues Revier'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? '✏️ Revier bearbeiten' : '➕ Neues Revier'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Revier Waldhaus"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fläche (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.flaeche}
                  onChange={(e) => setFormData({ ...formData, flaeche: e.target.value })}
                  placeholder="z.B. 250"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ort / Region</label>
              <input
                type="text"
                value={formData.ort}
                onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
                placeholder="z.B. Schwarzwald, Baden-Württemberg"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Beschreibung</label>
              <textarea
                value={formData.beschreibung}
                onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                placeholder="Zusätzliche Informationen zum Revier..."
                className="w-full p-3 border rounded h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Farbe (für Karte)</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formData.farbe}
                  onChange={(e) => setFormData({ ...formData, farbe: e.target.value })}
                  className="w-16 h-12 border rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  Wähle eine Farbe für die Reviergrenzen auf der Karte
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              {editingId ? '💾 Speichern' : '➕ Revier erstellen'}
            </button>
          </form>
        </div>
      )}

      {/* Reviere List */}
      {reviere.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏞️</div>
          <p className="text-xl font-semibold mb-2">Noch keine Reviere</p>
          <p className="text-gray-600 mb-4">Erstelle dein erstes Revier!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
          >
            ➕ Revier erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviere.map((revier) => (
            <div
              key={revier.id}
              className="card hover:shadow-xl transition"
              style={{ borderLeft: `4px solid ${revier.farbe || '#3b82f6'}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">{revier.name}</h3>
                  {revier.ort && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      📍 {revier.ort}
                    </p>
                  )}
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${revier.farbe}20` }}
                >
                  🏞️
                </div>
              </div>

              {revier.flaeche && (
                <div className="mb-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    📏 {revier.flaeche} ha
                  </span>
                </div>
              )}

              {revier.beschreibung && (
                <p className="text-gray-700 text-sm mb-3">{revier.beschreibung}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>📅 Erstellt: {new Date(revier.erstellt_am).toLocaleDateString('de-DE')}</span>
              </div>

              {/* Stats - würde async laden */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Jagden</p>
                  <p className="text-lg font-bold">-</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Map Features</p>
                  <p className="text-lg font-bold">-</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleViewOnMap(revier)}
                  className="py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                >
                  🗺️ Auf Karte
                </button>
                <button
                  onClick={() => handleEdit(revier)}
                  className="py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-semibold"
                >
                  ✏️ Bearbeiten
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleSetDefault(revier.id)}
                  className="py-2 border border-green-300 text-green-700 rounded hover:bg-green-50 text-sm font-semibold"
                >
                  ⭐ Standard
                </button>
                <button
                  onClick={() => handleDelete(revier.id)}
                  className="py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm font-semibold"
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="card bg-blue-50 border-l-4 border-blue-600 mt-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-lg mb-1">Revier-Verwaltung</h3>
            <p className="text-gray-700 mb-2">
              Hier kannst du deine Jagdreviere verwalten. Jedes Revier kann:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Auf der Karte angezeigt werden (mit Reviergrenzen zeichnen)</li>
              <li>Jagd-Einträge zugeordnet bekommen</li>
              <li>Map Features (Ansitze, Wildkameras) beinhalten</li>
              <li>Mit eigener Farbe markiert werden</li>
              <li>Als Standard-Revier festgelegt werden</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
