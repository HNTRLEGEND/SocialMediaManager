// ============================================================================
// NODE 40: LEAD-ID & OFFER-ID GENERIERUNG
// ============================================================================
//
// ZWECK:
// - Prüft, ob Webhook bereits eine Lead_ID enthält
// - Falls JA: Übernimmt die ID (NIEMALS überschreiben!)
// - Falls NEIN: Generiert neue ID basierend auf Counter
// - Generiert zugehörige Offer-ID
//
// INPUT:  Validierte Daten (Node 20) + Counter-Daten (Node 30)
// OUTPUT: Daten mit garantierter Lead_ID und Offer_ID
//
// KRITISCH: Lead_ID-Konsistenz ist essentiell für Datenintegrität!
// ============================================================================

// ---------------------------------------------------------------------------
// 1️⃣ KONFIGURATION LADEN
// ---------------------------------------------------------------------------
const config = $('00_Config').first().json;

// ---------------------------------------------------------------------------
// 2️⃣ EINGABEDATEN EXTRAHIEREN
// ---------------------------------------------------------------------------
// Counter-Daten aus Node 30 (Google Sheets)
const counterData = $input.first().json;

// Webhook-Daten aus Node 20 (validiert)
const webhookNode = $('20_Validate_Classify').first();
const webhookData = webhookNode.json;

console.log('📊 Counter-Daten:', counterData);
console.log('📋 Webhook-Daten Keys:', Object.keys(webhookData));

// ---------------------------------------------------------------------------
// 3️⃣ LEAD_ID BESTIMMEN (KRITISCH!)
// ---------------------------------------------------------------------------
/**
 * WICHTIGSTE REGEL:
 * Wenn der Webhook bereits eine Lead_ID mitsendet, NIEMALS überschreiben!
 * Nur wenn keine ID vorhanden ist, wird eine neue generiert.
 */

let leadId = null;
let leadIdQuelle = 'unbekannt';

// Prüfe verschiedene mögliche Schreibweisen
leadId = webhookData['Lead_ID'] ||
         webhookData['Lead-ID'] ||
         webhookData.lead_id ||
         webhookData.LeadID ||
         webhookData.leadid;

if (leadId) {
  // ✅ Lead_ID aus Webhook übernommen
  leadIdQuelle = 'webhook';
  console.log(`✅ Lead_ID aus Webhook übernommen: ${leadId}`);

} else {
  // ❌ Keine Lead_ID im Webhook → Neue generieren

  // Hole den letzten verwendeten Counter-Wert
  let lastNumber = 250001; // Default-Startwert

  if (counterData && counterData.Last_Number) {
    // Extrahiere Zahl aus String "LEAD_250001" → 250001
    let lastNumStr = String(counterData.Last_Number);

    // Entferne "LEAD_" Präfix falls vorhanden
    if (lastNumStr.startsWith('LEAD_')) {
      lastNumStr = lastNumStr.replace('LEAD_', '');
    }

    // Konvertiere zu Zahl
    lastNumber = parseInt(lastNumStr, 10);

    // Validierung
    if (isNaN(lastNumber) || lastNumber < 1) {
      console.warn(`⚠️ Ungültiger Counter-Wert: ${counterData.Last_Number}. Nutze Default: 250001`);
      lastNumber = 250001;
    }
  }

  // Generiere neue Lead_ID
  const newLeadNumber = lastNumber + 1;
  leadId = `LEAD_${String(newLeadNumber).padStart(6, '0')}`; // z.B. "LEAD_250002"

  leadIdQuelle = 'generiert';
  console.log(`🆕 Neue Lead_ID generiert: ${leadId} (Vorgänger: ${lastNumber})`);
}

// ---------------------------------------------------------------------------
// 4️⃣ OFFER-ID GENERIEREN
// ---------------------------------------------------------------------------
/**
 * Offer-ID Format: OFFER_YY_XXXX
 * - YY: Jahr (2-stellig, z.B. "25" für 2025)
 * - XXXX: Laufende Nummer (4-stellig, z.B. "0123")
 */

const year = new Date().getFullYear().toString().slice(-2); // "25"

// Extrahiere Counter für Offers
let lastOfferNumber = 1; // Default

if (counterData && counterData.Last_Number) {
  // Wenn Counter ein Offer-Eintrag hat
  const counterRows = $('30_Read_Counter').all();

  // Suche nach dem Offer-Counter
  const offerCounterRow = counterRows.find(row =>
    row.json.ID_Type === 'OFFER_ID' ||
    row.json.ID_Type === 'Offer-ID'
  );

  if (offerCounterRow) {
    const lastOfferStr = String(offerCounterRow.json.Last_Number);

    // Extrahiere Nummer aus "OFFER_25_0123" → 123
    const match = lastOfferStr.match(/OFFER_\d+_(\d+)/);
    if (match && match[1]) {
      lastOfferNumber = parseInt(match[1], 10);
    }
  }
}

// Generiere neue Offer-ID
const newOfferNumber = lastOfferNumber + 1;
const offerId = `OFFER_${year}_${String(newOfferNumber).padStart(4, '0')}`;

console.log(`📄 Offer-ID generiert: ${offerId}`);

// ---------------------------------------------------------------------------
// 5️⃣ ZUSÄTZLICHE IDs GENERIEREN
// ---------------------------------------------------------------------------

// Tracking-ID für Webhook-Response
const trackingId = `TRACK_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${String(newOfferNumber).padStart(3, '0')}`;
// Beispiel: "TRACK_20250121_001"

// Dossier-ID (wird später mit Google Docs ID verknüpft)
const dossierId = `DOSSIER_${leadId}`;

// ---------------------------------------------------------------------------
// 6️⃣ VALIDIERUNG & FEHLERBEHANDLUNG
// ---------------------------------------------------------------------------

// Prüfe, ob Lead_ID valides Format hat
const leadIdRegex = /^LEAD_\d{6}$/;
if (!leadIdRegex.test(leadId)) {
  throw new Error(`❌ Ungültige Lead_ID generiert: ${leadId}. Format muss LEAD_XXXXXX sein!`);
}

// Prüfe, ob Offer_ID valides Format hat
const offerIdRegex = /^OFFER_\d{2}_\d{4}$/;
if (!offerIdRegex.test(offerId)) {
  throw new Error(`❌ Ungültige Offer_ID generiert: ${offerId}. Format muss OFFER_YY_XXXX sein!`);
}

// ---------------------------------------------------------------------------
// 7️⃣ COUNTER-UPDATE VORBEREITEN
// ---------------------------------------------------------------------------
/**
 * Diese Daten werden später von Node 80 (Update_Counter) verwendet
 */

const counterUpdate = {
  // Für Lead-Counter
  lead: {
    ID_Type: 'LEAD_ID',
    Last_Number: leadId,
    Next: parseInt(leadId.replace('LEAD_', '')) + 1
  },

  // Für Offer-Counter
  offer: {
    ID_Type: 'OFFER_ID',
    Last_Number: offerId,
    Next: `OFFER_${year}_${String(newOfferNumber + 1).padStart(4, '0')}`
  }
};

// ---------------------------------------------------------------------------
// 8️⃣ AUSGABE: ANGEREICHERTE DATEN
// ---------------------------------------------------------------------------

return {
  json: {
    // ===== GENERIERTE IDs =====
    Lead_ID: leadId,
    Offer_ID: offerId,
    Tracking_ID: trackingId,
    Dossier_ID: dossierId,

    // ===== METADATEN =====
    Lead_ID_Quelle: leadIdQuelle, // "webhook" oder "generiert"
    Lead_ID_Generiert_Am: new Date().toISOString(),
    Counter_Alt: counterData ? counterData.Last_Number : null,
    Counter_Neu: leadId,

    // ===== COUNTER-UPDATE-DATEN =====
    // Wird von Node 80 verwendet
    Counter_Update: counterUpdate,

    // ===== WEBHOOK-DATEN DURCHREICHEN =====
    // Alle Daten aus Node 20 mitnehmen
    ...webhookData,

    // ===== LOGGING =====
    ID_Generierung: {
      timestamp: new Date().toISOString(),
      lead_id_quelle: leadIdQuelle,
      lead_id: leadId,
      offer_id: offerId,
      tracking_id: trackingId,
      erfolg: true
    }
  }
};

// ============================================================================
// FEHLERBEHANDLUNG
// ============================================================================
//
// Bei Fehlern:
// 1. Prüfe Counter-Sheet (Node 30) → Sind Daten vorhanden?
// 2. Prüfe Format: LEAD_XXXXXX (6 Ziffern)
// 3. Prüfe Webhook: Sendet er Lead_ID mit? (Falls ja, darf nicht überschrieben werden!)
//
// ============================================================================

// ============================================================================
// ANPASSUNG FÜR ANDERE BRANCHEN:
// ============================================================================
//
// Diesen Code musst du NICHT anpassen - er funktioniert universal!
//
// Einzige Anpassung (optional):
// - Ändere Präfix "LEAD_" zu deinem Branchen-Kürzel:
//   - Software: "SW_"
//   - Immobilien: "IMMO_"
//   - Maschinenbau: "MB_"
//
// Beispiel:
//   leadId = `SW_${String(newLeadNumber).padStart(6, '0')}`; → "SW_250002"
//
// ============================================================================
