'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { auth } from '@/lib/api';
import { initDatabase, now } from '@/lib/database';
import { queueSync } from '@/lib/sync';
import { getEnhancedWeather } from '@/lib/services/weatherService';
import { EnhancedWeather, WeatherLayerConfig } from '@/lib/types/weather';
import WeatherPanel from '@/components/weather/WeatherPanel';
import WeatherOverlay from '@/components/weather/WeatherOverlay';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">🗺️ Karte lädt...</div>,
});

interface MapFeature {
  id: string;
  type: 'anschuss' | 'fundort' | 'wildkamera' | 'poi';
  name: string;
  lat: number;
  lon: number;
  timestamp?: string;
  details?: any;
  revier_id?: string | null;
}

interface Revier {
  id: string;
  name: string;
  coordinates: [number, number][];
  color?: string;
}

export default function MapPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [reviere, setReviere] = useState<Revier[]>([]);
  const [allReviere, setAllReviere] = useState<any[]>([]); // For dropdown
  const [selectedRevierId, setSelectedRevierId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [drawingMode, setDrawingMode] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [addMarkerType, setAddMarkerType] = useState<'anschuss' | 'fundort' | 'wildkamera' | 'poi'>('anschuss');
  const [clickToAddMode, setClickToAddMode] = useState(false);

  // Weather State
  const [weather, setWeather] = useState<EnhancedWeather | null>(null);
  const [showWeather, setShowWeather] = useState(true);
  const [weatherLocation, setWeatherLocation] = useState({ lat: 50.9375, lon: 6.9603 }); // Default: Deutschland Mitte
  const [weatherConfig, setWeatherConfig] = useState<WeatherLayerConfig>({
    wind: { 
      enabled: true, 
      animated: true, 
      particleCount: 100, 
      vectorDensity: 1, 
      opacity: 0.7 
    },
    clouds: { 
      enabled: true, 
      showRadar: false, 
      radarOpacity: 0.3, 
      showCloudLayers: false 
    },
    precipitation: { 
      enabled: true, 
      showIntensity: true, 
      showWarnings: true 
    },
    scentCarry: { 
      enabled: true, 
      showRange: true 
    },
  });

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadMapData(currentUser);

    // Check for Revier URL parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const revierParam = params.get('revier');
      if (revierParam) {
        setSelectedRevierId(revierParam);
      }
    }
  }, [router]);

  // Load weather data
  useEffect(() => {
    const loadWeather = async () => {
      // Use weather location (can be updated based on map center or GPS)
      const weatherData = await getEnhancedWeather(weatherLocation.lat, weatherLocation.lon);
      setWeather(weatherData);
    };

    loadWeather();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadWeather, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [weatherLocation]);

  const loadMapData = async (user: any) => {
    setLoading(true);
    try {
      const db = await initDatabase();

      // Load all Reviere for dropdown
      const reviereListResult = db.exec(
        `SELECT id, name FROM reviere WHERE user_id = ? AND geloescht_am IS NULL ORDER BY name`,
        [user.id]
      );
      if (reviereListResult.length > 0 && reviereListResult[0].values.length > 0) {
        const reviereList = reviereListResult[0].values.map((row) => ({
          id: row[0] as string,
          name: row[1] as string,
        }));
        setAllReviere(reviereList);
      }

      // Load Map Features
      const featuresResult = db.exec(
        `SELECT id, type, name, latitude, longitude, erstellt_am, details, revier_id
         FROM map_features
         WHERE user_id = ? AND geloescht_am IS NULL
         ORDER BY erstellt_am DESC`,
        [user.id]
      );

      if (featuresResult.length > 0 && featuresResult[0].values.length > 0) {
        const loadedFeatures = featuresResult[0].values.map((row) => ({
          id: row[0] as string,
          type: row[1] as 'anschuss' | 'fundort' | 'wildkamera' | 'poi',
          name: row[2] as string,
          lat: Number(row[3]),
          lon: Number(row[4]),
          timestamp: row[5] as string,
          details: row[6] ? JSON.parse(row[6] as string) : {},
          revier_id: row[7] as string | null,
        }));
        setFeatures(loadedFeatures);
      } else {
        // Mock data if empty
        setFeatures([
          {
            id: '1',
            type: 'anschuss',
            name: 'Rehbock - Hochsitz 3',
            lat: 51.1657,
            lon: 10.4515,
            timestamp: now(),
          },
          {
            id: '2',
            type: 'fundort',
            name: 'Fundort Rehbock',
            lat: 51.1667,
            lon: 10.4525,
            timestamp: now(),
          },
          {
            id: '3',
            type: 'wildkamera',
            name: 'Wildkamera 1 - Kirrung',
            lat: 51.1647,
            lon: 10.4505,
            timestamp: now(),
          },
          {
            id: '4',
            type: 'wildkamera',
            name: 'Wildkamera 2 - Wechsel',
            lat: 51.1677,
            lon: 10.4535,
            timestamp: now(),
          },
          {
            id: '5',
            type: 'poi',
            name: 'Ansitz 1',
            lat: 51.1637,
            lon: 10.4495,
            timestamp: now(),
          },
        ]);
      }

      // Load Reviere (hunting territories)
      const revierResult = db.exec(
        `SELECT id, name, grenzen_geojson, farbe
         FROM reviere
         WHERE user_id = ? AND geloescht_am IS NULL`,
        [user.id]
      );

      if (revierResult.length > 0 && revierResult[0].values.length > 0) {
        const loadedReviere = revierResult[0].values.map((row) => {
          let coordinates: [number, number][] = [];
          try {
            const geojson = JSON.parse(row[2] as string);
            if (geojson && geojson.coordinates && geojson.coordinates.length > 0) {
              coordinates = geojson.coordinates[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
            }
          } catch (e) {
            console.error('Error parsing GeoJSON:', e);
          }

          return {
            id: row[0] as string,
            name: row[1] as string,
            coordinates,
            color: (row[3] as string) || '#3b82f6',
          };
        });
        setReviere(loadedReviere);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableGPS = () => {
    if (!navigator.geolocation) {
      alert('❌ GPS nicht verfügbar in diesem Browser!');
      return;
    }

    setGpsEnabled(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        alert(`✅ Standort gefunden!\n\n📍 ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
      },
      (error) => {
        console.error('GPS error:', error);
        alert('❌ Standort konnte nicht ermittelt werden!');
        setGpsEnabled(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Watch position for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => console.error('GPS watch error:', error),
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  const handleAddMarker = async (lat: number, lon: number) => {
    if (!clickToAddMode || !user) return;

    const name = prompt(`📍 Name für ${addMarkerType}:`, 
      addMarkerType === 'anschuss' ? 'Anschuss' :
      addMarkerType === 'fundort' ? 'Fundort' :
      addMarkerType === 'wildkamera' ? 'Wildkamera' :
      'POI'
    );

    if (!name) return;

    try {
      const db = await initDatabase();
      const id = crypto.randomUUID();
      const timestamp = now();

      db.run(
        `INSERT INTO map_features (
          id, user_id, revier_id, type, name, latitude, longitude,
          erstellt_am, geaendert_am
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          user.id,
          null, // TODO: Get current revier
          addMarkerType,
          name,
          lat,
          lon,
          timestamp,
          timestamp,
        ]
      );

      await queueSync('map_features', id, 'INSERT');

      // Add to state
      setFeatures([
        ...features,
        {
          id,
          type: addMarkerType,
          name,
          lat,
          lon,
          timestamp,
        },
      ]);

      alert(`✅ Marker hinzugefügt!\n\n📍 ${name}\n📊 Typ: ${addMarkerType}\n📍 ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      setClickToAddMode(false);
    } catch (error) {
      console.error('Error adding marker:', error);
      alert('❌ Fehler beim Hinzufügen!');
    }
  };

  const handleAddRevier = async (coordinates: [number, number][]) => {
    if (!user) return;

    const name = prompt('📍 Name für Revier:', 'Mein Revier');
    if (!name) return;

    try {
      const db = await initDatabase();
      const id = crypto.randomUUID();
      const timestamp = now();

      // Convert to GeoJSON format
      const geojson = {
        type: 'Polygon',
        coordinates: [coordinates.map((coord) => [coord[1], coord[0]])],
      };

      db.run(
        `INSERT INTO reviere (
          id, user_id, name, grenzen_geojson, farbe,
          erstellt_am, geaendert_am
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          user.id,
          name,
          JSON.stringify(geojson),
          '#3b82f6',
          timestamp,
          timestamp,
        ]
      );

      await queueSync('reviere', id, 'INSERT');

      // Add to state
      setReviere([
        ...reviere,
        {
          id,
          name,
          coordinates,
          color: '#3b82f6',
        },
      ]);

      alert(`✅ Revier hinzugefügt!\n\n📍 ${name}\n🗺️ ${coordinates.length} Punkte`);
      setDrawingMode(false);
    } catch (error) {
      console.error('Error adding revier:', error);
      alert('❌ Fehler beim Hinzufügen!');
    }
  };

  const handleWeatherRefresh = async () => {
    const weatherData = await getEnhancedWeather(weatherLocation.lat, weatherLocation.lon, true);
    setWeather(weatherData);
  };

  // Apply both filters: Revier and Type
  const filteredFeatures = features.filter((f) => {
    // Filter by Revier if selected
    const matchesRevier = selectedRevierId ? f.revier_id === selectedRevierId : true;
    // Filter by Type
    const matchesType = filterType === 'all' ? true : f.type === filterType;
    return matchesRevier && matchesType;
  });

  // Filter Reviere polygons by selected Revier
  const filteredReviere = selectedRevierId
    ? reviere.filter((r) => r.id === selectedRevierId)
    : reviere;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-xl font-semibold">Lade Karte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">🗺️ Revierkarte</h1>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Revier Filter Dropdown */}
          <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
            <label className="font-semibold">🏞️ Revier:</label>
            <select
              value={selectedRevierId || ''}
              onChange={(e) => setSelectedRevierId(e.target.value || null)}
              className="border border-gray-300 px-3 py-2 rounded hover:bg-gray-50"
            >
              <option value="">Alle Reviere</option>
              {allReviere.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🗺️ Alle ({filteredFeatures.length})
            </button>
            <button
              onClick={() => setFilterType('anschuss')}
              className={`px-4 py-2 rounded ${
                filterType === 'anschuss'
                  ? 'bg-red-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🎯 Anschuss ({filteredFeatures.filter((f) => f.type === 'anschuss').length})
            </button>
            <button
              onClick={() => setFilterType('fundort')}
              className={`px-4 py-2 rounded ${
                filterType === 'fundort'
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🟢 Fundort ({filteredFeatures.filter((f) => f.type === 'fundort').length})
            </button>
            <button
              onClick={() => setFilterType('wildkamera')}
              className={`px-4 py-2 rounded ${
                filterType === 'wildkamera'
                  ? 'bg-purple-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📷 Kameras ({filteredFeatures.filter((f) => f.type === 'wildkamera').length})
            </button>
            <button
              onClick={() => setFilterType('poi')}
              className={`px-4 py-2 rounded ${
                filterType === 'poi'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📍 POIs ({filteredFeatures.filter((f) => f.type === 'poi').length})
            </button>
          </div>

          <div className="border-l border-gray-300 pl-4 flex gap-2">
            {/* GPS Button */}
            <button
              onClick={enableGPS}
              className={`px-4 py-2 rounded ${
                gpsEnabled
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {gpsEnabled ? '📍 GPS Aktiv' : '📍 GPS Aktivieren'}
            </button>

            {/* Drawing Mode */}
            <button
              onClick={() => setDrawingMode(!drawingMode)}
              className={`px-4 py-2 rounded ${
                drawingMode
                  ? 'bg-purple-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {drawingMode ? '🖊️ Zeichnen aktiv' : '🖊️ Revier zeichnen'}
            </button>

            {/* Click-to-Add Dropdown */}
            <div className="relative">
              <button
                onClick={() => setClickToAddMode(!clickToAddMode)}
                className={`px-4 py-2 rounded ${
                  clickToAddMode
                    ? 'bg-orange-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {clickToAddMode ? `✏️ Klick-Modus: ${addMarkerType}` : '➕ Marker hinzufügen'}
              </button>
              {clickToAddMode && (
                <div className="absolute top-full mt-2 bg-white border rounded shadow-lg z-10 min-w-[200px]">
                  <button
                    onClick={() => setAddMarkerType('anschuss')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    🎯 Anschuss
                  </button>
                  <button
                    onClick={() => setAddMarkerType('fundort')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    🟢 Fundort
                  </button>
                  <button
                    onClick={() => setAddMarkerType('wildkamera')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    📷 Wildkamera
                  </button>
                  <button
                    onClick={() => setAddMarkerType('poi')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    📍 POI
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {clickToAddMode && (
          <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-600 rounded">
            <p className="font-semibold">✏️ Klick-Modus aktiv</p>
            <p className="text-sm text-gray-700">
              Klicke auf die Karte, um einen <strong>{addMarkerType}</strong> Marker hinzuzufügen.
            </p>
          </div>
        )}

        {drawingMode && (
          <div className="mt-4 p-3 bg-purple-50 border-l-4 border-purple-600 rounded">
            <p className="font-semibold">🖊️ Zeichnen-Modus aktiv</p>
            <p className="text-sm text-gray-700">
              Verwende die Zeichenwerkzeuge in der Karte, um Reviergrenzen zu zeichnen.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 card p-0 overflow-hidden relative">
          <MapComponent
            features={filteredFeatures}
            reviere={filteredReviere}
            onAddMarker={clickToAddMode ? handleAddMarker : undefined}
            onAddRevier={drawingMode ? handleAddRevier : undefined}
            drawingEnabled={drawingMode}
            gpsEnabled={gpsEnabled}
            currentLocation={currentLocation}
          />
          
          {/* Weather Overlay */}
          <WeatherOverlay 
            weather={weather}
            config={weatherConfig}
            visible={showWeather}
          />

          {/* Weather Toggle */}
          <button
            onClick={() => setShowWeather(!showWeather)}
            className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50"
            title="Wetter-Overlay ein/ausschalten"
          >
            {showWeather ? '🌦️' : '🌤️'}
          </button>

          {/* Layer Config Panel */}
          <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
            <h4 className="text-sm font-bold mb-2">Wetter-Layer</h4>
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={weatherConfig.wind.enabled}
                onChange={(e) => setWeatherConfig({
                  ...weatherConfig,
                  wind: { ...weatherConfig.wind, enabled: e.target.checked }
                })}
              />
              Windanimation
            </label>
            
            <label className="flex items-center gap-2 text-sm mt-2">
              <input 
                type="checkbox" 
                checked={weatherConfig.scentCarry.enabled}
                onChange={(e) => setWeatherConfig({
                  ...weatherConfig,
                  scentCarry: { ...weatherConfig.scentCarry, enabled: e.target.checked }
                })}
              />
              Duftverlauf
            </label>
            
            <label className="flex items-center gap-2 text-sm mt-2">
              <input 
                type="checkbox" 
                checked={weatherConfig.precipitation.showWarnings}
                onChange={(e) => setWeatherConfig({
                  ...weatherConfig,
                  precipitation: { ...weatherConfig.precipitation, showWarnings: e.target.checked }
                })}
              />
              Unwetter-Warnungen
            </label>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Panel */}
          <WeatherPanel 
            weather={weather}
            onRefresh={handleWeatherRefresh}
          />

          {/* Legend */}
          <div className="card">
            <h2 className="text-xl font-bold mb-3">📋 Legende</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span className="text-sm">Anschuss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <span className="text-sm">Fundort</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                <span className="text-sm">Wildkamera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-sm">POI / Ansitz</span>
              </div>
              {reviere.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 bg-opacity-30"></div>
                  <span className="text-sm">Reviergrenzen</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviere List */}
          {reviere.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-3">🗺️ Reviere ({reviere.length})</h2>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {reviere.map((revier) => (
                  <div key={revier.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
                    <p className="font-semibold">{revier.name}</p>
                    <p className="text-xs text-gray-600">
                      {revier.coordinates.length} Punkte
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Features */}
          <div className="card">
            <h2 className="text-xl font-bold mb-3">📍 Letzte Einträge</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {features.slice(0, 10).map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background:
                        feature.type === 'anschuss'
                          ? '#ef4444'
                          : feature.type === 'fundort'
                          ? '#22c55e'
                          : feature.type === 'wildkamera'
                          ? '#a855f7'
                          : '#3b82f6',
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{feature.name}</p>
                    {feature.timestamp && (
                      <p className="text-xs text-gray-500">
                        {new Date(feature.timestamp).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
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
    </div>
  );
}
