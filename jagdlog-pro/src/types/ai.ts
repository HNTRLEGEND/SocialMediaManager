/**
 * PHASE 5: AI Recommendation Engine - Type System
 * Intelligente Jagd-Empfehlungen basierend auf ML & historischen Daten
 */

import { z } from 'zod';
import { GPSKoordinaten, WildArt } from './index';
import { EnhancedWeather, HuntingCondition } from './weather';

// ===========================
// TRAINING DATA
// ===========================

export const HuntingEventSchema = z.object({
  id: z.string(),
  revierId: z.string(),
  
  // Event-Details
  typ: z.enum(['abschuss', 'beobachtung', 'fehlansprache', 'leer_ansitz']),
  wildart: z.string(), // WildArt
  anzahl: z.number().min(1),
  geschlecht: z.enum(['männlich', 'weiblich', 'unbekannt']).optional(),
  altersklasse: z.enum(['kalb', 'jaehrling', 'jugendlich', 'erwachsen', 'alt']).optional(),
  
  // Ort & Zeit
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
    accuracy: z.number().optional(),
  }),
  zeitpunkt: z.date(),
  
  // Kontext
  poiId: z.string().optional(), // Von welchem POI aus (Hochsitz, etc.)
  poiTyp: z.string().optional(),
  distanzZumPoi: z.number().optional(), // Meter
  
  // Wetter-Kontext
  wetterDaten: z.object({
    temperatur: z.number(),
    windGeschwindigkeit: z.number(),
    windRichtung: z.number(),
    niederschlag: z.number(),
    bewoelkung: z.number(),
    luftfeuchtigkeit: z.number(),
    luftdruck: z.number(),
    mondphase: z.number().min(0).max(1),
    witterungsQualitaet: z.number().min(0).max(100),
  }).optional(),
  
  // Zeitkontext
  tageszeit: z.enum([
    'vor_morgengrauen', // < civil dawn
    'morgengrauen', // civil dawn - sunrise
    'morgenstunden', // sunrise - 10:00
    'vormittag', // 10:00 - 12:00
    'mittag', // 12:00 - 14:00
    'nachmittag', // 14:00 - 17:00
    'abenddaemmerung', // 17:00 - sunset
    'nachts', // after sunset
  ]),
  wochentag: z.number().min(0).max(6), // 0 = Sonntag
  jahreszeit: z.enum(['fruehling', 'sommer', 'herbst', 'winter']),
  
  // Erfolgs-Indikatoren
  erfolgreich: z.boolean(), // true bei Abschuss, false bei Leer-Ansitz
  notizen: z.string().optional(),
  
  // Phase 5 Enhancement: Wildkamera-Integration
  quelle: z.enum(['manual', 'wildkamera']).optional(), // Datenquelle
  wildkameraId: z.string().optional(), // ID der Wildkamera
  kiConfidence: z.number().min(0).max(100).optional(), // KI-Confidence bei Wildkamera
  
  // Metadata
  erstelltAm: z.date(),
});

export type HuntingEvent = z.infer<typeof HuntingEventSchema>;

// ===========================
// FEATURE EXTRACTION
// ===========================

export interface ExtractedFeatures {
  eventId: string;
  
  // Räumliche Features
  spatial: {
    latitude: number;
    longitude: number;
    altitude?: number;
    poiTyp?: string;
    distanzZumPoi?: number;
    gelaendeTyp?: 'wald' | 'feld' | 'wiese' | 'gewaesser' | 'mixed';
    cluster: number; // Cluster-ID aus k-means
  };
  
  // Zeitliche Features
  temporal: {
    stundeDesTages: number; // 0-23
    tageszeit: string;
    wochentag: number;
    istWochenende: boolean;
    jahreszeit: string;
    monat: number;
    tagImJahr: number;
  };
  
  // Wetter-Features
  weather: {
    temperatur: number;
    temperaturKategorie: 'sehr_kalt' | 'kalt' | 'mild' | 'warm' | 'heiss';
    windGeschwindigkeit: number;
    windKategorie: 'windstill' | 'leicht' | 'maessig' | 'stark' | 'sturm';
    niederschlag: boolean;
    bewoelkung: number;
    witterungsQualitaet: number;
    mondphase: number;
    mondphasenKategorie: 'neumond' | 'zunehmend' | 'vollmond' | 'abnehmend';
  };
  
  // Wildart-Features
  wildlife: {
    wildart: string;
    anzahl: number;
    geschlecht?: string;
    altersklasse?: string;
  };
  
  // Erfolgs-Feature (Target)
  success: {
    erfolgreich: boolean;
    typ: 'abschuss' | 'beobachtung' | 'fehlansprache' | 'leer_ansitz';
  };
}

// ===========================
// PATTERN ANALYSIS
// ===========================

export interface WildartPattern {
  wildart: string;
  
  // Zeitliche Muster
  bevorzugteTageszeiten: Array<{
    tageszeit: string;
    wahrscheinlichkeit: number; // 0-100
    durchschnittlicheAnzahl: number;
  }>;
  
  // Wetterbedingte Muster
  bevorzugtesWetter: {
    temperaturBereich: { min: number; max: number };
    windBereich: { min: number; max: number };
    bevorzugteWitterung: number; // 0-100
    mondphasenAffinitaet: Record<string, number>;
  };
  
  // Räumliche Muster
  hotspots: Array<{
    latitude: number;
    longitude: number;
    radius: number; // Meter
    erfolgsrate: number; // 0-100
    anzahlBeobachtungen: number;
    anzahlAbschuesse: number;
  }>;
  
  // Saisonale Muster
  saisonaleMuster: Record<string, {
    wahrscheinlichkeit: number;
    aktivitaetsLevel: number;
  }>;
}

export interface POIPerformance {
  poiId: string;
  poiTyp: string;
  position: GPSKoordinaten;
  
  // Statistiken
  gesamtAnsitze: number;
  erfolgreicheAnsitze: number;
  erfolgsrate: number; // 0-100
  
  // Pro Wildart
  perWildart: Record<string, {
    beobachtungen: number;
    abschuesse: number;
    erfolgsrate: number;
    durchschnittlicheDistanz: number; // Meter
  }>;
  
  // Beste Zeiten
  besteZeiten: Array<{
    tageszeit: string;
    erfolgsrate: number;
    empfohlen: boolean;
  }>;
  
  // Beste Wetterbedingungen
  besteWetterbedingungen: {
    temperaturBereich: { min: number; max: number };
    windBereich: { min: number; max: number };
    witterungsQualitaet: { min: number; max: number };
  };
  
  // Letzter Erfolg
  letzterErfolg?: {
    datum: Date;
    wildart: string;
    anzahl: number;
  };
}

// ===========================
// RECOMMENDATIONS
// ===========================

export const RecommendationSchema = z.object({
  id: z.string(),
  typ: z.enum([
    'best_spot', // Bester Standort
    'best_time', // Beste Tageszeit
    'wildlife_prediction', // Wildart-Vorhersage
    'weather_opportunity', // Wetter-Gelegenheit
    'poi_suggestion', // POI-Vorschlag
  ]),
  
  // Score & Confidence
  score: z.number().min(0).max(100), // Haupt-Score
  confidence: z.number().min(0).max(100), // Wie sicher ist die Vorhersage
  prioritaet: z.enum(['niedrig', 'mittel', 'hoch', 'sehr_hoch']),
  
  // Empfehlung
  titel: z.string(),
  beschreibung: z.string(),
  gruende: z.array(z.string()), // Warum diese Empfehlung
  
  // Ort (falls relevant)
  position: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  poiId: z.string().optional(),
  
  // Wildart (falls relevant)
  wildart: z.string().optional(),
  erwarteteAnzahl: z.number().optional(),
  
  // Zeit
  empfohleneZeit: z.object({
    von: z.date(),
    bis: z.date(),
    tageszeit: z.string(),
  }).optional(),
  
  // Wetter-Kontext
  wetterEmpfehlung: z.object({
    aktuell: z.boolean(), // Jetzt gut?
    besserWarten: z.boolean(),
    warteBis: z.date().optional(),
  }).optional(),
  
  // Erfolgs-Wahrscheinlichkeit
  erfolgswahrscheinlichkeit: z.number().min(0).max(100),
  
  // Basiert auf
  basiertAuf: z.object({
    historischeEvents: z.number(),
    aehnlicheSituationen: z.number(),
    letzterErfolg: z.date().optional(),
  }),
  
  // Metadata
  erstelltAm: z.date(),
  gueltigBis: z.date(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// ===========================
// SPOT SCORING
// ===========================

export interface SpotScore {
  position: GPSKoordinaten;
  poiId?: string;
  
  // Gesamt-Score
  gesamtScore: number; // 0-100
  
  // Teil-Scores
  scores: {
    historischerErfolg: number; // 0-100 (basierend auf Vergangenheit)
    aktuelleWetterbedingungen: number; // 0-100
    tageszeit: number; // 0-100
    wildartAffinitaet: number; // 0-100 (für gewählte Wildart)
    mondphase: number; // 0-100
    saisonaleEignung: number; // 0-100
    letzterErfolg: number; // 0-100 (Bonus wenn kürzlich erfolgreich)
    wildkameraAktivitaet?: number; // 0-100 (Phase 5 Enhancement: Wildkamera-Insights)
  };
  
  // Gewichtung (kann konfiguriert werden)
  gewichtung: {
    historischerErfolg: number;
    aktuelleWetterbedingungen: number;
    tageszeit: number;
    wildartAffinitaet: number;
    mondphase: number;
    saisonaleEignung: number;
    letzterErfolg: number;
  };
  
  // Prognose
  prognose: {
    erfolgswahrscheinlichkeit: number; // 0-100
    confidence: number; // Phase 5 Enhancement: Confidence Score
    erwarteteWildarten: Array<{
      wildart: string;
      wahrscheinlichkeit: number;
      erwarteteAnzahl: number;
    }>;
    besteStunde: number; // 0-23
  };
  
  // Vergleich
  rank: number; // Rang unter allen Spots
  besserAls: number; // Prozent der anderen Spots
}

// ===========================
// PREDICTION MODEL
// ===========================

export interface PredictionModel {
  name: string;
  version: string;
  trainiertAm: Date;
  
  // Training-Daten
  trainingData: {
    anzahlEvents: number;
    zeitraum: { von: Date; bis: Date };
    wildarten: string[];
    reviere: string[];
  };
  
  // Model-Performance
  performance: {
    accuracy: number; // 0-100
    precision: number; // 0-100
    recall: number; // 0-100
    f1Score: number; // 0-100
    
    // Per Wildart
    perWildart: Record<string, {
      accuracy: number;
      sampleSize: number;
    }>;
  };
  
  // Features
  features: {
    wichtigkeit: Record<string, number>; // Feature -> Wichtigkeit (0-100)
    topFeatures: string[]; // Top 10 wichtigste Features
  };
  
  // Hyperparameter
  hyperparameter: {
    learningRate?: number;
    epochs?: number;
    batchSize?: number;
    [key: string]: any;
  };
}

// ===========================
// USER FEEDBACK
// ===========================

export const RecommendationFeedbackSchema = z.object({
  recommendationId: z.string(),
  userId: z.string(),
  revierId: z.string(),
  
  // Feedback
  umgesetzt: z.boolean(), // Hat User die Empfehlung befolgt?
  erfolgreich: z.boolean().optional(), // War es erfolgreich?
  
  // Rating
  rating: z.number().min(1).max(5).optional(), // 1-5 Sterne
  hilfreich: z.boolean(),
  
  // Detailliertes Feedback
  wasBesser: z.string().optional(),
  kommentar: z.string().optional(),
  
  // Tatsächliches Ergebnis
  tatsaechlichesErgebnis: z.object({
    wildart: z.string().optional(),
    anzahl: z.number().optional(),
    abschuss: z.boolean(),
  }).optional(),
  
  // Metadata
  erstelltAm: z.date(),
});

export type RecommendationFeedback = z.infer<typeof RecommendationFeedbackSchema>;

// ===========================
// HEATMAP DATA
// ===========================

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number; // 0-100
  radius: number; // Meter
  
  // Details
  wildart?: string;
  erfolgsrate?: number;
  anzahlEvents?: number;
  
  // Zeitfilter
  gueltigFuer?: {
    tageszeiten?: string[];
    jahreszeiten?: string[];
    wetterbedingungen?: {
      temperaturMin?: number;
      temperaturMax?: number;
      maxWind?: number;
    };
  };
}

export interface HeatmapLayer {
  id: string;
  name: string;
  wildart?: string; // Optional: Nur für eine Wildart
  
  points: HeatmapPoint[];
  
  // Visualisierung
  colorScheme: 'green-yellow-red' | 'blue-purple-red' | 'custom';
  opacity: number; // 0-1
  
  // Metadata
  generiertAm: Date;
  basierenAuf: number; // Anzahl Events
}

// ===========================
// CONFIG
// ===========================

export interface AIRecommendationConfig {
  // Feature
  enabled: boolean;
  
  // Model
  modelVersion: string;
  minTrainingData: number; // Minimum Events bevor Recommendations
  maxAge: number; // Maximales Alter der Daten in Tagen
  
  // Scoring-Gewichte
  gewichtung: {
    historischerErfolg: number; // 0-1
    aktuelleWetterbedingungen: number;
    tageszeit: number;
    wildartAffinitaet: number;
    mondphase: number;
    saisonaleEignung: number;
    letzterErfolg: number;
  };
  
  // Empfehlungs-Schwellwerte
  schwellwerte: {
    minScore: number; // Minimum Score für Empfehlung (0-100)
    minConfidence: number; // Minimum Confidence (0-100)
    minHistoricalEvents: number; // Minimum historische Events
  };
  
  // UI
  ui: {
    zeigeHeatmap: boolean;
    zeigeTopRecommendations: number; // Top N anzeigen
    updateInterval: number; // ms
  };
}

// ===========================
// ANALYTICS
// ===========================

export interface RecommendationAnalytics {
  zeitraum: { von: Date; bis: Date };
  
  // Gesamt-Statistiken
  gesamt: {
    erstellteEmpfehlungen: number;
    umgesetzteEmpfehlungen: number;
    erfolgreiche: number;
    erfolgsrate: number; // %
    durchschnittlicherScore: number;
    durchschnittlicheConfidence: number;
  };
  
  // Per Typ
  perTyp: Record<string, {
    anzahl: number;
    erfolgsrate: number;
    durchschnittlicherScore: number;
  }>;
  
  // Per Wildart
  perWildart: Record<string, {
    empfehlungen: number;
    erfolge: number;
    erfolgsrate: number;
  }>;
  
  // User-Satisfaction
  userSatisfaction: {
    durchschnittlichesRating: number; // 1-5
    hilfreich: number; // %
    verbesserungsvorschlaege: string[];
  };
  
  // Model-Performance über Zeit
  performanceOverTime: Array<{
    datum: Date;
    accuracy: number;
    sampleSize: number;
  }>;
}
