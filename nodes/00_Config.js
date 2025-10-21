// ============================================================================
// NODE 00: ZENTRALE KONFIGURATION (Template-Einstellungen)
// ============================================================================
//
// ZWECK:
// Zentrale Verwaltung aller Workflow-Parameter für einfache Anpassung an
// verschiedene Branchen und Anwendungsfälle.
//
// ANPASSUNG FÜR ANDERE BRANCHEN:
// 1. Ändere UNTERNEHMEN (Zeile 20-30)
// 2. Passe BRANCHENFELDER an (Zeile 35-80)
// 3. Konfiguriere SCORING_GEWICHTUNG (Zeile 85-120)
// 4. Setze GOOGLE_SHEETS_IDS (Zeile 125-140)
// ============================================================================

// ---------------------------------------------------------------------------
// 1️⃣ UNTERNEHMENS-KONFIGURATION
// ---------------------------------------------------------------------------
const UNTERNEHMEN = {
  // **ANPASSEN**: Dein Firmenname
  name: "SEINE Batteriesysteme GmbH",

  // **ANPASSEN**: Deine Branche
  branche: "Batteriespeichersysteme & Energietechnik",

  // **ANPASSEN**: Kontakt für Rückfragen
  kontakt_email: "sales@seine-batteriesysteme.de",
  kontakt_telefon: "+49 123 456789",

  // **ANPASSEN**: Website
  website: "https://seine-batteriesysteme.de"
};

// ---------------------------------------------------------------------------
// 2️⃣ BRANCHEN-SPEZIFISCHE FELDER
// ---------------------------------------------------------------------------
// **ANPASSEN**: Definiere die Felder, die für DEINE Branche wichtig sind
//
// Beispiel für andere Branchen:
// - Software: { "Nutzeranzahl", "Lizenzmodell", "Tech_Stack" }
// - Maschinenbau: { "Produktionsvolumen", "Maschinentyp", "Wartungsintervall" }
// - Immobilien: { "Quadratmeter", "Zimmeranzahl", "Baujahr" }

const BRANCHENFELDER = {
  // Energie-Profil (für Batteriesysteme)
  // **ANPASSEN**: Ersetze durch deine relevanten Kennzahlen
  energie: {
    // Täglicher Verbrauch
    "Energieverbrauch_Tag_kWh": {
      typ: "number",
      pflicht: false,
      default: 0,
      beschreibung: "Täglicher Energieverbrauch in Kilowattstunden",
      min: 0,
      max: 100000
    },

    // Jährlicher Verbrauch
    "Energieverbrauch_Jahr_kWh": {
      typ: "number",
      pflicht: true,  // **WICHTIG**: Pflichtfeld für Qualifikation
      default: 0,
      beschreibung: "Jährlicher Energieverbrauch in Kilowattstunden",
      min: 0,
      max: 10000000
    },

    // PV-Erzeugung
    "Energieerzeugung_PV_Jahr_kWh": {
      typ: "number",
      pflicht: false,
      default: 0,
      beschreibung: "Jährliche Photovoltaik-Stromerzeugung",
      min: 0,
      max: 10000000
    },

    // Speicherkapazität
    "Speicherkapazitaet_kWh": {
      typ: "number",
      pflicht: false,
      default: 0,
      beschreibung: "Aktuelle Speicherkapazität in kWh",
      min: 0,
      max: 100000
    },

    // Wechselrichterleistung
    "Wechselrichterleistung_kW": {
      typ: "number",
      pflicht: false,
      default: 0,
      beschreibung: "Leistung des Wechselrichters in Kilowatt",
      min: 0,
      max: 10000
    },

    // Batterietyp
    "Batterietyp": {
      typ: "string",
      pflicht: false,
      default: "LiFePO4",
      beschreibung: "Typ der Batterietechnologie",
      optionen: ["LiFePO4", "NMC", "Blei-Säure", "Andere"]
    }
  },

  // Projekt-Details
  // **ANPASSEN**: Projektspezifische Felder für deine Branche
  projekt: {
    "Anfrage_typ": {
      typ: "string",
      pflicht: false,
      default: "Nicht angegeben",
      beschreibung: "Art der Anfrage",
      optionen: ["Neubau", "Erweiterung", "Wartung", "Beratung"]
    },

    "Projektziel": {
      typ: "string",
      pflicht: false,
      default: "Nicht angegeben",
      beschreibung: "Hauptziel des Projekts"
    },

    "Einsatzbereich": {
      typ: "string",
      pflicht: false,
      default: "Nicht angegeben",
      beschreibung: "Wo wird das System eingesetzt?"
    },

    "Einsatzzweck": {
      typ: "string",
      pflicht: false,
      default: "Nicht angegeben",
      beschreibung: "Wofür wird das System verwendet?"
    },

    "Investitionsrahmen": {
      typ: "string",
      pflicht: false,
      default: "<50k",
      beschreibung: "Verfügbares Budget",
      optionen: ["<50k", "50-100k", "100-200k", ">200k"]
    }
  }
};

// ---------------------------------------------------------------------------
// 3️⃣ LEAD-SCORING GEWICHTUNG
// ---------------------------------------------------------------------------
// **ANPASSEN**: Definiere, welche Faktoren wie stark in die Bewertung einfließen
// Summe muss 100 ergeben!

const SCORING_GEWICHTUNG = {
  // Wie wichtig ist der Jahresumsatz/Projektvolumen? (0-40 Punkte)
  projektvolumen: {
    gewicht: 25,
    beschreibung: "Geschätztes Projektvolumen und Investitionsbereitschaft",
    berechnung: "investitionsrahmen_range"
  },

  // Wie wichtig ist die Dringlichkeit? (0-20 Punkte)
  energieintensitaet: {
    gewicht: 30,
    beschreibung: "Energieverbrauch als Indikator für Projektgröße",
    berechnung: "Energieverbrauch_Jahr_kWh"
  },

  // Wie wichtig sind vollständige Daten? (0-20 Punkte)
  datenvollstaendigkeit: {
    gewicht: 20,
    beschreibung: "Wie viele Pflichtfelder sind ausgefüllt?"
  },

  // Wie wichtig ist die Kontaktqualität? (0-15 Punkte)
  kontaktqualitaet: {
    gewicht: 15,
    beschreibung: "Business-Email, Telefon, vollständige Kontaktdaten"
  },

  // Wie wichtig ist die Dringlichkeit? (0-10 Punkte)
  dringlichkeit: {
    gewicht: 10,
    beschreibung: "Zeitliche Dringlichkeit basierend auf Anfrage-Text"
  }
};

// Validierung: Gewichte müssen 100 ergeben
const summeGewichte = Object.values(SCORING_GEWICHTUNG)
  .reduce((sum, item) => sum + item.gewicht, 0);

if (summeGewichte !== 100) {
  throw new Error(`❌ SCORING_GEWICHTUNG muss 100 ergeben! Aktuell: ${summeGewichte}`);
}

// ---------------------------------------------------------------------------
// 4️⃣ LEAD-KATEGORISIERUNG
// ---------------------------------------------------------------------------
// **ANPASSEN**: Ab welchem Score gilt ein Lead als HOT/WARM/COLD?

const LEAD_SCHWELLWERTE = {
  HOT: 8.0,        // >= 8.0 Punkte → Höchste Priorität
  WARM: 6.0,       // >= 6.0 Punkte → Qualifiziert
  COLD: 4.0,       // >= 4.0 Punkte → Nurture-Kampagne
  // < 4.0 → NURTURE (automatisch)

  QUALIFIED_MINIMUM: 6.0  // Mindest-Score für Vertriebsübergabe
};

// ---------------------------------------------------------------------------
// 5️⃣ GOOGLE SHEETS KONFIGURATION
// ---------------------------------------------------------------------------
// **ANPASSEN**: Trage deine Google Sheets IDs und Tab-Namen ein

const GOOGLE_SHEETS = {
  // Haupt-Spreadsheet ID (aus der URL)
  // Beispiel: https://docs.google.com/spreadsheets/d/ABC123.../edit
  //           → spreadsheet_id = "ABC123..."
  spreadsheet_id: "10laYq9f2hcNln34h-HEvXNAbgYNWN0092m3cHbZg9IM",

  // Tab-Namen und GIDs
  tabs: {
    MASTER_LOG: {
      name: "MASTER_LOG",
      gid: "gid=0",
      beschreibung: "Haupt-Leadliste mit allen Informationen"
    },

    CONTACTS: {
      name: "CONTACTS",
      gid: 1900517109,
      beschreibung: "Alle Kontakte (primär + sekundär)"
    },

    COUNTER: {
      name: "COUNTER",
      gid: 1665426076,
      beschreibung: "ID-Zähler für Lead-IDs und Offer-IDs"
    },

    DOCUMENT_LIBRARY: {
      name: "DOCUMENT_LIBRARY",
      gid: 2124089290,
      beschreibung: "Verknüpfungen zu erstellten Dossiers"
    }
  }
};

// ---------------------------------------------------------------------------
// 6️⃣ GOOGLE DOCS KONFIGURATION (Dossier-Speicherort)
// ---------------------------------------------------------------------------
// **ANPASSEN**: Ordner-ID für Dossier-Ablage

const GOOGLE_DOCS = {
  // Ordner-ID für Dossiers (aus Google Drive URL)
  dossier_folder_id: "1e7RXLWfffQeZyG7Pd0kuRGwtrAo0-J-x",

  // Template für Dossier-Titel
  // Verfügbare Variablen: {Lead_ID}, {Firmenname}, {fullName}, {Datum}, {Uhrzeit}
  dossier_titel_template: "LEAD-{Lead_ID}_{Firmenname}_{fullName}_{Datum}",

  // Dossier-Struktur
  dossier_sections: [
    "## 📊 Lead-Übersicht",
    "## 👤 Kontaktinformationen",
    "## 🏢 Unternehmensprofil",
    "## ⚡ Energie- & Projektdaten",
    "## 🎯 Lead-Qualifikation & Scoring",
    "## 🔍 Research-Ergebnisse",
    "## 📞 Gefundene Kontakte",
    "## 💡 Empfehlungen & Next Steps",
    "## 🚩 Flags & Notizen"
  ]
};

// ---------------------------------------------------------------------------
// 7️⃣ EXTERNE API KONFIGURATION
// ---------------------------------------------------------------------------
// **ANPASSEN**: API-Limits und Timeouts

const API_CONFIG = {
  // Website-Scraping
  scraping: {
    max_pages: 5,              // Wie viele Unterseiten scrapen?
    timeout_ms: 15000,         // Timeout pro Seite
    max_content_length: 5000   // Maximale Textlänge pro Seite
  },

  // Hunter.io (Email-Finder)
  hunter: {
    max_emails: 5,             // Maximale Anzahl E-Mails
    confidence_minimum: 50     // Mindest-Confidence (0-100)
  },

  // LinkedIn-Suche (via Google/Serper)
  linkedin: {
    search_results: 3,         // Anzahl Suchergebnisse
    timeout_ms: 10000
  }
};

// ---------------------------------------------------------------------------
// 8️⃣ STANDARD-WERTE FÜR FEHLENDE DATEN
// ---------------------------------------------------------------------------
// **ANPASSEN**: Was soll angezeigt werden, wenn Daten fehlen?

const DEFAULTS = {
  string: "Nicht angegeben",
  number: 0,
  email: "keine-email@nicht-angegeben.local",
  phone: "Nicht angegeben",
  website: "Nicht angegeben",
  adresse: "Nicht angegeben",
  firma: "Privatperson",
  land: "DE"
};

// ---------------------------------------------------------------------------
// 9️⃣ DATENQUALITÄTS-ANFORDERUNGEN
// ---------------------------------------------------------------------------
// **ANPASSEN**: Welche Felder sind für die Qualifikation zwingend erforderlich?

const PFLICHTFELDER = {
  // Mindestanforderung für Lead-Qualifikation
  minimum: [
    "Email",                    // E-Mail zwingend
    "Energieverbrauch_Jahr_kWh" // Branchenspezifisches Hauptfeld
  ],

  // Empfohlen für gute Datenqualität
  empfohlen: [
    "Phone",
    "Firmenname",
    "Adresse",
    "Projektziel"
  ],

  // Nice-to-have für perfekte Leads
  optional: [
    "Website",
    "Investitionsrahmen",
    "Einsatzbereich"
  ]
};

// ---------------------------------------------------------------------------
// 🔟 WORKFLOW-STEUERUNG
// ---------------------------------------------------------------------------

const WORKFLOW_CONFIG = {
  // Sollen nicht-qualifizierte Leads trotzdem gespeichert werden?
  save_unqualified_leads: true,

  // Soll bei Fehlern eine E-Mail-Benachrichtigung gesendet werden?
  send_error_notifications: true,
  error_notification_email: "admin@seine-batteriesysteme.de",

  // Automatische Retry-Logik
  retry: {
    max_attempts: 3,
    delay_ms: 2000
  },

  // Logging-Level
  log_level: "info" // "debug" | "info" | "warn" | "error"
};

// ---------------------------------------------------------------------------
// 📤 AUSGABE: Konfiguration als JSON für nachfolgende Nodes
// ---------------------------------------------------------------------------

return [{
  json: {
    // Alle Konfigurationen
    UNTERNEHMEN,
    BRANCHENFELDER,
    SCORING_GEWICHTUNG,
    LEAD_SCHWELLWERTE,
    GOOGLE_SHEETS,
    GOOGLE_DOCS,
    API_CONFIG,
    DEFAULTS,
    PFLICHTFELDER,
    WORKFLOW_CONFIG,

    // Metadaten
    config_version: "1.0.0",
    erstellt_am: new Date().toISOString(),
    beschreibung: "Zentrale Template-Konfiguration für Lead-Manager Workflow"
  }
}];

// ============================================================================
// ANPASSUNGS-CHECKLISTE FÜR NEUE BRANCHEN:
// ============================================================================
//
// ✅ 1. UNTERNEHMEN-Daten aktualisieren (Name, Branche, Kontakt)
// ✅ 2. BRANCHENFELDER anpassen (deine relevanten Kennzahlen)
// ✅ 3. SCORING_GEWICHTUNG definieren (Summe = 100!)
// ✅ 4. LEAD_SCHWELLWERTE festlegen (HOT/WARM/COLD)
// ✅ 5. GOOGLE_SHEETS IDs eintragen
// ✅ 6. GOOGLE_DOCS Ordner-ID setzen
// ✅ 7. API_CONFIG Limits prüfen
// ✅ 8. DEFAULTS anpassen
// ✅ 9. PFLICHTFELDER definieren
// ✅ 10. WORKFLOW_CONFIG prüfen
//
// ============================================================================
