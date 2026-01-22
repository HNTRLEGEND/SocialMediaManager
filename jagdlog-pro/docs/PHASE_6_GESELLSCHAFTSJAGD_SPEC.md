# PHASE 6: GESELLSCHAFTSJAGD MANAGEMENT
**HNTR LEGEND Pro - Collaborative Hunting & Group Management**

**Status:** 🚀 **IN DEVELOPMENT**  
**Date:** 2026-01-22  
**Version:** 1.0.0  
**Timeline:** 8-10 Wochen  

---

## 🎯 VISION STATEMENT

**"Gemeinsam jagen, gemeinsam erfolgreich - die komplette digitale Lösung für Gesellschaftsjagden."**

Gesellschaftsjagden (Drückjagd, Treibjagd, Bewegungsjagd) sind komplex:
- 👥 **10-50 Teilnehmer** koordinieren
- 📍 **20-100 Standorte** zuweisen
- 📡 **Echtzeit-Kommunikation** während Jagd
- 🎯 **Strecke gemeinsam** dokumentieren
- 📊 **Statistiken & Auswertung** erstellen
- ⚖️ **Gesetzliche Vorgaben** einhalten

**HNTR LEGEND Pro macht das alles digital, einfach und rechtssicher.**

---

## 🔍 FEATURE BREAKDOWN

### **1. JAGD-PLANUNG & ERSTELLUNG**

#### 1.1 Jagd-Event anlegen

```typescript
interface Gesellschaftsjagd {
  id: string;
  revierId: string;
  
  // Basis-Informationen
  name: string;                    // "Drückjagd Hauptrevier 2026"
  typ: JagdTyp;
  datum: Date;
  
  // Zeitplan
  zeitplan: {
    sammeln: Date;                 // 07:00 Sammeln
    ansprechen: Date;              // 07:30 Besprechung
    jagdBeginn: Date;              // 08:00 Jagdbeginn
    jagdEnde: Date;                // 13:00 Jagdende
    streckeZeigen: Date;           // 14:00 Strecke legen
  };
  
  // Teilnehmer
  jagdleiter: string;              // User-ID
  teilnehmer: Teilnehmer[];
  maxTeilnehmer: number;           // Limit
  anmeldeschluss?: Date;
  
  // Standorte
  standorte: JagdStandort[];
  standortZuweisungen: StandortZuweisung[];
  
  // Treiben/Treiber
  treiben?: Treiben[];
  treiber: Treiber[];
  
  // Sicherheit
  sicherheit: {
    notfallkontakt: string;
    sammelplatz: GPSKoordinaten;
    notfallplan: string;
  };
  
  // Regeln & Vorgaben
  regeln: {
    wildarten: string[];           // Welche Wildarten bejagt werden
    schussrichtungen: string[];    // Erlaubte Schussrichtungen
    schussEntfernung: number;      // Max. Schussentfernung (m)
    besondereVorschriften: string;
  };
  
  // Strecke
  strecke: StreckeListe;
  
  // Status
  status: 'geplant' | 'aktiv' | 'abgeschlossen' | 'abgesagt';
  
  // Metadaten
  erstelltVon: string;
  erstelltAm: Date;
  aktualisiertAm: Date;
}

type JagdTyp = 
  | 'drueckjagd'          // Drückjagd mit Hunden
  | 'treibjagd'           // Treibjagd ohne Hunde
  | 'bewegungsjagd'       // Bewegungsjagd
  | 'ansitzjagd_gruppe'   // Gemeinschaftlicher Ansitz
  | 'riegeljagd'          // Riegeljagd
  | 'sonstiges';
```

#### 1.2 Teilnehmer-Management

```typescript
interface Teilnehmer {
  id: string;
  jagdId: string;
  
  // Person
  userId?: string;               // Wenn registrierter User
  name: string;
  telefon: string;
  email?: string;
  
  // Rolle
  rolle: TeilnehmerRolle;
  
  // Ausrüstung
  ausruestung: {
    waffe: string;                 // "Repetierbüchse .308"
    optik: string;                 // "Zielfernrohr 3-12x56"
    munition: string;              // "180gr Teilmantel"
    signalweste: boolean;
    funkgeraet: boolean;
  };
  
  // Jagderfahrung
  erfahrung: {
    jahreSeit: number;
    gesellschaftsjagdenAnzahl: number;
    standortPraeferenz?: 'hochsitz' | 'bodensitz' | 'treiber';
  };
  
  // Status
  anmeldung: {
    status: 'eingeladen' | 'zugesagt' | 'abgesagt' | 'warteliste';
    angemeldetAm?: Date;
    kommentar?: string;
  };
  
  // Standort-Zuweisung
  zugewiesenerStandort?: string; // Standort-ID
  
  // Während Jagd
  liveStatus?: {
    amStandort: boolean;
    letzteAktivitaet: Date;
    gps?: GPSKoordinaten;        // Opt-in für Sicherheit
  };
  
  // Strecke
  abschuesse: string[];          // Abschuss-IDs
}

type TeilnehmerRolle = 
  | 'jagdleiter'
  | 'schuetze'
  | 'treiber'
  | 'hundefuehrer'
  | 'ansteller'
  | 'bergehelfer'
  | 'sanitaeter';
```

#### 1.3 Standort-Verwaltung

```typescript
interface JagdStandort {
  id: string;
  jagdId: string;
  
  // Identifikation
  nummer: number;                // 1, 2, 3, ...
  name?: string;                 // "Hochsitz am Nordrand"
  typ: StandortTyp;
  
  // Position
  gps: GPSKoordinaten;
  hoehe?: number;                // Höhenmeter
  poiId?: string;                // Verknüpfung zu POI (falls vorhanden)
  
  // Beschreibung
  beschreibung?: string;
  zugang: string;                // "Von Waldweg 100m Richtung Norden"
  orientierung: number;          // Grad (0-360)
  
  // Sicherheit
  sicherheit: {
    schussrichtungen: number[];  // Erlaubte Richtungen in Grad
    gefahrenbereiche: Polygon[]; // Keine Schüsse dorthin
    sichtfeld: {
      winkel: number;            // Grad
      reichweite: number;        // Meter
    };
  };
  
  // Eigenschaften
  eigenschaften: {
    ueberdacht: boolean;
    beheizt: boolean;
    kapazitaet: number;          // Anzahl Personen
    barrierefrei: boolean;
    ansitzleiter: boolean;       // Für ältere Jäger geeignet
  };
  
  // Status
  status: 'verfuegbar' | 'besetzt' | 'gesperrt';
  zugewiesenePersonen: string[]; // Teilnehmer-IDs
  
  // Historische Daten (aus bisherigen Jagden)
  historie?: {
    haeufigsteWildart: string;
    durchschnittAbschuesse: number;
    erfolgreicheJagden: number;
    totalJagden: number;
  };
}

type StandortTyp = 
  | 'hochsitz'
  | 'bodensitz'
  | 'kanzel'
  | 'ansitzleiter'
  | 'druckposten'
  | 'treiberlinie';

interface StandortZuweisung {
  id: string;
  jagdId: string;
  standortId: string;
  teilnehmerId: string;
  
  // Zuweisung
  zugewiesenVon: string;         // User-ID (Jagdleiter)
  zugewiesenAm: Date;
  prioritaet: number;            // 1 = Erstwahl
  
  // Bestätigung
  bestaetigt: boolean;
  bestaeligtAm?: Date;
  
  // Notizen
  notizen?: string;              // "Bitte leise anstellen, Rehwild in der Nähe"
}
```

#### 1.4 Treiben-Planung

```typescript
interface Treiben {
  id: string;
  jagdId: string;
  
  // Identifikation
  nummer: number;                // 1. Treiben, 2. Treiben, ...
  name: string;                  // "Nordwald"
  
  // Zeitplan
  start: Date;
  geschaetzteDauer: number;      // Minuten
  ende?: Date;                   // Tatsächliches Ende
  
  // Gebiet
  treibgebiet: Polygon;          // Welches Gebiet wird getrieben
  richtung: number;              // Hauptrichtung in Grad
  
  // Treiber
  treiber: string[];             // Teilnehmer-IDs
  hundefuehrer: string[];
  
  // Schützen (welche Standorte aktiv)
  aktivStandorte: string[];      // Standort-IDs
  
  // Während Treiben
  status: 'geplant' | 'laufend' | 'abgeschlossen' | 'abgebrochen';
  
  // Ergebnis
  ergebnis?: {
    dauer: number;               // Tatsächliche Dauer in Minuten
    abschuesse: string[];        // Abschuss-IDs
    besonderheiten: string;
  };
}

interface Treiber {
  teilnehmerId: string;
  position: 'links' | 'mitte' | 'rechts' | 'flanke';
  abstand: number;               // Meter zum nächsten Treiber
  hundeeinsatz: boolean;
}
```

---

### **2. ECHTZEIT-KOMMUNIKATION**

#### 2.1 Live-Updates während Jagd

```typescript
interface LiveJagdSession {
  jagdId: string;
  
  // WebSocket/Firebase Connection
  connection: {
    status: 'connected' | 'disconnected' | 'reconnecting';
    lastPing: Date;
  };
  
  // Live-Daten
  aktiveTeilnehmer: Array<{
    teilnehmerId: string;
    name: string;
    standortId: string;
    status: 'am_standort' | 'unterwegs' | 'offline';
    letzteAktivitaet: Date;
    gps?: GPSKoordinaten;        // Opt-in
  }>;
  
  // Live-Events
  events: LiveEvent[];
}

interface LiveEvent {
  id: string;
  jagdId: string;
  typ: LiveEventTyp;
  zeitpunkt: Date;
  von: string;                   // Teilnehmer-ID
  
  // Event-spezifische Daten
  daten: any;
  
  // Sichtbarkeit
  sichtbarFuer: 'alle' | 'jagdleiter' | 'schuetzen' | 'treiber';
}

type LiveEventTyp = 
  | 'abschuss'                   // Schütze hat geschossen
  | 'nachsuche'                  // Nachsuche erforderlich
  | 'wildsichtung'               // Wild gesichtet
  | 'standort_erreicht'          // Am Standort angekommen
  | 'treiben_start'              // Treiben beginnt
  | 'treiben_ende'               // Treiben beendet
  | 'notfall'                    // Notfall!
  | 'nachricht'                  // Allgemeine Nachricht
  | 'pause'                      // Pause/Sammeln
  | 'jagd_ende';                 // Jagd beendet

// Beispiel: Abschuss-Event
interface AbschussEvent extends LiveEvent {
  typ: 'abschuss';
  daten: {
    wildart: string;
    geschlecht?: 'männlich' | 'weiblich' | 'unbekannt';
    standortId: string;
    gps: GPSKoordinaten;
    zeitpunkt: Date;
    nachsuche: boolean;
    bemerkung?: string;
  };
}

// Beispiel: Wildsichtung
interface WildsichtungEvent extends LiveEvent {
  typ: 'wildsichtung';
  daten: {
    wildart: string;
    anzahl: number;
    richtung: number;             // Grad
    entfernung: number;           // Meter
    bewegungsrichtung?: number;
    foto?: string;
  };
}

// Beispiel: Notfall
interface NotfallEvent extends LiveEvent {
  typ: 'notfall';
  daten: {
    art: 'unfall' | 'verletzung' | 'verirrung' | 'sonstiges';
    gps: GPSKoordinaten;
    beschreibung: string;
    schweregrad: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
    hilfeBenötigt: boolean;
  };
}
```

#### 2.2 Kommunikations-Channels

```typescript
interface KommunikationsKanal {
  jagdId: string;
  
  // Kanäle
  kanaele: {
    hauptKanal: Channel;         // Alle Teilnehmer
    jagdleitung: Channel;        // Nur Jagdleiter + Assistenten
    schuetzen: Channel;          // Nur Schützen
    treiber: Channel;            // Nur Treiber
    notfall: Channel;            // Notfall-Kanal (Priorität)
  };
}

interface Channel {
  id: string;
  name: string;
  teilnehmer: string[];
  
  // Nachrichten
  nachrichten: Nachricht[];
  
  // Einstellungen
  muteAble: boolean;
  prioritaet: 'normal' | 'hoch' | 'kritisch';
}

interface Nachricht {
  id: string;
  channelId: string;
  von: string;                   // Teilnehmer-ID
  zeitpunkt: Date;
  
  // Inhalt
  typ: 'text' | 'audio' | 'bild' | 'standort';
  inhalt: string | AudioBlob | ImageURI | GPSKoordinaten;
  
  // Status
  gelesen: Array<{
    teilnehmerId: string;
    gelesenAm: Date;
  }>;
  
  // Priorität
  prioritaet: 'normal' | 'wichtig' | 'dringend';
  
  // Reply-Thread
  antwortAuf?: string;           // Nachrichten-ID
}
```

---

### **3. STRECKEN-ERFASSUNG**

#### 3.1 Strecke dokumentieren

```typescript
interface StreckeListe {
  jagdId: string;
  
  // Abschüsse
  abschuesse: StreckenAbschuss[];
  
  // Zusammenfassung
  zusammenfassung: {
    gesamt: number;
    nachWildart: Record<string, number>;
    nachGeschlecht: Record<string, number>;
    nachSchuetze: Record<string, number>;
  };
  
  // Strecke legen (Foto-Dokumentation)
  streckeFotos: StreckeFoto[];
  
  // Trichinenproben
  trichinenproben?: Trichinenprobe[];
  
  // Wildbretverwertung
  verwertung: Wildbretverwertung[];
  
  // Finales Protokoll
  protokoll?: JagdProtokoll;
}

interface StreckenAbschuss {
  id: string;
  jagdId: string;
  
  // Wer hat erlegt?
  schuetzeId: string;
  standortId: string;
  treibenNummer?: number;
  
  // Was wurde erlegt?
  wildart: string;
  geschlecht: 'männlich' | 'weiblich' | 'unbekannt';
  altersklasse: string;
  anzahl: number;                // Normalerweise 1
  
  // Wann & Wo?
  zeitpunkt: Date;
  gps: GPSKoordinaten;
  
  // Details
  details: {
    gewicht?: number;            // kg
    groesse?: number;            // cm Schulterhöhe
    trophae?: {
      vorhanden: boolean;
      typ: 'geweih' | 'gehoern' | 'keilerwaffen' | 'balg';
      cic_punkte?: number;
      fotos: string[];
    };
    schussabgabe: {
      entfernung: number;        // Meter
      kugelplatzierung: string;  // "Blatt", "Träger", etc.
      sofortTod: boolean;
      nachsuche: boolean;
      nachsucheDauer?: number;   // Minuten
    };
  };
  
  // Wildbretverwertung
  verwertung: {
    aufbrechDatum: Date;
    aufbrechOrt: GPSKoordinaten;
    wildbrethygiene: boolean;
    trichinenprobe: boolean;
    verwendung: 'eigenverbrauch' | 'verkauf' | 'spende' | 'entsorgung';
  };
  
  // Fotos
  fotos: StreckenFoto[];
  
  // Wildmarke
  wildmarke?: {
    nummer: string;
    ausgabeStelle: string;
    ausgabeDatum: Date;
  };
  
  // Metadaten
  erfasstVon: string;
  erfasstAm: Date;
}

interface StreckeFoto {
  id: string;
  jagdId: string;
  
  // Foto
  uri: string;
  thumbnail: string;
  aufnahmeDatum: Date;
  
  // Typ
  typ: 'strecke_gesamt' | 'einzeltier' | 'trophae' | 'gruppe';
  
  // Zuordnung
  abschussIds?: string[];        // Welche Abschüsse sind auf dem Foto
  
  // Metadaten
  beschreibung?: string;
  gps?: GPSKoordinaten;
}

interface Trichinenprobe {
  id: string;
  abschussId: string;
  
  // Probe
  probenNummer: string;
  entnahmeDatum: Date;
  entnommenVon: string;
  
  // Labor
  labor?: string;
  versandDatum?: Date;
  ergebnisDatum?: Date;
  ergebnis?: 'negativ' | 'positiv' | 'unklar';
  
  // Dokumente
  dokumente: string[];           // PDF URIs
}

interface Wildbretverwertung {
  abschussId: string;
  
  // Aufbrechen
  aufgebrochen: boolean;
  aufbrechDatum?: Date;
  aufbrechPerson: string;
  
  // Kühlung
  gekuehlt: boolean;
  kuehlungAb?: Date;
  temperatur?: number;           // °C
  
  // Verwertung
  verwendung: 'eigenverbrauch' | 'verkauf' | 'spende' | 'entsorgung';
  empfaenger?: string;
  uebergabeDatum?: Date;
  
  // Wildbrethygiene
  wildbrethygiene: {
    kontrolleErfolgt: boolean;
    kontrollDatum?: Date;
    kontrollPerson?: string;
    beanstandungen: boolean;
    bemerkungen?: string;
  };
}
```

#### 3.2 Jagd-Protokoll

```typescript
interface JagdProtokoll {
  jagdId: string;
  
  // Basis-Daten
  datum: Date;
  jagdleiter: string;
  revier: string;
  
  // Teilnehmer
  teilnehmerAnzahl: {
    schuetzen: number;
    treiber: number;
    hundefuehrer: number;
    gesamt: number;
  };
  
  // Zeitplan (tatsächlich)
  zeitplan: {
    sammeln: Date;
    jagdBeginn: Date;
    jagdEnde: Date;
    streckeZeigen: Date;
    aufgeloest: Date;
  };
  
  // Wetter
  wetter: {
    temperatur: number;
    windGeschwindigkeit: number;
    niederschlag: number;
    bewoelkung: number;
    sicht: 'gut' | 'mittel' | 'schlecht';
  };
  
  // Strecke
  strecke: {
    gesamt: number;
    nachWildart: Record<string, {
      anzahl: number;
      maennlich: number;
      weiblich: number;
      juvenil: number;
    }>;
  };
  
  // Besonderheiten
  besonderheiten: {
    unfaelle: number;
    nachsuchen: number;
    fehlschuesse: number;
    schaerfeBeanstandungen: number;
  };
  
  // Kommentare
  bemerkungen: string;
  verbesserungsvorschlaege: string;
  
  // Unterschriften (digital)
  unterschriften: {
    jagdleiter: {
      name: string;
      datum: Date;
      signatur?: string;         // Base64 Signature
    };
    revierpächter?: {
      name: string;
      datum: Date;
      signatur?: string;
    };
  };
  
  // Export
  pdfGeneriert: boolean;
  pdfUri?: string;
  
  // Behördenmeldung
  behoerdenmeldung?: {
    gemeldet: boolean;
    meldeDatum?: Date;
    behoerde: string;
    aktenzeichen?: string;
  };
}
```

---

### **4. SICHERHEITS-FEATURES**

#### 4.1 Notfall-System

```typescript
interface NotfallSystem {
  jagdId: string;
  
  // Notfall-Kontakte
  notfallkontakte: NotfallKontakt[];
  
  // Sammelplatz
  sammelplatz: {
    name: string;
    gps: GPSKoordinaten;
    beschreibung: string;
    zufahrt: string;
  };
  
  // Notfall-Plan
  notfallplan: {
    rettungspunkte: Rettungspunkt[];
    krankenhaeuser: Krankenhaus[];
    verhalten: string;
  };
  
  // Aktive Notfälle
  aktiveNotfaelle: Notfall[];
}

interface NotfallKontakt {
  name: string;
  rolle: 'sanitaeter' | 'jagdleiter' | 'revierpächter' | 'rettungsdienst';
  telefon: string;
  prioritaet: number;
}

interface Rettungspunkt {
  id: string;
  nummer: string;               // "RW 123 456"
  gps: GPSKoordinaten;
  beschreibung: string;
  zufahrt: 'pkw' | 'gelaendewagen' | 'zu_fuss';
}

interface Krankenhaus {
  name: string;
  adresse: string;
  telefon: string;
  entfernung: number;           // km
  fahrtzeit: number;            // Minuten
  gps: GPSKoordinaten;
  notaufnahme: boolean;
}

interface Notfall {
  id: string;
  jagdId: string;
  zeitpunkt: Date;
  
  // Melder
  gemeldetVon: string;          // Teilnehmer-ID
  standortId?: string;
  gps: GPSKoordinaten;
  
  // Art des Notfalls
  art: 'unfall' | 'verletzung' | 'herzinfarkt' | 'verirrung' | 'wildunfall' | 'sonstiges';
  schweregrad: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  
  // Beschreibung
  beschreibung: string;
  betroffenePersonen: string[]; // Teilnehmer-IDs
  
  // Maßnahmen
  massnahmen: {
    ersthelfer: string[];       // Wer hilft?
    rettungsdienstAlarmiert: boolean;
    alarmierungZeitpunkt?: Date;
    eintreffenGeschaetzt?: Date;
    transportZiel?: string;     // Krankenhaus
  };
  
  // Status
  status: 'gemeldet' | 'in_bearbeitung' | 'aufgeloest' | 'abgeschlossen';
  aufgeloestAm?: Date;
  
  // Dokumentation
  fotos?: string[];
  verlaufProtokoll: NotfallVerlauf[];
}

interface NotfallVerlauf {
  zeitpunkt: Date;
  von: string;                  // Teilnehmer-ID
  aktion: string;
  bemerkung?: string;
}
```

#### 4.2 Sicherheits-Checks

```typescript
interface SicherheitsCheck {
  jagdId: string;
  
  // Pre-Jagd Checkliste
  vorJagd: {
    teilnehmerVollzaehlig: boolean;
    ausruestungGeprueft: boolean;
    signalwestenVerteilt: boolean;
    funkgeraeteGetestet: boolean;
    notfallplanBesprochen: boolean;
    schussrichtungenGeklaert: boolean;
    sammelplatzBekannt: boolean;
  };
  
  // Während Jagd
  waehrendJagd: {
    letzterRollCall: Date;
    alleTeilnehmerErreichbar: boolean;
    standorteKorrektBesetzt: boolean;
  };
  
  // Nach Jagd
  nachJagd: {
    alleTeilnehmerZurueck: boolean;
    keineMaterialschaeden: boolean;
    keineVerletzungen: boolean;
    wildbrethygieneEingehalten: boolean;
  };
}
```

---

### **5. STATISTIKEN & AUSWERTUNG**

#### 5.1 Jagd-Auswertung

```typescript
interface JagdAuswertung {
  jagdId: string;
  
  // Erfolgsquote
  erfolgsquote: {
    schuetzenGesamt: number;
    schuetzenMitAbschuss: number;
    prozent: number;
    durchschnittProSchuetze: number;
  };
  
  // Strecke nach Wildart
  streckeDetails: Array<{
    wildart: string;
    anzahl: number;
    maennlich: number;
    weiblich: number;
    juvenil: number;
    durchschnittsgewicht?: number;
    groesstesTier?: number;      // kg
  }>;
  
  // Standort-Analyse
  standortAnalyse: Array<{
    standortId: string;
    standortNummer: number;
    abschuesse: number;
    schuetze: string;
    wildarten: string[];
    erfolgreich: boolean;
  }>;
  
  // Treiben-Analyse
  treibenAnalyse: Array<{
    treibenNummer: number;
    dauer: number;              // Minuten
    abschuesse: number;
    aktivStandorte: number;
    erfolgProStandort: number;
  }>;
  
  // Zeitanalyse
  zeitanalyse: {
    aktivsteStunde: number;      // 0-23
    abschuessProStunde: Record<number, number>;
    durchschnittlicheNachsucheDauer: number;
  };
  
  // Wetter-Korrelation
  wetterKorrelation: {
    temperatur: number;
    wind: number;
    niederschlag: number;
    erfolgQuote: number;
  };
  
  // Vergleich zu vorherigen Jagden
  vergleich?: {
    durchschnittLetzteJagden: number;
    abweichung: number;          // %
    trend: 'besser' | 'gleich' | 'schlechter';
  };
}
```

#### 5.2 Teilnehmer-Statistiken

```typescript
interface TeilnehmerStatistik {
  teilnehmerId: string;
  
  // Gesamt über alle Jagden
  gesamt: {
    teilgenommenJagden: number;
    abschuesse: number;
    erfolgQuote: number;         // %
    lieblingsWildart: string;
  };
  
  // Diese Jagd
  dieseJagd: {
    standort: string;
    abschuesse: number;
    wildarten: string[];
    erfolgreich: boolean;
  };
  
  // Ranking
  ranking: {
    platzierung: number;
    punktzahl: number;
    auszeichnungen: string[];    // "Bester Schütze", "Meiste Abschüsse"
  };
}
```

---

### **6. RECHTLICHE VORGABEN**

#### 6.1 Dokumentationspflichten

```typescript
interface RechtlicheDokumentation {
  jagdId: string;
  
  // Pflichtangaben
  pflichtangaben: {
    jagdleiter: {
      name: string;
      jagdscheinNummer: string;
      gueltigBis: Date;
    };
    revier: {
      name: string;
      hegegemeinschaft: string;
      paechter: string;
    };
    datum: Date;
    teilnehmerliste: Array<{
      name: string;
      jagdscheinNummer: string;
      versicherungsNummer?: string;
    }>;
  };
  
  // Abschussmeldung
  abschussmeldung: {
    erforderlich: boolean;
    frist: Date;
    behoerde: string;
    status: 'offen' | 'gemeldet' | 'bestaetigt';
  };
  
  // Trichinenuntersuchung
  trichinenuntersuchung: {
    erforderlich: boolean;        // Schwarzwild, Dachs
    anzahlProben: number;
    labor: string;
    status: 'offen' | 'versandt' | 'ergebnis_ausstehend' | 'abgeschlossen';
  };
  
  // Wildbrethygiene
  wildbrethygiene: {
    schulungNachweisJagdleiter: boolean;
    kuehlketteEingehalten: boolean;
    aufbrechZeitpunkt: Date[];
    besonderheiten: string;
  };
  
  // Unfallmeldung
  unfallmeldung?: {
    erforderlich: boolean;
    behoerde: string;
    gemeldet: boolean;
    aktenzeichen?: string;
  };
}
```

---

## 🎨 USER INTERFACE DESIGN

### **Screen 1: Jagd-Übersicht**

```typescript
interface JagdUebersichtScreen {
  components: {
    header: {
      title: "Meine Jagden";
      filterButtons: ['Geplant', 'Aktiv', 'Abgeschlossen'];
      addButton: "Neue Jagd";
    };
    
    jagdListe: JagdCard[];
  };
}

interface JagdCard {
  id: string;
  
  // Header
  name: string;
  typ: JagdTyp;
  datum: Date;
  status: 'geplant' | 'aktiv' | 'abgeschlossen';
  
  // Schnell-Info
  quickInfo: {
    teilnehmer: `${angemeldet}/${maxTeilnehmer}`;
    standorte: number;
    strecke?: number;
  };
  
  // Aktionen
  actions: {
    bearbeiten: boolean;
    teilnehmen: boolean;
    absagen: boolean;
    details: boolean;
  };
  
  // Visual
  thumbnail?: string;           // Revier-Karte
  badge?: 'NEU' | 'MORGEN' | 'HEUTE' | 'LÄUFT';
}
```

### **Screen 2: Jagd erstellen**

```typescript
interface JagdErstellenScreen {
  steps: [
    {
      name: "Basis-Informationen";
      fields: {
        name: TextField;
        typ: Picker<JagdTyp>;
        revier: RevierPicker;
        datum: DatePicker;
        zeitplan: ZeitplanEditor;
      };
    },
    {
      name: "Teilnehmer";
      fields: {
        maxTeilnehmer: NumberInput;
        anmeldeschluss: DatePicker;
        einladen: TeilnehmerSuche;
        rollen: RollenZuweisung;
      };
    },
    {
      name: "Standorte";
      fields: {
        karte: InteractiveMap;
        standorteListe: StandortEditor[];
        importieren: "Von POIs importieren";
      };
    },
    {
      name: "Regeln & Sicherheit";
      fields: {
        wildarten: MultiSelect<Wildart>;
        schussrichtungen: DirectionEditor;
        notfallkontakt: ContactPicker;
        sammelplatz: LocationPicker;
      };
    },
    {
      name: "Überprüfung";
      fields: {
        zusammenfassung: Summary;
        checkliste: Checklist;
        erstellen: Button;
      };
    }
  ];
}
```

### **Screen 3: Jagd-Details**

```typescript
interface JagdDetailsScreen {
  tabs: [
    {
      name: "Übersicht";
      content: {
        zeitplan: Timeline;
        teilnehmer: TeilnehmerListe;
        standorte: StandortMap;
        wetter: WeatherWidget;
      };
    },
    {
      name: "Standorte";
      content: {
        karte: InteractiveMap;
        liste: StandortListe;
        zuweisungen: ZuweisungsMatrix;
      };
    },
    {
      name: "Kommunikation";
      content: {
        chat: ChatView;
        events: LiveEventsFeed;
        broadcast: BroadcastButton;
      };
    },
    {
      name: "Strecke";
      content: {
        abschuesse: AbschussListe;
        fotos: StreckeFotoGalerie;
        statistik: StreckenStatistik;
      };
    }
  ];
}
```

### **Screen 4: Live-Jagd Interface**

```typescript
interface LiveJagdScreen {
  layout: {
    top: {
      jagdStatus: "JAGD LÄUFT" | "TREIBEN 1/3" | "PAUSE";
      timer: LiveTimer;
      teilnehmerStatus: `${online}/${gesamt} online`;
    };
    
    center: {
      karte: LiveMap;           // Standorte, Treiben, Live-Events
      miniChat: CompactChat;
    };
    
    bottom: {
      quickActions: [
        "Abschuss melden",
        "Wild gesichtet",
        "Nachricht senden",
        "Notfall"
      ];
    };
    
    sidebar: {
      events: LiveEventStream;
      teilnehmer: OnlineListe;
    };
  };
}

interface LiveMap {
  layers: {
    standorte: StandortMarker[];
    teilnehmer: TeilnehmerMarker[];  // Opt-in GPS
    treiben: TreibgebietPolygon[];
    events: EventMarker[];           // Abschüsse, Sichtungen
    gefahrenbereiche: WarningZone[];
  };
  
  interactions: {
    tap: "Show details";
    longPress: "Quick action menu";
    pinch: "Zoom";
  };
}
```

### **Screen 5: Abschuss erfassen**

```typescript
interface AbschussErfassenScreen {
  form: {
    wildart: AutoComplete<Wildart>;
    geschlecht: SegmentedControl;
    altersklasse: Picker;
    
    standort: "Auto-detected from current assignment";
    zeitpunkt: "Auto-filled with now()";
    gps: "Auto-detected from device";
    
    schussDetails: {
      entfernung: NumberInput;    // Meter
      kugelplatzierung: BodyDiagram;  // Interactive
      sofortTod: Toggle;
      nachsuche: Toggle;
    };
    
    optional: {
      gewicht: NumberInput;
      fotos: CameraButton[];
      bemerkungen: TextArea;
    };
    
    actions: {
      speichern: Button;
      abbRechen: Button;
    };
  };
  
  validation: {
    wildartErlaubt: boolean;     // Laut Jagd-Regeln
    schussrichtungOK: boolean;   // Laut Standort-Sicherheit
  };
}
```

### **Screen 6: Strecke legen**

```typescript
interface StreckeLegenScreen {
  header: {
    title: "Strecke legen";
    subtitle: `${anzahl} Stück Wild`;
  };
  
  sections: [
    {
      name: "Gruppierung";
      content: {
        groupBy: Picker<'Wildart' | 'Schütze' | 'Treiben'>;
        sortBy: Picker<'Größe' | 'Zeitpunkt' | 'Alphabetisch'>;
      };
    },
    {
      name: "Fotos";
      content: {
        gesamtStrecke: CameraButton;
        einzelTiere: CameraButtons[];
        trophäen: CameraButtons[];
        gallery: PhotoGrid;
      };
    },
    {
      name: "Protokoll";
      content: {
        zusammenfassung: Summary;
        unterschrift: SignaturePad;
        export: "PDF generieren";
      };
    }
  ];
}
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### **7.1 Database Schema**

```sql
-- Gesellschaftsjagden
CREATE TABLE gesellschaftsjagden (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  name TEXT NOT NULL,
  typ TEXT NOT NULL,  -- 'drueckjagd', 'treibjagd', etc.
  datum DATE NOT NULL,
  
  -- Zeitplan (JSON)
  zeitplan TEXT NOT NULL,  -- {sammeln, ansprechen, jagdBeginn, jagdEnde, streckeZeigen}
  
  -- Organisation
  jagdleiter_id TEXT NOT NULL,
  max_teilnehmer INTEGER NOT NULL,
  anmeldeschluss DATE,
  
  -- Sicherheit (JSON)
  sicherheit TEXT NOT NULL,  -- {notfallkontakt, sammelplatz, notfallplan}
  
  -- Regeln (JSON)
  regeln TEXT NOT NULL,  -- {wildarten[], schussrichtungen[], etc.}
  
  -- Status
  status TEXT NOT NULL CHECK(status IN ('geplant', 'aktiv', 'abgeschlossen', 'abgesagt')),
  
  -- Metadaten
  erstellt_von TEXT NOT NULL,
  erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  aktualisiert_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id),
  FOREIGN KEY (jagdleiter_id) REFERENCES user(id)
);

-- Teilnehmer
CREATE TABLE jagd_teilnehmer (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Person
  user_id TEXT,  -- NULL wenn nicht registriert
  name TEXT NOT NULL,
  telefon TEXT NOT NULL,
  email TEXT,
  
  -- Rolle
  rolle TEXT NOT NULL,  -- 'jagdleiter', 'schuetze', 'treiber', etc.
  
  -- Ausrüstung (JSON)
  ausruestung TEXT NOT NULL,
  
  -- Erfahrung (JSON)
  erfahrung TEXT,
  
  -- Anmeldung (JSON)
  anmeldung TEXT NOT NULL,  -- {status, angemeldetAm, kommentar}
  
  -- Standort
  zugewiesener_standort_id TEXT,
  
  -- Live-Status (JSON)
  live_status TEXT,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (zugewiesener_standort_id) REFERENCES jagd_standorte(id)
);

-- Standorte
CREATE TABLE jagd_standorte (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Identifikation
  nummer INTEGER NOT NULL,
  name TEXT,
  typ TEXT NOT NULL,  -- 'hochsitz', 'bodensitz', etc.
  
  -- Position
  gps_latitude REAL NOT NULL,
  gps_longitude REAL NOT NULL,
  hoehe INTEGER,
  poi_id TEXT,  -- Verknüpfung zu POI
  
  -- Beschreibung
  beschreibung TEXT,
  zugang TEXT,
  orientierung INTEGER,  -- Grad
  
  -- Sicherheit (JSON)
  sicherheit TEXT NOT NULL,
  
  -- Eigenschaften (JSON)
  eigenschaften TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK(status IN ('verfuegbar', 'besetzt', 'gesperrt')),
  
  -- Historie (JSON)
  historie TEXT,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (poi_id) REFERENCES pois(id)
);

CREATE INDEX idx_jagd_standorte_jagd ON jagd_standorte(jagd_id);
CREATE INDEX idx_jagd_standorte_gps ON jagd_standorte(gps_latitude, gps_longitude);

-- Standort-Zuweisungen
CREATE TABLE standort_zuweisungen (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  standort_id TEXT NOT NULL,
  teilnehmer_id TEXT NOT NULL,
  
  -- Zuweisung
  zugewiesen_von TEXT NOT NULL,
  zugewiesen_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  prioritaet INTEGER DEFAULT 1,
  
  -- Bestätigung
  bestaetigt BOOLEAN DEFAULT FALSE,
  bestaetigt_am DATETIME,
  
  -- Notizen
  notizen TEXT,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id) ON DELETE CASCADE,
  FOREIGN KEY (teilnehmer_id) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE,
  FOREIGN KEY (zugewiesen_von) REFERENCES user(id),
  
  UNIQUE(jagd_id, standort_id, teilnehmer_id)
);

-- Treiben
CREATE TABLE jagd_treiben (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Identifikation
  nummer INTEGER NOT NULL,
  name TEXT NOT NULL,
  
  -- Zeitplan
  start DATETIME NOT NULL,
  geschaetzte_dauer INTEGER NOT NULL,  -- Minuten
  ende DATETIME,
  
  -- Gebiet (JSON Polygon)
  treibgebiet TEXT NOT NULL,
  richtung INTEGER NOT NULL,  -- Grad
  
  -- Status
  status TEXT NOT NULL CHECK(status IN ('geplant', 'laufend', 'abgeschlossen', 'abgebrochen')),
  
  -- Ergebnis (JSON)
  ergebnis TEXT,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE
);

CREATE INDEX idx_jagd_treiben_jagd ON jagd_treiben(jagd_id);

-- Treiben-Treiber (Many-to-Many)
CREATE TABLE treiben_treiber (
  treiben_id TEXT NOT NULL,
  teilnehmer_id TEXT NOT NULL,
  position TEXT NOT NULL,  -- 'links', 'mitte', 'rechts'
  abstand INTEGER,  -- Meter
  hundeeinsatz BOOLEAN DEFAULT FALSE,
  
  PRIMARY KEY (treiben_id, teilnehmer_id),
  FOREIGN KEY (treiben_id) REFERENCES jagd_treiben(id) ON DELETE CASCADE,
  FOREIGN KEY (teilnehmer_id) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE
);

-- Treiben-Standorte (Many-to-Many)
CREATE TABLE treiben_standorte (
  treiben_id TEXT NOT NULL,
  standort_id TEXT NOT NULL,
  
  PRIMARY KEY (treiben_id, standort_id),
  FOREIGN KEY (treiben_id) REFERENCES jagd_treiben(id) ON DELETE CASCADE,
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id) ON DELETE CASCADE
);

-- Live Events
CREATE TABLE jagd_live_events (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  typ TEXT NOT NULL,  -- 'abschuss', 'wildsichtung', 'notfall', etc.
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  von TEXT NOT NULL,  -- Teilnehmer-ID
  
  -- Event-Daten (JSON)
  daten TEXT NOT NULL,
  
  -- Sichtbarkeit
  sichtbar_fuer TEXT NOT NULL,  -- 'alle', 'jagdleiter', etc.
  
  -- Status
  gelesen BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (von) REFERENCES jagd_teilnehmer(id)
);

CREATE INDEX idx_jagd_live_events_jagd ON jagd_live_events(jagd_id);
CREATE INDEX idx_jagd_live_events_zeitpunkt ON jagd_live_events(zeitpunkt DESC);

-- Kommunikations-Kanäle
CREATE TABLE jagd_kanaele (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  name TEXT NOT NULL,
  typ TEXT NOT NULL,  -- 'haupt', 'jagdleitung', 'schuetzen', 'treiber', 'notfall'
  prioritaet TEXT DEFAULT 'normal',
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE
);

-- Nachrichten
CREATE TABLE jagd_nachrichten (
  id TEXT PRIMARY KEY,
  kanal_id TEXT NOT NULL,
  von TEXT NOT NULL,  -- Teilnehmer-ID
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Inhalt
  typ TEXT NOT NULL,  -- 'text', 'audio', 'bild', 'standort'
  inhalt TEXT NOT NULL,
  
  -- Priorität
  prioritaet TEXT DEFAULT 'normal',
  
  -- Reply
  antwort_auf TEXT,
  
  FOREIGN KEY (kanal_id) REFERENCES jagd_kanaele(id) ON DELETE CASCADE,
  FOREIGN KEY (von) REFERENCES jagd_teilnehmer(id),
  FOREIGN KEY (antwort_auf) REFERENCES jagd_nachrichten(id)
);

CREATE INDEX idx_jagd_nachrichten_kanal ON jagd_nachrichten(kanal_id);
CREATE INDEX idx_jagd_nachrichten_zeitpunkt ON jagd_nachrichten(zeitpunkt DESC);

-- Nachricht-Gelesen-Status
CREATE TABLE nachrichten_gelesen (
  nachricht_id TEXT NOT NULL,
  teilnehmer_id TEXT NOT NULL,
  gelesen_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (nachricht_id, teilnehmer_id),
  FOREIGN KEY (nachricht_id) REFERENCES jagd_nachrichten(id) ON DELETE CASCADE,
  FOREIGN KEY (teilnehmer_id) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE
);

-- Strecken-Abschüsse
CREATE TABLE strecken_abschuesse (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Wer?
  schuetze_id TEXT NOT NULL,
  standort_id TEXT NOT NULL,
  treiben_nummer INTEGER,
  
  -- Was?
  wildart TEXT NOT NULL,
  geschlecht TEXT NOT NULL,
  altersklasse TEXT NOT NULL,
  anzahl INTEGER DEFAULT 1,
  
  -- Wann & Wo?
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  gps_latitude REAL NOT NULL,
  gps_longitude REAL NOT NULL,
  
  -- Details (JSON)
  details TEXT NOT NULL,
  
  -- Verwertung (JSON)
  verwertung TEXT NOT NULL,
  
  -- Wildmarke (JSON)
  wildmarke TEXT,
  
  -- Metadaten
  erfasst_von TEXT NOT NULL,
  erfasst_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (schuetze_id) REFERENCES jagd_teilnehmer(id),
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id),
  FOREIGN KEY (erfasst_von) REFERENCES user(id)
);

CREATE INDEX idx_strecken_abschuesse_jagd ON strecken_abschuesse(jagd_id);
CREATE INDEX idx_strecken_abschuesse_schuetze ON strecken_abschuesse(schuetze_id);

-- Strecken-Fotos
CREATE TABLE strecken_fotos (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Foto
  uri TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  aufnahme_datum DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Typ
  typ TEXT NOT NULL,  -- 'strecke_gesamt', 'einzeltier', 'trophae'
  
  -- Zuordnung (JSON Array)
  abschuss_ids TEXT,
  
  -- Metadaten
  beschreibung TEXT,
  gps_latitude REAL,
  gps_longitude REAL,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE
);

CREATE INDEX idx_strecken_fotos_jagd ON strecken_fotos(jagd_id);

-- Trichinenproben
CREATE TABLE trichinenproben (
  id TEXT PRIMARY KEY,
  abschuss_id TEXT NOT NULL,
  
  -- Probe
  proben_nummer TEXT NOT NULL UNIQUE,
  entnahme_datum DATETIME DEFAULT CURRENT_TIMESTAMP,
  entnommen_von TEXT NOT NULL,
  
  -- Labor
  labor TEXT,
  versand_datum DATETIME,
  ergebnis_datum DATETIME,
  ergebnis TEXT CHECK(ergebnis IN ('negativ', 'positiv', 'unklar')),
  
  FOREIGN KEY (abschuss_id) REFERENCES strecken_abschuesse(id) ON DELETE CASCADE,
  FOREIGN KEY (entnommen_von) REFERENCES user(id)
);

-- Jagd-Protokolle
CREATE TABLE jagd_protokolle (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL UNIQUE,
  
  -- Pflichtangaben (JSON)
  pflichtangaben TEXT NOT NULL,
  
  -- Teilnehmer-Anzahl (JSON)
  teilnehmer_anzahl TEXT NOT NULL,
  
  -- Zeitplan (JSON)
  zeitplan TEXT NOT NULL,
  
  -- Wetter (JSON)
  wetter TEXT NOT NULL,
  
  -- Strecke (JSON)
  strecke TEXT NOT NULL,
  
  -- Besonderheiten (JSON)
  besonderheiten TEXT NOT NULL,
  
  -- Kommentare
  bemerkungen TEXT,
  verbesserungsvorschlaege TEXT,
  
  -- Unterschriften (JSON)
  unterschriften TEXT,
  
  -- Export
  pdf_generiert BOOLEAN DEFAULT FALSE,
  pdf_uri TEXT,
  
  -- Behördenmeldung (JSON)
  behoerdenmeldung TEXT,
  
  -- Metadaten
  erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  aktualisiert_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE
);

-- Notfälle
CREATE TABLE jagd_notfaelle (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Melder
  gemeldet_von TEXT NOT NULL,
  standort_id TEXT,
  gps_latitude REAL NOT NULL,
  gps_longitude REAL NOT NULL,
  
  -- Art
  art TEXT NOT NULL,  -- 'unfall', 'verletzung', etc.
  schweregrad TEXT NOT NULL,
  
  -- Beschreibung
  beschreibung TEXT NOT NULL,
  betroffene_personen TEXT NOT NULL,  -- JSON Array
  
  -- Maßnahmen (JSON)
  massnahmen TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK(status IN ('gemeldet', 'in_bearbeitung', 'aufgeloest', 'abgeschlossen')),
  aufgeloest_am DATETIME,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (gemeldet_von) REFERENCES jagd_teilnehmer(id),
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id)
);

CREATE INDEX idx_jagd_notfaelle_jagd ON jagd_notfaelle(jagd_id);

-- Notfall-Verlauf
CREATE TABLE notfall_verlauf (
  id TEXT PRIMARY KEY,
  notfall_id TEXT NOT NULL,
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  von TEXT NOT NULL,
  aktion TEXT NOT NULL,
  bemerkung TEXT,
  
  FOREIGN KEY (notfall_id) REFERENCES jagd_notfaelle(id) ON DELETE CASCADE,
  FOREIGN KEY (von) REFERENCES jagd_teilnehmer(id)
);
```

### **7.2 Service Architecture**

```typescript
// src/services/gesellschaftsjagdService.ts

import { SQLiteDatabase } from 'expo-sqlite';
import { Gesellschaftsjagd, Teilnehmer, JagdStandort } from '../types/gesellschaftsjagd';

export class GesellschaftsjagdService {
  constructor(private db: SQLiteDatabase) {}
  
  // CRUD Operations
  async createJagd(jagd: Omit<Gesellschaftsjagd, 'id'>): Promise<Gesellschaftsjagd> {
    const id = generateId();
    
    await this.db.execAsync(`
      INSERT INTO gesellschaftsjagden (
        id, revier_id, name, typ, datum, zeitplan,
        jagdleiter_id, max_teilnehmer, anmeldeschluss,
        sicherheit, regeln, status, erstellt_von
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      jagd.revierId,
      jagd.name,
      jagd.typ,
      jagd.datum.toISOString(),
      JSON.stringify(jagd.zeitplan),
      jagd.jagdleiter,
      jagd.maxTeilnehmer,
      jagd.anmeldeschluss?.toISOString(),
      JSON.stringify(jagd.sicherheit),
      JSON.stringify(jagd.regeln),
      jagd.status,
      jagd.erstelltVon
    ]);
    
    return { ...jagd, id };
  }
  
  async getJagd(id: string): Promise<Gesellschaftsjagd | null> {
    const result = await this.db.getAllAsync<any>(`
      SELECT * FROM gesellschaftsjagden WHERE id = ?
    `, [id]);
    
    if (result.length === 0) return null;
    
    const row = result[0];
    return this.mapToGesellschaftsjagd(row);
  }
  
  async getJagdenForRevier(revierId: string): Promise<Gesellschaftsjagd[]> {
    const results = await this.db.getAllAsync<any>(`
      SELECT * FROM gesellschaftsjagden
      WHERE revier_id = ?
      ORDER BY datum DESC
    `, [revierId]);
    
    return results.map(r => this.mapToGesellschaftsjagd(r));
  }
  
  async getJagdenForUser(userId: string): Promise<Gesellschaftsjagd[]> {
    // Jagden wo User Jagdleiter oder Teilnehmer ist
    const results = await this.db.getAllAsync<any>(`
      SELECT DISTINCT g.*
      FROM gesellschaftsjagden g
      LEFT JOIN jagd_teilnehmer t ON t.jagd_id = g.id
      WHERE g.jagdleiter_id = ? OR t.user_id = ?
      ORDER BY g.datum DESC
    `, [userId, userId]);
    
    return results.map(r => this.mapToGesellschaftsjagd(r));
  }
  
  // Teilnehmer-Management
  async addTeilnehmer(teilnehmer: Omit<Teilnehmer, 'id'>): Promise<Teilnehmer> {
    const id = generateId();
    
    await this.db.execAsync(`
      INSERT INTO jagd_teilnehmer (
        id, jagd_id, user_id, name, telefon, email,
        rolle, ausruestung, erfahrung, anmeldung
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      teilnehmer.jagdId,
      teilnehmer.userId,
      teilnehmer.name,
      teilnehmer.telefon,
      teilnehmer.email,
      teilnehmer.rolle,
      JSON.stringify(teilnehmer.ausruestung),
      JSON.stringify(teilnehmer.erfahrung),
      JSON.stringify(teilnehmer.anmeldung)
    ]);
    
    return { ...teilnehmer, id };
  }
  
  async getTeilnehmer(jagdId: string): Promise<Teilnehmer[]> {
    const results = await this.db.getAllAsync<any>(`
      SELECT * FROM jagd_teilnehmer WHERE jagd_id = ?
      ORDER BY rolle, name
    `, [jagdId]);
    
    return results.map(r => this.mapToTeilnehmer(r));
  }
  
  async updateTeilnehmerStatus(
    teilnehmerId: string,
    status: Teilnehmer['anmeldung']['status']
  ): Promise<void> {
    const teilnehmer = await this.getTeilnehmerById(teilnehmerId);
    if (!teilnehmer) throw new Error('Teilnehmer not found');
    
    teilnehmer.anmeldung.status = status;
    teilnehmer.anmeldung.angemeldetAm = new Date();
    
    await this.db.execAsync(`
      UPDATE jagd_teilnehmer
      SET anmeldung = ?
      WHERE id = ?
    `, [JSON.stringify(teilnehmer.anmeldung), teilnehmerId]);
  }
  
  // Standort-Management
  async createStandort(standort: Omit<JagdStandort, 'id'>): Promise<JagdStandort> {
    const id = generateId();
    
    await this.db.execAsync(`
      INSERT INTO jagd_standorte (
        id, jagd_id, nummer, name, typ,
        gps_latitude, gps_longitude, hoehe, poi_id,
        beschreibung, zugang, orientierung,
        sicherheit, eigenschaften, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      standort.jagdId,
      standort.nummer,
      standort.name,
      standort.typ,
      standort.gps.latitude,
      standort.gps.longitude,
      standort.hoehe,
      standort.poiId,
      standort.beschreibung,
      standort.zugang,
      standort.orientierung,
      JSON.stringify(standort.sicherheit),
      JSON.stringify(standort.eigenschaften),
      standort.status
    ]);
    
    return { ...standort, id };
  }
  
  async getStandorte(jagdId: string): Promise<JagdStandort[]> {
    const results = await this.db.getAllAsync<any>(`
      SELECT * FROM jagd_standorte
      WHERE jagd_id = ?
      ORDER BY nummer
    `, [jagdId]);
    
    return results.map(r => this.mapToJagdStandort(r));
  }
  
  async assignStandort(
    jagdId: string,
    standortId: string,
    teilnehmerId: string,
    zugewiesenVon: string
  ): Promise<void> {
    const id = generateId();
    
    await this.db.execAsync(`
      INSERT INTO standort_zuweisungen (
        id, jagd_id, standort_id, teilnehmer_id, zugewiesen_von
      ) VALUES (?, ?, ?, ?, ?)
    `, [id, jagdId, standortId, teilnehmerId, zugewiesenVon]);
    
    // Update Teilnehmer
    await this.db.execAsync(`
      UPDATE jagd_teilnehmer
      SET zugewiesener_standort_id = ?
      WHERE id = ?
    `, [standortId, teilnehmerId]);
    
    // Update Standort Status
    await this.db.execAsync(`
      UPDATE jagd_standorte
      SET status = 'besetzt'
      WHERE id = ?
    `, [standortId]);
  }
  
  // Helper methods
  private mapToGesellschaftsjagd(row: any): Gesellschaftsjagd {
    return {
      id: row.id,
      revierId: row.revier_id,
      name: row.name,
      typ: row.typ,
      datum: new Date(row.datum),
      zeitplan: JSON.parse(row.zeitplan),
      jagdleiter: row.jagdleiter_id,
      teilnehmer: [], // Load separately
      maxTeilnehmer: row.max_teilnehmer,
      anmeldeschluss: row.anmeldeschluss ? new Date(row.anmeldeschluss) : undefined,
      standorte: [], // Load separately
      standortZuweisungen: [], // Load separately
      treiben: [], // Load separately
      treiber: [], // Load separately
      sicherheit: JSON.parse(row.sicherheit),
      regeln: JSON.parse(row.regeln),
      strecke: { jagdId: row.id, abschuesse: [], zusammenfassung: {} } as any,
      status: row.status,
      erstelltVon: row.erstellt_von,
      erstelltAm: new Date(row.erstellt_am),
      aktualisiertAm: new Date(row.aktualisiert_am)
    };
  }
  
  private mapToTeilnehmer(row: any): Teilnehmer {
    return {
      id: row.id,
      jagdId: row.jagd_id,
      userId: row.user_id,
      name: row.name,
      telefon: row.telefon,
      email: row.email,
      rolle: row.rolle,
      ausruestung: JSON.parse(row.ausruestung),
      erfahrung: JSON.parse(row.erfahrung),
      anmeldung: JSON.parse(row.anmeldung),
      zugewiesenerStandort: row.zugewiesener_standort_id,
      liveStatus: row.live_status ? JSON.parse(row.live_status) : undefined,
      abschuesse: [] // Load separately
    };
  }
  
  private mapToJagdStandort(row: any): JagdStandort {
    return {
      id: row.id,
      jagdId: row.jagd_id,
      nummer: row.nummer,
      name: row.name,
      typ: row.typ,
      gps: {
        latitude: row.gps_latitude,
        longitude: row.gps_longitude
      },
      hoehe: row.hoehe,
      poiId: row.poi_id,
      beschreibung: row.beschreibung,
      zugang: row.zugang,
      orientierung: row.orientierung,
      sicherheit: JSON.parse(row.sicherheit),
      eigenschaften: JSON.parse(row.eigenschaften),
      status: row.status,
      zugewiesenePersonen: [], // Load separately
      historie: row.historie ? JSON.parse(row.historie) : undefined
    };
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 📱 IMPLEMENTATION ROADMAP

### **Week 1-2: Foundation & Database**
✅ TypeScript types
✅ Database schema
✅ Migration scripts
✅ Core service layer

### **Week 3-4: Jagd-Planning UI**
🎨 Jagd erstellen (5-step wizard)
🎨 Teilnehmer einladen
🎨 Standorte anlegen & zuweisen
📊 Vorschau & Validierung

### **Week 5-6: Live-Jagd Features**
📡 WebSocket/Firebase integration
📱 Live-Event system
💬 Kommunikations-Channels
🗺️ Live-Map mit Updates

### **Week 7-8: Strecken-Erfassung**
📝 Abschuss erfassen (Quick-Form)
📸 Foto-Dokumentation
🎯 Strecke legen
📄 PDF-Protokoll generieren

### **Week 9-10: Testing & Polish**
🧪 Unit Tests
🧪 Integration Tests
🎨 UI/UX Polish
📚 User Guide
🚀 Release

---

## ✅ SUCCESS CRITERIA

**MVP (Minimum Viable Product):**
1. ✅ Jagd erstellen mit Basis-Informationen
2. ✅ Teilnehmer einladen & verwalten
3. ✅ Standorte anlegen & zuweisen
4. ✅ Abschuss erfassen
5. ✅ Einfaches Jagd-Protokoll

**Phase 1 (Full Features):**
6. ✅ Echtzeit-Kommunikation (Chat)
7. ✅ Live-Events (Abschüsse, Sichtungen)
8. ✅ Treiben-Planung
9. ✅ Notfall-System
10. ✅ Foto-Dokumentation
11. ✅ PDF-Export

**Phase 2 (Advanced):**
12. ✅ Standort-Historie & Empfehlungen
13. ✅ Statistiken & Auswertungen
14. ✅ Teilnehmer-Rankings
15. ✅ GPS-Tracking (Opt-in)
16. ✅ Audio-Nachrichten
17. ✅ Trichinenproben-Verwaltung

---

## 🎯 NEXT STEPS

**IMMEDIATE (Diese Woche):**
1. TypeScript types erstellen (`src/types/gesellschaftsjagd.ts`)
2. Database migration (`008_gesellschaftsjagd.sql`)
3. Core Service Layer (`gesellschaftsjagdService.ts`)
4. Jagd-Übersicht Screen (UI)

**DANN:**
5. Jagd erstellen Wizard
6. Teilnehmer-Management UI
7. Standort-Editor
8. Live-Jagd Interface

**Timeline:** 8-10 Wochen bis MVP, 12-14 Wochen bis Full Features

---

**Status:** 🚀 Ready to implement
**Estimate:** 8-10 weeks for MVP, 12-14 weeks for full features
**Priority:** HIGH - Revolutionary feature for group hunting

Lass uns starten! 🎯🦌