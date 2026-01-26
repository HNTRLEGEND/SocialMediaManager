/**
 * Configuration Helper
 * Centralizes all environment-based configuration
 */

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'JagdLog Pro',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  
  api: {
    weather: process.env.NEXT_PUBLIC_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast',
  },
  
  map: {
    defaultCenter: {
      lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT || '51.1657'),
      lon: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LON || '10.4515'),
    },
    defaultZoom: parseInt(process.env.NEXT_PUBLIC_DEFAULT_MAP_ZOOM || '6'),
  },
  
  features: {
    aiRecommendations: process.env.NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS === 'true',
    weatherOverlay: process.env.NEXT_PUBLIC_ENABLE_WEATHER_OVERLAY === 'true',
    gesellschaftsjagd: process.env.NEXT_PUBLIC_ENABLE_GESELLSCHAFTSJAGD === 'true',
  },
  
  cache: {
    weatherTTL: parseInt(process.env.NEXT_PUBLIC_WEATHER_CACHE_TTL || '300000'),
  },
} as const;
