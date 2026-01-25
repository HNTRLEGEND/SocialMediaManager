'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { initDatabase, now } from '@/lib/database';
import { queueSync } from '@/lib/sync';

interface HuntEntry {
  id: string;
  typ: string;
  wildart_name: string;
  zeitpunkt: string;
  ort_beschreibung: string;
  notizen?: string;
  erfolg?: boolean;
  revier_id?: string | null;
  revier_name?: string;
}

export default function HuntLogPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<HuntEntry[]>([]);
  const [allReviere, setAllReviere] = useState<any[]>([]);
  const [selectedRevierId, setSelectedRevierId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    typ: 'hunt',
    wildart: 'Rehwild',
    zeitpunkt: new Date().toISOString().slice(0, 16),
    ort: '',
    notizen: '',
    erfolg: false,
    revier_id: '',
  });

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadEntries(currentUser);
  }, [router]);

  const loadEntries = async (user: any) => {
    setLoading(true);
    try {
      const db = await initDatabase();

      // Load Reviere for dropdown
      const reviereResult = db.exec(
        `SELECT id, name FROM reviere WHERE user_id = ? AND geloescht_am IS NULL ORDER BY name`,
        [user.id]
      );
      if (reviereResult.length > 0 && reviereResult[0].values.length > 0) {
        const reviereList = reviereResult[0].values.map((row) => ({
          id: row[0] as string,
          name: row[1] as string,
        }));
        setAllReviere(reviereList);
      }

      const result = db.exec(
        `SELECT e.id, e.typ, e.wildart_name, e.zeitpunkt, e.ort_beschreibung, e.notizen, e.revier_id, r.name as revier_name
         FROM eintraege e
         LEFT JOIN reviere r ON e.revier_id = r.id
         WHERE e.user_id = ? AND e.geloescht_am IS NULL
         ORDER BY e.zeitpunkt DESC`,
        [user.id]
      );

      if (result.length > 0 && result[0].values.length > 0) {
        const loadedEntries = result[0].values.map((row) => ({
          id: row[0] as string,
          typ: row[1] as string,
          wildart_name: row[2] as string,
          zeitpunkt: row[3] as string,
          ort_beschreibung: row[4] as string,
          notizen: row[5] as string,
          revier_id: row[6] as string | null,
          revier_name: row[7] as string,
          erfolg: row[1] === 'harvest',
        }));
        setEntries(loadedEntries);
      }
    } catch (error) {
      console.error('Error loading hunt log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const db = await initDatabase();
      const id = editingId || crypto.randomUUID();
      const timestamp = now();

      if (editingId) {
        // Update
        db.run(
          `UPDATE eintraege
           SET typ = ?, wildart_name = ?, zeitpunkt = ?, ort_beschreibung = ?, 
               notizen = ?, revier_id = ?, geaendert_am = ?
           WHERE id = ?`,
          [
            formData.erfolg ? 'harvest' : 'hunt',
            formData.wildart,
            formData.zeitpunkt,
            formData.ort,
            formData.notizen,
            formData.revier_id || null,
            timestamp,
            editingId,
          ]
        );
        await queueSync('eintraege', editingId, 'UPDATE');
      } else {
        // Insert
        db.run(
          `INSERT INTO eintraege (
            id, user_id, revier_id, typ, wildart_name, zeitpunkt,
            ort_beschreibung, notizen, erstellt_am, geaendert_am
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            user.id,
            formData.revier_id || null,
            formData.erfolg ? 'harvest' : 'hunt',
            formData.wildart,
            formData.zeitpunkt,
            formData.ort,
            formData.notizen,
            timestamp,
            timestamp,
          ]
        );
        await queueSync('eintraege', id, 'INSERT');
      }

      // Reload
      await loadEntries(user);

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setFormData({
        typ: 'hunt',
        wildart: 'Rehwild',
        zeitpunkt: new Date().toISOString().slice(0, 16),
        ort: '',
        notizen: '',
        erfolg: false,
        revier_id: '',
      });

      alert(editingId ? '✅ Eintrag aktualisiert!' : '✅ Eintrag erstellt!');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('❌ Fehler beim Speichern!');
    }
  };

  const handleEdit = (entry: HuntEntry) => {
    setEditingId(entry.id);
    setFormData({
      typ: entry.typ,
      wildart: entry.wildart_name,
      zeitpunkt: entry.zeitpunkt.slice(0, 16),
      ort: entry.ort_beschreibung,
      notizen: entry.notizen || '',
      erfolg: entry.erfolg || false,
      revier_id: entry.revier_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('❌ Eintrag wirklich löschen?')) return;

    try {
      const db = await initDatabase();
      db.run(
        `UPDATE eintraege SET geloescht_am = ? WHERE id = ?`,
        [now(), id]
      );
      await queueSync('eintraege', id, 'UPDATE');
      await loadEntries(user);
      alert('✅ Eintrag gelöscht!');
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('❌ Fehler beim Löschen!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl font-semibold">Lade Jagdtagebuch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">📋 Jagdtagebuch</h1>
        <div className="flex gap-3 items-center">
          {/* Revier Filter */}
          <select
            value={selectedRevierId || ''}
            onChange={(e) => setSelectedRevierId(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            <option value="">🏞️ Alle Reviere</option>
            {allReviere.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                typ: 'hunt',
                wildart: 'Rehwild',
                zeitpunkt: new Date().toISOString().slice(0, 16),
                ort: '',
                notizen: '',
                erfolg: false,
                revier_id: '',
              });
            }}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
          >
            {showForm ? '❌ Abbrechen' : '➕ Neuer Eintrag'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? '✏️ Eintrag bearbeiten' : '➕ Neuer Eintrag'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">🏞️ Revier</label>
                <select
                  value={formData.revier_id}
                  onChange={(e) => setFormData({ ...formData, revier_id: e.target.value })}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kein Revier zugeordnet</option>
                  {allReviere.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Wildart</label>
                <select
                  value={formData.wildart}
                  onChange={(e) => setFormData({ ...formData, wildart: e.target.value })}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Rehwild">🦌 Rehwild</option>
                  <option value="Rotwild">🦌 Rotwild</option>
                  <option value="Schwarzwild">🐗 Schwarzwild</option>
                  <option value="Damwild">🦌 Damwild</option>
                  <option value="Fuchs">🦊 Fuchs</option>
                  <option value="Marder">🦡 Marder</option>
                  <option value="Dachs">🦡 Dachs</option>
                  <option value="Waschbär">🦝 Waschbär</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Zeitpunkt</label>
                <input
                  type="datetime-local"
                  value={formData.zeitpunkt}
                  onChange={(e) => setFormData({ ...formData, zeitpunkt: e.target.value })}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ort</label>
              <input
                type="text"
                value={formData.ort}
                onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
                placeholder="z.B. Hochsitz 3, Abteilung 12"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notizen</label>
              <textarea
                value={formData.notizen}
                onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
                placeholder="Zusätzliche Informationen..."
                className="w-full p-3 border rounded h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="erfolg"
                checked={formData.erfolg}
                onChange={(e) => setFormData({ ...formData, erfolg: e.target.checked })}
                className="w-5 h-5 text-green-600"
              />
              <label htmlFor="erfolg" className="font-medium">
                ✅ Erfolgreich erlegt
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              {editingId ? '💾 Speichern' : '➕ Eintrag erstellen'}
            </button>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.filter(e => !selectedRevierId || e.revier_id === selectedRevierId).length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold mb-2">Keine Einträge</p>
            <p className="text-gray-600">
              {selectedRevierId ? 'Keine Einträge für dieses Revier gefunden.' : 'Erstelle deinen ersten Jagd-Eintrag!'}
            </p>
          </div>
        ) : (
          entries.filter(e => !selectedRevierId || e.revier_id === selectedRevierId).map((entry) => (
            <div key={entry.id} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">
                      {entry.wildart_name.includes('Reh') ? '🦌' :
                       entry.wildart_name.includes('Schwarz') ? '🐗' :
                       entry.wildart_name.includes('Fuchs') ? '🦊' : '🦌'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{entry.wildart_name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.zeitpunkt).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {entry.erfolg && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✅ Erlegt
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    {entry.revier_name && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium">🏞️ Revier:</span>
                        {entry.revier_name}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span className="font-medium">📍 Ort:</span>
                      {entry.ort_beschreibung}
                    </p>
                    {entry.notizen && (
                      <p className="flex items-start gap-2">
                        <span className="font-medium">📝 Notizen:</span>
                        <span className="text-gray-700">{entry.notizen}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    ✏️ Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    🗑️ Löschen
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
