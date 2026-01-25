'use client';

import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useRef, useState } from 'react';

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

interface Revier {
  id: string;
  name: string;
  coordinates: [number, number][];
  color?: string;
}

interface MapComponentProps {
  features: MapFeature[];
  reviere?: Revier[];
  onAddMarker?: (lat: number, lon: number) => void;
  onAddRevier?: (coordinates: [number, number][]) => void;
  drawingEnabled?: boolean;
  gpsEnabled?: boolean;
  currentLocation?: { lat: number; lon: number } | null;
}

// Custom Icons
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
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Current Location Icon
const createLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
        animation: pulse 2s infinite;
      "></div>
    `,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Auto-Zoom Component
function AutoZoom({ features, reviere }: { features: MapFeature[]; reviere?: Revier[] }) {
  const map = useMap();

  useEffect(() => {
    if (features.length > 0 || (reviere && reviere.length > 0)) {
      const bounds = L.latLngBounds([]);
      
      features.forEach((f) => bounds.extend([f.lat, f.lon]));
      
      if (reviere) {
        reviere.forEach((r) => {
          r.coordinates.forEach((coord) => bounds.extend(coord));
        });
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [features, reviere, map]);

  return null;
}

// Click Handler Component
function MapClickHandler({ onAddMarker }: { onAddMarker?: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      if (onAddMarker) {
        onAddMarker(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Drawing Control Component
function DrawingControl({ onAddRevier }: { onAddRevier?: (coordinates: [number, number][]) => void }) {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Import Leaflet Draw
    import('leaflet-draw').then(() => {
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            shapeOptions: {
              color: '#3b82f6',
              weight: 3,
            },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
        },
      });

      map.addControl(drawControl);

      // Listen for polygon creation
      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        if (e.layerType === 'polygon') {
          const coordinates = layer.getLatLngs()[0].map((latlng: L.LatLng) => [
            latlng.lat,
            latlng.lng,
          ]);
          if (onAddRevier) {
            onAddRevier(coordinates as [number, number][]);
          }
        }
      });

      return () => {
        map.removeControl(drawControl);
        map.removeLayer(drawnItems);
      };
    });
  }, [map, onAddRevier]);

  return null;
}

export default function MapComponent({
  features,
  reviere = [],
  onAddMarker,
  onAddRevier,
  drawingEnabled = false,
  gpsEnabled = false,
  currentLocation = null,
}: MapComponentProps) {
  return (
    <MapContainer
      center={currentLocation ? [currentLocation.lat, currentLocation.lon] : [51.1657, 10.4515]}
      zoom={13}
      style={{ height: '600px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Reviergrenzen (Polygone) */}
      {reviere.map((revier) => (
        <Polygon
          key={revier.id}
          positions={revier.coordinates}
          pathOptions={{
            color: revier.color || '#3b82f6',
            weight: 3,
            fillOpacity: 0.2,
          }}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold text-lg">{revier.name}</p>
              <p className="text-sm text-gray-600">
                Fläche: {((revier.coordinates.length * 0.1).toFixed(1))} ha
              </p>
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* Map Features (Marker) */}
      {features.map((feature) => (
        <Marker
          key={feature.id}
          position={[feature.lat, feature.lon]}
          icon={createCustomIcon(feature.type)}
        >
          <Popup>
            <div className="min-w-[200px]">
              <p className="font-bold text-lg mb-1">{feature.name}</p>
              <p className="text-sm text-gray-600">
                Typ:{' '}
                {feature.type === 'anschuss'
                  ? '🎯 Anschuss'
                  : feature.type === 'fundort'
                  ? '🟢 Fundort'
                  : feature.type === 'wildkamera'
                  ? '📷 Wildkamera'
                  : '📍 POI'}
              </p>
              {feature.timestamp && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(feature.timestamp).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                📍 {feature.lat.toFixed(5)}, {feature.lon.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Current Location Marker */}
      {gpsEnabled && currentLocation && (
        <Marker
          position={[currentLocation.lat, currentLocation.lon]}
          icon={createLocationIcon()}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold">📍 Dein Standort</p>
              <p className="text-xs text-gray-500 mt-1">
                {currentLocation.lat.toFixed(5)}, {currentLocation.lon.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Auto-Zoom */}
      <AutoZoom features={features} reviere={reviere} />

      {/* Click-to-Add Handler */}
      {onAddMarker && <MapClickHandler onAddMarker={onAddMarker} />}

      {/* Drawing Control für Reviergrenzen */}
      {drawingEnabled && onAddRevier && <DrawingControl onAddRevier={onAddRevier} />}
    </MapContainer>
  );
}
