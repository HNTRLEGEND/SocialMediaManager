'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Standort, Teilnehmer, StandortTyp } from '@/lib/types/gesellschaftsjagd';
import { 
  STANDORT_TYPEN, 
  getStandortTypLabel,
  getRolleLabel,
} from '@/lib/types/gesellschaftsjagd';
import {
  getStandorte,
  addStandort,
  deleteStandort,
  assignJaeger,
  getTeilnehmer,
} from '@/lib/services/gesellschaftsjagdService';

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface StandortManagerProps {
  jagdId: string;
}

export default function StandortManager({ jagdId }: StandortManagerProps) {
  const [standorte, setStandorte] = useState<Standort[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    typ: 'hochsitz' as StandortTyp,
    beschreibung: '',
  });

  useEffect(() => {
    loadData();
  }, [jagdId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [standorteData, teilnehmerData] = await Promise.all([
        getStandorte(jagdId),
        getTeilnehmer(jagdId),
      ]);
      setStandorte(standorteData);
      setTeilnehmer(teilnehmerData.filter(t => t.rolle === 'jaeger'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lon: number) => {
    setSelectedPosition([lat, lon]);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPosition) {
      alert('Bitte wählen Sie eine Position auf der Karte');
      return;
    }

    try {
      await addStandort({
        jagd_id: jagdId,
        typ: formData.typ,
        name: formData.name,
        beschreibung: formData.beschreibung,
        gps_lat: selectedPosition[0],
        gps_lon: selectedPosition[1],
        zuweisungs_bestaetigt: false,
      });

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error adding standort:', error);
      alert('Fehler beim Hinzufügen');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Standort wirklich löschen?')) return;

    try {
      await deleteStandort(id);
      loadData();
    } catch (error) {
      console.error('Error deleting standort:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleAssignJaeger = async (standortId: string, jaegerId: string | null) => {
    try {
      await assignJaeger(standortId, jaegerId);
      loadData();
    } catch (error) {
      console.error('Error assigning jaeger:', error);
      alert('Fehler bei der Zuweisung');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      typ: 'hochsitz',
      beschreibung: '',
    });
    setSelectedPosition(null);
    setShowForm(false);
  };

  // Default center (Germany)
  const defaultCenter: [number, number] = [51.1657, 10.4515];
  const center = standorte.length > 0
    ? [standorte[0].gps_lat, standorte[0].gps_lon] as [number, number]
    : defaultCenter;

  if (loading) {
    return <div className="text-center py-8">Lade Standorte...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Standorte ({standorte.length})</h3>
        <div className="text-sm text-gray-600">
          Klicken Sie auf die Karte, um einen neuen Standort hinzuzufügen
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onClick={handleMapClick} />

          {/* Render standorte markers */}
          {standorte.map((standort) => {
            // Determine marker color based on assignment
            const isAssigned = !!standort.zugewiesener_jaeger_id;
            const assignedJaeger = teilnehmer.find(t => t.id === standort.zugewiesener_jaeger_id);

            return (
              <Marker
                key={standort.id}
                position={[standort.gps_lat, standort.gps_lon]}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold">{standort.name}</h4>
                    <p className="text-sm text-gray-600">{getStandortTypLabel(standort.typ)}</p>
                    {standort.beschreibung && (
                      <p className="text-sm mt-1">{standort.beschreibung}</p>
                    )}
                    {isAssigned && assignedJaeger && (
                      <p className="text-sm mt-1">
                        <span className="text-green-600">✓</span> Zugewiesen an: {assignedJaeger.name}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Selected position marker */}
          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>Neuer Standort</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border space-y-3">
          <h4 className="font-semibold">Neuer Standort</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="z.B. Hochsitz 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Typ</label>
              <select
                value={formData.typ}
                onChange={(e) => setFormData({ ...formData, typ: e.target.value as StandortTyp })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {STANDORT_TYPEN.map((typ) => (
                  <option key={typ} value={typ}>
                    {getStandortTypLabel(typ)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={formData.beschreibung}
              onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
            />
          </div>

          <div className="text-sm text-gray-600">
            Position: {selectedPosition?.[0].toFixed(6)}, {selectedPosition?.[1].toFixed(6)}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Hinzufügen
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Standort List */}
      <div className="space-y-2">
        <h4 className="font-semibold">Standorte verwalten</h4>
        
        {standorte.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Keine Standorte vorhanden. Klicken Sie auf die Karte, um einen hinzuzufügen.
          </p>
        ) : (
          <div className="space-y-2">
            {standorte.map((standort) => {
              const assignedJaeger = teilnehmer.find(t => t.id === standort.zugewiesener_jaeger_id);

              return (
                <div key={standort.id} className="bg-white border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold">{standort.name}</h5>
                      <p className="text-sm text-gray-600">{getStandortTypLabel(standort.typ)}</p>
                      {standort.beschreibung && (
                        <p className="text-sm text-gray-500 mt-1">{standort.beschreibung}</p>
                      )}
                      
                      {/* Jäger Assignment */}
                      <div className="mt-2">
                        <label className="text-sm font-medium mr-2">Jäger zuweisen:</label>
                        <select
                          value={standort.zugewiesener_jaeger_id || ''}
                          onChange={(e) => handleAssignJaeger(standort.id, e.target.value || null)}
                          className="text-sm px-2 py-1 border rounded"
                        >
                          <option value="">Nicht zugewiesen</option>
                          {teilnehmer.map((jaeger) => (
                            <option key={jaeger.id} value={jaeger.id}>
                              {jaeger.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {assignedJaeger && (
                        <div className="mt-1 text-sm text-green-600">
                          ✓ Zugewiesen an: {assignedJaeger.name}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(standort.id)}
                      className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for map events to avoid conditional hooks
function MapClickHandlerInner({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  const { useMapEvents } = require('react-leaflet');
  
  useMapEvents({
    click(e: any) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return null;
}

// Map click handler component with SSR check
function MapClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  if (typeof window === 'undefined') return null;
  return <MapClickHandlerInner onClick={onClick} />;
}
