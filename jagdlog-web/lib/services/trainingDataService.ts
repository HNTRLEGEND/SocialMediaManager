import { initDatabase } from '../database';
import { HuntingEvent, ExtractedFeatures, WildartPattern } from '../types/ai';
import { calculateDistance } from '../utils/geo';

// ============================================================
// TRAINING DATA COLLECTION
// ============================================================

/**
 * Collects all hunting events from database for ML training
 */
export async function collectTrainingData(
  revierId: string,
  maxAgeDays: number = 365
): Promise<HuntingEvent[]> {
  const db = await initDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
  const cutoffISO = cutoffDate.toISOString();
  
  console.log(`[TrainingData] Collecting events for revier ${revierId} since ${cutoffISO}`);
  
  try {
    // Get all hunt entries (abschuss + beobachtung)
    const eintraegeResult = db.exec(
      `SELECT 
        id, revier_id, user_id, typ, wildart, geschlecht, anzahl,
        latitude, longitude, zeitpunkt, erstellt_am
       FROM eintraege
       WHERE revier_id = ? AND zeitpunkt >= ? AND geloescht_am IS NULL
       ORDER BY zeitpunkt DESC`,
      [revierId, cutoffISO]
    );
    
    const events: HuntingEvent[] = [];
    
    if (eintraegeResult.length > 0 && eintraegeResult[0].values.length > 0) {
      for (const row of eintraegeResult[0].values) {
        const [id, revId, userId, typ, wildart, geschlecht, anzahl, lat, lon, zeitpunkt, erstelltAm] = row;
        
        const event: HuntingEvent = {
          id: id as string,
          revierId: revId as string,
          userId: userId as string,
          typ: typ as 'abschuss' | 'beobachtung',
          wildart: wildart as string,
          geschlecht: (geschlecht as 'm' | 'w' | 'unbekannt') || 'unbekannt',
          anzahl: (anzahl as number) || 1,
          gps: {
            latitude: lat as number,
            longitude: lon as number,
          },
          zeitpunkt: zeitpunkt as string,
          erfolg: typ === 'abschuss', // abschuss = success
          quelle: 'manual',
          erstellt_am: erstelltAm as string,
        };
        
        events.push(event);
      }
    }
    
    console.log(`[TrainingData] Collected ${events.length} events`);
    
    // Enrich with additional data
    const enrichedEvents = await enrichWithWeatherData(events);
    const finalEvents = await enrichWithPOIData(enrichedEvents, revierId);
    
    return finalEvents;
    
  } catch (error) {
    console.error('[TrainingData] Error collecting data:', error);
    return [];
  }
}

/**
 * Enriches events with weather data
 */
async function enrichWithWeatherData(events: HuntingEvent[]): Promise<HuntingEvent[]> {
  // For now, return events as-is
  // In production, could fetch historical weather data
  console.log('[TrainingData] Weather enrichment skipped (use real-time only)');
  return events;
}

/**
 * Enriches events with nearest POI data
 */
async function enrichWithPOIData(
  events: HuntingEvent[],
  revierId: string
): Promise<HuntingEvent[]> {
  const db = await initDatabase();
  
  try {
    // Get all POIs for this revier
    const poisResult = db.exec(
      `SELECT id, name, latitude, longitude 
       FROM map_features
       WHERE revier_id = ? AND typ = 'poi' AND geloescht_am IS NULL`,
      [revierId]
    );
    
    if (poisResult.length === 0 || poisResult[0].values.length === 0) {
      console.log('[TrainingData] No POIs found for enrichment');
      return events;
    }
    
    const pois = poisResult[0].values.map(row => ({
      id: row[0] as string,
      name: row[1] as string,
      lat: row[2] as number,
      lon: row[3] as number,
    }));
    
    // For each event, find nearest POI
    const enrichedEvents = events.map(event => {
      let nearestPOI = null;
      let minDistance = Infinity;
      
      for (const poi of pois) {
        const distance = calculateDistance(
          event.gps.latitude,
          event.gps.longitude,
          poi.lat,
          poi.lon
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestPOI = poi;
        }
      }
      
      if (nearestPOI && minDistance < 1000) { // Within 1km
        return {
          ...event,
          naechster_poi_id: nearestPOI.id,
          distanz_zu_poi: Math.round(minDistance),
        };
      }
      
      return event;
    });
    
    console.log('[TrainingData] Enriched with POI data');
    return enrichedEvents;
    
  } catch (error) {
    console.error('[TrainingData] Error enriching with POI data:', error);
    return events;
  }
}

// ============================================================
// FEATURE EXTRACTION
// ============================================================

/**
 * Extracts ML features from hunting event
 */
export function extractFeatures(event: HuntingEvent): ExtractedFeatures {
  const date = new Date(event.zeitpunkt);
  
  return {
    spatial: {
      latitude: event.gps.latitude,
      longitude: event.gps.longitude,
      gridCell: `${event.gps.latitude.toFixed(2)}_${event.gps.longitude.toFixed(2)}`,
      distanceToPOI: event.distanz_zu_poi,
      poiType: event.naechster_poi_id ? 'ansitz' : undefined,
    },
    
    temporal: {
      hour: date.getHours(),
      dayOfWeek: date.getDay(),
      dayOfYear: getDayOfYear(date),
      month: date.getMonth() + 1,
      tageszeit: getTageszeit(date.getHours()),
      jahreszeit: getJahreszeit(date.getMonth() + 1),
    },
    
    weather: {
      temperaturKategorie: event.wetter?.temperatur 
        ? categorizeTemperature(event.wetter.temperatur)
        : undefined,
      windKategorie: event.wetter?.wind_geschwindigkeit
        ? categorizeWind(event.wetter.wind_geschwindigkeit)
        : undefined,
      niederschlag: event.wetter?.niederschlag !== 'none',
      mondphase: event.wetter?.mondphase,
    },
    
    wildlife: {
      wildart: event.wildart,
      geschlecht: event.geschlecht,
      anzahl: event.anzahl,
    },
    
    erfolg: event.erfolg,
  };
}

// ============================================================
// PATTERN ANALYSIS
// ============================================================

/**
 * Analyzes temporal patterns for a specific wildlife species
 */
export function analyzeTemporalPatterns(
  events: HuntingEvent[],
  wildart?: string
): Record<string, { rate: number; count: number }> {
  const filtered = wildart 
    ? events.filter(e => e.wildart === wildart)
    : events;
  
  const hourlyStats: Record<number, { total: number; success: number }> = {};
  
  for (const event of filtered) {
    const hour = new Date(event.zeitpunkt).getHours();
    
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, success: 0 };
    }
    
    hourlyStats[hour].total++;
    if (event.erfolg) {
      hourlyStats[hour].success++;
    }
  }
  
  const patterns: Record<string, { rate: number; count: number }> = {};
  
  for (const [hour, stats] of Object.entries(hourlyStats)) {
    patterns[hour] = {
      rate: stats.total > 0 ? stats.success / stats.total : 0,
      count: stats.total,
    };
  }
  
  return patterns;
}

/**
 * Analyzes spatial hotspots
 */
export function analyzeSpatialHotspots(
  events: HuntingEvent[],
  wildart?: string,
  topN: number = 20
): Array<{ lat: number; lon: number; count: number; successRate: number }> {
  const filtered = wildart
    ? events.filter(e => e.wildart === wildart)
    : events;
  
  // Grid-based clustering (0.01° ~1km)
  const gridSize = 0.01;
  const clusters: Record<string, { total: number; success: number; lat: number; lon: number }> = {};
  
  for (const event of filtered) {
    const gridLat = Math.round(event.gps.latitude / gridSize) * gridSize;
    const gridLon = Math.round(event.gps.longitude / gridSize) * gridSize;
    const key = `${gridLat.toFixed(2)}_${gridLon.toFixed(2)}`;
    
    if (!clusters[key]) {
      clusters[key] = { total: 0, success: 0, lat: gridLat, lon: gridLon };
    }
    
    clusters[key].total++;
    if (event.erfolg) {
      clusters[key].success++;
    }
  }
  
  // Convert to array and sort by event count
  const hotspots = Object.values(clusters)
    .map(cluster => ({
      lat: cluster.lat,
      lon: cluster.lon,
      count: cluster.total,
      successRate: cluster.total > 0 ? cluster.success / cluster.total : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
  
  return hotspots;
}

/**
 * Analyzes wildlife patterns
 */
export function analyzeWildartPattern(
  events: HuntingEvent[],
  wildart: string
): WildartPattern {
  const filtered = events.filter(e => e.wildart === wildart);
  const totalEvents = filtered.length;
  const successes = filtered.filter(e => e.erfolg).length;
  const successRate = totalEvents > 0 ? successes / totalEvents : 0;
  
  // Best hours
  const hourlyData = analyzeTemporalPatterns(events, wildart);
  const bestHours = Object.entries(hourlyData)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      successRate: data.rate,
      eventCount: data.count,
    }))
    .filter(h => h.eventCount >= 2) // At least 2 events
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);
  
  // Hotspots
  const hotspots = analyzeSpatialHotspots(events, wildart, 10);
  
  return {
    wildart,
    totalEvents,
    successRate,
    bestHours,
    hotspots,
  };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getTageszeit(hour: number): string {
  if (hour >= 5 && hour < 7) return 'morgendaemmerung';
  if (hour >= 7 && hour < 10) return 'morgen';
  if (hour >= 10 && hour < 12) return 'vormittag';
  if (hour >= 12 && hour < 14) return 'mittag';
  if (hour >= 14 && hour < 17) return 'nachmittag';
  if (hour >= 17 && hour < 20) return 'abenddaemmerung';
  if (hour >= 20 && hour < 23) return 'abend';
  return 'nacht';
}

function getJahreszeit(month: number): string {
  if (month >= 3 && month <= 5) return 'fruehling';
  if (month >= 6 && month <= 8) return 'sommer';
  if (month >= 9 && month <= 11) return 'herbst';
  return 'winter';
}

function categorizeTemperature(temp: number): 'sehr_kalt' | 'kalt' | 'mild' | 'warm' | 'heiss' {
  if (temp < -5) return 'sehr_kalt';
  if (temp < 5) return 'kalt';
  if (temp < 15) return 'mild';
  if (temp < 25) return 'warm';
  return 'heiss';
}

function categorizeWind(speed: number): 'windstill' | 'leicht' | 'maessig' | 'stark' {
  if (speed < 1) return 'windstill';
  if (speed < 3) return 'leicht';
  if (speed < 7) return 'maessig';
  return 'stark';
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
