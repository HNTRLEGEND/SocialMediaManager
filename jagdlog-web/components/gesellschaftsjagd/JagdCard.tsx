'use client';

import { useRouter } from 'next/navigation';
import type { Gesellschaftsjagd } from '@/lib/types/gesellschaftsjagd';
import { getStatusColor, getStatusLabel, getJagdTypLabel } from '@/lib/types/gesellschaftsjagd';

interface JagdCardProps {
  jagd: Gesellschaftsjagd;
  organisatorName?: string;
  teilnehmerCounts?: {
    jaeger: number;
    treiber: number;
  };
}

export default function JagdCard({ jagd, organisatorName, teilnehmerCounts }: JagdCardProps) {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:mm
  };

  return (
    <div
      onClick={() => router.push(`/gesellschaftsjagd/${jagd.id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-gray-200 overflow-hidden"
    >
      {/* Header with Status */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{jagd.name}</h3>
            <p className="text-sm text-gray-600">{getJagdTypLabel(jagd.jagd_typ)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(jagd.status)}`}>
            {getStatusLabel(jagd.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Description */}
        {jagd.beschreibung && (
          <p className="text-sm text-gray-600 line-clamp-2">{jagd.beschreibung}</p>
        )}

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xl">📅</span>
          <div>
            <div className="font-medium text-gray-900">{formatDate(jagd.datum)}</div>
            <div className="text-gray-600">
              {formatTime(jagd.start_zeit)} - {formatTime(jagd.end_zeit)} Uhr
            </div>
          </div>
        </div>

        {/* Organisator */}
        {organisatorName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-lg">👤</span>
            <span>Organisator: <span className="font-medium">{organisatorName}</span></span>
          </div>
        )}

        {/* Participant Counts */}
        <div className="flex gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                {teilnehmerCounts?.jaeger || 0} / {jagd.erwartete_jaeger}
              </div>
              <div className="text-gray-600">Jäger</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                {teilnehmerCounts?.treiber || 0} / {jagd.erwartete_treiber}
              </div>
              <div className="text-gray-600">Treiber</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
