/**
 * HNTR LEGEND Pro - Feature Flag Service
 * Modul-Freischaltung basierend auf Plan und Rolle
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeatureFlag, Plan, RevierRolle, SEAT_LIMITS } from '../types';

// Storage Key
const FEATURE_FLAGS_KEY = '@jagdlog_feature_flags';
const CURRENT_PLAN_KEY = '@jagdlog_current_plan';

// Feature-Definitionen
export const FEATURES = {
  // Basis-Features (immer verfügbar)
  tagebuch: 'tagebuch',
  beobachtungen: 'beobachtungen',
  abschuesse: 'abschuesse',
  basisKarte: 'basis_karte',

  // Premium Jäger Features
  erweitertKarte: 'erweitert_karte',
  offlineKarten: 'offline_karten',
  statistiken: 'statistiken',
  exportPdf: 'export_pdf',
  wetterIntegration: 'wetter_integration',

  // Revier-Features (Team)
  revierVerwaltung: 'revier_verwaltung',
  teamMitglieder: 'team_mitglieder',
  zonen: 'zonen',
  tracks: 'tracks',
  kontakte: 'kontakte',

  // Enterprise-Features
  mehrereReviere: 'mehrere_reviere',
  behoerdenExport: 'behoerden_export',
  apiZugang: 'api_zugang',

  // Zukünftige Features (noch nicht verfügbar)
  kiAssistenz: 'ki_assistenz',
  dreiDSchussbild: '3d_schussbild',
  sprachErkennung: 'sprach_erkennung',
} as const;

// Plan-Feature-Matrix
const PLAN_FEATURES: Record<Plan, string[]> = {
  free: [
    FEATURES.tagebuch,
    FEATURES.beobachtungen,
    FEATURES.abschuesse,
    FEATURES.basisKarte,
  ],
  premium_jaeger: [
    FEATURES.tagebuch,
    FEATURES.beobachtungen,
    FEATURES.abschuesse,
    FEATURES.basisKarte,
    FEATURES.erweitertKarte,
    FEATURES.offlineKarten,
    FEATURES.statistiken,
    FEATURES.exportPdf,
    FEATURES.wetterIntegration,
    FEATURES.kontakte,
  ],
  revier_s: [
    // Alle Premium Features
    FEATURES.tagebuch,
    FEATURES.beobachtungen,
    FEATURES.abschuesse,
    FEATURES.basisKarte,
    FEATURES.erweitertKarte,
    FEATURES.offlineKarten,
    FEATURES.statistiken,
    FEATURES.exportPdf,
    FEATURES.wetterIntegration,
    FEATURES.kontakte,
    // Plus Team Features
    FEATURES.revierVerwaltung,
    FEATURES.teamMitglieder,
    FEATURES.zonen,
    FEATURES.tracks,
  ],
  revier_m: [
    // Alle Revier S Features
    FEATURES.tagebuch,
    FEATURES.beobachtungen,
    FEATURES.abschuesse,
    FEATURES.basisKarte,
    FEATURES.erweitertKarte,
    FEATURES.offlineKarten,
    FEATURES.statistiken,
    FEATURES.exportPdf,
    FEATURES.wetterIntegration,
    FEATURES.kontakte,
    FEATURES.revierVerwaltung,
    FEATURES.teamMitglieder,
    FEATURES.zonen,
    FEATURES.tracks,
  ],
  revier_l: [
    // Alle Revier M Features
    FEATURES.tagebuch,
    FEATURES.beobachtungen,
    FEATURES.abschuesse,
    FEATURES.basisKarte,
    FEATURES.erweitertKarte,
    FEATURES.offlineKarten,
    FEATURES.statistiken,
    FEATURES.exportPdf,
    FEATURES.wetterIntegration,
    FEATURES.kontakte,
    FEATURES.revierVerwaltung,
    FEATURES.teamMitglieder,
    FEATURES.zonen,
    FEATURES.tracks,
    FEATURES.mehrereReviere,
  ],
  revier_xl: [
    // Alle Revier L Features
    FEATURES.tagebuch,
    FEATURES.beobachtungen,
    FEATURES.abschuesse,
    FEATURES.basisKarte,
    FEATURES.erweitertKarte,
    FEATURES.offlineKarten,
    FEATURES.statistiken,
    FEATURES.exportPdf,
    FEATURES.wetterIntegration,
    FEATURES.kontakte,
    FEATURES.revierVerwaltung,
    FEATURES.teamMitglieder,
    FEATURES.zonen,
    FEATURES.tracks,
    FEATURES.mehrereReviere,
    FEATURES.behoerdenExport,
  ],
  enterprise: [
    // Alle Features
    FEATURES.tagebuch,
    FEATURES.beobachtungen,
    FEATURES.abschuesse,
    FEATURES.basisKarte,
    FEATURES.erweitertKarte,
    FEATURES.offlineKarten,
    FEATURES.statistiken,
    FEATURES.exportPdf,
    FEATURES.wetterIntegration,
    FEATURES.kontakte,
    FEATURES.revierVerwaltung,
    FEATURES.teamMitglieder,
    FEATURES.zonen,
    FEATURES.tracks,
    FEATURES.mehrereReviere,
    FEATURES.behoerdenExport,
    FEATURES.apiZugang,
  ],
};

// Aktueller Plan (Demo-Modus)
let aktuellerPlan: Plan = 'revier_m'; // Standard für Demo

/**
 * Setzt den aktuellen Plan (Demo-Modus)
 */
export const setCurrentPlan = async (plan: Plan): Promise<void> => {
  aktuellerPlan = plan;
  await AsyncStorage.setItem(CURRENT_PLAN_KEY, plan);
  console.log('[FeatureFlags] Plan gesetzt:', plan);
};

/**
 * Holt den aktuellen Plan
 */
export const getCurrentPlan = async (): Promise<Plan> => {
  try {
    const gespeicherterPlan = await AsyncStorage.getItem(CURRENT_PLAN_KEY);
    if (gespeicherterPlan && isValidPlan(gespeicherterPlan)) {
      aktuellerPlan = gespeicherterPlan as Plan;
    }
  } catch (error) {
    console.warn('[FeatureFlags] Fehler beim Laden des Plans:', error);
  }
  return aktuellerPlan;
};

/**
 * Prüft ob ein Plan-String gültig ist
 */
const isValidPlan = (plan: string): boolean => {
  return ['free', 'premium_jaeger', 'revier_s', 'revier_m', 'revier_l', 'revier_xl', 'enterprise'].includes(plan);
};

/**
 * Prüft ob ein Feature für den aktuellen Plan aktiviert ist
 */
export const isFeatureEnabled = (featureId: string): boolean => {
  const planFeatures = PLAN_FEATURES[aktuellerPlan] || PLAN_FEATURES.free;
  return planFeatures.includes(featureId);
};

/**
 * Prüft ob ein Feature für einen bestimmten Plan aktiviert ist
 */
export const isFeatureEnabledForPlan = (featureId: string, plan: Plan): boolean => {
  const planFeatures = PLAN_FEATURES[plan] || PLAN_FEATURES.free;
  return planFeatures.includes(featureId);
};

/**
 * Gibt alle aktivierten Features für den aktuellen Plan zurück
 */
export const getEnabledFeatures = (): string[] => {
  return PLAN_FEATURES[aktuellerPlan] || PLAN_FEATURES.free;
};

/**
 * Gibt das Seat-Limit für den aktuellen Plan zurück
 */
export const getSeatLimit = (): number => {
  return SEAT_LIMITS[aktuellerPlan] || 1;
};

/**
 * Prüft ob ein Seat-Limit erreicht ist
 * @param aktuelleAnzahl Aktuelle Anzahl der Mitglieder
 */
export const isSeatLimitReached = (aktuelleAnzahl: number): boolean => {
  const limit = getSeatLimit();
  return aktuelleAnzahl >= limit;
};

/**
 * Gibt Feature-Informationen für die UI zurück
 */
export interface FeatureInfo {
  id: string;
  name: string;
  beschreibung: string;
  aktiviert: boolean;
  minPlan: Plan;
}

export const getFeatureInfos = (): FeatureInfo[] => {
  return [
    {
      id: FEATURES.tagebuch,
      name: 'Jagdtagebuch',
      beschreibung: 'Erfassung von Beobachtungen und Abschüssen',
      aktiviert: isFeatureEnabled(FEATURES.tagebuch),
      minPlan: 'free',
    },
    {
      id: FEATURES.basisKarte,
      name: 'Basis-Karte',
      beschreibung: 'Kartenanzeige mit Markern',
      aktiviert: isFeatureEnabled(FEATURES.basisKarte),
      minPlan: 'free',
    },
    {
      id: FEATURES.erweitertKarte,
      name: 'Erweiterte Karte',
      beschreibung: 'POIs, Reviergrenzen, Layer-Steuerung',
      aktiviert: isFeatureEnabled(FEATURES.erweitertKarte),
      minPlan: 'premium_jaeger',
    },
    {
      id: FEATURES.offlineKarten,
      name: 'Offline-Karten',
      beschreibung: 'Kartenmaterial offline speichern',
      aktiviert: isFeatureEnabled(FEATURES.offlineKarten),
      minPlan: 'premium_jaeger',
    },
    {
      id: FEATURES.statistiken,
      name: 'Statistiken',
      beschreibung: 'Auswertungen und Diagramme',
      aktiviert: isFeatureEnabled(FEATURES.statistiken),
      minPlan: 'premium_jaeger',
    },
    {
      id: FEATURES.exportPdf,
      name: 'PDF-Export',
      beschreibung: 'Jagdtagebuch als Buch exportieren',
      aktiviert: isFeatureEnabled(FEATURES.exportPdf),
      minPlan: 'premium_jaeger',
    },
    {
      id: FEATURES.revierVerwaltung,
      name: 'Revierverwaltung',
      beschreibung: 'Mehrere Reviere anlegen und verwalten',
      aktiviert: isFeatureEnabled(FEATURES.revierVerwaltung),
      minPlan: 'revier_s',
    },
    {
      id: FEATURES.teamMitglieder,
      name: 'Team & Mitglieder',
      beschreibung: 'Jagdgäste und Mitglieder einladen',
      aktiviert: isFeatureEnabled(FEATURES.teamMitglieder),
      minPlan: 'revier_s',
    },
    {
      id: FEATURES.zonen,
      name: 'Zonen & Teilflächen',
      beschreibung: 'Revier in Zonen unterteilen',
      aktiviert: isFeatureEnabled(FEATURES.zonen),
      minPlan: 'revier_s',
    },
    {
      id: FEATURES.tracks,
      name: 'Track-Aufzeichnung',
      beschreibung: 'Pirsch- und Nachsuchenrouten aufzeichnen',
      aktiviert: isFeatureEnabled(FEATURES.tracks),
      minPlan: 'revier_s',
    },
    {
      id: FEATURES.behoerdenExport,
      name: 'Behörden-Export',
      beschreibung: 'Standardisierte Berichte für Behörden',
      aktiviert: isFeatureEnabled(FEATURES.behoerdenExport),
      minPlan: 'revier_xl',
    },
  ];
};

/**
 * Gibt den Anzeigetext für einen Plan zurück
 */
export const getPlanDisplayName = (plan: Plan): string => {
  const namen: Record<Plan, string> = {
    free: 'Kostenlos',
    premium_jaeger: 'Premium Jäger',
    revier_s: 'Revier S (2 Personen)',
    revier_m: 'Revier M (5 Personen)',
    revier_l: 'Revier L (10 Personen)',
    revier_xl: 'Revier XL (20 Personen)',
    enterprise: 'Enterprise (30+ Personen)',
  };
  return namen[plan] || plan;
};

/**
 * Initialisiert den Feature Flag Service
 */
export const initFeatureFlags = async (): Promise<void> => {
  await getCurrentPlan();
  console.log('[FeatureFlags] Initialisiert mit Plan:', aktuellerPlan);
};
