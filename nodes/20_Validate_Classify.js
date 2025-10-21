// ============================================================================
// NODE 20: DATENVALIDIERUNG & KLASSIFIZIERUNG
// ============================================================================
//
// ZWECK:
// - Webhook-Rohdaten bereinigen und validieren
// - Lead_ID extrahieren (falls vorhanden)
// - Fehlende Werte mit Defaults befüllen
// - Datentypen konvertieren (String → Number)
// - Datenqualität berechnen
//
// INPUT:  Rohdaten vom Webhook (Node 10)
// OUTPUT: Validierte und strukturierte Lead-Daten
// ============================================================================

// ---------------------------------------------------------------------------
// 1️⃣ KONFIGURATION LADEN
// ---------------------------------------------------------------------------
// Lade die zentrale Konfiguration aus Node 00
const config = $('00_Config').first().json;
const BRANCHENFELDER = config.BRANCHENFELDER;
const DEFAULTS = config.DEFAULTS;
const PFLICHTFELDER = config.PFLICHTFELDER;

// ---------------------------------------------------------------------------
// 2️⃣ EINGABEDATEN EXTRAHIEREN
// ---------------------------------------------------------------------------
// Verarbeite alle eingehenden Items vom Webhook
const items = $input.all().map(item => {

  // Webhook-Rohdaten extrahieren
  // Je nach Webhook-Konfiguration können Daten in verschiedenen Pfaden liegen
  let input = item.json.body ||      // Bei POST-Requests mit Body
              item.json.query ||     // Bei GET-Requests mit Query-Params
              item.json;             // Direkt im JSON

  console.log('🔵 Webhook empfangen mit Feldern:', Object.keys(input));

  // ---------------------------------------------------------------------------
  // 3️⃣ HILFSFUNKTION: SICHERE FELD-EXTRAKTION
  // ---------------------------------------------------------------------------
  /**
   * Extrahiert einen Wert aus dem Input-Objekt mit mehreren Fallback-Optionen
   *
   * @param {Object} obj - Das Input-Objekt
   * @param {Array} feldnamen - Liste von möglichen Feldnamen (Synonyme)
   * @param {*} fallback - Standardwert falls nichts gefunden wird
   * @returns {*} Extrahierter Wert oder Fallback
   *
   * BEISPIEL:
   * safeExtract(input, ['Email', 'email', 'E-Mail', 'e_mail'], 'keine@email.de')
   */
  function safeExtract(obj, feldnamen, fallback = '') {
    if (!obj) return fallback;

    // Durchlaufe alle möglichen Feldnamen
    for (const feldname of feldnamen) {

      // 1. Direkte Übereinstimmung (exakte Schreibweise)
      if (obj[feldname] !== undefined &&
          obj[feldname] !== null &&
          obj[feldname] !== '') {
        return String(obj[feldname]).trim();
      }

      // 2. Case-insensitive Suche (egal ob Groß-/Kleinschreibung)
      const matchingKey = Object.keys(obj).find(
        key => key.toLowerCase() === feldname.toLowerCase()
      );

      if (matchingKey && obj[matchingKey]) {
        return String(obj[matchingKey]).trim();
      }
    }

    // Nichts gefunden → Fallback zurückgeben
    return fallback;
  }

  // ---------------------------------------------------------------------------
  // 4️⃣ HILFSFUNKTION: SICHERE ZAHLEN-KONVERTIERUNG
  // ---------------------------------------------------------------------------
  /**
   * Konvertiert einen Wert sicher in eine Zahl
   *
   * @param {*} value - Der zu konvertierende Wert
   * @param {Number} fallback - Standardwert bei Fehler
   * @returns {Number} Konvertierte Zahl oder Fallback
   *
   * BEISPIEL:
   * safeNumber("75000", 0) → 75000
   * safeNumber("abc", 0) → 0
   * safeNumber(null, 0) → 0
   */
  function safeNumber(value, fallback = 0) {
    // Versuche String zu bereinigen (z.B. "75,000" → "75000")
    if (typeof value === 'string') {
      value = value.replace(/[^\d.-]/g, ''); // Entferne alles außer Ziffern, Punkt, Minus
    }

    const num = parseFloat(value);
    return isNaN(num) ? fallback : num;
  }

  // ---------------------------------------------------------------------------
  // 5️⃣ TIMESTAMP-GENERIERUNG
  // ---------------------------------------------------------------------------
  const now = new Date();
  const timestamp = now.toISOString();
  const year = now.getFullYear().toString().slice(-2); // z.B. "25" für 2025

  // Formatiertes Datum für Dossier-Titel (z.B. "21-01-2025")
  const datum = now.toLocaleDateString('de-DE');
  const uhrzeit = now.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // ---------------------------------------------------------------------------
  // 6️⃣ NAMEN KOMBINIEREN
  // ---------------------------------------------------------------------------
  // Extrahiere Vor- und Nachname
  const firstName = safeExtract(input, [
    'Vorname', 'first_name', 'firstName', 'vorname'
  ]);

  const lastName = safeExtract(input, [
    'Nachname', 'last_name', 'lastName', 'nachname'
  ]);

  // Vollständiger Name (entweder aus Feld oder kombiniert)
  const fullName = safeExtract(input, [
    'fullName', 'full_name', 'Name', 'name'
  ]) || (firstName && lastName ? `${firstName} ${lastName}` : DEFAULTS.string);

  // ---------------------------------------------------------------------------
  // 7️⃣ LEAD_ID EXTRAHIEREN (WICHTIG!)
  // ---------------------------------------------------------------------------
  // Prüfe, ob der Webhook bereits eine Lead_ID mitsendet
  // Falls ja, IMMER übernehmen (niemals überschreiben!)
  const leadIdFromWebhook = safeExtract(input, [
    'Lead_ID', 'Lead-ID', 'lead_id', 'LeadID', 'leadid'
  ]);

  // ---------------------------------------------------------------------------
  // 8️⃣ KONTAKTDATEN EXTRAHIEREN
  // ---------------------------------------------------------------------------
  const email = safeExtract(input, [
    'Email', 'email', 'E-Mail', 'e-mail', 'kontakt_email'
  ]);

  const phone = safeExtract(input, [
    'Phone', 'phone', 'Telefon', 'telefon', 'tel', 'Telephone'
  ]);

  const adresse = safeExtract(input, [
    'Adresse', 'address', 'full_address', 'Anschrift'
  ]);

  const website = safeExtract(input, [
    'Website', 'website', 'web', 'homepage', 'url'
  ]);

  // ---------------------------------------------------------------------------
  // 9️⃣ UNTERNEHMENSDATEN EXTRAHIEREN
  // ---------------------------------------------------------------------------
  const firmenname = safeExtract(input, [
    'Firmenname', 'company_name', 'companyName', 'Unternehmen', 'Firma'
  ]);

  const customerType = safeExtract(input, [
    'Customer_Type', 'customer_type', 'Kundentyp', 'kundentyp'
  ], 'Private'); // Default: Privatkunde

  // ---------------------------------------------------------------------------
  // 🔟 BRANCHENSPEZIFISCHE FELDER EXTRAHIEREN
  // ---------------------------------------------------------------------------
  // **WICHTIG**: Hier werden die energie-spezifischen Felder extrahiert
  // **ANPASSEN**: Ersetze durch deine Branchenfelder aus Node 00_Config

  // Energie-Daten (für Batteriesysteme)
  const energieverbrauchTag = safeNumber(
    safeExtract(input, [
      'Energieverbrauch_Tag_kWh',
      'energieverbrauch_tag',
      'daily_energy_consumption'
    ]),
    0
  );

  const energieverbrauchJahr = safeNumber(
    safeExtract(input, [
      'Energieverbrauch_Jahr_kWh',
      'energieverbrauch_jahr',
      'annual_energy_consumption',
      'Jahresverbrauch'
    ]),
    0
  );

  const pvErzeugung = safeNumber(
    safeExtract(input, [
      'Energieerzeugung_PV_Jahr_kWh',
      'pv_erzeugung',
      'solar_generation'
    ]),
    0
  );

  const speicherkapazitaet = safeNumber(
    safeExtract(input, [
      'Speicherkapazitaet_kWh',
      'speicher',
      'storage_capacity',
      'Batteriekapazitaet'
    ]),
    0
  );

  const wechselrichterLeistung = safeNumber(
    safeExtract(input, [
      'Wechselrichterleistung_kW',
      'wechselrichter',
      'inverter_power'
    ]),
    0
  );

  const batterietyp = safeExtract(input, [
    'Batterietyp', 'batterietyp', 'battery_type'
  ], 'LiFePO4'); // Standard: LiFePO4 (sicherste Variante)

  // ---------------------------------------------------------------------------
  // 1️⃣1️⃣ PROJEKT-DETAILS EXTRAHIEREN
  // ---------------------------------------------------------------------------
  const anfrageTyp = safeExtract(input, [
    'Anfrage_typ', 'anfrage_typ', 'inquiry_type', 'Anfragetyp'
  ]);

  const projektziel = safeExtract(input, [
    'Projektziel', 'project_goal', 'projektziel', 'Ziel'
  ]);

  const einsatzbereich = safeExtract(input, [
    'Einsatzbereich', 'usage_area', 'einsatzbereich'
  ]);

  const einsatzzweck = safeExtract(input, [
    'Einsatzzweck', 'purpose', 'einsatzzweck', 'Zweck'
  ]);

  const investitionsrahmen = safeExtract(input, [
    'Investitionsrahmen',
    'investitionskapazitaet_range',
    'budget_range',
    'Budget'
  ], '<50k');

  const kommentar = safeExtract(input, [
    'Kommentar', 'kommentar', 'message', 'comment', 'Nachricht', 'Anmerkung'
  ]);

  // ---------------------------------------------------------------------------
  // 1️⃣2️⃣ DATENQUALITÄT BERECHNEN
  // ---------------------------------------------------------------------------
  /**
   * Berechnet einen Datenqualitäts-Score (0-100%)
   * Basierend auf ausgefüllten Pflichtfeldern und empfohlenen Feldern
   */
  let datenqualitaet = 0;
  let ausgefuellteFelder = 0;
  const gesamtFelder = PFLICHTFELDER.minimum.length +
                       PFLICHTFELDER.empfohlen.length;

  // Prüfe Pflichtfelder
  PFLICHTFELDER.minimum.forEach(feld => {
    // Vereinfachte Prüfung: Nutze eval() nur für Demo
    // In Produktion: strukturierte Prüfung verwenden!
    const wert = eval(feldnameZuVariable(feld));
    if (wert && wert !== DEFAULTS.string && wert !== 0) {
      ausgefuellteFelder++;
    }
  });

  // Prüfe empfohlene Felder
  PFLICHTFELDER.empfohlen.forEach(feld => {
    const wert = eval(feldnameZuVariable(feld));
    if (wert && wert !== DEFAULTS.string && wert !== 0) {
      ausgefuellteFelder++;
    }
  });

  datenqualitaet = Math.round((ausgefuellteFelder / gesamtFelder) * 100);

  /**
   * Hilfsfunktion: Konvertiert Feldname zu Variable
   * Beispiel: "Email" → "email"
   */
  function feldnameZuVariable(feldname) {
    const mapping = {
      'Email': 'email',
      'Phone': 'phone',
      'Firmenname': 'firmenname',
      'Adresse': 'adresse',
      'Projektziel': 'projektziel',
      'Energieverbrauch_Jahr_kWh': 'energieverbrauchJahr'
    };
    return mapping[feldname] || feldname.toLowerCase();
  }

  // ---------------------------------------------------------------------------
  // 1️⃣3️⃣ EMAIL-VALIDIERUNG
  // ---------------------------------------------------------------------------
  let emailGueltig = false;
  let emailTyp = 'unbekannt'; // 'business' oder 'private'

  if (email && email.includes('@')) {
    emailGueltig = true;

    // Prüfe, ob Business- oder Privat-Email
    const emailDomain = email.split('@')[1];
    const privateDomains = [
      'gmail.com', 'yahoo.de', 'gmx.de', 'web.de',
      'outlook.com', 'hotmail.com', 't-online.de'
    ];

    emailTyp = privateDomains.includes(emailDomain) ? 'private' : 'business';
  }

  // ---------------------------------------------------------------------------
  // 1️⃣4️⃣ DRINGLICHKEITS-ERKENNUNG
  // ---------------------------------------------------------------------------
  /**
   * Analysiert den Kommentar auf Dringlichkeits-Signale
   */
  let dringlichkeit = 'normal';
  if (kommentar) {
    const kommentarLower = kommentar.toLowerCase();
    const dringlichkeitswoerter = [
      'dringend', 'schnell', 'sofort', 'asap', 'eilig',
      'zeitnah', 'kurzfristig', 'umgehend'
    ];

    if (dringlichkeitswoerter.some(wort => kommentarLower.includes(wort))) {
      dringlichkeit = 'hoch';
    }
  }

  // ---------------------------------------------------------------------------
  // 1️⃣5️⃣ AUSGABE: VALIDIERTE DATEN
  // ---------------------------------------------------------------------------
  return {
    json: {
      // ===== WEBHOOK-ROHDATEN =====
      // Speichere Originalda ten für spätere Referenz
      webhookData: input,

      // ===== LEAD-IDENTIFIKATION =====
      // WICHTIG: Lead_ID nur falls im Webhook vorhanden
      ...(leadIdFromWebhook ? { Lead_ID: leadIdFromWebhook } : {}),

      // ===== TIMESTAMPS =====
      timestamp: timestamp,
      jahr: year,
      datum: datum,
      uhrzeit: uhrzeit,

      // ===== KUNDENDATEN =====
      Customer_Type: customerType,
      Firmenname: firmenname || DEFAULTS.firma,

      // ===== KONTAKTINFORMATIONEN =====
      Email: email || DEFAULTS.email,
      Email_Gueltig: emailGueltig,
      Email_Typ: emailTyp,

      fullName: fullName,
      Vorname: firstName || DEFAULTS.string,
      Nachname: lastName || DEFAULTS.string,

      Phone: phone || DEFAULTS.phone,
      Adresse: adresse || DEFAULTS.adresse,
      Website: website || DEFAULTS.website,

      // ===== BRANCHENSPEZIFISCHE FELDER =====
      // **ANPASSEN**: Ersetze durch deine Felder
      Energieverbrauch_Tag_kWh: energieverbrauchTag,
      Energieverbrauch_Jahr_kWh: energieverbrauchJahr,
      Energieerzeugung_PV_Jahr_kWh: pvErzeugung,
      Speicherkapazitaet_kWh: speicherkapazitaet,
      Wechselrichterleistung_kW: wechselrichterLeistung,
      Batterietyp: batterietyp,

      // ===== PROJEKTDETAILS =====
      Anfrage_typ: anfrageTyp || DEFAULTS.string,
      Projektziel: projektziel || DEFAULTS.string,
      Einsatzbereich: einsatzbereich || DEFAULTS.string,
      Einsatzzweck: einsatzzweck || DEFAULTS.string,
      Investitionsrahmen: investitionsrahmen,
      Kommentar: kommentar || DEFAULTS.string,

      // ===== METADATEN =====
      Datenqualitaet_Prozent: datenqualitaet,
      Dringlichkeit: dringlichkeit,
      Validierung_Status: 'validiert',
      Validierung_Timestamp: timestamp,
      Ausgefuellte_Felder: ausgefuellteFelder,
      Gesamt_Felder: gesamtFelder
    }
  };
});

// ---------------------------------------------------------------------------
// 1️⃣6️⃣ LOGGING
// ---------------------------------------------------------------------------
console.log(`✅ ${items.length} Webhook-Items validiert und klassifiziert`);
console.log(`📊 Durchschnittliche Datenqualität: ${
  Math.round(items.reduce((sum, item) =>
    sum + item.json.Datenqualitaet_Prozent, 0) / items.length)
}%`);

// ---------------------------------------------------------------------------
// 1️⃣7️⃣ RÜCKGABE
// ---------------------------------------------------------------------------
return items;

// ============================================================================
// ANPASSUNG FÜR ANDERE BRANCHEN:
// ============================================================================
//
// 1. Ersetze Zeile 142-186 (Energie-Felder) durch deine Branchenfelder
//
// Beispiel für Software:
//   const nutzeranzahl = safeNumber(safeExtract(input, ['Nutzeranzahl']), 0);
//   const lizenzmodell = safeExtract(input, ['Lizenzmodell'], 'Basic');
//
// 2. Passe die Ausgabe (Zeile 295-324) entsprechend an
//
// 3. Aktualisiere PFLICHTFELDER in Node 00_Config
//
// ============================================================================
