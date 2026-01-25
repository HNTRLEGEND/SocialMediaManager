'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { auth } from '@/lib/api';

// Dynamic import für Leaflet (SSR-Problem vermeiden)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">🗺️ Karte lädt...</p>
    </div>
  ),
});

interface MapFeature {
  id: string;
  type: 'anschuss' | 'fundort' | 'wildkamera' | 'poi';
  name: string;
  lat: number;
  lon: number;
  timestamp?: string;
  details?: any;
}

export default function MapPage() {
  const [user, setUser] = useState<any>(null);
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    
    loadMapFeatures();
  }, []);

  const loadMapFeatures = async () => {
    // Mock-Daten - später aus API
    const mockFeatures: MapFeature[] = [
      {
        id: '1',
        type: 'anschuss',
        name: 'Rehbock - Hochsitz 3',
        lat: 51.1657,
        lon: 10.4515,
        timestamp: '2026-01-23T08:30:00Z',
      },
      {
        id: '2',
        type: 'fundort',
        name: 'Fundort Rehbock',
        lat: 51.1667,
        lon: 10.4525,
        timestamp: '2026-01-23T09:15:00Z',
      },
      {
        id: '3',
        type: 'wildkamera',
        name: 'Wildkamera 1 - Kirrung',
        lat: 51.1647,
        lon: 10.4505,
      },
      {
        id: '4',
        type: 'wildkamera',
        name: 'Wildkamera 2 - Wechsel',
        lat: 51.1677,
        lon: 10.4535,
      },
      {
        id: '5',
        type: 'poi',
        name: 'Ansitz 1',
        lat: 51.1637,
        lon: 10.4495,
      },
    ];

    setFeatures(mockFeatures);
  };

  const filteredFeatures = selectedType === 'all' 
    ? features 
    : features.filter(f => f.type === selectedType);

  const handleAddMarker = (type: string) => {
    console.log('Add marker:', type);
    setShowAddMenu(false);
    // TODO: GPS-Position abrufen und Marker hinzufügen
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">🗺️ Interaktive Karte</h1>
          <p className="text-gray-600 mt-1">Anschüsse, Fundorte und Wildkameras</p>
        </div>
        
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="btn-primary"
            >
              ➕ Marker hinzufügen
            </button>
            
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={() => handleAddMarker('anschuss')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b"
                >
                  🔴 Anschuss markieren
                </button>
                <button
                  onClick={() => handleAddMarker('fundort')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b"
                >
                  🟢 Fundort markieren
                </button>
                <button
                  onClick={() => handleAddMarker('wildkamera')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b"
                >
                  📷 Wildkamera setzen
                </button>
                <button
                  onClick={() => handleAddMarker('poi')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50"
                >
                  📍 POI hinzufügen
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded ${
              selectedType === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🌐 Alle ({features.length})
          </button>
          <button
            onClick={() => setSelectedType('anschuss')}
            className={`px-4 py-2 rounded ${
              selectedType === 'anschuss'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🔴 Anschüsse ({features.filter(f => f.type === 'anschuss').length})
          </button>
          <button
            onClick={() => setSelectedType('fundort')}
            className={`px-4 py-2 rounded ${
              selectedType === 'fundort'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🟢 Fundorte ({features.filter(f => f.type === 'fundort').length})
          </button>
          <button
            onClick={() => setSelectedType('wildkamera')}
            className={`px-4 py-2 rounded ${
              selectedType === 'wildkamera'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📷 Wildkameras ({features.filter(f => f.type === 'wildkamera').length})
          </button>
          <button
            onClick={() => setSelectedType('poi')}
            className={`px-4 py-2 rounded ${
              selectedType === 'poi'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📍 POIs ({features.filter(f => f.type === 'poi').length})
          </button>
        </div>
      </div>

      {/* Karte */}
      <div className="card p-0 overflow-hidden">
        <MapComponent features={filteredFeatures} />
      </div>

      {/* Legende & Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">📋 Legende</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <p className="font-semibold">Anschuss-Punkt</p>
                <p className="text-sm text-gray-600">Ort des Schusses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                F
              </div>
              <div>
                <p className="font-semibold">Fundort</p>
                <p className="text-sm text-gray-600">Wild aufgefunden</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                📷
              </div>
              <div>
                <p className="font-semibold">Wildkamera</p>
                <p className="text-sm text-gray-600">Aktive Wildkamera</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                📍
              </div>
              <div>
                <p className="font-semibold">POI</p>
                <p className="text-sm text-gray-600">Ansitz, Hochsitz, etc.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">🕐 Letzte Einträge</h3>
          <div className="space-y-3">
            {filteredFeatures.slice(0, 5).map((feature) => (
              <div
                key={feature.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              >
                <div className={`w-3 h-3 rounded-full ${
                  feature.type === 'anschuss' ? 'bg-red-500' :
                  feature.type === 'fundort' ? 'bg-green-500' :
                  feature.type === 'wildkamera' ? 'bg-purple-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-semibold">{feature.name}</p>
                  {feature.timestamp && (
                    <p className="text-sm text-gray-600">
                      {new Date(feature.timestamp).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
