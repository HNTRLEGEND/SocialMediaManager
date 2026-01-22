/**
 * PHASE 5: AI Recommendation Engine - Core
 * Intelligente Jagd-Empfehlungen basierend auf historischen Daten & ML
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Recommendation,
  SpotScore,
  HuntingEvent,
  POIPerformance,
  WildartPattern,
  AIRecommendationConfig,
  HeatmapPoint,
} from '../types/ai';
import { EnhancedWeather } from '../types/weather';
import { GPSKoordinaten } from '../types';
import {
  collectTrainingData,
  enrichWithPOIData,
  extractAllFeatures,
  analyzeTemporalPatterns,
  analyzeSpatialHotspots,
} from './trainingDataService';
import { getEnhancedWeather, calculateHuntingCondition } from './enhancedWeatherService';
import { getPOIs } from './storageService';

// ===========================
// CONFIGURATION
// ===========================

const DEFAULT_CONFIG: AIRecommendationConfig = {
  enabled: true,
  modelVersion: '1.0.0',
  minTrainingData: 10, // Minimum 10 Events
  maxAge: 365, // 1 Jahr

  gewichtung: {
    historischerErfolg: 0.35,
    aktuelleWetterbedingungen: 0.25,
    tageszeit: 0.15,
    wildartAffinitaet: 0.10,
    mondphase: 0.05,
    saisonaleEignung: 0.05,
    letzterErfolg: 0.05,
  },

  schwellwerte: {
    minScore: 60, // Minimum 60/100
    minConfidence: 50, // Minimum 50% Confidence
    minHistoricalEvents: 5,
  },

  ui: {
    zeigeHeatmap: true,
    zeigeTopRecommendations: 3,
    updateInterval: 300000, // 5 Min
  },
};

// ===========================
// MAIN RECOMMENDATION ENGINE
// ===========================

/**
 * Generiert Empfehlungen für einen Jäger
 */
export async function generateRecommendations(
  revierId: string,
  wildart?: string,
  config: Partial<AIRecommendationConfig> = {}
): Promise<Recommendation[]> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  if (!fullConfig.enabled) {
    return [];
  }

  try {
    // 1. Training-Daten laden
    const trainingData = await collectTrainingData(revierId);

    if (trainingData.length < fullConfig.minTrainingData) {
      console.log('Not enough training data for recommendations');
      return [];
    }

    // 2. Mit POI-Daten erweitern
    const enrichedData = await enrichWithPOIData(trainingData, revierId);

    // 3. Aktuelles Wetter holen (für aktuelle Position - Beispiel: Revierzentrum)
    const centerPosition = calculateRevierCenter(enrichedData);
    const weather = await getEnhancedWeather(
      centerPosition.latitude,
      centerPosition.longitude
    );

    // 4. Generiere verschiedene Recommendations
    const recommendations: Recommendation[] = [];

    // Best Spot Recommendations
    const bestSpots = await generateBestSpotRecommendations(
      enrichedData,
      weather,
      wildart,
      fullConfig
    );
    recommendations.push(...bestSpots);

    // Best Time Recommendations
    const bestTimes = await generateBestTimeRecommendations(
      enrichedData,
      weather,
      wildart,
      fullConfig
    );
    recommendations.push(...bestTimes);

    // Wildlife Prediction Recommendations
    const wildlifePredictions = await generateWildlifePredictions(
      enrichedData,
      weather,
      fullConfig
    );
    recommendations.push(...wildlifePredictions);

    // Weather Opportunity Recommendations
    const weatherOpportunities = await generateWeatherOpportunities(
      enrichedData,
      weather,
      fullConfig
    );
    recommendations.push(...weatherOpportunities);

    // 5. Filtern nach Schwellwerten
    const filtered = recommendations.filter(
      (r) =>
        r.score >= fullConfig.schwellwerte.minScore &&
        r.confidence >= fullConfig.schwellwerte.minConfidence
    );

    // 6. Sortieren nach Score
    filtered.sort((a, b) => b.score - a.score);

    // 7. Top N zurückgeben
    return filtered.slice(0, fullConfig.ui.zeigeTopRecommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

// ===========================
// BEST SPOT RECOMMENDATIONS
// ===========================

async function generateBestSpotRecommendations(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather,
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Analysiere räumliche Hotspots
  const hotspots = analyzeSpatialHotspots(trainingData, wildart);

  for (const hotspot of hotspots.slice(0, 5)) {
    // Top 5
    // Berechne Spot Score
    const spotScore = await calculateSpotScore(
      { latitude: hotspot.latitude, longitude: hotspot.longitude },
      trainingData,
      weather,
      wildart,
      config
    );

    if (spotScore.gesamtScore < config.schwellwerte.minScore) continue;

    // Grund-Texte
    const gruende: string[] = [];
    gruende.push(`${hotspot.count} historische Events an diesem Standort`);
    gruende.push(`Erfolgsrate: ${hotspot.successRate.toFixed(1)}%`);

    if (spotScore.scores.aktuelleWetterbedingungen > 70) {
      gruende.push('Aktuelle Wetterbedingungen sind optimal');
    }
    if (spotScore.scores.tageszeit > 70) {
      gruende.push('Ideale Tageszeit');
    }

    const recommendation: Recommendation = {
      id: `best_spot_${hotspot.latitude}_${hotspot.longitude}`,
      typ: 'best_spot',
      score: spotScore.gesamtScore,
      confidence: Math.min(100, (hotspot.count / 20) * 100), // Max bei 20 Events
      prioritaet:
        spotScore.gesamtScore > 80
          ? 'sehr_hoch'
          : spotScore.gesamtScore > 70
            ? 'hoch'
            : spotScore.gesamtScore > 60
              ? 'mittel'
              : 'niedrig',
      titel: wildart
        ? `Top-Spot für ${wildart}`
        : 'Vielversprechender Jagdstandort',
      beschreibung: `Dieser Standort hat eine Erfolgsrate von ${hotspot.successRate.toFixed(1)}% basierend auf ${hotspot.count} vergangenen Jagden.`,
      gruende,
      position: {
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
      },
      wildart,
      erfolgswahrscheinlichkeit: spotScore.prognose.erfolgswahrscheinlichkeit,
      basiertAuf: {
        historischeEvents: hotspot.count,
        aehnlicheSituationen: hotspot.count,
      },
      erstelltAm: new Date(),
      gueltigBis: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6h
    };

    recommendations.push(recommendation);
  }

  return recommendations;
}

// ===========================
// BEST TIME RECOMMENDATIONS
// ===========================

async function generateBestTimeRecommendations(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather,
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Filter auf Wildart wenn angegeben
  const relevantData = wildart
    ? trainingData.filter((e) => e.wildart === wildart)
    : trainingData;

  if (relevantData.length < config.schwellwerte.minHistoricalEvents) {
    return [];
  }

  // Analysiere zeitliche Muster
  const temporalPatterns = analyzeTemporalPatterns(
    relevantData,
    wildart || 'Alle'
  );

  // Finde beste Tageszeit
  let bestTime = '';
  let bestRate = 0;

  Object.entries(temporalPatterns).forEach(([tageszeit, stats]) => {
    if (stats.successRate > bestRate && stats.count >= 3) {
      bestRate = stats.successRate;
      bestTime = tageszeit;
    }
  });

  if (bestTime && bestRate > 30) {
    const now = new Date();
    const nextOccurrence = getNextOccurrenceOfDaytime(bestTime);

    const recommendation: Recommendation = {
      id: `best_time_${bestTime}`,
      typ: 'best_time',
      score: Math.min(100, bestRate * 1.2),
      confidence: Math.min(100, (temporalPatterns[bestTime].count / 10) * 100),
      prioritaet: bestRate > 60 ? 'hoch' : 'mittel',
      titel: `Beste Jagdzeit: ${translateDaytime(bestTime)}`,
      beschreibung: `Historisch gesehen ist ${translateDaytime(bestTime)} die erfolgreichste Zeit mit ${bestRate.toFixed(1)}% Erfolgsrate.`,
      gruende: [
        `${temporalPatterns[bestTime].count} erfolgreiche Jagden`,
        `Durchschnittliche Erfolgsrate: ${bestRate.toFixed(1)}%`,
      ],
      wildart,
      empfohleneZeit: {
        von: nextOccurrence.von,
        bis: nextOccurrence.bis,
        tageszeit: bestTime,
      },
      erfolgswahrscheinlichkeit: bestRate,
      basiertAuf: {
        historischeEvents: temporalPatterns[bestTime].count,
        aehnlicheSituationen: temporalPatterns[bestTime].count,
      },
      erstelltAm: now,
      gueltigBis: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };

    recommendations.push(recommendation);
  }

  return recommendations;
}

// ===========================
// WILDLIFE PREDICTIONS
// ===========================

async function generateWildlifePredictions(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Zähle Wildarten-Häufigkeit nach aktuellem Wetter/Zeit
  const currentHour = new Date().getHours();
  const currentSeason = getCurrentSeason();

  const wildartCounts: Record<string, { count: number; successRate: number }> = {};

  trainingData.forEach((event) => {
    const eventHour = event.zeitpunkt.getHours();
    const eventSeason = event.jahreszeit;

    // Ähnliche Bedingungen?
    if (Math.abs(eventHour - currentHour) <= 2 && eventSeason === currentSeason) {
      if (!wildartCounts[event.wildart]) {
        wildartCounts[event.wildart] = { count: 0, successRate: 0 };
      }
      wildartCounts[event.wildart].count++;
      if (event.erfolgreich) {
        wildartCounts[event.wildart].successRate++;
      }
    }
  });

  // Berechne Raten
  Object.keys(wildartCounts).forEach((wildart) => {
    if (wildartCounts[wildart].count > 0) {
      wildartCounts[wildart].successRate =
        (wildartCounts[wildart].successRate / wildartCounts[wildart].count) * 100;
    }
  });

  // Sortiere nach Count
  const sorted = Object.entries(wildartCounts).sort((a, b) => b[1].count - a[1].count);

  // Top 2 Wildarten
  for (const [wildart, stats] of sorted.slice(0, 2)) {
    if (stats.count < 3) continue;

    const recommendation: Recommendation = {
      id: `wildlife_prediction_${wildart}`,
      typ: 'wildlife_prediction',
      score: Math.min(100, stats.count * 10 + stats.successRate * 0.5),
      confidence: Math.min(100, (stats.count / 15) * 100),
      prioritaet: stats.count > 10 ? 'hoch' : 'mittel',
      titel: `${wildart} erwartet`,
      beschreibung: `Unter ähnlichen Bedingungen wurde ${wildart} ${stats.count}x beobachtet.`,
      gruende: [
        `${stats.count} Sichtungen unter ähnlichen Bedingungen`,
        `Erfolgsrate: ${stats.successRate.toFixed(1)}%`,
        'Aktuelle Tageszeit und Jahreszeit passen',
      ],
      wildart,
      erwarteteAnzahl: Math.ceil(stats.count / 10),
      erfolgswahrscheinlichkeit: stats.successRate,
      basiertAuf: {
        historischeEvents: stats.count,
        aehnlicheSituationen: stats.count,
      },
      erstelltAm: new Date(),
      gueltigBis: new Date(Date.now() + 12 * 60 * 60 * 1000),
    };

    recommendations.push(recommendation);
  }

  return recommendations;
}

// ===========================
// WEATHER OPPORTUNITIES
// ===========================

async function generateWeatherOpportunities(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Prüfe ob aktuelles Wetter besonders gut ist
  const huntingCondition = calculateHuntingCondition(weather);

  if (huntingCondition.overall === 'excellent' || huntingCondition.overall === 'good') {
    const score =
      huntingCondition.overall === 'excellent'
        ? 90
        : 75;

    const recommendation: Recommendation = {
      id: 'weather_opportunity_now',
      typ: 'weather_opportunity',
      score,
      confidence: 85,
      prioritaet: huntingCondition.overall === 'excellent' ? 'sehr_hoch' : 'hoch',
      titel:
        huntingCondition.overall === 'excellent'
          ? '🎯 Perfekte Jagdbedingungen!'
          : 'Gute Jagdbedingungen',
      beschreibung: 'Die aktuellen Wetterbedingungen sind ideal für die Jagd.',
      gruende: huntingCondition.recommendations,
      wetterEmpfehlung: {
        aktuell: true,
        besserWarten: false,
      },
      erfolgswahrscheinlichkeit: huntingCondition.factors.scentCarry * 0.7,
      basiertAuf: {
        historischeEvents: trainingData.length,
        aehnlicheSituationen: 0,
      },
      erstelltAm: new Date(),
      gueltigBis: new Date(Date.now() + 3 * 60 * 60 * 1000),
    };

    recommendations.push(recommendation);
  }

  return recommendations;
}

// ===========================
// SPOT SCORING
// ===========================

export async function calculateSpotScore(
  position: GPSKoordinaten,
  trainingData: HuntingEvent[],
  weather: EnhancedWeather,
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<SpotScore> {
  // 1. Historischer Erfolg
  const nearbyEvents = trainingData.filter((event) => {
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      event.gps.latitude,
      event.gps.longitude
    );
    return distance < 500; // 500m Radius
  });

  const historischerErfolg =
    nearbyEvents.length > 0
      ? (nearbyEvents.filter((e) => e.erfolgreich).length / nearbyEvents.length) * 100
      : 50;

  // 2. Aktuelle Wetterbedingungen
  const huntingCondition = calculateHuntingCondition(weather);
  const aktuelleWetterbedingungen = huntingCondition.factors.scentCarry;

  // 3. Tageszeit
  const currentHour = new Date().getHours();
  const tageszeitScore = calculateDaytimeScore(currentHour, nearbyEvents);

  // 4. Wildart-Affinität
  const wildartAffinitaet = wildart
    ? calculateWildartAffinity(wildart, nearbyEvents)
    : 50;

  // 5. Mondphase
  const mondphase = weather.moon.illumination;

  // 6. Saisonale Eignung
  const season = getCurrentSeason();
  const saisonaleEignung = calculateSeasonalScore(season, nearbyEvents);

  // 7. Letzter Erfolg
  const letzterErfolg = calculateLastSuccessBonus(nearbyEvents);

  // Gewichtete Summe
  const gesamtScore =
    historischerErfolg * config.gewichtung.historischerErfolg +
    aktuelleWetterbedingungen * config.gewichtung.aktuelleWetterbedingungen +
    tageszeitScore * config.gewichtung.tageszeit +
    wildartAffinitaet * config.gewichtung.wildartAffinitaet +
    mondphase * config.gewichtung.mondphase +
    saisonaleEignung * config.gewichtung.saisonaleEignung +
    letzterErfolg * config.gewichtung.letzterErfolg;

  return {
    position,
    gesamtScore: Math.round(gesamtScore),
    scores: {
      historischerErfolg: Math.round(historischerErfolg),
      aktuelleWetterbedingungen: Math.round(aktuelleWetterbedingungen),
      tageszeit: Math.round(tageszeitScore),
      wildartAffinitaet: Math.round(wildartAffinitaet),
      mondphase: Math.round(mondphase),
      saisonaleEignung: Math.round(saisonaleEignung),
      letzterErfolg: Math.round(letzterErfolg),
    },
    gewichtung: config.gewichtung,
    prognose: {
      erfolgswahrscheinlichkeit: Math.round(gesamtScore * 0.8),
      erwarteteWildarten: [],
      besteStunde: findBestHour(nearbyEvents),
    },
    rank: 0,
    besserAls: 0,
  };
}

// ===========================
// HELPER FUNCTIONS
// ===========================

function calculateRevierCenter(events: HuntingEvent[]): GPSKoordinaten {
  if (events.length === 0) {
    return { latitude: 51.5, longitude: 9.5 }; // Deutschland Zentrum
  }

  const sumLat = events.reduce((sum, e) => sum + e.gps.latitude, 0);
  const sumLon = events.reduce((sum, e) => sum + e.gps.longitude, 0);

  return {
    latitude: sumLat / events.length,
    longitude: sumLon / events.length,
  };
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
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

function calculateDaytimeScore(currentHour: number, events: HuntingEvent[]): number {
  const relevantEvents = events.filter((e) => {
    const eventHour = e.zeitpunkt.getHours();
    return Math.abs(eventHour - currentHour) <= 1;
  });

  if (relevantEvents.length === 0) return 50;

  const successRate =
    (relevantEvents.filter((e) => e.erfolgreich).length / relevantEvents.length) * 100;

  return successRate;
}

function calculateWildartAffinity(wildart: string, events: HuntingEvent[]): number {
  const wildartEvents = events.filter((e) => e.wildart === wildart);

  if (wildartEvents.length === 0) return 30;

  const successRate =
    (wildartEvents.filter((e) => e.erfolgreich).length / wildartEvents.length) * 100;

  return successRate;
}

function calculateSeasonalScore(season: string, events: HuntingEvent[]): number {
  const seasonalEvents = events.filter((e) => e.jahreszeit === season);

  if (seasonalEvents.length === 0) return 50;

  const successRate =
    (seasonalEvents.filter((e) => e.erfolgreich).length / seasonalEvents.length) * 100;

  return successRate;
}

function calculateLastSuccessBonus(events: HuntingEvent[]): number {
  const successfulEvents = events.filter((e) => e.erfolgreich);

  if (successfulEvents.length === 0) return 0;

  // Sortiere nach Datum
  successfulEvents.sort((a, b) => b.zeitpunkt.getTime() - a.zeitpunkt.getTime());

  const lastSuccess = successfulEvents[0];
  const daysSinceSuccess = (Date.now() - lastSuccess.zeitpunkt.getTime()) / (1000 * 60 * 60 * 24);

  // Bonus sinkt mit Zeit
  if (daysSinceSuccess < 7) return 100;
  if (daysSinceSuccess < 30) return 70;
  if (daysSinceSuccess < 90) return 40;
  return 20;
}

function findBestHour(events: HuntingEvent[]): number {
  const hourScores: Record<number, { total: number; successful: number }> = {};

  events.forEach((event) => {
    const hour = event.zeitpunkt.getHours();
    if (!hourScores[hour]) {
      hourScores[hour] = { total: 0, successful: 0 };
    }
    hourScores[hour].total++;
    if (event.erfolgreich) {
      hourScores[hour].successful++;
    }
  });

  let bestHour = new Date().getHours();
  let bestRate = 0;

  Object.entries(hourScores).forEach(([hour, stats]) => {
    const rate = stats.successful / stats.total;
    if (rate > bestRate) {
      bestRate = rate;
      bestHour = parseInt(hour);
    }
  });

  return bestHour;
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'fruehling';
  if (month >= 5 && month <= 7) return 'sommer';
  if (month >= 8 && month <= 10) return 'herbst';
  return 'winter';
}

function translateDaytime(daytime: string): string {
  const translations: Record<string, string> = {
    vor_morgengrauen: 'Vor Morgengrauen',
    morgengrauen: 'Morgengrauen',
    morgenstunden: 'Morgenstunden',
    vormittag: 'Vormittag',
    mittag: 'Mittag',
    nachmittag: 'Nachmittag',
    abenddaemmerung: 'Abenddämmerung',
    nachts: 'Nachts',
  };
  return translations[daytime] || daytime;
}

function getNextOccurrenceOfDaytime(daytime: string): { von: Date; bis: Date } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeRanges: Record<string, { start: number; end: number }> = {
    vor_morgengrauen: { start: 4, end: 5 },
    morgengrauen: { start: 5, end: 7 },
    morgenstunden: { start: 7, end: 10 },
    vormittag: { start: 10, end: 12 },
    mittag: { start: 12, end: 14 },
    nachmittag: { start: 14, end: 17 },
    abenddaemmerung: { start: 17, end: 20 },
    nachts: { start: 20, end: 23 },
  };

  const range = timeRanges[daytime] || { start: 6, end: 18 };

  const von = new Date(tomorrow);
  von.setHours(range.start, 0, 0, 0);

  const bis = new Date(tomorrow);
  bis.setHours(range.end, 0, 0, 0);

  return { von, bis };
}

// ===========================
// HEATMAP GENERATION
// ===========================

export async function generateHeatmap(
  revierId: string,
  wildart?: string
): Promise<HeatmapPoint[]> {
  const trainingData = await collectTrainingData(revierId);
  const hotspots = analyzeSpatialHotspots(trainingData, wildart);

  return hotspots.map((hotspot) => ({
    latitude: hotspot.latitude,
    longitude: hotspot.longitude,
    intensity: Math.min(100, hotspot.successRate),
    radius: hotspot.radius,
    wildart,
    erfolgsrate: hotspot.successRate,
    anzahlEvents: hotspot.count,
  }));
}
