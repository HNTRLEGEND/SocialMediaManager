# 🔧 n8n Lead-Manager Workflow - Korrigierte Struktur

## ✅ KRITISCHE FIXES

### 1. **Lead_ID-Konsistenz**
- ❌ **VORHER:** Node 4 generierte immer neue Lead_IDs
- ✅ **JETZT:** Node 4 übernimmt Lead_ID aus Webhook (falls vorhanden)

### 2. **Hunter.io Multi-Item Problem**
- ❌ **VORHER:** Hunter erzeugte mehrere Items (1 pro E-Mail)
- ✅ **JETZT:** Neuer Wrapper-Node aggregiert alle Hunter-Ergebnisse zu 1 Item

### 3. **Customer Profile Single-Row**
- ❌ **VORHER:** Potenziell mehrere Rows für denselben Lead
- ✅ **JETZT:** Node 49 gibt IMMER nur 1 Item zurück

---

## 🔀 WORKFLOW-REIHENFOLGE

```
1_Webhook_Trigger
    ↓
2_Validate_Classify (KORRIGIERT)
    ↓
3_Read_Counter
    ↓
4_Generate_IDs (KORRIGIERT - übernimmt Lead_ID aus Webhook!)
    ↓
20_Prepare_Analysis_Data
    ↓
45_Search_Company_Website
    ↓
46_Scrape_Company_Website
    ↓
47_Hunter (Hunter.io API Node)
    ↓
47a_Hunter_Wrapper (NEU! - aggregiert Hunter-Ergebnisse)
    ↓
48_LinkedIn_Company_Search
    ↓
49_Generate_Customer_Profile (KORRIGIERT - nur 1 Item!)
    ↓
6_Intelligence_Gathering (AI Agent)
    ↓
[Weitere Nodes: Dossier, Counter, Sheets...]
```

---

## 🛠️ INSTALLATION DER FIXES

### **Schritt 1: Node 2 ersetzen**
1. Öffne Node `2_Validate_Classify`
2. Ersetze den JavaScript-Code mit `fixed_node_2_validate.js`
3. Speichern

### **Schritt 2: Node 4 ersetzen**
1. Öffne Node `4_Generate_IDs`
2. Ersetze den JavaScript-Code mit `fixed_node_4_generate_ids.js`
3. Speichern

### **Schritt 3: Neuen Node 47a hinzufügen**
1. Erstelle einen neuen **Code-Node** zwischen Node 47 und 48
2. Name: `47a_Hunter_Wrapper`
3. Code einfügen: `fixed_node_47_hunter_wrapper.js`
4. Verbindungen anpassen:
   - `47_Hunter` → `47a_Hunter_Wrapper`
   - `47a_Hunter_Wrapper` → `48_LinkedIn_Company_Search`

### **Schritt 4: Node 49 ersetzen**
1. Öffne Node `49_Generate_Customer_Profile`
2. Ersetze den JavaScript-Code mit `fixed_node_49_customer_profile.js`
3. Speichern

---

## 🧪 TESTING

### Test-Webhook senden:
```json
{
  "Lead_ID": "LEAD_250123",
  "Firmenname": "Test GmbH",
  "Email": "kontakt@test.de",
  "Phone": "+49 123 456789",
  "fullName": "Max Mustermann",
  "EnergieverbrauchProJahrkWh": 50000,
  "Projektziel": "Speicherlösung",
  "Website": "https://test.de"
}
```

### Erwartetes Ergebnis:
1. ✅ Lead_ID `LEAD_250123` bleibt erhalten
2. ✅ Nur **1 Item** in Node 49 Output
3. ✅ Hunter-Kontakte in `customer_profile.contacts_found[]`
4. ✅ Keine "undefined" Strings

---

## 🔍 DEBUGGING

### Console-Logs prüfen:
```javascript
// Node 4 Output
console.log(`✅ Lead_ID aus Webhook übernommen: ${leadId}`);

// Node 49 Output
console.log(`✅ Kundenprofil erstellt für ${leadId} mit ${hunterContacts.length} Sekundärkontakten`);
```

### Validierung:
1. Prüfe Node 49 Output → muss **genau 1 Item** sein
2. Prüfe `customer_profile.contacts_found` → Array mit Hunter-Kontakten
3. Prüfe `customer_profile.metadata.total_contacts` → 1 + Anzahl Hunter-Kontakte

---

## ⚠️ WICHTIGE HINWEISE

### Lead_ID-Konvention:
- **Webhook hat Lead_ID** → Übernehmen
- **Kein Lead_ID im Webhook** → Neu generieren aus Counter
- **NIEMALS** Lead_ID überschreiben!

### Hunter.io Konfiguration:
- **Limit:** 5 (im Hunter-Node)
- **Always Output Data:** TRUE
- **Execute Once:** FALSE

### Fehlende Daten:
- Strings: `"Nicht angegeben"`
- Zahlen: `0`
- **NIEMALS:** `null`, `undefined`, `""`

---

## 📊 OUTPUT-STRUKTUR (Node 49)

```json
{
  "Lead_ID": "LEAD_250123",
  "customer_profile": {
    "contact_info": { ... },
    "company_details": { ... },
    "energy_profile": { ... },
    "project_details": { ... },
    "contacts_found": [
      {
        "contact_id": "LEAD_250123_SEC1",
        "source": "Hunter.io",
        "name": "John Doe",
        "email": "john@test.de",
        "position": "CTO",
        "note": "Sekundärkontakt - nur für Bericht"
      }
    ],
    "metadata": {
      "total_contacts": 3,
      "data_sources": ["Webhook", "Hunter.io", "LinkedIn"],
      "data_completeness": 85
    }
  }
}
```

---

## 🎯 ERFOLGS-KRITERIEN

✅ Nur **1 Lead-Objekt** pro Webhook
✅ Lead_ID wird **niemals** überschrieben
✅ Hunter-Kontakte sind **Sekundärkontakte** (nicht separate Leads)
✅ Alle Felder haben **Defaults** (keine "undefined")
✅ AI-Agent erhält **vollständiges** Profil

---

## 🆘 SUPPORT

Bei Problemen prüfen:
1. Console-Logs in jedem kritischen Node
2. Item-Count zwischen Nodes (muss 1 bleiben!)
3. Lead_ID-Konsistenz durch gesamten Workflow
