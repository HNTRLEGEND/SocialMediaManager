/**
 * HNTR LEGEND Pro - Schonzeiten nach Bundesland
 * Stand: 2026 (ohne Gewähr - bitte aktuelle Landesjagdverordnungen prüfen)
 */

// Schonzeit-Definition
export interface Schonzeit {
  von: string; // Format: 'DD.MM' (Tag.Monat)
  bis: string; // Format: 'DD.MM'
  beschreibung: string;
  geschlecht?: 'männlich' | 'weiblich' | 'beide';
  altersklasse?: string;
}

// Wildart-spezifische Schonzeiten
export interface WildartSchonzeiten {
  [wildart: string]: Schonzeit[];
}

// Schonzeiten pro Bundesland
export interface BundeslandSchonzeiten {
  [bundesland: string]: WildartSchonzeiten;
}

/**
 * Schonzeiten-Katalog für alle Bundesländer
 * WICHTIG: Vereinfachte Darstellung - in der Praxis gelten oft
 * komplexere Regelungen je nach Geschlecht, Altersklasse und Region
 */
export const SCHONZEITEN: BundeslandSchonzeiten = {
  'nordrhein-westfalen': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Schmalrehe und Ricken', geschlecht: 'weiblich' },
      { von: '01.03', bis: '31.08', beschreibung: 'Kitze' },
    ],
    rotwild: [
      { von: '01.02', bis: '31.07', beschreibung: 'Hirsche Klasse II und III', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.07', beschreibung: 'Alttiere und Schmaltiere', geschlecht: 'weiblich' },
      { von: '01.03', bis: '31.07', beschreibung: 'Kälber' },
    ],
    damwild: [
      { von: '01.02', bis: '31.08', beschreibung: 'Schaufler', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Alttiere und Schmaltiere', geschlecht: 'weiblich' },
      { von: '01.03', bis: '31.08', beschreibung: 'Kälber' },
    ],
    schwarzwild: [
      // Schwarzwild: Keine Schonzeit, aber Vorsicht bei führenden Bachen
      { von: '01.03', bis: '15.06', beschreibung: 'Führende Bachen (Empfehlung)', geschlecht: 'weiblich' },
    ],
    fuchs: [
      { von: '01.03', bis: '15.07', beschreibung: 'Jungfüchse bis Selbständigkeit' },
    ],
    feldhase: [
      { von: '16.01', bis: '30.09', beschreibung: 'Feldhasen' },
    ],
    fasan: [
      { von: '16.01', bis: '30.09', beschreibung: 'Fasane' },
    ],
    wildente: [
      { von: '16.01', bis: '31.08', beschreibung: 'Stockenten' },
    ],
  },
  'bayern': {
    rehwild: [
      { von: '16.10', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Schmalrehe und Ricken', geschlecht: 'weiblich' },
      { von: '01.02', bis: '31.08', beschreibung: 'Kitze' },
    ],
    rotwild: [
      { von: '01.02', bis: '31.07', beschreibung: 'Hirsche', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.07', beschreibung: 'Alttiere und Schmaltiere', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
    fuchs: [
      { von: '01.03', bis: '15.06', beschreibung: 'Jungfuchsschutz' },
    ],
  },
  'baden-wuerttemberg': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Schmalrehe und Ricken', geschlecht: 'weiblich' },
    ],
    rotwild: [
      { von: '01.02', bis: '31.07', beschreibung: 'Hirsche', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.07', beschreibung: 'Kahlwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'niedersachsen': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    rotwild: [
      { von: '01.02', bis: '31.07', beschreibung: 'Hirsche', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.07', beschreibung: 'Kahlwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
    damwild: [
      { von: '01.02', bis: '31.08', beschreibung: 'Schaufler', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Kahlwild', geschlecht: 'weiblich' },
    ],
  },
  'hessen': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    rotwild: [
      { von: '16.01', bis: '31.07', beschreibung: 'Hirsche', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.07', beschreibung: 'Kahlwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'rheinland-pfalz': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'sachsen': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'schleswig-holstein': {
    rehwild: [
      { von: '16.01', bis: '15.05', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'brandenburg': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    rotwild: [
      { von: '01.02', bis: '31.07', beschreibung: 'Hirsche', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.07', beschreibung: 'Kahlwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'mecklenburg-vorpommern': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'sachsen-anhalt': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'thueringen': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'saarland': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'berlin': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'hamburg': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
  'bremen': {
    rehwild: [
      { von: '16.01', bis: '30.04', beschreibung: 'Rehböcke', geschlecht: 'männlich' },
      { von: '16.01', bis: '31.08', beschreibung: 'Weibliches Rehwild', geschlecht: 'weiblich' },
    ],
    schwarzwild: [],
  },
};

// Liste aller Bundesländer
export const BUNDESLAENDER = [
  { id: 'baden-wuerttemberg', name: 'Baden-Württemberg' },
  { id: 'bayern', name: 'Bayern' },
  { id: 'berlin', name: 'Berlin' },
  { id: 'brandenburg', name: 'Brandenburg' },
  { id: 'bremen', name: 'Bremen' },
  { id: 'hamburg', name: 'Hamburg' },
  { id: 'hessen', name: 'Hessen' },
  { id: 'mecklenburg-vorpommern', name: 'Mecklenburg-Vorpommern' },
  { id: 'niedersachsen', name: 'Niedersachsen' },
  { id: 'nordrhein-westfalen', name: 'Nordrhein-Westfalen' },
  { id: 'rheinland-pfalz', name: 'Rheinland-Pfalz' },
  { id: 'saarland', name: 'Saarland' },
  { id: 'sachsen', name: 'Sachsen' },
  { id: 'sachsen-anhalt', name: 'Sachsen-Anhalt' },
  { id: 'schleswig-holstein', name: 'Schleswig-Holstein' },
  { id: 'thueringen', name: 'Thüringen' },
] as const;

export type Bundesland = (typeof BUNDESLAENDER)[number]['id'];
