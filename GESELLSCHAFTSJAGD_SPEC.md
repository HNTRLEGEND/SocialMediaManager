# Gesellschaftsjagd Management System - Technische Spezifikation
**Version**: 1.0  
**Phase**: 6 (Geplant für Phase 4-6)  
**Status**: Design Phase

---

## 📋 Überblick

Das Gesellschaftsjagd Management System ist das Herzstück der HNTR LEGEND Pro und ermöglicht es Jagdorganisatoren, Treibjagden vom ersten Plan bis zum abschließenden Report vollständig zu verwalten.

**Zielgruppe**: Jagdverbände, Revierinhaber, professionelle Jagdveranstalter

**Kernfunktionalität**:
- ✅ Jagd-Planung mit Standvergabe
- ✅ Live-Koordination mit Echtzeit-Tracking
- ✅ Teilnehmer-Management
- ✅ Drohnen & Hund-Tracking Integration
- ✅ Sicherheits-Features & Funk-Channels
- ✅ Statistik & Report-Generierung

---

## 🏗️ Datenmodell - Detailliert

### 1. Gesellschaftsjagd-Hauptentität

```typescript
// types/gesellschaftsjagd.ts

interface Gesellschaftsjagd {
  // === IDENTIFIKATION ===
  id: UUID;
  revierId: UUID;
  name: string;                    // "Hirschjagd Revier Müller"
  beschreibung?: string;
  
  // === TIMING ===
  datum: Date;                     // Tag der Jagd
  startZeit: Time;                 // z.B. "05:30"
  endZeit: Time;                   // z.B. "16:00"
  duration: number;                // Minuten
  
  // === VERANSTALTER & ORGANISATION ===
  organisator: User;               // Wer organisiert?
  helfer: User[];                  // Beisitzer, Organisationshelfer
  jagdherr: User;                  // Der Jagd verantwortliche
  
  // === TEILNEHMER ===
  jaegerListe: Jaeger[];           // Alle teilnehmenden Jäger
  hundeListe: Hund[];              // Alle Jagdhunde
  drohnenListe: Drohne[];          // Drohnen im Einsatz
  
  // === PLANUNG ===
  standecken: StandAssignment[];   // Hochsitz-Zuordnung
  treiberZonen: TreiberZone[];     // Wo werden getrieben?
  sammelPunkte: Waypoint[];        // Treffpunkte
  verbotsZonen: Polygon[];         // Sperrgebiete (z.B. Nachbarreviere)
  gefahrenZonen: DangerZone[];     // Gefahrenzonen (Wasser, Klippen, etc.)
  routen: Route[];                 // Geplante Treiberrouten
  
  // === Live-TRACKING ===
  liveTrackingAktiv: boolean;
  trackingUpdateInterval: number;  // Sekunden (default: 10)
  trackingSnapshots: TrackingSnapshot[];  // Historie
  
  // === KOMMUNIKATION ===
  funkChannels: FunkChannel[];     // Funk-Kanäle
  communicationEnabled: boolean;   // Chat, Push-Benachrichtigungen
  
  // === WETTER & BEDINGUNGEN ===
  wetter: EnhancedWeather;
  bedingungen: JagdBedingungen;
  
  // === SICHERHEIT ===
  sicherheitsRegeln: SicherheitsRegel[];
  notfallKontakte: EmergencyContact[];
  ersthelfer: User[];
  
  // === STATUS & VERWALTUNG ===
  status: JagdStatus;              // 'planung' | 'aktiv' | 'abgeschlossen' | 'abgebrochen'
  erfolg: HuntStatistics;          // Endstatistik
  notizen: Notiz[];
  
  // === METADATEN ===
  erstellt: Date;
  geaendert: Date;
  ersteller: User;
  geaendertVon: User;
}

// ===================================
// STAND-ZUORDNUNG
// ===================================

interface StandAssignment {
  id: UUID;
  gesellschaftsjagdId: UUID;
  
  // Hochsitz-Details
  hochsitz: POI;                   // Referenz zur Map-POI
  standName: string;               // z.B. "Hochsitz 7 - Südwiese"
  standNummer: number;             // Zur Kennzeichnung
  
  // Zuweisung
  jaeger: Jaeger;
  begleiter?: Jaeger;              // Optional 2. Person
  hund?: Hund;
  
  // Zeit am Stand
  ankunftsZeit: Time;              // Wann dort sein?
  abgangsZeit: Time;               // Wann weg?
  fruehaufsteherPaket?: boolean;   // Schon vorher da?
  
  // Ziel-Wildart
  zielWildart: WildArt[];          // ["rotwild", "damwild", "rehwild"]
  schussfelderBeschreibung: string; // "von W nach O, Wiese vor Stand"
  
  // Erwartungen
  wahrscheinlicherAnsitz: number;  // 0-100%
  historischeMergel: number;       // Basierend auf Daten
  
  // Ausrüstung-Vorgabe
  empfohleneAusruestung: Equipment[];
  munitionsEmpfehlung: string;
  
  // Status & Feedback
  bestätigt: boolean;              // Hat Jäger Zustimmung gegeben?
  rueckmeldung?: string;
  taetigkeit: StandActivity;       // 'wartend', 'aktiv', 'abgeschlossen'
  notizen: string;
  
  // Ergebnisse
  abschuesseDiesemStand: Abschuss[];
  beobachtungen: Beobachtung[];
}

interface TreiberZone {
  id: UUID;
  name: string;                    // "Treiberlinie 1 - Süd"
  polygon: Polygon;                // Gebiet das getrieben wird
  treiber: Jaeger[];               // Wer treibt?
  startZeit: Time;
  endZeit: Time;
  reihenfolge: number;             // Treiberlinie 1, 2, 3, ...
  beschreibung: string;
  warningZones: Polygon[];         // Verbotszonen
}

// ===================================
// DRÜCKJAGD-SPEZIFISCHE FEATURES
// ===================================

enum JagdTyp {
  ANSITZJAGD = 'ansitz',           // Klassische Einzeljagd
  TREIBJAGD = 'treiben',           // Große Treibjagd
  DRUECKJAGD = 'druecken',         // Drückjagd (langsames Treiben)
  PIRSCH = 'pirsch',               // Pirschjagd
  LOCKJAGD = 'locken',             // Lockjagd (Blatter, etc.)
  ANSPRECHEN = 'ansprechen',       // Bewegungsjagd
}

/**
 * Drückjagd-Trupp Management
 * Mehrere kleine Gruppen statt einer großen Linie
 */
interface DrueckjagdTrupp {
  id: UUID;
  name: string;                    // "Trupp Alpha", "Trupp 1"
  farbe: string;                   // Für Karten-Visualisierung (hex)
  
  // Team-Zusammensetzung
  fuehrer: Jaeger;                 // Trupp-Führer
  mitglieder: Jaeger[];            // Restliche Jäger
  hunde: Hund[];                   // Hunde im Trupp
  
  // Zugewiesene Zone
  zone: Polygon;                   // Wo der Trupp jagt
  startPosition: GPSKoordinaten;   // Sammelstelle
  routeVorschlag: Waypoint[];      // Geplante Route
  
  // Kommunikation
  funkKanal: FunkChannel;
  truppFuehrerKontakt: string;     // Telefon
  
  // Status
  status: 'wartend' | 'unterwegs' | 'in_position' | 'aktiv' | 'abgeschlossen';
  letzteMeldung: {
    timestamp: Date;
    position: GPSKoordinaten;
    nachricht: string;
  };
  
  // Zeitplan
  bereitstellungsZeit: Time;       // Wann an Startposition
  beginnZeit: Time;                // Wann losmarschieren
  zielZeit: Time;                  // Wann an Endposition erwartet
  
  // Erfolgsbilanz
  wildSichtungen: number;
  kontakte: number;
  abschuesse: Abschuss[];
}

/**
 * Ansteller-Management
 * Koordiniert Positionen von Hochsitzern
 */
interface AnstellerSystem {
  id: UUID;
  gesellschaftsjagdId: UUID;
  
  // Ansteller-Team
  hauptAnsteller: Jaeger;          // Koordiniert alle Ansteller
  ansteller: Array<{
    jaeger: Jaeger;
    verantwortlicherBereich: Polygon;
    zustaendigFuerStaende: StandAssignment[];
    fahrzeug?: string;             // "Geländewagen Nr. 3"
  }>;
  
  // Anstell-Karte
  anstellKarte: {
    staende: StandAssignment[];
    fahrtrouten: Route[];          // Wie Jäger zu Ständen kommen
    parkplaetze: Waypoint[];       // Wo geparkt wird
    sammelstellen: Waypoint[];     // Wo sich getroffen wird
    zeitplan: Array<{
      zeit: Time;
      aktion: string;              // "Alle an Sammelstelle"
      beteiligte: Jaeger[];
    }>;
  };
  
  // Koordination
  anstellBeginn: Time;             // Wann Anstellen beginnt
  alleBereit: boolean;             // Alle Jäger in Position?
  meldungen: Array<{
    jaeger: Jaeger;
    stand: StandAssignment;
    zeitpunkt: Date;
    status: 'unterwegs' | 'angekommen' | 'in_position' | 'bereit';
    bemerkung?: string;
  }>;
  
  // Kommunikation
  funkVerbindung: FunkChannel;
  notfallProtokoll: {
    verspätung: (jaeger: Jaeger) => void;
    standBesetzt: (stand: StandAssignment) => void;
    standDefekt: (stand: StandAssignment) => void;
    umleitungErforderlich: (jaeger: Jaeger, neuerStand: StandAssignment) => void;
  };
}

/**
 * Bergetrupp-Management
 * Organisiert das Bergen von erlegtem Wild
 */
interface BergeTrupp {
  id: UUID;
  name: string;                    // "Bergetrupp Nord"
  
  // Team
  leiter: Jaeger;
  helfer: Jaeger[];
  fahrzeuge: Array<{
    typ: 'gelaendewagen' | 'traktor' | 'quad' | 'argo';
    kennzeichen?: string;
    kapazitaet: number;            // Wie viele Stück Wild
    ausruestung: string[];         // ["Seilwinde", "Wildwanne", "Anhänger"]
  }>;
  
  // Aktuelle Einsätze
  offeneAuftraege: Array<{
    id: UUID;
    wildPosition: GPSKoordinaten;
    wildArt: WildArt;
    gewichtGeschaetzt: number;     // kg
    jaeger: Jaeger;                // Wer hat erlegt
    zeitpunkt: Date;
    prioritaet: 'niedrig' | 'mittel' | 'hoch' | 'sofort';
    status: 'gemeldet' | 'unterwegs' | 'wird_geborgen' | 'abgeschlossen';
    besonderheiten?: string;       // "Schwer zugänglich", "In Bach", etc.
  }>;
  
  // Sammelstellen
  wildsammelstellen: Array<{
    position: GPSKoordinaten;
    name: string;
    kapazitaet: number;
    kuehlungVerfuegbar: boolean;
    aktuelleBelegung: number;
    wildListe: Array<{
      wildArt: WildArt;
      anzahl: number;
      zeitpunktEinlieferung: Date;
    }>;
  }>;
  
  // Kommunikation & Tracking
  funkKanal: FunkChannel;
  position: GPSKoordinaten;
  status: 'bereit' | 'im_einsatz' | 'pause' | 'nicht_verfuegbar';
  
  // Statistik
  geborgenesWild: number;
  durchschnittlicheBergezeit: number; // Minuten
  weitesterTransport: number;     // Meter
}

/**
 * Nachsuche-Koordination
 * Für verwundetes/flüchtiges Wild
 */
interface NachsucheEinsatz {
  id: UUID;
  gesellschaftsjagdId: UUID;
  
  // Meldung
  gemeldetVon: Jaeger;
  gemeldetAm: Date;
  schussPosition: GPSKoordinaten;
  
  // Wild-Info
  wildArt: WildArt;
  geschlecht?: 'männlich' | 'weiblich' | 'unbekannt';
  schaetzGroesse?: string;
  
  // Schuss-Details
  schussentfernung?: number;       // Meter
  trefferlage?: string;            // "Kammer", "Träger", "Keule", etc.
  schweissVorhanden: boolean;      // Blut gefunden?
  schweissMenge: 'wenig' | 'mittel' | 'stark';
  fluchtrichtung?: number;         // Grad (0-360)
  fluchtdistanz?: number;          // Meter (geschätzt)
  
  // Nachsuche-Team
  hundefuehrer: Jaeger;
  hund: Hund;
  begleiter: Jaeger[];
  
  // Nachsuche-Verlauf
  startZeit: Date;
  nachsucheRoute: Array<{
    timestamp: Date;
    position: GPSKoordinaten;
    ereignis: 'schweiss_gefunden' | 'spur_verloren' | 'wild_gestellt' | 
              'wild_erlegt' | 'abbruch' | 'notiz';
    beschreibung?: string;
    foto?: MediaRef;
  }>;
  
  // Karten-Layer für Nachsuche
  nachsucheKarte: {
    schussort: GPSKoordinaten;
    anschusszeichen: {
      position: GPSKoordinaten;
      typ: 'schweiss' | 'haar' | 'losung' | 'bruch' | 'spur';
      beschreibung: string;
      foto?: MediaRef;
    }[];
    nachsucheStrecke: GPSKoordinaten[];  // Hunderoute
    fundort?: GPSKoordinaten;
    sperrzone?: Polygon;           // Bereich der nicht betreten werden soll
  };
  
  // Ergebnis
  status: 'laufend' | 'erfolgreich' | 'erfolglos' | 'abgebrochen';
  endZeit?: Date;
  wildGefunden: boolean;
  fundPosition?: GPSKoordinaten;
  totOderLebendig?: 'tot' | 'lebend' | 'verendet';
  bemerkungen?: string;
  
  // Zeitverlauf wichtig für Dokumentation
  dauer: number;                   // Minuten
  distanz: number;                 // Meter
}

/**
 * Karten-Overlay Typen für verschiedene Jagd-Phasen
 */
interface JagdKartenOverlay {
  id: UUID;
  typ: KartenOverlayTyp;
  sichtbarFuer: JaegerRolle[];
  aktiv: boolean;
  opacity: number;                 // 0-1
  zIndex: number;                  // Layer-Reihenfolge
}

enum KartenOverlayTyp {
  // Basis-Layer
  STANDORTE = 'standorte',         // Hochsitz-Positionen
  REVIERGRENZEN = 'grenzen',
  VERBOTSZONEN = 'verboten',
  
  // Jagd-spezifisch
  TREIBLINIEN = 'treiben',
  DRUECKTRUPPS = 'trupps',
  ANSTELLER_ROUTEN = 'ansteller',
  BERGE_POSITIONEN = 'bergen',
  NACHSUCHE_AKTIV = 'nachsuche',
  
  // Wild-Daten
  ABSCHUSS_POSITIONEN = 'abschuesse',
  SICHTUNGEN = 'sichtungen',
  WILD_WECHSEL = 'wechsel',
  WILD_VORKOMMEN_HEATMAP = 'heatmap',
  
  // Tracking
  JAEGER_LIVE = 'jaeger_live',
  HUNDE_LIVE = 'hunde_live',
  DROHNEN_LIVE = 'drohnen_live',
  FAHRZEUGE = 'fahrzeuge',
  
  // Umwelt
  WETTER_WIND = 'wind',
  WETTER_NIEDERSCHLAG = 'niederschlag',
  GELANDE_HOEHEN = 'terrain',
  VEGETATION = 'vegetation',
  
  // Sicherheit
  GEFAHRENZONEN = 'gefahren',
  NOTFALL_POSITIONEN = 'notfall',
  SAMMELSTELLEN = 'sammeln',
  RETTUNGSPUNKTE = 'rettung',
}

/**
 * Dezenter Kompass für Karte
 */
interface KartenKompass {
  // Position auf Screen
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';  // 40px, 60px, 80px
  
  // Styling
  stil: 'minimal' | 'klassisch' | 'modern' | 'taktisch';
  opacity: number;                 // 0.3-1.0 (dezent!)
  showDegrees: boolean;            // Zeige Gradzahl?
  showCardinal: boolean;           // Zeige N/S/E/W?
  
  // Funktionalität
  rotateWithMap: boolean;          // Dreht mit wenn Karte rotiert
  showNorthArrow: boolean;         // Roter Nord-Pfeil
  magneticNorth: boolean;          // Magnetisch vs. geografisch
  
  // Interaktiv
  tappable: boolean;               // Tap = Karte nach Norden drehen
  longPressActions: {
    resetOrientation: boolean;     // Long Press = Reset Karte
    showCoordinates: boolean;      // Zeige GPS-Koordinaten
  };
  
  // Wind-Integration
  showWindDirection: boolean;      // Zeige aktuellen Wind
  windIndicatorColor: string;
}

/**
 * Erweiterte Fahrzeug-Verwaltung
 */
interface FahrzeugTracking {
  id: UUID;
  kennzeichen: string;
  typ: 'gelaendewagen' | 'traktor' | 'quad' | 'argo' | 'motorrad' | 'pkw';
  
  // Zuordnung
  fahrer: Jaeger;
  insassen: Jaeger[];
  verwendung: 'ansteller' | 'bergen' | 'nachsuche' | 'jagdleitung' | 'versorgung';
  
  // Tracking
  position?: GPSKoordinaten;
  geschwindigkeit?: number;        // km/h
  richtung?: number;               // Grad
  
  // Kapazität
  sitzplaetze: number;
  ladeflaeche: {
    kapazitaetKg: number;
    kapazitaetStueck: number;      // Wild-Stücke
    aktuelleLast: number;
  };
  
  // Ausrüstung
  ausruestung: string[];           // ["Seilwinde", "Bergegurt", "Erste Hilfe"]
  funkGeraet: boolean;
  
  // Status
  status: 'bereit' | 'im_einsatz' | 'beladen' | 'defekt' | 'voll';
  tankstand?: number;              // %
}

// ===================================
// LIVE-TRACKING
// ===================================

interface TrackingSnapshot {
  id: UUID;
  timestamp: Date;
  
  // Positions-Snapshot
  participants: {
    jaeger: Array<{
      id: UUID;
      jaeger: Jaeger;
      position: GPSKoordinaten;
      accuracy: number;
      speed?: number;             // km/h
      richtung?: number;          // Grad
      aktivitaet: ParticipantActivity;  // 'unterwegs', 'stand', 'wartend', etc.
      batteryLevel?: number;      // % wenn Smartwatch
      signalStrength?: number;    // GPS-Signal
    }>;
    
    hunde: Array<{
      id: UUID;
      hund: Hund;
      position: GPSKoordinaten;
      gpsDevice: 'garmin' | 'airtag' | 'halsband' | 'tracker';
      speed?: number;
      aktivitaet: DogActivity;    // 'suchen', 'punkt', 'folgen', 'rueckruf'
      batterieLevel?: number;
    }>;
    
    drohnen: Array<{
      id: UUID;
      drohne: Drohne;
      position: GPSKoordinaten;
      altitude: number;           // Meter
      heading: number;            // Flugrichtung
      speed: number;
      batteryLevel: number;       // % (critical info!)
      status: DroneStatus;        // 'flying', 'hovering', 'returning', 'landed'
      videoStream?: {
        url: string;              // RTMP oder RTSP
        codec: 'h264' | 'h265';
        resolution: '1080p' | '2k' | '4k';
        thermalMode: boolean;
      };
    }>;
  };
  
  // Ereignisse in diesem Snapshot
  events: JagdEvent[];
  
  // Metadaten
  dataQuality: {
    gpsAccuracy: number;
    totalParticipants: number;
    participantsWithSignal: number;
  };
}

interface JagdEvent {
  id: UUID;
  timestamp: Date;
  type: JagdEventType;
  
  // Schuss-Ereignis
  if (type === 'schuss') {
    jaeger: Jaeger;
    standAssignment: StandAssignment;
    wildArt: WildArt;
    position: GPSKoordinaten;
    schussrichtung?: number;
    schuesse: number;
    ergebnis: 'treffer' | 'fehler' | 'unsicher';
    wildPosition?: GPSKoordinaten;  // Wo war die Sau?
  }
  
  // Sichtung
  else if (type === 'sichtung') {
    jaeger: Jaeger;
    wildArt: WildArt;
    anzahl: number;
    position: GPSKoordinaten;
    beschreibung: string;
    foto?: MediaRef;
  }
  
  // Hund-Ereignis
  else if (type === 'hund_punkt') {
    hund: Hund;
    position: GPSKoordinaten;
    wildArt?: WildArt;
    zeitpunkt: Date;
  }
  
  // Drohnen-Sichtung
  else if (type === 'drohne_sichtung') {
    drohne: Drohne;
    geoPosition: GPSKoordinaten;
    wildArt?: WildArt;
    anzahl?: number;
    thermalSignatur?: boolean;
    foto?: MediaRef;
  }
  
  // Notfall
  else if (type === 'notfall') {
    jaeger: Jaeger;
    position: GPSKoordinaten;
    schweregrad: 'minor' | 'major' | 'critical';
    beschreibung: string;
    nothilfeAngefordert: boolean;
  }
  
  severity: 'info' | 'warning' | 'critical';
  publicVisibility: boolean;
  organisatorNotification: boolean;
}

// ===================================
// FUNK-KOMMUNIKATION
// ===================================

interface FunkChannel {
  id: UUID;
  name: string;                    // "Hauptkanal", "Drohnen", "Jagdleitung"
  frequenz?: string;               // "166.250 MHz" (falls analog)
  digitalStandard?: string;        // "DMR", "P25", "Tetra"
  
  // Teilnehmer
  aktuelleNutzer: Jaeger[];
  maxNutzer: number;
  
  // Messages (für Digital)
  nachrichtenVerlauf?: {
    timestamp: Date;
    sender: User;
    text: string;
    voiceClip?: MediaRef;
    position?: GPSKoordinaten;
  }[];
  
  // Richtlinien
  freigebenVon: Time;
  freigebenBis: Time;
  
  // Status
  aktiv: boolean;
  qualitaet: number;               // 0-100%
}

// ===================================
// TEILNEHMER-ROLLEN
// ===================================

enum JaegerRolle {
  ORGANISATOR = 'organisator',      // Jagdleiter
  HOCHSITZER = 'hochsitzer',        // Am Hochsitz
  TREIBER = 'treiber',              // In Treiberlinie
  PISSVORSTELLER = 'pissvorsteller', // Positioniert Wild
  NACHSUCHER = 'nachsucher',        // Für Nachsuche-Team
  DROHNENPILOT = 'drohnenpilot',    // Betreibt Drohne
  HUNDEFUEHRER = 'hundefuehrer',    // Leitet Hund
  HELFER = 'helfer',                // Allgemeiner Helfer
  SANITTER = 'sanitter',            // Erste Hilfe
}

interface Jaeger {
  id: UUID;
  user: User;
  rolle: JaegerRolle;
  
  // Erfahrung & Profil
  erfahrungJahre: number;
  erfahrungLevel: 'anfaenger' | 'fortgeschritten' | 'experte';
  spezialisierung?: string[];       // ["Schwarzwild", "Drohnen"]
  
  // Equipment
  waffen: Waffe[];
  ausruestung: Equipment[];
  funkGeraet?: FunkGeraet;
  smartwatch?: Smartwatch;
  
  // Status während Jagd
  statusAktuell: ParticipantStatus;
  position?: GPSKoordinaten;
  lastUpdate: Date;
  
  // Kontakt
  telefon: string;
  notfallKontakt?: EmergencyContact;
  
  // Jagd-Statistik
  erfolgsquote: number;            // % aus Vergangenheit
  meldepflicht: boolean;           // Verpflichtet zu Meldung?
}

interface Hund {
  id: UUID;
  name: string;
  owner: Jaeger;
  
  // Stammdaten
  rasse: string;                   // "Deutscher Jagdterrier"
  alter: number;                   // Jahre
  geschlecht: 'M' | 'F';
  gewicht: number;                 // kg
  hp_geprueft: boolean;            // Jagdliche Eignung
  
  // Spezialisierung
  spezialisierung: HundSpezialisierung; // 'flaechensucher' | 'brackierer' | etc.
  trainingsstand: 'anfaenger' | 'fortgeschritten' | 'pruefer';
  
  // Tracking-Geraet
  gpsDevice?: {
    type: 'garmin' | 'airtag' | 'halsband' | 'collar_tracker';
    deviceId: string;
    batteryPercent: number;
    lastSignal: Date;
  };
  
  // Versicherung
  jagdhaftpflicht: {
    versicherer: string;
    versicherungsnummer: string;
    gultigBis: Date;
  };
  
  // Status
  aktivAufDerJagd: boolean;
  position?: GPSKoordinaten;
  verhalten: HundVerhalten;        // 'ruhig', 'sucht', 'punkt', 'aktiv'
  
  // Medizinisches
  impfungen: {
    tollwut: Date;
    staupe: Date;
    // ...
  };
  besonderheiten?: string;         // Allergien, Verletzungen, etc.
}

interface Drohne {
  id: UUID;
  name: string;
  pilot: Jaeger;
  
  // Hardware
  modell: string;                  // "DJI Air 3S"
  hersteller: 'dji' | 'parrot' | 'andere';
  serienNummer: string;
  
  // Sensoren
  kamera: {
    typ: 'rgb' | 'thermal' | 'hybrid';
    megapixel: number;
    gimbal: boolean;
    optischerZoom: number;
  };
  maxFlugzeit: number;             // Minuten
  maxEntfernung: number;           // Meter
  maxAlive: number;                // Meter
  
  // Status live
  batterieLevel: number;           // %
  signalStrength: number;          // dBm
  position?: GPSKoordinaten;
  altitude: number;                // Meter
  flugzeit: number;                // Aktuelle Flugzeit
  status: 'bereit' | 'fliegt' | 'ruckkehr' | 'gelandet' | 'fehler';
  
  // Video-Stream
  livestream?: {
    enabled: boolean;
    url: string;
    codec: 'h264' | 'h265';
    latency: number;               // ms
  };
  
  // Versicherung
  drohnenversicherung: {
    versicherer: string;
    gultigBis: Date;
  };
  
  // Zertifizierung
  lizenz: 'a1' | 'a2' | 'a3';     // EU-Drohnen-Kategorien
}

// ===================================
// JAGD-STATISTIKEN & ERGEBNISSE
// ===================================

interface HuntStatistics {
  id: UUID;
  gesellschaftsjagdId: UUID;
  
  // Übersicht
  gesamtAbschuesse: number;
  abschuessePro: Record<WildArt, number>;
  
  // Details
  erfolgreicheJaeger: Array<{
    jaeger: Jaeger;
    abschuesse: number;
    wildarten: Record<WildArt, number>;
  }>;
  
  // Pro Stand
  proStand: Array<{
    stand: StandAssignment;
    abschuesse: number;
    wildarten: Record<WildArt, number>;
    effektivitaet: number;         // %
  }>;
  
  // Zeitverlauf
  zeitverlauf: Array<{
    uhrzeit: Time;
    abschuesseBisHier: number;
    ereignisse: JagdEvent[];
  }>;
  
  // Qualitätsmetriken
  durchschnittlicheSchussentfernung: number; // Meter
  trefferquote: number;                       // %
  treffersicherheit: number;                  // % auf Vitale
  
  // Wildpret-Qualität
  wildpretqualitaet: {
    ausgezeichnet: number;
    gut: number;
    maengel: number;
    nichtVerwertbar: number;
  };
  
  // Trophäen
  trophaenanteile: Array<{
    wildart: WildArt;
    durchschnittspunkte: number;
    hochstepunkte: number;
    bestTrophae: Trophae;
  }>;
  
  // Effizienz
  abschuessePruendeMangel: number;
  abschuessePstunde: number;
  
  // Beteiligte
  teilnehmeranzahl: number;
  hundeSucheinsaetze: number;
  drohnenEinsaetze: number;
  
  // Zwischenfälle
  unfaelle: Zwischenfall[];
  verletzte: number;
  todesfaelle: number;
  
  // Zusammenfassung
  gesamt_jagdwert: number;         // 0-100 Punkte
  erfolgsrate: number;
  beurteilung: string;             // Beschreibende Zusammenfassung
  
  // Daten für AI
  trainingsData: {
    weather: EnhancedWeather;
    participants: number;
    time: TimeRange;
    gameOccurrence: Record<WildArt, number>;
    success: boolean;
    metrics: any;
  };
}

interface Zwischenfall {
  id: UUID;
  timestamp: Date;
  type: ZwischenfallTyp;
  betroffen: Jaeger | Hund;
  position: GPSKoordinaten;
  beschreibung: string;
  severitaet: 'minor' | 'major' | 'critical';
  beteiligte: User[];
  massnahmen: string;
  abgeschlossen: boolean;
  notizen: string;
}

```

---

## 🎯 User Journeys

### 1. Jagd-Planung (1-2 Wochen vorher)

```
JAGDORGANISATOR
├─ Neue Gesellschaftsjagd erstellen
│  ├─ Grunddaten (Datum, Revier, Name)
│  ├─ Jagdtyp wählen (Treibjagd/Drückjagd/Ansitz)
│  ├─ Teilnehmer einladen
│  └─ Sicherheitsrichtlinien setzen
│
├─ WENN Drückjagd:
│  ├─ Drückjagd-Trupps erstellen
│  │  ├─ Trupp-Führer bestimmen
│  │  ├─ Mitglieder zuordnen
│  │  ├─ Zonen zuweisen
│  │  ├─ Routen planen
│  │  └─ Funk-Kanäle zuteilen
│  │
│  ├─ Ansteller-System konfigurieren
│  │  ├─ Haupt-Ansteller bestimmen
│  │  ├─ Bereiche zuteilen
│  │  ├─ Fahrtrouten planen
│  │  ├─ Parkplätze definieren
│  │  └─ Zeitplan erstellen
│  │
│  ├─ Bergetrupp organisieren
│  │  ├─ Team zusammenstellen
│  │  ├─ Fahrzeuge zuweisen
│  │  ├─ Sammelstellen festlegen
│  │  └─ Kühlmöglichkeiten prüfen
│  │
│  └─ Nachsuche-Kapazität
│     ├─ Schweißhunde registrieren
│     ├─ Hundeführer benennen
│     ├─ Bereitschafts-Teams
│     └─ Nachsuche-Routen vorbereiten
│
├─ WENN Treibjagd:
│  ├─ Standecken planen
│  │  ├─ Hochsitze auswählen
│  │  ├─ Zielwildart pro Stand definieren
│  │  ├─ Jäger zuordnen
│  │  └─ Zeit-Slots festlegen
│  │
│  └─ Treiberlinien definieren
│     ├─ Gebiet eingrenzen
│     ├─ Treiber-Team zusammenstellen
│     ├─ Route planen
│     └─ Warnsystem einrichten
│
├─ Ressourcen-Check
│  ├─ Funkgeräte prüfen (+ Kanäle testen)
│  ├─ Drohnen verfügbar?
│  ├─ GPS-Tracker für Hunde aktivieren
│  ├─ Fahrzeuge einsatzbereit?
│  ├─ Versicherung prüfen
│  └─ Wildmarken/Plomben bereitstellen
│
└─ Notfallplanung
   ├─ Erste-Hilfe-Person bestimmen
   ├─ Notfall-Kontakte hinterlegen
   ├─ Evakuierungs-Plan
   ├─ Rettungspunkte markieren
   └─ Nächstes Krankenhaus/Tierarzt

TEILNEHMER (Jäger)
├─ Einladung erhalten & akzeptieren
├─ Rolle zugewiesen bekommen:
│  ├─ Hochsitzer → Stand-Info erhalten
│  ├─ Treiber/Drücker → Trupp-Info erhalten
│  ├─ Ansteller → Bereiche & Routen
│  └─ Bergetrupp → Fahrzeug & Ausrüstung
├─ Anstell-Karte studieren
├─ Ausrüstung checken
├─ Verfügbarkeit bestätigen
└─ Equipment-Checkliste abhaken
```

### 2. Tag der Jagd - Vorbereitung (Morgens)

```
05:00 - Ankunft
├─ GPS-Position registriert
├─ Funk-Verbindung getestet
├─ Ausrüstung geprüft
└─ Teilnehmer-Check-in

05:30 - Jagdleiter-Briefing
├─ Wetterlage besprechen
├─ Revierbesonderheiten
├─ Sicherheitsrichtlinien
├─ Signale/Funk-Protokoll
└─ Notfall-Verfahren

06:00 - Hunde-Vorbereitung
├─ GPS-Tracker aktivieren
├─ Vitals überprüfen
├─ Im Revier positionieren
└─ Lebend-Tracking starten

06:15 - Positionen einnehmen
├─ Hochsitzer fahren zu Ständen
├─ Treiber in Position
├─ Pissvorsteller aufgestellt
├─ Drohne startklar

06:30 - JagdStart
├─ Live-Tracking aktiviert
├─ Wetter-Updates starten
├─ Funk-Kanal aktiv
└─ Erste Sichtungen melden
```

### 3. Während der Jagd - Live-Koordination

```
JAGDLEITER (Zentrale)
├─ Monitore Live-Karte
│  ├─ Alle Teilnehmer-Positionen
│  ├─ Hund-Tracking
│  ├─ Drohnen-Video
│  └─ Wetterentwicklung
├─ Koordiniert Bewegungen
│  ├─ "Treiberlinie 2 bereit?"
│  ├─ "Hochsitzer 7, Wild kommt!"
│  ├─ "Drohne, Suchzone erweitern"
│  └─ "Nachsuche-Team in Position"
├─ Notfall-Management
│  ├─ Hund geht in Punkt
│  ├─ Schuss gemeldet
│  ├─ Notfall-Alarm
│  └─ Kommunikation mit allen
└─ Statistik-Erfassung
   ├─ Abschuss melden
   ├─ Wild-Position erfassen
   ├─ Trophae-Info notieren
   └─ Fotos hochladen

HOCHSITZER
├─ Position halten
├─ Funk abhören
├─ Wild-Bewegungen beobachten
├─ Bei Schuss:
│  ├─ "Schuss von Stand 4!"
│  ├─ "Schwarzwild 3-teilig"
│  ├─ "Einer fällt"
│  └─ Position teilen
└─ Nach Schuss:
   ├─ Wildposition/Fluchtrichtung melden
   ├─ Keine weitere Jagd am Stand
   └─ Auf Nachsuche warten

TREIBER
├─ Folgen Route
├─ Geräusche machen
├─ Hunde kontrollieren
├─ Funk-Kontakt halten
├─ Wild-Sichtungen melden
│  ├─ "Rehwild links"
│  ├─ "Rotte nach Norden"
│  └─ "Position: [GPS]"
└─ Sicherheitszone beachten

DROHNEN-PILOT
├─ Fliegt geplante Route
├─ Livestream aktiviert
├─ Thermalkamera aktiv
├─ Bei Wild-Sichtung:
│  ├─ Position melden
│  ├─ Anzahl erfassen
│  ├─ Fluchtrichtung dokumentieren
│  └─ Foto/Video aufnahmen
└─ Batterielevel monitoren
   ├─ Warning bei 30%
   ├─ Return bei 15%
   └─ Landing gemeldet
```

### 4. Nach der Jagd - Abschluss

```
16:00 - Jagd-Ende
├─ Alle Teilnehmer sammelnsich
├─ Funks abschalten
├─ GPS-Tracking beenden
├─ Hunde kontrollieren
└─ Equipment verstauen

16:30 - Erste Auswertung
├─ Live-Statistiken zeigen
├─ Erfolgsquote nach Stand
├─ Bestes Wild zeigen
├─ Trophaen-Bewertung
└─ Dank an Teilnehmer

17:00 - Detailauswertung
├─ Alle Abschüsse dokumentieren
├─ Trophae-Punkte ermitteln
├─ Wildpret-Qualität bewerten
├─ Fotos & Videos zuordnen
├─ Teilnehmer-Feedback einholen
└─ Bericht generieren

17:30+ - Report-Generierung
├─ PDF-Report mit Statistiken
├─ Jagdpass-Eintrag
├─ Versicherungs-Bericht
├─ Wildpret-Verwertung
├─ Zertifikate & Urkunden
└─ Archivierung

REPORTS:
├─ Jagd-Übersichts-Report
├─ Teilnehmer-Statistik
├─ Trophae-Übersicht
├─ Versicherungs-Report
├─ Drohnen-Einsatz-Report
├─ Sicherheits-Incident-Report
└─ Archivierung für später
```

---

## 🔐 Sicherheitssystem

### 1. Authentifizierung & Berechtigungen

```
ROLLEN & RECHTE:
├─ Admin
│  └─ Alles
├─ Jagdorganisator
│  ├─ Jagden erstellen/bearbeiten
│  ├─ Teilnehmer verwalten
│  ├─ Live-View & Koordination
│  ├─ Statistik-Zugriff
│  └─ Reports generieren
├─ Jagdleiter (während Jagd)
│  ├─ Live-Koordination
│  ├─ Funk-Kommunikation
│  ├─ Notfall-Management
│  └─ Event-Protokollierung
├─ Hochsitzer
│  ├─ Eigene Position sehen
│  ├─ Funk hören
│  ├─ Abschüsse melden
│  └─ Beobachtungen eintragen
├─ Treiber
│  ├─ Route sehen
│  ├─ Funk hören
│  ├─ Positionen melden
│  └─ Wildmeldungen
└─ Gast
   ├─ Nur Zuschau
   ├─ Keine Funknutzung
   └─ Keine Position sichtbar
```

### 2. Datenschutz & Sichtbarkeit

```
POSITION-SICHTBARKEIT:
├─ Hochsitzer-Position
│  ├─ Organisator: Immer sichtbar
│  ├─ Andere Hochsitzer: Nur während aktiver Jagd
│  ├─ Treiber: Nur grobe Richtung
│  └─ Nach Jagd: Nicht mehr sichtbar
├─ Treiber-Positionen
│  ├─ Organisator: Immer
│  ├─ Jagdleiter: Immer
│  ├─ Andere Treiber: Nur Treiberlinie
│  └─ Hochsitzer: Keine Position (nur "Wild kommt!")
└─ Drohnen-Positionen
   ├─ Öffentlich sichtbar (Luftraum-Sicherheit)
   └─ Mit Flugzone-Warnung
```

### 3. Notfall & Sicherheit

```
NOTFALL-PROTOKOLL:
├─ Persönlicher Notfall
│  ├─ Rote "SOS"-Taste auf Telefon
│  ├─ Sofortige Benachrichtigung Jagdleiter
│  ├─ Position wird permanent angezeigt
│  ├─ Übernahme der Kommunikation
│  └─ Optional: Notarzt-Anruf
│
├─ Wildunfall / Nachsuche-Notfall
│  ├─ Verwundetes Wild im Wald
│  ├─ Spürhund wird alarmiert
│  ├─ Nachsuche-Team zusammengezogen
│  └─ Position aller Beteiligten gezeigt
│
└─ Waffenunfall
   ├─ Unerwarteter Schuss
   ├─ Verletztes Wild in Treiberlinie
   ├─ Alle Beteiligten stoppen
   ├─ Gesamte Zone blockiert
   └─ Rettung auslösen
```

---

## 📊 Datenvisualisierung

### Live-Karten-Ansicht
```
┌─────────────────────────────────────┐
│  JAGDVERWALTUNGS-ZENTRUM             │
│  Hirschjagd Revier Müller            │
│  Start: 06:30  Dauer: 9h  Status: ▶ │
├─────────────────────────────────────┤
│                                     │
│     [  LIVE KARTE ]                 │
│                                     │
│  ▲ = Hochsitzer (9 Positionen)     │
│  ► = Treiber (12 Positionen)       │
│  🚁 = Drohne mit Livefeed          │
│  🐕 = Hunde (5, alle aktiv)        │
│  🎯 = Abschüsse (14 markiert)      │
│  ⚠️ = Gefahrenzonen                │
│                                     │
├─────────────────────────────────────┤
│ STATISTIK ECHTZEIT                  │
│ Abschüsse gesamt: 14 (Ziel: 25)    │
│ Pro Stunde: 1.6 Wildsäue           │
│ Beste Effektivität: Stand 4 (4x)   │
│ Aktive Drohne: 45min / 55min       │
│                                     │
│ FUNK-KANÄLE:                        │
│ Hauptkanal (9/12): "Alles normal"  │
│ Jagdleitung: Online ✓              │
│ Letzte Meldung: vor 2 min          │
│                                     │
│ WETTER LIVE:                        │
│ Wind: SW 4 m/s | 12°C | Wolkig    │
│ Duftv erlauf: SW 150m               │
│ Sicht: Gut                          │
│ Nächster Regen: +30 min             │
└─────────────────────────────────────┘
```

### Detailierter Jagdverlauf
```
CHRONOLOGIE:
┌────────────┬────────────────────────────┬──────────┐
│ Zeit       │ Ereignis                   │ Beteilig │
├────────────┼────────────────────────────┼──────────┤
│ 06:15      │ Jagd startet               │ Alle     │
│ 06:32      │ 🐕 Spürhund zeigt Punkt   │ Hund 3   │
│ 06:45      │ Wild-Sichtung (Rotte 3er) │ Tr. 2    │
│ 06:50      │ 🎯 ABSCHUSS Stand 4        │ Müller   │
│ 06:52      │ 🎯 ABSCHUSS Stand 7        │ Schmidt  │
│ 07:15      │ ⚠️  Drohne Akku 25%        │ Pilot    │
│ 07:16      │ Drohne Landing             │ Pilot    │
│ 07:45      │ Pause & Frühstück          │ Alle     │
│ 08:15      │ Treiberlinie 2 startet     │ Tr. 2    │
│ 08:32      │ 🎯 ABSCHUSS Stand 2        │ Koch     │
│ 09:15      │ 🎯 ABSCHUSS Stand 9        │ Wagner   │
│ ...        │ ...                        │ ...      │
└────────────┴────────────────────────────┴──────────┘
```

---

## 🔄 Integration mit anderen Systemen

### Real-Time Sync
- App ↔ App (über WebSocket)
- App ↔ Web-Portal (über WebSocket)
- Cloud Backup (alle 30 Sekunden)
- Offline-Queue (bei Verbindungsverlust)

### Externe APIs
- **DJI Flight Ops**: Drohnen-Koordination
- **Garmin Connect**: Hund-GPS-Tracking
- **OpenWeatherMap**: Live-Wetterdaten
- **Google Maps API**: Karten-Rendering
- **Mapbox GL**: Web-Karten

### Export & Reporting
- PDF-Reports (detailliert & kompakt)
- CSV-Export (für Verwaltung)
- iCal-Integration (Jagdtermine)
- Email-Versand (Berichte, Urkunden)

---

## 📱 Mobile App Screens

```
FLOW für Jagdorganisator:

[HOME] → [Neue Jagd] → [Grunddaten eintragen]
           ↓
        [Teilnehmer laden] → [Standecken planen]
           ↓
        [Treiberlinien] → [Sicherheit einrichten]
           ↓
        [Review & Start]
           ↓
        [LIVE JAGD SCREEN]
           │
           ├─ [Live Karte] - Alle Positionen
           ├─ [Funk Chat] - Kommunikation
           ├─ [Statistik] - Echtzeit-Zahlen
           ├─ [Wetter] - Live Update
           └─ [Notfall] - SOS Buttons
           ↓
        [Jagd beenden] → [Abschüsse dokumentieren]
           ↓
        [Trophae-Bewertung] → [Report generieren]
           ↓
        [Archiv & Sharing]
```

---

## 🚀 Implementation Phases

### Phase 6A: Core Structure (3 Wochen)
- [ ] Datenbank-Schema aufsetzen
- [ ] Type-Definitions komplettieren
- [ ] CRUD-Operationen implementieren
- [ ] Authentifizierung & Rollen

### Phase 6B: Planung (3 Wochen)
- [ ] Stand-Management UI
- [ ] Teilnehmer-Verwaltung
- [ ] Treiberlinie-Editor
- [ ] Sicherheits-Konfiguration

### Phase 6C: Live-Execution (4 Wochen)
- [ ] Real-Time Tracking
- [ ] Funk-Kommunikation (Mock)
- [ ] Event-Protokollierung
- [ ] Notfall-System

### Phase 6D: Auswertung & Export (2 Wochen)
- [ ] Report-Generator
- [ ] Statistik-Analyse
- [ ] PDF-Export
- [ ] Archivierung

---

**Status**: 🟢 Design Complete, Ready for Implementation  
**Nächster Schritt**: Sprint Planning für Phase 6
