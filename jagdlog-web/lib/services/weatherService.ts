import { EnhancedWeather, WeatherForecast, CloudCoverType } from '../types/weather';

// Cache
interface WeatherCache {
  [key: string]: {
    data: EnhancedWeather;
    timestamp: number;
  };
}

let weatherCache: WeatherCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten

/**
 * Haupt-Funktion: Holt erweiterte Wetterdaten
 * Primary: OpenMeteo (kostenlos, keine API-Key!)
 * Secondary: OpenWeatherMap (optional, für Details)
 * Tertiary: DWD (Deutschland, Radar)
 */
export async function getEnhancedWeather(
  lat: number,
  lon: number,
  forceRefresh = false
): Promise<EnhancedWeather | null> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = weatherCache[cacheKey];
  
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('[Weather] Using cached data');
    return cached.data;
  }

  try {
    // Primary: OpenMeteo (kostenlos!)
    const weather = await fetchFromOpenMeteo(lat, lon);
    
    if (weather) {
      // Cache
      weatherCache[cacheKey] = {
        data: weather,
        timestamp: Date.now(),
      };
      
      return weather;
    }
  } catch (error) {
    console.error('[Weather] Error fetching:', error);
    // Fallback zu Mock-Daten
    return generateMockWeather(lat, lon);
  }

  return null;
}

/**
 * OpenMeteo API - Primary Provider (KOSTENLOS!)
 * https://open-meteo.com/
 */
async function fetchFromOpenMeteo(
  lat: number,
  lon: number
): Promise<EnhancedWeather | null> {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?' +
      `latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,weather_code,' +
      'wind_speed_10m,wind_direction_10m,wind_gusts_10m,' +
      'pressure_msl,visibility,cloud_cover&' +
      'timezone=auto&wind_speed_unit=ms';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const current = data.current;
    
    // Helper: Degrees to Cardinal
    const windCardinal = degToCardinal(current.wind_direction_10m);
    
    // Helper: Mondphase berechnen
    const moonData = calculateMoonPhase(new Date());
    
    // Helper: Duftverlauf berechnen
    const scentCarry = calculateScentCarry(
      current.wind_direction_10m,
      current.wind_speed_10m,
      current.temperature_2m,
      current.relative_humidity_2m
    );
    
    const weather: EnhancedWeather = {
      id: crypto.randomUUID(),
      location: { latitude: lat, longitude: lon },
      timestamp: new Date().toISOString(),
      
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl,
      visibility: current.visibility || 10000,
      
      wind: {
        directionDegrees: current.wind_direction_10m,
        directionCardinal: windCardinal,
        speedMps: current.wind_speed_10m,
        speedKmh: current.wind_speed_10m * 3.6,
        speedBft: msToBft(current.wind_speed_10m),
        gustsMps: current.wind_gusts_10m,
        confidence: 0.95,
        source: 'api',
        measuredAt: new Date().toISOString(),
      },
      
      cloudLayers: [
        {
          altitude: 0,
          coverage: cloudCoverToEnum(current.cloud_cover),
          cloudType: 'unknown',
          temperature: current.temperature_2m,
        }
      ],
      
      precipitation: {
        type: 'none',
        intensity: 'none',
      },
      
      moonPhase: moonData.phase,
      moonIllumination: moonData.illumination,
      
      scentCarry,
      
      source: 'openmeteo',
      dataQuality: 0.9,
      updatedAt: new Date().toISOString(),
    };
    
    return weather;
  } catch (error) {
    console.error('[OpenMeteo] Error:', error);
    return null;
  }
}

/**
 * 5-Tage Vorhersage
 */
export async function getWeatherForecast(
  lat: number,
  lon: number
): Promise<WeatherForecast | null> {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?' +
      `latitude=${lat}&longitude=${lon}` +
      '&hourly=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover&' +
      'timezone=auto&forecast_days=5&wind_speed_unit=ms';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    const forecasts = data.hourly.time.slice(0, 72).map((time: string, idx: number) => ({
      time: new Date(time).toISOString(),
      temperature: data.hourly.temperature_2m[idx],
      wind: {
        directionDegrees: data.hourly.wind_direction_10m[idx],
        speedMps: data.hourly.wind_speed_10m[idx],
      },
      precipitation: {
        type: data.hourly.precipitation[idx] > 0 ? 'rain' : 'none',
        intensity: 'moderate',
      },
      cloudCover: data.hourly.cloud_cover[idx],
    }));
    
    // Beste Jagdzeit finden
    const bestIndex = forecasts.findIndex((f: any) => 
      f.wind.speedMps > 1 && 
      f.wind.speedMps < 5 &&
      f.precipitation.type === 'none'
    );
    
    return {
      id: crypto.randomUUID(),
      location: { latitude: lat, longitude: lon },
      forecasts,
      summary: 'Gute Bedingungen für die nächsten 3 Tage',
      bestHuntingTime: bestIndex >= 0 ? {
        start: new Date(forecasts[bestIndex].time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        end: new Date(new Date(forecasts[bestIndex].time).getTime() + 3600000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        reason: 'Optimale Wind- und Wetterbedingungen',
      } : undefined,
      source: 'openmeteo',
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    };
  } catch (error) {
    console.error('[Forecast] Error:', error);
    return null;
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function degToCardinal(deg: number): 'N' | 'NNE' | 'NE' | 'ENE' | 'E' | 'ESE' | 'SE' | 'SSE' | 'S' | 'SSW' | 'SW' | 'WSW' | 'W' | 'WNW' | 'NW' | 'NNW' {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] as const;
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function msToBft(mps: number): number {
  const bft = 0.836653 * Math.pow(mps, 0.6666);
  return Math.min(Math.round(bft), 12);
}

function calculateScentCarry(
  windDeg: number,
  windSpeed: number,
  temp: number,
  humidity: number
): { direction: number; distance: number; quality: 'excellent' | 'good' | 'moderate' | 'poor'; explanation: string } {
  const distanceFactor = windSpeed > 0 ? windSpeed * 50 : 10;
  const quality = windSpeed > 3 ? 'excellent' : windSpeed > 1 ? 'good' : 'moderate';
  
  return {
    direction: windDeg,
    distance: Math.round(distanceFactor),
    quality: quality as 'excellent' | 'good' | 'moderate' | 'poor',
    explanation: `Wind trägt Duftverlauf bis zu ${Math.round(distanceFactor)}m in ${degToCardinal(windDeg)}-Richtung`,
  };
}

function calculateMoonPhase(date: Date): { phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent'; illumination: number } {
  const phases = [
    'new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'
  ] as const;
  
  const knownNewMoon = new Date('2024-01-11');
  const daysSince = Math.floor((date.getTime() - knownNewMoon.getTime()) / 86400000);
  const dayInCycle = daysSince % 29.53;
  const illumination = Math.round((dayInCycle / 29.53) * 100);
  const phaseIndex = Math.floor((dayInCycle / 29.53) * 8) % 8;
  
  return {
    phase: phases[phaseIndex],
    illumination,
  };
}

function cloudCoverToEnum(coverage: number): CloudCoverType {
  if (coverage <= 10) return CloudCoverType.CLEAR;
  if (coverage <= 25) return CloudCoverType.MOSTLY_CLEAR;
  if (coverage <= 50) return CloudCoverType.SCATTERED;
  if (coverage <= 75) return CloudCoverType.BROKEN;
  if (coverage <= 90) return CloudCoverType.MOSTLY_CLOUDY;
  return CloudCoverType.OVERCAST;
}

function generateMockWeather(lat: number, lon: number): EnhancedWeather {
  const now = new Date();
  const randomWind = Math.random() * 360;
  const randomSpeed = Math.random() * 8 + 2;
  
  return {
    id: crypto.randomUUID(),
    location: { latitude: lat, longitude: lon },
    timestamp: now.toISOString(),
    temperature: 12,
    humidity: 65,
    visibility: 5000,
    
    wind: {
      directionDegrees: Math.round(randomWind),
      directionCardinal: degToCardinal(randomWind),
      speedMps: randomSpeed,
      speedKmh: randomSpeed * 3.6,
      speedBft: msToBft(randomSpeed),
      confidence: 0.6,
      source: 'manual',
      measuredAt: now.toISOString(),
    },
    
    cloudLayers: [{ altitude: 0, coverage: CloudCoverType.SCATTERED, cloudType: 'cumulus', temperature: 12 }],
    precipitation: { type: 'none', intensity: 'none' },
    
    moonPhase: 'full',
    moonIllumination: 100,
    
    scentCarry: calculateScentCarry(randomWind, randomSpeed, 12, 65),
    
    source: 'cache',
    dataQuality: 0.5,
    updatedAt: now.toISOString(),
  };
}
