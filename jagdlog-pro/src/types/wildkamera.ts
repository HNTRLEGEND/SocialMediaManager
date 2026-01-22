/**
 * WILDKAMERA TYPES
 * 
 * Type definitions for trail camera (Wildkamera) integration
 * Part of Phase 7: AI-Vision & Wildlife Recognition
 * Phase 5 Enhancement: Data structures for AI-Recommendations integration
 * 
 * @module types/wildkamera
 */

import { z } from 'zod';
import type { GPSKoordinaten } from './gemeinsam';

// ============================================================================
// WILDKAMERA CORE TYPES
// ============================================================================

/**
 * Unterstützte Wildkamera-Marken
 * Priority: ICUSERVER, Zeiss (als wichtigste Marken)
 */
export type WildkameraMarke = 
  | 'ICUSERVER'      // ICUserver Cloud-Wildkameras (Priority)
  | 'Zeiss'          // Zeiss Secacam (Premium)
  | 'Spypoint'       // Spypoint LTE/Cellular
  | 'Browning'       // Browning Strike Force
  | 'Bushnell'       // Bushnell Trophy Cam
  | 'Wildkamera24'   // Wildkamera24.de Eigenmarken
  | 'Seissiger'      // Seissiger Special-Cam
  | 'Dörr'           // Dörr Snapshot
  | 'Reconyx'        // Reconyx HyperFire (Professional)
  | 'Cuddeback'      // Cuddeback Cuddelink
  | 'Moultrie'       // Moultrie Mobile
  | 'Generic';       // Generische/Unbekannte Marke

/**
 * Verbindungstypen für Wildkameras
 */
export type WildkameraVerbindungsTyp =
  | 'wifi'          // WiFi Direktverbindung
  | 'bluetooth'     // Bluetooth (nahe Reichweite)
  | 'cellular'      // Mobilfunk (Cloud)
  | 'sd_card'       // SD-Karte Import
  | 'cloud_sync';   // Cloud-Synchronisation (ICUSERVER, Zeiss)

/**
 * Verbindungsstatus
 */
export type WildkameraVerbindungsStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'syncing';

// ============================================================================
// WILDKAMERA INTERFACES
// ============================================================================

/**
 * Wildkamera Sichtfeld
 */
export interface WildkameraSichtfeld {
  winkel: number;       // Grad (z.B. 52° bei Zeiss Secacam)
  reichweite: number;   // Meter (Erfassungsbereich)
}

/**
 * Wildkamera Speicher-Info
 */
export interface WildkameraSpeicher {
  gesamt: number;   // MB
  belegt: number;   // MB
  frei: number;     // MB
}

/**
 * Wildkamera Verbindungsinformationen
 */
export interface WildkameraVerbindung {
  typ: WildkameraVerbindungsTyp;
  status: WildkameraVerbindungsStatus;
  letzteVerbindung?: Date;
  batterie: number;              // Prozent (0-100)
  speicher: WildkameraSpeicher;
  
  // Cloud-spezifisch (ICUSERVER, Zeiss)
  cloudConfig?: {
    apiEndpoint: string;
    apiKey?: string;
    autoSync: boolean;
    syncInterval: number;        // Minuten
  };
}

/**
 * Wildkamera Einstellungen
 */
export interface WildkameraEinstellungen {
  aufloesungFoto: '12MP' | '16MP' | '20MP' | '24MP' | '32MP';
  aufloesungVideo?: '720p' | '1080p' | '4K';
  ausloeserEmpfindlichkeit: 'niedrig' | 'mittel' | 'hoch';
  intervallModus: boolean;
  intervall?: number;            // Sekunden zwischen Aufnahmen
  nachtmodus: 'IR' | 'white_LED' | 'black_LED' | 'no_glow';
  
  // Erweitert
  videolaenge?: number;          // Sekunden
  serienbildModus?: boolean;
  serienbildAnzahl?: number;     // Anzahl Fotos pro Auslösung
}

/**
 * Wildkamera Statistiken
 */
export interface WildkameraStatistik {
  totalFotos: number;
  totalVideos: number;
  letzterAusloeser?: Date;
  haeufigsteWildart?: string;
  aktivsteZeit?: string;         // "06:00-08:00"
  
  // Erweitert
  wildartVerteilung: Record<string, number>;  // { "rehwild": 45, "schwarzwild": 12, ... }
  zeitVerteilung: {
    morgengrauen: number;
    vormittag: number;
    mittag: number;
    nachmittag: number;
    abenddaemmerung: number;
    nacht: number;
  };
}

/**
 * Hauptdatenstruktur: Wildkamera
 */
export interface Wildkamera {
  id: string;
  name: string;
  marke: WildkameraMarke;
  modell: string;
  
  // Standort
  gps: GPSKoordinaten;
  poi_id?: string;               // Verknüpfung zu POI
  ausrichtung: number;           // Grad (0-360, 0=Nord)
  sichtfeld: WildkameraSichtfeld;
  
  // Verbindung
  verbindung: WildkameraVerbindung;
  
  // Einstellungen
  einstellungen: WildkameraEinstellungen;
  
  // Statistiken
  statistik: WildkameraStatistik;
  
  // Metadaten
  erstelltAm: Date;
  aktualisiertAm: Date;
  revierId: string;
}

// ============================================================================
// FOTO-GALERIE TYPES
// ============================================================================

/**
 * Foto-Kategorien
 */
export type FotoKategorie =
  | 'sichtung'          // Lebendes Wild
  | 'abschuss'          // Erlegtes Wild
  | 'trophae'           // Trophäen-Foto
  | 'revier'            // Revierimpression
  | 'infrastruktur'     // Hochsitz, Kirrung, etc.
  | 'wildschaden'       // Wildschaden
  | 'wildkamera'        // Von Wildkamera
  | 'sonstiges';

/**
 * Foto-Quelle
 */
export type FotoQuelle =
  | 'kamera'            // Direkt mit App-Kamera aufgenommen
  | 'galerie'           // Aus Handy-Galerie importiert
  | 'wildkamera';       // Von Wildkamera importiert

/**
 * KI-Analyse Status
 */
export type KIAnalyseStatus =
  | 'pending'           // Wartet auf Analyse
  | 'processing'        // Wird analysiert
  | 'completed'         // Analyse abgeschlossen
  | 'failed';           // Analyse fehlgeschlagen

/**
 * Bounding Box für Objekt-Erkennung
 */
export interface BoundingBox {
  x: number;            // Pixel
  y: number;            // Pixel
  width: number;        // Pixel
  height: number;       // Pixel
  label: string;        // Wildart oder Objekt-Typ
  confidence: number;   // 0-100
}

/**
 * KI-Zusatzinformationen
 */
export interface KIZusatzInfo {
  gewichtSchaetzung?: number;       // kg
  groesseSchaetzung?: number;       // cm Schulterhöhe
  trophaeSchaetzung?: string;       // z.B. "6-Ender", "CIC 180+"
  gesundheitszustand?: 'gesund' | 'verletzt' | 'krank' | 'unbekannt';
  
  // Morphologische Features (für Geschlechtserkennung)
  morphologie?: {
    antlerDetected: boolean;        // Geweih/Gehörn erkannt
    udderDetected: boolean;         // Zitzen erkannt
    headShape: number[];            // Kopfform-Vektor
    bodyProportions: number[];      // Körperproportionen
  };
}

/**
 * KI-Analyse Ergebnis
 */
export interface KIAnalyse {
  status: KIAnalyseStatus;
  wildart?: string;                 // wildart_id aus WILDARTEN
  confidence: number;               // 0-100
  geschlecht?: 'männlich' | 'weiblich' | 'unbekannt';
  altersklasse?: string;
  anzahl: number;                   // Anzahl erkannter Tiere
  boundingBoxes: BoundingBox[];
  zusatzInfo: KIZusatzInfo;
  
  // Model Info
  modelVersion?: string;
  analyseDatum?: Date;
  verarbeitungszeit?: number;       // Millisekunden
  
  // Alternative Vorhersagen
  alternativeVorhersagen?: Array<{
    wildart: string;
    confidence: number;
  }>;
}

/**
 * Galerie-Foto
 */
export interface GalerieFoto {
  id: string;
  uri: string;                      // Lokaler Dateipfad
  thumbnail: string;                // Thumbnail-Pfad
  gps: GPSKoordinaten;
  zeitpunkt: Date;
  kategorie: FotoKategorie;
  quelle: FotoQuelle;
  
  // KI-Analyse
  aiAnalyse: KIAnalyse;
  
  // Verknüpfungen
  eintragId?: string;               // Link zu Jagd-Eintrag
  wildkameraId?: string;            // Link zu Wildkamera
  
  // Metadaten
  revierId: string;
  dateigroesse: number;             // Bytes
  aufloesung?: {
    width: number;
    height: number;
  };
  
  erstelltAm: Date;
}

/**
 * Foto-Match (für GPS-Scan)
 */
export interface PhotoMatch {
  assetId: string;                  // expo-media-library Asset ID
  uri: string;
  location: GPSKoordinaten;
  timestamp: Date;
  analyzed: boolean;
  aiResults?: KIAnalyse;
}

// ============================================================================
// WILDKAMERA MEDIA TYPES
// ============================================================================

/**
 * Media-Typ von Wildkamera
 */
export type WildkameraMediaTyp = 'foto' | 'video';

/**
 * Wildkamera Media (Foto/Video)
 */
export interface WildkameraMedia {
  id: string;
  wildkameraId: string;
  typ: WildkameraMediaTyp;
  
  // Datei
  uri: string;                      // Lokaler Pfad
  thumbnail: string;
  originalFilename: string;
  dateigroesse: number;             // Bytes
  
  // Metadaten
  zeitpunkt: Date;
  gps: GPSKoordinaten;              // Von Wildkamera übernommen
  
  // KI-Analyse
  aiAnalyse: KIAnalyse;
  
  // Galerie-Verknüpfung
  galerieFotoId?: string;           // Wenn in Galerie übernommen
  
  // Import Info
  importiertAm: Date;
  verarbeitet: boolean;
}

/**
 * Wildkamera Import-Ergebnis
 */
export interface WildkameraImportResult {
  kameraId: string;
  totalImported: number;
  wildDetected: number;
  fotosImported: number;
  videosImported: number;
  eintraegeErstellt: number;
  
  results: Array<{
    media: WildkameraMedia;
    galerieFoto?: GalerieFoto;
    eintrag?: {
      id: string;
      typ: 'beobachtung';
      wildart: string;
    };
    detection: KIAnalyse;
  }>;
  
  fehler?: Array<{
    mediaId: string;
    fehlergrund: string;
  }>;
}

// ============================================================================
// BEWEGUNGSMUSTER TYPES
// ============================================================================

/**
 * Wildart-Bewegungsmuster
 */
export interface WildartBewegung {
  wildart: string;
  
  // Zeitliche Muster
  zeitlicheMuster: {
    morgengrauen: number;           // Anzahl Sichtungen
    vormittag: number;
    mittag: number;
    nachmittag: number;
    abenddaemmerung: number;
    nacht: number;
  };
  
  // Häufigkeit
  frequenz: {
    totalSichtungen: number;
    durchschnittProTag: number;
    spitzenzeiten: Array<{
      zeitfenster: string;          // "06:00-08:00"
      sichtungen: number;
    }>;
  };
  
  // Bewegungsrichtung (experimentell)
  bewegungsrichtung?: {
    richtung: 'links_nach_rechts' | 'rechts_nach_links' | 'auf_kamera_zu' | 'von_kamera_weg';
    confidence: number;
  };
  
  // Gruppengröße
  gruppengroesse: {
    durchschnitt: number;
    minimum: number;
    maximum: number;
  };
  
  // Korrelationen
  wetterKorrelation?: {
    beiWind: number;                // Sichtungen bei Wind
    beiRegen: number;
    beiSchnee: number;
    korrelationsKoeffizient: number;
  };
  
  mondphasenKorrelation?: {
    neumond: number;
    zunehmend: number;
    vollmond: number;
    abnehmend: number;
  };
}

/**
 * Bewegungsmuster-Analyse
 */
export interface BewegungsMuster {
  kameraId: string;
  zeitraum: {
    von: Date;
    bis: Date;
  };
  
  // Muster pro Wildart
  muster: Record<string, WildartBewegung>;
  
  // Zusammenfassung
  zusammenfassung: {
    aktivsteWildart: string;
    aktivsteZeit: string;
    totalSichtungen: number;
    einzigartigeWildarten: number;
  };
}

/**
 * Wildkamera Insights (für AI-Recommendations)
 */
export interface WildkameraInsights {
  kameraId: string;
  position: GPSKoordinaten;
  
  // Letzte Aktivität
  letzteAktivitaet: Array<{
    wildart: string;
    zeitpunkt: Date;
    anzahl: number;
    confidence: number;
  }>;
  
  // Aktivitäts-Level
  aktivitaetsLevel: 'hoch' | 'mittel' | 'niedrig';
  
  // Empfohlene Jagdzeit
  empfohleneJagdzeit?: string;      // "05:30-07:00" basierend auf Mustern
  
  // Statistiken (letzte 7/30 Tage)
  statistik7Tage: {
    totalSichtungen: number;
    haeufigsteWildart?: string;
    durchschnittProTag: number;
  };
  
  statistik30Tage: {
    totalSichtungen: number;
    wildartVerteilung: Record<string, number>;
    trend: 'steigend' | 'stabil' | 'fallend';
  };
}

// ============================================================================
// ZOD SCHEMAS (Runtime Validation)
// ============================================================================

export const WildkameraSichtfeldSchema = z.object({
  winkel: z.number().min(0).max(180),
  reichweite: z.number().min(0),
});

export const WildkameraSpeicherSchema = z.object({
  gesamt: z.number().min(0),
  belegt: z.number().min(0),
  frei: z.number().min(0),
});

export const WildkameraVerbindungSchema = z.object({
  typ: z.enum(['wifi', 'bluetooth', 'cellular', 'sd_card', 'cloud_sync']),
  status: z.enum(['connected', 'disconnected', 'error', 'syncing']),
  letzteVerbindung: z.date().optional(),
  batterie: z.number().min(0).max(100),
  speicher: WildkameraSpeicherSchema,
  cloudConfig: z.object({
    apiEndpoint: z.string(),
    apiKey: z.string().optional(),
    autoSync: z.boolean(),
    syncInterval: z.number().min(1),
  }).optional(),
});

export const WildkameraEinstellungenSchema = z.object({
  aufloesungFoto: z.enum(['12MP', '16MP', '20MP', '24MP', '32MP']),
  aufloesungVideo: z.enum(['720p', '1080p', '4K']).optional(),
  ausloeserEmpfindlichkeit: z.enum(['niedrig', 'mittel', 'hoch']),
  intervallModus: z.boolean(),
  intervall: z.number().min(1).optional(),
  nachtmodus: z.enum(['IR', 'white_LED', 'black_LED', 'no_glow']),
  videolaenge: z.number().min(1).optional(),
  serienbildModus: z.boolean().optional(),
  serienbildAnzahl: z.number().min(1).max(10).optional(),
});

export const WildkameraSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  marke: z.enum([
    'ICUSERVER',
    'Zeiss',
    'Spypoint',
    'Browning',
    'Bushnell',
    'Wildkamera24',
    'Seissiger',
    'Dörr',
    'Reconyx',
    'Cuddeback',
    'Moultrie',
    'Generic',
  ]),
  modell: z.string(),
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  poi_id: z.string().optional(),
  ausrichtung: z.number().min(0).max(360),
  sichtfeld: WildkameraSichtfeldSchema,
  verbindung: WildkameraVerbindungSchema,
  einstellungen: WildkameraEinstellungenSchema,
  statistik: z.object({
    totalFotos: z.number().min(0),
    totalVideos: z.number().min(0),
    letzterAusloeser: z.date().optional(),
    haeufigsteWildart: z.string().optional(),
    aktivsteZeit: z.string().optional(),
    wildartVerteilung: z.record(z.number()),
    zeitVerteilung: z.object({
      morgengrauen: z.number(),
      vormittag: z.number(),
      mittag: z.number(),
      nachmittag: z.number(),
      abenddaemmerung: z.number(),
      nacht: z.number(),
    }),
  }),
  erstelltAm: z.date(),
  aktualisiertAm: z.date(),
  revierId: z.string(),
});

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  label: z.string(),
  confidence: z.number().min(0).max(100),
});

export const KIAnalyseSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  wildart: z.string().optional(),
  confidence: z.number().min(0).max(100),
  geschlecht: z.enum(['männlich', 'weiblich', 'unbekannt']).optional(),
  altersklasse: z.string().optional(),
  anzahl: z.number().min(0),
  boundingBoxes: z.array(BoundingBoxSchema),
  zusatzInfo: z.object({
    gewichtSchaetzung: z.number().optional(),
    groesseSchaetzung: z.number().optional(),
    trophaeSchaetzung: z.string().optional(),
    gesundheitszustand: z.enum(['gesund', 'verletzt', 'krank', 'unbekannt']).optional(),
    morphologie: z.object({
      antlerDetected: z.boolean(),
      udderDetected: z.boolean(),
      headShape: z.array(z.number()),
      bodyProportions: z.array(z.number()),
    }).optional(),
  }),
  modelVersion: z.string().optional(),
  analyseDatum: z.date().optional(),
  verarbeitungszeit: z.number().optional(),
  alternativeVorhersagen: z.array(z.object({
    wildart: z.string(),
    confidence: z.number().min(0).max(100),
  })).optional(),
});

export const GalerieFotoSchema = z.object({
  id: z.string(),
  uri: z.string(),
  thumbnail: z.string(),
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  zeitpunkt: z.date(),
  kategorie: z.enum([
    'sichtung',
    'abschuss',
    'trophae',
    'revier',
    'infrastruktur',
    'wildschaden',
    'wildkamera',
    'sonstiges',
  ]),
  quelle: z.enum(['kamera', 'galerie', 'wildkamera']),
  aiAnalyse: KIAnalyseSchema,
  eintragId: z.string().optional(),
  wildkameraId: z.string().optional(),
  revierId: z.string(),
  dateigroesse: z.number().min(0),
  aufloesung: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  erstelltAm: z.date(),
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Wildkamera Create Input (für neue Wildkamera)
 */
export type WildkameraCreateInput = Omit<Wildkamera, 'id' | 'erstelltAm' | 'aktualisiertAm' | 'statistik'> & {
  statistik?: Partial<WildkameraStatistik>;
};

/**
 * Wildkamera Update Input
 */
export type WildkameraUpdateInput = Partial<Omit<Wildkamera, 'id' | 'erstelltAm' | 'revierId'>>;

/**
 * Galerie-Foto Create Input
 */
export type GalerieFotoCreateInput = Omit<GalerieFoto, 'id' | 'erstelltAm' | 'aiAnalyse'> & {
  aiAnalyse?: Partial<KIAnalyse>;
};

/**
 * Filter für Galerie-Fotos
 */
export interface GalerieFotoFilter {
  wildart?: string;
  datum?: {
    von: Date;
    bis: Date;
  };
  standort?: {
    poi_id: string;
  };
  autoImported?: boolean;
  analysiert?: boolean;
  kategorie?: FotoKategorie;
  quelle?: FotoQuelle;
  minConfidence?: number;
}

/**
 * Sortierung für Galerie
 */
export type GalerieSortierung = 'datum' | 'wildart' | 'standort' | 'ki_score';
