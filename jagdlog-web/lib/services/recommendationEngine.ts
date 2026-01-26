import { 
  Recommendation, 
  SpotScore, 
  HeatmapPoint, 
  AIRecommendationConfig,
  HuntingEvent,
} from '../types/ai';
import { EnhancedWeather } from '../types/weather';
import { getEnhancedWeather } from './weatherService';
import { 
  collectTrainingData, 
  analyzeTemporalPatterns, 
  analyzeSpatialHotspots,
  analyzeWildartPattern,
} from './trainingDataService';
import { calculateDistance } from '../utils/geo';

const DEFAULT_CONFIG: AIRecommendationConfig = {
  enabled: true,
  modelVersion: '1.0.0',
  minTrainingData: 10,
  maxAge: 365,
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
    minScore: 60,
    minConfidence: 50,
    minHistoricalEvents: 5,
  },
  ui: {
    zeigeHeatmap: true,
    zeigeTopRecommendations: 3,
    updateInterval: 300000,
  },
};

// ============================================================
// MAIN RECOMMENDATION ENGINE
// ============================================================

/**
 * Generates AI recommendations for hunting
 */
export async function generateRecommendations(
  revierId: string,
  wildart?: string,
  config: AIRecommendationConfig = DEFAULT_CONFIG
): Promise<Recommendation[]> {
  console.log(`[AI] Generating recommendations for revier ${revierId}, wildart: ${wildart || 'all'}`);
  
  try {
    // Collect training data
    const trainingData = await collectTrainingData(revierId, config.maxAge);
    
    if (trainingData.length < config.minTrainingData) {
      console.log(`[AI] Insufficient training data: ${trainingData.length} < ${config.minTrainingData}`);
      return [];
    }
    
    // Get current weather
    let weather: EnhancedWeather | null = null;
    if (trainingData.length > 0) {
      const avgLat = trainingData.reduce((sum, e) => sum + e.gps.latitude, 0) / trainingData.length;
      const avgLon = trainingData.reduce((sum, e) => sum + e.gps.longitude, 0) / trainingData.length;
      weather = await getEnhancedWeather(avgLat, avgLon);
    }
    
    const recommendations: Recommendation[] = [];
    
    // 1. Best Spot Recommendations
    const bestSpots = await generateBestSpotRecommendations(
      trainingData,
      weather,
      wildart,
      config
    );
    recommendations.push(...bestSpots);
    
    // 2. Best Time Recommendations
    const bestTimes = await generateBestTimeRecommendations(
      trainingData,
      wildart,
      config
    );
    recommendations.push(...bestTimes);
    
    // 3. Wildlife Predictions
    const wildlifePredictions = await generateWildlifePredictions(
      trainingData,
      weather,
      config
    );
    recommendations.push(...wildlifePredictions);
    
    // 4. Weather Opportunities (if weather data available)
    if (weather) {
      const weatherOpps = await generateWeatherOpportunities(
        trainingData,
        weather,
        wildart,
        config
      );
      recommendations.push(...weatherOpps);
    }
    
    // Filter by thresholds and sort by score
    const filtered = recommendations
      .filter(r => r.score >= config.schwellwerte.minScore)
      .filter(r => r.confidence >= config.schwellwerte.minConfidence)
      .sort((a, b) => b.score - a.score)
      .slice(0, config.ui.zeigeTopRecommendations);
    
    console.log(`[AI] Generated ${filtered.length} recommendations`);
    return filtered;
    
  } catch (error) {
    console.error('[AI] Error generating recommendations:', error);
    return [];
  }
}

// ============================================================
// BEST SPOT RECOMMENDATIONS
// ============================================================

async function generateBestSpotRecommendations(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather | null,
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  const hotspots = analyzeSpatialHotspots(trainingData, wildart, 5);
  const recommendations: Recommendation[] = [];
  
  for (const hotspot of hotspots) {
    if (hotspot.count < config.schwellwerte.minHistoricalEvents) continue;
    
    const spotScore = await calculateSpotScore(
      { latitude: hotspot.lat, longitude: hotspot.lon },
      trainingData,
      weather,
      wildart,
      config
    );
    
    if (spotScore.totalScore < config.schwellwerte.minScore) continue;
    
    const gruende = [];
    gruende.push(`${hotspot.count} historische Ereignisse an diesem Standort`);
    gruende.push(`${Math.round(hotspot.successRate * 100)}% Erfolgsrate`);
    
    if (spotScore.faktoren.aktuelleWetterbedingungen > 70 && weather) {
      gruende.push(`Aktuelle Wetterbedingungen sind optimal`);
    }
    
    if (spotScore.besteStunde !== undefined) {
      gruende.push(`Beste Zeit: ${spotScore.besteStunde}:00 Uhr`);
    }
    
    recommendations.push({
      id: `spot_${hotspot.lat}_${hotspot.lon}`,
      typ: 'best_spot',
      prioritaet: spotScore.totalScore > 80 ? 'sehr_hoch' : spotScore.totalScore > 70 ? 'hoch' : 'mittel',
      score: Math.round(spotScore.totalScore),
      confidence: Math.min(95, 50 + Math.min(45, hotspot.count * 3)),
      titel: wildart ? `Top-Standort für ${wildart}` : 'Erfolgversprechender Jagdstandort',
      beschreibung: `Dieser Standort hat eine ${Math.round(hotspot.successRate * 100)}% Erfolgsrate basierend auf ${hotspot.count} Ereignissen.`,
      gruende,
      gps: {
        latitude: hotspot.lat,
        longitude: hotspot.lon,
      },
      wildart,
      erfolgswahrscheinlichkeit: Math.round(spotScore.erfolgswahrscheinlichkeit),
      basedOnEvents: hotspot.count,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    });
  }
  
  return recommendations;
}

// ============================================================
// BEST TIME RECOMMENDATIONS
// ============================================================

async function generateBestTimeRecommendations(
  trainingData: HuntingEvent[],
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  const patterns = analyzeTemporalPatterns(trainingData, wildart);
  const recommendations: Recommendation[] = [];
  
  // Find best hour
  let bestHour = -1;
  let bestRate = 0;
  let bestCount = 0;
  
  for (const [hour, data] of Object.entries(patterns)) {
    if (data.count >= config.schwellwerte.minHistoricalEvents && data.rate > bestRate) {
      bestRate = data.rate;
      bestHour = parseInt(hour);
      bestCount = data.count;
    }
  }
  
  if (bestHour >= 0 && bestRate > 0.3) {
    const now = new Date();
    const nextWindow = new Date(now);
    nextWindow.setHours(bestHour, 0, 0, 0);
    
    if (nextWindow <= now) {
      nextWindow.setDate(nextWindow.getDate() + 1);
    }
    
    const score = Math.round(bestRate * 100);
    
    recommendations.push({
      id: `time_${bestHour}`,
      typ: 'best_time',
      prioritaet: score > 70 ? 'hoch' : 'mittel',
      score,
      confidence: Math.min(90, 40 + bestCount * 3),
      titel: wildart ? `Beste Zeit für ${wildart}` : 'Optimale Jagdzeit',
      beschreibung: `Zwischen ${bestHour}:00 und ${(bestHour + 2) % 24}:00 Uhr liegt die höchste Erfolgsrate.`,
      gruende: [
        `${Math.round(bestRate * 100)}% Erfolgsrate in diesem Zeitfenster`,
        `Basierend auf ${bestCount} historischen Ereignissen`,
        `Durchschnittlich beste Tageszeit`,
      ],
      empfohleneZeit: {
        von: `${bestHour.toString().padStart(2, '0')}:00`,
        bis: `${((bestHour + 2) % 24).toString().padStart(2, '0')}:00`,
      },
      naechstesZeitfenster: nextWindow.toISOString(),
      wildart,
      erfolgswahrscheinlichkeit: Math.round(bestRate * 100),
      basedOnEvents: bestCount,
      generatedAt: new Date().toISOString(),
    });
  }
  
  return recommendations;
}

// ============================================================
// WILDLIFE PREDICTIONS
// ============================================================

async function generateWildlifePredictions(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather | null,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  // Count wildlife species
  const wildartCounts: Record<string, number> = {};
  
  for (const event of trainingData) {
    wildartCounts[event.wildart] = (wildartCounts[event.wildart] || 0) + 1;
  }
  
  const total = trainingData.length;
  const erwarteteWildarten = Object.entries(wildartCounts)
    .map(([wildart, count]) => ({
      wildart,
      wahrscheinlichkeit: Math.round((count / total) * 100),
    }))
    .filter(w => w.wahrscheinlichkeit >= 10)
    .sort((a, b) => b.wahrscheinlichkeit - a.wahrscheinlichkeit)
    .slice(0, 3);
  
  if (erwarteteWildarten.length === 0) return [];
  
  const topWildart = erwarteteWildarten[0];
  
  return [{
    id: `wildlife_${Date.now()}`,
    typ: 'wildlife_prediction',
    prioritaet: topWildart.wahrscheinlichkeit > 50 ? 'hoch' : 'mittel',
    score: topWildart.wahrscheinlichkeit,
    confidence: Math.min(85, 30 + total),
    titel: 'Erwartete Wildarten',
    beschreibung: `Mit ${topWildart.wahrscheinlichkeit}% Wahrscheinlichkeit ist ${topWildart.wildart} zu erwarten.`,
    gruende: erwarteteWildarten.map(w => 
      `${w.wildart}: ${w.wahrscheinlichkeit}% Wahrscheinlichkeit`
    ),
    erwarteteWildarten,
    basedOnEvents: total,
    generatedAt: new Date().toISOString(),
  }];
}

// ============================================================
// WEATHER OPPORTUNITIES
// ============================================================

async function generateWeatherOpportunities(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather,
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  // Analyze if current weather matches historical success patterns
  const now = new Date();
  const currentHour = now.getHours();
  
  // Check wind conditions
  const windOptimal = weather.wind.speedMps > 1 && weather.wind.speedMps < 5;
  
  // Check temperature (mild is usually good)
  const tempOptimal = weather.temperature > 5 && weather.temperature < 20;
  
  // Check if it's dawn or dusk
  const timeOptimal = (currentHour >= 5 && currentHour <= 8) || (currentHour >= 17 && currentHour <= 20);
  
  if (!windOptimal && !tempOptimal && !timeOptimal) {
    return []; // Conditions not optimal
  }
  
  const gruende = [];
  let score = 60;
  
  if (windOptimal) {
    gruende.push(`Optimale Windgeschwindigkeit: ${weather.wind.speedMps.toFixed(1)} m/s`);
    score += 15;
  }
  
  if (tempOptimal) {
    gruende.push(`Angenehme Temperatur: ${weather.temperature}°C`);
    score += 10;
  }
  
  if (timeOptimal) {
    gruende.push(`Beste Tageszeit: ${currentHour < 12 ? 'Morgendämmerung' : 'Abenddämmerung'}`);
    score += 15;
  }
  
  if (weather.scentCarry && weather.scentCarry.quality === 'excellent') {
    gruende.push(`Exzellente Duftverlauf-Bedingungen`);
    score += 10;
  }
  
  return [{
    id: `weather_${Date.now()}`,
    typ: 'weather_opportunity',
    prioritaet: score > 85 ? 'sehr_hoch' : 'hoch',
    score: Math.min(100, score),
    confidence: 75,
    titel: 'Perfekte Wetterbedingungen',
    beschreibung: `Die aktuellen Bedingungen sind optimal für die Jagd!`,
    gruende,
    wildart,
    basedOnEvents: trainingData.length,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1800000).toISOString(), // 30 min
  }];
}

// ============================================================
// SPOT SCORE CALCULATION
// ============================================================

export async function calculateSpotScore(
  position: { latitude: number; longitude: number },
  trainingData: HuntingEvent[],
  weather: EnhancedWeather | null,
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<SpotScore> {
  const weights = config.gewichtung;
  
  // 1. Historical Success (35%)
  const historicalScore = calculateHistoricalScore(position, trainingData, wildart);
  
  // 2. Weather Conditions (25%)
  const weatherScore = weather ? calculateWeatherScore(weather) : 50;
  
  // 3. Time of Day (15%)
  const timeScore = calculateTimeScore(trainingData, wildart);
  
  // 4. Wildlife Affinity (10%)
  const wildartScore = wildart ? calculateWildartScore(position, trainingData, wildart) : 50;
  
  // 5. Moon Phase (5%)
  const moonScore = weather?.moonIllumination !== undefined 
    ? calculateMoonScore(weather.moonIllumination)
    : 50;
  
  // 6. Seasonal Suitability (5%)
  const seasonScore = calculateSeasonScore();
  
  // 7. Last Success Recency (5%)
  const recencyScore = calculateRecencyScore(position, trainingData);
  
  // Calculate weighted total
  const totalScore = Math.round(
    historicalScore * weights.historischerErfolg +
    weatherScore * weights.aktuelleWetterbedingungen +
    timeScore * weights.tageszeit +
    wildartScore * weights.wildartAffinitaet +
    moonScore * weights.mondphase +
    seasonScore * weights.saisonaleEignung +
    recencyScore * weights.letzterErfolg
  );
  
  // Calculate success probability (non-linear)
  // Apply dampening factor (0.8) to prevent overconfidence in extreme scores
  // This makes predictions more conservative and realistic
  const erfolgswahrscheinlichkeit = Math.round(
    50 + (totalScore - 50) * 0.8 // Dampen extremes: 100 score → 90% probability
  );
  
  // Find best hour
  const hourlyPatterns = analyzeTemporalPatterns(trainingData, wildart);
  let bestHour: number | undefined;
  let bestRate = 0;
  
  for (const [hour, data] of Object.entries(hourlyPatterns)) {
    if (data.rate > bestRate && data.count >= 2) {
      bestRate = data.rate;
      bestHour = parseInt(hour);
    }
  }
  
  // Count events near this position
  const nearbyEvents = trainingData.filter(e => {
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      e.gps.latitude,
      e.gps.longitude
    );
    return distance < 1000; // within 1km
  });
  
  // Find most recent success
  const recentSuccesses = nearbyEvents.filter(e => e.erfolg);
  let daysSinceSuccess: number | undefined;
  
  if (recentSuccesses.length > 0) {
    const mostRecent = recentSuccesses.reduce((latest, event) => 
      new Date(event.zeitpunkt) > new Date(latest.zeitpunkt) ? event : latest
    );
    const daysDiff = (Date.now() - new Date(mostRecent.zeitpunkt).getTime()) / (1000 * 60 * 60 * 24);
    daysSinceSuccess = Math.floor(daysDiff);
  }
  
  return {
    totalScore,
    faktoren: {
      historischerErfolg: Math.round(historicalScore),
      aktuelleWetterbedingungen: Math.round(weatherScore),
      tageszeit: Math.round(timeScore),
      wildartAffinitaet: Math.round(wildartScore),
      mondphase: Math.round(moonScore),
      saisonaleEignung: Math.round(seasonScore),
      letzterErfolg: Math.round(recencyScore),
    },
    gewichtungen: weights,
    erfolgswahrscheinlichkeit,
    besteStunde: bestHour,
    metadata: {
      anzahlHistorischerEvents: nearbyEvents.length,
      letzterErfolgVorTagen: daysSinceSuccess,
    },
  };
}

// ============================================================
// SCORE CALCULATION HELPERS
// ============================================================

function calculateHistoricalScore(
  position: { latitude: number; longitude: number },
  trainingData: HuntingEvent[],
  wildart?: string
): number {
  const nearby = trainingData.filter(e => {
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      e.gps.latitude,
      e.gps.longitude
    );
    return distance < 1000 && (!wildart || e.wildart === wildart);
  });
  
  if (nearby.length === 0) return 30; // Low base score
  
  const successes = nearby.filter(e => e.erfolg).length;
  const successRate = successes / nearby.length;
  
  // More events = higher confidence in score
  const eventBonus = Math.min(20, nearby.length * 2);
  
  return Math.min(100, 30 + successRate * 50 + eventBonus);
}

function calculateWeatherScore(weather: EnhancedWeather): number {
  let score = 50;
  
  // Wind: 1-5 m/s is optimal
  if (weather.wind.speedMps >= 1 && weather.wind.speedMps <= 5) {
    score += 25;
  } else if (weather.wind.speedMps < 1) {
    score += 10; // Some wind is better than none
  }
  
  // Temperature: 5-20°C is optimal
  if (weather.temperature >= 5 && weather.temperature <= 20) {
    score += 15;
  }
  
  // No precipitation is better
  if (weather.precipitation.type === 'none') {
    score += 10;
  }
  
  return Math.min(100, score);
}

function calculateTimeScore(trainingData: HuntingEvent[], wildart?: string): number {
  const currentHour = new Date().getHours();
  const patterns = analyzeTemporalPatterns(trainingData, wildart);
  
  if (patterns[currentHour]) {
    return Math.min(100, 50 + patterns[currentHour].rate * 50);
  }
  
  // Dawn (5-8) and dusk (17-20) are generally good
  if ((currentHour >= 5 && currentHour <= 8) || (currentHour >= 17 && currentHour <= 20)) {
    return 70;
  }
  
  return 40;
}

function calculateWildartScore(
  position: { latitude: number; longitude: number },
  trainingData: HuntingEvent[],
  wildart: string
): number {
  const nearby = trainingData.filter(e => {
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      e.gps.latitude,
      e.gps.longitude
    );
    return distance < 1000;
  });
  
  const wildartEvents = nearby.filter(e => e.wildart === wildart);
  
  if (nearby.length === 0) return 50;
  
  const affinity = wildartEvents.length / nearby.length;
  return Math.round(50 + affinity * 50);
}

function calculateMoonScore(illumination: number): number {
  // Full moon (high illumination) is generally better for hunting
  return Math.round(50 + (illumination / 100) * 50);
}

function calculateSeasonScore(): number {
  const month = new Date().getMonth() + 1;
  
  // Prime hunting months in Germany: Sep-Jan
  if (month >= 9 || month <= 1) return 80;
  
  // Spring/Summer: lower but not zero
  if (month >= 3 && month <= 8) return 50;
  
  return 60;
}

function calculateRecencyScore(
  position: { latitude: number; longitude: number },
  trainingData: HuntingEvent[]
): number {
  const nearby = trainingData.filter(e => {
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      e.gps.latitude,
      e.gps.longitude
    );
    return distance < 1000 && e.erfolg;
  });
  
  if (nearby.length === 0) return 50; // Neutral
  
  const mostRecent = nearby.reduce((latest, event) =>
    new Date(event.zeitpunkt) > new Date(latest.zeitpunkt) ? event : latest
  );
  
  const daysSince = (Date.now() - new Date(mostRecent.zeitpunkt).getTime()) / (1000 * 60 * 60 * 24);
  
  // Optimal: 7-30 days since last success
  if (daysSince >= 7 && daysSince <= 30) return 80;
  if (daysSince < 7) return 40; // Too recent
  if (daysSince <= 60) return 60;
  
  return 40; // Too long ago
}

// ============================================================
// HEATMAP GENERATION
// ============================================================

export async function generateHeatmap(
  revierId: string,
  wildart?: string
): Promise<HeatmapPoint[]> {
  const trainingData = await collectTrainingData(revierId);
  
  if (trainingData.length === 0) return [];
  
  const hotspots = analyzeSpatialHotspots(trainingData, wildart, 30);
  
  return hotspots.map(hotspot => {
    const intensity = Math.min(100, Math.round(hotspot.successRate * 100 + hotspot.count * 5));
    const radius = Math.min(500, 100 + hotspot.count * 20);
    
    return {
      gps: {
        latitude: hotspot.lat,
        longitude: hotspot.lon,
      },
      intensity,
      radius,
      eventCount: hotspot.count,
      successCount: Math.round(hotspot.count * hotspot.successRate),
      successRate: hotspot.successRate,
    };
  });
}
