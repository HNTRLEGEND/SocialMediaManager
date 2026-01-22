# Phase 8: Advanced Analytics & Predictions - Vollständige Spezifikation
**Version**: 1.0  
**Datum**: 22. Januar 2026  
**Status**: 🚀 In Entwicklung  
**Priorität**: 🔥 HIGH (Competitive Differentiator)

---

## 📋 EXECUTIVE SUMMARY

**Ziel**: KI-gestützte Vorhersagen, Wetterkorrelation, Anschuss-Erkennung und Nachsuche-Empfehlungen

**Business Impact**:
- 🎯 **Predictive Insights**: Wildaktivität vorhersagen (70%+ Accuracy)
- 🩸 **Anschuss-Analyse**: Trefferlage erkennen, Nachsuche optimieren
- 📊 **Bestandsentwicklung**: Population Trends tracken
- ⏱️ **Time to Success**: 40% schnellere erfolgreiche Jagden
- 💰 **Premium Feature**: +25% Premium-Tier Conversions

**Timeline**: 8-10 Wochen  
**Budget**: €40,000 - €60,000  
**Team**: 2 ML Engineers + 1 Mobile Dev + 1 Data Scientist

---

## 🎯 FEATURES ÜBERSICHT

### 1. Wetterkorrelation & Wildaktivität-Vorhersage

**Ziel**: Wildaktivität basierend auf Wetterdaten vorhersagen

#### 1.1 Wetterparameter-Tracking
```typescript
interface WeatherParameters {
  // Basis
  temperatur: number;              // °C
  luftdruck: number;               // hPa
  luftfeuchtigkeit: number;        // %
  niederschlag: number;            // mm/h
  
  // Wind
  windgeschwindigkeit: number;     // km/h
  windrichtung: number;            // 0-360°
  windböen: number;                // km/h
  
  // Sonne/Mond
  bewölkung: number;               // %
  sichtweite: number;              // km
  uv_index: number;                // 0-11+
  mondphase: MoonPhase;            // 0-1
  mondaufgang: Date;
  monduntergang: Date;
  
  // Zusatz
  taupunkt: number;                // °C
  gefühlte_temperatur: number;     // °C
  schneefall: number;              // cm
}
```

#### 1.2 Korrelations-Analyse
**ML-Model**: Random Forest Regression

**Input Features** (24):
- Wetter (12): Temp, Luftdruck, Wind, Niederschlag, etc.
- Zeit (4): Stunde, Wochentag, Jahreszeit, Mondphase
- Revier (4): Reviergröße, Waldanteil, Feldanteil, Höhenlage
- Historie (4): Ø Aktivität letzte 7/14/30 Tage

**Output**:
```typescript
interface WildaktivitätVorhersage {
  wildart: WildArt;
  zeitraum: {
    von: Date;
    bis: Date;
  };
  
  aktivitätsLevel: {
    score: number;                 // 0-100
    kategorie: 'sehr_niedrig' | 'niedrig' | 'mittel' | 'hoch' | 'sehr_hoch';
    confidence: number;            // 0-100%
  };
  
  optimalZeiten: Array<{
    von: Date;
    bis: Date;
    score: number;                 // 0-100
    begründung: string;
  }>;
  
  wettereinfluss: {
    temperatur: number;            // -1 bis +1 (negativ/positiv)
    luftdruck: number;
    wind: number;
    niederschlag: number;
    mondphase: number;
  };
  
  empfehlung: {
    sollJagen: boolean;
    begründung: string;
    alternativeZeiten: Date[];
  };
}
```

**Korrelations-Regeln** (Initial, dann ML-trained):

**Rehwild**:
- ✅ Optimal: Frühe Morgenstunden (5-8 Uhr), späte Nachmittage (17-20 Uhr)
- ✅ Temperatur: 5-15°C (optimal), >25°C (schlecht)
- ✅ Luftdruck: Steigend = gut, Fallend = schlecht
- ✅ Wind: Leicht (5-15 km/h) = gut, Stark (>25 km/h) = schlecht
- ✅ Niederschlag: Leichter Regen OK, Starkregen = schlecht
- ✅ Mondphase: Vollmond ± 3 Tage = höhere Aktivität (nachts)

**Rotwild**:
- ✅ Optimal: Dämmerung (5-7 Uhr, 19-21 Uhr)
- ✅ Temperatur: 0-12°C
- ✅ Wetter: Stabil, wenig Wind
- ✅ Mondphase: Neumond = mehr Tagesaktivität

**Schwarzwild**:
- ✅ Ganzjährig aktiv (anpassungsfähig)
- ✅ Optimal: Nacht + Dämmerung
- ✅ Temperatur: Fast egal (sehr anpassungsfähig)
- ✅ Wetter: Auch bei Regen aktiv
- ✅ Nach Maisernten: Erhöhte Aktivität

---

### 2. Wildwechsel-Vorhersage & Bewegungsmuster

**Ziel**: Vorhersagen wo/wann Wild auftaucht

#### 2.1 Bewegungsmuster-Analyse
```typescript
interface BewegungsmusterAnalyse {
  wildart: WildArt;
  revier_id: string;
  
  // Räumliche Muster
  hauptwechsel: Array<{
    von: POI;
    nach: POI;
    häufigkeit: number;            // Anzahl Beobachtungen
    wahrscheinlichkeit: number;    // 0-100%
    tageszeiten: Array<{
      von: number;                 // Stunde 0-23
      bis: number;
      wahrscheinlichkeit: number;
    }>;
    jahreszeiten: {
      frühling: number;
      sommer: number;
      herbst: number;
      winter: number;
    };
  }>;
  
  // Hotspots
  hotspots: Array<{
    location: GeoPoint;
    radius: number;                // Meter
    sichtungen: number;
    letzteAktivität: Date;
    durchschnittlicheAufenthaltsdauer: number; // Minuten
    optimalZeiten: string[];       // ["05:00-07:00", "18:00-20:00"]
  }>;
  
  // Zeitliche Muster
  aktivitätsZeiten: {
    stündlich: number[];           // [0-23] - Aktivität pro Stunde
    wöchentlich: number[];         // [0-6] - Aktivität pro Wochentag
    monatlich: number[];           // [0-11] - Aktivität pro Monat
  };
  
  // Vorhersage
  nächsteVorhersagen: Array<{
    zeitpunkt: Date;
    ort: POI;
    wahrscheinlichkeit: number;
    wildart: WildArt;
    geschätzteAnzahl: number;
  }>;
}
```

**ML-Algorithmus**: LSTM (Long Short-Term Memory)
- Input: Historie der letzten 90 Tage (Beobachtungen, Abschüsse, Wildkamera)
- Output: Vorhersage für nächste 7 Tage (stündlich)
- Accuracy Target: 70%+ für Hauptwildarten

---

### 3. Anschuss-Erkennung & Trefferlage-Analyse

**Ziel**: Trefferlage automatisch erkennen, Nachsuche-Empfehlungen geben

#### 3.1 Anschuss-Dokumentation
```typescript
interface AnschussErkennung {
  id: string;
  jagd_id: string;
  abschuss_id?: string;           // Wenn erfolgreich geborgen
  
  // Basis-Info
  wildart: WildArt;
  geschätzteEntfernung: number;   // Meter
  schussZeitpunkt: Date;
  schussRichtung: number;         // 0-360° (Kompass)
  
  // Schuss-Details
  schussplatzierung: {
    ziel: 'Blatt' | 'Träger' | 'Kammer' | 'Keule' | 'Lauf' | 'Haupt' | 'Unbekannt';
    getroffen: boolean;
    confidence: number;            // 0-100%
  };
  
  // Reaktion des Wildes
  reaktion: {
    typ: 'Zusammenbruch' | 'Flucht' | 'Zeichnen' | 'Keine_Reaktion';
    richtung?: number;             // 0-360° bei Flucht
    geschwindigkeit?: 'Langsam' | 'Mittel' | 'Schnell';
    lautäußerung?: 'Schreien' | 'Klagen' | 'Keine';
    verhalten?: string[];          // ["Hochflüchtig", "Katzenbuckel", "Taumeln"]
  };
  
  // Pirschzeichen
  anschusszeichen: {
    // Blutspuren
    blut: {
      vorhanden: boolean;
      farbe: 'Hellrot' | 'Dunkelrot' | 'Bräunlich' | 'Schaumig';
      menge: 'Keine' | 'Wenig' | 'Mittel' | 'Viel';
      verteilung: 'Tropfen' | 'Spritzer' | 'Fährte' | 'Lache';
      höhe: 'Bodennah' | 'Kniehoch' | 'Brusthoch';
    };
    
    // Schweiß-Details
    schweiß: {
      lungenblut: boolean;         // Hellrot, schaumig
      lebertreffer: boolean;       // Dunkelrot, dickflüssig
      nierenschuss: boolean;       // Blutig, Urin
      pansenschuss: boolean;       // Grünlich, Mageninhalt
      knochenschuss: boolean;      // Mit Knochensplittern
    };
    
    // Sonstige Zeichen
    haare: {
      vorhanden: boolean;
      typ?: 'Grannen' | 'Deckhaar' | 'Winterhaar' | 'Sommerhaar';
      farbe?: string;
      menge?: number;
    };
    
    wildpret: {
      vorhanden: boolean;
      typ?: 'Lungenstücke' | 'Pansenfetzen' | 'Knochensplitter';
    };
    
    // Fährte
    fährte: {
      gesehen: boolean;
      geschwindigkeit?: 'Schritt' | 'Trab' | 'Flucht';
      auffälligkeiten?: string[];  // ["Schleifen", "Weit auseinander", "Unregelmäßig"]
    };
  };
  
  // KI-Analyse (automatisch aus Foto/Video)
  kiAnalyse?: {
    bildUri: string;
    erkannte_merkmale: {
      blutfarbe?: string;
      blutmenge?: string;
      haare_erkannt?: boolean;
      wildpret_erkannt?: boolean;
    };
    confidence: number;
  };
  
  // Trefferlage-Bestimmung (ML)
  trefferlageDiagnose: {
    hauptdiagnose: TrefferArt;
    wahrscheinlichkeit: number;    // 0-100%
    alternativDiagnosen: Array<{
      art: TrefferArt;
      wahrscheinlichkeit: number;
    }>;
    
    begründung: string[];          // ["Hellrotes schaumiges Blut spricht für Lungentreffer", ...]
  };
  
  // Empfehlung
  nachsucheEmpfehlung: NachsucheEmpfehlung;
}

type TrefferArt = 
  | 'Blattschuss'           // Herz/Lunge - OPTIMAL
  | 'Trägerschuss'          // Wirbelsäule - OPTIMAL
  | 'Kammerschuss'          // Herz/große Gefäße - OPTIMAL
  | 'Laufschuss'            // Bein/Lauf - SCHLECHT
  | 'Lebertreffer'          // Leber - OK (stirbt verzögert)
  | 'Nierenschuss'          // Niere - OK
  | 'Pansenschuss'          // Magen/Darm - SCHLECHT
  | 'Waidwundschuss'        // Bauchraum - SCHLECHT
  | 'Keulenschuss'          // Hinterkeule - MITTEL
  | 'Hauptschuss'           // Kopf - OPTIMAL (wenn getroffen)
  | 'Fehlschuss'            // Vorbei
  | 'Streifschuss';         // Nur gestreift
```

#### 3.2 KI-Bildanalyse (Anschusszeichen-Foto)
**ML-Model**: EfficientNet-B3 (Image Classification)

**Input**: Foto von Anschusszeichen (Blut, Haare, Wildpret)

**Output**:
- Blutfarbe-Klassifikation (Hellrot/Dunkelrot/Bräunlich/Schaumig)
- Blutmenge-Schätzung (Wenig/Mittel/Viel)
- Haare erkannt (Ja/Nein + Typ)
- Wildpret erkannt (Ja/Nein + Typ)
- Confidence Scores

**Training Data**: 10,000+ annotierte Anschusszeichen-Fotos

---

### 4. Nachsuche-Empfehlungen & Strategie

#### 4.1 Nachsuche-Assistent
```typescript
interface NachsucheEmpfehlung {
  // Sofort-Bewertung
  sofortNachsuche: boolean;
  wartezeit: number;                // Minuten
  dringlichkeit: 'Sofort' | 'Kurz' | 'Normal' | 'Lang';
  
  // Strategie
  strategie: {
    typ: 'Schweißhund' | 'Totsuche' | 'Riemensuche' | 'Stöbern' | 'Abwarten';
    beschreibung: string;
    schritte: string[];
  };
  
  // Wartezeiten-Empfehlung
  wartezeit_detail: {
    minimum: number;               // Minuten
    optimal: number;
    maximum: number;
    begründung: string;
  };
  
  // Hunde-Empfehlung
  hundeEmpfehlung: {
    benötigt: boolean;
    typ: 'Schweißhund' | 'Totsuche' | 'Stöberhund' | 'Vorstehhund';
    begründung: string;
    dringlichkeit: 'Sofort' | 'Falls_erfolglos' | 'Optional';
  };
  
  // Suchgebiet
  suchgebiet: {
    startpunkt: GeoPoint;
    radius: number;                // Meter
    richtung: number;              // 0-360° (Fluchtrichtung)
    ausdehnung: {
      nach_0h: number;             // Meter
      nach_1h: number;
      nach_3h: number;
      nach_6h: number;
      nach_12h: number;
      nach_24h: number;
    };
    
    // Karte mit Wahrscheinlichkeits-Heatmap
    wahrscheinlichkeitsZonen: Array<{
      polygon: GeoPoint[];
      wahrscheinlichkeit: number; // 0-100%
      priorität: number;          // 1-5
    }>;
  };
  
  // Rechtliche Pflichten
  rechtlichePflicht: {
    nachsuchePflicht: boolean;
    meldefrist: number;            // Stunden
    jagdgenossenschaft: boolean;   // Meldung erforderlich?
    nachbarrevier: boolean;        // Absprache erforderlich?
  };
  
  // Dokumentation
  dokumentationsHinweise: {
    fotos_machen: string[];        // ["Anschuss", "Pirschzeichen", "Fundort"]
    notizen_erfassen: string[];    // ["Uhrzeit", "Wetter", "Reaktion"]
    zeugen: boolean;               // Zeugen benennen?
  };
  
  // Wetter-Einfluss
  wetterEinfluss: {
    regen: boolean;                // Erschwert Nachsuche?
    wind: string;                  // Hinweise
    temperatur: string;
    sichtVerhältnisse: string;
  };
  
  // Erfolgswahrscheinlichkeit
  prognose: {
    bergungWahrscheinlichkeit: number; // 0-100%
    zeitbisAuffinden: number;          // Stunden (geschätzt)
    zustand: 'Verendet' | 'Flüchtig' | 'Unbekannt';
  };
}
```

#### 4.2 Trefferlage → Wartezeit Matrix

**Blattschuss (Lunge/Herz)**:
- ⏱️ Wartezeit: 15-30 Min
- 🐕 Hund: Nicht zwingend (Totsuche OK)
- 📍 Fluchtweite: 50-200m
- ✅ Prognose: 95%+ Bergung

**Lebertreffer**:
- ⏱️ Wartezeit: 3-6 Stunden
- 🐕 Hund: Schweißhund empfohlen
- 📍 Fluchtweite: 500-2000m
- ✅ Prognose: 80% Bergung

**Pansenschuss / Waidwund**:
- ⏱️ Wartezeit: 12-24 Stunden!
- 🐕 Hund: Schweißhund zwingend
- 📍 Fluchtweite: 1000-5000m (kann sehr weit)
- ⚠️ Prognose: 40-60% Bergung

**Laufschuss**:
- ⏱️ Wartezeit: Situationsabhängig (oft sofort)
- 🐕 Hund: Falls nicht sofort gefunden
- 📍 Fluchtweite: Variabel (kann sehr weit)
- ⚠️ Prognose: 30-50% Bergung (oft Verhitzen)

**Keulenschuss**:
- ⏱️ Wartezeit: 1-3 Stunden
- 🐕 Hund: Empfohlen
- 📍 Fluchtweite: 300-1000m
- ✅ Prognose: 70% Bergung

---

### 5. Bestandsentwicklung & Population Tracking

**Ziel**: Wildbestände langfristig tracken und Trends erkennen

```typescript
interface BestandsentwicklungAnalyse {
  wildart: WildArt;
  revier_id: string;
  zeitraum: {
    von: Date;
    bis: Date;
  };
  
  // Basis-Daten
  aktueller_bestand: {
    geschätzt: number;
    confidence_interval: [number, number]; // [min, max]
    methode: 'Jagdstatistik' | 'Scheinwerferzählung' | 'Wildkamera' | 'KI-Schätzung';
    letzteZählung: Date;
  };
  
  // Entwicklung
  trend: {
    richtung: 'Steigend' | 'Stabil' | 'Fallend';
    änderungsrate: number;          // % pro Jahr
    signifikanz: number;            // 0-100% (statistisch)
  };
  
  // Altersstruktur
  altersstruktur: {
    jung: number;                   // % (0-1 Jahr)
    mittel: number;                 // % (1-3 Jahre)
    alt: number;                    // % (3+ Jahre)
    geschlechtsVerhältnis: number;  // Männlich/Weiblich Ratio
  };
  
  // Abschuss-Statistik
  abschussStatistik: {
    gesamt: number;
    nachWildart: Record<WildArt, number>;
    nachGeschlecht: {
      männlich: number;
      weiblich: number;
    };
    nachAlter: {
      jung: number;
      mittel: number;
      alt: number;
    };
    erfüllungsgrad: number;         // % von Abschussplan
  };
  
  // Reproduktionsrate
  reproduktion: {
    setzrate: number;               // Kitze pro Ricke / Kälber pro Tier
    überlebensrate_jung: number;    // % überleben 1. Jahr
    zuwachsrate: number;            // % Bestandszuwachs
  };
  
  // Verluste
  verluste: {
    fallwild: number;
    verkehr: number;
    krankheit: number;
    prädation: number;              // Wolf, Luchs
    sonstige: number;
  };
  
  // Prognose
  prognose: {
    nächstesSaisonjahr: number;     // Geschätzter Bestand
    in_3_jahren: number;
    in_5_jahren: number;
    trendFortsetzung: boolean;      // Trend setzt sich fort?
  };
  
  // Abschussplan-Empfehlung
  abschussplanEmpfehlung: {
    gesamt: number;
    männlich: number;
    weiblich: number;
    jung: number;
    begründung: string;
    ziel: 'Reduktion' | 'Stabilisierung' | 'Aufbau';
  };
}
```

**ML-Algorithmus**: Time Series Forecasting (ARIMA / Prophet)
- Input: Historische Daten (5-10 Jahre)
- Output: Trend + 3-Jahres-Prognose
- Accuracy Target: 80%+ für Haupt-Schalenwild

---

### 6. Hotspot-Prediction & Jagdplanung-Assistent

**Ziel**: Beste Jagdorte/-zeiten KI-gestützt empfehlen

```typescript
interface JagdplanungsEmpfehlung {
  datum: Date;
  revier_id: string;
  
  // Top Empfehlungen
  empfehlungen: Array<{
    rang: number;
    
    // Ort
    poi: POI;
    standort: {
      typ: 'Hochsitz' | 'Kanzel' | 'Ansitz' | 'Pirschweg';
      name: string;
      coordinates: GeoPoint;
    };
    
    // Zeit
    zeitfenster: {
      von: Date;
      bis: Date;
      dauer: number;               // Minuten
    };
    
    // Zielwild
    erwarteteWildarten: Array<{
      wildart: WildArt;
      wahrscheinlichkeit: number;  // 0-100%
      geschätzteAnzahl: number;
      qualität: 'Trophäe' | 'Normal' | 'Jung';
    }>;
    
    // Score
    gesamtScore: number;           // 0-100
    scoreBreakdown: {
      wetterScore: number;
      historischerErfolg: number;
      wildaktivität: number;
      mondphase: number;
      saisonFaktor: number;
    };
    
    // Wetter
    wetterPrognose: {
      temperatur: number;
      windrichtung: number;
      windstärke: number;
      niederschlag: number;
      sicht: string;
    };
    
    // Wind-Taktik
    windTaktik: {
      hauptWindrichtung: number;    // 0-360°
      anschussRichtung: number[];   // Empfohlene Schussrichtungen
      warnung?: string;             // Bei ungünstigem Wind
    };
    
    // Erfolgschance
    erfolgswahrscheinlichkeit: number; // 0-100%
    
    // Begründung
    begründung: string[];
    
    // Alternativen
    alternativeZeiten: Date[];
  }>;
  
  // Tages-Übersicht
  tagesStrategie: {
    morgenjagd: boolean;
    mittagsjagd: boolean;
    abendjagd: boolean;
    nachtansitz: boolean;
    optimaleDauer: number;          // Stunden
  };
  
  // Revierweit
  revierAktivität: {
    gesamt: number;                 // 0-100
    nachGebiet: Record<string, number>;
    hotspots: GeoPoint[];
  };
}
```

**ML-Algorithmus**: Gradient Boosting (XGBoost)
- Input: 50+ Features (Wetter, Historie, POI-Daten, Zeitpunkt, etc.)
- Output: Score 0-100 für jeden POI zu jeder Stunde
- Training: Historical Success Data (Abschüsse vs. Nullansitze)

---

## 🗄️ DATABASE SCHEMA

### Neue Tabellen

```sql
-- 1. Weather Correlation Data
CREATE TABLE weather_correlation (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT NOT NULL,
  
  -- Zeitraum
  datum DATE NOT NULL,
  stunde INTEGER NOT NULL,              -- 0-23
  
  -- Wetter
  temperatur REAL,
  luftdruck REAL,
  luftfeuchtigkeit REAL,
  niederschlag REAL,
  windgeschwindigkeit REAL,
  windrichtung REAL,
  bewölkung REAL,
  mondphase REAL,
  
  -- Aktivität (gemessen)
  aktivität_score REAL,                 -- 0-100
  sichtungen INTEGER DEFAULT 0,
  abschüsse INTEGER DEFAULT 0,
  wildkamera_detections INTEGER DEFAULT 0,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_weather_corr_revier_wildart ON weather_correlation(revier_id, wildart, datum);
CREATE INDEX idx_weather_corr_datum ON weather_correlation(datum, stunde);


-- 2. Movement Patterns (Wildwechsel)
CREATE TABLE movement_patterns (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT NOT NULL,
  
  -- Route
  von_poi_id TEXT,
  nach_poi_id TEXT,
  
  -- Statistik
  häufigkeit INTEGER DEFAULT 1,
  letzte_beobachtung DATETIME,
  durchschnitt_dauer INTEGER,           -- Minuten
  
  -- Zeitliche Muster
  bevorzugte_stunden TEXT,              -- JSON Array [5,6,7,18,19,20]
  bevorzugte_wochentage TEXT,           -- JSON Array [1,2,6]
  bevorzugte_monate TEXT,               -- JSON Array [5,6,9,10]
  
  -- Vorhersage-Daten
  wahrscheinlichkeit REAL,              -- 0-1
  confidence REAL,                      -- 0-1
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE,
  FOREIGN KEY (von_poi_id) REFERENCES pois(id) ON DELETE SET NULL,
  FOREIGN KEY (nach_poi_id) REFERENCES pois(id) ON DELETE SET NULL
);

CREATE INDEX idx_movement_patterns_revier ON movement_patterns(revier_id, wildart);
CREATE INDEX idx_movement_patterns_route ON movement_patterns(von_poi_id, nach_poi_id);


-- 3. Shot Analysis (Anschuss-Erkennung)
CREATE TABLE shot_analysis (
  id TEXT PRIMARY KEY,
  jagd_id TEXT,
  abschuss_id TEXT,                     -- Falls erfolgreich geborgen
  user_id TEXT NOT NULL,
  revier_id TEXT NOT NULL,
  
  -- Basis
  wildart TEXT NOT NULL,
  geschätzte_entfernung REAL,           -- Meter
  schuss_zeitpunkt DATETIME NOT NULL,
  schuss_richtung REAL,                 -- 0-360°
  location_lat REAL,
  location_lng REAL,
  
  -- Schuss-Details
  schussplatzierung_ziel TEXT,          -- 'Blatt', 'Träger', etc.
  getroffen BOOLEAN,
  
  -- Wild-Reaktion
  reaktion_typ TEXT,                    -- 'Zusammenbruch', 'Flucht', etc.
  reaktion_richtung REAL,
  reaktion_geschwindigkeit TEXT,
  lautäußerung TEXT,
  verhalten TEXT,                       -- JSON Array
  
  -- Pirschzeichen
  blut_vorhanden BOOLEAN DEFAULT FALSE,
  blut_farbe TEXT,                      -- 'Hellrot', 'Dunkelrot', etc.
  blut_menge TEXT,
  blut_verteilung TEXT,
  blut_höhe TEXT,
  
  -- Schweiß-Details
  lungenblut BOOLEAN DEFAULT FALSE,
  lebertreffer BOOLEAN DEFAULT FALSE,
  nierenschuss BOOLEAN DEFAULT FALSE,
  pansenschuss BOOLEAN DEFAULT FALSE,
  knochenschuss BOOLEAN DEFAULT FALSE,
  
  -- Sonstige Zeichen
  haare_vorhanden BOOLEAN DEFAULT FALSE,
  haare_typ TEXT,
  wildpret_vorhanden BOOLEAN DEFAULT FALSE,
  wildpret_typ TEXT,
  fährte_gesehen BOOLEAN DEFAULT FALSE,
  fährte_auffälligkeiten TEXT,          -- JSON Array
  
  -- KI-Analyse
  ki_analyse_bild_uri TEXT,
  ki_blutfarbe TEXT,
  ki_blutmenge TEXT,
  ki_haare_erkannt BOOLEAN,
  ki_wildpret_erkannt BOOLEAN,
  ki_confidence REAL,
  
  -- Trefferlage-Diagnose
  hauptdiagnose TEXT NOT NULL,          -- 'Blattschuss', 'Lebertreffer', etc.
  hauptdiagnose_wahrscheinlichkeit REAL,
  alternativ_diagnosen TEXT,            -- JSON Array
  diagnose_begründung TEXT,             -- JSON Array
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (jagd_id) REFERENCES jagden(id) ON DELETE SET NULL,
  FOREIGN KEY (abschuss_id) REFERENCES abschuesse(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_shot_analysis_revier ON shot_analysis(revier_id, wildart);
CREATE INDEX idx_shot_analysis_user ON shot_analysis(user_id, created_at);
CREATE INDEX idx_shot_analysis_diagnose ON shot_analysis(hauptdiagnose);


-- 4. Nachsuche Tracking
CREATE TABLE nachsuche_tracking (
  id TEXT PRIMARY KEY,
  shot_analysis_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  revier_id TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL,                 -- 'Geplant', 'Aktiv', 'Erfolgreich', 'Erfolglos', 'Abgebrochen'
  
  -- Empfehlung (initial)
  empfohlene_wartezeit INTEGER,         -- Minuten
  empfohlene_strategie TEXT,
  hund_empfohlen BOOLEAN,
  hund_typ TEXT,
  
  -- Durchführung
  tatsächliche_wartezeit INTEGER,
  start_zeitpunkt DATETIME,
  ende_zeitpunkt DATETIME,
  dauer_minuten INTEGER,
  
  -- Hunde-Einsatz
  hund_eingesetzt BOOLEAN DEFAULT FALSE,
  hund_art TEXT,
  hund_name TEXT,
  hundeführer TEXT,
  
  -- Suchgebiet
  startpunkt_lat REAL,
  startpunkt_lng REAL,
  fluchtrichtung REAL,                  -- 0-360°
  gesuchter_radius REAL,                -- Meter
  
  -- Tracking-Punkte (Route)
  tracking_punkte TEXT,                 -- JSON Array von {lat, lng, zeitpunkt, notiz}
  
  -- Fundort
  gefunden BOOLEAN DEFAULT FALSE,
  fundort_lat REAL,
  fundort_lng REAL,
  entfernung_vom_anschuss REAL,         -- Meter
  zustand TEXT,                         -- 'Verendet', 'Noch_lebend'
  
  -- Pirschzeichen während Nachsuche
  gefundene_zeichen TEXT,               -- JSON Array
  
  -- Ergebnis
  erfolgreich BOOLEAN,
  wild_geborgen BOOLEAN,
  abbruch_grund TEXT,
  
  -- Dokumentation
  fotos TEXT,                           -- JSON Array URIs
  notizen TEXT,
  
  -- Rechtlich
  jagdgenossenschaft_informiert BOOLEAN,
  nachbarrevier_informiert BOOLEAN,
  meldung_behörde BOOLEAN,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (shot_analysis_id) REFERENCES shot_analysis(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_nachsuche_shot ON nachsuche_tracking(shot_analysis_id);
CREATE INDEX idx_nachsuche_status ON nachsuche_tracking(status, created_at);
CREATE INDEX idx_nachsuche_user ON nachsuche_tracking(user_id, revier_id);


-- 5. Population Tracking
CREATE TABLE population_tracking (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT NOT NULL,
  
  -- Zeitraum
  jahr INTEGER NOT NULL,
  saison TEXT,                          -- 'Frühjahr', 'Sommer', 'Herbst', 'Winter'
  
  -- Bestand
  geschätzter_bestand INTEGER,
  confidence_min INTEGER,
  confidence_max INTEGER,
  zählmethode TEXT,
  zähldatum DATE,
  
  -- Entwicklung
  trend TEXT,                           -- 'Steigend', 'Stabil', 'Fallend'
  änderungsrate REAL,                   -- %
  
  -- Altersstruktur
  anteil_jung REAL,                     -- %
  anteil_mittel REAL,
  anteil_alt REAL,
  geschlechts_verhältnis REAL,          -- m/w Ratio
  
  -- Abschuss
  abschüsse_gesamt INTEGER DEFAULT 0,
  abschüsse_männlich INTEGER DEFAULT 0,
  abschüsse_weiblich INTEGER DEFAULT 0,
  abschüsse_jung INTEGER DEFAULT 0,
  abschussplan_erfüllung REAL,          -- %
  
  -- Reproduktion
  setzrate REAL,
  überlebensrate_jung REAL,
  zuwachsrate REAL,
  
  -- Verluste
  fallwild INTEGER DEFAULT 0,
  verkehrsopfer INTEGER DEFAULT 0,
  krankheit INTEGER DEFAULT 0,
  prädation INTEGER DEFAULT 0,
  
  -- Prognose
  prognose_nächstes_jahr INTEGER,
  prognose_3_jahre INTEGER,
  prognose_5_jahre INTEGER,
  
  -- Abschussplan-Empfehlung
  empfohlener_abschuss_gesamt INTEGER,
  empfohlener_abschuss_männlich INTEGER,
  empfohlener_abschuss_weiblich INTEGER,
  empfohlener_abschuss_jung INTEGER,
  abschussplan_ziel TEXT,               -- 'Reduktion', 'Stabilisierung', 'Aufbau'
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE,
  
  UNIQUE(revier_id, wildart, jahr, saison)
);

CREATE INDEX idx_population_revier ON population_tracking(revier_id, wildart);
CREATE INDEX idx_population_jahr ON population_tracking(jahr, saison);


-- 6. Predictions Cache
CREATE TABLE predictions_cache (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT,
  
  -- Typ
  prediction_type TEXT NOT NULL,        -- 'Wildaktivität', 'Bewegung', 'Hotspot', 'Jagdplanung'
  
  -- Zeitraum
  gültig_von DATETIME NOT NULL,
  gültig_bis DATETIME NOT NULL,
  
  -- Daten (JSON)
  prediction_data TEXT NOT NULL,        -- JSON mit spezifischen Vorhersage-Daten
  
  -- Qualität
  confidence REAL,
  accuracy_historical REAL,             -- Wenn verfügbar
  
  -- ML-Model
  model_version TEXT,
  model_name TEXT,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_predictions_revier ON predictions_cache(revier_id, wildart, prediction_type);
CREATE INDEX idx_predictions_gültig ON predictions_cache(gültig_von, gültig_bis);
```

---

## 🧠 ML-MODELS ÜBERSICHT

### Model 1: Weather Activity Correlation
- **Typ**: Random Forest Regression
- **Input**: 24 Features (Wetter + Zeit + Revier)
- **Output**: Aktivitäts-Score 0-100
- **Training**: 100,000+ Datenpunkte (Wetter × Sichtungen)
- **Accuracy Target**: 75%+ R²

### Model 2: Movement Pattern Prediction
- **Typ**: LSTM (Long Short-Term Memory)
- **Input**: 90 Tage Historie (Sequenz)
- **Output**: 7 Tage Vorhersage (stündlich)
- **Training**: 50,000+ Bewegungssequenzen
- **Accuracy Target**: 70%+ Hit Rate

### Model 3: Shot Analysis Classification
- **Typ**: Gradient Boosting (XGBoost)
- **Input**: 30+ Features (Pirschzeichen + Reaktion)
- **Output**: Trefferlage (12 Klassen)
- **Training**: 20,000+ Anschuss-Fälle
- **Accuracy Target**: 85%+ (Top-1), 95%+ (Top-3)

### Model 4: Blood/Hair Image Recognition
- **Typ**: EfficientNet-B3 (CNN)
- **Input**: Foto (Anschusszeichen)
- **Output**: Blutfarbe, Menge, Haare, Wildpret
- **Training**: 10,000+ annotierte Bilder
- **Accuracy Target**: 90%+ pro Klasse

### Model 5: Population Forecasting
- **Typ**: Prophet / ARIMA
- **Input**: 5-10 Jahre Zeitreihe
- **Output**: 3-Jahres-Prognose
- **Training**: 1,000+ Reviere × Jahre
- **Accuracy Target**: 80%+ MAPE

### Model 6: Hunting Success Prediction
- **Typ**: XGBoost
- **Input**: 50+ Features (POI + Wetter + Zeit + Historie)
- **Output**: Erfolgs-Score 0-100
- **Training**: 200,000+ Jagd-Outcomes
- **Accuracy Target**: 75%+ AUC

---

## 📱 UI SCREENS (5 neue Screens)

### Screen 1: Analytics Dashboard
- Wildaktivität heute (Live)
- Top 3 Hotspots (mit Scores)
- Wettereinfluss Übersicht
- Bestandsentwicklung Chart (Trend)
- Quick Actions (Jagdplanung starten)

### Screen 2: Jagdplanungs-Assistent
- Datum/Uhrzeit Picker
- Top Empfehlungen (Karten mit Scores)
- Detail-Cards (POI + Zeit + Wetter + Wild)
- Alternative Zeiten
- Zu Kalender hinzufügen

### Screen 3: Anschuss-Dokumentation
- Schnelleingabe (Reaktion des Wildes)
- Pirschzeichen-Checkliste (Blut, Haare, etc.)
- Foto-Upload (KI-Analyse)
- Trefferlage-Diagnose (automatisch)
- Nachsuche-Empfehlung (sofort)

### Screen 4: Nachsuche-Assistent
- Empfehlung anzeigen (Wartezeit, Strategie, Hund)
- Live-Tracking (GPS-Route aufzeichnen)
- Fundpunkte markieren (Pirschzeichen)
- Suchgebiet-Karte (Wahrscheinlichkeits-Heatmap)
- Erfolg/Abbruch dokumentieren

### Screen 5: Bestandsentwicklung
- Zeitraum-Filter (Jahr/Saison)
- Trend-Chart (5 Jahre)
- Altersstruktur (Pie Chart)
- Abschuss-Statistik (Balken)
- Prognose (nächste 3 Jahre)
- Abschussplan-Empfehlung

---

## 📊 BUSINESS METRICS

### KPIs
- **Jagd-Erfolgsrate**: +40% (durch bessere Planung)
- **Nachsuche-Erfolgsrate**: +60% (durch optimierte Strategie)
- **Zeit bis Bergung**: -50% (schnellere Auffindung)
- **Premium Conversions**: +25% (durch Advanced Features)
- **User Engagement**: +35% (durch Predictions)

### Revenue Impact
- **Premium Tier**: €14.99/Monat (+€2 vs. Standard)
- **Revier Tier**: €149/Monat (+€30 vs. Standard)
- **Target**: 40% aller User nutzen Advanced Analytics
- **Projected ARR Increase**: +€180k (Year 1)

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 8A: Wetterkorrelation (3 Wochen)
- Week 1: Weather API Integration, Data Collection
- Week 2: ML Model Training (Random Forest)
- Week 3: UI Dashboard, Testing

### Phase 8B: Anschuss-Erkennung (3 Wochen)
- Week 1: Shot Analysis Types + Database
- Week 2: Classification Model + Image Recognition
- Week 3: UI Screens (Anschuss + Nachsuche), Testing

### Phase 8C: Predictions & Planning (4 Wochen)
- Week 1-2: Movement Patterns, Population Tracking
- Week 3: Hunting Success Model, Jagdplanungs-Assistent
- Week 4: Integration, Testing, Optimization

**Total**: 10 Wochen

---

## 💰 BUDGET BREAKDOWN

- **ML Model Development**: €25,000
  * Weather Correlation: €5k
  * Shot Analysis: €8k
  * Movement Patterns: €7k
  * Success Prediction: €5k

- **Data Acquisition**: €8,000
  * Anschuss-Fotos (10k): €5k
  * Weather Historical Data: €3k

- **Development**: €20,000
  * Backend Services: €8k
  * UI Screens: €8k
  * Integration & Testing: €4k

- **Infrastructure**: €7,000
  * Cloud ML Training: €4k
  * API Costs (Weather): €3k

**Total**: €60,000

---

## ✅ SUCCESS CRITERIA

1. ✅ Wetterkorrelation-Model: 75%+ R² Score
2. ✅ Anschuss-Diagnose: 85%+ Accuracy (Top-1)
3. ✅ Nachsuche-Erfolgsrate: +50% vs. ohne Assistent
4. ✅ Jagdplanungs-Empfehlungen: 70%+ User-Zufriedenheit
5. ✅ Population-Prognose: 80%+ MAPE
6. ✅ Premium-Conversions: +20%+ durch Phase 8

---

**Status**: Spezifikation Complete ✅  
**Next**: TypeScript Types + Database Migration + Service Layer
**Goal**: Launch Q2 2026 🚀
