import { z } from 'zod';

// Wind Vector mit allen Details
export const WindVectorSchema = z.object({
  directionDegrees: z.number().min(0).max(359),  // 0° = N, 90° = E, 180° = S, 270° = W
  directionCardinal: z.enum(['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']),
  speedMps: z.number().min(0).max(50),           // m/s
  speedKmh: z.number().min(0).max(180),          // km/h
  speedBft: z.number().min(0).max(12),           // Beaufort Scale
  gustsMps: z.number().optional(),               // Böen
  gustsDirection: z.number().optional(),
  confidence: z.number().min(0).max(1),
  source: z.enum(['api', 'manual', 'interpolated']),
  measuredAt: z.string(),
  forecastedFor: z.string().optional(),
  localModifiers: z.object({
    terrainFunneling: z.number().optional(),
    forestShielding: z.number().optional(),
    windTurbulence: z.number().optional(),
  }).optional(),
});

export type WindVector = z.infer<typeof WindVectorSchema>;

// Cloud Cover Types
export enum CloudCoverType {
  CLEAR = 'clear',
  MOSTLY_CLEAR = 'mostly_clear',
  SCATTERED = 'scattered',
  BROKEN = 'broken',
  MOSTLY_CLOUDY = 'mostly_cloudy',
  OVERCAST = 'overcast',
}

export const CloudLayerSchema = z.object({
  altitude: z.number(),
  coverage: z.nativeEnum(CloudCoverType),
  cloudType: z.enum(['cirrus', 'cumulus', 'stratus', 'nimbus', 'unknown']),
  temperature: z.number(),
  moisture: z.number().optional(),
});

export type CloudLayer = z.infer<typeof CloudLayerSchema>;

// Precipitation Data
export const PrecipitationDataSchema = z.object({
  type: z.enum(['none', 'rain', 'sleet', 'snow', 'hail']),
  intensity: z.enum(['none', 'light', 'moderate', 'heavy', 'extreme']),
  radarReflectivity: z.number().optional(),
  precipitationRate: z.number().optional(),
  expectedAt: z.string().optional(),
  duration: z.number().optional(),
  probability: z.number().optional(),
  warnings: z.array(z.object({
    type: z.enum(['thunderstorm', 'hail', 'heavy_rain', 'wind_gust']),
    severity: z.enum(['advisory', 'watch', 'warning']),
    message: z.string(),
  })).optional(),
});

export type PrecipitationData = z.infer<typeof PrecipitationDataSchema>;

// Enhanced Weather (vollständiges Modell)
export const EnhancedWeatherSchema = z.object({
  id: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  timestamp: z.string(),
  
  // Basis
  temperature: z.number(),
  feelsLike: z.number().optional(),
  humidity: z.number().min(0).max(100),
  pressure: z.number().optional(),
  visibility: z.number().optional(),
  
  // Wind
  wind: WindVectorSchema,
  
  // Wolken & Niederschlag
  cloudLayers: z.array(CloudLayerSchema),
  precipitation: PrecipitationDataSchema,
  
  // Himmel
  dewPoint: z.number().optional(),
  uvIndex: z.number().optional(),
  
  // Mondphase
  moonPhase: z.enum(['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 
                     'full', 'waning_gibbous', 'last_quarter', 'waning_crescent']),
  moonIllumination: z.number().min(0).max(100),
  
  // Duftverlauf (wichtig für Jagd!)
  scentCarry: z.object({
    direction: z.number(),
    distance: z.number(),
    quality: z.enum(['excellent', 'good', 'moderate', 'poor']),
    explanation: z.string(),
  }).optional(),
  
  // Qualität
  source: z.enum(['openmeteo', 'openweathermap', 'dwd', 'manual', 'cache']),
  dataQuality: z.number().min(0).max(1),
  updatedAt: z.string(),
});

export type EnhancedWeather = z.infer<typeof EnhancedWeatherSchema>;

// Weather Layer Config (UI Settings)
export const WeatherLayerConfigSchema = z.object({
  wind: z.object({
    enabled: z.boolean(),
    animated: z.boolean(),
    particleCount: z.number(),
    vectorDensity: z.number(),
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

// Weather Forecast
export const WeatherForecastSchema = z.object({
  id: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  forecasts: z.array(z.object({
    time: z.string(),
    temperature: z.number(),
    wind: WindVectorSchema.pick({
      directionDegrees: true,
      speedMps: true,
    }),
    precipitation: PrecipitationDataSchema.pick({
      type: true,
      intensity: true,
    }),
    cloudCover: z.number(),
  })),
  summary: z.string(),
  bestHuntingTime: z.object({
    start: z.string(),
    end: z.string(),
    reason: z.string(),
  }).optional(),
  source: z.string(),
  expiresAt: z.string(),
});

export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;
