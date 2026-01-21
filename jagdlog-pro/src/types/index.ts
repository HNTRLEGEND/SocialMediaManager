export interface JagdEintrag {
  id: string;
  typ: 'beobachtung' | 'abschuss' | 'sonstiges';
  datum: Date;
  revier: string;
  jagdart: 'ansitz' | 'pirsch' | 'drueckjagd' | 'einzeljagd';
  gps: { lat: number; lon: number };
  temperatur: { real: number; gefuehlt: number };
  wind: { richtung: string; staerke: number };
  wildart?: string;
  anzahl?: number;
  notizen?: string;
  fotos?: string[];
  sichtbarkeit: 'privat' | 'freunde' | 'oeffentlich';
  gpsVerstecken?: boolean;
}

export interface Abschuss extends JagdEintrag {
  typ: 'abschuss';
  geschlecht: 'männlich' | 'weiblich';
  altersklasse: string;
  gewicht?: number;
  schussentfernung?: number;
  waffe?: string;
  kaliber?: string;
  trophäe?: {
    gewicht?: number;
    punkte?: number;
  };
}

export type PrivacyMode = 'privat' | 'freunde' | 'oeffentlich';
