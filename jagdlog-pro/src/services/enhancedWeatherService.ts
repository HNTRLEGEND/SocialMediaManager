/**
 * PHASE 4: Enhanced Weather Service
 * Multi-Source Weather Data mit Open-Meteo, OpenWeatherMap, DWD
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EnhancedWeather,
  WindVector,
  ScentCarry,
  MoonPhase,
  SunData,
  RadarData,
  WeatherAlert,
  OpenMeteoResponse,
  OpenWeatherMapResponse,
  DWDRadarResponse,
  PrecipitationData,
  CloudLayer,
  HuntingCondition,
  WeatherCache,
} from '../types/weather';

// ===========================
// API CONFIGURATION
// ===========================

const API_KEYS = {
  openWeatherMap: '', // Optional - User kann eigenen Key eingeben
  rainViewer: '', // Optional
};

const API_URLS = {
  openMeteo: 'https://api.open-meteo.com/v1/forecast',
  openWeatherMap: 'https://api.openweathermap.org/data/2.5/weather',
  openWeatherMapOneCall: 'https://api.openweathermap.org/data/2.5/onecall',
  dwdRadar: 'https://www.dwd.de/DWD/wetter/radar/radfilm_brd_akt.gif',
  rainViewer: 'https://api.rainviewer.com/public/weather-maps.json',
};

// ===========================
// CACHE MANAGEMENT
// ===========================

const CACHE_DURATION = {
  weather: 10 * 60 * 1000, // 10 Minuten
  radar: 5 * 60 * 1000, // 5 Minuten
  forecast: 30 * 60 * 1000, // 30 Minuten
};

async function getCachedWeather(
  lat: number,
  lon: number
): Promise<EnhancedWeather | null> {
  try {
    const key = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const data: WeatherCache = JSON.parse(cached);
    const now = new Date();
    const expiry = new Date(data.expiresAt);

    if (now < expiry) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

async function setCachedWeather(
  lat: number,
  lon: number,
  data: EnhancedWeather
): Promise<void> {
  try {
    const key = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION.weather);

    const cache: WeatherCache = {
      key,
      data,
      timestamp: now,
      expiresAt,
    };

    await AsyncStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// ===========================
// OPEN-METEO API (Primary Source - FREE!)
// ===========================

export async function fetchFromOpenMeteo(
  lat: number,
  lon: number
): Promise<Partial<EnhancedWeather>> {
  try {
    const params = {
      latitude: lat,
      longitude: lon,
      current_weather: true,
      hourly: [
        'temperature_2m',
        'precipitation',
        'precipitation_probability',
        'cloudcover',
        'windspeed_10m',
        'winddirection_10m',
        'relativehumidity_2m',
        'pressure_msl',
        'dewpoint_2m',
        'visibility',
      ].join(','),
      daily: ['sunrise', 'sunset'],
      timezone: 'auto',
      forecast_days: 1,
    };

    const response = await axios.get<OpenMeteoResponse>(API_URLS.openMeteo, {
      params,
      timeout: 10000,
    });

    const data = response.data;
    const current = data.current_weather;
    const hourly = data.hourly;

    // Finde aktuelle Stunde
    const now = new Date();
    let currentIndex = 0;
    if (hourly && hourly.time) {
      currentIndex = hourly.time.findIndex((time) => {
        const timeDate = new Date(time);
        return timeDate.getTime() >= now.getTime();
      });
      if (currentIndex === -1) currentIndex = 0;
    }

    // Wind-Vektor berechnen
    const wind: WindVector = {
      speed: current.windspeed / 3.6, // km/h -> m/s
      speedKmh: current.windspeed,
      speedBeaufort: windSpeedToBeaufort(current.windspeed / 3.6),
      direction: current.winddirection,
      directionCardinal: degreesToCardinal(current.winddirection),
      gust: undefined,
      gustKmh: undefined,
    };

    // Niederschlag
    const precipitation: PrecipitationData = {
      intensity: hourly?.precipitation?.[currentIndex] || 0,
      probability:
        hourly?.precipitation_probability?.[currentIndex] || 0,
      type: getPrecipitationType(
        current.temperature,
        hourly?.precipitation?.[currentIndex] || 0
      ),
      accumulation: hourly?.precipitation?.[currentIndex] || 0,
    };

    // Wolken
    const clouds: CloudLayer = {
      coverage: hourly?.cloudcover?.[currentIndex] || 0,
      type: cloudCoverageToType(hourly?.cloudcover?.[currentIndex] || 0),
    };

    return {
      location: {
        latitude: lat,
        longitude: lon,
      },
      timestamp: new Date(current.time),
      timezone: data.timezone,
      current: {
        temperature: current.temperature,
        feelsLike: calculateFeelsLike(
          current.temperature,
          current.windspeed / 3.6,
          hourly?.relativehumidity_2m?.[currentIndex] || 70
        ),
        humidity: hourly?.relativehumidity_2m?.[currentIndex] || 70,
        pressure: hourly?.pressure_msl?.[currentIndex] || 1013,
        dewPoint: hourly?.dewpoint_2m?.[currentIndex] || current.temperature - 5,
        visibility: (hourly?.visibility?.[currentIndex] || 10000) * 1000,
        uvIndex: 0,
        cloudCover: hourly?.cloudcover?.[currentIndex] || 0,
        weatherCode: current.weathercode,
        weatherDescription: weatherCodeToDescription(current.weathercode),
      },
      wind,
      precipitation,
      clouds,
      source: 'open-meteo',
      lastUpdated: new Date(),
      cacheExpiry: new Date(Date.now() + CACHE_DURATION.weather),
    };
  } catch (error) {
    console.error('Open-Meteo fetch error:', error);
    throw error;
  }
}

// ===========================
// OPENWEATHERMAP API (Fallback)
// ===========================

export async function fetchFromOpenWeatherMap(
  lat: number,
  lon: number
): Promise<Partial<EnhancedWeather>> {
  if (!API_KEYS.openWeatherMap) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  try {
    const response = await axios.get<OpenWeatherMapResponse>(
      API_URLS.openWeatherMap,
      {
        params: {
          lat,
          lon,
          appid: API_KEYS.openWeatherMap,
          units: 'metric',
          lang: 'de',
        },
        timeout: 10000,
      }
    );

    const data = response.data;

    const wind: WindVector = {
      speed: data.wind.speed,
      speedKmh: data.wind.speed * 3.6,
      speedBeaufort: windSpeedToBeaufort(data.wind.speed),
      direction: data.wind.deg,
      directionCardinal: degreesToCardinal(data.wind.deg),
      gust: data.wind.gust,
      gustKmh: data.wind.gust ? data.wind.gust * 3.6 : undefined,
    };

    const precipitationIntensity =
      (data.rain?.['1h'] || data.snow?.['1h'] || 0);

    const precipitation: PrecipitationData = {
      intensity: precipitationIntensity,
      probability: 0,
      type: getPrecipitationType(data.main.temp, precipitationIntensity),
      accumulation: data.rain?.['3h'] || data.snow?.['3h'],
    };

    const clouds: CloudLayer = {
      coverage: data.clouds.all,
      type: cloudCoverageToType(data.clouds.all),
    };

    return {
      location: {
        latitude: lat,
        longitude: lon,
        name: data.name,
      },
      timestamp: new Date(data.dt * 1000),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      current: {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        dewPoint: calculateDewPoint(data.main.temp, data.main.humidity),
        visibility: 10000,
        uvIndex: 0,
        cloudCover: data.clouds.all,
        weatherCode: data.weather[0].id,
        weatherDescription: data.weather[0].description,
      },
      wind,
      precipitation,
      clouds,
      source: 'openweathermap',
      lastUpdated: new Date(),
      cacheExpiry: new Date(Date.now() + CACHE_DURATION.weather),
    };
  } catch (error) {
    console.error('OpenWeatherMap fetch error:', error);
    throw error;
  }
}

// ===========================
// DWD RADAR (Deutschland)
// ===========================

export async function fetchDWDRadar(
  bounds: { north: number; south: number; east: number; west: number }
): Promise<RadarData> {
  try {
    // DWD Radar ist ein statisches Bild
    const radarData: RadarData = {
      timestamp: new Date(),
      bounds,
      imageUrl: API_URLS.dwdRadar,
      resolution: 1, // km pro Pixel (Schätzung)
      source: 'dwd',
    };

    return radarData;
  } catch (error) {
    console.error('DWD Radar fetch error:', error);
    throw error;
  }
}

// ===========================
// SCENT CARRY CALCULATION
// ===========================

export function calculateScentCarry(
  temperature: number,
  humidity: number,
  windSpeed: number,
  windDirection: number,
  pressure: number,
  cloudCover: number
): ScentCarry {
  // Faktoren die Witterung beeinflussen:
  // - Temperatur (optimal: 5-15°C)
  // - Luftfeuchtigkeit (optimal: 60-80%)
  // - Windgeschwindigkeit (optimal: 1-3 m/s)
  // - Luftdruck-Tendenz (steigend = besser)
  // - Stabilität der Luftschichten

  let score = 100;

  // Temperatur-Bewertung
  if (temperature < 0) score -= 20;
  else if (temperature < 5) score -= 10;
  else if (temperature > 20) score -= 15;
  else if (temperature > 25) score -= 25;

  // Luftfeuchtigkeits-Bewertung
  if (humidity < 40) score -= 30;
  else if (humidity < 50) score -= 15;
  else if (humidity > 90) score -= 20;
  else if (humidity >= 60 && humidity <= 80) score += 10;

  // Wind-Bewertung
  if (windSpeed < 0.5) score -= 25; // Zu schwach
  else if (windSpeed > 5) score -= 30; // Zu stark
  else if (windSpeed >= 1 && windSpeed <= 3) score += 15; // Optimal

  // Bewölkungs-Bewertung (bedeckt = stabiler)
  if (cloudCover > 70) score += 10;
  else if (cloudCover < 20) score -= 10;

  // Stabilität schätzen
  const stability: 'stable' | 'unstable' | 'neutral' =
    cloudCover > 70 ? 'stable' : cloudCover < 30 ? 'unstable' : 'neutral';

  // Score begrenzen
  score = Math.max(0, Math.min(100, score));

  // Qualität bestimmen
  let quality: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
  if (score >= 80) quality = 'excellent';
  else if (score >= 60) quality = 'good';
  else if (score >= 40) quality = 'moderate';
  else if (score >= 20) quality = 'poor';
  else quality = 'very_poor';

  // Reichweite schätzen (in Metern)
  const baseDistance = 100;
  const distance = baseDistance * (score / 100) * (windSpeed + 0.5);

  // Empfehlung generieren
  let recommendation = '';
  if (quality === 'excellent') {
    recommendation =
      'Hervorragende Witterung! Wild wird dich schwer wittern.';
  } else if (quality === 'good') {
    recommendation = 'Gute Bedingungen für die Jagd.';
  } else if (quality === 'moderate') {
    recommendation =
      'Akzeptable Bedingungen. Wind beachten!';
  } else if (quality === 'poor') {
    recommendation =
      'Schwierige Bedingungen. Wild wird dich leicht wittern.';
  } else {
    recommendation =
      'Sehr schlechte Witterung. Ansitz ggf. verschieben.';
  }

  return {
    quality,
    score,
    direction: windDirection,
    distance: Math.round(distance),
    factors: {
      temperature,
      humidity,
      windSpeed,
      stability,
      barometricTrend: 'steady', // Würde echte Daten benötigen
    },
    recommendation,
  };
}

// ===========================
// MOON PHASE CALCULATION
// ===========================

export function calculateMoonPhase(date: Date): MoonPhase {
  const lunarCycleDays = 29.53058867;
  const knownNewMoon = new Date('2024-01-11T11:57:00Z'); // Bekanntes Neumond-Datum

  const diffMs = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const moonAge =
    ((diffDays % lunarCycleDays) + lunarCycleDays) % lunarCycleDays;
  const phase = moonAge / lunarCycleDays;

  let phaseName:
    | 'new_moon'
    | 'waxing_crescent'
    | 'first_quarter'
    | 'waxing_gibbous'
    | 'full_moon'
    | 'waning_gibbous'
    | 'last_quarter'
    | 'waning_crescent';

  if (moonAge < 1.85) phaseName = 'new_moon';
  else if (moonAge < 7.38) phaseName = 'waxing_crescent';
  else if (moonAge < 9.23) phaseName = 'first_quarter';
  else if (moonAge < 14.77) phaseName = 'waxing_gibbous';
  else if (moonAge < 16.61) phaseName = 'full_moon';
  else if (moonAge < 22.15) phaseName = 'waning_gibbous';
  else if (moonAge < 24.0) phaseName = 'last_quarter';
  else phaseName = 'waning_crescent';

  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) * 50);

  return {
    phase,
    phaseName,
    illumination,
    isUp: false, // Würde echte Berechnung benötigen
  };
}

// ===========================
// SUN DATA CALCULATION
// ===========================

export function calculateSunData(
  date: Date,
  latitude: number,
  longitude: number
): SunData {
  // Vereinfachte Berechnung - in Produktion SunCalc Library verwenden
  const sunrise = new Date(date);
  sunrise.setHours(6, 30, 0, 0);

  const sunset = new Date(date);
  sunset.setHours(18, 30, 0, 0);

  const civilDawn = new Date(sunrise);
  civilDawn.setMinutes(civilDawn.getMinutes() - 30);

  const civilDusk = new Date(sunset);
  civilDusk.setMinutes(civilDusk.getMinutes() + 30);

  const nauticalDawn = new Date(sunrise);
  nauticalDawn.setMinutes(nauticalDawn.getMinutes() - 60);

  const nauticalDusk = new Date(sunset);
  nauticalDusk.setMinutes(nauticalDusk.getMinutes() + 60);

  const astronomicalDawn = new Date(sunrise);
  astronomicalDawn.setMinutes(astronomicalDawn.getMinutes() - 90);

  const astronomicalDusk = new Date(sunset);
  astronomicalDusk.setMinutes(astronomicalDusk.getMinutes() + 90);

  const solarNoon = new Date(
    (sunrise.getTime() + sunset.getTime()) / 2
  );

  const dayLength = (sunset.getTime() - sunrise.getTime()) / 1000;

  const now = new Date();
  const isDay = now >= sunrise && now <= sunset;

  return {
    sunrise,
    sunset,
    solarNoon,
    civilDawn,
    civilDusk,
    nauticalDawn,
    nauticalDusk,
    astronomicalDawn,
    astronomicalDusk,
    dayLength,
    isDay,
  };
}

// ===========================
// MAIN FUNCTION: GET ENHANCED WEATHER
// ===========================

export async function getEnhancedWeather(
  latitude: number,
  longitude: number
): Promise<EnhancedWeather> {
  // Check cache first
  const cached = await getCachedWeather(latitude, longitude);
  if (cached) {
    return cached;
  }

  try {
    // Primary: Open-Meteo (kostenlos!)
    let weatherData = await fetchFromOpenMeteo(latitude, longitude);

    // Falls Open-Meteo fehlschlägt, OpenWeatherMap probieren
    if (!weatherData.current) {
      try {
        weatherData = await fetchFromOpenWeatherMap(latitude, longitude);
      } catch (error) {
        console.error('Both APIs failed, using fallback data');
        weatherData = getFallbackWeather(latitude, longitude);
      }
    }

    // Erweiterte Berechnungen
    const moon = calculateMoonPhase(new Date());
    const sun = calculateSunData(new Date(), latitude, longitude);

    const scentCarry = calculateScentCarry(
      weatherData.current?.temperature || 10,
      weatherData.current?.humidity || 70,
      weatherData.wind?.speed || 2,
      weatherData.wind?.direction || 0,
      weatherData.current?.pressure || 1013,
      weatherData.current?.cloudCover || 50
    );

    const enhancedWeather: EnhancedWeather = {
      ...weatherData,
      location: {
        latitude,
        longitude,
        name: weatherData.location?.name,
      },
      timestamp: weatherData.timestamp || new Date(),
      timezone: weatherData.timezone || 'Europe/Berlin',
      current: weatherData.current!,
      wind: weatherData.wind!,
      precipitation: weatherData.precipitation!,
      clouds: weatherData.clouds!,
      sun,
      moon,
      scentCarry,
      source: weatherData.source || 'open-meteo',
      lastUpdated: new Date(),
      cacheExpiry: new Date(Date.now() + CACHE_DURATION.weather),
    };

    // Cache speichern
    await setCachedWeather(latitude, longitude, enhancedWeather);

    return enhancedWeather;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return getFallbackWeather(latitude, longitude);
  }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function windSpeedToBeaufort(speedMs: number): number {
  if (speedMs < 0.3) return 0;
  if (speedMs < 1.6) return 1;
  if (speedMs < 3.4) return 2;
  if (speedMs < 5.5) return 3;
  if (speedMs < 8.0) return 4;
  if (speedMs < 10.8) return 5;
  if (speedMs < 13.9) return 6;
  if (speedMs < 17.2) return 7;
  if (speedMs < 20.8) return 8;
  if (speedMs < 24.5) return 9;
  if (speedMs < 28.5) return 10;
  if (speedMs < 32.7) return 11;
  return 12;
}

function degreesToCardinal(
  degrees: number
): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' {
  const cardinals: Array<'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'> = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
  ];
  const index = Math.round(((degrees % 360) / 45) % 8);
  return cardinals[index];
}

function getPrecipitationType(
  temperature: number,
  intensity: number
): 'none' | 'rain' | 'drizzle' | 'snow' | 'sleet' | 'hail' {
  if (intensity === 0) return 'none';
  if (temperature < -2) return 'snow';
  if (temperature < 2) return 'sleet';
  if (intensity < 2.5) return 'drizzle';
  return 'rain';
}

function cloudCoverageToType(
  coverage: number
): 'clear' | 'few' | 'scattered' | 'broken' | 'overcast' {
  if (coverage < 12.5) return 'clear';
  if (coverage < 37.5) return 'few';
  if (coverage < 62.5) return 'scattered';
  if (coverage < 87.5) return 'broken';
  return 'overcast';
}

function calculateFeelsLike(
  temp: number,
  windSpeedMs: number,
  humidity: number
): number {
  // Windchill für kalte Temperaturen
  if (temp <= 10 && windSpeedMs > 1.34) {
    const windSpeedKmh = windSpeedMs * 3.6;
    return Math.round(
      13.12 +
        0.6215 * temp -
        11.37 * Math.pow(windSpeedKmh, 0.16) +
        0.3965 * temp * Math.pow(windSpeedKmh, 0.16)
    );
  }

  // Heat Index für warme Temperaturen
  if (temp >= 27) {
    const heatIndex =
      -8.78469475556 +
      1.61139411 * temp +
      2.33854883889 * humidity +
      -0.14611605 * temp * humidity +
      -0.012308094 * temp * temp +
      -0.0164248277778 * humidity * humidity +
      0.002211732 * temp * temp * humidity +
      0.00072546 * temp * humidity * humidity +
      -0.000003582 * temp * temp * humidity * humidity;
    return Math.round(heatIndex);
  }

  return temp;
}

function calculateDewPoint(temperature: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

function weatherCodeToDescription(code: number): string {
  // WMO Weather Code
  const codes: Record<number, string> = {
    0: 'Klar',
    1: 'Überwiegend klar',
    2: 'Teilweise bewölkt',
    3: 'Bedeckt',
    45: 'Nebel',
    48: 'Gefrierender Nebel',
    51: 'Leichter Nieselregen',
    53: 'Nieselregen',
    55: 'Starker Nieselregen',
    61: 'Leichter Regen',
    63: 'Regen',
    65: 'Starker Regen',
    71: 'Leichter Schneefall',
    73: 'Schneefall',
    75: 'Starker Schneefall',
    77: 'Schneegriesel',
    80: 'Leichte Regenschauer',
    81: 'Regenschauer',
    82: 'Starke Regenschauer',
    85: 'Leichte Schneeschauer',
    86: 'Schneeschauer',
    95: 'Gewitter',
    96: 'Gewitter mit Hagel',
    99: 'Schweres Gewitter mit Hagel',
  };
  return codes[code] || 'Unbekannt';
}

function getFallbackWeather(
  latitude: number,
  longitude: number
): EnhancedWeather {
  // Demo-Daten für Offline-Betrieb
  const now = new Date();

  return {
    location: { latitude, longitude },
    timestamp: now,
    timezone: 'Europe/Berlin',
    current: {
      temperature: 8,
      feelsLike: 6,
      humidity: 75,
      pressure: 1013,
      dewPoint: 4,
      visibility: 10000,
      uvIndex: 2,
      cloudCover: 40,
      weatherCode: 2,
      weatherDescription: 'Teilweise bewölkt',
    },
    wind: {
      speed: 2.5,
      speedKmh: 9,
      speedBeaufort: 2,
      direction: 270,
      directionCardinal: 'W',
    },
    precipitation: {
      intensity: 0,
      probability: 10,
      type: 'none',
    },
    clouds: {
      coverage: 40,
      type: 'scattered',
    },
    sun: calculateSunData(now, latitude, longitude),
    moon: calculateMoonPhase(now),
    scentCarry: calculateScentCarry(8, 75, 2.5, 270, 1013, 40),
    source: 'combined',
    lastUpdated: now,
    cacheExpiry: new Date(now.getTime() + CACHE_DURATION.weather),
  };
}

// Hunting Condition Berechnung
export function calculateHuntingCondition(
  weather: EnhancedWeather
): HuntingCondition {
  const { scentCarry, wind, sun, precipitation, current } = weather;

  // Wild-Aktivität basierend auf Wetter schätzen
  let wildActivity = 70; // Basis

  // Regen reduziert Aktivität
  if (precipitation.type !== 'none') wildActivity -= 20;

  // Starker Wind reduziert Aktivität
  if (wind.speedBeaufort > 5) wildActivity -= 15;

  // Dämmerung erhöht Aktivität
  const now = new Date();
  const isDawn =
    now >= sun.civilDawn && now <= new Date(sun.sunrise.getTime() + 60 * 60 * 1000);
  const isDusk =
    now >= new Date(sun.sunset.getTime() - 60 * 60 * 1000) && now <= sun.civilDusk;

  if (isDawn || isDusk) wildActivity += 20;

  // Temperatur
  if (current.temperature < -10) wildActivity -= 15;
  if (current.temperature > 25) wildActivity -= 10;

  wildActivity = Math.max(0, Math.min(100, wildActivity));

  // Sichtbarkeit
  const visibility = Math.min(100, (current.visibility / 10000) * 100);

  // Wetter-Stabilität
  const weatherStability = precipitation.type === 'none' ? 80 : 40;

  // Gesamt-Bewertung
  const overall =
    (scentCarry.score * 0.4 +
      visibility * 0.2 +
      weatherStability * 0.2 +
      wildActivity * 0.2) /
    100;

  let overallRating: 'excellent' | 'good' | 'moderate' | 'poor' | 'unsuitable';
  if (overall >= 0.8) overallRating = 'excellent';
  else if (overall >= 0.6) overallRating = 'good';
  else if (overall >= 0.4) overallRating = 'moderate';
  else if (overall >= 0.2) overallRating = 'poor';
  else overallRating = 'unsuitable';

  const recommendations: string[] = [];
  if (scentCarry.quality === 'excellent') {
    recommendations.push('Perfekte Witterung für Ansitz');
  }
  if (isDawn || isDusk) {
    recommendations.push('Beste Tageszeit für Wildbeobachtung');
  }
  if (wind.speedBeaufort > 6) {
    recommendations.push('Starker Wind - Wild ist scheu');
  }
  if (precipitation.type !== 'none') {
    recommendations.push('Regen - Wild sucht Deckung');
  }

  const bestTimeOfDay: 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night' = isDawn
    ? 'dawn'
    : isDusk
      ? 'dusk'
      : sun.isDay
        ? 'afternoon'
        : 'night';

  return {
    overall: overallRating,
    factors: {
      scentCarry: scentCarry.score,
      visibility,
      weatherStability,
      wildActivity,
    },
    recommendations,
    bestTimeOfDay,
  };
}
