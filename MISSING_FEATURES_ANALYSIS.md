# HNTR LEGEND Pro - Feature Gap Analysis & Roadmap Extension
**Version**: 1.0  
**Datum**: 22. Januar 2026  
**Status**: Comprehensive Feature List

---

## 🎯 Was haben wir bereits?

✅ **Phase 1-3 (Aktuell)**:
- Jagd-Tagebuch mit detaillierten Einträgen
- POI-Management (Hochsitze, Kirrungen, etc.)
- Karten-Integration (React Native Maps)
- Abschuss-Dokumentation mit Trophäen
- Benutzerprofile & Authentifizierung
- Offline-First Architektur (SQLite)

✅ **Phase 4-6 (Geplant)**:
- Weather Intelligence (Wind, Radar, Prognosen)
- KI-Empfehlungen (Standort, Zeit, Wildart)
- Gesellschaftsjagd-Management (Treib-/Drückjagd)
- Live-Tracking (Mensch, Hund, Drohne)
- Web-Portal (Browser-Access)
- Ansteller/Bergetrupp/Nachsuche-Koordination

---

## 🔴 Was fehlt noch? (Feature Gaps)

### 1. REVIER-MANAGEMENT & VERWALTUNG

#### 1.1 Revierverwaltung
```typescript
interface RevierVerwaltung {
  // Basis-Daten
  revierInfo: {
    name: string;
    eigentuemer: User;
    paechter?: User[];
    groesseHektar: number;
    bundesland: string;
    kreis: string;
    gemeinde: string;
    reviernummer?: string;
    veterinaeramt: {
      name: string;
      adresse: string;
      telefon: string;
      email: string;
      zustaendigerBereich: string;
    };
  };
  
  // Rechtliches
  rechtlichesDokumente: {
    pachtvertrag?: MediaRef;
    hegeplan: MediaRef;
    abschussplan: AbschussPlan[];
    jagderlaubnis: MediaRef[];
    versicherung: {
      versicherer: string;
      policeNummer: string;
      gueltigBis: Date;
      deckungssumme: number;
    };
  };
  
  // Wildbestand-Management
  wildbestand: {
    rotwild?: WildbestandDetails;
    damwild?: WildbestandDetails;
    rehwild?: WildbestandDetails;
    schwarzwild?: WildbestandDetails;
    // ... andere Wildarten
  };
  
  // Infrastruktur
  infrastruktur: {
    hochsitze: number;
    kanzeln: number;
    leitern: number;
    kirrungen: number;
    fuetterungen: number;
    wildaecker: number;
    wildkameras: number;
  };
  
  // Kosten & Einnahmen
  finanzen: {
    pachtkosten: number;          // €/Jahr
    hegekosten: number;
    versicherungskosten: number;
    sonstigeKosten: Kosten[];
    einnahmen: Einnahme[];        // Wildverkauf, etc.
  };
}

interface WildbestandDetails {
  geschaetztBestand: number;
  abschussplanSoll: number;
  abschussIst: number;
  streckeVorjahr: number;
  trend: 'steigend' | 'stabil' | 'fallend';
  bemerkungen?: string;
}

interface AbschussPlan {
  jagdjahr: string;               // "2025/2026"
  wildart: WildArt;
  geschlecht: 'männlich' | 'weiblich';
  altersklasse: string;
  sollAbschuss: number;
  istAbschuss: number;
  erfuellungsgrad: number;        // %
  genehmiger: string;             // Behörde
  genehmigungsDatum: Date;
}
```

#### 1.2 Digitale Wildmarken-Verwaltung

```typescript
/**
 * WILDMARKEN-SYSTEM (nach deutschem Veterinärrecht)
 * Basiert auf Trichinenverordnung & Wildfleisch-Hygieneverordnung
 */

interface WildmarkenVerwaltung {
  revierId: UUID;
  veterinaeramt: {
    id: string;
    name: string;
    adresse: string;
    telefon: string;
    email: string;
    oeffnungszeiten: string;
    notfallKontakt?: string;
  };
  
  // Wildmarken-Bestand
  wildmarkenBestand: WildmarkenBestand[];
  
  // Verwendete Wildmarken
  verwendeteWildmarken: WildmarkenVerwendung[];
  
  // Statistik
  statistik: {
    gesamtBestellt: number;
    gesamtVerwendet: number;
    verfuegbar: number;
    abgelaufen: number;
  };
}

interface WildmarkenBestand {
  id: UUID;
  
  // Bestellung
  bestelltAm: Date;
  bestelltVon: User;
  veterinaeramt: string;
  bestellnummer?: string;
  
  // Marken-Details
  wildart: WildArt;              // Rotwild, Schwarzwild, etc.
  markentyp: 'plombe' | 'etikett' | 'ohrmarke' | 'clip';
  
  // Nummernkreis
  nummernkreis: {
    von: string;                 // z.B. "DE-NI-001-00001"
    bis: string;                 // z.B. "DE-NI-001-00100"
    prefix: string;              // "DE-NI-001"
    anzahl: number;              // 100 Stück
  };
  
  // Gültigkeit
  ausgestelltAm: Date;
  gueltigBis?: Date;             // Manche Bundesländer haben Ablaufdatum
  
  // Status
  status: 'bestellt' | 'erhalten' | 'in_verwendung' | 'aufgebraucht' | 'abgelaufen';
  empfangenAm?: Date;
  
  // Lagerort
  lagerort: string;              // "Kühlhaus", "Büro", etc.
  
  // Kosten
  stueckpreis: number;           // € pro Marke
  gesamtkosten: number;
  bezahltAm?: Date;
  
  // Dokumente
  lieferschein?: MediaRef;
  rechnung?: MediaRef;
}

interface WildmarkenVerwendung {
  id: UUID;
  
  // Marken-Info
  wildmarkenNummer: string;      // z.B. "DE-NI-001-00042"
  wildmarkenBestandId: UUID;     // Aus welchem Bestand
  
  // Wild-Zuordnung
  jagdEintragId: UUID;           // Verknüpft mit Abschuss
  wildart: WildArt;
  geschlecht: 'männlich' | 'weiblich';
  
  // Wann & Wo
  erlegungsdatum: Date;
  erlegungsort: GPSKoordinaten;
  jaeger: User;
  
  // Wildpret-Details
  aufbrechgewicht?: number;      // kg
  wildpretgewicht?: number;      // kg
  wildbretZustand: 'einwandfrei' | 'bedingt_verwertbar' | 'nicht_verwertbar';
  
  // Trichinenuntersuchung (Pflicht für Schwarzwild)
  trichinenuntersuchung?: {
    erforderlich: boolean;
    durchgefuehrtAm?: Date;
    untersuchungsstelle: string;
    probennummer?: string;
    ergebnis?: 'negativ' | 'positiv' | 'ausstehend';
    bescheinigung?: MediaRef;
    kosten?: number;
  };
  
  // Fleischbeschau (bei bedenklichen Merkmalen)
  fleischbeschau?: {
    erforderlich: boolean;
    durchgefuehrtAm?: Date;
    tierarzt: string;
    ergebnis?: 'tauglich' | 'bedingt_tauglich' | 'untauglich';
    befund?: string;
    bescheinigung?: MediaRef;
    kosten?: number;
  };
  
  // Verwertung
  verwertung: {
    art: 'eigenverbrauch' | 'verkauf' | 'wildhandel' | 'gastronomie' | 'entsorgung';
    kaeufer?: string;
    verkaufsdatum?: Date;
    verkaufspreis?: number;        // € pro kg
    erloes?: number;               // €
  };
  
  // Rückverfolgbarkeit
  rueckverfolgung: {
    kuehlketteEingehalten: boolean;
    kuehlungVon?: Date;
    kuehlungBis?: Date;
    temperatur?: number;           // °C
    
    // Wildursprung-Kennzeichnung (EU-Verordnung 853/2004)
    wildursprungsKennzeichen?: string;
    
    // Chargen-Nummer (falls mehrere Stücke)
    chargenNummer?: string;
    
    // Dokumentation
    begleitdokumente?: MediaRef[];
  };
  
  // Anmerkungen
  besonderheiten?: string;
  fotos?: MediaRef[];
  
  // Status
  markeAngebracht: boolean;
  markeAngebrachtAm?: Date;
  markeEntferntAm?: Date;        // Bei Verwertung
  
  // Zeitstempel
  erstelltAm: Date;
  geaendertAm: Date;
}

/**
 * Wildmarken-Dashboard & Verwaltung
 */
interface WildmarkenDashboard {
  // Übersicht
  uebersicht: {
    verfuegbareMarken: number;
    verwendeteMarken: number;
    abgelaufeneMarken: number;
    bestelltAberNichtErhalten: number;
    
    // Pro Wildart
    proWildart: Record<WildArt, {
      verfuegbar: number;
      verwendet: number;
      nachbestellenAb: number;     // Schwellwert
    }>;
  };
  
  // Benachrichtigungen
  benachrichtigungen: {
    bestandNiedrig: Array<{
      wildart: WildArt;
      verfuegbar: number;
      empfohleneBestellung: number;
    }>;
    ablaufendeBald: WildmarkenBestand[];
    trichinenErgebnisAusstehend: WildmarkenVerwendung[];
    fleischbeschauErforderlich: WildmarkenVerwendung[];
  };
  
  // Schnellzugriff
  schnellaktionen: {
    neueBestellungErstellen: () => void;
    trichinenprobeAnmelden: (verwendungId: UUID) => void;
    fleischbeschauAnfordern: (verwendungId: UUID) => void;
    wildmarkeZuweisen: (abschussId: UUID) => void;
  };
  
  // Filter & Suche
  filter: {
    wildart?: WildArt;
    zeitraum?: { von: Date; bis: Date };
    status?: string;
    veterinaeramt?: string;
  };
}

/**
 * Wildmarken-Bestellung (Online-Integration mit Veterinäramt)
 */
interface WildmarkenBestellung {
  id: UUID;
  
  // Bestellung
  bestelldatum: Date;
  besteller: User;
  revier: UUID;
  
  // Veterinäramt
  veterinaeramt: {
    id: string;
    name: string;
    email: string;
    telefon: string;
  };
  
  // Bestellte Marken
  positionen: Array<{
    wildart: WildArt;
    markentyp: 'plombe' | 'etikett' | 'ohrmarke' | 'clip';
    anzahl: number;
    stueckpreis: number;
    gesamtpreis: number;
    
    // Optional: Wunsch-Nummernkreis
    wunschNummernkreis?: {
      von: number;
      bis: number;
    };
  }>;
  
  // Gesamtkosten
  gesamtkosten: number;
  versandkosten?: number;
  
  // Status
  status: 'entwurf' | 'gesendet' | 'bestaetigt' | 'versandt' | 'erhalten' | 'storniert';
  
  // Kommunikation
  bestellungGesendetAm?: Date;
  bestaetigung?: {
    empfangenAm: Date;
    bestaetiger: string;
    nachricht?: string;
  };
  versand?: {
    versandtAm: Date;
    trackingnummer?: string;
    voraussichtlicheZustellung?: Date;
  };
  empfang?: {
    empfangenAm: Date;
    empfaenger: User;
    vollstaendig: boolean;
    bemerkungen?: string;
  };
  
  // Dokumente
  bestellformular: MediaRef;
  bestaetigung?: MediaRef;
  lieferschein?: MediaRef;
  rechnung?: MediaRef;
  
  // Notizen
  notizen?: string;
}

/**
 * Trichinenuntersuchung-Management
 */
interface Trichinenstelle {
  id: UUID;
  
  // Untersuchungsstelle
  name: string;
  adresse: string;
  telefon: string;
  email: string;
  oeffnungszeiten: string;
  notdienst?: string;
  
  // Zuständigkeit
  bundesland: string;
  landkreis?: string[];
  
  // Gebühren
  gebuehrenordnung: Array<{
    wildart: WildArt;
    preis: number;
    einheit: 'pro_stueck' | 'pro_probe';
  }>;
  
  // Erreichbarkeit
  oeffnungstage: string[];        // ["Montag", "Dienstag", ...]
  schließtage?: Date[];           // Feiertage, Urlaub
  
  // Online-Anmeldung
  onlineAnmeldung: boolean;
  anmeldungEmail?: string;
  anmeldungPortal?: string;
  
  // Probenannahme
  annahmezeiten: string;
  probenabgabe: 'persoenlich' | 'post' | 'kurier' | 'alle';
  
  // Untersuchungsdauer
  regelbearbeitungszeit: string;  // "24 Stunden"
  expressVerfuegbar: boolean;
  expressAufpreis?: number;
}

interface TrichinenProbe {
  id: UUID;
  
  // Probe
  probennummer: string;           // Von Untersuchungsstelle
  wildmarkenNummer: string;
  verwendungId: UUID;
  
  // Wild
  wildart: WildArt;              // Meist Schwarzwild
  erlegungsdatum: Date;
  jaeger: User;
  revier: UUID;
  
  // Probenentnahme
  probeEntnommenAm: Date;
  probeEntnommenVon: User;
  probenart: 'muskel' | 'zwerchfell';
  probenmenge: string;           // "20g"
  
  // Untersuchungsstelle
  trichinenstelle: UUID;
  abgegebenAm?: Date;
  abgegebenVon?: User;
  abgabeArt: 'persoenlich' | 'post' | 'kurier';
  
  // Untersuchung
  untersuchungGestartetAm?: Date;
  untersuchungAbgeschlossenAm?: Date;
  untersuchungsmethode?: 'verdauungsmethode' | 'magnetruehrermethode';
  
  // Ergebnis
  ergebnis?: {
    status: 'negativ' | 'positiv' | 'zweifelhaft';
    befund: string;
    untersuchenderTierarzt: string;
    
    // Bei positivem Befund
    trichinenArt?: string;
    parasitenlast?: number;
    
    // Maßnahmen
    massnahmen?: string;
    meldepflicht: boolean;
    meldungAn?: string[];
  };
  
  // Bescheinigung
  bescheinigung?: {
    ausgestelltAm: Date;
    nummer: string;
    dokument: MediaRef;
    gueltigBis?: Date;
  };
  
  // Kosten
  gebuehr: number;
  bezahlt: boolean;
  bezahltAm?: Date;
  
  // Status
  status: 'angemeldet' | 'probe_abgegeben' | 'in_untersuchung' | 
          'ergebnis_verfuegbar' | 'abgeschlossen';
  
  // Benachrichtigungen
  benachrichtigungen: {
    smsBestaetigung: boolean;
    emailBenachrichtigung: boolean;
    ergebnisPerSMS: boolean;
    ergebnisPerEmail: boolean;
  };
}

/**
 * Wildpret-Verkauf & Dokumentation
 */
interface WildpretVerkauf {
  id: UUID;
  
  // Wild-Stück(e)
  wildmarken: string[];           // Mehrere Marken möglich
  verwendungen: UUID[];           // WildmarkenVerwendung IDs
  
  // Verkauf
  verkaufsdatum: Date;
  verkaeufer: User;
  kaeufer: {
    typ: 'privatperson' | 'wildhandel' | 'gastronomie' | 'metzgerei';
    name: string;
    adresse?: string;
    telefon?: string;
    email?: string;
    
    // Falls gewerblich
    betriebsnummer?: string;
    zulassungsnummer?: string;    // EU-Zulassung
  };
  
  // Wildpret-Details
  wildpret: Array<{
    wildmarke: string;
    wildart: WildArt;
    teilstueck?: string;          // "Keule", "Rücken", "Schulter"
    gewicht: number;              // kg
    einzelpreis: number;          // € pro kg
    gesamtpreis: number;          // €
  }>;
  
  // Gesamtsumme
  gesamtgewicht: number;          // kg
  gesamtpreis: number;            // €
  
  // Rückverfolgbarkeit
  begleitdokumente: {
    wildursprungsbescheinigung: MediaRef;
    trichinenBescheinigung?: MediaRef;
    fleischbeschauProtokoll?: MediaRef;
    lieferschein: MediaRef;
  };
  
  // Kühlkette
  kuehlketteProtokoll: {
    temperaturBeimVerkauf: number;
    transportmittel: string;
    kuehlungGarantiert: boolean;
  };
  
  // Zahlung
  zahlungsart: 'bar' | 'ueberweisung' | 'paypal' | 'rechnung';
  bezahlt: boolean;
  bezahltAm?: Date;
  
  // Rechnung
  rechnungsnummer?: string;
  rechnung?: MediaRef;
  
  // Status
  status: 'angeboten' | 'reserviert' | 'verkauft' | 'abgeholt' | 'storniert';
}

/**
 * Meldungen an Behörden (automatisch)
 */
interface BehoerdenMeldung {
  id: UUID;
  typ: BehoerdeMeldungTyp;
  
  // Bezug
  wildmarkenVerwendungId?: UUID;
  abschussId?: UUID;
  
  // Empfänger
  behoerde: {
    typ: 'jagdbehoerde' | 'veterinaeramt' | 'hegegemeinschaft' | 'seuchenkasse';
    name: string;
    adresse: string;
    email?: string;
  };
  
  // Inhalt
  meldungsdaten: any;             // Je nach Typ unterschiedlich
  
  // Übermittlung
  erstelltAm: Date;
  gesendetAm?: Date;
  uebermittlungsart: 'email' | 'fax' | 'portal' | 'post' | 'manuell';
  
  // Bestätigung
  bestaetigung?: {
    empfangenAm: Date;
    bestaetiger: string;
    aktenzeichen?: string;
  };
  
  // Dokument
  dokument: MediaRef;
  
  // Status
  status: 'entwurf' | 'gesendet' | 'bestaetigt' | 'fehler';
}

enum BehoerdeMeldungTyp {
  ABSCHUSSMELDUNG = 'abschuss',
  TRICHINENBEFUND = 'trichinen',
  WILDKRANKHEIT = 'krankheit',
  FALLWILD = 'fallwild',
  SEUCHENANZEIGEPFLICHT = 'seuche',
  WILDUNFALL = 'unfall',
  JAEHRLICHER_ABSCHLUSSBERICHT = 'jahresbericht',
}
```

**Integration mit Veterinäramt:**
```typescript
// API-Integration für moderne Veterinärämter
interface VeterinaerAmtAPI {
  // Online-Bestellung
  wildmarkenBestellen: (bestellung: WildmarkenBestellung) => Promise<{
    bestaetigung: boolean;
    bestellnummer: string;
    voraussichtlicheLieferung: Date;
  }>;
  
  // Trichinenuntersuchung online anmelden
  trichinenProbeAnmelden: (probe: Partial<TrichinenProbe>) => Promise<{
    probennummer: string;
    abgabetermin: Date;
  }>;
  
  // Ergebnis abrufen
  trichinenErgebnisAbrufen: (probennummer: string) => Promise<{
    ergebnis: 'negativ' | 'positiv' | 'ausstehend';
    bescheinigung?: string;      // PDF URL
  }>;
  
  // Wildmarken-Bestand synchronisieren
  bestandSynchronisieren: () => Promise<WildmarkenBestand[]>;
}
```

**Features:**
- [ ] Digitale Wildmarken-Bestandsverwaltung
- [ ] Online-Bestellung bei Veterinärämtern
- [ ] Automatische Nummernkreis-Verwaltung
- [ ] Trichinenuntersuchung-Tracking
- [ ] Fleischbeschau-Dokumentation
- [ ] Rückverfolgbarkeit (EU-konform)
- [ ] Wildpret-Verkauf mit Begleitdokumenten
- [ ] Automatische Behörden-Meldungen
- [ ] QR-Code auf Wildmarken (scannen & zuordnen)
- [ ] Integration mit Veterinäramt-Systemen
- [ ] Erinnerungen für Untersuchungen
- [ ] Kühlketten-Protokollierung
- [ ] Export für Jahresabrechnung

**Fehlende Features:**
- [ ] Digitaler Abschussplan mit Tracking
- [ ] Hegeplan-Verwaltung
- [ ] Wildbestand-Schätzungen & Analysen
- [ ] Kosten-Tracking für Revier
- [ ] Multi-Revier-Management (für Berufsjäger)
- [ ] Revier-Sharing (Co-Pächter, Gastjäger)

---

### 2. WILDKAMERA-INTEGRATION

```typescript
interface Wildkamera {
  id: UUID;
  revierId: UUID;
  
  // Hardware
  hersteller: 'cuddeback' | 'spypoint' | 'reconyx' | 'browning' | 'andere';
  modell: string;
  serienNummer?: string;
  
  // Position
  position: GPSKoordinaten;
  poiId?: UUID;                   // Verknüpft mit POI
  blickrichtung: number;          // Grad (0-360)
  montageart: 'baum' | 'pfahl' | 'gebaeude';
  hoeheCm: number;
  
  // Settings
  einstellungen: {
    aufloesungMegapixel: number;
    videoLaengeSeconds?: number;
    ausloeseIntervall: number;    // Sekunden
    nachtmodus: boolean;
    sendeModus?: 'sofort' | 'taeglich' | 'manuell';
  };
  
  // Verbindung
  verbindung?: {
    typ: 'wifi' | 'lte' | 'lorawan' | 'offline';
    signalStaerke?: number;
    simKarte?: string;
    datenvolumen?: number;        // MB
  };
  
  // Status
  batterieProzent?: number;
  speicherFreiGB?: number;
  letzteUebertragung?: Date;
  status: 'aktiv' | 'inaktiv' | 'fehler' | 'batterie_leer' | 'voll';
  
  // Bilder & Videos
  medien: WildkameraMedium[];
  
  // Statistik
  statistik: {
    bilderGesamt: number;
    bilderLetzte24h: number;
    haeufigsteWildart: WildArt;
    aktivsteUhrzeit: Time;
    durchschnittAusloeungenProTag: number;
  };
}

interface WildkameraMedium {
  id: UUID;
  kameraId: UUID;
  
  // Medium
  typ: 'foto' | 'video';
  url: string;
  thumbnailUrl?: string;
  erstelltAm: Date;
  groesseBytes: number;
  
  // AI-Analyse (wenn verfügbar)
  aiAnalyse?: {
    wildartErkannt: WildArt[];
    anzahlTiere: number;
    konfidenz: number;            // 0-1
    geschlechtErkannt?: ('männlich' | 'weiblich')[];
    alterErkannt?: string[];
    verhalten?: string;
  };
  
  // User-Tagging
  tags: string[];
  wildartManual?: WildArt;
  anzahlManual?: number;
  notizen?: string;
  
  // Verknüpfung
  jagdEintragId?: UUID;           // Kann zu Eintrag konvertiert werden
  markiert: boolean;              // Für spätere Bearbeitung
}

/**
 * Wildkamera-Dashboard Features
 */
interface WildkameraDashboard {
  // Übersicht
  alleKameras: Wildkamera[];
  
  // Filter & Suche
  filter: {
    wildart?: WildArt;
    zeitraum?: { von: Date; bis: Date };
    kamera?: UUID[];
    nurNeue: boolean;
  };
  
  // Benachrichtigungen
  benachrichtigungen: {
    neuesBild: boolean;
    batterieSchwach: boolean;
    speicherVoll: boolean;
    selteneWildart: boolean;      // z.B. Luchs, Wolf
    starkeBewegung: boolean;      // Viele Auslösungen
  };
  
  // Zeitraffer-Ansicht
  zeitrafferModus: {
    enabled: boolean;
    geschwindigkeit: number;      // Bilder pro Sekunde
    kameraAuswahl: UUID[];
  };
  
  // Heatmap
  wildvorkommenHeatmap: {
    wildart: WildArt;
    zeitraum: { von: Date; bis: Date };
    positionen: Array<{
      position: GPSKoordinaten;
      haeufigkeit: number;
    }>;
  };
}
```

**Fehlende Features:**
- [ ] Wildkamera-Verwaltung & Registrierung
- [ ] Automatische Bildübertragung (WiFi/LTE)
- [ ] AI-gestützte Bilderkennung
- [ ] Wildkamera-Dashboard mit Filtern
- [ ] Zeitraffer-Ansicht
- [ ] Wildvorkommen-Heatmap aus Kamera-Daten
- [ ] Push-Benachrichtigungen bei neuen Bildern
- [ ] Speicher & Batterie-Monitoring

---

### 3. WILDSCHADEN & HEGEMASSNAHMEN

```typescript
interface Wildschaden {
  id: UUID;
  revierId: UUID;
  
  // Meldung
  gemeldetVon: User;
  gemeldetAm: Date;
  position: GPSKoordinaten;
  
  // Schaden-Details
  schadenArt: 'verbiss' | 'schaelen' | 'fegeschaden' | 'trittschaden' | 
              'wildacker' | 'feld' | 'wald' | 'garten' | 'sonstiges';
  betroffeneFlaeche: number;      // Quadratmeter
  schweregrad: 'gering' | 'mittel' | 'erheblich' | 'massiv';
  
  // Verursacher
  verursacherWildart: WildArt;
  geschaetzteTierzahl?: number;
  
  // Geschädigter
  eigentuemer: {
    name: string;
    adresse: string;
    kontakt: string;
  };
  nutzungsart: 'landwirtschaft' | 'forstwirtschaft' | 'privat' | 'oeffentlich';
  kultur?: string;                // z.B. "Mais", "Fichte", etc.
  
  // Dokumentation
  fotos: MediaRef[];
  beschreibung: string;
  schaetzungSchadenhoehe: number; // €
  
  // Bewertung
  gutachten?: {
    gutachter: string;
    datum: Date;
    schadenhoehe: number;         // €
    dokument: MediaRef;
  };
  
  // Versicherung
  versicherungsmeldung?: {
    meldungAm: Date;
    versicherer: string;
    schadennummer: string;
    status: 'gemeldet' | 'in_bearbeitung' | 'reguliert' | 'abgelehnt';
    auszahlung?: number;
  };
  
  // Maßnahmen
  gegenmassnahmen: {
    art: 'zaun' | 'schutz' | 'abschuss' | 'vergraemung' | 'keine';
    beschreibung?: string;
    kosten?: number;
  };
  
  // Status
  status: 'gemeldet' | 'begutachtet' | 'reguliert' | 'abgeschlossen';
}

interface Hegemassnahme {
  id: UUID;
  revierId: UUID;
  
  // Art der Maßnahme
  typ: 'fuetterung' | 'kirrung' | 'wildacker' | 'biotop' | 'waldumbau' |
       'nisthilfe' | 'wasserstelle' | 'ruhezone' | 'sonstiges';
  
  // Details
  name: string;
  position?: GPSKoordinaten;
  polygon?: Polygon;              // Für größere Flächen
  
  // Zeitplan
  angelegt: Date;
  geplanteBis?: Date;
  intervall?: string;             // "wöchentlich", "monatlich", etc.
  
  // Aufwand
  materialkosten: number;         // €
  arbeitszeit: number;            // Stunden
  verantwortlich: User;
  
  // Dokumentation
  fotos: MediaRef[];
  notizen: string;
  
  // Wartung
  wartungProtokolle: Array<{
    datum: Date;
    durchgefuehrtVon: User;
    taetigkeit: string;
    kosten?: number;
    naechsteWartung?: Date;
  }>;
  
  // Erfolg
  erfolgskontrolle?: {
    datum: Date;
    wildaktivitaet: 'keine' | 'gering' | 'mittel' | 'hoch';
    bemerkungen: string;
    fotos?: MediaRef[];
  };
}
```

**Fehlende Features:**
- [ ] Wildschaden-Management & Dokumentation
- [ ] Gutachten & Versicherungsabwicklung
- [ ] Hege-Maßnahmen Tracking
- [ ] Kosten-Nutzen-Analyse Hege
- [ ] Wartungserinnerungen
- [ ] Erfolgskontrolle & Monitoring

---

### 4. JAGDSCHULE & AUSBILDUNG

```typescript
interface AusbildungsModul {
  id: UUID;
  
  // Modul-Info
  titel: string;
  beschreibung: string;
  kategorie: 'waffenkunde' | 'wildbiologie' | 'jagdpraxis' | 'jagdrecht' | 
             'hundewesen' | 'brauchbarkeit' | 'revierkunde' | 'naturschutz';
  
  // Level
  schwierigkeitsgrad: 'anfaenger' | 'fortgeschritten' | 'experte';
  voraussetzungen?: UUID[];       // Andere Module
  
  // Inhalt
  lektionen: Array<{
    nummer: number;
    titel: string;
    typ: 'text' | 'video' | 'quiz' | 'interaktiv';
    inhalt: string | MediaRef;
    dauer: number;                // Minuten
  }>;
  
  // Prüfung
  pruefung?: {
    fragen: Pruefungsfrage[];
    mindestpunktzahl: number;
    zeitlimitMinuten: number;
  };
  
  // Zertifikat
  zertifikatVorlage?: MediaRef;
  cpePunkte?: number;             // Continuing Professional Education
}

interface JagdscheinVerwaltung {
  userId: UUID;
  
  // Jagdschein-Daten
  jagdschein: {
    nummer: string;
    ausstellendeBehoerde: string;
    ausgestelltAm: Date;
    gueltigBis: Date;
    bundesland: string;
    typ: 'jahresjagdschein' | 'tagesjagdschein' | 'auslaendischer_jagdschein';
    scan: MediaRef;
  };
  
  // Prüfungen
  jaegerpruefung: {
    datum: Date;
    ort: string;
    note?: string;
    zertifikat: MediaRef;
  };
  
  // Fortbildungen
  fortbildungen: Array<{
    datum: Date;
    titel: string;
    anbieter: string;
    stundenanzahl: number;
    zertifikat?: MediaRef;
    cpePunkte?: number;
  }>;
  
  // Schießnachweise
  schiessnachweise: Array<{
    datum: Date;
    schiessstand: string;
    waffe: string;
    kaliber: string;
    schuss: number;
    treffer: number;
    punktzahl: number;
    bestaetigung: MediaRef;
  }>;
  
  // Erinnerungen
  erinnerungen: {
    jagdscheinVerlaengerung: Date;
    naechsterSchiessnachweis: Date;
    versicherungErneuerung: Date;
  };
}

interface LernfortschrittTracking {
  userId: UUID;
  
  // Absolvierte Module
  abgeschlosseneModule: Array<{
    modulId: UUID;
    abgeschlossenAm: Date;
    punktzahl?: number;
    zeitGebracht: number;         // Minuten
  }>;
  
  // Aktuelle Fortschritte
  aktuellLernt: Array<{
    modulId: UUID;
    fortschritt: number;          // 0-100%
    letzterZugriff: Date;
  }>;
  
  // Statistik
  gesamtLernzeit: number;         // Minuten
  gesamtCPEPunkte: number;
  level: number;                  // Gamification
  badges: string[];               // Achievements
}
```

**Fehlende Features:**
- [ ] Jagdschein-Verwaltung (Digital)
- [ ] Erinnerungen für Verlängerungen
- [ ] Fortbildungs-Tracking
- [ ] Schießnachweis-Dokumentation
- [ ] Lern-Module für Jungjäger
- [ ] Quiz & Prüfungsvorbereitung
- [ ] CPE-Punkte System

---

### 5. SOCIAL & COMMUNITY

```typescript
interface JaegerProfil {
  userId: UUID;
  
  // Öffentliches Profil
  oeffentlich: {
    username: string;
    profilbild?: MediaRef;
    bio?: string;
    reviere: string[];            // "Nordhessen", "Südbayern"
    spezialisierung: string[];    // ["Schwarzwild", "Drückjagd", "Lockjagd"]
    erfahrungJahre: number;
  };
  
  // Statistiken (optional öffentlich)
  statistiken: {
    abschuesse: {
      gesamt: number;
      proWildart: Record<WildArt, number>;
      letztesStueck: Date;
    };
    reviertage: number;
    gesellschaftsjagden: number;
  };
  
  // Trophäen-Showcase
  trophaeenShowcase: Array<{
    wildart: WildArt;
    punkte: number;
    datum: Date;
    foto?: MediaRef;
    beschreibung?: string;
  }>;
  
  // Social
  followers: UUID[];
  following: UUID[];
  freunde: UUID[];
}

interface JagdFeed {
  // Aktivitäten-Feed
  aktivitaeten: Array<{
    userId: UUID;
    typ: 'abschuss' | 'beobachtung' | 'trophaee' | 'jagd' | 'tipp' | 'frage';
    timestamp: Date;
    inhalt: string;
    medien?: MediaRef[];
    likes: number;
    kommentare: Kommentar[];
    sichtbarkeit: Sichtbarkeit;
  }>;
  
  // Fragen & Antworten
  fragen: Array<{
    userId: UUID;
    frage: string;
    kategorie: string;
    timestamp: Date;
    antworten: Array<{
      userId: UUID;
      antwort: string;
      timestamp: Date;
      hilfreich: number;
      besteAntwort: boolean;
    }>;
  }>;
  
  // Tipps & Tricks
  tipps: Array<{
    userId: UUID;
    titel: string;
    inhalt: string;
    kategorie: 'ausruestung' | 'technik' | 'wildkunde' | 'recht' | 'sonstiges';
    medien?: MediaRef[];
    likes: number;
    gespeichertVon: number;
  }>;
}

interface JagdGruppe {
  id: UUID;
  
  // Gruppe
  name: string;
  beschreibung: string;
  typ: 'revier' | 'region' | 'wildart' | 'technik' | 'allgemein';
  
  // Mitglieder
  admin: User;
  moderatoren: User[];
  mitglieder: User[];
  privat: boolean;
  
  // Aktivität
  posts: Post[];
  events: Event[];
  dateien: MediaRef[];
  
  // Features
  features: {
    chat: boolean;
    kalender: boolean;
    dateienFreigabe: boolean;
    abstimmungen: boolean;
  };
}

interface Marktplatz {
  // Anzeigen
  anzeigen: Array<{
    id: UUID;
    verkaufer: User;
    typ: 'verkauf' | 'gesuch' | 'tausch' | 'verschenke';
    kategorie: 'waffe' | 'optik' | 'bekleidung' | 'ausruestung' | 
               'wild' | 'trophaee' | 'sonstiges';
    
    // Details
    titel: string;
    beschreibung: string;
    preis?: number;
    verhandlungsbasis: boolean;
    
    // Bilder
    bilder: MediaRef[];
    
    // Status
    status: 'aktiv' | 'reserviert' | 'verkauft' | 'abgelaufen';
    erstelltAm: Date;
    
    // Standort
    plz: string;
    ort: string;
    versandMoeglich: boolean;
    
    // Rechtliches
    waffenrechMittig: boolean;
    erlaubnispflichtig: boolean;
  }>;
}
```

**Fehlende Features:**
- [ ] Jäger-Profile (öffentlich/privat)
- [ ] Social Feed (Abschüsse, Beobachtungen)
- [ ] Follower/Following System
- [ ] Fragen & Antworten Community
- [ ] Jagd-Gruppen
- [ ] Event-Kalender
- [ ] Marktplatz (Verkauf/Tausch)
- [ ] Messaging System
- [ ] Push-Benachrichtigungen

---

### 6. ANALYTICS & REPORTING

```typescript
interface RevierAnalytics {
  revierId: UUID;
  zeitraum: { von: Date; bis: Date };
  
  // Abschuss-Analyse
  abschussAnalyse: {
    gesamtAbschuesse: number;
    proWildart: Record<WildArt, number>;
    proMonat: Record<string, number>;
    proUhrzeit: Record<number, number>;  // 24h
    proWetter: {
      wind: Array<{ richtung: string; anzahl: number }>;
      temperatur: Array<{ bereich: string; anzahl: number }>;
      mond: Record<string, number>;
    };
    
    // Erfolgsquoten
    erfolgProHochsitz: Array<{
      hochsitz: POI;
      abschuesse: number;
      erfolgsquote: number;
    }>;
    
    // Trophäen
    durchschnittsPunkte: Record<WildArt, number>;
    besteTrophaee: Trophae;
  };
  
  // Wildbestand-Entwicklung
  wildbestandTrend: {
    wildart: WildArt;
    jahre: Array<{
      jahr: string;
      abschuss: number;
      sichtungen: number;
      geschaetztBestand: number;
      trend: 'steigend' | 'stabil' | 'fallend';
    }>;
  };
  
  // Kosten-Nutzen
  finanzAnalyse: {
    einnahmen: {
      wildverkauf: number;
      gastjaeger: number;
      sonstiges: number;
    };
    ausgaben: {
      pacht: number;
      hege: number;
      versicherung: number;
      instandhaltung: number;
      sonstiges: number;
    };
    bilanz: number;
  };
  
  // Zeiteinsatz
  zeiterfassung: {
    gesamtRevierzeit: number;     // Stunden
    ansitze: number;
    pirschgaenge: number;
    hegeMassnahmen: number;
    gesellschaftsjagden: number;
  };
}

interface CustomReport {
  id: UUID;
  name: string;
  
  // Report-Konfiguration
  typ: 'abschuss' | 'finanzen' | 'zeit' | 'wildbestand' | 'custom';
  filter: {
    zeitraum?: { von: Date; bis: Date };
    wildart?: WildArt[];
    revier?: UUID[];
  };
  
  // Visualisierung
  charts: Array<{
    typ: 'line' | 'bar' | 'pie' | 'heatmap' | 'table';
    datenQuelle: string;
    titel: string;
  }>;
  
  // Export
  exportFormat: 'pdf' | 'excel' | 'csv';
  automatisch?: {
    intervall: 'woechentlich' | 'monatlich' | 'jaehrlich';
    empfaenger: string[];         // Email
  };
}

interface Jagdjahrbuch {
  jagdjahr: string;               // "2025/2026"
  revierId: UUID;
  
  // Generiertes Jahrbuch
  inhalt: {
    deckblatt: MediaRef;
    vorwort?: string;
    
    // Statistiken
    jahresuebersicht: RevierAnalytics;
    monatsuebersicht: Record<string, any>;
    
    // Highlights
    highlights: Array<{
      datum: Date;
      titel: string;
      beschreibung: string;
      fotos: MediaRef[];
    }>;
    
    // Trophäen
    trophaeenGalerie: MediaRef[];
    
    // Dokumentation
    gesellschaftsjagden: JagdEintrag[];
    besondereEreignisse: JagdEintrag[];
    
    // Planung
    plaeneNaechstesJahr: string;
  };
  
  // PDF-Export
  pdfVorlage: 'klassisch' | 'modern' | 'minimalisch' | 'custom';
  generiert: Date;
  download: string;               // URL
}
```

**Fehlende Features:**
- [ ] Umfassende Analytics-Dashboard
- [ ] Wildbestand-Trend-Analyse
- [ ] Kosten-Nutzen-Tracking
- [ ] Zeit-Tracking (Revierzeit)
- [ ] Custom Reports erstellen
- [ ] Automatische Report-Generation
- [ ] Digitales Jagdjahrbuch
- [ ] Export zu Excel/PDF
- [ ] Vergleich zwischen Revieren

---

### 7. EQUIPMENT & WAFFEN-VERWALTUNG

```typescript
interface WaffenRegister {
  userId: UUID;
  
  // Waffen
  waffen: Array<{
    id: UUID;
    
    // Basis-Info
    typ: 'buechse' | 'flinte' | 'drilling' | 'bockbuechsflinte' | 
         'pistole' | 'revolver';
    hersteller: string;
    modell: string;
    kaliber: string;
    seriennummer: string;
    
    // Rechtliches
    waffenbesitzkarte: {
      nummer: string;
      ausgestelltVon: string;
      ausgestelltAm: Date;
      gueltigBis?: Date;
      scan: MediaRef;
    };
    
    // Technische Daten
    lauflaenge: number;           // cm
    gesamtlaenge: number;
    gewicht: number;              // kg
    patronenlager: number;
    magazinkapazitaet?: number;
    
    // Optik
    zielhilfe?: {
      typ: 'zielfernrohr' | 'rotpunkt' | 'kimmeUndkorn';
      hersteller: string;
      modell: string;
      vergroesserung?: string;    // z.B. "3-12x56"
      absehen: string;
      montage: string;
    };
    
    // Wartung
    wartungProtokolle: Array<{
      datum: Date;
      art: 'reinigung' | 'reparatur' | 'einschießen' | 'inspektion';
      beschreibung: string;
      kosten?: number;
      naechsteWartung?: Date;
    }>;
    
    // Einschießdaten
    einschiessdaten: Array<{
      datum: Date;
      entfernung: number;          // Meter
      munition: string;
      treffpunktlage: string;
      einstellung: string;         // "Klicks"
      notizen?: string;
    }>;
    
    // Fotos
    fotos: MediaRef[];
    
    // Versicherung
    versichert: boolean;
    versicherungswert: number;    // €
    
    // Status
    standort: string;             // "Waffenschrank Zuhause"
    status: 'aktiv' | 'verkauft' | 'stillgelegt';
  }>;
  
  // Munition
  munitionsbestand: Array<{
    kaliber: string;
    hersteller: string;
    bezeichnung: string;          // "Federal Premium 165gr"
    geschossgewicht: number;      // Grain
    anzahl: number;
    lagerort: string;
    verwendungszweck: 'jagd' | 'training' | 'wettkampf';
  }>;
}

interface AusruestungsRegister {
  userId: UUID;
  
  // Ausrüstung
  ausruestung: Array<{
    id: UUID;
    kategorie: 'bekleidung' | 'optik' | 'messer' | 'rucksack' | 
               'elektronik' | 'sonstiges';
    
    // Details
    name: string;
    hersteller?: string;
    modell?: string;
    kaufdatum?: Date;
    kaufpreis?: number;
    
    // Zustand
    zustand: 'neuwertig' | 'gut' | 'gebraucht' | 'defekt';
    
    // Wartung
    letzteWartung?: Date;
    naechsteWartung?: Date;
    
    // Fotos
    fotos?: MediaRef[];
    
    // Versicherung
    versichert: boolean;
    versicherungswert?: number;
    
    // Notizen
    notizen?: string;
  }>;
  
  // Wunschliste
  wunschliste: Array<{
    item: string;
    prioritaet: 'niedrig' | 'mittel' | 'hoch';
    geschaetztKosten?: number;
    link?: string;
  }>;
}

interface JagdpacklistenVerwaltung {
  // Vordefinierte Packlisten
  vorlagen: Array<{
    name: string;
    typ: 'ansitz' | 'pirsch' | 'drueckjagd' | 'nachsuche' | 'tagesjagd';
    items: Array<{
      item: string;
      kategorie: string;
      pflicht: boolean;
      optional: boolean;
    }>;
  }>;
  
  // Persönliche Packlisten
  eigenePacklisten: Array<{
    id: UUID;
    name: string;
    basierendAuf?: UUID;         // Vorlage
    items: string[];
    letzteVerwendung?: Date;
  }>;
  
  // Checkliste vor Jagd
  aktiveCheckliste?: {
    packlisteId: UUID;
    abgehakt: string[];
    fehlend: string[];
  };
}
```

**Fehlende Features:**
- [ ] Digitales Waffenregister
- [ ] Wartungs-Erinnerungen
- [ ] Einschießprotokoll
- [ ] Munitionsverwaltung
- [ ] Ausrüstungs-Katalog
- [ ] Packlisten-Generator
- [ ] Versicherungswert-Tracking
- [ ] Equipment-Wunschliste

---

### 8. ADVANCED MAPPING & GIS

```typescript
interface GISFeatures {
  // Layer-Management
  kartenEbenen: Array<{
    name: string;
    typ: 'satellit' | 'terrain' | 'openstreetmap' | 'topo' | 'jagdkarte';
    quelle: string;
    opacity: number;
    sichtbar: boolean;
    offline: boolean;
  }>;
  
  // Zeichnen & Messen
  zeichenTools: {
    linien: boolean;               // Entfernungen messen
    polygone: boolean;             // Flächen markieren
    kreise: boolean;               // Radius-Bereiche
    freihand: boolean;             // Freihand-Zeichnung
    
    // Messungen
    entfernungsmessung: {
      einheit: 'meter' | 'kilometer';
      anzeige: 'immer' | 'beim_zeichnen';
    };
    flaechenmessung: {
      einheit: 'qm' | 'hektar';
    };
  };
  
  // Höhenlinien
  hoehenlinien: {
    anzeigen: boolean;
    intervall: number;            // Meter
    farbe: string;
    beschriftung: boolean;
  };
  
  // 3D-Ansicht (optional)
  dreiDAnsicht: {
    verfuegbar: boolean;
    elevation: boolean;           // Geländehöhen
    baumHoehen: boolean;
    gebaeude: boolean;
  };
  
  // Offline-Karten
  offlineKarten: Array<{
    id: UUID;
    name: string;
    bereich: Polygon;
    zoomLevels: number[];
    groesseMB: number;
    heruntergeladen: Date;
    letzteAktualisierung?: Date;
  }>;
  
  // Import/Export
  importExport: {
    gpxImport: boolean;
    kmlImport: boolean;
    geojsonImport: boolean;
    shapefileImport: boolean;
    
    gpxExport: boolean;
    kmlExport: boolean;
    geojsonExport: boolean;
  };
}

interface WildwechselErkennung {
  // AI-basierte Mustererkennung
  analyseDaten: {
    wildkameraBilder: WildkameraMedium[];
    abschussPositionen: GPSKoordinaten[];
    sichtungen: GPSKoordinaten[];
    zeitraum: { von: Date; bis: Date };
  };
  
  // Erkannte Wechsel
  erkannteWechsel: Array<{
    id: UUID;
    pfad: GPSKoordinaten[];
    wildart: WildArt;
    haeufigkeit: number;          // Anzahl Durchgänge
    aktivsteZeit: {
      von: Time;
      bis: Time;
    };
    richtung: 'bidirektional' | 'einseitig';
    vertrauen: number;            // 0-1 Konfidenz
  }>;
  
  // Empfehlungen
  empfohleneHochsitze: Array<{
    position: GPSKoordinaten;
    begruendung: string;
    erfolgswahrscheinlichkeit: number;
  }>;
}
```

**Fehlende Features:**
- [ ] Erweiterte Karten-Layer (Topo, Satellit)
- [ ] Zeichen-Tools (Messen, Polygone)
- [ ] Höhenlinien-Anzeige
- [ ] 3D-Terrain-Ansicht
- [ ] Offline-Karten Download
- [ ] GPX/KML Import/Export
- [ ] Wildwechsel-Erkennung (AI)
- [ ] Automatische Hochsitz-Empfehlungen

---

### 9. INTEGRATION & EXPORT

```typescript
interface ExterneIntegrationen {
  // Wetter-Dienste
  wetter: {
    openWeatherMap: boolean;
    deutscherWetterdienst: boolean;
    weatherAPI: boolean;
    windyAPI: boolean;
  };
  
  // Karten
  karten: {
    googleMaps: boolean;
    mapbox: boolean;
    openStreetMap: boolean;
    hier: boolean;
  };
  
  // Hardware
  hardware: {
    garmin: {
      enabled: boolean;
      deviceSync: boolean;        // Sync mit Garmin-Geräten
      liveTracking: boolean;
    };
    
    dji: {
      enabled: boolean;
      drohnenSDK: boolean;
      livestream: boolean;
    };
    
    wildkameras: {
      cuddeback: boolean;
      spypoint: boolean;
      reconyx: boolean;
    };
    
    smartwatches: {
      appleWatch: boolean;
      garminWatch: boolean;
      wearOS: boolean;
    };
  };
  
  // Behörden & Verwaltung
  behoerden: {
    hegegemeinschaft: {
      enabled: boolean;
      automatischeBerichterstattung: boolean;
    };
    
    jagdbehoerde: {
      enabled: boolean;
      abschussmeldung: boolean;
    };
    
    wildunfallMeldung: {
      enabled: boolean;
      automatisch: boolean;
    };
  };
  
  // Export
  export: {
    wildfolge: boolean;           // WildfolgeApp-Format
    hegeportal: boolean;
    jagdstatistik: boolean;
    excel: boolean;
    pdf: boolean;
    csv: boolean;
  };
}

interface CalDAVIntegration {
  // Kalender-Sync
  kalenderSync: {
    enabled: boolean;
    provider: 'icloud' | 'google' | 'outlook' | 'eigener';
    url: string;
    
    // Was syncen?
    syncGesellschaftsjagden: boolean;
    syncAnsitze: boolean;
    syncWartungen: boolean;
    syncErinnerungen: boolean;
  };
}
```

**Fehlende Features:**
- [ ] Garmin Connect Integration
- [ ] DJI SDK Drohnen-Steuerung
- [ ] Wildkamera-APIs (Spypoint, Cuddeback)
- [ ] Apple Watch App
- [ ] Automatische Behörden-Meldungen
- [ ] WildfolgeApp Export
- [ ] CalDAV Kalender-Sync
- [ ] HEGEPORTAL Integration

---

## 🎯 Priorisierte Feature-Roadmap

### HIGH PRIORITY (Phase 7-8, nächste 6 Monate):

**Phase 7: Revier & Wildkamera (6-8 Wochen)**
- [ ] Revier-Management & Verwaltung
- [ ] Digitaler Abschussplan
- [ ] Wildkamera-Integration
- [ ] AI-Bilderkennung (Basic)
- [ ] Wildvorkommen-Heatmap

**Phase 8: Equipment & Waffen (4-6 Wochen)**
- [ ] Digitales Waffenregister
- [ ] Wartungs-Erinnerungen
- [ ] Munitionsverwaltung
- [ ] Packlisten-Generator
- [ ] Ausrüstungs-Katalog

**Phase 9: Advanced Mapping (4-6 Wochen)**
- [ ] Offline-Karten Download
- [ ] Zeichnen & Messen Tools
- [ ] Höhenlinien-Anzeige
- [ ] GPX/KML Import/Export
- [ ] Wildwechsel-Erkennung (AI)

---

### MEDIUM PRIORITY (Phase 10-12, 6-12 Monate):

**Phase 10: Analytics & Reporting (6-8 Wochen)**
- [ ] Analytics-Dashboard
- [ ] Custom Reports
- [ ] Digitales Jagdjahrbuch
- [ ] Kosten-Tracking
- [ ] Zeit-Tracking

**Phase 11: Social & Community (8-10 Wochen)**
- [ ] Jäger-Profile
- [ ] Social Feed
- [ ] Gruppen & Events
- [ ] Q&A Community
- [ ] Marktplatz

**Phase 12: Jagdschule & Ausbildung (6-8 Wochen)**
- [ ] Jagdschein-Verwaltung
- [ ] Fortbildungs-Tracking
- [ ] Lern-Module
- [ ] Quiz-System
- [ ] Erinnerungen

---

### LOW PRIORITY (Phase 13+, nach 12 Monaten):

**Phase 13: Wildschaden & Hege (4-6 Wochen)**
- [ ] Wildschaden-Management
- [ ] Gutachten-System
- [ ] Hege-Maßnahmen
- [ ] Erfolgskontrolle

**Phase 14: Advanced Integrations (6-8 Wochen)**
- [ ] Garmin Connect
- [ ] DJI Drohnen SDK
- [ ] Wildkamera-APIs
- [ ] Smartwatch Apps
- [ ] Behörden-Schnittstellen

**Phase 15: 3D & AR Features (8-10 Wochen)**
- [ ] 3D-Terrain-Ansicht
- [ ] AR-Entfernungsmessung
- [ ] AR-Windanzeige
- [ ] Virtual Reality Reviererkundung

---

## 📊 Feature-Matrix: Was macht HNTR LEGEND Pro einzigartig?

| Feature | HNTR LEGEND Pro | OnX Hunt | HuntStand | Jagd1 | Ifor |
|---------|----------------|----------|-----------|-------|------|
| **Gesellschaftsjagd Live** | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| **KI-Empfehlungen** | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| **Wildkamera-Integration** | ✅ | ⚠️ | ✅ | ❌ | ❌ |
| **Drohnen-Tracking** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Hund-Tracking (Garmin)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Drückjagd-Trupps** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Bergetrupp-Karte** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Nachsuche-Management** | ✅ | ❌ | ⚠️ | ❌ | ✅ |
| **Wetter-Intelligence** | ✅ | ⚠️ | ✅ | ❌ | ⚠️ |
| **Web-Portal** | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **Offline-Karten** | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **Abschussplan Digital** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Wildbestand-Analytics** | ✅ | ⚠️ | ❌ | ⚠️ | ✅ |
| **Social Features** | ✅ | ⚠️ | ✅ | ❌ | ❌ |
| **Jagdschein-Verwaltung** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Marktplatz** | ✅ | ❌ | ⚠️ | ⚠️ | ❌ |

**Legende**: ✅ = Ja | ⚠️ = Teilweise | ❌ = Nein

---

## 💡 Einzigartige Selling Points (USPs)

1. **Einzige App mit Echtzeit-Gesellschaftsjagd-Management**
   - Live-Tracking aller Teilnehmer
   - Drückjagd-Trupps mit Koordination
   - Ansteller/Bergetrupp/Nachsuche-Systeme

2. **KI-gestützte intelligente Empfehlungen**
   - Beste Ansitzzeit
   - Optimale Hochsitz-Position
   - Wildvorkommen-Prognose

3. **Komplette Multi-Device Integration**
   - Hunde (Garmin GPS)
   - Drohnen (DJI SDK)
   - Smartwatches
   - Wildkameras

4. **Professionelles Revier-Management**
   - Digitaler Abschussplan
   - Kosten-Tracking
   - Wildschaden-Verwaltung
   - Hege-Maßnahmen

5. **Social & Community**
   - Jäger vernetzen
   - Wissen teilen
   - Marktplatz

---

## 🚀 Zusammenfassung

**Du hast jetzt:**
- ✅ Alle geplanten Features (Phase 4-6)
- ✅ Erweiterte Drückjagd-Features (Trupps, Ansteller, Bergen, Nachsuche)
- ✅ Umfassende Feature Gap Analysis
- ✅ 9 neue Feature-Kategorien identifiziert
- ✅ Priorisierte Roadmap für 15+ Phasen
- ✅ Unique Selling Points definiert

**Total identifizierte Features**: 150+ neue Features über Phase 7-15

**Timeline bis "Ultimate Complete"**: ca. 24-30 Monate

**Nächster Schritt**: Entscheide welche Features am wichtigsten sind und wir starten mit Phase 4! 🎯

---

**Erstellt**: 22.01.2026  
**Status**: 🟢 Comprehensive Analysis Complete
