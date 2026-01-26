'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getStandorte,
  createStandort,
  deleteStandort,
  updateStandort,
} from '@/lib/services/gesellschaftsjagdService';
import { Standort, StandortTyp } from '@/lib/types/gesellschaftsjagd';

export default function StandortePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jagdId = params.id as string;

  const [standorte, setStandorte] = useState<Standort[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nummer: 1,
    name: '',
    typ: 'hochsitz' as StandortTyp,
    beschreibung: '',
    zugang: '',
    orientierung: 0,
    latitude: 51.1657,
    longitude: 10.4515,
  });

  useEffect(() => {
    loadStandorte();
  }, [jagdId]);

  const loadStandorte = async () => {
    try {
      const data = await getStandorte(jagdId);
      setStandorte(data.sort((a, b) => a.nummer - b.nummer));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    try {
      await createStandort(
        {
          jagdId,
          nummer: formData.nummer,
          name: formData.name || undefined,
          typ: formData.typ,
          beschreibung: formData.beschreibung || undefined,
          zugang: formData.zugang,
          orientierung: formData.orientierung,
          gps: {
            latitude: formData.latitude,
            longitude: formData.longitude,
          },
          sicherheit: {
            schussrichtungen: [0, 90, 180, 270],
            sichtfeld: {
              winkel: 180,
              reichweite: 200,
            },
          },
          eigenschaften: {
            ueberdacht: false,
            beheizt: false,
            kapazitaet: 1,
            barrierefrei: false,
            ansitzleiter: false,
          },
          status: 'verfuegbar',
          zugewiesenePersonen: [],
        },
        user.id
      );

      // Reset form and set next number
      const nextNummer = Math.max(...standorte.map(s => s.nummer), 0) + 1;
      setFormData({
        nummer: nextNummer,
        name: '',
        typ: 'hochsitz',
        beschreibung: '',
        zugang: '',
        orientierung: 0,
        latitude: 51.1657,
        longitude: 10.4515,
      });
      setShowAddForm(false);
      await loadStandorte();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (standortId: string) => {
    if (!user) return;
    if (!confirm('Standort wirklich löschen?')) return;

    try {
      await deleteStandort(standortId, user.id);
      await loadStandorte();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (standort: Standort) => {
    if (!user) return;

    const newStatus = standort.status === 'gesperrt' ? 'verfuegbar' : 'gesperrt';
    
    try {
      await updateStandort(
        standort.id,
        { status: newStatus },
        user.id
      );
      await loadStandorte();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getTypIcon = (typ: StandortTyp) => {
    const icons: Record<StandortTyp, string> = {
      hochsitz: '🪜',
      bodensitz: '🪑',
      kanzel: '🏰',
      ansitzleiter: '🪜',
      druckposten: '🎯',
      treiberlinie: '➡️',
    };
    return icons[typ] || '📍';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      verfuegbar: 'bg-green-100 text-green-800',
      besetzt: 'bg-blue-100 text-blue-800',
      gesperrt: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Sie müssen angemeldet sein.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-gray-600">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Standort-Verwaltung</h1>
          <p className="text-gray-600 mt-1">{standorte.length} Standorte</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Zurück
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {showAddForm ? 'Abbrechen' : '+ Standort hinzufügen'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">✗ {error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Neuer Standort</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nummer *
                </label>
                <input
                  type="number"
                  value={formData.nummer}
                  onChange={(e) => setFormData({ ...formData, nummer: parseInt(e.target.value) })}
                  min={1}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ *
                </label>
                <select
                  value={formData.typ}
                  onChange={(e) => setFormData({ ...formData, typ: e.target.value as StandortTyp })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="hochsitz">Hochsitz</option>
                  <option value="bodensitz">Bodensitz</option>
                  <option value="kanzel">Kanzel</option>
                  <option value="ansitzleiter">Ansitzleiter</option>
                  <option value="druckposten">Druckposten</option>
                  <option value="treiberlinie">Treiberlinie</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="z.B. Hochsitz am Nordrand"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zugang *
                </label>
                <input
                  type="text"
                  value={formData.zugang}
                  onChange={(e) => setFormData({ ...formData, zugang: e.target.value })}
                  maxLength={500}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="z.B. Von Waldweg 100m Richtung Norden"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Breitengrad
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Längengrad
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientierung (Grad)
                </label>
                <input
                  type="number"
                  value={formData.orientierung}
                  onChange={(e) => setFormData({ ...formData, orientierung: parseInt(e.target.value) })}
                  min={0}
                  max={360}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.beschreibung}
                  onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {formData.beschreibung.length}/500
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Standort hinzufügen
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {standorte.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypIcon(s.typ)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">#{s.nummer}</span>
                      {s.name && <span className="text-lg font-bold text-gray-900">{s.name}</span>}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{s.typ}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>📍 Zugang: {s.zugang}</p>
                  <p>🧭 Orientierung: {s.orientierung}°</p>
                  <p>📊 Kapazität: {s.eigenschaften.kapazitaet} Person(en)</p>
                  {s.eigenschaften.ueberdacht && <p className="text-green-600">☂️ Überdacht</p>}
                  {s.eigenschaften.beheizt && <p className="text-orange-600">🔥 Beheizt</p>}
                  {s.zugewiesenePersonen.length > 0 && (
                    <p className="text-blue-600 font-medium">
                      👥 {s.zugewiesenePersonen.length} Person(en) zugewiesen
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}
                >
                  {s.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(s)}
                    className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    {s.status === 'gesperrt' ? 'Freigeben' : 'Sperren'}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {standorte.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Noch keine Standorte hinzugefügt.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Ersten Standort hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
