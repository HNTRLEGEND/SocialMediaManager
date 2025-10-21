// ============================================================================
// NODE 70: KUNDENPROFIL GENERIEREN (SINGLE-ROW OUTPUT!)
// ============================================================================
//
// ZWECK:
// - Aggregiert ALLE Datenquellen zu EINEM Lead-Objekt
// - Primärkontakt aus Webhook
// - Sekundärkontakte aus Hunter.io, LinkedIn, Website in Array
// - Gibt IMMER nur 1 Item zurück (kritisch!)
//
// INPUT:  Daten aus Node 50 (Scoring) + 60 (Enrichment)
// OUTPUT: 1 Lead-Objekt mit vollständigem Profil
//
// **KRITISCH:** Dieser Node MUSS exakt 1 Item zurückgeben, nie mehr!
// ============================================================================

// ---------------------------------------------------------------------------
// 1️⃣ KONFIGURATION LADEN
// ---------------------------------------------------------------------------
const config = $('00_Config').first().json;
const DEFAULTS = config.DEFAULTS;

// ---------------------------------------------------------------------------
// 2️⃣ EINGABEDATEN SAMMELN
// ---------------------------------------------------------------------------
// Alle eingehenden Items (z.B. mehrere Hunter-Ergebnisse)
const items = $input.all();

// Erstes Item als Basis (enthält alle Webhook- und Scoring-Daten)
const firstItem = items[0];

// Extrahiere verschiedene Datenquellen
const webhookData = firstItem.json.webhookData || firstItem.json;
const websiteData = firstItem.json.website_data || firstItem.json.page_data || {};
const linkedInData = firstItem.json.linkedin_data || {};

// ---------------------------------------------------------------------------
// 3️⃣ LEAD_ID BESTIMMEN (KRITISCH!)
// ---------------------------------------------------------------------------
const leadId = firstItem.json.Lead_ID ||
               webhookData.Lead_ID ||
               webhookData['Lead-ID'] ||
               `LEAD_${Date.now()}`;

console.log(`📌 Erstelle Profil für Lead: ${leadId}`);

// ---------------------------------------------------------------------------
// 4️⃣ HILFSFUNKTIONEN
// ---------------------------------------------------------------------------

/**
 * Sichere Wert-Extraktion
 */
function safeGet(obj, path, fallback = "Nicht angegeben") {
  try {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    return (value !== null && value !== undefined && value !== '') ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Sichere Zahlen-Konvertierung
 */
function safeNumber(val, fallback = 0) {
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

// ---------------------------------------------------------------------------
// 5️⃣ HUNTER.IO KONTAKTE AGGREGIEREN
// ---------------------------------------------------------------------------
/**
 * WICHTIG: Hunter kann mehrere Items zurückgeben (1 pro Email)
 * Wir aggregieren alle zu einem Array
 */
const hunterContacts = [];

for (const item of items) {
  // Prüfe, ob dieses Item Hunter-Daten enthält
  const hunterEmails = item.json.emails ||
                       item.json.data?.emails ||
                       item.json.hunter_data?.emails ||
                       [];

  if (Array.isArray(hunterEmails)) {
    for (const email of hunterEmails) {
      hunterContacts.push({
        source: "Hunter.io",
        name: `${email.first_name || ''} ${email.last_name || ''}`.trim() || "Unbekannt",
        first_name: email.first_name || "",
        last_name: email.last_name || "",
        email: email.value || email.email || "",
        position: email.position || "Nicht angegeben",
        department: email.department || "",
        phone: email.phone_number || "",
        confidence: email.confidence || 0,
        type: email.type || "generic"
      });
    }
  } else if (item.json.email) {
    // Einzelnes Email-Item von Hunter
    hunterContacts.push({
      source: "Hunter.io",
      name: `${item.json.first_name || ''} ${item.json.last_name || ''}`.trim(),
      email: item.json.email || item.json.value,
      position: item.json.position || "Nicht angegeben",
      confidence: item.json.confidence || 0
    });
  }
}

// ---------------------------------------------------------------------------
// 6️⃣ WEBSITE-KONTAKTE EXTRAHIEREN
// ---------------------------------------------------------------------------
const websiteContacts = [];

if (websiteData.emails && Array.isArray(websiteData.emails)) {
  websiteData.emails.forEach((email, idx) => {
    websiteContacts.push({
      source: "Website",
      name: "Aus Website extrahiert",
      email: email,
      position: "Unbekannt",
      confidence: 50
    });
  });
}

// ---------------------------------------------------------------------------
// 7️⃣ LINKEDIN-KONTAKTE (Falls vorhanden)
// ---------------------------------------------------------------------------
const linkedInContacts = [];

if (linkedInData.contacts && Array.isArray(linkedInData.contacts)) {
  linkedInData.contacts.forEach(contact => {
    linkedInContacts.push({
      source: "LinkedIn",
      name: contact.name || "Unbekannt",
      email: contact.email || "",
      position: contact.title || "Nicht angegeben",
      linkedin_url: contact.profile_url || ""
    });
  });
}

// ---------------------------------------------------------------------------
// 8️⃣ ALLE SEKUNDÄRKONTAKTE ZUSAMMENFÜHREN
// ---------------------------------------------------------------------------
const alleSekundaerkontakte = [
  ...hunterContacts,
  ...websiteContacts,
  ...linkedInContacts
];

// Duplikate entfernen (gleiche Email)
const uniqueKontakte = alleSekundaerkontakte.reduce((acc, current) => {
  const exists = acc.find(item => item.email === current.email && current.email !== "");
  if (!exists) {
    acc.push(current);
  }
  return acc;
}, []);

console.log(`📧 Gefunden: ${uniqueKontakte.length} Sekundärkontakte`);

// ---------------------------------------------------------------------------
// 9️⃣ KUNDENPROFIL ERSTELLEN
// ---------------------------------------------------------------------------
const customerProfile = {
  // ===== LEAD-IDENTIFIKATION =====
  Lead_ID: leadId,

  // ===== SCORING & QUALIFIKATION =====
  // Aus Node 50 übernehmen
  Lead_Score: firstItem.json.Lead_Score || 0,
  Lead_Category: firstItem.json.Lead_Category || "NURTURE",
  Qualified: firstItem.json.Qualified || false,
  Score_Breakdown: firstItem.json.Score_Breakdown || {},

  // ===== KUNDENPROFIL =====
  customer_profile: {

    // --- KONTAKTINFORMATIONEN (Primärkontakt aus Webhook) ---
    contact_info: {
      full_name: safeGet(webhookData, 'fullName',
                         `${safeGet(webhookData, 'Vorname', '')} ${safeGet(webhookData, 'Nachname', '')}`.trim()),
      first_name: safeGet(webhookData, 'Vorname'),
      last_name: safeGet(webhookData, 'Nachname'),
      email: safeGet(webhookData, 'Email'),
      email_valid: firstItem.json.Email_Gueltig || false,
      email_type: firstItem.json.Email_Typ || 'unbekannt',
      phone: safeGet(webhookData, 'Phone'),
      mobile: safeGet(webhookData, 'Mobile', safeGet(webhookData, 'Phone')),
      position: safeGet(webhookData, 'Position'),
      contact_source: "Webhook (Primärkontakt)"
    },

    // --- UNTERNEHMENSDATEN ---
    company_details: {
      name: safeGet(webhookData, 'Firmenname', DEFAULTS.firma),
      website: safeGet(webhookData, 'Website', safeGet(websiteData, 'website_url')),
      domain: safeGet(websiteData, 'domain', safeGet(webhookData, 'Website')),
      industry: safeGet(linkedInData, 'industry', safeGet(websiteData, 'industry')),
      employee_count: safeGet(linkedInData, 'employee_count'),
      company_size: safeGet(linkedInData, 'estimated_company_size'),
      linkedin_url: safeGet(linkedInData, 'linkedin_url'),
      founded_year: safeGet(websiteData, 'founded_year'),
      address: safeGet(webhookData, 'Adresse'),
      description: safeGet(websiteData, 'meta_description',
                          safeGet(websiteData, 'pages.0.meta_description'))
    },

    // --- BRANCHENSPEZIFISCHE DATEN ---
    // **ANPASSEN**: Ersetze durch deine Felder aus Node 00_Config
    project_data: {
      // Energiedaten (Beispiel Batteriesysteme)
      daily_consumption_kwh: safeNumber(webhookData.Energieverbrauch_Tag_kWh, 0),
      annual_consumption_kwh: safeNumber(webhookData.Energieverbrauch_Jahr_kWh, 0),
      pv_generation_kwh: safeNumber(webhookData.Energieerzeugung_PV_Jahr_kWh, 0),
      storage_capacity_kwh: safeNumber(webhookData.Speicherkapazitaet_kWh, 0),
      inverter_power_kw: safeNumber(webhookData.Wechselrichterleistung_kW, 0),
      battery_type: safeGet(webhookData, 'Batterietyp', 'LiFePO4'),

      // Projektdetails
      inquiry_type: safeGet(webhookData, 'Anfrage_typ'),
      project_goal: safeGet(webhookData, 'Projektziel'),
      usage_area: safeGet(webhookData, 'Einsatzbereich'),
      purpose: safeGet(webhookData, 'Einsatzzweck'),
      investment_range: safeGet(webhookData, 'Investitionsrahmen', '<50k'),
      comments: safeGet(webhookData, 'Kommentar')
    },

    // --- GEFUNDENE SEKUNDÄRKONTAKTE ---
    // **KRITISCH:** Sekundärkontakte sind KEINE separaten Leads!
    // Sie werden nur im Bericht aufgeführt.
    contacts_found: uniqueKontakte.map((contact, idx) => ({
      contact_id: `${leadId}_SEC${idx + 1}`,
      source: contact.source,
      name: contact.name,
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email,
      position: contact.position,
      department: contact.department || "",
      phone: contact.phone || "",
      confidence: contact.confidence || 0,
      linkedin_url: contact.linkedin_url || "",
      note: "Sekundärkontakt - nur für Bericht, nicht als eigenständiger Lead"
    })),

    // --- METADATEN ---
    metadata: {
      lead_source: "Webhook",
      data_sources: [
        "Webhook (Primär)",
        websiteData.scraped_successfully ? "Website Scraper" : null,
        uniqueKontakte.length > 0 ? "Hunter.io" : null,
        linkedInData.status === 'found' ? "LinkedIn" : null
      ].filter(Boolean),
      total_contacts: 1 + uniqueKontakte.length, // Primär + Sekundär
      data_completeness: firstItem.json.Datenqualitaet_Prozent || 0,
      urgency: firstItem.json.Dringlichkeit || 'normal',
      timestamp: new Date().toISOString(),
      profile_created_by: "Node 70_Generate_Profile",
      profile_version: "1.0.0"
    }
  }
};

// ---------------------------------------------------------------------------
// 🔟 DATENQUALITÄTS-VALIDIERUNG
// ---------------------------------------------------------------------------
/**
 * Stelle sicher, dass keine "undefined" Strings vorhanden sind
 */
const profileString = JSON.stringify(customerProfile);

if (profileString.includes('"undefined"') || profileString.includes('undefined')) {
  console.error('⚠️ WARNUNG: "undefined" im Kundenprofil gefunden!');
  console.error('Betroffene Daten:', profileString.substring(0, 500));
}

// ---------------------------------------------------------------------------
// 1️⃣1️⃣ AUSGABE: IMMER NUR 1 ITEM!
// ---------------------------------------------------------------------------
console.log(`✅ Kundenprofil erstellt für ${leadId} mit ${uniqueKontakte.length} Sekundärkontakten`);
console.log(`📊 Datenquellen: ${customerProfile.customer_profile.metadata.data_sources.join(', ')}`);
console.log(`🎯 Datenqualität: ${customerProfile.customer_profile.metadata.data_completeness}%`);

// **KRITISCH:** Gibt IMMER Array mit genau 1 Item zurück!
return [{
  json: customerProfile,
  pairedItem: { item: 0 }
}];

// ============================================================================
// ANPASSUNG FÜR ANDERE BRANCHEN:
// ============================================================================
//
// Zeile 210-230: Ersetze project_data durch deine Branchenfelder
//
// Beispiel für Software:
//   project_data: {
//     user_count: safeNumber(webhookData.Nutzeranzahl, 0),
//     license_model: safeGet(webhookData, 'Lizenzmodell', 'Basic'),
//     tech_stack: safeGet(webhookData, 'Tech_Stack'),
//     monthly_revenue: safeNumber(webhookData.MRR, 0)
//   }
//
// Beispiel für Immobilien:
//   project_data: {
//     square_meters: safeNumber(webhookData.Quadratmeter, 0),
//     rooms: safeNumber(webhookData.Zimmeranzahl, 0),
//     construction_year: safeNumber(webhookData.Baujahr, 0),
//     price_range: safeGet(webhookData, 'Preisklasse')
//   }
//
// ============================================================================
