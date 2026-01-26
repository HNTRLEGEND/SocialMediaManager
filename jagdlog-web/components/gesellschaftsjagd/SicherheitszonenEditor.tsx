'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Sicherheitszone, SicherheitszoneTyp, GPSKoordinaten } from '@/lib/types/gesellschaftsjagd';
import { 
  SICHERHEITSZONE_TYPEN,
} from '@/lib/types/gesellschaftsjagd';
import {
  getSicherheitszonen,
  addSicherheitszone,
  deleteSicherheitszone,
} from '@/lib/services/gesellschaftsjagdService';

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface SicherheitszonenEditorProps {
  jagdId: string;
}

export default function SicherheitszonenEditor({ jagdId }: SicherheitszonenEditorProps) {
  const [zonen, setZonen] = useState<Sicherheitszone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<GPSKoordinaten[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    typ: 'gefahrenzone' as SicherheitszoneTyp,
    beschreibung: '',
    farbe: '#FF0000',
  });

  useEffect(() => {
    loadZonen();
  }, [jagdId]);

  const loadZonen = async () => {
    setLoading(true);
    try {
      const data = await getSicherheitszonen(jagdId);
      setZonen(data);
    } catch (error) {
      console.error('Error loading sicherheitszonen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lon: number) => {
    if (showForm) {
      setDrawingPoints([...drawingPoints, { lat, lon }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (drawingPoints.length < 3) {
      alert('Bitte markieren Sie mindestens 3 Punkte auf der Karte für die Zone');
      return;
    }

    try {
      await addSicherheitszone({
        jagd_id: jagdId,
        ...formData,
        polygon_koordinaten: JSON.stringify(drawingPoints),
      });

      resetForm();
      loadZonen();
    } catch (error) {
      console.error('Error adding sicherheitszone:', error);
      alert('Fehler beim Hinzufügen');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sicherheitszone wirklich löschen?')) return;

    try {
      await deleteSicherheitszone(id);
      loadZonen();
    } catch (error) {
      console.error('Error deleting sicherheitszone:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleClearDrawing = () => {
    setDrawingPoints([]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      typ: 'gefahrenzone',
      beschreibung: '',
      farbe: '#FF0000',
    });
    setDrawingPoints([]);
    setShowForm(false);
  };

  const getZoneTypeLabel = (typ: SicherheitszoneTyp): string => {
    const labels: Record<SicherheitszoneTyp, string> = {
      gefahrenzone: 'Gefahrenzone',
      verbotszone: 'Verbotszone',
      sperrgebiet: 'Sperrgebiet',
      nachbarrevier: 'Nachbarrevier',
    };
    return labels[typ];
  };

  // Default center
  const defaultCenter: [number, number] = [51.1657, 10.4515];

  if (loading) {
    return <div className="text-center py-8">Lade Sicherheitszonen...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Sicherheitszonen ({zonen.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showForm ? 'Abbrechen' : '+ Zone hinzufügen'}
        </button>
      </div>

      {/* Instructions */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
          <strong>Anleitung:</strong> Klicken Sie auf die Karte, um die Eckpunkte der Sicherheitszone zu markieren. 
          Mindestens 3 Punkte erforderlich.
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onClick={handleMapClick} />

          {/* Render existing zones */}
          {zonen.map((zone) => {
            const coords: GPSKoordinaten[] = JSON.parse(zone.polygon_koordinaten);
            const positions: [number, number][] = coords.map((c) => [c.lat, c.lon]);

            return (
              <Polygon
                key={zone.id}
                positions={positions}
                pathOptions={{
                  color: zone.farbe,
                  fillColor: zone.farbe,
                  fillOpacity: 0.3,
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold">{zone.name}</h4>
                    <p className="text-sm text-gray-600">{getZoneTypeLabel(zone.typ)}</p>
                    {zone.beschreibung && (
                      <p className="text-sm mt-1">{zone.beschreibung}</p>
                    )}
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Show drawing in progress */}
          {drawingPoints.length > 0 && (
            <Polygon
              positions={drawingPoints.map((p) => [p.lat, p.lon])}
              pathOptions={{
                color: formData.farbe,
                fillColor: formData.farbe,
                fillOpacity: 0.3,
                dashArray: '5, 5',
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border space-y-3">
          <h4 className="font-semibold">Neue Sicherheitszone</h4>

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
                placeholder="z.B. Straße A38"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Typ</label>
              <select
                value={formData.typ}
                onChange={(e) => setFormData({ ...formData, typ: e.target.value as SicherheitszoneTyp })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {SICHERHEITSZONE_TYPEN.map((typ) => (
                  <option key={typ} value={typ}>
                    {getZoneTypeLabel(typ)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Farbe</label>
              <input
                type="color"
                value={formData.farbe}
                onChange={(e) => setFormData({ ...formData, farbe: e.target.value })}
                className="w-full h-10 px-1 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Punkte: {drawingPoints.length}</label>
              <button
                type="button"
                onClick={handleClearDrawing}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition text-sm"
              >
                Zeichnung zurücksetzen
              </button>
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

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Zone hinzufügen
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

      {/* Zone List */}
      <div className="space-y-2">
        <h4 className="font-semibold">Sicherheitszonen</h4>

        {zonen.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Keine Sicherheitszonen definiert
          </p>
        ) : (
          <div className="space-y-2">
            {zonen.map((zone) => {
              const coords: GPSKoordinaten[] = JSON.parse(zone.polygon_koordinaten);

              return (
                <div key={zone.id} className="bg-white border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: zone.farbe }}
                        />
                        <h5 className="font-semibold">{zone.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600">{getZoneTypeLabel(zone.typ)}</p>
                      {zone.beschreibung && (
                        <p className="text-sm text-gray-500 mt-1">{zone.beschreibung}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {coords.length} Punkte
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(zone.id)}
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

// Map click handler with SSR check
function MapClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  if (typeof window === 'undefined') return null;
  return <MapClickHandlerInner onClick={onClick} />;
}
