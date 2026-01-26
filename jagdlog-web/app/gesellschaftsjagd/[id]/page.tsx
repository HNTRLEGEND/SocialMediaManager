'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TeilnehmerManager from '@/components/gesellschaftsjagd/TeilnehmerManager';
import StandortManager from '@/components/gesellschaftsjagd/StandortManager';
import SicherheitszonenEditor from '@/components/gesellschaftsjagd/SicherheitszonenEditor';
import type { Gesellschaftsjagd, JagdStatistik, JagdStatus } from '@/lib/types/gesellschaftsjagd';
import { 
  getStatusColor, 
  getStatusLabel, 
  getJagdTypLabel,
  JAGD_STATUS,
} from '@/lib/types/gesellschaftsjagd';
import {
  getGesellschaftsjagd,
  updateGesellschaftsjagd,
  deleteGesellschaftsjagd,
  getJagdStatistik,
} from '@/lib/services/gesellschaftsjagdService';

interface PageProps {
  params: {
    id: string;
  };
}

type Tab = 'uebersicht' | 'teilnehmer' | 'standorte' | 'sicherheit';

export default function DetailPage({ params }: PageProps) {
  const router = useRouter();
  const [jagd, setJagd] = useState<Gesellschaftsjagd | null>(null);
  const [statistik, setStatistik] = useState<JagdStatistik | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('uebersicht');

  // TODO: Get from auth
  const userId = 'demo-user-id';

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jagdData, statsData] = await Promise.all([
        getGesellschaftsjagd(params.id),
        getJagdStatistik(params.id),
      ]);
      setJagd(jagdData);
      setStatistik(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: JagdStatus) => {
    if (!jagd) return;

    const confirmMsg = `Status ändern zu "${getStatusLabel(newStatus)}"?`;
    if (!confirm(confirmMsg)) return;

    try {
      const updated = await updateGesellschaftsjagd(
        jagd.id,
        { status: newStatus },
        userId
      );
      if (updated) {
        setJagd(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Fehler beim Aktualisieren des Status');
    }
  };

  const handleDelete = async () => {
    if (!jagd) return;

    const confirmMsg = 'Jagd wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.';
    if (!confirm(confirmMsg)) return;

    try {
      await deleteGesellschaftsjagd(jagd.id);
      router.push('/gesellschaftsjagd');
    } catch (error) {
      console.error('Error deleting jagd:', error);
      alert('Fehler beim Löschen');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pt-28 md:pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Lade Jagd-Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!jagd) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pt-28 md:pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Jagd nicht gefunden
            </h3>
            <Link
              href="/gesellschaftsjagd"
              className="inline-block mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'uebersicht', label: 'Übersicht', icon: '📋' },
    { id: 'teilnehmer', label: 'Teilnehmer', icon: '👥' },
    { id: 'standorte', label: 'Standorte', icon: '📍' },
    { id: 'sicherheit', label: 'Sicherheit', icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pt-28 md:pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/gesellschaftsjagd"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Zurück zur Übersicht
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{jagd.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(jagd.status)}`}>
                    {getStatusLabel(jagd.status)}
                  </span>
                </div>
                <p className="text-gray-600">{getJagdTypLabel(jagd.jagd_typ)}</p>
                {jagd.beschreibung && (
                  <p className="text-gray-700 mt-2">{jagd.beschreibung}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {/* Status Change Dropdown */}
                <select
                  value={jagd.status}
                  onChange={(e) => handleStatusChange(e.target.value as JagdStatus)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {JAGD_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <div className="text-sm text-gray-600">Datum</div>
                <div className="font-semibold">{formatDate(jagd.datum)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Zeit</div>
                <div className="font-semibold">{jagd.start_zeit} - {jagd.end_zeit} Uhr</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Erwartete Teilnehmer</div>
                <div className="font-semibold">
                  {jagd.erwartete_jaeger} Jäger, {jagd.erwartete_treiber} Treiber
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistik && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-2xl font-bold text-gray-900">{statistik.anzahl_teilnehmer_gesamt}</div>
              <div className="text-sm text-gray-600">Teilnehmer</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-2xl font-bold text-gray-900">{statistik.anzahl_jaeger}</div>
              <div className="text-sm text-gray-600">Jäger</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl mb-1">📍</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistik.anzahl_standorte_zugewiesen} / {statistik.anzahl_standorte_gesamt}
              </div>
              <div className="text-sm text-gray-600">Standorte zugewiesen</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-2xl font-bold text-gray-900">{statistik.anzahl_sicherheitszonen}</div>
              <div className="text-sm text-gray-600">Sicherheitszonen</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-green-600 text-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'uebersicht' && (
              <UebersichtTab jagd={jagd} statistik={statistik} />
            )}
            {activeTab === 'teilnehmer' && (
              <TeilnehmerManager jagdId={jagd.id} />
            )}
            {activeTab === 'standorte' && (
              <StandortManager jagdId={jagd.id} />
            )}
            {activeTab === 'sicherheit' && (
              <SicherheitTab jagd={jagd} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Übersicht Tab
function UebersichtTab({ jagd, statistik }: { jagd: Gesellschaftsjagd; statistik: JagdStatistik | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3">Details</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Jagdtyp</dt>
            <dd className="font-medium">{getJagdTypLabel(jagd.jagd_typ)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Status</dt>
            <dd className="font-medium">{getStatusLabel(jagd.status)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Erstellt am</dt>
            <dd className="font-medium">{new Date(jagd.erstellt_am).toLocaleString('de-DE')}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Aktualisiert am</dt>
            <dd className="font-medium">{new Date(jagd.aktualisiert_am).toLocaleString('de-DE')}</dd>
          </div>
        </dl>
      </div>

      {statistik && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Statistik</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Teilnehmer gesamt</div>
                <div className="text-xl font-bold">{statistik.anzahl_teilnehmer_gesamt}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Jäger</div>
                <div className="text-xl font-bold">{statistik.anzahl_jaeger}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Treiber</div>
                <div className="text-xl font-bold">{statistik.anzahl_treiber}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Standorte gesamt</div>
                <div className="text-xl font-bold">{statistik.anzahl_standorte_gesamt}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Zugewiesen</div>
                <div className="text-xl font-bold text-green-600">{statistik.anzahl_standorte_zugewiesen}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Offen</div>
                <div className="text-xl font-bold text-yellow-600">{statistik.anzahl_standorte_offen}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sicherheit Tab
function SicherheitTab({ jagd }: { jagd: Gesellschaftsjagd }) {
  const sicherheitsregeln = jagd.sicherheitsregeln ? JSON.parse(jagd.sicherheitsregeln) : [];
  const notfallKontakte = jagd.notfall_kontakte ? JSON.parse(jagd.notfall_kontakte) : [];

  return (
    <div className="space-y-6">
      {/* Sicherheitsregeln */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Sicherheitsregeln</h3>
        {sicherheitsregeln.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {sicherheitsregeln.map((regel: string, idx: number) => (
              <li key={idx} className="text-gray-700">{regel}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Keine Sicherheitsregeln definiert</p>
        )}
      </div>

      {/* Notfallkontakte */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Notfallkontakte</h3>
        {notfallKontakte.length > 0 ? (
          <div className="space-y-2">
            {notfallKontakte.map((kontakt: any, idx: number) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium">{kontakt.name}</div>
                <div className="text-sm text-gray-600">{kontakt.rolle}</div>
                <div className="text-sm font-mono">{kontakt.telefon}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Keine Notfallkontakte definiert</p>
        )}
      </div>

      {/* Sicherheitszonen */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Sicherheitszonen</h3>
        <SicherheitszonenEditor jagdId={jagd.id} />
      </div>
    </div>
  );
}
