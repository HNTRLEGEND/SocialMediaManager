'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JagdCard from '@/components/gesellschaftsjagd/JagdCard';
import type { Gesellschaftsjagd, JagdStatus } from '@/lib/types/gesellschaftsjagd';
import { JAGD_STATUS } from '@/lib/types/gesellschaftsjagd';
import { getAllGesellschaftsjagd } from '@/lib/services/gesellschaftsjagdService';
import { getJagdStatistik } from '@/lib/services/gesellschaftsjagdService';

export default function GesellschaftsjagdPage() {
  const router = useRouter();
  const [jagden, setJagden] = useState<Gesellschaftsjagd[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<JagdStatus[]>([]);
  const [stats, setStats] = useState<Record<string, { jaeger: number; treiber: number }>>({});

  useEffect(() => {
    loadJagden();
  }, [filterStatus]);

  const loadJagden = async () => {
    setLoading(true);
    try {
      const data = await getAllGesellschaftsjagd(
        filterStatus.length > 0 ? { status: filterStatus } : undefined
      );
      setJagden(data);

      // Load statistics for each jagd
      const statsData: Record<string, { jaeger: number; treiber: number }> = {};
      for (const jagd of data) {
        const stat = await getJagdStatistik(jagd.id);
        statsData[jagd.id] = {
          jaeger: stat.anzahl_jaeger,
          treiber: stat.anzahl_treiber,
        };
      }
      setStats(statsData);
    } catch (error) {
      console.error('Error loading jagden:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusFilter = (status: JagdStatus) => {
    setFilterStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const getStatusLabel = (status: JagdStatus): string => {
    const labels: Record<JagdStatus, string> = {
      planung: 'In Planung',
      geplant: 'Geplant',
      aktiv: 'Aktiv',
      abgeschlossen: 'Abgeschlossen',
      abgebrochen: 'Abgebrochen',
    };
    return labels[status];
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pt-28 md:pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                🎯 Gesellschaftsjagd
              </h1>
              <p className="text-gray-600 mt-1">
                Verwalten Sie Ihre gemeinschaftlichen Jagden
              </p>
            </div>
            <Link
              href="/gesellschaftsjagd/erstellen"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-center"
            >
              + Neue Jagd erstellen
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-3">Status Filter:</h3>
          <div className="flex flex-wrap gap-2">
            {JAGD_STATUS.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus.includes(status)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={filterStatus.includes(status)}
                  onChange={() => {}}
                  className="mr-2"
                />
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
          {filterStatus.length > 0 && (
            <button
              onClick={() => setFilterStatus([])}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Alle Filter entfernen
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Lade Jagden...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && jagden.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Keine Jagden gefunden
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus.length > 0
                ? 'Versuchen Sie, die Filter zu ändern'
                : 'Erstellen Sie Ihre erste Gesellschaftsjagd'}
            </p>
            {filterStatus.length === 0 && (
              <Link
                href="/gesellschaftsjagd/erstellen"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Jetzt erstellen
              </Link>
            )}
          </div>
        )}

        {/* Jagd Grid */}
        {!loading && jagden.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jagden.map((jagd) => (
              <JagdCard
                key={jagd.id}
                jagd={jagd}
                organisatorName="Organisator" // TODO: Load from user
                teilnehmerCounts={stats[jagd.id]}
              />
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && jagden.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Zusammenfassung</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{jagden.length}</div>
                <div className="text-sm text-gray-600">Gesamt</div>
              </div>
              {JAGD_STATUS.map((status) => {
                const count = jagden.filter((j) => j.status === status).length;
                if (count === 0) return null;
                return (
                  <div key={status} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{getStatusLabel(status)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
