/**
 * PHASE 5: Training Data Collection Service
 * Sammelt und aggregiert historische Jagd-Daten für ML-Training
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEntries, getPOIs } from './storageService';
import { getEnhancedWeather } from './enhancedWeatherService';
import { HuntingEvent, ExtractedFeatures } from '../types/ai';
import { JagdEintrag } from '../types';
import type { Wildkamera, WildkameraMedia } from '../types/wildkamera';

// ===========================
// DATA COLLECTION
// ===========================

/**
 * Sammelt alle historischen Jagd-Daten für ein Revier
 */
export async function collectTrainingData(revierId: string): Promise<HuntingEvent[]> {
  try {
    // Alle Einträge laden (inkl. gelöschte für vollständige Historie)
    const alleEintraege = await getEntries({
      revierId,
      nurAktive: false, // Auch gelöschte für Training
      limit: 10000, // Alle
    });

    // Konvertiere zu HuntingEvents
    const events: HuntingEvent[] = [];

    for (const eintrag of alleEintraege) {
      // Skip wenn keine GPS-Daten
      if (!eintrag.gps) continue;

      // Bestimme Event-Typ
      let typ: 'abschuss' | 'beobachtung' | 'fehlansprache' | 'leer_ansitz';
      if (eintrag.typ === 'abschuss') {
        typ = 'abschuss';
      } else if (eintrag.typ === 'beobachtung') {
        typ = eintrag.anzahl > 0 ? 'beobachtung' : 'leer_ansitz';
      } else {
        typ = 'beobachtung'; // Fallback
      }

      // Wetter-Daten rekonstruieren (falls verfügbar)
      const wetterDaten = eintrag.wetter ? {
        temperatur: eintrag.wetter.temperatur || 10,
        windGeschwindigkeit: eintrag.wetter.windGeschwindigkeit || 0,
        windRichtung: eintrag.wetter.windRichtung || 0,
        niederschlag: eintrag.wetter.niederschlag || 0,
        bewoelkung: eintrag.wetter.bewoelkung || 50,
        luftfeuchtigkeit: eintrag.wetter.luftfeuchtigkeit || 70,
        luftdruck: eintrag.wetter.luftdruck || 1013,
        mondphase: eintrag.wetter.mondphase || 0,
        witterungsQualitaet: 50, // Placeholder
      } : undefined;

      // Tageszeit berechnen
      const tageszeit = calculateDaytime(eintrag.zeitpunkt);

      // Jahreszeit berechnen
      const jahreszeit = calculateSeason(eintrag.zeitpunkt);

      const event: HuntingEvent = {
        id: eintrag.id,
        revierId,
        typ,
        wildart: eintrag.wildartName || 'Unbekannt',
        anzahl: eintrag.anzahl || 1,
        geschlecht: eintrag.geschlecht as any,
        altersklasse: eintrag.alter as any,
        gps: {
          latitude: eintrag.gps.latitude,
          longitude: eintrag.gps.longitude,
          altitude: eintrag.gps.altitude,
          accuracy: eintrag.gps.accuracy,
        },
        zeitpunkt: eintrag.zeitpunkt,
        wetterDaten,
        tageszeit,
        wochentag: eintrag.zeitpunkt.getDay(),
        jahreszeit,
        erfolgreich: typ === 'abschuss',
        notizen: eintrag.notizen,
        erstelltAm: eintrag.erstelltAm,
      };

      events.push(event);
    }

    // Cache speichern
    await cacheTrainingData(revierId, events);

    return events;
  } catch (error) {
    console.error('Error collecting training data:', error);
    return [];
  }
}

/**
 * Erweitert Training-Daten mit aktuellen Wetterdaten
 */
export async function enrichWithWeatherData(
  events: HuntingEvent[]
): Promise<HuntingEvent[]> {
  const enriched: HuntingEvent[] = [];

  for (const event of events) {
    // Skip wenn Wetter schon vorhanden
    if (event.wetterDaten) {
      enriched.push(event);
      continue;
    }

    try {
      // Hole historische Wetterdaten (falls möglich)
      // In Realität würde man ein historisches Wetter-API verwenden
      // Für jetzt: Skip oder verwende Durchschnittswerte
      enriched.push(event);
    } catch (error) {
      enriched.push(event);
    }
  }

  return enriched;
}

/**
 * Erweitert Events mit POI-Informationen
 */
export async function enrichWithPOIData(
  events: HuntingEvent[],
  revierId: string
): Promise<HuntingEvent[]> {
  try {
    // Alle POIs laden
    const pois = await getPOIs({ revierId, nurAktive: false });

    const enriched: HuntingEvent[] = [];

    for (const event of events) {
      let closestPOI: any = null;
      let minDistance = Infinity;

      // Finde nächsten POI
      for (const poi of pois) {
        try {
          const poiCoords = JSON.parse(poi.coordinates);
          const distance = calculateDistance(
            event.gps.latitude,
            event.gps.longitude,
            poiCoords[1], // latitude
            poiCoords[0] // longitude
          );

          if (distance < minDistance && distance < 1000) {
            // Max 1km
            minDistance = distance;
            closestPOI = poi;
          }
        } catch {
          continue;
        }
      }

      // Erweitere Event
      const enrichedEvent = {
        ...event,
        poiId: closestPOI?.id,
        poiTyp: closestPOI?.properties?.kategorie,
        distanzZumPoi: closestPOI ? Math.round(minDistance) : undefined,
      };

      enriched.push(enrichedEvent);
    }

    return enriched;
  } catch (error) {
    console.error('Error enriching with POI data:', error);
    return events;
  }
}

// ===========================
// FEATURE EXTRACTION
// ===========================

/**
 * Extrahiert ML-Features aus Hunting Events
 */
export function extractFeatures(event: HuntingEvent): ExtractedFeatures {
  const zeitpunkt = event.zeitpunkt;

  return {
    eventId: event.id,

    spatial: {
      latitude: event.gps.latitude,
      longitude: event.gps.longitude,
      altitude: event.gps.altitude,
      poiTyp: event.poiTyp,
      distanzZumPoi: event.distanzZumPoi,
      cluster: 0, // Wird später durch Clustering gesetzt
    },

    temporal: {
      stundeDesTages: zeitpunkt.getHours(),
      tageszeit: event.tageszeit,
      wochentag: event.wochentag,
      istWochenende: event.wochentag === 0 || event.wochentag === 6,
      jahreszeit: event.jahreszeit,
      monat: zeitpunkt.getMonth(),
      tagImJahr: getDayOfYear(zeitpunkt),
    },

    weather: {
      temperatur: event.wetterDaten?.temperatur || 10,
      temperaturKategorie: categorizeTemperature(
        event.wetterDaten?.temperatur || 10
      ),
      windGeschwindigkeit: event.wetterDaten?.windGeschwindigkeit || 0,
      windKategorie: categorizeWind(
        event.wetterDaten?.windGeschwindigkeit || 0
      ),
      niederschlag: (event.wetterDaten?.niederschlag || 0) > 0,
      bewoelkung: event.wetterDaten?.bewoelkung || 50,
      witterungsQualitaet: event.wetterDaten?.witterungsQualitaet || 50,
      mondphase: event.wetterDaten?.mondphase || 0,
      mondphasenKategorie: categorizeMoonPhase(
        event.wetterDaten?.mondphase || 0
      ),
    },

    wildlife: {
      wildart: event.wildart,
      anzahl: event.anzahl,
      geschlecht: event.geschlecht,
      altersklasse: event.altersklasse,
    },

    success: {
      erfolgreich: event.erfolgreich,
      typ: event.typ,
    },
  };
}

/**
 * Extrahiert Features aus allen Events
 */
export function extractAllFeatures(events: HuntingEvent[]): ExtractedFeatures[] {
  return events.map((event) => extractFeatures(event));
}

// ===========================
// PATTERN ANALYSIS
// ===========================

/**
 * Analysiert zeitliche Muster für eine Wildart
 */
export function analyzeTemporalPatterns(
  events: HuntingEvent[],
  wildart: string
): Record<string, { count: number; successRate: number }> {
  const patterns: Record<string, { total: number; successful: number }> = {};

  events
    .filter((e) => e.wildart === wildart)
    .forEach((event) => {
      const key = event.tageszeit;
      if (!patterns[key]) {
        patterns[key] = { total: 0, successful: 0 };
      }
      patterns[key].total++;
      if (event.erfolgreich) {
        patterns[key].successful++;
      }
    });

  // Konvertiere zu Rate
  const result: Record<string, { count: number; successRate: number }> = {};
  Object.entries(patterns).forEach(([key, value]) => {
    result[key] = {
      count: value.total,
      successRate: value.total > 0 ? (value.successful / value.total) * 100 : 0,
    };
  });

  return result;
}

/**
 * Analysiert räumliche Hotspots
 */
export function analyzeSpatialHotspots(
  events: HuntingEvent[],
  wildart?: string
): Array<{
  latitude: number;
  longitude: number;
  count: number;
  successRate: number;
  radius: number;
}> {
  const filteredEvents = wildart
    ? events.filter((e) => e.wildart === wildart)
    : events;

  // Einfaches Grid-basiertes Clustering (0.01° ~ 1km)
  const gridSize = 0.01;
  const grid: Record<
    string,
    { latitude: number; longitude: number; total: number; successful: number }
  > = {};

  filteredEvents.forEach((event) => {
    const gridLat = Math.round(event.gps.latitude / gridSize) * gridSize;
    const gridLon = Math.round(event.gps.longitude / gridSize) * gridSize;
    const key = `${gridLat},${gridLon}`;

    if (!grid[key]) {
      grid[key] = {
        latitude: gridLat,
        longitude: gridLon,
        total: 0,
        successful: 0,
      };
    }

    grid[key].total++;
    if (event.erfolgreich) {
      grid[key].successful++;
    }
  });

  // Konvertiere zu Array und sortiere nach Count
  const hotspots = Object.values(grid)
    .map((cell) => ({
      latitude: cell.latitude,
      longitude: cell.longitude,
      count: cell.total,
      successRate: cell.total > 0 ? (cell.successful / cell.total) * 100 : 0,
      radius: 1000, // 1km
    }))
    .filter((h) => h.count >= 3) // Minimum 3 Events
    .sort((a, b) => b.count - a.count);

  return hotspots.slice(0, 20); // Top 20
}

// ===========================
// UTILITIES
// ===========================

function calculateDaytime(date: Date): HuntingEvent['tageszeit'] {
  const hour = date.getHours();

  if (hour < 5) return 'vor_morgengrauen';
  if (hour < 7) return 'morgengrauen';
  if (hour < 10) return 'morgenstunden';
  if (hour < 12) return 'vormittag';
  if (hour < 14) return 'mittag';
  if (hour < 17) return 'nachmittag';
  if (hour < 20) return 'abenddaemmerung';
  return 'nachts';
}

function calculateSeason(date: Date): HuntingEvent['jahreszeit'] {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return 'fruehling';
  if (month >= 5 && month <= 7) return 'sommer';
  if (month >= 8 && month <= 10) return 'herbst';
  return 'winter';
}

function categorizeTemperature(
  temp: number
): 'sehr_kalt' | 'kalt' | 'mild' | 'warm' | 'heiss' {
  if (temp < -5) return 'sehr_kalt';
  if (temp < 5) return 'kalt';
  if (temp < 15) return 'mild';
  if (temp < 25) return 'warm';
  return 'heiss';
}

function categorizeWind(
  speed: number
): 'windstill' | 'leicht' | 'maessig' | 'stark' | 'sturm' {
  if (speed < 0.5) return 'windstill';
  if (speed < 3) return 'leicht';
  if (speed < 8) return 'maessig';
  if (speed < 14) return 'stark';
  return 'sturm';
}

function categorizeMoonPhase(
  phase: number
): 'neumond' | 'zunehmend' | 'vollmond' | 'abnehmend' {
  if (phase < 0.125) return 'neumond';
  if (phase < 0.375) return 'zunehmend';
  if (phase < 0.625) return 'vollmond';
  if (phase < 0.875) return 'abnehmend';
  return 'neumond';
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ===========================
// CACHING
// ===========================

async function cacheTrainingData(
  revierId: string,
  events: HuntingEvent[]
): Promise<void> {
  try {
    const key = `training_data_${revierId}`;
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        revierId,
        events,
        timestamp: new Date(),
      })
    );
  } catch (error) {
    console.error('Error caching training data:', error);
  }
}

export async function getCachedTrainingData(
  revierId: string
): Promise<HuntingEvent[] | null> {
  try {
    const key = `training_data_${revierId}`;
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const timestamp = new Date(data.timestamp);
    const now = new Date();

    // Cache 24h gültig
    if (now.getTime() - timestamp.getTime() > 24 * 60 * 60 * 1000) {
      return null;
    }

    return data.events;
  } catch (error) {
    console.error('Error reading cached training data:', error);
    return null;
  }
}

// ===========================
// STATISTICS
// ===========================

export function calculateStatistics(events: HuntingEvent[]): {
  totalEvents: number;
  successfulEvents: number;
  successRate: number;
  wildarten: string[];
  zeitraum: { von: Date; bis: Date } | null;
  eventsPerWildart: Record<string, number>;
} {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      successfulEvents: 0,
      successRate: 0,
      wildarten: [],
      zeitraum: null,
      eventsPerWildart: {},
    };
  }

  const successful = events.filter((e) => e.erfolgreich).length;
  const wildarten = Array.from(new Set(events.map((e) => e.wildart)));

  const sorted = [...events].sort(
    (a, b) => a.zeitpunkt.getTime() - b.zeitpunkt.getTime()
  );

  const eventsPerWildart: Record<string, number> = {};
  events.forEach((e) => {
    eventsPerWildart[e.wildart] = (eventsPerWildart[e.wildart] || 0) + 1;
  });

  return {
    totalEvents: events.length,
    successfulEvents: successful,
    successRate: (successful / events.length) * 100,
    wildarten,
    zeitraum: {
      von: sorted[0].zeitpunkt,
      bis: sorted[sorted.length - 1].zeitpunkt,
    },
    eventsPerWildart,
  };
}

// ===========================
// WILDKAMERA INTEGRATION (Phase 5 Enhancement)
// ===========================

/**
 * Sammelt Wildkamera-Daten und konvertiert zu HuntingEvents
 * 
 * PHASE 5 ENHANCEMENT:
 * Integriert Wildkamera-Sichtungen in AI-Training Pipeline
 * Wildkamera-Fotos werden als 'beobachtung' Events behandelt
 * 
 * @param revierId - Revier ID
 * @param minConfidence - Minimale KI-Confidence (default: 60)
 * @returns Array von HuntingEvents aus Wildkamera-Daten
 */
export async function collectWildkameraData(
  revierId: string,
  minConfidence: number = 60
): Promise<HuntingEvent[]> {
  try {
    // 1. Hole alle Wildkameras im Revier
    const wildkameras = await getWildkamerasForRevier(revierId);
    
    if (wildkameras.length === 0) {
      return [];
    }

    const events: HuntingEvent[] = [];
    
    // 2. Hole Aufnahmen der letzten 365 Tage für jede Kamera
    const zeitraum = {
      von: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      bis: new Date(),
    };

    for (const kamera of wildkameras) {
      const aufnahmen = await getWildkameraMedia(kamera.id, zeitraum);
      
      // 3. Konvertiere zu HuntingEvents
      for (const aufnahme of aufnahmen) {
        // Skip wenn keine KI-Analyse vorhanden
        if (!aufnahme.aiAnalyse || aufnahme.aiAnalyse.status !== 'completed') {
          continue;
        }

        // Skip wenn Confidence zu niedrig
        if (aufnahme.aiAnalyse.confidence < minConfidence) {
          continue;
        }

        // Skip wenn keine Wildart erkannt
        if (!aufnahme.aiAnalyse.wildart) {
          continue;
        }

        // 4. Erstelle HuntingEvent
        const event: HuntingEvent = {
          typ: 'beobachtung', // Wildkamera = immer Beobachtung
          wildart: aufnahme.aiAnalyse.wildart,
          anzahl: aufnahme.aiAnalyse.anzahl || 1,
          geschlecht: aufnahme.aiAnalyse.geschlecht || 'unbekannt',
          altersklasse: aufnahme.aiAnalyse.altersklasse,
          
          // GPS von Wildkamera
          gps: aufnahme.gps,
          zeitpunkt: aufnahme.zeitpunkt,
          
          // Wetter (falls verfügbar oder historisch abrufen)
          wetterDaten: undefined, // Wird später enriched
          
          // Zeitliche Features
          tageszeit: calculateDaytime(aufnahme.zeitpunkt),
          wochentag: aufnahme.zeitpunkt.getDay(),
          jahreszeit: calculateSeason(aufnahme.zeitpunkt),
          
          // POI Zuordnung
          poiId: kamera.poi_id,
          distanzZumPoi: kamera.poi_id ? 0 : undefined, // Kamera IST am POI
          
          // Erfolgreich = false (nur Sichtung, kein Abschuss)
          erfolgreich: false,
          
          // Metadaten
          quelle: 'wildkamera',
          wildkameraId: kamera.id,
          kiConfidence: aufnahme.aiAnalyse.confidence,
        };

        events.push(event);
      }
    }

    console.log(`[TrainingData] ${events.length} Wildkamera-Events gesammelt`);
    
    return events;
  } catch (error) {
    console.error('Fehler beim Sammeln der Wildkamera-Daten:', error);
    return [];
  }
}

/**
 * ENHANCED: Sammelt ALLE Training-Daten (manuelle + Wildkamera)
 * 
 * PHASE 5 ENHANCEMENT:
 * Kombiniert manuelle Jagdeinträge mit Wildkamera-Sichtungen
 * für umfassenderes AI-Training
 * 
 * @param revierId - Revier ID
 * @param includeWildkamera - Wildkamera-Daten einbeziehen (default: true)
 * @returns Kombiniertes Array aller HuntingEvents
 */
export async function collectTrainingDataEnhanced(
  revierId: string,
  includeWildkamera: boolean = true
): Promise<HuntingEvent[]> {
  try {
    // 1. Bisherige manuelle Daten
    const manualEvents = await collectTrainingData(revierId);
    
    if (!includeWildkamera) {
      return manualEvents;
    }

    // 2. Wildkamera-Daten hinzufügen
    const wildkameraEvents = await collectWildkameraData(revierId);
    
    // 3. Kombinieren
    const combined = [...manualEvents, ...wildkameraEvents];
    
    console.log(`[TrainingData Enhanced] Total: ${combined.length} Events (${manualEvents.length} manuell, ${wildkameraEvents.length} Wildkamera)`);
    
    return combined;
  } catch (error) {
    console.error('Fehler beim Sammeln der erweiterten Training-Daten:', error);
    // Fallback: Nur manuelle Daten
    return collectTrainingData(revierId);
  }
}

// ===========================
// WILDKAMERA HELPER FUNCTIONS
// ===========================

/**
 * Placeholder: Hole alle Wildkameras für ein Revier
 * TODO: Implementierung in Phase 7 (Wildkamera-Integration)
 */
async function getWildkamerasForRevier(revierId: string): Promise<Wildkamera[]> {
  try {
    const wildkamerasJSON = await AsyncStorage.getItem(`wildkameras_${revierId}`);
    if (!wildkamerasJSON) return [];
    
    const wildkameras = JSON.parse(wildkamerasJSON);
    return wildkameras || [];
  } catch (error) {
    console.warn('Wildkameras noch nicht implementiert');
    return [];
  }
}

/**
 * Placeholder: Hole Wildkamera-Media für Zeitraum
 * TODO: Implementierung in Phase 7 (Wildkamera-Integration)
 */
async function getWildkameraMedia(
  kameraId: string,
  zeitraum: { von: Date; bis: Date }
): Promise<WildkameraMedia[]> {
  try {
    const mediaJSON = await AsyncStorage.getItem(`wildkamera_media_${kameraId}`);
    if (!mediaJSON) return [];
    
    const allMedia: WildkameraMedia[] = JSON.parse(mediaJSON);
    
    // Filter nach Zeitraum
    return allMedia.filter((m) => {
      const timestamp = new Date(m.zeitpunkt);
      return timestamp >= zeitraum.von && timestamp <= zeitraum.bis;
    });
  } catch (error) {
    return [];
  }
}

