/**
 * HNTR LEGEND Pro - Typdefinitionen
 * Alle zentralen Datenmodelle für die App
 */

import { z } from 'zod';

// ============================================================
// BASISTYPEN
// ============================================================

// UUID Schema
export const UUIDSchema = z.string().uuid();
export type UUID = z.infer<typeof UUIDSchema>;

// ISO Datums-String Schema
export const ISODateSchema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
export type ISODate = z.infer<typeof ISODateSchema>;

// GPS-Koordinaten
export const GPSKoordinatenSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
});
export type GPSKoordinaten = z.infer<typeof GPSKoordinatenSchema>;

// ============================================================
// WETTER
// ============================================================

export const WetterSchema = z.object({
  temperatur: z.number(), // Celsius
  gefuehlteTemperatur: z.number().optional(),
  windGeschwindigkeit: z.number().optional(), // m/s
  windRichtungGrad: z.number().optional(), // 0-360
  windRichtung: z.string().optional(), // N, NE, E, SE, S, SW, W, NW
  luftfeuchtigkeit: z.number().optional(), // Prozent
  bewölkung: z.string().optional(),
  niederschlag: z.string().optional(),
  mondphase: z.string().optional(),
  erfasstAm: z.string(), // ISO Timestamp
  quelle: z.enum(['api', 'manuell', 'cache']).default('manuell'),
});
export type Wetter = z.infer<typeof WetterSchema>;

// ============================================================
// PRIVACY / SICHTBARKEIT
// ============================================================

export const SichtbarkeitSchema = z.enum(['privat', 'revier', 'freunde', 'oeffentlich']);
export type Sichtbarkeit = z.infer<typeof SichtbarkeitSchema>;

// ============================================================
// TROPHÄE / GEWEIH / GEHÖRN
// ============================================================

export const TrophaeSchema = z.object({
  // Geweih (Rotwild, Damwild, Sikawild)
  geweihart: z.string().optional(), // z.B. "Kronenhirsch", "Gabelhirsch"
  endzahl: z.number().optional(), // z.B. 10 für "Zehner"
  stangenlaengeCm: z.number().optional(),
  umfangCm: z.number().optional(),
  geweihgewichtKg: z.number().optional(),
  spannweiteCm: z.number().optional(),

  // Gehörn (Rehwild, Muffelwild, Gamswild)
  gehoernart: z.string().optional(), // z.B. "Gabelbock", "Sechserbock"
  gehoernlaengeCm: z.number().optional(),

  // Keilerwaffen (Schwarzwild)
  hadererLaengeCm: z.number().optional(),
  gewehreLaengeCm: z.number().optional(),

  // CIC-Bewertung
  cicPunkte: z.number().optional(),

  // Besonderheiten
  perlung: z.string().optional(),
  rosen: z.string().optional(),
  besonderheiten: z.string().optional(),
  abnormitaeten: z.string().optional(),

  // Fotos der Trophäe
  fotoIds: z.array(z.string()).optional(),
});
export type Trophae = z.infer<typeof TrophaeSchema>;

// ============================================================
// ABSCHUSS-DETAILS
// ============================================================

export const AbschussDetailsSchema = z.object({
  // Geschlecht und Alter
  geschlecht: z.enum(['männlich', 'weiblich', 'unbekannt']),
  altersklasse: z.string(),
  schaetzAlterJahre: z.number().optional(),

  // Gewicht
  gewichtAufgebrochenKg: z.number().optional(),
  gewichtLebendGeschaetztKg: z.number().optional(),
  wildbretGewichtKg: z.number().optional(),

  // Schuss
  schussentfernungM: z.number().optional(),
  trefferlage: z.string().optional(), // z.B. "Blatt", "Kammer", "Träger"
  anzahlSchuesse: z.number().default(1),

  // Waffe und Munition
  waffe: z.string().optional(),
  kaliber: z.string().optional(),
  munition: z.string().optional(),
  geschossgewichtGrain: z.number().optional(),

  // Trophäe
  trophae: TrophaeSchema.optional(),

  // Nachsuche
  nachsucheErforderlich: z.boolean().default(false),
  nachsucheId: z.string().optional(), // Referenz auf separaten Nachsuche-Eintrag
  fluchtdistanzM: z.number().optional(),

  // Verwertung
  verwertung: z.enum(['eigenverbrauch', 'verkauf', 'wildhaendler', 'gastronomie', 'sonstiges']).optional(),

  // Zustand
  wildpretZustand: z.enum(['einwandfrei', 'bedingt_verwertbar', 'nicht_verwertbar', 'unbekannt']).optional(),
  zustandBemerkung: z.string().optional(),

  // Wildartspezifisch
  hirschklasse: z.string().optional(), // I, II, III für Rotwild

  // Markierung
  markierungsNummer: z.string().optional(), // Wildmarke/Plombe
});
export type AbschussDetails = z.infer<typeof AbschussDetailsSchema>;

// ============================================================
// JAGD-EINTRÄGE
// ============================================================

export const EintragTypSchema = z.enum(['beobachtung', 'abschuss', 'nachsuche', 'revierereignis']);
export type EintragTyp = z.infer<typeof EintragTypSchema>;

export const JagdEintragBasisSchema = z.object({
  id: UUIDSchema,
  revierId: UUIDSchema,

  // Typ des Eintrags
  typ: EintragTypSchema,

  // Zeit und Ort
  zeitpunkt: z.string(), // ISO String
  gps: GPSKoordinatenSchema.optional(),
  ortBeschreibung: z.string().optional(),

  // Wild
  wildartId: z.string(),
  wildartName: z.string(),
  anzahl: z.number().default(1),

  // Jagdart
  jagdart: z.string().optional(),

  // Wetter (automatisch oder manuell)
  wetter: WetterSchema.optional(),

  // Notizen und Fotos
  notizen: z.string().optional(),
  fotoIds: z.array(z.string()).default([]),

  // Sichtbarkeit
  sichtbarkeit: SichtbarkeitSchema.default('revier'),

  // Metadaten
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),
  erstelltVon: UUIDSchema.optional(), // UserId

  // Sync-Status
  syncStatus: z.enum(['lokal', 'synchronisiert', 'konflikt']).default('lokal'),
  version: z.number().default(1),

  // Soft Delete
  geloeschtAm: z.string().nullable().default(null),
});
export type JagdEintragBasis = z.infer<typeof JagdEintragBasisSchema>;

// Beobachtungs-Eintrag
export const BeobachtungsEintragSchema = JagdEintragBasisSchema.extend({
  typ: z.literal('beobachtung'),
  // Zusätzliche Beobachtungs-Details
  verhalten: z.string().optional(), // z.B. "äsend", "ziehend", "ruhend"
  geschlechtGeschaetzt: z.enum(['männlich', 'weiblich', 'unbekannt', 'gemischt']).optional(),
});
export type BeobachtungsEintrag = z.infer<typeof BeobachtungsEintragSchema>;

// Abschuss-Eintrag
export const AbschussEintragSchema = JagdEintragBasisSchema.extend({
  typ: z.literal('abschuss'),
  abschussDetails: AbschussDetailsSchema,
});
export type AbschussEintrag = z.infer<typeof AbschussEintragSchema>;

// Nachsuche-Eintrag
export const NachsuchenEintragSchema = JagdEintragBasisSchema.extend({
  typ: z.literal('nachsuche'),
  nachsuche: z.object({
    anschussGps: GPSKoordinatenSchema,
    anschussZeit: z.string(),
    hundefuehrerId: z.string().optional(),
    hundefuehrerName: z.string().optional(),
    hundName: z.string().optional(),
    hundRasse: z.string().optional(),

    // Track der Nachsuche
    trackId: z.string().optional(),

    // Ergebnis
    ergebnis: z.enum(['erfolgreich', 'erfolglos', 'abgebrochen', 'verwiesen', 'laeuft']),
    fundortGps: GPSKoordinatenSchema.optional(),
    distanzM: z.number().optional(),
    dauerMinuten: z.number().optional(),

    // Pirschzeichen
    pirschzeichen: z.array(z.string()).optional(), // z.B. ["Schweiß", "Schnitthaare", "Knochensplitter"]
    schweissfarbe: z.string().optional(),
    schweissmenge: z.enum(['wenig', 'mittel', 'viel', 'sehr_viel']).optional(),

    // Verletzung
    geschaetzteTrefferlage: z.string().optional(),

    bemerkungen: z.string().optional(),
  }),
});
export type NachsuchenEintrag = z.infer<typeof NachsuchenEintragSchema>;

// Revierereignis
export const RevierereignisSchema = JagdEintragBasisSchema.extend({
  typ: z.literal('revierereignis'),
  ereignis: z.object({
    kategorie: z.enum([
      'wildschaden',
      'fallwild',
      'unfall',
      'stoerung',
      'begegnung',
      'infrastruktur',
      'sonstiges',
    ]),
    beschreibung: z.string(),
    massnahmen: z.string().optional(),
    schadenHoehe: z.number().optional(),
    behoerdeInformiert: z.boolean().default(false),
  }),
});
export type RevierereignisEintrag = z.infer<typeof RevierereignisSchema>;

// Union Type für alle Eintragstypen
export type JagdEintrag = BeobachtungsEintrag | AbschussEintrag | NachsuchenEintrag | RevierereignisEintrag;

// ============================================================
// REVIER & TEAM
// ============================================================

export const RevierRolleSchema = z.enum([
  'inhaber',        // Revierinhaber / Jagdherr
  'leiter',         // Revierleiter / Berufsjäger
  'mitglied',       // Begehungsscheininhaber
  'gast',           // Jagdgast (befristet)
  'hundefuehrer',   // Hundeführer / Nachsuchengespann
  'helfer',         // Treiber / Helfer
  'pruefer',        // Behörde / Prüfer (read-only)
]);
export type RevierRolle = z.infer<typeof RevierRolleSchema>;

export const PlanSchema = z.enum([
  'free',
  'premium_jaeger',
  'revier_s',   // 2 Mitglieder
  'revier_m',   // 5 Mitglieder
  'revier_l',   // 10 Mitglieder
  'revier_xl',  // 20 Mitglieder
  'enterprise', // 30+
]);
export type Plan = z.infer<typeof PlanSchema>;

// Seat Limits pro Plan
export const SEAT_LIMITS: Record<Plan, number> = {
  free: 1,
  premium_jaeger: 1,
  revier_s: 2,
  revier_m: 5,
  revier_l: 10,
  revier_xl: 20,
  enterprise: 100,
};

export const RevierSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1),
  beschreibung: z.string().optional(),
  bundesland: z.string(),
  flaecheHektar: z.number().optional(),

  // Plan und Abrechnung
  plan: PlanSchema.default('free'),

  // Grenzpolygon
  grenzeGeoJson: z.string().optional(), // GeoJSON Polygon

  // Metadaten
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),

  // Sync
  syncStatus: z.enum(['lokal', 'synchronisiert', 'konflikt']).default('lokal'),
  version: z.number().default(1),
});
export type Revier = z.infer<typeof RevierSchema>;

export const RevierMitgliedSchema = z.object({
  id: UUIDSchema,
  revierId: UUIDSchema,
  userId: UUIDSchema.optional(), // Optional für Demo-Modus

  // Profil
  name: z.string(),
  email: z.string().email().optional(),
  telefon: z.string().optional(),

  // Rolle und Rechte
  rolle: RevierRolleSchema,

  // Zeitliche Begrenzung (für Gäste)
  gueltigVon: z.string().optional(),
  gueltigBis: z.string().optional(),

  // Räumliche Begrenzung (Zonen)
  zoneIds: z.array(UUIDSchema).optional(),

  // Einladungsstatus
  einladungsStatus: z.enum(['eingeladen', 'aktiv', 'gesperrt', 'abgelaufen']).default('aktiv'),

  // Metadaten
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),
});
export type RevierMitglied = z.infer<typeof RevierMitgliedSchema>;

// ============================================================
// KARTEN-FEATURES
// ============================================================

export const MapFeatureTypSchema = z.enum([
  'boundary',     // Reviergrenze
  'zone',         // Teilfläche/Zone
  'poi',          // Point of Interest (Hochsitz, Kirrung, etc.)
  'track',        // Aufgezeichnete Route
  'hazard',       // Gefahrenstelle / Hinweis
]);
export type MapFeatureTyp = z.infer<typeof MapFeatureTypSchema>;

export const POIKategorieSchema = z.enum([
  'hochsitz',
  'kanzel',
  'leiter',
  'kirrung',
  'salzlecke',
  'wildacker',
  'suhle',
  'luderplatz',
  'fuetterung',
  'wildkamera',
  'treffpunkt',
  'parken',
  'zugang',
  'schranke',
  'gefahr',
  'hinweis',
  'sonstiges',
]);
export type POIKategorie = z.infer<typeof POIKategorieSchema>;

export const ZonenTypSchema = z.enum([
  'jagdflaeche',
  'ruhezone',
  'drueckjagdzone',
  'sperrzone',
  'sonstiges',
]);
export type ZonenTyp = z.infer<typeof ZonenTypSchema>;

export const MapFeatureSchema = z.object({
  id: UUIDSchema,
  revierId: UUIDSchema,
  typ: MapFeatureTypSchema,

  // Name und Beschreibung
  name: z.string(),
  beschreibung: z.string().optional(),

  // Geometrie (GeoJSON)
  geometryType: z.enum(['Point', 'LineString', 'Polygon']),
  coordinates: z.string(), // JSON-kodierte Koordinaten

  // POI-spezifisch
  poiKategorie: POIKategorieSchema.optional(),
  poiStatus: z.enum(['aktiv', 'inaktiv', 'wartung']).optional(),
  letzteKontrolle: z.string().optional(),
  naechsteKontrolle: z.string().optional(),

  // Zonen-spezifisch
  zonenTyp: ZonenTypSchema.optional(),

  // Fotos
  fotoIds: z.array(z.string()).default([]),

  // Icon/Farbe
  icon: z.string().optional(),
  farbe: z.string().optional(),

  // Metadaten
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),
  erstelltVon: UUIDSchema.optional(),

  // Sync
  syncStatus: z.enum(['lokal', 'synchronisiert', 'konflikt']).default('lokal'),
  version: z.number().default(1),
  geloeschtAm: z.string().nullable().default(null),
});
export type MapFeature = z.infer<typeof MapFeatureSchema>;

// ============================================================
// KONTAKTE
// ============================================================

export const KontaktTypSchema = z.enum([
  'hundefuehrer',
  'wildhaendler',
  'metzger',
  'behoerde',
  'tierarzt',
  'jagdgast',
  'nachbarrevier',
  'forstamt',
  'sonstige',
]);
export type KontaktTyp = z.infer<typeof KontaktTypSchema>;

export const KontaktSchema = z.object({
  id: UUIDSchema,

  // Basis-Infos
  name: z.string(),
  typ: KontaktTypSchema,

  // Kontaktdaten
  telefon: z.string().optional(),
  telefonMobil: z.string().optional(),
  email: z.string().email().optional(),

  // Adresse
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),

  // Zusätzliche Infos
  notizen: z.string().optional(),
  tags: z.array(z.string()).default([]),
  favorit: z.boolean().default(false),

  // Metadaten
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),

  // Sync
  syncStatus: z.enum(['lokal', 'synchronisiert', 'konflikt']).default('lokal'),
  version: z.number().default(1),
  geloeschtAm: z.string().nullable().default(null),
});
export type Kontakt = z.infer<typeof KontaktSchema>;

// Verknüpfung Kontakt <-> Eintrag
export const KontaktLinkSchema = z.object({
  id: UUIDSchema,
  kontaktId: UUIDSchema,

  // Ziel der Verknüpfung
  zielTyp: z.enum(['eintrag', 'nachsuche', 'revier']),
  zielId: UUIDSchema,

  // Art der Verknüpfung
  rolle: z.string().optional(), // z.B. "Hundeführer", "Abnehmer"

  erstelltAm: z.string(),
});
export type KontaktLink = z.infer<typeof KontaktLinkSchema>;

// ============================================================
// MEDIEN
// ============================================================

export const MediumSchema = z.object({
  id: UUIDSchema,
  eintragId: UUIDSchema.optional(),
  mapFeatureId: UUIDSchema.optional(),

  // Dateipfad
  lokaleUri: z.string(),
  remoteUri: z.string().optional(),
  thumbnailUri: z.string().optional(),

  // Metadaten
  dateiname: z.string(),
  mimeType: z.string(),
  groesseBytes: z.number().optional(),
  breite: z.number().optional(),
  hoehe: z.number().optional(),

  // EXIF-Daten
  aufnahmeZeitpunkt: z.string().optional(),
  aufnahmeGps: GPSKoordinatenSchema.optional(),

  erstelltAm: z.string(),

  // Sync
  syncStatus: z.enum(['lokal', 'hochladend', 'synchronisiert', 'fehler']).default('lokal'),
});
export type Medium = z.infer<typeof MediumSchema>;

// ============================================================
// FEATURE FLAGS
// ============================================================

export const FeatureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  beschreibung: z.string().optional(),
  aktiviert: z.boolean(),
  minPlan: PlanSchema.optional(),
  minRolle: RevierRolleSchema.optional(),
});
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

// ============================================================
// EINSTELLUNGEN
// ============================================================

export const EinstellungenSchema = z.object({
  // Erscheinungsbild
  theme: z.enum(['light', 'dark', 'system']).default('dark'),

  // Aktives Revier
  aktivesRevierId: UUIDSchema.optional(),

  // Bundesland (für Schonzeiten)
  bundesland: z.string().optional(),

  // AutoCapture
  autoCaptureGps: z.boolean().default(true),
  autoCaptureWetter: z.boolean().default(true),

  // Offline-Karten
  offlineKartenAktiviert: z.boolean().default(true),

  // Benachrichtigungen
  schonzeitWarnungen: z.boolean().default(true),

  // Plan-Cache (Demo)
  cachedPlan: PlanSchema.optional(),
  cachedFeatureFlags: z.array(FeatureFlagSchema).optional(),
});
export type Einstellungen = z.infer<typeof EinstellungenSchema>;

// ============================================================
// SYNC JOBS (für spätere Implementierung)
// ============================================================

export const SyncJobSchema = z.object({
  id: UUIDSchema,

  aktion: z.enum(['create', 'update', 'delete', 'upload_media']),
  entitaetTyp: z.string(),
  entitaetId: UUIDSchema,

  payload: z.string(), // JSON

  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  versuche: z.number().default(0),
  letzterVersuch: z.string().optional(),
  fehlerMeldung: z.string().optional(),

  erstelltAm: z.string(),
});
export type SyncJob = z.infer<typeof SyncJobSchema>;
