/**
 * GESELLSCHAFTSJAGD TYPES - Web Version
 * Phase 6.1: Critical Fixes
 * HNTR LEGEND Pro
 */

import { z } from 'zod';

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
  
  name: z.string().min(2, 'Mindestens 2 Zeichen').max(100, 'Maximal 100 Zeichen'),
  email: z.string().email('Ungültige E-Mail').max(255).optional(),
  telefon: z.string().max(20, 'Maximal 20 Zeichen').optional(),
  
  rolle: z.enum(['jagdleiter', 'schuetze', 'treiber', 'hundefuehrer', 'ansteller', 'bergehelfer', 'sanitaeter']),
  
  bemerkungen: z.string().max(1000, 'Maximal 1000 Zeichen').optional(),
  
  status: z.enum(['eingeladen', 'zugesagt', 'abgesagt', 'warteliste']),
});

export const StandortSchema = z.object({
  id: z.string().uuid(),
  jagdId: z.string().uuid(),
  
  name: z.string().min(2).max(100),
  beschreibung: z.string().max(500).optional(),
  typ: z.enum(['hochsitz', 'bodensitz', 'kanzel', 'ansitzleiter', 'druckposten', 'treiberlinie']),
  
  gps: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  
  besonderheiten: z.string().max(500).optional(),
  
  status: z.enum(['verfuegbar', 'besetzt', 'gesperrt']),
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

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Gesellschaftsjagd = z.infer<typeof GesellschaftsjagdSchema>;
export type Teilnehmer = z.infer<typeof TeilnehmerSchema>;
export type Standort = z.infer<typeof StandortSchema>;
export type Sicherheitszone = z.infer<typeof SicherheitszoneSchema>;

export type JagdTyp = 'drueckjagd' | 'treibjagd' | 'bewegungsjagd' | 'ansitzjagd_gruppe' | 'riegeljagd' | 'sonstiges';
export type TeilnehmerRolle = 'jagdleiter' | 'schuetze' | 'treiber' | 'hundefuehrer' | 'ansteller' | 'bergehelfer' | 'sanitaeter';
export type StandortTyp = 'hochsitz' | 'bodensitz' | 'kanzel' | 'ansitzleiter' | 'druckposten' | 'treiberlinie';
