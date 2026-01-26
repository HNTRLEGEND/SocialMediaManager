import { z } from 'zod';

// ============================================================
// HUNTING EVENT (Training Data)
// ============================================================

export const HuntingEventSchema = z.object({
  id: z.string(),
  revierId: z.string(),
  userId: z.string(),
  
  // Event Type
  typ: z.enum(['abschuss', 'beobachtung', 'wildkamera']),
  
  // Wildlife
  wildart: z.string(), // e.g., 'Rehwild', 'Schwarzwild', 'Rotwild'
  geschlecht: z.enum(['m', 'w', 'unbekannt']).optional(),
  anzahl: z.number().min(1).default(1),
  
  // Location
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
  }),
  
  // Temporal
  zeitpunkt: z.string(), // ISO timestamp
  tageszeit: z.enum(['morgendaemmerung', 'morgen', 'vormittag', 'mittag', 
                     'nachmittag', 'abenddaemmerung', 'abend', 'nacht']).optional(),
  jahreszeit: z.enum(['fruehling', 'sommer', 'herbst', 'winter']).optional(),
  
  // Weather (from Phase 4)
  wetter: z.object({
    temperatur: z.number().optional(),
    wind_geschwindigkeit: z.number().optional(), // m/s
    wind_richtung: z.number().optional(), // degrees
    niederschlag: z.enum(['none', 'rain', 'snow']).optional(),
    mondphase: z.string().optional(),
  }).optional(),
  
  // Success Metrics
  erfolg: z.boolean(), // true for abschuss, can be true/false for beobachtung
  
  // POI Association
  naechster_poi_id: z.string().optional(),
  distanz_zu_poi: z.number().optional(), // meters
  
  // Source
  quelle: z.enum(['manual', 'wildkamera']).default('manual'),
  wildkameraId: z.string().optional(),
  kiConfidence: z.number().min(0).max(100).optional(),
  
  // Metadata
  erstellt_am: z.string(),
});

export type HuntingEvent = z.infer<typeof HuntingEventSchema>;

// ============================================================
// EXTRACTED FEATURES (ML Feature Engineering)
// ============================================================

export const ExtractedFeaturesSchema = z.object({
  // Spatial Features
  spatial: z.object({
    latitude: z.number(),
    longitude: z.number(),
    gridCell: z.string(), // e.g., "50.12_10.45" for clustering
    distanceToPOI: z.number().optional(),
    poiType: z.string().optional(),
  }),
  
  // Temporal Features
  temporal: z.object({
    hour: z.number().min(0).max(23),
    dayOfWeek: z.number().min(0).max(6), // 0=Sunday
    dayOfYear: z.number().min(1).max(366),
    month: z.number().min(1).max(12),
    tageszeit: z.string(),
    jahreszeit: z.string(),
  }),
  
  // Weather Features
  weather: z.object({
    temperaturKategorie: z.enum(['sehr_kalt', 'kalt', 'mild', 'warm', 'heiss']).optional(),
    windKategorie: z.enum(['windstill', 'leicht', 'maessig', 'stark']).optional(),
    niederschlag: z.boolean().optional(),
    mondphase: z.string().optional(),
  }),
  
  // Wildlife Features
  wildlife: z.object({
    wildart: z.string(),
    geschlecht: z.string().optional(),
    anzahl: z.number(),
  }),
  
  // Success Label
  erfolg: z.boolean(),
});

export type ExtractedFeatures = z.infer<typeof ExtractedFeaturesSchema>;

// ============================================================
// WILDART PATTERN
// ============================================================

export const WildartPatternSchema = z.object({
  wildart: z.string(),
  totalEvents: z.number(),
  successRate: z.number().min(0).max(1),
  
  // Best times
  bestHours: z.array(z.object({
    hour: z.number(),
    successRate: z.number(),
    eventCount: z.number(),
  })),
  
  // Best locations
  hotspots: z.array(z.object({
    lat: z.number(),
    lon: z.number(),
    eventCount: z.number(),
    successRate: z.number(),
  })),
  
  // Weather preferences
  preferredConditions: z.object({
    temperatur: z.object({ min: z.number(), max: z.number() }).optional(),
    wind: z.object({ min: z.number(), max: z.number() }).optional(),
    mondphase: z.array(z.string()).optional(),
  }).optional(),
});

export type WildartPattern = z.infer<typeof WildartPatternSchema>;

// ============================================================
// POI PERFORMANCE
// ============================================================

export const POIPerformanceSchema = z.object({
  poiId: z.string(),
  poiName: z.string(),
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  
  totalVisits: z.number(),
  successfulHunts: z.number(),
  successRate: z.number().min(0).max(1),
  
  // Per species
  byWildart: z.record(z.object({
    events: z.number(),
    successes: z.number(),
    rate: z.number(),
  })),
  
  lastSuccess: z.string().optional(), // ISO timestamp
  daysSinceLastSuccess: z.number().optional(),
});

export type POIPerformance = z.infer<typeof POIPerformanceSchema>;

// ============================================================
// RECOMMENDATION
// ============================================================

export const RecommendationTypeSchema = z.enum([
  'best_spot',
  'best_time',
  'wildlife_prediction',
  'weather_opportunity',
]);

export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;

export const RecommendationSchema = z.object({
  id: z.string(),
  typ: RecommendationTypeSchema,
  prioritaet: z.enum(['sehr_hoch', 'hoch', 'mittel', 'niedrig']),
  
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  
  titel: z.string(),
  beschreibung: z.string(),
  gruende: z.array(z.string()),
  
  // Location (for best_spot)
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  
  // Wildlife
  wildart: z.string().optional(),
  erwarteteWildarten: z.array(z.object({
    wildart: z.string(),
    wahrscheinlichkeit: z.number(),
  })).optional(),
  
  // Time (for best_time)
  empfohleneZeit: z.object({
    von: z.string(), // HH:mm
    bis: z.string(), // HH:mm
  }).optional(),
  naechstesZeitfenster: z.string().optional(), // ISO timestamp
  
  // Success probability
  erfolgswahrscheinlichkeit: z.number().min(0).max(100).optional(),
  
  // Metadata
  basedOnEvents: z.number(), // number of historical events used
  generatedAt: z.string(),
  expiresAt: z.string().optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// ============================================================
// SPOT SCORE (Multi-Factor Analysis)
// ============================================================

export const SpotScoreSchema = z.object({
  totalScore: z.number().min(0).max(100),
  
  // Individual factor scores (0-100)
  faktoren: z.object({
    historischerErfolg: z.number(),
    aktuelleWetterbedingungen: z.number(),
    tageszeit: z.number(),
    wildartAffinitaet: z.number(),
    mondphase: z.number(),
    saisonaleEignung: z.number(),
    letzterErfolg: z.number(),
  }),
  
  // Weighted contributions
  gewichtungen: z.object({
    historischerErfolg: z.number().default(0.35),
    aktuelleWetterbedingungen: z.number().default(0.25),
    tageszeit: z.number().default(0.15),
    wildartAffinitaet: z.number().default(0.10),
    mondphase: z.number().default(0.05),
    saisonaleEignung: z.number().default(0.05),
    letzterErfolg: z.number().default(0.05),
  }),
  
  erfolgswahrscheinlichkeit: z.number().min(0).max(100),
  besteStunde: z.number().min(0).max(23).optional(),
  
  metadata: z.object({
    anzahlHistorischerEvents: z.number(),
    letzterErfolgVorTagen: z.number().optional(),
  }),
});

export type SpotScore = z.infer<typeof SpotScoreSchema>;

// ============================================================
// HEATMAP POINT
// ============================================================

export const HeatmapPointSchema = z.object({
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  
  intensity: z.number().min(0).max(100), // 0-20: sehr niedrig, 20-40: niedrig, ...
  radius: z.number().min(50).max(500), // meters
  
  eventCount: z.number(),
  successCount: z.number(),
  successRate: z.number().min(0).max(1),
  
  wildarten: z.array(z.string()).optional(),
});

export type HeatmapPoint = z.infer<typeof HeatmapPointSchema>;

// ============================================================
// RECOMMENDATION CONFIG
// ============================================================

export const AIRecommendationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  modelVersion: z.string().default('1.0.0'),
  
  minTrainingData: z.number().default(10),
  maxAge: z.number().default(365), // days
  
  gewichtung: z.object({
    historischerErfolg: z.number(),
    aktuelleWetterbedingungen: z.number(),
    tageszeit: z.number(),
    wildartAffinitaet: z.number(),
    mondphase: z.number(),
    saisonaleEignung: z.number(),
    letzterErfolg: z.number(),
  }).default({
    historischerErfolg: 0.35,
    aktuelleWetterbedingungen: 0.25,
    tageszeit: 0.15,
    wildartAffinitaet: 0.10,
    mondphase: 0.05,
    saisonaleEignung: 0.05,
    letzterErfolg: 0.05,
  }),
  
  schwellwerte: z.object({
    minScore: z.number().default(60),
    minConfidence: z.number().default(50),
    minHistoricalEvents: z.number().default(5),
  }),
  
  ui: z.object({
    zeigeHeatmap: z.boolean().default(true),
    zeigeTopRecommendations: z.number().default(3),
    updateInterval: z.number().default(300000), // 5 min
  }),
});

export type AIRecommendationConfig = z.infer<typeof AIRecommendationConfigSchema>;

// ============================================================
// FEEDBACK
// ============================================================

export const RecommendationFeedbackSchema = z.object({
  id: z.string(),
  recommendationId: z.string(),
  userId: z.string(),
  
  hilfreich: z.boolean(),
  genutzt: z.boolean(),
  erfolgreich: z.boolean().optional(),
  
  rating: z.number().min(1).max(5).optional(),
  kommentar: z.string().optional(),
  
  erstellt_am: z.string(),
});

export type RecommendationFeedback = z.infer<typeof RecommendationFeedbackSchema>;
