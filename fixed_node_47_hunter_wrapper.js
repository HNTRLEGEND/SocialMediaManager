// ========================================
// NODE 47a: Hunter Wrapper (NEUER NODE vor Node 48)
// ========================================
// ZWECK: Aggregiert Hunter-Ergebnisse zu einem einzigen Item

const items = $input.all();

if (items.length === 0) {
  return [{
    json: {
      hunter_data: {
        status: 'no_data',
        emails: [],
        message: 'Keine Hunter.io Daten verfügbar'
      }
    }
  }];
}

// Alle Hunter-Ergebnisse sammeln
const allEmails = [];
const firstItem = items[0];

for (const item of items) {
  // Falls Hunter mehrere Ergebnisse als separateItems zurückgibt
  if (item.json.email) {
    allEmails.push({
      first_name: item.json.first_name || '',
      last_name: item.json.last_name || '',
      email: item.json.email || item.json.value,
      position: item.json.position || '',
      department: item.json.department || '',
      phone_number: item.json.phone_number || '',
      confidence: item.json.confidence || 0,
      type: item.json.type || 'generic',
      source: 'Hunter.io'
    });
  }
}

// Aggregiertes Ergebnis zurückgeben
return [{
  json: {
    ...firstItem.json,
    hunter_data: {
      status: 'success',
      emails: allEmails,
      total_found: allEmails.length,
      domain: firstItem.json.domain || '',
      timestamp: new Date().toISOString()
    }
  },
  pairedItem: { item: 0 }
}];
