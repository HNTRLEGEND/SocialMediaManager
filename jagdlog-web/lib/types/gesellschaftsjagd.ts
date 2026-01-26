/**
 * HNTR LEGEND - Gesellschaftsjagd Type System
 * Zod Schemas und TypeScript Types für Gesellschaftsjagd-Management
 */

import { z } from 'zod';

// ===================================
// ENUMS & CONSTANTS
// ===================================

export const JAGD_TYPEN = [
  'ansitzjagd',
  'drueckjagd',
  'treibjagd',
  'riegeljagd',
  'bewegungsjagd',
] as const;

export const JAGD_STATUS = [
  'planung',
  'geplant',
  'aktiv',
  'abgeschlossen',
  'abgebrochen',
] as const;

export const TEILNEHMER_ROLLEN = [
  'jaeger',
  'treiber',
  'hundefuehrer',
  'drohnen_pilot',
  'bergeteam',
  'ansteller',
  'helfer',
  'sanitaeter',
] as const;

export const STANDORT_TYPEN = [
  'hochsitz',
  'kanzel',
  'ansitzleiter',
  'bodensitz',
  'position',
] as const;

export const SICHERHEITSZONE_TYPEN = [
  'gefahrenzone',
  'verbotszone',
  'sperrgebiet',
  'nachbarrevier',
] as const;

// ===================================
// ZOD SCHEMAS
// ===================================

// GPS-Koordinaten Schema
export const GPSKoordinatenSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
});

// Sicherheitszone Schema
export const SicherheitszoneSchema = z.object({
  id: z.string().uuid(),
  jagd_id: z.string().uuid(),
  typ: z.enum(SICHERHEITSZONE_TYPEN),
  name: z.string().min(1).max(100),
  beschreibung: z.string().max(500).optional(),
  polygon_koordinaten: z.string(), // JSON-encoded array of GPS coordinates
  farbe: z.string().default('#FF0000'),
  erstellt_am: z.string(),
});

// Standort Schema
export const StandortSchema = z.object({
  id: z.string().uuid(),
  jagd_id: z.string().uuid(),
  typ: z.enum(STANDORT_TYPEN),
  name: z.string().min(1).max(100),
  beschreibung: z.string().max(500).optional(),
  gps_lat: z.number().min(-90).max(90),
  gps_lon: z.number().min(-180).max(180),
  zugewiesener_jaeger_id: z.string().uuid().nullable().optional(),
  zuweisungs_bestaetigt: z.boolean().default(false),
  zugewiesen_am: z.string().nullable().optional(),
  erstellt_am: z.string(),
});

// Teilnehmer Schema
export const TeilnehmerSchema = z.object({
  id: z.string().uuid(),
  jagd_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  telefon: z.string().max(50).optional(),
  rolle: z.enum(TEILNEHMER_ROLLEN),
  user_id: z.string().uuid().nullable().optional(), // Falls registrierter User
  notizen: z.string().max(500).optional(),
  anwesend: z.boolean().default(false),
  erstellt_am: z.string(),
});

// Notfall-Kontakt Schema
export const NotfallKontaktSchema = z.object({
  name: z.string().min(1).max(100),
  telefon: z.string().min(1).max(50),
  rolle: z.string().max(50), // z.B. "Rettungsdienst", "Polizei", "Revierförster"
});

// Gesellschaftsjagd Haupt-Schema
export const GesellschaftsjagdSchema = z.object({
  id: z.string().uuid(),
  revier_id: z.string().uuid(),
  organisator_id: z.string().uuid(),
  
  // Grunddaten
  name: z.string().min(1).max(200),
  beschreibung: z.string().max(2000).optional(),
  
  // Timing
  datum: z.string(), // ISO date
  start_zeit: z.string(), // HH:mm format
  end_zeit: z.string(), // HH:mm format
  
  // Jagd-Details
  jagd_typ: z.enum(JAGD_TYPEN),
  status: z.enum(JAGD_STATUS).default('planung'),
  
  // Erwartete Teilnehmerzahlen
  erwartete_jaeger: z.number().int().min(1).max(100).default(1),
  erwartete_treiber: z.number().int().min(0).max(200).default(0),
  
  // Sicherheit
  sicherheitsregeln: z.string().max(5000).optional(), // JSON array of strings
  notfall_kontakte: z.string().max(2000).optional(), // JSON array of NotfallKontakt
  
  // Metadaten
  erstellt_am: z.string(),
  aktualisiert_am: z.string(),
  erstellt_von: z.string().uuid(),
  aktualisiert_von: z.string().uuid(),
  version: z.number().int().default(1),
});

// Wizard State Schema (für 5-Step Prozess)
export const WizardStateSchema = z.object({
  currentStep: z.number().int().min(1).max(5).default(1),
  
  // Step 1: Grunddaten
  grunddaten: z.object({
    name: z.string().min(1).max(200),
    beschreibung: z.string().max(2000).optional(),
    datum: z.string(),
    start_zeit: z.string(),
    end_zeit: z.string(),
    jagd_typ: z.enum(JAGD_TYPEN),
    erwartete_jaeger: z.number().int().min(1).max(100),
    erwartete_treiber: z.number().int().min(0).max(200),
  }).optional(),
  
  // Step 2: Teilnehmer
  teilnehmer: z.array(TeilnehmerSchema.omit({ id: true, jagd_id: true, erstellt_am: true })).optional(),
  
  // Step 3: Standorte
  standorte: z.array(StandortSchema.omit({ id: true, jagd_id: true, erstellt_am: true })).optional(),
  
  // Step 4: Sicherheit
  sicherheit: z.object({
    sicherheitsregeln: z.array(z.string()).optional(),
    notfall_kontakte: z.array(NotfallKontaktSchema).optional(),
    sicherheitszonen: z.array(SicherheitszoneSchema.omit({ id: true, jagd_id: true, erstellt_am: true })).optional(),
  }).optional(),
  
  // Step 5: Überprüfung (keine zusätzlichen Daten)
  validated: z.boolean().default(false),
});

// Filter Options Schema
export const GesellschaftsjagdFilterSchema = z.object({
  status: z.array(z.enum(JAGD_STATUS)).optional(),
  revier_id: z.string().uuid().optional(),
  organisator_id: z.string().uuid().optional(),
  datum_von: z.string().optional(), // ISO date
  datum_bis: z.string().optional(), // ISO date
});

// Statistik Schema
export const JagdStatistikSchema = z.object({
  jagd_id: z.string().uuid(),
  anzahl_teilnehmer_gesamt: z.number().int(),
  anzahl_jaeger: z.number().int(),
  anzahl_treiber: z.number().int(),
  anzahl_standorte_gesamt: z.number().int(),
  anzahl_standorte_zugewiesen: z.number().int(),
  anzahl_standorte_offen: z.number().int(),
  anzahl_sicherheitszonen: z.number().int(),
});

// ===================================
// TYPESCRIPT TYPES (inferred from Zod)
// ===================================

export type GPSKoordinaten = z.infer<typeof GPSKoordinatenSchema>;
export type Sicherheitszone = z.infer<typeof SicherheitszoneSchema>;
export type Standort = z.infer<typeof StandortSchema>;
export type Teilnehmer = z.infer<typeof TeilnehmerSchema>;
export type NotfallKontakt = z.infer<typeof NotfallKontaktSchema>;
export type Gesellschaftsjagd = z.infer<typeof GesellschaftsjagdSchema>;
export type WizardState = z.infer<typeof WizardStateSchema>;
export type GesellschaftsjagdFilter = z.infer<typeof GesellschaftsjagdFilterSchema>;
export type JagdStatistik = z.infer<typeof JagdStatistikSchema>;

export type JagdTyp = typeof JAGD_TYPEN[number];
export type JagdStatus = typeof JAGD_STATUS[number];
export type TeilnehmerRolle = typeof TEILNEHMER_ROLLEN[number];
export type StandortTyp = typeof STANDORT_TYPEN[number];
export type SicherheitszoneTyp = typeof SICHERHEITSZONE_TYPEN[number];

// ===================================
// HELPER FUNCTIONS
// ===================================

export const getStatusColor = (status: JagdStatus): string => {
  const colors: Record<JagdStatus, string> = {
    planung: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    geplant: 'bg-blue-100 text-blue-800 border-blue-300',
    aktiv: 'bg-green-100 text-green-800 border-green-300',
    abgeschlossen: 'bg-gray-100 text-gray-800 border-gray-300',
    abgebrochen: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status];
};

export const getStatusLabel = (status: JagdStatus): string => {
  const labels: Record<JagdStatus, string> = {
    planung: 'In Planung',
    geplant: 'Geplant',
    aktiv: 'Aktiv',
    abgeschlossen: 'Abgeschlossen',
    abgebrochen: 'Abgebrochen',
  };
  return labels[status];
};

export const getRolleLabel = (rolle: TeilnehmerRolle): string => {
  const labels: Record<TeilnehmerRolle, string> = {
    jaeger: 'Jäger',
    treiber: 'Treiber',
    hundefuehrer: 'Hundeführer',
    drohnen_pilot: 'Drohnen-Pilot',
    bergeteam: 'Bergeteam',
    ansteller: 'Ansteller',
    helfer: 'Helfer',
    sanitaeter: 'Sanitäter',
  };
  return labels[rolle];
};

export const getRolleIcon = (rolle: TeilnehmerRolle): string => {
  const icons: Record<TeilnehmerRolle, string> = {
    jaeger: '🎯',
    treiber: '👥',
    hundefuehrer: '🐕',
    drohnen_pilot: '🚁',
    bergeteam: '⛰️',
    ansteller: '👤',
    helfer: '🤝',
    sanitaeter: '🏥',
  };
  return icons[rolle];
};

export const getJagdTypLabel = (typ: JagdTyp): string => {
  const labels: Record<JagdTyp, string> = {
    ansitzjagd: 'Ansitzjagd',
    drueckjagd: 'Drückjagd',
    treibjagd: 'Treibjagd',
    riegeljagd: 'Riegeljagd',
    bewegungsjagd: 'Bewegungsjagd',
  };
  return labels[typ];
};

export const getStandortTypLabel = (typ: StandortTyp): string => {
  const labels: Record<StandortTyp, string> = {
    hochsitz: 'Hochsitz',
    kanzel: 'Kanzel',
    ansitzleiter: 'Ansitzleiter',
    bodensitz: 'Bodensitz',
    position: 'Position',
  };
  return labels[typ];
};
