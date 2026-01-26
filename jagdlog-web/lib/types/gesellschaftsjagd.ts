/**
 * GESELLSCHAFTSJAGD TYPES - Web Version
 * Phase 6.2: Extended Features
 * HNTR LEGEND Pro
 */

import { z } from 'zod';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface GPSKoordinaten {
  latitude: number;
  longitude: number;
}

// ============================================================================
// ZOD SCHEMAS (Validation with Max-Length)
// ============================================================================

export const GesellschaftsjagdSchema = z.object({
  id: z.string().uuid(),
  revierId: z.string().uuid(),
  
  // Strings mit Limits
  name: z.string().min(3, 'Mindestens 3 Zeichen').max(100, 'Maximal 100 Zeichen'),
  beschreibung: z.string().max(500, 'Maximal 500 Zeichen').optional(),
  typ: z.enum(['drueckjagd', 'treibjagd', 'bewegungsjagd', 'ansitzjagd_gruppe', 'riegeljagd', 'sonstiges']),
  
  datum: z.date(),
  
  // IDs
  organisatorId: z.string().uuid(),
  organisatorName: z.string().min(2).max(100),
  erstellerId: z.string().uuid(),
  
  status: z.enum(['geplant', 'aktiv', 'abgeschlossen', 'abgesagt']),
  
  // Metadaten
  erstelltAm: z.date(),
  aktualisiertAm: z.date(),
});

export const TeilnehmerSchema = z.object({
  id: z.string().uuid(),
  jagdId: z.string().uuid(),
  
  // Person
  userId: z.string().uuid().optional(),
  name: z.string().min(2, 'Mindestens 2 Zeichen').max(100, 'Maximal 100 Zeichen'),
  email: z.string().email('Ungültige E-Mail').max(255).optional(),
  telefon: z.string().max(20, 'Maximal 20 Zeichen'),
  
  // Rolle
  rolle: z.enum(['jagdleiter', 'schuetze', 'treiber', 'hundefuehrer', 'ansteller', 'bergehelfer', 'sanitaeter']),
  
  // Ausrüstung
  ausruestung: z.object({
    waffe: z.string().max(100),
    optik: z.string().max(100),
    munition: z.string().max(100),
    signalweste: z.boolean(),
    funkgeraet: z.boolean(),
  }),
  
  // Jagderfahrung
  erfahrung: z.object({
    jahreSeit: z.number().min(0).max(100),
    gesellschaftsjagdenAnzahl: z.number().min(0),
    standortPraeferenz: z.enum(['hochsitz', 'bodensitz', 'treiber']).optional(),
  }),
  
  // Anmeldung Status
  anmeldung: z.object({
    status: z.enum(['eingeladen', 'zugesagt', 'abgesagt', 'warteliste']),
    angemeldetAm: z.date().optional(),
    kommentar: z.string().max(500).optional(),
  }),
  
  // Standort-Zuweisung
  zugewiesenerStandort: z.string().uuid().optional(),
  
  // Live Status (während Jagd)
  liveStatus: z.object({
    amStandort: z.boolean(),
    letzteAktivitaet: z.date(),
    gps: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }).optional(),
});

export const StandortSchema = z.object({
  id: z.string().uuid(),
  jagdId: z.string().uuid(),
  
  // Identifikation
  nummer: z.number().min(1),
  name: z.string().min(2).max(100).optional(),
  typ: z.enum(['hochsitz', 'bodensitz', 'kanzel', 'ansitzleiter', 'druckposten', 'treiberlinie']),
  
  // Position
  gps: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  hoehe: z.number().optional(),
  poiId: z.string().uuid().optional(),
  
  // Beschreibung
  beschreibung: z.string().max(500).optional(),
  zugang: z.string().max(500),
  orientierung: z.number().min(0).max(360),
  
  // Sicherheit
  sicherheit: z.object({
    schussrichtungen: z.array(z.number().min(0).max(360)),
    sichtfeld: z.object({
      winkel: z.number().min(0).max(360),
      reichweite: z.number().min(0),
    }),
  }),
  
  // Eigenschaften
  eigenschaften: z.object({
    ueberdacht: z.boolean(),
    beheizt: z.boolean(),
    kapazitaet: z.number().min(1),
    barrierefrei: z.boolean(),
    ansitzleiter: z.boolean(),
  }),
  
  // Status
  status: z.enum(['verfuegbar', 'besetzt', 'gesperrt']),
  zugewiesenePersonen: z.array(z.string().uuid()),
});

export const SicherheitszoneSchema = z.object({
  id: z.string().uuid(),
  jagdId: z.string().uuid(),
  
  name: z.string().min(2).max(100),
  beschreibung: z.string().max(500).optional(),
  
  typ: z.enum(['sperrgebiet', 'gefahrenzone', 'schutzzone']),
  
  coordinates: z.array(z.object({
    latitude: z.number(),
    longitude: z.number()
  })),
});

export const StandortZuweisungSchema = z.object({
  id: z.string().uuid(),
  jagdId: z.string().uuid(),
  standortId: z.string().uuid(),
  teilnehmerId: z.string().uuid(),
  
  // Zuweisung
  zugewiesenVon: z.string().uuid(),
  zugewiesenAm: z.date(),
  prioritaet: z.number().min(1),
  
  // Bestätigung
  bestaetigt: z.boolean(),
  bestaetigtAm: z.date().optional(),
  
  // Notizen
  notizen: z.string().max(500).optional(),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Gesellschaftsjagd = z.infer<typeof GesellschaftsjagdSchema>;
export type Teilnehmer = z.infer<typeof TeilnehmerSchema>;
export type Standort = z.infer<typeof StandortSchema>;
export type Sicherheitszone = z.infer<typeof SicherheitszoneSchema>;
export type StandortZuweisung = z.infer<typeof StandortZuweisungSchema>;

export type JagdTyp = 'drueckjagd' | 'treibjagd' | 'bewegungsjagd' | 'ansitzjagd_gruppe' | 'riegeljagd' | 'sonstiges';
export type TeilnehmerRolle = 'jagdleiter' | 'schuetze' | 'treiber' | 'hundefuehrer' | 'ansteller' | 'bergehelfer' | 'sanitaeter';
export type StandortTyp = 'hochsitz' | 'bodensitz' | 'kanzel' | 'ansitzleiter' | 'druckposten' | 'treiberlinie';

// Extended Gesellschaftsjagd interface with additional fields
export interface GesellschaftsjagdExtended extends Gesellschaftsjagd {
  teilnehmer?: Teilnehmer[];
  standorte?: Standort[];
  standortZuweisungen?: StandortZuweisung[];
  maxTeilnehmer?: number;
}
