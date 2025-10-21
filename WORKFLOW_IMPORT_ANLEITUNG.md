# 📥 WORKFLOW-IMPORT ANLEITUNG

## 🚀 SO IMPORTIERST DU DEN WORKFLOW IN N8N

### **Option 1: Basis-Workflow importieren (empfohlen für Einsteiger)**

Ich habe einen **vereinfachten Basis-Workflow** erstellt, der die Kern-Funktionen enthält.

#### **Schritt 1: JSON-Datei importieren**

1. Öffne n8n
2. Klicke auf **"+ New Workflow"**
3. Klicke oben rechts auf **"⋮" (Drei-Punkte-Menü)**
4. Wähle **"Import from File"**
5. Wähle die Datei: `LEAD_MANAGER_WORKFLOW_COMPLETE.json`

#### **Schritt 2: Google Credentials verbinden**

Nach dem Import musst du Google-Credentials hinzufügen:

1. **Node 30_Read_Counter** anklicken
2. Bei "Credential to connect with" → **"+ Create New"**
3. **"Google Sheets OAuth2 API"** auswählen
4. OAuth-Flow durchlaufen (Google-Login)
5. **Speichern**

6. **Gleiche Credential für Node 91_Write_Master_Log** verwenden:
   - Node anklicken
   - Bei "Credential to connect with" → Deine erstellte Credential auswählen

#### **Schritt 3: Konfiguration anpassen**

**Node 00_Config öffnen** und folgende IDs anpassen:

```javascript
// Zeile 130 - Deine Google Sheets ID
const GOOGLE_SHEETS = {
  spreadsheet_id: "DEINE_SPREADSHEET_ID_HIER", // ⬅️ ANPASSEN!
  // ...
};

// Zeile 150 - Deine Google Drive Folder ID
const GOOGLE_DOCS = {
  dossier_folder_id: "DEINE_FOLDER_ID_HIER", // ⬅️ ANPASSEN!
  // ...
};
```

**So findest du die IDs:**

**Google Sheets ID:**
```
URL: https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit
                                               ↑
                                          Das ist die ID
```

**Google Drive Folder ID:**
```
URL: https://drive.google.com/drive/folders/DEF789UVW012
                                              ↑
                                         Das ist die ID
```

#### **Schritt 4: Workflow aktivieren & testen**

1. **Klicke oben rechts auf "Inactive"** → wird zu "Active"
2. **Kopiere die Webhook-URL** vom Node "10_Webhook_Trigger"
3. **Teste mit curl:**

```bash
curl -X POST https://DEINE_N8N_URL/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Firmenname": "Test GmbH",
    "Email": "test@test.de",
    "Phone": "+49 123 456789",
    "Energieverbrauch_Jahr_kWh": 50000,
    "Projektziel": "Batteriespeicher installieren"
  }'
```

**Erwartete Response:**
```json
{
  "status": "success",
  "message": "Lead erfolgreich verarbeitet",
  "Lead_ID": "LEAD_250002",
  "Tracking_ID": "TRACK_20250121_001",
  "Qualified": true,
  "Lead_Score": 6.5,
  "Lead_Category": "WARM"
}
```

---

### **Option 2: Manueller Aufbau (für volle Kontrolle)**

Falls du den Workflow Schritt für Schritt selbst aufbauen möchtest:

#### **1. Neuen Workflow erstellen**
- n8n öffnen
- "+ New Workflow"
- Name: "LEAD MANAGER - Template"

#### **2. Nodes hinzufügen**

Füge die Nodes in dieser Reihenfolge hinzu:

| Schritt | Node-Typ | Node-Name | Position (x, y) |
|---------|----------|-----------|-----------------|
| 1 | Code | 00_Config | (0, 0) |
| 2 | Webhook | 10_Webhook_Trigger | (200, 300) |
| 3 | Code | 20_Validate_Classify | (400, 300) |
| 4 | Google Sheets | 30_Read_Counter | (600, 300) |
| 5 | Code | 40_Generate_IDs | (800, 300) |
| 6 | Code | 50_Lead_Scoring | (1000, 300) |
| 7 | Google Sheets | 91_Write_Master_Log | (1200, 300) |
| 8 | Respond to Webhook | 95_Webhook_Response | (1400, 300) |

#### **3. Code in Nodes einfügen**

Für jeden **Code-Node** (00, 20, 40, 50):

1. Öffne die Node
2. Öffne die entsprechende Datei aus `/nodes/`
   - `nodes/00_Config.js`
   - `nodes/20_Validate_Classify.js`
   - `nodes/40_Generate_IDs.js`
   - `nodes/50_Lead_Scoring.js`
3. Kopiere den kompletten Code
4. Füge ihn in den n8n Code-Editor ein
5. **Speichern**

#### **4. Webhook konfigurieren (Node 10)**

- **HTTP Method:** POST
- **Path:** `lead-intake`
- **Response Mode:** "Last Node"
- **Speichern**

#### **5. Google Sheets Nodes konfigurieren**

**Node 30_Read_Counter:**
- **Operation:** Read
- **Document ID:** `={{ $('00_Config').first().json.GOOGLE_SHEETS.spreadsheet_id }}`
- **Sheet Name:** `={{ $('00_Config').first().json.GOOGLE_SHEETS.tabs.COUNTER.name }}`
- **Credential:** Neue Google Sheets OAuth2 Credential erstellen
- **Speichern**

**Node 91_Write_Master_Log:**
- **Operation:** Append
- **Document ID:** `={{ $('00_Config').first().json.GOOGLE_SHEETS.spreadsheet_id }}`
- **Sheet Name:** `={{ $('00_Config').first().json.GOOGLE_SHEETS.tabs.MASTER_LOG.name }}`
- **Columns → Mapping Mode:** "Define Below"
- **Spalten konfigurieren:**
  ```
  Lead-ID: ={{ $json.Lead_ID }}
  Offer-ID: ={{ $json.Offer_ID }}
  Timestamp_Created: ={{ $json.timestamp }}
  Customer_Type: ={{ $json.Customer_Type }}
  Firmenname: ={{ $json.Firmenname }}
  Email_Primary: ={{ $json.Email }}
  Phone_Primary: ={{ $json.Phone }}
  Website: ={{ $json.Website }}
  Energieverbrauch_Jahr_kWh: ={{ $json.Energieverbrauch_Jahr_kWh }}
  Speicherkapazitaet_kWh: ={{ $json.Speicherkapazitaet_kWh }}
  Wechselrichterleistung_kW: ={{ $json.Wechselrichterleistung_kW }}
  Batterietyp: ={{ $json.Batterietyp }}
  Projektziel: ={{ $json.Projektziel }}
  Lead_Score: ={{ $json.Lead_Score }}
  Lead_Category: ={{ $json.Lead_Category }}
  Qualified: ={{ $json.Qualified ? 'Ja' : 'Nein' }}
  Next_Action: ={{ $json.Next_Action }}
  ```
- **Credential:** Gleiche wie bei Node 30
- **Speichern**

#### **6. Webhook Response konfigurieren (Node 95)**

- **Respond With:** JSON
- **Response Body:**
  ```javascript
  ={{
    {
      "status": "success",
      "message": "Lead erfolgreich verarbeitet",
      "Lead_ID": $json.Lead_ID,
      "Tracking_ID": $json.Tracking_ID,
      "Qualified": $json.Qualified,
      "Lead_Score": $json.Lead_Score,
      "Lead_Category": $json.Lead_Category
    }
  }}
  ```
- **Speichern**

#### **7. Nodes verbinden**

Verbinde die Nodes in dieser Reihenfolge:

```
10_Webhook_Trigger (Output) → 20_Validate_Classify (Input)
20_Validate_Classify (Output) → 30_Read_Counter (Input)
30_Read_Counter (Output) → 40_Generate_IDs (Input)
40_Generate_IDs (Output) → 50_Lead_Scoring (Input)
50_Lead_Scoring (Output) → 91_Write_Master_Log (Input)
91_Write_Master_Log (Output) → 95_Webhook_Response (Input)
```

**Node 00_Config bleibt unverbunden** (wird nur referenziert)

---

## 🧪 TESTING

### **Test 1: Minimaler Webhook**

```bash
curl -X POST https://deine-n8n.com/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Firmenname": "Minimal GmbH",
    "Email": "test@minimal.de"
  }'
```

**Erwartung:**
- ✅ Execution erfolgreich (grün)
- ✅ Lead_ID generiert
- ✅ Score berechnet (niedrig wegen fehlender Daten)
- ✅ Neue Zeile in Google Sheets

### **Test 2: Vollständiger Lead**

```bash
curl -X POST https://deine-n8n.com/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Firmenname": "Premium Energy GmbH",
    "Email": "ceo@premium-energy.de",
    "Phone": "+49 89 123456",
    "Website": "https://premium-energy.de",
    "Energieverbrauch_Jahr_kWh": 150000,
    "Energieerzeugung_PV_Jahr_kWh": 80000,
    "Speicherkapazitaet_kWh": 50,
    "Wechselrichterleistung_kW": 100,
    "Batterietyp": "LiFePO4",
    "Projektziel": "Autarkie maximieren",
    "Einsatzbereich": "Gewerbe",
    "Investitionsrahmen": ">200k",
    "Kommentar": "Dringend - Projektstart Q2"
  }'
```

**Erwartung:**
- ✅ Hoher Score (≥8.0 → HOT Lead)
- ✅ Qualified: true
- ✅ Vollständige Daten in Google Sheets

### **Test 3: Lead mit vorhandener ID**

```bash
curl -X POST https://deine-n8n.com/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Lead_ID": "LEAD_999999",
    "Firmenname": "Existing Customer GmbH",
    "Email": "contact@existing.de",
    "Energieverbrauch_Jahr_kWh": 75000
  }'
```

**Erwartung:**
- ✅ Lead_ID bleibt "LEAD_999999" (nicht überschrieben!)
- ✅ Console-Log: "✅ Lead_ID aus Webhook übernommen: LEAD_999999"

---

## 🔍 VALIDIERUNG

Nach Import und Konfiguration:

### **1. Execution Log prüfen**

Klicke auf eine Node → "Executions" Tab

**Grüne Häkchen** bei allen Nodes? → ✅ Erfolg!

**Rote X** irgendwo? → Fehler:
- Prüfe Console-Logs
- Validiere Google Sheets IDs in Node 00_Config
- Prüfe Credentials

### **2. Google Sheets prüfen**

Öffne dein Google Sheet → Tab "MASTER_LOG"

**Neue Zeile vorhanden?** → ✅ Erfolg!

**Keine Zeile?** → Prüfe:
- Permissions (Sheet ist freigegeben?)
- Credential (OAuth erfolgreich?)
- Spalten-Mapping (stimmen die Feldnamen?)

### **3. Console-Logs prüfen**

Jede Code-Node loggt Infos:

**Node 20 (Validate):**
```
🔵 Webhook empfangen mit Feldern: ['Firmenname', 'Email', ...]
✅ 1 Webhook-Items validiert und klassifiziert
```

**Node 40 (Generate IDs):**
```
📊 Counter-Daten: { ID_Type: 'LEAD_ID', Last_Number: 'LEAD_250001' }
🆕 Neue Lead_ID generiert: LEAD_250002 (Vorgänger: 250001)
📄 Offer-ID generiert: OFFER_25_0124
```

**Node 50 (Scoring):**
```
🎯 Scoring für Lead: LEAD_250002
📊 Lead LEAD_250002: Score 6.5/10 → WARM (Qualified: true)
```

---

## 🚨 HÄUFIGE FEHLER & LÖSUNGEN

### **Fehler: "Execution failed on node '30_Read_Counter'"**

**Ursache:** Keine Verbindung zu Google Sheets

**Lösung:**
1. Node 30 öffnen
2. Credential prüfen → "Test Credential"
3. Falls Fehler → Neue Credential erstellen (OAuth neu durchlaufen)

---

### **Fehler: "Cannot read property 'spreadsheet_id' of undefined"**

**Ursache:** Node 00_Config wurde nicht ausgeführt

**Lösung:**
1. Node 00_Config manuell ausführen (Klick auf "Execute Node")
2. Prüfe, ob Output vorhanden ist
3. Falls nein → Code-Fehler prüfen

---

### **Fehler: "Lead_ID wird immer neu generiert"**

**Ursache:** Webhook sendet Lead_ID nicht im richtigen Format

**Lösung:**
- Webhook muss Feld enthalten: `"Lead_ID"` oder `"Lead-ID"`
- Prüfe Node 20 Console-Log: Wird Lead_ID erkannt?

---

### **Fehler: "Sheet MASTER_LOG not found"**

**Ursache:** Tab-Name in Google Sheets stimmt nicht überein

**Lösung:**
1. Öffne Google Sheets
2. Prüfe exakte Schreibweise des Tabs: "MASTER_LOG" (Groß-/Kleinschreibung!)
3. Oder: Passe Tab-Name in Node 00_Config an (Zeile 130)

---

## 📚 NÄCHSTE SCHRITTE

Nach erfolgreichem Import:

1. **Erweitere den Workflow:**
   - Füge Nodes 60 (Datenanreicherung) hinzu
   - Füge Node 80 (AI-Dossier) hinzu
   - Füge weitere Google Sheets Nodes hinzu (Contacts, Counter Update)

2. **Passe an deine Branche an:**
   - Siehe `TEMPLATE_COMPLETE_WORKFLOW.md`
   - Abschnitt "Konfiguration für neue Branchen"

3. **Teste produktiv:**
   - Verbinde mit echtem Webformular
   - Integriere mit CRM
   - Setze Error-Notifications auf

---

## 🎉 FERTIG!

Dein Basis-Workflow läuft!

**Dokumentation:**
- `SCHNELLSTART.md` - Komplettes Setup (Google Sheets, etc.)
- `TEMPLATE_COMPLETE_WORKFLOW.md` - Alle Nodes im Detail
- `NODE_CONNECTIONS.md` - Workflow-Struktur

**Code:**
- `nodes/` - Alle Node-Codes einzeln (zum Copy-Paste)

---

**Template-Version:** 1.0.0
**Erstellt:** 2025-01-21
