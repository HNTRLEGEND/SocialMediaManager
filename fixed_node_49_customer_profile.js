// ========================================
// NODE 49: Generate Customer Profile (KORRIGIERT)
// ========================================
// ZWECK: Aggregiert ALLE Datenquellen zu EINEM Lead-Objekt
// WICHTIG: Gibt IMMER nur 1 Item zurück!

const items = $input.all();

// ⚠️ Falls Hunter mehrere Items erzeugt hat, aggregiere sie
const firstItem = items[0];

// 1️⃣ DATENQUELLEN EXTRAHIEREN
const webhookData = firstItem.json.webhookData || firstItem.json.body || firstItem.json;
const scraperData = firstItem.json.page_data || {};
const hunterData = firstItem.json.hunter_data || {};
const linkedInData = firstItem.json.linkedin_data || {};

// 2️⃣ LEAD_ID BESTIMMEN (KRITISCH!)
const leadId = firstItem.json.Lead_ID ||
               webhookData.Lead_ID ||
               webhookData['Lead-ID'] ||
               `LEAD_${Date.now()}`;

console.log(`📌 Lead_ID für Profil: ${leadId}`);

// 3️⃣ HELPER-FUNKTIONEN
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

function safeNumber(val, fallback = 0) {
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

// 4️⃣ HUNTER-KONTAKTE AGGREGIEREN (alle Items durchgehen!)
const hunterContacts = [];
for (const item of items) {
  // Falls Hunter mehrere Ergebnisse hat
  const hunterEmails = item.json.emails || item.json.data?.emails || [];

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
  }
}

// 5️⃣ KUNDENPROFIL ERSTELLEN
const customerProfile = {
  Lead_ID: leadId,

  customer_profile: {
    // Kontaktinformationen (Primärkontakt aus Webhook)
    contact_info: {
      full_name: safeGet(webhookData, 'fullName',
                         `${safeGet(webhookData, 'Vorname', '')} ${safeGet(webhookData, 'Nachname', '')}`.trim()),
      first_name: safeGet(webhookData, 'Vorname'),
      last_name: safeGet(webhookData, 'Nachname'),
      email: safeGet(webhookData, 'Email'),
      phone: safeGet(webhookData, 'Phone'),
      mobile: safeGet(webhookData, 'Mobile', safeGet(webhookData, 'Phone')),
      position: safeGet(webhookData, 'Position'),
      contact_source: "Webhook (Primärkontakt)"
    },

    // Firmendaten
    company_details: {
      name: safeGet(webhookData, 'Firmenname', 'Privatperson'),
      website: safeGet(webhookData, 'Website', safeGet(scraperData, 'website_url')),
      domain: safeGet(scraperData, 'domain', safeGet(webhookData, 'Website')),
      industry: safeGet(linkedInData, 'industry', safeGet(scraperData, 'industry')),
      employee_count: safeGet(linkedInData, 'employee_count'),
      company_size: safeGet(linkedInData, 'estimated_company_size'),
      linkedin_url: safeGet(linkedInData, 'linkedin_url'),
      address: safeGet(webhookData, 'Adresse'),
      description: safeGet(scraperData, 'meta_description',
                          safeGet(scraperData, 'pages.0.meta_description'))
    },

    // Energieprofil
    energy_profile: {
      daily_consumption_kwh: safeNumber(webhookData.EnergieverbrauchProTagkWh, 0),
      annual_consumption_kwh: safeNumber(webhookData.EnergieverbrauchProJahrkWh, 0),
      pv_generation_kwh: safeNumber(webhookData.EnergieerzeugungPVproJahrkWh, 0),
      storage_capacity_kwh: safeNumber(webhookData.speicherkapazitaetkWh, 0),
      inverter_power_kw: safeNumber(webhookData.WechselrichterLeistungkW, 0),
      battery_type: safeGet(webhookData, 'Batterietyp', 'LiFePO4')
    },

    // Projektdetails
    project_details: {
      inquiry_type: safeGet(webhookData, 'Anfrage_typ'),
      project_goal: safeGet(webhookData, 'Projektziel'),
      usage_area: safeGet(webhookData, 'Einsatzbereich'),
      purpose: safeGet(webhookData, 'Einsatzzweck'),
      investment_range: safeGet(webhookData, 'investitionskapazitaet_range', '<50k'),
      comments: safeGet(webhookData, 'Kommentar')
    },

    // 🔥 SEKUNDÄRKONTAKTE (aus Hunter.io, Scraper, etc.)
    contacts_found: hunterContacts.map((contact, idx) => ({
      contact_id: `${leadId}_SEC${idx + 1}`,
      source: contact.source,
      name: contact.name,
      email: contact.email,
      position: contact.position,
      phone: contact.phone,
      confidence: contact.confidence,
      note: "Sekundärkontakt - nur für Bericht, nicht als eigenständiger Lead"
    })),

    // Metadaten
    metadata: {
      lead_source: "Webhook",
      data_sources: [
        "Webhook (Primär)",
        scraperData.scraped_successfully ? "Website Scraper" : null,
        hunterContacts.length > 0 ? "Hunter.io" : null,
        linkedInData.status === 'found' ? "LinkedIn" : null
      ].filter(Boolean),
      total_contacts: 1 + hunterContacts.length,
      data_completeness: calculateCompleteness(webhookData),
      timestamp: new Date().toISOString()
    }
  }
};

// 6️⃣ DATEN-VOLLSTÄNDIGKEIT BERECHNEN
function calculateCompleteness(data) {
  const requiredFields = [
    'Email', 'Phone', 'Firmenname', 'Adresse',
    'EnergieverbrauchProJahrkWh', 'Projektziel'
  ];

  const filledFields = requiredFields.filter(field =>
    data[field] && data[field] !== '' && data[field] !== 'Nicht angegeben'
  ).length;

  return Math.round((filledFields / requiredFields.length) * 100);
}

// 7️⃣ VALIDIERUNG: Stelle sicher, dass keine "undefined" Strings vorhanden sind
const profileString = JSON.stringify(customerProfile);
if (profileString.includes('"undefined"') || profileString.includes('undefined')) {
  console.error('⚠️ WARNUNG: "undefined" im Profil gefunden!');
}

// 8️⃣ RÜCKGABE: IMMER NUR 1 ITEM!
console.log(`✅ Kundenprofil erstellt für ${leadId} mit ${hunterContacts.length} Sekundärkontakten`);

return [{
  json: customerProfile,
  pairedItem: { item: 0 }
}];
