/**
 * GESELLSCHAFTSJAGD TYPES
 * Phase 6: Group Hunting Management
 * HNTR LEGEND Pro
 */

import { z } from 'zod';
import { GPSKoordinaten } from './common';

// ============================================================================
// JAGD-TYP & BASIS
// ============================================================================

export type JagdTyp = 
  | 'drueckjagd'          // Drückjagd mit Hunden
  | 'treibjagd'           // Treibjagd ohne Hunde
  | 'bewegungsjagd'       // Bewegungsjagd
  | 'ansitzjagd_gruppe'   // Gemeinschaftlicher Ansitz
  | 'riegeljagd'          // Riegeljagd
  | 'sonstiges';

export type TeilnehmerRolle = 
  | 'jagdleiter'
  | 'schuetze'
  | 'treiber'
  | 'hundefuehrer'
  | 'ansteller'
  | 'bergehelfer'
  | 'sanitaeter';

export type StandortTyp = 
  | 'hochsitz'
  | 'bodensitz'
  | 'kanzel'
  | 'ansitzleiter'
  | 'druckposten'
  | 'treiberlinie';

// ============================================================================
// GESELLSCHAFTSJAGD
// ============================================================================

export interface Gesellschaftsjagd {
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

// ============================================================================
// TEILNEHMER
// ============================================================================

export interface Teilnehmer {
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

// ============================================================================
// STANDORTE
// ============================================================================

export interface JagdStandort {
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

export interface StandortZuweisung {
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

// ============================================================================
// TREIBEN
// ============================================================================

export interface Treiben {
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

export interface Treiber {
  teilnehmerId: string;
  position: 'links' | 'mitte' | 'rechts' | 'flanke';
  abstand: number;               // Meter zum nächsten Treiber
  hundeeinsatz: boolean;
}

// ============================================================================
// LIVE EVENTS & KOMMUNIKATION
// ============================================================================

export type LiveEventTyp = 
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

export interface LiveJagdSession {
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

export interface LiveEvent {
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

export interface AbschussEvent extends LiveEvent {
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

export interface WildsichtungEvent extends LiveEvent {
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

export interface NotfallEvent extends LiveEvent {
  typ: 'notfall';
  daten: {
    art: 'unfall' | 'verletzung' | 'verirrung' | 'sonstiges';
    gps: GPSKoordinaten;
    beschreibung: string;
    schweregrad: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
    hilfeBenötigt: boolean;
  };
}

export interface KommunikationsKanal {
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

export interface Channel {
  id: string;
  name: string;
  teilnehmer: string[];
  
  // Nachrichten
  nachrichten: Nachricht[];
  
  // Einstellungen
  muteAble: boolean;
  prioritaet: 'normal' | 'hoch' | 'kritisch';
}

export interface Nachricht {
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

type AudioBlob = Blob;
type ImageURI = string;

// ============================================================================
// STRECKE
// ============================================================================

export interface StreckeListe {
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

export interface StreckenAbschuss {
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

export interface StreckeFoto {
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

export interface Trichinenprobe {
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

export interface Wildbretverwertung {
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

// ============================================================================
// PROTOKOLL & RECHTLICHES
// ============================================================================

export interface JagdProtokoll {
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

export interface RechtlicheDokumentation {
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

// ============================================================================
// NOTFALL & SICHERHEIT
// ============================================================================

export interface NotfallSystem {
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

export interface NotfallKontakt {
  name: string;
  rolle: 'sanitaeter' | 'jagdleiter' | 'revierpächter' | 'rettungsdienst';
  telefon: string;
  prioritaet: number;
}

export interface Rettungspunkt {
  id: string;
  nummer: string;               // "RW 123 456"
  gps: GPSKoordinaten;
  beschreibung: string;
  zufahrt: 'pkw' | 'gelaendewagen' | 'zu_fuss';
}

export interface Krankenhaus {
  name: string;
  adresse: string;
  telefon: string;
  entfernung: number;           // km
  fahrtzeit: number;            // Minuten
  gps: GPSKoordinaten;
  notaufnahme: boolean;
}

export interface Notfall {
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

export interface NotfallVerlauf {
  zeitpunkt: Date;
  von: string;                  // Teilnehmer-ID
  aktion: string;
  bemerkung?: string;
}

export interface SicherheitsCheck {
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

// ============================================================================
// STATISTIKEN
// ============================================================================

export interface JagdAuswertung {
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

export interface TeilnehmerStatistik {
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

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface Polygon {
  coordinates: GPSKoordinaten[];
}

// ============================================================================
// ZOD SCHEMAS (Validation)
// ============================================================================

export const GesellschaftsjagdSchema = z.object({
  id: z.string(),
  revierId: z.string(),
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein"),
  typ: z.enum(['drueckjagd', 'treibjagd', 'bewegungsjagd', 'ansitzjagd_gruppe', 'riegeljagd', 'sonstiges']),
  datum: z.date().refine(d => d > new Date(), "Jagd muss in der Zukunft liegen"),
  zeitplan: z.object({
    sammeln: z.date(),
    ansprechen: z.date(),
    jagdBeginn: z.date(),
    jagdEnde: z.date(),
    streckeZeigen: z.date()
  }),
  jagdleiter: z.string(),
  maxTeilnehmer: z.number().min(2).max(100),
  anmeldeschluss: z.date().optional(),
  sicherheit: z.object({
    notfallkontakt: z.string(),
    sammelplatz: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    notfallplan: z.string()
  }),
  regeln: z.object({
    wildarten: z.array(z.string()).min(1),
    schussrichtungen: z.array(z.string()),
    schussEntfernung: z.number().min(50).max(400),
    besondereVorschriften: z.string()
  }),
  status: z.enum(['geplant', 'aktiv', 'abgeschlossen', 'abgesagt'])
});

export const TeilnehmerSchema = z.object({
  id: z.string(),
  jagdId: z.string(),
  name: z.string().min(2),
  telefon: z.string().regex(/^[+]?[\d\s()-]+$/),
  email: z.string().email().optional(),
  rolle: z.enum(['jagdleiter', 'schuetze', 'treiber', 'hundefuehrer', 'ansteller', 'bergehelfer', 'sanitaeter']),
  ausruestung: z.object({
    waffe: z.string(),
    optik: z.string(),
    munition: z.string(),
    signalweste: z.boolean(),
    funkgeraet: z.boolean()
  }),
  anmeldung: z.object({
    status: z.enum(['eingeladen', 'zugesagt', 'abgesagt', 'warteliste'])
  })
});

export const JagdStandortSchema = z.object({
  id: z.string(),
  jagdId: z.string(),
  nummer: z.number().min(1),
  typ: z.enum(['hochsitz', 'bodensitz', 'kanzel', 'ansitzleiter', 'druckposten', 'treiberlinie']),
  gps: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  zugang: z.string().min(5),
  orientierung: z.number().min(0).max(360),
  sicherheit: z.object({
    schussrichtungen: z.array(z.number()),
    sichtfeld: z.object({
      winkel: z.number().min(0).max(360),
      reichweite: z.number().min(50).max(500)
    })
  }),
  status: z.enum(['verfuegbar', 'besetzt', 'gesperrt'])
});

export const StreckenAbschussSchema = z.object({
  id: z.string(),
  jagdId: z.string(),
  schuetzeId: z.string(),
  standortId: z.string(),
  wildart: z.string().min(3),
  geschlecht: z.enum(['männlich', 'weiblich', 'unbekannt']),
  altersklasse: z.string(),
  zeitpunkt: z.date(),
  gps: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  details: z.object({
    schussabgabe: z.object({
      entfernung: z.number().min(10).max(400),
      kugelplatzierung: z.string(),
      sofortTod: z.boolean(),
      nachsuche: z.boolean()
    })
  }),
  verwertung: z.object({
    aufbrechDatum: z.date(),
    wildbrethygiene: z.boolean(),
    trichinenprobe: z.boolean(),
    verwendung: z.enum(['eigenverbrauch', 'verkauf', 'spende', 'entsorgung'])
  })
});

export const LiveEventSchema = z.object({
  id: z.string(),
  jagdId: z.string(),
  typ: z.enum(['abschuss', 'nachsuche', 'wildsichtung', 'standort_erreicht', 'treiben_start', 'treiben_ende', 'notfall', 'nachricht', 'pause', 'jagd_ende']),
  zeitpunkt: z.date(),
  von: z.string(),
  sichtbarFuer: z.enum(['alle', 'jagdleiter', 'schuetzen', 'treiber'])
});
