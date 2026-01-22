/**
 * Phase 7A: Wildkamera KI-Detection Types
 * 
 * Deep Learning basierte Wildart-Erkennung
 * - YOLO v8 (Object Detection)
 * - EfficientNet (Classification)
 * - ResNet (Trophy Analysis)
 */

import { z } from 'zod';

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Bounding Box (normalized coordinates 0-1)
 */
export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1),      // Top-left X
  y: z.number().min(0).max(1),      // Top-left Y
  width: z.number().min(0).max(1),  // Width
  height: z.number().min(0).max(1), // Height
});

export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

/**
 * ML Model Metadata
 */
export const MLModelMetadataSchema = z.object({
  modelName: z.string(),           // "yolo-v8", "efficientnet-b0", "resnet-50"
  version: z.string(),             // "1.0.0"
  device: z.enum(['cpu', 'gpu', 'npu', 'ane']), // Ausführungs-Device
  inferenceTimeMs: z.number(),     // Inference-Zeit in ms
  timestamp: z.date(),
});

export type MLModelMetadata = z.infer<typeof MLModelMetadataSchema>;

// ============================================================================
// WILDART CLASSIFICATION
// ============================================================================

/**
 * Wildart-Klassifikation Result
 */
export const WildartClassificationSchema = z.object({
  // Haupt-Klasse
  hauptKlasse: z.object({
    wildart: z.string(),            // "rehwild", "schwarzwild", etc.
    confidence: z.number().min(0).max(100),
    boundingBox: BoundingBoxSchema,
  }),
  
  // Alternative Klassen (Top 3)
  alternativeKlassen: z.array(z.object({
    wildart: z.string(),
    confidence: z.number().min(0).max(100),
  })).max(3),
  
  // Metadata
  metadata: MLModelMetadataSchema,
});

export type WildartClassification = z.infer<typeof WildartClassificationSchema>;

// ============================================================================
// GESCHLECHT ERKENNUNG
// ============================================================================

/**
 * Erkennbare Merkmale für Geschlecht
 */
export const GeschlechtMerkmaleSchema = z.object({
  geweihSichtbar: z.boolean().optional(),
  gehörnSichtbar: z.boolean().optional(),
  gesäugeSichtbar: z.boolean().optional(),
  waffenSichtbar: z.boolean().optional(),  // Keiler
  körperbau: z.enum(['massig', 'schlank', 'neutral']).optional(),
});

export type GeschlechtMerkmale = z.infer<typeof GeschlechtMerkmaleSchema>;

/**
 * Geschlecht-Erkennung Result
 */
export const GeschlechtErkennungSchema = z.object({
  geschlecht: z.enum(['männlich', 'weiblich', 'unbekannt']),
  confidence: z.number().min(0).max(100),
  
  merkmale: GeschlechtMerkmaleSchema,
  reasoning: z.array(z.string()),  // ["Geweih erkannt", "Starker Wildkörper"]
  
  metadata: MLModelMetadataSchema,
});

export type GeschlechtErkennung = z.infer<typeof GeschlechtErkennungSchema>;

// ============================================================================
// ALTERSKLASSE SCHÄTZUNG
// ============================================================================

/**
 * Altersklasse Merkmale
 */
export const AltersklasseMerkmaleSchema = z.object({
  körpergröße: z.enum(['klein', 'mittel', 'groß']),
  geweihEntwicklung: z.enum(['kein', 'spieß', 'klein', 'mittel', 'stark']).optional(),
  proportionen: z.string().optional(),
  fellFärbung: z.string().optional(),
});

export type AltersklasseMerkmale = z.infer<typeof AltersklasseMerkmaleSchema>;

/**
 * Altersklasse-Schätzung Result
 */
export const AltersklasseSchätzungSchema = z.object({
  altersklasse: z.enum(['jung', 'mittel', 'alt', 'unbekannt']),
  
  geschätztesAlter: z.object({
    min: z.number(),               // Jahre
    max: z.number(),
    wahrscheinlichst: z.number(),
  }),
  
  confidence: z.number().min(0).max(100),
  merkmale: AltersklasseMerkmaleSchema,
  
  metadata: MLModelMetadataSchema,
});

export type AltersklasseSchätzung = z.infer<typeof AltersklasseSchätzungSchema>;

// ============================================================================
// TROPHÄEN BEWERTUNG
// ============================================================================

/**
 * Geweih-Analyse (Cerviden)
 */
export const GeweihAnalyseSchema = z.object({
  endenAnzahl: z.object({
    links: z.number(),
    rechts: z.number(),
    gesamt: z.number(),
  }),
  
  symmetrie: z.number().min(0).max(100),  // % (100 = perfekt symmetrisch)
  stangenLänge: z.enum(['kurz', 'mittel', 'lang', 'sehr_lang']),
  qualität: z.enum(['bronze', 'silber', 'gold', 'medaille']),
  
  geschätzteCIC: z.object({
    min: z.number(),
    max: z.number(),
    wahrscheinlich: z.number(),
  }),
});

export type GeweihAnalyse = z.infer<typeof GeweihAnalyseSchema>;

/**
 * Waffen-Analyse (Schwarzwild)
 */
export const WaffenAnalyseSchema = z.object({
  länge: z.enum(['kurz', 'mittel', 'lang', 'sehr_lang']),
  sichtbar: z.boolean(),
});

export type WaffenAnalyse = z.infer<typeof WaffenAnalyseSchema>;

/**
 * Körper-Kondition (Body Condition Score 1-5)
 */
export const KörperKonditionSchema = z.object({
  score: z.number().min(1).max(5),
  beschreibung: z.enum(['mager', 'normal', 'gut', 'sehr_gut', 'verfettet']),
});

export type KörperKondition = z.infer<typeof KörperKonditionSchema>;

/**
 * Trophäen-Bewertung Result
 */
export const TrophäenBewertungSchema = z.object({
  isTrophäe: z.boolean(),
  confidence: z.number().min(0).max(100),
  
  // Cerviden
  geweih: GeweihAnalyseSchema.optional(),
  
  // Schwarzwild
  waffen: WaffenAnalyseSchema.optional(),
  
  // Allgemein
  körperKondition: KörperKonditionSchema,
  
  metadata: MLModelMetadataSchema,
});

export type TrophäenBewertung = z.infer<typeof TrophäenBewertungSchema>;

// ============================================================================
// MULTI-OBJECT DETECTION
// ============================================================================

/**
 * Einzelnes erkanntes Individuum
 */
export const DetectedIndividuumSchema = z.object({
  id: z.string(),                  // Tracking-ID
  objektIndex: z.number(),         // 0, 1, 2, ...
  
  // Classification
  wildart: z.string(),
  wildartConfidence: z.number().min(0).max(100),
  
  geschlecht: z.enum(['männlich', 'weiblich', 'unbekannt']).optional(),
  geschlechtConfidence: z.number().min(0).max(100).optional(),
  
  altersklasse: z.enum(['jung', 'mittel', 'alt', 'unbekannt']).optional(),
  altersklasseConfidence: z.number().min(0).max(100).optional(),
  
  // Location
  boundingBox: BoundingBoxSchema,
  
  // Trophy (optional)
  trophäenInfo: TrophäenBewertungSchema.optional(),
  
  // Tracking (für Video/Serien)
  trackingId: z.string().optional(),
});

export type DetectedIndividuum = z.infer<typeof DetectedIndividuumSchema>;

/**
 * Gruppen-Erkennung (Rotte, Rudel, Sprung)
 */
export const WildGruppeSchema = z.object({
  typ: z.enum(['rotte', 'rudel', 'sprung', 'gruppe']),
  anzahl: z.number(),
  wildart: z.string(),
  
  zusammensetzung: z.object({
    männlich: z.number(),
    weiblich: z.number(),
    jung: z.number(),
    unbekannt: z.number(),
  }),
});

export type WildGruppe = z.infer<typeof WildGruppeSchema>;

/**
 * Anzahl-Zählung Result
 */
export const AnzahlZählungSchema = z.object({
  gesamtAnzahl: z.number(),
  
  individuen: z.array(DetectedIndividuumSchema),
  gruppen: z.array(WildGruppeSchema),
  
  metadata: MLModelMetadataSchema,
});

export type AnzahlZählung = z.infer<typeof AnzahlZählungSchema>;

// ============================================================================
// COMPLETE KI DETECTION RESULT
// ============================================================================

/**
 * Vollständiges KI-Detection Result
 */
export const KIDetectionResultSchema = z.object({
  id: z.string(),
  
  // Input
  wildkameraMediaId: z.string(),
  revierId: z.string(),
  
  // Status
  verarbeitungsstatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  
  // Results
  anzahlErkannt: z.number(),
  hauptWildart: z.string().optional(),
  confidenceGesamt: z.number().min(0).max(100).optional(),
  
  // Detaillierte Objekte
  objekte: z.array(DetectedIndividuumSchema),
  
  // Gruppen
  gruppen: z.array(WildGruppeSchema).optional(),
  
  // Verarbeitung
  verarbeitetAm: z.date().optional(),
  verarbeitungszeitMs: z.number().optional(),
  modelVersion: z.string().optional(),
  deviceTyp: z.enum(['cpu', 'gpu', 'npu', 'ane']).optional(),
  
  // Fehler
  fehlerCode: z.string().optional(),
  fehlerNachricht: z.string().optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KIDetectionResult = z.infer<typeof KIDetectionResultSchema>;

// ============================================================================
// USER FEEDBACK
// ============================================================================

/**
 * User Feedback für KI-Detection
 */
export const DetectionFeedbackSchema = z.object({
  id: z.string(),
  
  // Referenzen
  detectionId: z.string(),
  objektId: z.string(),
  userId: z.string(),
  
  // Feedback
  istKorrekt: z.boolean(),
  
  // Korrekturen (falls inkorrekt)
  korrekturWildart: z.string().optional(),
  korrekturGeschlecht: z.enum(['männlich', 'weiblich', 'unbekannt']).optional(),
  korrekturAltersklasse: z.enum(['jung', 'mittel', 'alt', 'unbekannt']).optional(),
  korrekturAnzahl: z.number().optional(),
  
  // Zusätzliche Infos
  bemerkungen: z.string().optional(),
  bildQualität: z.enum(['schlecht', 'mittel', 'gut', 'sehr_gut']),
  
  // Timestamps
  createdAt: z.date(),
});

export type DetectionFeedback = z.infer<typeof DetectionFeedbackSchema>;

// ============================================================================
// ML MODEL INFO
// ============================================================================

/**
 * ML Model Information (für Model Management)
 */
export const MLModelInfoSchema = z.object({
  id: z.string(),
  
  modelName: z.string(),           // 'yolo-v8', 'efficientnet-b0', 'resnet-50'
  version: z.string(),             // '1.0.0'
  
  // Model File
  dateiName: z.string(),           // 'yolov8n-wildlife.tflite'
  dateiGröße: z.number(),          // Bytes
  checksumSHA256: z.string(),
  
  plattform: z.enum(['ios', 'android', 'both']),
  
  // Performance Metrics
  accuracy: z.number().optional(),         // mAP, Accuracy, etc.
  inferenceTimeMs: z.number().optional(),  // Durchschnitt
  
  // Status
  status: z.enum(['available', 'deprecated', 'training']),
  
  // Download
  downloadUrl: z.string().optional(),
  sizeCompressed: z.number().optional(),   // Bytes (gz)
  
  // Training
  trainiertAm: z.date().optional(),
  trainingsDatasetGröße: z.number().optional(),
  trainingsParameter: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MLModelInfo = z.infer<typeof MLModelInfoSchema>;

// ============================================================================
// DETECTION OPTIONS
// ============================================================================

/**
 * Options für Detection Request
 */
export const DetectionOptionsSchema = z.object({
  minConfidence: z.number().min(0).max(100).default(30),
  maxObjects: z.number().min(1).max(50).default(20),
  enableTrophyAnalysis: z.boolean().default(true),
  useGPU: z.boolean().default(true),
  
  // Advanced
  nmsThreshold: z.number().min(0).max(1).default(0.45),  // Non-Maximum Suppression
  preprocessingQuality: z.enum(['fast', 'balanced', 'quality']).default('balanced'),
});

export type DetectionOptions = z.infer<typeof DetectionOptionsSchema>;

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Batch Processing Status
 */
export const BatchProcessingStatusSchema = z.object({
  id: z.string(),
  
  // Queue
  totalImages: z.number(),
  processedImages: z.number(),
  failedImages: z.number(),
  
  // Progress
  currentImage: z.string().optional(),
  progressPercent: z.number().min(0).max(100),
  
  // Timing
  startedAt: z.date(),
  estimatedTimeRemainingMs: z.number().optional(),
  
  // Results
  totalDetections: z.number(),
  detectionsByWildart: z.record(z.number()),
  
  // Status
  status: z.enum(['queued', 'processing', 'paused', 'completed', 'failed']),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BatchProcessingStatus = z.infer<typeof BatchProcessingStatusSchema>;

// ============================================================================
// KI INSIGHTS & STATISTICS
// ============================================================================

/**
 * KI-Insights für Dashboard
 */
export const KIInsightsSchema = z.object({
  revierId: z.string(),
  zeitraum: z.object({
    von: z.date(),
    bis: z.date(),
  }),
  
  // Wildart-Verteilung
  wildartVerteilung: z.array(z.object({
    wildart: z.string(),
    anzahl: z.number(),
    prozent: z.number(),
  })),
  
  // Aktivitätsmuster
  aktivitätsmuster: z.object({
    nacht: z.number(),      // %
    dämmerung: z.number(),  // %
    tag: z.number(),        // %
  }),
  
  // Hotspots (Top Kameras)
  hotspots: z.array(z.object({
    kameraId: z.string(),
    kameraName: z.string(),
    sichtungen: z.number(),
  })),
  
  // Trophäen-Kandidaten
  trophäenKandidaten: z.array(z.object({
    detectionId: z.string(),
    wildart: z.string(),
    geschätzteCIC: z.number().optional(),
    qualität: z.string(),
    datum: z.date(),
  })),
  
  // Accuracy Tracking
  accuracyMetrics: z.object({
    gesamtAccuracy: z.number(),
    userFeedbackCount: z.number(),
    korrektRate: z.number(),  // %
  }),
});

export type KIInsights = z.infer<typeof KIInsightsSchema>;

// ============================================================================
// EXPORTS
// ============================================================================

export const KIDetectionSchemas = {
  BoundingBox: BoundingBoxSchema,
  MLModelMetadata: MLModelMetadataSchema,
  WildartClassification: WildartClassificationSchema,
  GeschlechtErkennung: GeschlechtErkennungSchema,
  AltersklasseSchätzung: AltersklasseSchätzungSchema,
  TrophäenBewertung: TrophäenBewertungSchema,
  DetectedIndividuum: DetectedIndividuumSchema,
  WildGruppe: WildGruppeSchema,
  AnzahlZählung: AnzahlZählungSchema,
  KIDetectionResult: KIDetectionResultSchema,
  DetectionFeedback: DetectionFeedbackSchema,
  MLModelInfo: MLModelInfoSchema,
  DetectionOptions: DetectionOptionsSchema,
  BatchProcessingStatus: BatchProcessingStatusSchema,
  KIInsights: KIInsightsSchema,
};
