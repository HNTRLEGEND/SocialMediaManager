import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix für Leaflet Icons in Next.js
const iconRetinaUrl = '/marker-icon-2x.png';
const iconUrl = '/marker-icon.png';
const shadowUrl = '/marker-shadow.png';

interface MapFeature {
  id: string;
  type: 'anschuss' | 'fundort' | 'wildkamera' | 'poi';
  name: string;
  lat: number;
  lon: number;
  timestamp?: string;
  details?: any;
}

interface MapComponentProps {
  features: MapFeature[];
}

// Custom Icons für verschiedene Marker-Typen
const createCustomIcon = (type: string, label?: string) => {
  const colors = {
    anschuss: '#ef4444',
    fundort: '#22c55e',
    wildkamera: '#a855f7',
    poi: '#3b82f6',
  };

  const html = `
    <div style="
      background: ${colors[type as keyof typeof colors]};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">
      ${label || (type === 'anschuss' ? 'A' : type === 'fundort' ? 'F' : type === 'wildkamera' ? '📷' : '📍')}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Komponente zum Auto-Zoom auf Features
function AutoZoom({ features }: { features: MapFeature[] }) {
  const map = useMap();

  useEffect(() => {
    if (features.length > 0) {
      const bounds = L.latLngBounds(
        features.map(f => [f.lat, f.lon] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [features, map]);

  return null;
}

export default function MapComponent({ features }: MapComponentProps) {
  // Zentrum von Deutschland als Fallback
  const defaultCenter: [number, number] = [51.1657, 10.4515];
  const defaultZoom = 13;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '600px', width: '100%' }}
      className="z-0"
    >
      {/* OpenStreetMap Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Auto-Zoom wenn Features vorhanden */}
      {features.length > 0 && <AutoZoom features={features} />}

      {/* Marker für alle Features */}
      {features.map((feature) => (
        <Marker
          key={feature.id}
          position={[feature.lat, feature.lon]}
          icon={createCustomIcon(feature.type)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg mb-1">{feature.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Typ: {
                  feature.type === 'anschuss' ? '🔴 Anschuss' :
                  feature.type === 'fundort' ? '🟢 Fundort' :
                  feature.type === 'wildkamera' ? '📷 Wildkamera' :
                  '📍 POI'
                }
              </p>
              {feature.timestamp && (
                <p className="text-sm text-gray-600">
                  📅 {new Date(feature.timestamp).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-500">
                  📍 {feature.lat.toFixed(5)}, {feature.lon.toFixed(5)}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
