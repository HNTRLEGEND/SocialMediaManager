// ========================================
// NODE 4: Generate IDs (KORRIGIERT)
// ========================================
// WICHTIG: Lead_ID aus Webhook ÜBERNEHMEN, nicht neu generieren!

const counterData = $input.first().json;
const webhookNode = $('1_Webhook_Trigger').first();
const webhookData = webhookNode.json.body || webhookNode.json;

// 1️⃣ Lead_ID aus Webhook extrahieren (NIEMALS neu generieren!)
let leadId = webhookData['Lead-ID'] ||
             webhookData.Lead_ID ||
             webhookData.lead_id ||
             webhookData.LeadID;

// 2️⃣ Nur falls WIRKLICH keine Lead_ID vorhanden ist, erstelle eine neue
if (!leadId) {
  let lastNumber = 250001; // Default
  if (counterData && counterData.Last_Number) {
    let lastNumStr = String(counterData.Last_Number);
    lastNumber = parseInt(lastNumStr.replace('LEAD_', '')) || 250001;
  }
  const newLeadNumber = lastNumber + 1;
  leadId = `LEAD_${String(newLeadNumber).padStart(6, '0')}`;
  console.warn(`⚠️ Keine Lead_ID im Webhook! Neue ID erstellt: ${leadId}`);
} else {
  console.log(`✅ Lead_ID aus Webhook übernommen: ${leadId}`);
}

// 3️⃣ Offer-ID generieren
const year = new Date().getFullYear().toString().slice(-2);
const offerCounter = Math.floor(Math.random() * 9999) + 1;
const offerId = `OFFER_${year}_${String(offerCounter).padStart(4, '0')}`;

// 4️⃣ Rückgabe
return {
  json: {
    Lead_ID: leadId,
    Offer_ID: offerId,
    webhookData: webhookData,
    timestamp: new Date().toISOString(),
    id_source: leadId.startsWith('LEAD_') && !webhookData.Lead_ID ? 'generated' : 'webhook'
  }
};
