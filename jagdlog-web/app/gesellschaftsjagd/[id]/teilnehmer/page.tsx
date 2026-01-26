'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getTeilnehmer,
  addTeilnehmer,
  removeTeilnehmer,
  updateTeilnehmerStatus,
} from '@/lib/services/gesellschaftsjagdService';
import { Teilnehmer, TeilnehmerRolle } from '@/lib/types/gesellschaftsjagd';

export default function TeilnehmerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jagdId = params.id as string;

  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefon: '',
    rolle: 'schuetze' as TeilnehmerRolle,
  });

  useEffect(() => {
    loadTeilnehmer();
  }, [jagdId]);

  const loadTeilnehmer = async () => {
    try {
      const data = await getTeilnehmer(jagdId);
      setTeilnehmer(data);
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
      await addTeilnehmer(
        {
          jagdId,
          ...formData,
          ausruestung: {
            waffe: '',
            optik: '',
            munition: '',
            signalweste: false,
            funkgeraet: false,
          },
          erfahrung: {
            jahreSeit: 0,
            gesellschaftsjagdenAnzahl: 0,
          },
          anmeldung: {
            status: 'eingeladen',
          },
        },
        user.id
      );

      // Reset form
      setFormData({
        name: '',
        email: '',
        telefon: '',
        rolle: 'schuetze',
      });
      setShowAddForm(false);
      await loadTeilnehmer();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemove = async (teilnehmerId: string) => {
    if (!user) return;
    if (!confirm('Teilnehmer wirklich entfernen?')) return;

    try {
      await removeTeilnehmer(teilnehmerId, user.id);
      await loadTeilnehmer();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (
    teilnehmerId: string,
    status: 'eingeladen' | 'zugesagt' | 'abgesagt' | 'warteliste'
  ) => {
    if (!user) return;

    try {
      await updateTeilnehmerStatus(teilnehmerId, status, undefined, user.id);
      await loadTeilnehmer();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getRoleIcon = (rolle: TeilnehmerRolle) => {
    const icons: Record<TeilnehmerRolle, string> = {
      jagdleiter: '👑',
      schuetze: '🎯',
      treiber: '🚶',
      hundefuehrer: '🐕',
      ansteller: '📍',
      bergehelfer: '🔍',
      sanitaeter: '🏥',
    };
    return icons[rolle] || '👤';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      eingeladen: 'bg-yellow-100 text-yellow-800',
      zugesagt: 'bg-green-100 text-green-800',
      abgesagt: 'bg-red-100 text-red-800',
      warteliste: 'bg-gray-100 text-gray-800',
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
          <h1 className="text-3xl font-bold text-gray-900">Teilnehmer-Verwaltung</h1>
          <p className="text-gray-600 mt-1">{teilnehmer.length} Teilnehmer</p>
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
            {showAddForm ? 'Abbrechen' : '+ Teilnehmer hinzufügen'}
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
          <h2 className="text-xl font-bold mb-4">Neuer Teilnehmer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rolle *
                </label>
                <select
                  value={formData.rolle}
                  onChange={(e) =>
                    setFormData({ ...formData, rolle: e.target.value as TeilnehmerRolle })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="jagdleiter">Jagdleiter</option>
                  <option value="schuetze">Schütze</option>
                  <option value="treiber">Treiber</option>
                  <option value="hundefuehrer">Hundeführer</option>
                  <option value="ansteller">Ansteller</option>
                  <option value="bergehelfer">Bergehelfer</option>
                  <option value="sanitaeter">Sanitäter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  maxLength={20}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={255}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Teilnehmer hinzufügen
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {teilnehmer.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getRoleIcon(t.rolle)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{t.rolle}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>📞 {t.telefon}</p>
                  {t.email && <p>✉️ {t.email}</p>}
                  {t.zugewiesenerStandort && (
                    <p className="text-green-600 font-medium">
                      ✓ Standort zugewiesen
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    t.anmeldung.status
                  )}`}
                >
                  {t.anmeldung.status}
                </span>
                <div className="flex gap-2">
                  <select
                    value={t.anmeldung.status}
                    onChange={(e) =>
                      handleStatusChange(
                        t.id,
                        e.target.value as 'eingeladen' | 'zugesagt' | 'abgesagt' | 'warteliste'
                      )
                    }
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="eingeladen">Eingeladen</option>
                    <option value="zugesagt">Zugesagt</option>
                    <option value="abgesagt">Abgesagt</option>
                    <option value="warteliste">Warteliste</option>
                  </select>
                  <button
                    onClick={() => handleRemove(t.id)}
                    className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {teilnehmer.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Noch keine Teilnehmer hinzugefügt.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Ersten Teilnehmer hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
