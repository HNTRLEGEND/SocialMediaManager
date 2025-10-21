// ========================================
// NODE 2: Validate & Classify (KORRIGIERT)
// ========================================
// WICHTIG: Validiert Webhook-Daten und erstellt saubere Struktur

const items = $input.all().map(item => {
  // Webhook-Daten extrahieren
  let input = item.json.body || item.json;

  console.log('Webhook empfangen:', Object.keys(input));

  // Safe-Extraction-Funktion
  function safeExtract(obj, fields, fallback = '') {
    if (!obj) return fallback;

    for (const field of fields) {
      // Direkte Übereinstimmung
      if (obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
        return String(obj[field]).trim();
      }

      // Case-insensitive Suche
      const matchingKey = Object.keys(obj).find(
        key => key.toLowerCase() === field.toLowerCase()
      );
      if (matchingKey && obj[matchingKey]) {
        return String(obj[matchingKey]).trim();
      }
    }

    return fallback;
  }

  // Timestamp-Handling
  const now = new Date();
  const timestamp = now.toISOString();
  const year = now.getFullYear().toString().slice(-2);

  // Namen kombinieren
  const firstName = safeExtract(input, ['Vorname', 'first_name', 'firstName']);
  const lastName = safeExtract(input, ['Nachname', 'last_name', 'lastName']);
  const fullName = safeExtract(input, ['fullName', 'full_name']) ||
                   (firstName && lastName ? `${firstName} ${lastName}` : 'Nicht angegeben');

  // WICHTIG: Lead_ID aus Webhook extrahieren (falls vorhanden)
  const leadIdFromWebhook = safeExtract(input, ['Lead_ID', 'Lead-ID', 'lead_id', 'LeadID']);

  return {
    json: {
      // ⚠️ Webhook-Rohdaten für spätere Nodes
      webhookData: input,

      // Lead_ID aus Webhook (falls vorhanden)
      ...(leadIdFromWebhook ? { Lead_ID: leadIdFromWebhook } : {}),

      // Timestamps
      timestamp: timestamp,
      year: year,

      // Kundendaten
      Customer_Type: safeExtract(input, ['Customer_Type', 'customer_type', 'Kundentyp']) || 'Private',
      Firmenname: safeExtract(input, ['Firmenname', 'company_name', 'companyName']),

      // Kontaktinformationen
      Email: safeExtract(input, ['Email', 'email', 'kontakt_email']),
      fullName: fullName,
      Vorname: firstName,
      Nachname: lastName,
      Phone: safeExtract(input, ['Phone', 'phone', 'Telefon', 'tel']),
      Adresse: safeExtract(input, ['Adresse', 'address', 'full_address']),
      Website: safeExtract(input, ['Website', 'website', 'web']),

      // Projektdetails
      Anfrage_typ: safeExtract(input, ['Anfrage_typ', 'anfrage_typ', 'inquiry_type']),
      Projektziel: safeExtract(input, ['Projektziel', 'project_goal', 'projektziel']),
      Einsatzbereich: safeExtract(input, ['Einsatzbereich', 'usage_area', 'einsatzbereich']),
      Einsatzzweck: safeExtract(input, ['Einsatzzweck', 'purpose', 'einsatzzweck']),

      // Energiedaten
      EnergieverbrauchProTagkWh: parseFloat(
        safeExtract(input, ['EnergieverbrauchProTagkWh', 'energieverbrauch_tag', 'daily_energy_consumption']) || 0
      ),
      EnergieverbrauchProJahrkWh: parseFloat(
        safeExtract(input, ['EnergieverbrauchProJahrkWh', 'energieverbrauch_jahr', 'annual_energy_consumption']) || 0
      ),
      EnergieerzeugungPVproJahrkWh: parseFloat(
        safeExtract(input, ['EnergieerzeugungPVproJahrkWh', 'pv_erzeugung', 'solar_generation']) || 0
      ),
      speicherkapazitaetkWh: parseFloat(
        safeExtract(input, ['speicherkapazitaetkWh', 'speicher', 'storage_capacity']) || 0
      ),
      WechselrichterLeistungkW: parseFloat(
        safeExtract(input, ['WechselrichterLeistungkW', 'wechselrichter', 'inverter_power']) || 0
      ),

      // Zusatzinformationen
      Batterietyp: safeExtract(input, ['Batterietyp', 'batterietyp', 'battery_type']) || 'LiFePO4',
      Kommentar: safeExtract(input, ['Kommentar', 'kommentar', 'message', 'comment']),

      // Investitionsrahmen (wichtig für Scoring)
      investitionskapazitaet_range: safeExtract(input, ['investitionskapazitaet_range', 'budget_range']) || '<50k',

      // Validierungsstatus
      validation_status: 'validated',
      validation_timestamp: timestamp
    }
  };
});

console.log(`✅ ${items.length} Webhook-Items validiert`);
return items;
