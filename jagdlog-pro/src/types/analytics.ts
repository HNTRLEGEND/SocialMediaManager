/**
 * Phase 8: Advanced Analytics & Predictions - TypeScript Types
 * 
 * Features:
 * - Weather Correlation & Wildlife Activity Prediction
 * - Movement Patterns & Migration Predictions
 * - Shot Analysis & Hit Zone Detection
 * - Blood Trail Tracking & Recovery Recommendations
 * - Population Tracking & Trend Analysis
 * - Hunting Success Prediction & Hotspot Scoring
 * - User-Contributed Training Data (Crowdsourcing)
 * - Recovery Location Prediction (ML-based)
 */

import { z } from 'zod';
import type { WildArt, POI } from './jagd';

// ============================================================================
// WEATHER CORRELATION
// ============================================================================

export const WeatherParametersSchema = z.object({
  // Basic Weather
  temperatur: z.number(),                    // °C
  luftdruck: z.number(),                     // hPa
  luftfeuchtigkeit: z.number().min(0).max(100), // %
  niederschlag: z.number().min(0),           // mm/h
  
  // Wind
  windgeschwindigkeit: z.number().min(0),    // km/h
  windrichtung: z.number().min(0).max(360),  // 0-360°
  windböen: z.number().min(0),               // km/h
  
  // Sun/Moon
  bewölkung: z.number().min(0).max(100),     // %
  sichtweite: z.number().min(0),             // km
  uv_index: z.number().min(0).max(15),       // 0-11+
  mondphase: z.number().min(0).max(1),       // 0 (Neumond) - 1 (Vollmond)
  mondaufgang: z.date(),
  monduntergang: z.date(),
  
  // Additional
  taupunkt: z.number(),                      // °C
  gefühlte_temperatur: z.number(),           // °C
  schneefall: z.number().min(0),             // cm
});

export type WeatherParameters = z.infer<typeof WeatherParametersSchema>;

export const AktivitätsLevelSchema = z.object({
  score: z.number().min(0).max(100),
  kategorie: z.enum(['sehr_niedrig', 'niedrig', 'mittel', 'hoch', 'sehr_hoch']),
  confidence: z.number().min(0).max(100),    // %
});

export type AktivitätsLevel = z.infer<typeof AktivitätsLevelSchema>;

export const OptimaleZeitSchema = z.object({
  von: z.date(),
  bis: z.date(),
  score: z.number().min(0).max(100),
  begründung: z.string(),
});

export type OptimaleZeit = z.infer<typeof OptimaleZeitSchema>;

export const WettereinflussSchema = z.object({
  temperatur: z.number().min(-1).max(1),     // -1 (negativ) bis +1 (positiv)
  luftdruck: z.number().min(-1).max(1),
  wind: z.number().min(-1).max(1),
  niederschlag: z.number().min(-1).max(1),
  mondphase: z.number().min(-1).max(1),
});

export type Wettereinfluss = z.infer<typeof WettereinflussSchema>;

export const JagdempfehlungSchema = z.object({
  sollJagen: z.boolean(),
  begründung: z.string(),
  alternativeZeiten: z.array(z.date()),
});

export type Jagdempfehlung = z.infer<typeof JagdempfehlungSchema>;

export const WildaktivitätVorhersageSchema = z.object({
  wildart: z.string(),                       // WildArt
  zeitraum: z.object({
    von: z.date(),
    bis: z.date(),
  }),
  aktivitätsLevel: AktivitätsLevelSchema,
  optimalZeiten: z.array(OptimaleZeitSchema),
  wettereinfluss: WettereinflussSchema,
  empfehlung: JagdempfehlungSchema,
});

export type WildaktivitätVorhersage = z.infer<typeof WildaktivitätVorhersageSchema>;

// ============================================================================
// MOVEMENT PATTERNS & MIGRATION
// ============================================================================

export const TageszeitMusterSchema = z.object({
  von: z.number().min(0).max(23),            // Stunde 0-23
  bis: z.number().min(0).max(23),
  wahrscheinlichkeit: z.number().min(0).max(100),
});

export type TageszeitMuster = z.infer<typeof TageszeitMusterSchema>;

export const JahreszeitenMusterSchema = z.object({
  frühling: z.number().min(0).max(100),      // %
  sommer: z.number().min(0).max(100),
  herbst: z.number().min(0).max(100),
  winter: z.number().min(0).max(100),
});

export type JahreszeitenMuster = z.infer<typeof JahreszeitenMusterSchema>;

export const HauptwechselSchema = z.object({
  von: z.string(),                           // POI ID
  nach: z.string(),                          // POI ID
  häufigkeit: z.number().min(0),             // Anzahl Beobachtungen
  wahrscheinlichkeit: z.number().min(0).max(100),
  tageszeiten: z.array(TageszeitMusterSchema),
  jahreszeiten: JahreszeitenMusterSchema,
});

export type Hauptwechsel = z.infer<typeof HauptwechselSchema>;

export const HotspotSchema = z.object({
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  radius: z.number().min(0),                 // Meter
  sichtungen: z.number().min(0),
  letzteAktivität: z.date(),
  durchschnittlicheAufenthaltsdauer: z.number().min(0), // Minuten
  optimalZeiten: z.array(z.string()),        // ["05:00-07:00", "18:00-20:00"]
});

export type Hotspot = z.infer<typeof HotspotSchema>;

export const AktivitätsZeitenSchema = z.object({
  stündlich: z.array(z.number()).length(24), // [0-23] - Aktivität pro Stunde
  wöchentlich: z.array(z.number()).length(7), // [0-6] - Aktivität pro Wochentag
  monatlich: z.array(z.number()).length(12),  // [0-11] - Aktivität pro Monat
});

export type AktivitätsZeiten = z.infer<typeof AktivitätsZeitenSchema>;

export const BewegungsVorhersageSchema = z.object({
  zeitpunkt: z.date(),
  ort: z.string(),                           // POI ID
  wahrscheinlichkeit: z.number().min(0).max(100),
  wildart: z.string(),
  geschätzteAnzahl: z.number().min(0),
});

export type BewegungsVorhersage = z.infer<typeof BewegungsVorhersageSchema>;

export const BewegungsmusterAnalyseSchema = z.object({
  wildart: z.string(),
  revier_id: z.string(),
  hauptwechsel: z.array(HauptwechselSchema),
  hotspots: z.array(HotspotSchema),
  aktivitätsZeiten: AktivitätsZeitenSchema,
  nächsteVorhersagen: z.array(BewegungsVorhersageSchema),
});

export type BewegungsmusterAnalyse = z.infer<typeof BewegungsmusterAnalyseSchema>;

// ============================================================================
// SHOT ANALYSIS & HIT ZONE DETECTION
// ============================================================================

export const TrefferArtSchema = z.enum([
  'Blattschuss',           // Herz/Lunge - OPTIMAL
  'Trägerschuss',          // Wirbelsäule - OPTIMAL
  'Kammerschuss',          // Herz/große Gefäße - OPTIMAL
  'Laufschuss',            // Bein/Lauf - SCHLECHT
  'Lebertreffer',          // Leber - OK (stirbt verzögert)
  'Nierenschuss',          // Niere - OK
  'Pansenschuss',          // Magen/Darm - SCHLECHT
  'Waidwundschuss',        // Bauchraum - SCHLECHT
  'Keulenschuss',          // Hinterkeule - MITTEL
  'Hauptschuss',           // Kopf - OPTIMAL (wenn getroffen)
  'Fehlschuss',            // Vorbei
  'Streifschuss',          // Nur gestreift
]);

export type TrefferArt = z.infer<typeof TrefferArtSchema>;

export const SchussplatzierungSchema = z.object({
  ziel: z.enum(['Blatt', 'Träger', 'Kammer', 'Keule', 'Lauf', 'Haupt', 'Unbekannt']),
  getroffen: z.boolean(),
  confidence: z.number().min(0).max(100),
});

export type Schussplatzierung = z.infer<typeof SchussplatzierungSchema>;

export const WildReaktionSchema = z.object({
  typ: z.enum(['Zusammenbruch', 'Flucht', 'Zeichnen', 'Keine_Reaktion']),
  richtung: z.number().min(0).max(360).optional(), // 0-360° bei Flucht
  geschwindigkeit: z.enum(['Langsam', 'Mittel', 'Schnell']).optional(),
  lautäußerung: z.enum(['Schreien', 'Klagen', 'Keine']).optional(),
  verhalten: z.array(z.string()).optional(), // ["Hochflüchtig", "Katzenbuckel", "Taumeln"]
});

export type WildReaktion = z.infer<typeof WildReaktionSchema>;

export const BlutSchema = z.object({
  vorhanden: z.boolean(),
  farbe: z.enum(['Hellrot', 'Dunkelrot', 'Bräunlich', 'Schaumig']).optional(),
  menge: z.enum(['Keine', 'Wenig', 'Mittel', 'Viel']).optional(),
  verteilung: z.enum(['Tropfen', 'Spritzer', 'Fährte', 'Lache']).optional(),
  höhe: z.enum(['Bodennah', 'Kniehoch', 'Brusthoch']).optional(),
});

export type Blut = z.infer<typeof BlutSchema>;

export const SchweißDetailsSchema = z.object({
  lungenblut: z.boolean(),                   // Hellrot, schaumig
  lebertreffer: z.boolean(),                 // Dunkelrot, dickflüssig
  nierenschuss: z.boolean(),                 // Blutig, Urin
  pansenschuss: z.boolean(),                 // Grünlich, Mageninhalt
  knochenschuss: z.boolean(),                // Mit Knochensplittern
});

export type SchweißDetails = z.infer<typeof SchweißDetailsSchema>;

export const HaareSchema = z.object({
  vorhanden: z.boolean(),
  typ: z.enum(['Grannen', 'Deckhaar', 'Winterhaar', 'Sommerhaar']).optional(),
  farbe: z.string().optional(),
  menge: z.number().min(0).optional(),
});

export type Haare = z.infer<typeof HaareSchema>;

export const WildpretSchema = z.object({
  vorhanden: z.boolean(),
  typ: z.enum(['Lungenstücke', 'Pansenfetzen', 'Knochensplitter']).optional(),
});

export type Wildpret = z.infer<typeof WildpretSchema>;

export const FährteSchema = z.object({
  gesehen: z.boolean(),
  geschwindigkeit: z.enum(['Schritt', 'Trab', 'Flucht']).optional(),
  auffälligkeiten: z.array(z.string()).optional(), // ["Schleifen", "Weit auseinander", "Unregelmäßig"]
});

export type Fährte = z.infer<typeof FährteSchema>;

export const AnschusszeichenSchema = z.object({
  blut: BlutSchema,
  schweiß: SchweißDetailsSchema,
  haare: HaareSchema,
  wildpret: WildpretSchema,
  fährte: FährteSchema,
});

export type Anschusszeichen = z.infer<typeof AnschusszeichenSchema>;

export const KIBildAnalyseSchema = z.object({
  bildUri: z.string(),
  erkannte_merkmale: z.object({
    blutfarbe: z.string().optional(),
    blutmenge: z.string().optional(),
    haare_erkannt: z.boolean().optional(),
    wildpret_erkannt: z.boolean().optional(),
  }),
  confidence: z.number().min(0).max(100),
});

export type KIBildAnalyse = z.infer<typeof KIBildAnalyseSchema>;

export const TrefferlageDiagnoseSchema = z.object({
  hauptdiagnose: TrefferArtSchema,
  wahrscheinlichkeit: z.number().min(0).max(100),
  alternativDiagnosen: z.array(z.object({
    art: TrefferArtSchema,
    wahrscheinlichkeit: z.number().min(0).max(100),
  })),
  begründung: z.array(z.string()),           // ["Hellrotes schaumiges Blut spricht für Lungentreffer", ...]
});

export type TrefferlageDiagnose = z.infer<typeof TrefferlageDiagnoseSchema>;

// ============================================================================
// NACHSUCHE & TRACKING
// ============================================================================

export const NachsucheStrategieSchema = z.object({
  typ: z.enum(['Schweißhund', 'Totsuche', 'Riemensuche', 'Stöbern', 'Abwarten']),
  beschreibung: z.string(),
  schritte: z.array(z.string()),
});

export type NachsucheStrategie = z.infer<typeof NachsucheStrategieSchema>;

export const WartezeitDetailSchema = z.object({
  minimum: z.number().min(0),                // Minuten
  optimal: z.number().min(0),
  maximum: z.number().min(0),
  begründung: z.string(),
});

export type WartezeitDetail = z.infer<typeof WartezeitDetailSchema>;

export const HundeEmpfehlungSchema = z.object({
  benötigt: z.boolean(),
  typ: z.enum(['Schweißhund', 'Totsuche', 'Stöberhund', 'Vorstehhund']).optional(),
  begründung: z.string(),
  dringlichkeit: z.enum(['Sofort', 'Falls_erfolglos', 'Optional']),
});

export type HundeEmpfehlung = z.infer<typeof HundeEmpfehlungSchema>;

export const WahrscheinlichkeitsZoneSchema = z.object({
  polygon: z.array(z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })),
  wahrscheinlichkeit: z.number().min(0).max(100),
  priorität: z.number().min(1).max(5),       // 1 = höchste Priorität
  geschätzte_entfernung: z.object({
    min: z.number().min(0),                  // Meter
    max: z.number().min(0),
    durchschnitt: z.number().min(0),
  }),
  terrain_typ: z.string(),                   // "Dickung", "Feld", "Gewässer"
  begründung: z.string(),                    // "Lebertreffer flieht oft zu Wasser"
});

export type WahrscheinlichkeitsZone = z.infer<typeof WahrscheinlichkeitsZoneSchema>;

export const SuchgebietSchema = z.object({
  startpunkt: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  radius: z.number().min(0),                 // Meter
  richtung: z.number().min(0).max(360),      // 0-360° (Fluchtrichtung)
  ausdehnung: z.object({
    nach_0h: z.number().min(0),              // Meter
    nach_1h: z.number().min(0),
    nach_3h: z.number().min(0),
    nach_6h: z.number().min(0),
    nach_12h: z.number().min(0),
    nach_24h: z.number().min(0),
  }),
  wahrscheinlichkeitsZonen: z.array(WahrscheinlichkeitsZoneSchema),
});

export type Suchgebiet = z.infer<typeof SuchgebietSchema>;

export const RechtlichePflichtSchema = z.object({
  nachsuchePflicht: z.boolean(),
  meldefrist: z.number().min(0),             // Stunden
  jagdgenossenschaft: z.boolean(),           // Meldung erforderlich?
  nachbarrevier: z.boolean(),                // Absprache erforderlich?
});

export type RechtlichePflicht = z.infer<typeof RechtlichePflichtSchema>;

export const DokumentationsHinweiseSchema = z.object({
  fotos_machen: z.array(z.string()),         // ["Anschuss", "Pirschzeichen", "Fundort"]
  notizen_erfassen: z.array(z.string()),     // ["Uhrzeit", "Wetter", "Reaktion"]
  zeugen: z.boolean(),                       // Zeugen benennen?
});

export type DokumentationsHinweise = z.infer<typeof DokumentationsHinweiseSchema>;

export const WetterEinflussNachsucheSchema = z.object({
  regen: z.boolean(),                        // Erschwert Nachsuche?
  wind: z.string(),                          // Hinweise
  temperatur: z.string(),
  sichtVerhältnisse: z.string(),
});

export type WetterEinflussNachsuche = z.infer<typeof WetterEinflussNachsucheSchema>;

export const NachsuchePrognoseSchema = z.object({
  bergungWahrscheinlichkeit: z.number().min(0).max(100),
  zeitbisAuffinden: z.number().min(0),       // Stunden (geschätzt)
  zustand: z.enum(['Verendet', 'Flüchtig', 'Unbekannt']),
});

export type NachsuchePrognose = z.infer<typeof NachsuchePrognoseSchema>;

export const NachsucheEmpfehlungSchema = z.object({
  // Sofort-Bewertung
  sofortNachsuche: z.boolean(),
  wartezeit: z.number().min(0),              // Minuten
  dringlichkeit: z.enum(['Sofort', 'Kurz', 'Normal', 'Lang']),
  
  // Strategie
  strategie: NachsucheStrategieSchema,
  wartezeit_detail: WartezeitDetailSchema,
  hundeEmpfehlung: HundeEmpfehlungSchema,
  
  // Suchgebiet & Fundort-Prediction
  suchgebiet: SuchgebietSchema,
  
  // Rechtliches & Dokumentation
  rechtlichePflicht: RechtlichePflichtSchema,
  dokumentationsHinweise: DokumentationsHinweiseSchema,
  
  // Wetter & Prognose
  wetterEinfluss: WetterEinflussNachsucheSchema,
  prognose: NachsuchePrognoseSchema,
});

export type NachsucheEmpfehlung = z.infer<typeof NachsucheEmpfehlungSchema>;

export const AnschussErkennungSchema = z.object({
  id: z.string(),
  jagd_id: z.string().optional(),
  abschuss_id: z.string().optional(),        // Wenn erfolgreich geborgen
  
  // Basis
  wildart: z.string(),
  geschätzteEntfernung: z.number().min(0),   // Meter
  schussZeitpunkt: z.date(),
  schussRichtung: z.number().min(0).max(360), // 0-360°
  
  // Schuss-Details
  schussplatzierung: SchussplatzierungSchema,
  reaktion: WildReaktionSchema,
  anschusszeichen: AnschusszeichenSchema,
  
  // KI-Analyse
  kiAnalyse: KIBildAnalyseSchema.optional(),
  
  // Diagnose & Empfehlung
  trefferlageDiagnose: TrefferlageDiagnoseSchema,
  nachsucheEmpfehlung: NachsucheEmpfehlungSchema,
});

export type AnschussErkennung = z.infer<typeof AnschussErkennungSchema>;

// ============================================================================
// TRACKING ASSISTANT
// ============================================================================

export const TrackingPunktSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  zeitpunkt: z.date(),
  notiz: z.string().optional(),
  foto_uri: z.string().optional(),
  pirschzeichen: z.enum(['Blut', 'Haare', 'Wildpret', 'Fährte', 'Sonstiges']).optional(),
});

export type TrackingPunkt = z.infer<typeof TrackingPunktSchema>;

export const NachsucheTrackingSchema = z.object({
  id: z.string(),
  shot_analysis_id: z.string(),
  user_id: z.string(),
  revier_id: z.string(),
  
  // Status
  status: z.enum(['Geplant', 'Aktiv', 'Erfolgreich', 'Erfolglos', 'Abgebrochen']),
  
  // Empfehlung (initial)
  empfohlene_wartezeit: z.number().min(0),   // Minuten
  empfohlene_strategie: z.string(),
  hund_empfohlen: z.boolean(),
  hund_typ: z.string().optional(),
  
  // Durchführung
  tatsächliche_wartezeit: z.number().min(0).optional(),
  start_zeitpunkt: z.date().optional(),
  ende_zeitpunkt: z.date().optional(),
  dauer_minuten: z.number().min(0).optional(),
  
  // Hunde-Einsatz
  hund_eingesetzt: z.boolean(),
  hund_art: z.string().optional(),
  hund_name: z.string().optional(),
  hundeführer: z.string().optional(),
  
  // Suchgebiet
  startpunkt: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  fluchtrichtung: z.number().min(0).max(360), // 0-360°
  gesuchter_radius: z.number().min(0),       // Meter
  
  // Tracking-Route
  tracking_punkte: z.array(TrackingPunktSchema),
  
  // Fundort
  gefunden: z.boolean(),
  fundort: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  entfernung_vom_anschuss: z.number().min(0).optional(), // Meter
  zustand: z.enum(['Verendet', 'Noch_lebend']).optional(),
  
  // Pirschzeichen während Nachsuche
  gefundene_zeichen: z.array(z.object({
    typ: z.enum(['Blut', 'Haare', 'Wildpret', 'Fährte', 'Sonstiges']),
    beschreibung: z.string(),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    foto_uri: z.string().optional(),
  })),
  
  // Ergebnis
  erfolgreich: z.boolean(),
  wild_geborgen: z.boolean(),
  abbruch_grund: z.string().optional(),
  
  // Dokumentation
  fotos: z.array(z.string()),                // URIs
  notizen: z.string().optional(),
  
  // Rechtlich
  jagdgenossenschaft_informiert: z.boolean(),
  nachbarrevier_informiert: z.boolean(),
  meldung_behörde: z.boolean(),
  
  // Metadaten
  created_at: z.date(),
  updated_at: z.date(),
});

export type NachsucheTracking = z.infer<typeof NachsucheTrackingSchema>;

// ============================================================================
// POPULATION TRACKING
// ============================================================================

export const BestandsschätzungSchema = z.object({
  geschätzt: z.number().min(0),
  confidence_interval: z.tuple([z.number().min(0), z.number().min(0)]), // [min, max]
  methode: z.enum(['Jagdstatistik', 'Scheinwerferzählung', 'Wildkamera', 'KI-Schätzung']),
  letzteZählung: z.date(),
});

export type Bestandsschätzung = z.infer<typeof BestandsschätzungSchema>;

export const TrendSchema = z.object({
  richtung: z.enum(['Steigend', 'Stabil', 'Fallend']),
  änderungsrate: z.number(),                 // % pro Jahr
  signifikanz: z.number().min(0).max(100),   // 0-100% (statistisch)
});

export type Trend = z.infer<typeof TrendSchema>;

export const AltersstrukturSchema = z.object({
  jung: z.number().min(0).max(100),          // % (0-1 Jahr)
  mittel: z.number().min(0).max(100),        // % (1-3 Jahre)
  alt: z.number().min(0).max(100),           // % (3+ Jahre)
  geschlechtsVerhältnis: z.number().min(0),  // Männlich/Weiblich Ratio
});

export type Altersstruktur = z.infer<typeof AltersstrukturSchema>;

export const AbschussStatistikSchema = z.object({
  gesamt: z.number().min(0),
  nachWildart: z.record(z.string(), z.number()),
  nachGeschlecht: z.object({
    männlich: z.number().min(0),
    weiblich: z.number().min(0),
  }),
  nachAlter: z.object({
    jung: z.number().min(0),
    mittel: z.number().min(0),
    alt: z.number().min(0),
  }),
  erfüllungsgrad: z.number().min(0).max(100), // % von Abschussplan
});

export type AbschussStatistik = z.infer<typeof AbschussStatistikSchema>;

export const ReproduktionSchema = z.object({
  setzrate: z.number().min(0),               // Kitze pro Ricke / Kälber pro Tier
  überlebensrate_jung: z.number().min(0).max(100), // % überleben 1. Jahr
  zuwachsrate: z.number(),                   // % Bestandszuwachs (kann negativ sein)
});

export type Reproduktion = z.infer<typeof ReproduktionSchema>;

export const VerlusteSchema = z.object({
  fallwild: z.number().min(0),
  verkehr: z.number().min(0),
  krankheit: z.number().min(0),
  prädation: z.number().min(0),              // Wolf, Luchs
  sonstige: z.number().min(0),
});

export type Verluste = z.infer<typeof VerlusteSchema>;

export const BestandsPrognoseSchema = z.object({
  nächstesSaisonjahr: z.number().min(0),     // Geschätzter Bestand
  in_3_jahren: z.number().min(0),
  in_5_jahren: z.number().min(0),
  trendFortsetzung: z.boolean(),             // Trend setzt sich fort?
});

export type BestandsPrognose = z.infer<typeof BestandsPrognoseSchema>;

export const AbschussplanEmpfehlungSchema = z.object({
  gesamt: z.number().min(0),
  männlich: z.number().min(0),
  weiblich: z.number().min(0),
  jung: z.number().min(0),
  begründung: z.string(),
  ziel: z.enum(['Reduktion', 'Stabilisierung', 'Aufbau']),
});

export type AbschussplanEmpfehlung = z.infer<typeof AbschussplanEmpfehlungSchema>;

export const BestandsentwicklungAnalyseSchema = z.object({
  wildart: z.string(),
  revier_id: z.string(),
  zeitraum: z.object({
    von: z.date(),
    bis: z.date(),
  }),
  
  aktueller_bestand: BestandsschätzungSchema,
  trend: TrendSchema,
  altersstruktur: AltersstrukturSchema,
  abschussStatistik: AbschussStatistikSchema,
  reproduktion: ReproduktionSchema,
  verluste: VerlusteSchema,
  prognose: BestandsPrognoseSchema,
  abschussplanEmpfehlung: AbschussplanEmpfehlungSchema,
});

export type BestandsentwicklungAnalyse = z.infer<typeof BestandsentwicklungAnalyseSchema>;

// ============================================================================
// HUNTING SUCCESS PREDICTION & HOTSPOT SCORING
// ============================================================================

export const ErwarteteWildartSchema = z.object({
  wildart: z.string(),
  wahrscheinlichkeit: z.number().min(0).max(100),
  geschätzteAnzahl: z.number().min(0),
  qualität: z.enum(['Trophäe', 'Normal', 'Jung']),
});

export type ErwarteteWildart = z.infer<typeof ErwarteteWildartSchema>;

export const ScoreBreakdownSchema = z.object({
  wetterScore: z.number().min(0).max(100),
  historischerErfolg: z.number().min(0).max(100),
  wildaktivität: z.number().min(0).max(100),
  mondphase: z.number().min(0).max(100),
  saisonFaktor: z.number().min(0).max(100),
});

export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const WetterPrognoseSchema = z.object({
  temperatur: z.number(),
  windrichtung: z.number().min(0).max(360),
  windstärke: z.number().min(0),
  niederschlag: z.number().min(0),
  sicht: z.string(),
});

export type WetterPrognose = z.infer<typeof WetterPrognoseSchema>;

export const WindTaktikSchema = z.object({
  hauptWindrichtung: z.number().min(0).max(360), // 0-360°
  anschussRichtung: z.array(z.number()),     // Empfohlene Schussrichtungen
  warnung: z.string().optional(),            // Bei ungünstigem Wind
});

export type WindTaktik = z.infer<typeof WindTaktikSchema>;

export const JagdempfehlungDetailSchema = z.object({
  rang: z.number().min(1),
  
  // Ort
  poi_id: z.string(),
  standort: z.object({
    typ: z.enum(['Hochsitz', 'Kanzel', 'Ansitz', 'Pirschweg']),
    name: z.string(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
  
  // Zeit
  zeitfenster: z.object({
    von: z.date(),
    bis: z.date(),
    dauer: z.number().min(0),                // Minuten
  }),
  
  // Zielwild
  erwarteteWildarten: z.array(ErwarteteWildartSchema),
  
  // Score
  gesamtScore: z.number().min(0).max(100),
  scoreBreakdown: ScoreBreakdownSchema,
  
  // Wetter
  wetterPrognose: WetterPrognoseSchema,
  windTaktik: WindTaktikSchema,
  
  // Erfolgschance
  erfolgswahrscheinlichkeit: z.number().min(0).max(100),
  
  // Begründung
  begründung: z.array(z.string()),
  alternativeZeiten: z.array(z.date()),
});

export type JagdempfehlungDetail = z.infer<typeof JagdempfehlungDetailSchema>;

export const TagesStrategieSchema = z.object({
  morgenjagd: z.boolean(),
  mittagsjagd: z.boolean(),
  abendjagd: z.boolean(),
  nachtansitz: z.boolean(),
  optimaleDauer: z.number().min(0),          // Stunden
});

export type TagesStrategie = z.infer<typeof TagesStrategieSchema>;

export const RevierAktivitätSchema = z.object({
  gesamt: z.number().min(0).max(100),
  nachGebiet: z.record(z.string(), z.number()),
  hotspots: z.array(z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })),
});

export type RevierAktivität = z.infer<typeof RevierAktivitätSchema>;

export const JagdplanungsEmpfehlungSchema = z.object({
  datum: z.date(),
  revier_id: z.string(),
  empfehlungen: z.array(JagdempfehlungDetailSchema),
  tagesStrategie: TagesStrategieSchema,
  revierAktivität: RevierAktivitätSchema,
});

export type JagdplanungsEmpfehlung = z.infer<typeof JagdplanungsEmpfehlungSchema>;

// ============================================================================
// USER-CONTRIBUTED TRAINING DATA (Crowdsourcing)
// ============================================================================

export const TrainingDataTypSchema = z.enum([
  'Anschusszeichen',
  'Wildpret',
  'Fährte',
  'Fundort',
  'Blutfarbe',
  'Haare',
  'Knochensplitter',
]);

export type TrainingDataTyp = z.infer<typeof TrainingDataTypSchema>;

export const UserContributedTrainingDataSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  
  // Typ
  typ: TrainingDataTypSchema,
  
  // Bild
  bild_uri: z.string(),
  aufnahme_datum: z.date(),
  
  // Annotationen (User)
  wildart: z.string().optional(),
  blutfarbe: z.string().optional(),
  blutmenge: z.string().optional(),
  haare_typ: z.string().optional(),
  wildpret_typ: z.string().optional(),
  trefferlage: TrefferArtSchema.optional(),
  
  // Outcome (wichtig für Fundort-Training)
  gefunden: z.boolean().optional(),
  fundort_entfernung: z.number().min(0).optional(), // Meter vom Anschuss
  fluchtrichtung: z.number().min(0).max(360).optional(), // 0-360°
  wartezeit: z.number().min(0).optional(),       // Minuten
  
  // Qualität
  verifiziert: z.boolean(),                      // Von Experten geprüft
  quality_score: z.number().min(0).max(100),
  
  // ML-Training
  verwendet_für_training: z.boolean(),
  model_version: z.string().optional(),
  
  // Privacy
  anonymisiert: z.boolean(),
  öffentlich: z.boolean(),                       // Nutzer erlaubt Training-Nutzung
  
  created_at: z.date(),
});

export type UserContributedTrainingData = z.infer<typeof UserContributedTrainingDataSchema>;

// ============================================================================
// PREDICTION CACHE
// ============================================================================

export const PredictionTypeSchema = z.enum([
  'Wildaktivität',
  'Bewegung',
  'Hotspot',
  'Jagdplanung',
  'Bestandsentwicklung',
  'Fundort',
]);

export type PredictionType = z.infer<typeof PredictionTypeSchema>;

export const PredictionCacheSchema = z.object({
  id: z.string(),
  revier_id: z.string(),
  wildart: z.string().optional(),
  
  prediction_type: PredictionTypeSchema,
  
  // Zeitraum
  gültig_von: z.date(),
  gültig_bis: z.date(),
  
  // Daten (JSON)
  prediction_data: z.any(),                      // Spezifische Vorhersage-Daten
  
  // Qualität
  confidence: z.number().min(0).max(100).optional(),
  accuracy_historical: z.number().min(0).max(100).optional(), // Wenn verfügbar
  
  // ML-Model
  model_version: z.string().optional(),
  model_name: z.string().optional(),
  
  created_at: z.date(),
});

export type PredictionCache = z.infer<typeof PredictionCacheSchema>;

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // Weather
  WeatherParameters,
  AktivitätsLevel,
  OptimaleZeit,
  Wettereinfluss,
  Jagdempfehlung,
  WildaktivitätVorhersage,
  
  // Movement
  TageszeitMuster,
  JahreszeitenMuster,
  Hauptwechsel,
  Hotspot,
  AktivitätsZeiten,
  BewegungsVorhersage,
  BewegungsmusterAnalyse,
  
  // Shot Analysis
  TrefferArt,
  Schussplatzierung,
  WildReaktion,
  Blut,
  SchweißDetails,
  Haare,
  Wildpret,
  Fährte,
  Anschusszeichen,
  KIBildAnalyse,
  TrefferlageDiagnose,
  AnschussErkennung,
  
  // Nachsuche
  NachsucheStrategie,
  WartezeitDetail,
  HundeEmpfehlung,
  WahrscheinlichkeitsZone,
  Suchgebiet,
  RechtlichePflicht,
  DokumentationsHinweise,
  WetterEinflussNachsuche,
  NachsuchePrognose,
  NachsucheEmpfehlung,
  TrackingPunkt,
  NachsucheTracking,
  
  // Population
  Bestandsschätzung,
  Trend,
  Altersstruktur,
  AbschussStatistik,
  Reproduktion,
  Verluste,
  BestandsPrognose,
  AbschussplanEmpfehlung,
  BestandsentwicklungAnalyse,
  
  // Hunting Success
  ErwarteteWildart,
  ScoreBreakdown,
  WetterPrognose,
  WindTaktik,
  JagdempfehlungDetail,
  TagesStrategie,
  RevierAktivität,
  JagdplanungsEmpfehlung,
  
  // Training Data
  TrainingDataTyp,
  UserContributedTrainingData,
  
  // Predictions
  PredictionType,
  PredictionCache,
};
