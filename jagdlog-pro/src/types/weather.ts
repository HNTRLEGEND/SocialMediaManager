/**
 * PHASE 4: Weather & Map Intelligence - Type System
 * Komplette TypeScript Interfaces für Wetterdaten
 */

import { z } from 'zod';

// ===========================
// WIND DATA TYPES
// ===========================

export const WindVectorSchema = z.object({
  speed: z.number().min(0), // m/s
  speedKmh: z.number().min(0), // km/h
  speedBeaufort: z.number().min(0).max(12), // Beaufort-Skala
  direction: z.number().min(0).max(360), // Grad (0 = Nord)
  directionCardinal: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']),
  gust: z.number().min(0).optional(), // Böen in m/s
  gustKmh: z.number().min(0).optional(),
});

export type WindVector = z.infer<typeof WindVectorSchema>;

// ===========================
// CLOUD & PRECIPITATION
// ===========================

export const CloudLayerSchema = z.object({
  coverage: z.number().min(0).max(100), // % Bedeckung
  altitude: z.number().optional(), // Meter
  type: z.enum([
    'clear',
    'few', // 1-2 Achtel
    'scattered', // 3-4 Achtel
    'broken', // 5-7 Achtel
    'overcast', // 8 Achtel
  ]),
});

export type CloudLayer = z.infer<typeof CloudLayerSchema>;

export const PrecipitationDataSchema = z.object({
  intensity: z.number().min(0), // mm/h
  probability: z.number().min(0).max(100), // %
  type: z.enum(['none', 'rain', 'drizzle', 'snow', 'sleet', 'hail']),
  accumulation: z.number().min(0).optional(), // mm gesamt
});

export type PrecipitationData = z.infer<typeof PrecipitationDataSchema>;

// ===========================
// RADAR DATA
// ===========================

export const RadarDataSchema = z.object({
  timestamp: z.date(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }),
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  intensityMatrix: z.array(z.array(z.number())).optional(), // 2D Array
  resolution: z.number(), // km pro Pixel
  source: z.enum(['dwd', 'openweathermap', 'rainviewer']),
});

export type RadarData = z.infer<typeof RadarDataSchema>;

// ===========================
// MOON PHASE
// ===========================

export const MoonPhaseSchema = z.object({
  phase: z.number().min(0).max(1), // 0 = Neumond, 0.5 = Vollmond
  phaseName: z.enum([
    'new_moon',
    'waxing_crescent',
    'first_quarter',
    'waxing_gibbous',
    'full_moon',
    'waning_gibbous',
    'last_quarter',
    'waning_crescent',
  ]),
  illumination: z.number().min(0).max(100), // %
  moonrise: z.date().optional(),
  moonset: z.date().optional(),
  isUp: z.boolean(),
});

export type MoonPhase = z.infer<typeof MoonPhaseSchema>;

// ===========================
// SUN DATA
// ===========================

export const SunDataSchema = z.object({
  sunrise: z.date(),
  sunset: z.date(),
  solarNoon: z.date(),
  civilDawn: z.date(), // Bürgerliche Dämmerung
  civilDusk: z.date(),
  nauticalDawn: z.date(),
  nauticalDusk: z.date(),
  astronomicalDawn: z.date(),
  astronomicalDusk: z.date(),
  dayLength: z.number(), // Sekunden
  isDay: z.boolean(),
});

export type SunData = z.infer<typeof SunDataSchema>;

// ===========================
// SCENT CARRY (Witterung)
// ===========================

export const ScentCarrySchema = z.object({
  quality: z.enum(['excellent', 'good', 'moderate', 'poor', 'very_poor']),
  score: z.number().min(0).max(100), // 0-100
  direction: z.number().min(0).max(360), // Wohin trägt die Witterung
  distance: z.number().min(0), // Meter - geschätzte Reichweite
  factors: z.object({
    temperature: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    stability: z.enum(['stable', 'unstable', 'neutral']),
    barometricTrend: z.enum(['rising', 'falling', 'steady']),
  }),
  recommendation: z.string(), // Text-Empfehlung
});

export type ScentCarry = z.infer<typeof ScentCarrySchema>;

// ===========================
// WEATHER ALERTS
// ===========================

export const WeatherAlertSchema = z.object({
  id: z.string(),
  event: z.string(), // z.B. "Sturmwarnung"
  severity: z.enum(['minor', 'moderate', 'severe', 'extreme']),
  urgency: z.enum(['immediate', 'expected', 'future']),
  headline: z.string(),
  description: z.string(),
  instruction: z.string().optional(),
  start: z.date(),
  end: z.date(),
  affectedArea: z.string().optional(),
  sender: z.string(), // z.B. "DWD"
});

export type WeatherAlert = z.infer<typeof WeatherAlertSchema>;

// ===========================
// ENHANCED WEATHER DATA
// ===========================

export const EnhancedWeatherSchema = z.object({
  // Basis-Daten
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    name: z.string().optional(),
  }),
  timestamp: z.date(),
  timezone: z.string(),

  // Aktuelles Wetter
  current: z.object({
    temperature: z.number(), // °C
    feelsLike: z.number(), // °C
    humidity: z.number().min(0).max(100), // %
    pressure: z.number(), // hPa
    dewPoint: z.number(), // °C
    visibility: z.number(), // Meter
    uvIndex: z.number().min(0),
    cloudCover: z.number().min(0).max(100), // %
    weatherCode: z.number(),
    weatherDescription: z.string(),
  }),

  // Wind
  wind: WindVectorSchema,

  // Niederschlag
  precipitation: PrecipitationDataSchema,

  // Wolken
  clouds: CloudLayerSchema,

  // Sonne & Mond
  sun: SunDataSchema,
  moon: MoonPhaseSchema,

  // Witterung (für Jäger wichtig!)
  scentCarry: ScentCarrySchema,

  // Warnungen
  alerts: z.array(WeatherAlertSchema).optional(),

  // Radar
  radar: RadarDataSchema.optional(),

  // Vorhersage (nächste 24h)
  hourlyForecast: z
    .array(
      z.object({
        timestamp: z.date(),
        temperature: z.number(),
        precipitation: z.number(), // mm
        precipitationProbability: z.number(), // %
        wind: WindVectorSchema,
        cloudCover: z.number(),
      })
    )
    .optional(),

  // Datenquelle
  source: z.enum(['open-meteo', 'openweathermap', 'dwd', 'combined']),
  lastUpdated: z.date(),
  cacheExpiry: z.date(),
});

export type EnhancedWeather = z.infer<typeof EnhancedWeatherSchema>;

// ===========================
// WEATHER LAYER CONFIG
// ===========================

export const WeatherLayerConfigSchema = z.object({
  // Welche Layer sind aktiv
  layers: z.object({
    windParticles: z.boolean(),
    windDirection: z.boolean(),
    cloudRadar: z.boolean(),
    precipitation: z.boolean(),
    temperature: z.boolean(),
    alerts: z.boolean(),
    scentCarry: z.boolean(), // Witterungs-Pfeile
  }),

  // Opacity pro Layer
  opacity: z.object({
    windParticles: z.number().min(0).max(1),
    cloudRadar: z.number().min(0).max(1),
    precipitation: z.number().min(0).max(1),
    temperature: z.number().min(0).max(1),
    scentCarry: z.number().min(0).max(1),
  }),

  // Wind-Particle Animation Settings
  windParticles: z.object({
    particleCount: z.number().min(100).max(5000),
    particleSpeed: z.number().min(0.1).max(5),
    particleSize: z.number().min(1).max(5),
    fadeSpeed: z.number().min(0.01).max(0.5),
    color: z.string(), // Hex color
  }),

  // Update-Intervalle
  updateIntervals: z.object({
    weather: z.number(), // ms
    radar: z.number(), // ms
    forecast: z.number(), // ms
  }),
});

export type WeatherLayerConfig = z.infer<typeof WeatherLayerConfigSchema>;

// ===========================
// API RESPONSE TYPES
// ===========================

// Open-Meteo API Response
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    cloudcover: number[];
    windspeed_10m: number[];
    winddirection_10m: number[];
    relativehumidity_2m: number[];
    pressure_msl: number[];
  };
}

// OpenWeatherMap API Response
export interface OpenWeatherMapResponse {
  coord: { lat: number; lon: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h': number;
    '3h': number;
  };
  snow?: {
    '1h': number;
    '3h': number;
  };
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}

// DWD Radar Response (vereinfacht)
export interface DWDRadarResponse {
  timestamp: string;
  product: string;
  imageUrl: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// ===========================
// UTILITY TYPES
// ===========================

export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'sleet'
  | 'thunderstorm'
  | 'hail';

export type HuntingCondition = {
  overall: 'excellent' | 'good' | 'moderate' | 'poor' | 'unsuitable';
  factors: {
    scentCarry: number; // 0-100
    visibility: number; // 0-100
    weatherStability: number; // 0-100
    wildActivity: number; // 0-100 (basierend auf Wetter)
  };
  recommendations: string[];
  bestTimeOfDay: 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';
};

// ===========================
// CACHE TYPES
// ===========================

export interface WeatherCache {
  key: string; // z.B. "weather_47.5_9.5"
  data: EnhancedWeather;
  timestamp: Date;
  expiresAt: Date;
}

export interface RadarCache {
  key: string;
  data: RadarData;
  timestamp: Date;
  expiresAt: Date;
}
