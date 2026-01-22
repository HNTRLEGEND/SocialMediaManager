/**
 * HNTR LEGEND Pro - Wildarten-Katalog
 * Vollständige Liste jagdbarer Wildarten in Deutschland
 */

// Wildart-Kategorien
export enum WildartKategorie {
  SCHALENWILD = 'SCHALENWILD',
  NIEDERWILD = 'NIEDERWILD',
  RAUBWILD = 'RAUBWILD',
  FEDERWILD = 'FEDERWILD',
  SONSTIGE = 'SONSTIGE',
}

// Wildart-Definition
export interface WildartDefinition {
  id: string;
  name: string;
  kategorie: WildartKategorie;
  // Altersklassen für diese Wildart
  altersklassen: string[];
  // Hat diese Wildart Trophäen/Gehörn/Geweih?
  hatTrophae: boolean;
  trophaeTyp?: 'geweih' | 'gehoern' | 'keilerwaffen' | 'balg' | 'keine';
  // Icon/Emoji für UI
  icon: string;
}

// Hauptkatalog aller Wildarten
export const WILDARTEN: Record<string, WildartDefinition> = {
  // === SCHALENWILD ===
  rehwild: {
    id: 'rehwild',
    name: 'Rehwild',
    kategorie: WildartKategorie.SCHALENWILD,
    altersklassen: ['Kitz', 'Jährling', 'Gering', 'Mittel', 'Stark', 'Reif'],
    hatTrophae: true,
    trophaeTyp: 'gehoern',
    icon: '🦌',
  },
  rotwild: {
    id: 'rotwild',
    name: 'Rotwild',
    kategorie: WildartKategorie.SCHALENWILD,
    altersklassen: ['Kalb', 'Schmaltier/Spießer', 'Hirschklasse III', 'Hirschklasse II', 'Hirschklasse I'],
    hatTrophae: true,
    trophaeTyp: 'geweih',
    icon: '🦌',
  },
  damwild: {
    id: 'damwild',
    name: 'Damwild',
    kategorie: WildartKategorie.SCHALENWILD,
    altersklassen: ['Kalb', 'Schmaltier/Spießer', 'Jung', 'Mittel', 'Alt'],
    hatTrophae: true,
    trophaeTyp: 'geweih',
    icon: '🦌',
  },
  sikawild: {
    id: 'sikawild',
    name: 'Sikawild',
    kategorie: WildartKategorie.SCHALENWILD,
    altersklassen: ['Kalb', 'Schmaltier/Spießer', 'Jung', 'Mittel', 'Alt'],
    hatTrophae: true,
    trophaeTyp: 'geweih',
    icon: '🦌',
  },
  muffelwild: {
    id: 'muffelwild',
    name: 'Muffelwild',
    kategorie: WildartKategorie.SCHALENWILD,
    altersklassen: ['Lamm', 'Jährling', 'Jung', 'Mittel', 'Alt'],
    hatTrophae: true,
    trophaeTyp: 'gehoern',
    icon: '🐑',
  },
  gamswild: {
    id: 'gamswild',
    name: 'Gamswild',
    kategorie: WildartKategorie.SCHALENWILD,
    altersklassen: ['Kitz', 'Jährling', 'Jung', 'Mittel', 'Alt'],
    hatTrophae: true,
    trophaeTyp: 'gehoern',
    icon: '🐐',
  },
  schwarzwild: {
    id: 'schwarzwild',
    name: 'Schwarzwild',
    kategorie: WildartKategorie.SCHALENWILD,
    altersklassen: ['Frischling', 'Überläufer', 'Bache/Keiler 2-jährig', 'Bache/Keiler 3-4jährig', 'Hauptschwein'],
    hatTrophae: true,
    trophaeTyp: 'keilerwaffen',
    icon: '🐗',
  },

  // === NIEDERWILD ===
  feldhase: {
    id: 'feldhase',
    name: 'Feldhase',
    kategorie: WildartKategorie.NIEDERWILD,
    altersklassen: ['Junghase', 'Althase'],
    hatTrophae: false,
    icon: '🐇',
  },
  wildkaninchen: {
    id: 'wildkaninchen',
    name: 'Wildkaninchen',
    kategorie: WildartKategorie.NIEDERWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: false,
    icon: '🐰',
  },

  // === RAUBWILD ===
  fuchs: {
    id: 'fuchs',
    name: 'Fuchs',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungfuchs', 'Altfuchs'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🦊',
  },
  dachs: {
    id: 'dachs',
    name: 'Dachs',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🦡',
  },
  marder: {
    id: 'marder',
    name: 'Marder',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🐾',
  },
  steinmarder: {
    id: 'steinmarder',
    name: 'Steinmarder',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🐾',
  },
  baummarder: {
    id: 'baummarder',
    name: 'Baummarder',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🐾',
  },
  iltis: {
    id: 'iltis',
    name: 'Iltis',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🐾',
  },
  mink: {
    id: 'mink',
    name: 'Mink/Amerikanischer Nerz',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🐾',
  },
  waschbaer: {
    id: 'waschbaer',
    name: 'Waschbär',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🦝',
  },
  marderhund: {
    id: 'marderhund',
    name: 'Marderhund',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: true,
    trophaeTyp: 'balg',
    icon: '🐕',
  },
  nutria: {
    id: 'nutria',
    name: 'Nutria',
    kategorie: WildartKategorie.RAUBWILD,
    altersklassen: ['Jungtier', 'Alttier'],
    hatTrophae: false,
    icon: '🦫',
  },

  // === FEDERWILD ===
  fasan: {
    id: 'fasan',
    name: 'Fasan',
    kategorie: WildartKategorie.FEDERWILD,
    altersklassen: ['Jungvogel', 'Altvogel'],
    hatTrophae: false,
    icon: '🐦',
  },
  rebhuhn: {
    id: 'rebhuhn',
    name: 'Rebhuhn',
    kategorie: WildartKategorie.FEDERWILD,
    altersklassen: ['Jungvogel', 'Altvogel'],
    hatTrophae: false,
    icon: '🐦',
  },
  wildente: {
    id: 'wildente',
    name: 'Wildente (Stockente)',
    kategorie: WildartKategorie.FEDERWILD,
    altersklassen: ['Jungvogel', 'Altvogel'],
    hatTrophae: false,
    icon: '🦆',
  },
  wildgans: {
    id: 'wildgans',
    name: 'Wildgans',
    kategorie: WildartKategorie.FEDERWILD,
    altersklassen: ['Jungvogel', 'Altvogel'],
    hatTrophae: false,
    icon: '🦢',
  },
  wildtaube: {
    id: 'wildtaube',
    name: 'Wildtaube (Ringeltaube)',
    kategorie: WildartKategorie.FEDERWILD,
    altersklassen: ['Jungvogel', 'Altvogel'],
    hatTrophae: false,
    icon: '🕊️',
  },
  kraehe: {
    id: 'kraehe',
    name: 'Rabenkrähe/Nebelkrähe',
    kategorie: WildartKategorie.FEDERWILD,
    altersklassen: ['Jungvogel', 'Altvogel'],
    hatTrophae: false,
    icon: '🐦‍⬛',
  },
  elster: {
    id: 'elster',
    name: 'Elster',
    kategorie: WildartKategorie.FEDERWILD,
    altersklassen: ['Jungvogel', 'Altvogel'],
    hatTrophae: false,
    icon: '🐦',
  },

  // === SONSTIGE ===
  sonstiges: {
    id: 'sonstiges',
    name: 'Sonstiges Wild',
    kategorie: WildartKategorie.SONSTIGE,
    altersklassen: ['Unbekannt'],
    hatTrophae: false,
    icon: '❓',
  },
};

// Hilfsfunktion: Alle Wildarten als Array
export const getWildartenListe = (): WildartDefinition[] => {
  return Object.values(WILDARTEN);
};

// Hilfsfunktion: Wildarten nach Kategorie
export const getWildartenByKategorie = (kategorie: WildartKategorie): WildartDefinition[] => {
  return Object.values(WILDARTEN).filter((w) => w.kategorie === kategorie);
};

// Hilfsfunktion: Autocomplete-Suche
export const sucheWildart = (suchbegriff: string): WildartDefinition[] => {
  const s = suchbegriff.toLowerCase();
  return Object.values(WILDARTEN).filter((w) => w.name.toLowerCase().includes(s));
};

// Geschlechter
export const GESCHLECHTER = ['männlich', 'weiblich', 'unbekannt'] as const;
export type Geschlecht = (typeof GESCHLECHTER)[number];

// Jagdarten
export const JAGDARTEN = [
  'Ansitz',
  'Pirsch',
  'Drückjagd',
  'Treibjagd',
  'Lockjagd',
  'Fallenjagd',
  'Baujagd',
  'Wasserjagd',
  'Beizjagd',
  'Sonstige',
] as const;
export type Jagdart = (typeof JAGDARTEN)[number];
