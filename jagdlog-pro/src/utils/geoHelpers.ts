/**
 * HNTR LEGEND Pro - Geo/Karten-Hilfsfunktionen
 */

import { GPSKoordinaten } from '../types';

/**
 * Berechnet die Distanz zwischen zwei GPS-Punkten in Metern
 * Verwendet die Haversine-Formel
 */
export const berechneDistanzMeter = (punkt1: GPSKoordinaten, punkt2: GPSKoordinaten): number => {
  const R = 6371e3; // Erdradius in Metern

  const lat1Rad = (punkt1.latitude * Math.PI) / 180;
  const lat2Rad = (punkt2.latitude * Math.PI) / 180;
  const deltaLat = ((punkt2.latitude - punkt1.latitude) * Math.PI) / 180;
  const deltaLon = ((punkt2.longitude - punkt1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Formatiert eine Distanz für die Anzeige
 */
export const formatiereDistanz = (meter: number): string => {
  if (meter < 1000) {
    return `${Math.round(meter)} m`;
  }
  return `${(meter / 1000).toFixed(1)} km`;
};

/**
 * Berechnet den Mittelpunkt eines Polygon
 */
export const berechneMittelpunkt = (koordinaten: GPSKoordinaten[]): GPSKoordinaten | null => {
  if (koordinaten.length === 0) return null;

  let sumLat = 0;
  let sumLon = 0;

  for (const k of koordinaten) {
    sumLat += k.latitude;
    sumLon += k.longitude;
  }

  return {
    latitude: sumLat / koordinaten.length,
    longitude: sumLon / koordinaten.length,
  };
};

/**
 * Berechnet die Bounding Box eines Polygons
 */
export const berechneBoundingBox = (
  koordinaten: GPSKoordinaten[]
): { minLat: number; maxLat: number; minLon: number; maxLon: number } | null => {
  if (koordinaten.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const k of koordinaten) {
    minLat = Math.min(minLat, k.latitude);
    maxLat = Math.max(maxLat, k.latitude);
    minLon = Math.min(minLon, k.longitude);
    maxLon = Math.max(maxLon, k.longitude);
  }

  return { minLat, maxLat, minLon, maxLon };
};

/**
 * Prüft ob ein Punkt innerhalb eines Polygons liegt
 * (Ray Casting Algorithmus)
 */
export const punktInPolygon = (punkt: GPSKoordinaten, polygon: GPSKoordinaten[]): boolean => {
  if (polygon.length < 3) return false;

  let inside = false;
  const x = punkt.longitude;
  const y = punkt.latitude;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Berechnet die Fläche eines Polygons in Hektar
 * (Vereinfachte Berechnung, nicht für große Flächen geeignet)
 */
export const berechneFlaecheHektar = (polygon: GPSKoordinaten[]): number => {
  if (polygon.length < 3) return 0;

  // Shoelace-Formel für Polygon-Fläche
  let flaecheGrad = 0;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    flaecheGrad += polygon[i].longitude * polygon[j].latitude;
    flaecheGrad -= polygon[j].longitude * polygon[i].latitude;
  }

  flaecheGrad = Math.abs(flaecheGrad) / 2;

  // Umrechnung: 1 Grad ≈ 111km am Äquator
  // Bei deutschen Breitengraden (ca. 50°) ist Längengrad ≈ 71km
  // Vereinfachte Umrechnung für Deutschland
  const kmProGradLat = 111;
  const kmProGradLon = 71; // Bei ~50° Breite

  // Fläche in km²
  const flaecheKm2 = flaecheGrad * kmProGradLat * kmProGradLon;

  // Umrechnung in Hektar (1 km² = 100 ha)
  return flaecheKm2 * 100;
};

/**
 * Konvertiert Koordinaten zu GeoJSON
 */
export const zuGeoJsonPolygon = (koordinaten: GPSKoordinaten[]): string => {
  const geoJson = {
    type: 'Polygon',
    coordinates: [
      koordinaten.map((k) => [k.longitude, k.latitude]),
    ],
  };

  // Schließe das Polygon wenn nötig
  if (koordinaten.length > 0) {
    const erster = koordinaten[0];
    const letzter = koordinaten[koordinaten.length - 1];
    if (erster.latitude !== letzter.latitude || erster.longitude !== letzter.longitude) {
      geoJson.coordinates[0].push([erster.longitude, erster.latitude]);
    }
  }

  return JSON.stringify(geoJson);
};

/**
 * Konvertiert Koordinaten zu GeoJSON LineString
 */
export const zuGeoJsonLineString = (koordinaten: GPSKoordinaten[]): string => {
  const geoJson = {
    type: 'LineString',
    coordinates: koordinaten.map((k) => [k.longitude, k.latitude]),
  };
  return JSON.stringify(geoJson);
};

/**
 * Konvertiert Koordinaten zu GeoJSON Point
 */
export const zuGeoJsonPoint = (koordinaten: GPSKoordinaten): string => {
  const geoJson = {
    type: 'Point',
    coordinates: [koordinaten.longitude, koordinaten.latitude],
  };
  return JSON.stringify(geoJson);
};

/**
 * Parst GeoJSON zu Koordinaten-Array
 */
export const vonGeoJson = (geoJsonString: string): GPSKoordinaten[] => {
  try {
    const geoJson = JSON.parse(geoJsonString);

    if (geoJson.type === 'Point') {
      return [{ longitude: geoJson.coordinates[0], latitude: geoJson.coordinates[1] }];
    }

    if (geoJson.type === 'LineString') {
      return geoJson.coordinates.map((c: number[]) => ({
        longitude: c[0],
        latitude: c[1],
      }));
    }

    if (geoJson.type === 'Polygon') {
      // Erstes Array ist der äußere Ring
      return geoJson.coordinates[0].map((c: number[]) => ({
        longitude: c[0],
        latitude: c[1],
      }));
    }

    return [];
  } catch {
    return [];
  }
};

/**
 * Konvertiert Windrichtung von Grad zu Himmelsrichtung
 */
export const windGradZuRichtung = (grad: number): string => {
  const richtungen = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(grad / 22.5) % 16;
  return richtungen[index];
};

/**
 * Formatiert GPS-Koordinaten für die Anzeige
 */
export const formatiereKoordinaten = (koord: GPSKoordinaten): string => {
  const lat = koord.latitude.toFixed(5);
  const lon = koord.longitude.toFixed(5);
  return `${lat}, ${lon}`;
};
