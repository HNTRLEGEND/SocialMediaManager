/**
 * Weather Service
 * Uses configurable API URL and caching
 */

import { config } from '@/lib/config';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  pressure: number;
  timestamp: Date;
}

export interface EnhancedWeather extends WeatherData {
  condition: string;
  recommendation: string;
}

// Cache implementation
const weatherCache = new Map<string, { data: EnhancedWeather; timestamp: number }>();

/**
 * Fetch weather data for coordinates
 */
export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<EnhancedWeather> {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  
  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < config.cache.weatherTTL) {
    return cached.data;
  }
  
  try {
    // Use system timezone or default to Europe/Berlin
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
    const url = `${config.api.weather}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation,cloud_cover,visibility,pressure_msl&timezone=${encodeURIComponent(timezone)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    const weather = parseWeatherData(data, latitude, longitude);
    
    // Update cache
    weatherCache.set(cacheKey, { data: weather, timestamp: Date.now() });
    
    return weather;
  } catch (error) {
    console.error('[Weather] Fetch error:', error);
    return getMockWeatherData(latitude, longitude);
  }
}

/**
 * Parse API response into our format
 */
function parseWeatherData(data: any, latitude: number, longitude: number): EnhancedWeather {
  // Validate data structure
  if (!data || typeof data !== 'object' || !data.current) {
    console.error('[Weather] Invalid API response structure');
    return getMockWeatherData(latitude, longitude);
  }
  
  const current = data.current;
  
  const weather: WeatherData = {
    temperature: typeof current.temperature_2m === 'number' ? current.temperature_2m : 0,
    windSpeed: typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : 0,
    windDirection: typeof current.wind_direction_10m === 'number' ? current.wind_direction_10m : 0,
    humidity: typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : 0,
    precipitation: typeof current.precipitation === 'number' ? current.precipitation : 0,
    cloudCover: typeof current.cloud_cover === 'number' ? current.cloud_cover : 0,
    visibility: typeof current.visibility === 'number' ? current.visibility : 10000,
    pressure: typeof current.pressure_msl === 'number' ? current.pressure_msl : 1013,
    timestamp: new Date(),
  };
  
  return enhanceWeatherData(weather);
}

/**
 * Add hunting-specific recommendations
 */
function enhanceWeatherData(data: WeatherData): EnhancedWeather {
  let condition = 'Gut';
  let recommendation = 'Gute Bedingungen für die Jagd';
  
  // Analyze conditions
  if (data.precipitation > 5) {
    condition = 'Regen';
    recommendation = 'Starker Regen - Wild sucht Deckung';
  } else if (data.windSpeed > 20) {
    condition = 'Windig';
    recommendation = 'Starker Wind - Witterung schwierig';
  } else if (data.temperature < 0) {
    condition = 'Kalt';
    recommendation = 'Kälte - Wild ist aktiv auf Futtersuche';
  } else if (data.cloudCover > 80) {
    condition = 'Bewölkt';
    recommendation = 'Bedeckt - Gute Sichtverhältnisse';
  }
  
  return {
    ...data,
    condition,
    recommendation,
  };
}

/**
 * Fallback mock data when API fails
 */
function getMockWeatherData(latitude: number, longitude: number): EnhancedWeather {
  return {
    temperature: 12,
    windSpeed: 8,
    windDirection: 180,
    humidity: 65,
    precipitation: 0,
    cloudCover: 40,
    visibility: 10000,
    pressure: 1015,
    timestamp: new Date(),
    condition: 'Mock Daten',
    recommendation: 'API nicht verfügbar - Mock Daten werden angezeigt',
  };
}

/**
 * Clear weather cache (useful for testing)
 */
export function clearWeatherCache(): void {
  weatherCache.clear();
}
