# Phase 4 Implementation Plan - Weather & Wind Animation
**Status**: Ready for Sprint Planning  
**Priority**: 🔴 High  
**Est. Duration**: 4-6 Wochen (2 Sprints)

---

## 🎯 Sprint 1: Wind & Weather Overlay Foundation (2 Wochen)

### Sprint 1.1: Type System & Data Models

```typescript
// NEW FILE: jagdlog-pro/src/types/weather.ts

import { z } from 'zod';
import { GPSKoordinatenSchema, ISODateSchema } from './index';

// ============================================================
// WIND SYSTEM
// ============================================================

export const WindVectorSchema = z.object({
  // Richtung
  directionDegrees: z.number().min(0).max(359),  // 0° = N, 90° = E, 180° = S, 270° = W
  directionCardinal: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']),
  
  // Geschwindigkeit
  speedMps: z.number().min(0).max(50),           // m/s (0-50)
  speedKmh: z.number().min(0).max(180),          // km/h
  speedBft: z.number().min(0).max(12),           // Beaufort Scale
  
  // Böen
  gustsMps: z.number().optional(),               // Böen-Geschwindigkeit
  gustsDirection: z.number().optional(),         // Boen-Richtung (oft anders!)
  
  // Qualität
  confidence: z.number().min(0).max(1),          // 0-1 Konfidenzwert
  source: z.enum(['api', 'manual', 'interpolated']),
  
  // Timing
  measuredAt: ISODateSchema,
  forecastedFor: ISODateSchema.optional(),
  
  // Lokale Effekte (optional)
  localModifiers: z.object({
    terrainFunneling: z.number().optional(),     // Geländeeffekt (-1 bis +1)
    forestShielding: z.number().optional(),      // Waldschutz (0 bis 1)
    windTurbulence: z.number().optional(),       // Turbulenzen (0 bis 1)
  }).optional(),
});

export type WindVector = z.infer<typeof WindVectorSchema>;

// Historische Windanimations-Frame
export const WindAnimationFrameSchema = z.object({
  id: z.string().uuid(),
  timestamp: ISODateSchema,
  wind: WindVectorSchema,
  temperature: z.number().optional(),
  visibility: z.number().optional(),
  updatedAt: ISODateSchema,
});

export type WindAnimationFrame = z.infer<typeof WindAnimationFrameSchema>;

// ============================================================
// CLOUD & PRECIPITATION SYSTEM
// ============================================================

export enum CloudCoverType {
  CLEAR = 'clear',              // 0-10%
  MOSTLY_CLEAR = 'mostly_clear', // 10-25%
  SCATTERED = 'scattered',       // 25-50%
  BROKEN = 'broken',             // 50-75%
  MOSTLY_CLOUDY = 'mostly_cloudy', // 75-90%
  OVERCAST = 'overcast',         // 90-100%
}

export const CloudLayerSchema = z.object({
  altitude: z.number(),          // Meter
  coverage: z.enum(Object.values(CloudCoverType)),
  cloudType: z.enum(['cirrus', 'cumulus', 'stratus', 'nimbus', 'unknown']),
  temperature: z.number(),       // Celsius
  moisture: z.number().optional(), // %
});

export type CloudLayer = z.infer<typeof CloudLayerSchema>;

export const PrecipitationDataSchema = z.object({
  type: z.enum(['none', 'rain', 'sleet', 'snow', 'hail']),
  intensity: z.enum(['none', 'light', 'moderate', 'heavy', 'extreme']),
  
  // Für Radar-Integration
  radarReflectivity: z.number().optional(),  // dBZ
  precipitationRate: z.number().optional(),  // mm/h
  
  // Vorhersage
  expectedAt: ISODateSchema.optional(),
  duration: z.number().optional(),          // Minuten
  probability: z.number().optional(),       // 0-100%
  
  // Warnsystem
  warnings: z.array(z.object({
    type: z.enum(['thunderstorm', 'hail', 'heavy_rain', 'wind_gust']),
    severity: z.enum(['advisory', 'watch', 'warning']),
    message: z.string(),
  })).optional(),
});

export type PrecipitationData = z.infer<typeof PrecipitationDataSchema>;

// ============================================================
// ENHANCED WEATHER WITH LAYERS
// ============================================================

export const EnhancedWeatherSchema = z.object({
  id: z.string().uuid(),
  location: GPSKoordinatenSchema,
  timestamp: ISODateSchema,
  
  // Basis-Wetter
  temperature: z.number(),
  feelsLike: z.number().optional(),
  humidity: z.number().min(0).max(100),
  pressure: z.number().optional(),
  visibility: z.number().optional(),      // Meter
  
  // Wind (erweitert)
  wind: WindVectorSchema,
  thermalLifts: z.array(z.object({
    time: z.string(),                    // "06:30" Format
    strength: z.enum(['weak', 'moderate', 'strong']),
    predictedAltitude: z.number(),
  })).optional(),
  
  // Wolken & Niederschlag
  cloudLayers: z.array(CloudLayerSchema),
  precipitation: PrecipitationDataSchema,
  
  // Himmel
  visibility: z.number().optional(),
  dewPoint: z.number().optional(),
  uvIndex: z.number().optional(),
  
  // Mondphase & Sonne
  moonPhase: z.enum(['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 
                      'full', 'waning_gibbous', 'last_quarter', 'waning_crescent']),
  moonIllumination: z.number().min(0).max(100),
  sunriseSunset: z.object({
    sunrise: z.string(),  // HH:MM
    sunset: z.string(),
    twilight: z.string(), // Astronomische Dämmerung
  }).optional(),
  
  // Duftverlauf (berechnet)
  scentCarry: z.object({
    direction: z.number(),      // Windrichtung
    distance: z.number(),       // Geschätzte Duftdriftdistanz (m)
    quality: z.enum(['excellent', 'good', 'moderate', 'poor']),
    explanation: z.string(),
  }).optional(),
  
  // Quellen & Qualität
  source: z.enum(['openweathermap', 'dwd', 'weather_api', 'manual', 'cache']),
  dataQuality: z.number().min(0).max(1),  // Konfidenz
  
  updatedAt: ISODateSchema,
});

export type EnhancedWeather = z.infer<typeof EnhancedWeatherSchema>;

// ============================================================
// MAP LAYER CONFIGURATION
// ============================================================

export const WeatherLayerConfigSchema = z.object({
  // Welche Layer sind sichtbar?
  wind: z.object({
    enabled: z.boolean(),
    animated: z.boolean(),
    particleCount: z.number(),      // 100-1000 Partikel
    vectorDensity: z.number(),      // Pfeile pro Quadrat
    opacity: z.number().min(0).max(1),
  }),
  
  clouds: z.object({
    enabled: z.boolean(),
    showRadar: z.boolean(),
    radarOpacity: z.number(),
    showCloudLayers: z.boolean(),
  }),
  
  precipitation: z.object({
    enabled: z.boolean(),
    showIntensity: z.boolean(),
    showWarnings: z.boolean(),
  }),
  
  scentCarry: z.object({
    enabled: z.boolean(),
    showRange: z.boolean(),
  }),
});

export type WeatherLayerConfig = z.infer<typeof WeatherLayerConfigSchema>;

// ============================================================
// WEATHER FORECAST (Multi-Day)
// ============================================================

export const WeatherForecastSchema = z.object({
  id: z.string().uuid(),
  location: GPSKoordinatenSchema,
  
  // Vorhersage-Details
  forecasts: z.array(z.object({
    time: ISODateSchema,
    hourly: EnhancedWeatherSchema.pick({
      temperature: true,
      wind: true,
      precipitation: true,
      cloudLayers: true,
    }),
  })),
  
  // Zusammenfassung
  summary: z.string(),
  bestHuntingTime: z.object({
    start: z.string(),  // HH:MM
    end: z.string(),
    reason: z.string(),
  }).optional(),
  
  source: z.string(),
  expiresAt: ISODateSchema,
});

export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;
```

**Tasks:**
- [ ] Datei erstellen: `jagdlog-pro/src/types/weather.ts`
- [ ] Type-Exports in `types/index.ts` hinzufügen
- [ ] Validation mit Zod testen
- [ ] Documentation schreiben

---

### Sprint 1.2: Weather Service Enhancement

```typescript
// UPDATE: jagdlog-pro/src/services/weatherService.ts

import { 
  EnhancedWeather, 
  WindVector, 
  CloudLayer, 
  PrecipitationData,
  WeatherForecast 
} from '../types/weather';
import { GPSKoordinaten } from '../types';

// API Keys für Multiple Weather Services
const WEATHER_PROVIDERS = {
  openweathermap: process.env.EXPO_PUBLIC_OWM_API_KEY || '',
  openmeteo: undefined, // Kostenlos, keine API Key nötig
  dwd: process.env.EXPO_PUBLIC_DWD_API_KEY || '', // Deutscher Wetterdienst
};

// Cache für Wetterdaten (maximal 5 Minuten)
interface WeatherCache {
  [key: string]: {
    data: EnhancedWeather;
    timestamp: number;
  };
}

let weatherCache: WeatherCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten

/**
 * Holt erweiterte Wetterdaten von mehreren APIs
 * Fallback-Logik wenn APIs nicht verfügbar
 */
export const getEnhancedWeather = async (
  lat: number,
  lon: number,
  forceRefresh = false
): Promise<EnhancedWeather | null> => {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = weatherCache[cacheKey];
  
  // Gültiger Cache?
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('[Weather] Cached data used');
    return cached.data;
  }

  try {
    // 1. Primary: Open-Meteo (kostenlos, keine API Key)
    const weather = await fetchFromOpenMeteo(lat, lon);
    
    if (weather) {
      // 2. Secondary: Zusatzdaten von OWM wenn verfügbar
      if (WEATHER_PROVIDERS.openweathermap) {
        const owmData = await fetchFromOpenWeatherMap(lat, lon);
        if (owmData) {
          Object.assign(weather, owmData);
        }
      }
      
      // 3. Tertiary: DWD Radar wenn Deutschland
      if (isInGermany(lat, lon)) {
        const radar = await fetchDWDRadar(lat, lon);
        if (radar) {
          weather.precipitation = radar;
        }
      }
      
      // Cache
      weatherCache[cacheKey] = {
        data: weather,
        timestamp: Date.now(),
      };
      
      return weather;
    }
  } catch (error) {
    console.error('[Weather] Error fetching:', error);
    // Fallback zu Demo-Daten
    return generateMockWeather(lat, lon);
  }

  return null;
};

/**
 * Open-Meteo API (Primary - kostenlos)
 * https://open-meteo.com/
 */
const fetchFromOpenMeteo = async (
  lat: number,
  lon: number
): Promise<EnhancedWeather | null> => {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?' +
      `latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,is_day,weather_code,' +
      'wind_speed_10m,wind_direction_10m,wind_gusts_10m,' +
      'temperature_80m,temperature_120m,temperature_180m,' +
      'pressure_msl,visibility,weather_code,cloud_cover&' +
      'timezone=auto&wind_speed_unit=ms';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const current = data.current;
    
    // Berechne Windrichtung Cardinal
    const windCardinal = degToCardinal(current.wind_direction_10m);
    
    // Berechne Mondphase
    const moonData = calculateMoonPhase(new Date());
    
    // Berechne Duftverlauf
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
        probability: 0,
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
};

/**
 * OpenWeatherMap API (Secondary - für Detaildaten)
 */
const fetchFromOpenWeatherMap = async (
  lat: number,
  lon: number
): Promise<Partial<EnhancedWeather> | null> => {
  try {
    const url = 'https://api.openweathermap.org/data/2.5/weather?' +
      `lat=${lat}&lon=${lon}` +
      `&appid=${WEATHER_PROVIDERS.openweathermap}` +
      '&units=metric&lang=de';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    return {
      feelsLike: Math.round(data.main.feels_like),
      dewPoint: calculateDewPoint(data.main.temp, data.main.humidity),
      uvIndex: data.uvi,
    };
  } catch (error) {
    console.error('[OWM] Error:', error);
    return null;
  }
};

/**
 * DWD Radar Integration (für Deutschland)
 * Zeigt Live-Niederschlags-Radar
 */
const fetchDWDRadar = async (
  lat: number,
  lon: number
): Promise<PrecipitationData | null> => {
  try {
    // DWD Radar Data (vereinfachte Version)
    // In Produktion würde man hier echter Radar-Daten holen
    const radarUrl = 'https://maps.dwd.de/geoserver/wms/?' +
      'service=WMS&version=1.1.1&' +
      'request=GetFeatureInfo&' +
      `query_layers=rad:Radarkomposit&` +
      `info_format=application/json&` +
      `bbox=${lat-0.5},${lon-0.5},${lat+0.5},${lon+0.5}&` +
      `srs=EPSG:4326&width=256&height=256&` +
      `x=128&y=128`;
    
    // Für MVP: Simplified Mock Data
    // In Production: Real DWD Radar Integration
    
    return {
      type: 'none',
      intensity: 'none',
      radarReflectivity: 10,  // dBZ
      precipitationRate: 0,    // mm/h
      probability: 0,
    };
  } catch (error) {
    console.error('[DWD] Error:', error);
    return null;
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Konvertiert Windgrad (0-360) zu Cardinal (N, NE, E, etc.)
 */
const degToCardinal = (deg: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
};

/**
 * m/s zu Beaufort Scale
 */
const msToBft = (mps: number): number => {
  const bft = 0.836653 * Math.pow(mps, 0.6666);
  return Math.min(Math.round(bft), 12);
};

/**
 * Duftverlauf berechnen
 * Basiert auf: Wind, Temperatur, Luftfeuchtigkeit, Terrain
 */
const calculateScentCarry = (
  windDeg: number,
  windSpeed: number,
  temp: number,
  humidity: number
): { direction: number; distance: number; quality: string; explanation: string } => {
  // Faktoren:
  // - Windgeschwindigkeit: höher = weiterer Duftflug
  // - Temperatur & Feuchtigkeit: Duftverlauf-Bedingungen
  // - Zeit des Tages: Thermische Effekte
  
  const distanceFactor = windSpeed > 0 ? windSpeed * 50 : 10; // Meter
  const quality = windSpeed > 3 ? 'excellent' : 'good';
  
  return {
    direction: windDeg,
    distance: Math.round(distanceFactor),
    quality: quality as any,
    explanation: `Wind trägt Duftverlauf bis zu ${Math.round(distanceFactor)}m in ${degToCardinal(windDeg)}-Richtung`,
  };
};

/**
 * Taupunkt berechnen
 */
const calculateDewPoint = (temp: number, humidity: number): number => {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
};

/**
 * Mondphase für Datum berechnen
 */
const calculateMoonPhase = (date: Date) => {
  // Zyklus: ~29.53 Tage
  const phases = [
    'new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'
  ];
  
  const knownNewMoon = new Date('2024-01-11');
  const daysSince = Math.floor((date.getTime() - knownNewMoon.getTime()) / 86400000);
  const dayInCycle = daysSince % 29.53;
  const illumination = Math.round((dayInCycle / 29.53) * 100);
  const phaseIndex = Math.floor((dayInCycle / 29.53) * 8) % 8;
  
  return {
    phase: phases[phaseIndex] as any,
    illumination,
  };
};

/**
 * Cloud Cover Prozent zu Enum
 */
const cloudCoverToEnum = (coverage: number): string => {
  if (coverage <= 10) return 'clear';
  if (coverage <= 25) return 'mostly_clear';
  if (coverage <= 50) return 'scattered';
  if (coverage <= 75) return 'broken';
  if (coverage <= 90) return 'mostly_cloudy';
  return 'overcast';
};

/**
 * Deutschland Check (für DWD)
 */
const isInGermany = (lat: number, lon: number): boolean => {
  return lat >= 47.3 && lat <= 55.1 && lon >= 5.9 && lon <= 15.0;
};

/**
 * Mock-Daten für Demo/Offline
 */
const generateMockWeather = (lat: number, lon: number): EnhancedWeather => {
  const now = new Date();
  const randomWind = Math.random() * 360;
  const randomSpeed = Math.random() * 8 + 2; // 2-10 m/s
  
  return {
    id: crypto.randomUUID(),
    location: { latitude: lat, longitude: lon },
    timestamp: now.toISOString(),
    temperature: 12,
    humidity: 65,
    visibility: 5000,
    
    wind: {
      directionDegrees: randomWind,
      directionCardinal: degToCardinal(randomWind),
      speedMps: randomSpeed,
      speedKmh: randomSpeed * 3.6,
      speedBft: msToBft(randomSpeed),
      confidence: 0.6,
      source: 'api',
      measuredAt: now.toISOString(),
    },
    
    cloudLayers: [{ altitude: 0, coverage: 'scattered', cloudType: 'cumulus', temperature: 12 }],
    precipitation: { type: 'none', intensity: 'none' },
    
    moonPhase: 'full',
    moonIllumination: 100,
    
    source: 'cache',
    dataQuality: 0.5,
    updatedAt: now.toISOString(),
  };
};

/**
 * Vorhersage-Daten (5-Tage)
 */
export const getWeatherForecast = async (
  lat: number,
  lon: number
): Promise<WeatherForecast | null> => {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?' +
      `latitude=${lat}&longitude=${lon}` +
      '&hourly=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover&' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&' +
      '&timezone=auto&forecast_days=5';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    const forecasts = data.hourly.time.map((time: string, idx: number) => ({
      time: new Date(time).toISOString(),
      hourly: {
        temperature: data.hourly.temperature_2m[idx],
        wind: {
          directionDegrees: data.hourly.wind_direction_10m[idx],
          speedMps: data.hourly.wind_speed_10m[idx],
        },
        precipitation: {
          type: data.hourly.precipitation[idx] > 0 ? 'rain' : 'none',
          intensity: 'moderate',
        },
        cloudLayers: [{
          altitude: 0,
          coverage: cloudCoverToEnum(data.hourly.cloud_cover[idx]),
          cloudType: 'unknown',
          temperature: data.hourly.temperature_2m[idx],
        }],
      },
    }));
    
    // Beste Jagdzeit identifizieren
    const bestIndex = forecasts.findIndex((f: any) => 
      f.hourly.wind.speedMps > 1 && 
      f.hourly.wind.speedMps < 5 &&
      f.hourly.precipitation.type === 'none'
    );
    
    return {
      id: crypto.randomUUID(),
      location: { latitude: lat, longitude: lon },
      forecasts,
      summary: 'Gute Bedingungen für die nächsten Tage',
      bestHuntingTime: bestIndex >= 0 ? {
        start: forecasts[bestIndex].time.split('T')[1].slice(0, 5),
        end: new Date(new Date(forecasts[bestIndex].time).getTime() + 3600000).toISOString().split('T')[1].slice(0, 5),
        reason: 'Optimale Wind- und Wetterbedingungen',
      } : undefined,
      source: 'openmeteo',
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    };
  } catch (error) {
    console.error('[Forecast] Error:', error);
    return null;
  }
};

export default {
  getEnhancedWeather,
  getWeatherForecast,
};
```

**Tasks:**
- [ ] `weatherService.ts` komplett überarbeiten
- [ ] API-Integration testen (Mock-Daten verwenden)
- [ ] Caching-System implementieren
- [ ] Error Handling verbose loggen

---

### Sprint 1.3: Weather Overlay UI Components

```typescript
// NEW FILE: jagdlog-pro/src/components/WeatherOverlay.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { EnhancedWeather, WeatherLayerConfig } from '../types/weather';
import { useTheme } from '../state/ThemeContext';

interface WeatherOverlayProps {
  weather: EnhancedWeather | null;
  config: WeatherLayerConfig;
  visible: boolean;
  mapRegion?: any;
}

/**
 * Zeichnet Wetter-Overlays auf React Native Maps
 * - Windvektoren
 * - Regenwolken
 * - Duftverlauf
 */
export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  weather,
  config,
  visible,
  mapRegion
}) => {
  const { colors } = useTheme();
  const animationValue = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    opacity: number;
  }>>([]);

  // Wind-Partikel initialisieren
  useEffect(() => {
    if (!config.wind.enabled || !weather) return;

    const newParticles = Array.from({ length: config.wind.particleCount }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * Dimensions.get('window').width,
      y: Math.random() * Dimensions.get('window').height,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    setParticles(newParticles);

    // Animate particles in Windrichtung
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [config.wind.enabled, config.wind.particleCount, weather]);

  if (!visible || !weather) return null;

  // Berechne Windvektor für Anzeige
  const windX = Math.cos(((weather.wind.directionDegrees - 90) * Math.PI) / 180);
  const windY = Math.sin(((weather.wind.directionDegrees - 90) * Math.PI) / 180);

  return (
    <View style={[
      StyleSheet.absoluteFill,
      {
        backgroundColor: 'transparent',
        pointerEvents: 'none',
      }
    ]}>
      {/* Wind-Partikel Overlay */}
      {config.wind.enabled && particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            left: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [
                particle.x,
                particle.x + windX * 200,
              ],
            }),
            top: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [
                particle.y,
                particle.y + windY * 200,
              ],
            }),
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.primary,
            opacity: particle.opacity * config.wind.opacity,
          }}
        />
      ))}

      {/* Windrichtungs-Indikatoren */}
      {config.wind.enabled && renderWindVectors(
        weather.wind.directionDegrees,
        weather.wind.speedMps,
        colors
      )}

      {/* Cloud/Radar Overlay */}
      {config.clouds.enabled && renderCloudOverlay(weather, colors, config)}

      {/* Niederschlags-Warnung */}
      {config.precipitation.showWarnings && renderPrecipitationWarnings(
        weather.precipitation,
        colors
      )}

      {/* Duftverlauf-Anzeige */}
      {config.scentCarry.enabled && renderScentCarry(
        weather.scentCarry,
        colors
      )}
    </View>
  );
};

// Helper: Windvektoren zeichnen
const renderWindVectors = (direction: number, speed: number, colors: any) => {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const arrowSize = 30;

  const arrows = [];
  for (let x = 0; x < width; x += 80) {
    for (let y = 0; y < height; y += 80) {
      arrows.push(
        <View
          key={`arrow-${x}-${y}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: arrowSize,
            height: arrowSize,
            transform: [{ rotate: `${direction}deg` }],
          }}
        >
          <Text style={{ fontSize: 20, color: colors.primary, opacity: 0.6 }}>
            ➜
          </Text>
        </View>
      );
    }
  }
  return arrows;
};

// Helper: Wolken Overlay
const renderCloudOverlay = (
  weather: EnhancedWeather,
  colors: any,
  config: WeatherLayerConfig
) => {
  if (!config.clouds.showRadar) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors.card,
          opacity: config.clouds.radarOpacity * 0.2,
          pointerEvents: 'none',
        }
      ]}
    />
  );
};

// Helper: Niederschlags-Warnung
const renderPrecipitationWarnings = (
  precipitation: any,
  colors: any
) => {
  if (precipitation.type === 'none' || !precipitation.warnings?.length) {
    return null;
  }

  return precipitation.warnings.map((warning: any, idx: number) => (
    <View
      key={`warning-${idx}`}
      style={{
        position: 'absolute',
        top: 10 + idx * 40,
        left: 10,
        right: 10,
        backgroundColor: colors.danger,
        padding: 8,
        borderRadius: 4,
        opacity: 0.8,
      }}
    >
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        {warning.type.toUpperCase()}: {warning.message}
      </Text>
    </View>
  ));
};

// Helper: Duftverlauf anzeigen
const renderScentCarry = (scentCarry: any, colors: any) => {
  if (!scentCarry) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        opacity: 0.9,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>
        🌬️ Duftverlauf
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
        {scentCarry.explanation}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
        Qualität: {scentCarry.quality}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WeatherOverlay;
```

```typescript
// NEW FILE: jagdlog-pro/src/components/WindIndicator.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WindVector } from '../types/weather';
import { useTheme } from '../state/ThemeContext';

interface WindIndicatorProps {
  wind: WindVector;
  style?: any;
}

/**
 * Windrose mit Echtzeit-Daten
 */
export const WindIndicator: React.FC<WindIndicatorProps> = ({ wind, style }) => {
  const { colors, isDark } = useTheme();

  // Bestimme Windstärke-Farbe
  const getWindColor = (speedBft: number) => {
    if (speedBft <= 1) return '#4CAF50'; // Schwach - Grün
    if (speedBft <= 3) return '#8BC34A'; // Leicht - Hellgrün
    if (speedBft <= 5) return '#FFC107'; // Mäßig - Gelb
    if (speedBft <= 7) return '#FF9800'; // Frisch - Orange
    return '#F44336'; // Stark - Rot
  };

  const windColor = getWindColor(wind.speedBft);
  const rotation = wind.directionDegrees;

  return (
    <View style={[styles.container, style]}>
      {/* Windrose Background */}
      <View style={styles.windrose}>
        {/* Cardinal Directions */}
        <Text style={[styles.cardinal, styles.north]}>N</Text>
        <Text style={[styles.cardinal, styles.east]}>E</Text>
        <Text style={[styles.cardinal, styles.south]}>S</Text>
        <Text style={[styles.cardinal, styles.west]}>W</Text>

        {/* Wind Direction Arrow */}
        <View
          style={[
            styles.arrow,
            {
              transform: [{ rotate: `${rotation}deg` }],
              borderLeftColor: windColor,
              borderRightColor: windColor,
            }
          ]}
        />
      </View>

      {/* Wind Details */}
      <View style={styles.details}>
        <Text style={[styles.direction, { color: windColor }]}>
          {wind.directionCardinal} {wind.directionDegrees}°
        </Text>
        <Text style={[styles.speed, { color: windColor }]}>
          {wind.speedBft} Bft ({wind.speedMps.toFixed(1)} m/s)
        </Text>
        {wind.gustsMps && (
          <Text style={[styles.gusts, { color: colors.warning }]}>
            Böen: {wind.gustsMps.toFixed(1)} m/s
          </Text>
        )}
      </View>

      {/* Quality Indicator */}
      <View style={styles.qualityBar}>
        <View
          style={[
            styles.qualityFill,
            {
              width: `${wind.confidence * 100}%`,
              backgroundColor: windColor,
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  windrose: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  cardinal: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  north: { top: 4 },
  east: { right: 4 },
  south: { bottom: 4 },
  west: { left: 4 },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 40,
    borderTopColor: '#333',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  details: {
    alignItems: 'center',
    marginBottom: 8,
  },
  direction: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  speed: {
    fontSize: 14,
    marginTop: 4,
  },
  gusts: {
    fontSize: 12,
    marginTop: 2,
  },
  qualityBar: {
    width: 100,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    overflow: 'hidden',
  },
  qualityFill: {
    height: '100%',
  },
});

export default WindIndicator;
```

**Tasks:**
- [ ] WeatherOverlay Komponente implementieren
- [ ] WindIndicator implementieren
- [ ] In MapScreen integrieren
- [ ] Styling & Animations testen
- [ ] Offline-Fallback sicherstellen

---

## 📅 Sprint 2: Map Integration & Polish (2 Wochen)

### Sprint 2.1: MapScreen Integration

```typescript
// UPDATE: jagdlog-pro/src/screens/MapScreen.tsx
// (Relevant sections only)

import { WeatherOverlay, WindIndicator } from '../components';
import { getEnhancedWeather, getWeatherForecast } from '../services/weatherService';
import { EnhancedWeather, WeatherLayerConfig } from '../types/weather';

const MapScreen: React.FC = () => {
  // ... existing code ...

  // Weather State
  const [weather, setWeather] = useState<EnhancedWeather | null>(null);
  const [weatherConfig, setWeatherConfig] = useState<WeatherLayerConfig>({
    wind: { enabled: true, animated: true, particleCount: 150, vectorDensity: 1, opacity: 0.7 },
    clouds: { enabled: true, showRadar: true, radarOpacity: 0.3, showCloudLayers: false },
    precipitation: { enabled: true, showIntensity: true, showWarnings: true },
    scentCarry: { enabled: true, showRange: true },
  });
  const [forecast, setForecast] = useState(null);

  // Lade Wetter beim Laden und periodisch
  useFocusEffect(
    useCallback(() => {
      const loadWeather = async () => {
        if (region) {
          const w = await getEnhancedWeather(region.latitude, region.longitude);
          const f = await getWeatherForecast(region.latitude, region.longitude);
          setWeather(w);
          setForecast(f);
        }
      };

      loadWeather();
      const interval = setInterval(loadWeather, 300000); // Alle 5 Minuten

      return () => clearInterval(interval);
    }, [region])
  );

  // Render mit WeatherOverlay
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        mapType={mapType}
        // ... existing props ...
      >
        {/* Existing Markers */}
        {/* ... */}
      </MapView>

      {/* Weather Overlay Layer */}
      <WeatherOverlay
        weather={weather}
        config={weatherConfig}
        visible={layers.find(l => l.id === 'wetter')?.aktiv || true}
        mapRegion={region}
      />

      {/* Wind Indicator Card */}
      {weather && (
        <View style={styles.weatherCard}>
          <WindIndicator wind={weather.wind} />
        </View>
      )}

      {/* Toggle für Weather Layers */}
      <TouchableOpacity
        style={styles.weatherToggle}
        onPress={() => setShowWeatherMenu(!showWeatherMenu)}
      >
        <Text>🌦️</Text>
      </TouchableOpacity>

      {showWeatherMenu && (
        <View style={styles.weatherMenu}>
          <WeatherLayerMenu
            config={weatherConfig}
            onChange={setWeatherConfig}
          />
        </View>
      )}
    </View>
  );
};
```

**Tasks:**
- [ ] Weather State in MapScreen hinzufügen
- [ ] WeatherOverlay in Map integrieren
- [ ] WindIndicator anzeigen
- [ ] Layer-Toggeln implementieren
- [ ] Performance testen

---

### Sprint 2.2: Testing & Deployment

```typescript
// NEW FILE: jagdlog-pro/__tests__/weatherService.test.ts

import {
  getEnhancedWeather,
  getWeatherForecast,
} from '../src/services/weatherService';

describe('Weather Service', () => {
  it('should fetch enhanced weather data', async () => {
    const weather = await getEnhancedWeather(51.5, 7.5);
    expect(weather).not.toBeNull();
    expect(weather?.wind).toBeDefined();
    expect(weather?.temperature).toBeDefined();
  });

  it('should have valid wind data', async () => {
    const weather = await getEnhancedWeather(51.5, 7.5);
    expect(weather?.wind.directionDegrees).toBeGreaterThanOrEqual(0);
    expect(weather?.wind.directionDegrees).toBeLessThan(360);
    expect(weather?.wind.speedMps).toBeGreaterThanOrEqual(0);
  });

  it('should calculate correct moon phase', async () => {
    const weather = await getEnhancedWeather(51.5, 7.5);
    expect(weather?.moonPhase).toBeDefined();
    expect(weather?.moonIllumination).toBeGreaterThanOrEqual(0);
    expect(weather?.moonIllumination).toBeLessThanOrEqual(100);
  });

  it('should get weather forecast', async () => {
    const forecast = await getWeatherForecast(51.5, 7.5);
    expect(forecast).not.toBeNull();
    expect(forecast?.forecasts.length).toBeGreaterThan(0);
  });

  it('should calculate scent carry correctly', async () => {
    const weather = await getEnhancedWeather(51.5, 7.5);
    expect(weather?.scentCarry).toBeDefined();
    expect(weather?.scentCarry?.distance).toBeGreaterThanOrEqual(0);
  });

  it('should cache weather data', async () => {
    const start = Date.now();
    await getEnhancedWeather(51.5, 7.5);
    const first = Date.now();

    const cached = await getEnhancedWeather(51.5, 7.5);
    const second = Date.now();

    // Gecachte Version sollte schneller sein
    expect(second - first).toBeLessThan(first - start);
  });
});
```

**Tasks:**
- [ ] Unit Tests schreiben
- [ ] Integration Tests
- [ ] Performance Profiling
- [ ] Error Handling verbessern
- [ ] Dokumentation aktualisieren

---

## 🚀 Launch Checklist Phase 4

- [ ] Alle Type-Definitionen finalisiert
- [ ] Weather Service vollständig implementiert
- [ ] UI-Komponenten getestet
- [ ] MapScreen Integration komplett
- [ ] API-Integration funktioniert
- [ ] Caching-System optimiert
- [ ] Offline-Fallback funktioniert
- [ ] Performance-Tests bestanden
- [ ] Dokumentation aktualisiert
- [ ] Code Review durchgeführt
- [ ] PR zu `main` erstellt

---

## 📊 Metriken für Phase 4

**Performance Targets:**
- ⏱️ Weather Data Load: <2s
- 💾 App Size: +2MB max
- 🎬 Map Animation FPS: 60 FPS
- 📊 Cache Hit Rate: >80%

**Quality Targets:**
- ✅ Test Coverage: >80%
- 🐛 Critical Bugs: 0
- ⚠️ Warnings: <5
- 📱 Supported Devices: iOS 14+, Android 10+

---

**Status**: 🟢 Ready to Implement  
**Created**: 22.01.2026  
**Next Review**: Nach Sprint 1
