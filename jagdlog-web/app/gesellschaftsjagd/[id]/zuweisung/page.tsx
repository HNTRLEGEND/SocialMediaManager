'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getTeilnehmer,
  getStandorte,
  getStandortZuweisungen,
  assignStandort,
  unassignStandort,
  confirmStandortZuweisung,
} from '@/lib/services/gesellschaftsjagdService';
import { Teilnehmer, Standort, StandortZuweisung } from '@/lib/types/gesellschaftsjagd';

export default function ZuweisungPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jagdId = params.id as string;

  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [standorte, setStandorte] = useState<Standort[]>([]);
  const [zuweisungen, setZuweisungen] = useState<StandortZuweisung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeilnehmer, setSelectedTeilnehmer] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [jagdId]);

  const loadData = async () => {
    try {
      const [t, s, z] = await Promise.all([
        getTeilnehmer(jagdId),
        getStandorte(jagdId),
        getStandortZuweisungen(jagdId),
      ]);
      setTeilnehmer(t.filter(tn => tn.anmeldung.status === 'zugesagt'));
      setStandorte(s.sort((a, b) => a.nummer - b.nummer));
      setZuweisungen(z);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (standortId: string) => {
    if (!user || !selectedTeilnehmer) return;

    setError(null);
    try {
      await assignStandort(
        jagdId,
        standortId,
        selectedTeilnehmer,
        user.id,
        1
      );
      await loadData();
      setSelectedTeilnehmer(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnassign = async (zuweisungId: string) => {
    if (!user) return;
    if (!confirm('Zuweisung wirklich aufheben?')) return;

    try {
      await unassignStandort(zuweisungId, user.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirm = async (zuweisungId: string) => {
    if (!user) return;

    try {
      await confirmStandortZuweisung(zuweisungId, user.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getTeilnehmerName = (teilnehmerId: string) => {
    const t = teilnehmer.find(tn => tn.id === teilnehmerId);
    return t ? t.name : 'Unbekannt';
  };

  const getStandortName = (standortId: string) => {
    const s = standorte.find(st => st.id === standortId);
    return s ? `#${s.nummer} ${s.name || s.typ}` : 'Unbekannt';
  };

  const getZuweisungForStandort = (standortId: string) => {
    return zuweisungen.filter(z => z.standortId === standortId);
  };

  const getZuweisungForTeilnehmer = (teilnehmerId: string) => {
    return zuweisungen.find(z => z.teilnehmerId === teilnehmerId);
  };

  const verfuegbareStandorte = standorte.filter(s => s.status !== 'gesperrt');
  const unzugewieseneTeilnehmer = teilnehmer.filter(
    t => !getZuweisungForTeilnehmer(t.id)
  );

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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Standort-Zuweisung</h1>
          <p className="text-gray-600 mt-1">
            {zuweisungen.length} von {teilnehmer.length} Teilnehmern zugewiesen
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Zurück
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">✗ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Unassigned Participants */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              Nicht zugewiesene Teilnehmer ({unzugewieseneTeilnehmer.length})
            </h2>
            {unzugewieseneTeilnehmer.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                ✓ Alle Teilnehmer zugewiesen
              </p>
            ) : (
              <div className="space-y-2">
                {unzugewieseneTeilnehmer.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeilnehmer(t.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTeilnehmer === t.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {selectedTeilnehmer === t.id ? '✓' : '👤'}
                      </span>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{t.rolle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Standorte with assignments */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              Standorte ({verfuegbareStandorte.length})
            </h2>
            <div className="space-y-3">
              {verfuegbareStandorte.map((s) => {
                const zuweisungenHier = getZuweisungForStandort(s.id);
                const istVoll = zuweisungenHier.length >= s.eigenschaften.kapazitaet;
                
                return (
                  <div
                    key={s.id}
                    className={`p-4 border rounded-lg ${
                      istVoll ? 'bg-gray-50 border-gray-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          #{s.nummer} {s.name || s.typ}
                        </p>
                        <p className="text-sm text-gray-600">
                          Kapazität: {zuweisungenHier.length}/{s.eigenschaften.kapazitaet}
                        </p>
                      </div>
                      {selectedTeilnehmer && !istVoll && (
                        <button
                          onClick={() => handleAssign(s.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Zuweisen
                        </button>
                      )}
                    </div>
                    
                    {zuweisungenHier.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {zuweisungenHier.map((z) => (
                          <div
                            key={z.id}
                            className="flex justify-between items-center bg-white p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">👤</span>
                              <span className="text-sm font-medium">
                                {getTeilnehmerName(z.teilnehmerId)}
                              </span>
                              {z.bestaetigt && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  ✓ Bestätigt
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {!z.bestaetigt && (
                                <button
                                  onClick={() => handleConfirm(z.id)}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  Bestätigen
                                </button>
                              )}
                              <button
                                onClick={() => handleUnassign(z.id)}
                                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Entfernen
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {verfuegbareStandorte.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Keine verfügbaren Standorte
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-900">{teilnehmer.length}</p>
            <p className="text-sm text-blue-700">Teilnehmer (zugesagt)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">{zuweisungen.length}</p>
            <p className="text-sm text-blue-700">Zuweisungen</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {zuweisungen.filter(z => z.bestaetigt).length}
            </p>
            <p className="text-sm text-blue-700">Bestätigt</p>
          </div>
        </div>
      </div>

      {selectedTeilnehmer && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            ✓ <strong>{getTeilnehmerName(selectedTeilnehmer)}</strong> ausgewählt - 
            Klicke auf einen Standort rechts, um die Zuweisung vorzunehmen.
          </p>
        </div>
      )}
    </div>
  );
}
