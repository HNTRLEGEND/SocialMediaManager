# 🔗 NODE-VERBINDUNGEN & WORKFLOW-STRUKTUR

## 📊 KOMPLETTER WORKFLOW (Alle Nodes)

```
┌────────────────────────────────────────────────────────────────────┐
│                    LEAD-MANAGER WORKFLOW                           │
│                   Universal Template v1.0                          │
└────────────────────────────────────────────────────────────────────┘

[00_Config]                    Zentrale Konfiguration
     │
     │ (wird von allen Nodes referenziert)
     │
     ↓
[10_Webhook_Trigger]           Empfängt Lead-Daten (POST)
     │
     │ json: { Firmenname, Email, ... }
     │
     ↓
[20_Validate_Classify]         Datenvalidierung & Bereinigung
     │
     │ json: { ...validierte Daten, Datenqualitaet, Email_Gueltig }
     │
     ↓
[30_Read_Counter]              Liest ID-Zähler (Google Sheets)
     │
     │ json: { ID_Type: "LEAD_ID", Last_Number: "LEAD_250001" }
     │
     ↓
[40_Generate_IDs]              Lead_ID & Offer_ID vergeben
     │
     │ json: { Lead_ID, Offer_ID, Tracking_ID, ...alle Daten }
     │
     ↓
[50_Lead_Scoring]              Bewertung & Qualifikation
     │
     │ json: { Lead_Score: 7.5, Lead_Category: "WARM", Qualified: true }
     │
     ↓
     ├─────────────────────── Data Enrichment ───────────────────────┐
     │                                                                │
     ├─→ [61_Search_Website]    Findet Firmen-Website               │
     │       │                                                        │
     │       ↓                                                        │
     ├─→ [62_Scrape_Website]    Extrahiert Website-Inhalte          │
     │       │                                                        │
     │       ↓                                                        │
     ├─→ [63_Hunter_Email]      Findet Geschäfts-Emails             │
     │       │                                                        │
     │       ↓                                                        │
     ├─→ [64_LinkedIn_Search]   Firmen-LinkedIn-Profil              │
     │       │                                                        │
     └───────┴────────────────────────────────────────────────────────┘
                │
                │ json: { ...alle Daten + website_data, hunter_data, linkedin_data }
                │
                ↓
[70_Generate_Profile]          Erstellt Kundenprofil (1 Item!)
     │
     │ json: {
     │   Lead_ID,
     │   customer_profile: {
     │     contact_info, company_details, project_data,
     │     contacts_found: [...]  ← Sekundärkontakte!
     │   }
     │ }
     │
     ↓
[80_AI_Dossier_Generator]      AI erstellt umfassendes Dossier
     │                           (OpenAI Agent mit Tools)
     │
     │ Tools:
     │  - Create Google Doc
     │  - Update Google Doc
     │  - Think Tool
     │
     │ json: { ...alle Daten + Dossier_URL, Dossier_ID }
     │
     ↓
     ├─────────────────────── Google Sheets Logging ────────────────┐
     │                                                                │
     ├─→ [91_Write_Master_Log]  Alle Lead-Daten → MASTER_LOG        │
     │                                                                │
     ├─→ [92_Write_Contacts]    Primär + Sekundär → CONTACTS        │
     │                                                                │
     ├─→ [93_Write_Docs]        Dossier-Link → DOCUMENT_LIBRARY     │
     │                                                                │
     └─→ [94_Update_Counter]    Erhöht Lead-Counter                 │
                │                                                     │
                └─────────────────────────────────────────────────────┘
                │
                ↓
[95_Webhook_Response]          Sendet Tracking-Info zurück
     │
     │ Response: {
     │   status: "success",
     │   Lead_ID, Tracking_ID, Qualified, Lead_Score, Dossier_URL
     │ }
     │
     └─→ [Webhook-Caller]
```

---

## 🔧 NODE-DETAILS & VERBINDUNGEN

### 00_Config (Code Node)

**Typ:** Code (JavaScript)
**Input:** Keine
**Output:** Konfigurationsobjekt

**Verbindungen:**
- Wird von allen anderen Nodes via `$('00_Config').first().json` referenziert
- Keine direkte Verbindung im Workflow

**Code-Datei:** `nodes/00_Config.js`

---

### 10_Webhook_Trigger (Webhook Node)

**Typ:** Webhook
**HTTP-Methode:** POST
**Pfad:** `lead-intake` (anpassbar)

**Input:** HTTP POST Request
**Output:** JSON Body

**Verbindungen:**
- Output → `20_Validate_Classify`

**Beispiel-Input:**
```json
{
  "Firmenname": "Test GmbH",
  "Email": "test@test.de",
  "Energieverbrauch_Jahr_kWh": 50000
}
```

---

### 20_Validate_Classify (Code Node)

**Typ:** Code (JavaScript)
**Input:** Webhook-Daten (Node 10)
**Output:** Validierte & bereinigte Daten

**Verbindungen:**
- Input: `10_Webhook_Trigger`
- Output: `30_Read_Counter`
- Referenziert: `00_Config` (für DEFAULTS, PFLICHTFELDER)

**Funktionen:**
- Email-Validierung
- Datentyp-Konvertierung
- Default-Werte setzen
- Datenqualitäts-Berechnung

**Code-Datei:** `nodes/20_Validate_Classify.js`

---

### 30_Read_Counter (Google Sheets Node)

**Typ:** Google Sheets
**Operation:** Read
**Sheet:** COUNTER

**Input:** Validierte Daten (Node 20)
**Output:** Counter-Werte

**Verbindungen:**
- Input: `20_Validate_Classify`
- Output: `40_Generate_IDs`
- Referenziert: `00_Config` (für spreadsheet_id)

**Erwartete Sheet-Struktur:**
| ID_Type | Last_Number | Next |
|---------|-------------|------|
| LEAD_ID | LEAD_250001 | 250002 |

---

### 40_Generate_IDs (Code Node)

**Typ:** Code (JavaScript)
**Input:** Counter + Webhook-Daten
**Output:** Daten + IDs

**Verbindungen:**
- Input 1: `30_Read_Counter` (Counter-Daten)
- Input 2: `20_Validate_Classify` (via `$('20_...')`)
- Output: `50_Lead_Scoring`

**Funktionen:**
- Webhook Lead_ID übernehmen (falls vorhanden)
- Neue Lead_ID generieren (falls nicht vorhanden)
- Offer_ID generieren
- Tracking_ID erstellen

**Kritisch:**
- NIEMALS Webhook Lead_ID überschreiben!
- Validierung: Format LEAD_XXXXXX

**Code-Datei:** `nodes/40_Generate_IDs.js`

---

### 50_Lead_Scoring (Code Node)

**Typ:** Code (JavaScript)
**Input:** Daten mit IDs (Node 40)
**Output:** Daten + Score + Category + Qualified

**Verbindungen:**
- Input: `40_Generate_IDs`
- Output: `60_Data_Enrichment` (mehrere Nodes)
- Referenziert: `00_Config` (für SCORING_GEWICHTUNG)

**Funktionen:**
- Berechnet Lead_Score (0-10)
- Weist Lead_Category zu (HOT/WARM/COLD/NURTURE)
- Entscheidet Qualified (true/false)
- Erstellt Score_Breakdown

**Code-Datei:** `nodes/50_Lead_Scoring.js`

---

### 60_Data_Enrichment (Mehrere Nodes)

Diese "Node" ist eigentlich eine Gruppe von 4 Nodes:

#### 61_Search_Website (Code Node)
**Funktion:** Findet Firmen-Website via Google/DuckDuckGo
**Input:** Daten mit Score
**Output:** `{ website_url, domain }`

#### 62_Scrape_Website (Code Node)
**Funktion:** Extrahiert Inhalte von gefundener Website
**Input:** Daten + website_url
**Output:** `{ website_data: { content, emails, phones } }`

#### 63_Hunter_Email (Hunter.io Node)
**Funktion:** Findet Geschäfts-Emails via Hunter.io API
**Input:** Domain
**Output:** Mehrere Items (1 pro Email)

#### 63a_Hunter_Wrapper (Code Node) **NEU/WICHTIG!**
**Funktion:** Aggregiert Hunter-Items zu 1 Item
**Input:** Mehrere Hunter-Items
**Output:** 1 Item mit `hunter_data: { emails: [...] }`

#### 64_LinkedIn_Search (Code Node)
**Funktion:** Findet LinkedIn-Firmenprofil
**Input:** Firmenname
**Output:** `{ linkedin_data: { industry, employee_count, linkedin_url } }`

**Verbindungen:**
```
50_Lead_Scoring
    │
    ├─→ 61_Search_Website
    │       ↓
    ├─→ 62_Scrape_Website
    │       ↓
    ├─→ 63_Hunter_Email
    │       ↓
    ├─→ 63a_Hunter_Wrapper  ← WICHTIG!
    │       ↓
    └─→ 64_LinkedIn_Search
            ↓
        70_Generate_Profile
```

---

### 70_Generate_Profile (Code Node)

**Typ:** Code (JavaScript)
**Input:** Alle Enrichment-Daten
**Output:** **1 Item** mit Kundenprofil

**Verbindungen:**
- Input: `64_LinkedIn_Search` (Ende der Enrichment-Kette)
- Output: `80_AI_Dossier_Generator`

**Kritisch:**
- Gibt IMMER nur 1 Item zurück!
- Aggregiert alle Datenquellen
- Sekundärkontakte in Array `contacts_found[]`

**Funktionen:**
- Primärkontakt aus Webhook
- Sekundärkontakte aus Hunter, LinkedIn, Website
- Datenqualitäts-Score
- Vollständiges Profil

**Code-Datei:** `nodes/70_Generate_Profile.js`

---

### 80_AI_Dossier_Generator (AI Agent Node)

**Typ:** AI Agent (OpenAI)
**Model:** GPT-4o-mini
**Input:** Kundenprofil (Node 70)
**Output:** Daten + Dossier_URL

**Verbindungen:**
- Input: `70_Generate_Profile`
- Output: `90_Google_Sheets_Logging` (mehrere Nodes)
- Referenziert: `00_Config` (für GOOGLE_DOCS)

**Tools:**
- Create Google Doc
- Update Google Doc
- Think Tool

**Funktion:**
Erstellt umfassendes Dossier mit:
- Lead-Übersicht
- Kontaktinformationen
- Unternehmensprofil
- Projekt-/Branchendaten
- Scoring-Details
- Research-Ergebnisse
- Gefundene Kontakte
- Empfehlungen & Next Steps
- Flags & Notizen

---

### 90_Google_Sheets_Logging (4 Nodes)

Diese "Node" ist eigentlich eine Gruppe von 4 Google Sheets Nodes:

#### 91_Write_Master_Log (Google Sheets Node)
**Operation:** Append
**Sheet:** MASTER_LOG
**Input:** Alle Lead-Daten
**Spalten:** 40+ Felder (alle Lead-Infos)

#### 92_Write_Contacts (Google Sheets Node)
**Operation:** Append
**Sheet:** CONTACTS
**Input:** Primär + Sekundärkontakte
**Spalten:** Lead-ID, Contact-ID, Name, Email, Phone, Role, Source

**Logik:**
```javascript
// Schreibe Primärkontakt
{ Lead-ID, Contact-ID: "LEAD_X_C1", Name, Email, ... }

// Schreibe jeden Sekundärkontakt
contacts_found.forEach((contact, idx) => {
  { Lead-ID, Contact-ID: "LEAD_X_SEC1", Name, Email, Source: "Hunter.io" }
});
```

#### 93_Write_Document_Library (Google Sheets Node)
**Operation:** Append
**Sheet:** DOCUMENT_LIBRARY
**Input:** Dossier-Link
**Spalten:** Lead-ID, Dossier_Link, Last_Updated

#### 94_Update_Counter (Google Sheets Node)
**Operation:** Update
**Sheet:** COUNTER
**Input:** Neue Counter-Werte
**Aktion:** Erhöht Lead_ID und Offer_ID Counter

**Verbindungen:**
```
80_AI_Dossier_Generator
    │
    ├─→ 91_Write_Master_Log
    │
    ├─→ 92_Write_Contacts
    │
    ├─→ 93_Write_Document_Library
    │
    └─→ 94_Update_Counter
            ↓
        95_Webhook_Response
```

---

### 95_Webhook_Response (Webhook Response Node)

**Typ:** Webhook Response
**Input:** Alle Daten + Dossier_URL
**Output:** HTTP 200 OK Response

**Verbindungen:**
- Input: `94_Update_Counter` (Ende der Logging-Kette)
- Output: Zurück an Webhook-Caller

**Response-Format:**
```json
{
  "status": "success",
  "message": "Lead erfolgreich verarbeitet",
  "Lead_ID": "LEAD_250002",
  "Tracking_ID": "TRACK_20250121_001",
  "Qualified": true,
  "Lead_Score": 7.5,
  "Lead_Category": "WARM",
  "Dossier_URL": "https://docs.google.com/document/d/..."
}
```

---

## 🔀 DATENFLUSS

### Beispiel-Execution:

```
1. Webhook empfängt:
   { Firmenname: "Test GmbH", Email: "test@test.de", Energieverbrauch_Jahr_kWh: 50000 }

2. Validate (Node 20):
   { ...validiert, Datenqualitaet: 75%, Email_Gueltig: true }

3. Read Counter (Node 30):
   { Last_Number: "LEAD_250001" }

4. Generate IDs (Node 40):
   { Lead_ID: "LEAD_250002", Offer_ID: "OFFER_25_0124" }

5. Scoring (Node 50):
   { Lead_Score: 6.5, Lead_Category: "WARM", Qualified: true }

6. Enrichment (Nodes 61-64):
   { website_data: {...}, hunter_data: {emails: [3 Kontakte]}, linkedin_data: {...} }

7. Generate Profile (Node 70):
   {
     Lead_ID: "LEAD_250002",
     customer_profile: {
       contact_info: {...},
       contacts_found: [
         { contact_id: "LEAD_250002_SEC1", source: "Hunter.io", ... },
         { contact_id: "LEAD_250002_SEC2", source: "Hunter.io", ... },
         { contact_id: "LEAD_250002_SEC3", source: "Hunter.io", ... }
       ]
     }
   }

8. AI Dossier (Node 80):
   { ...alle Daten, Dossier_URL: "https://docs.google.com/..." }

9. Google Sheets (Nodes 91-94):
   - MASTER_LOG: 1 neue Zeile
   - CONTACTS: 4 neue Zeilen (1 Primär + 3 Sekundär)
   - DOCUMENT_LIBRARY: 1 neue Zeile
   - COUNTER: Lead_ID → 250003

10. Response (Node 95):
    { status: "success", Lead_ID: "LEAD_250002", ... }
```

---

## ⚠️ KRITISCHE PUNKTE

### 1. Lead_ID-Konsistenz

**Node 40_Generate_IDs:**
```javascript
// RICHTIG:
let leadId = webhookData.Lead_ID || generateNewId();

// FALSCH:
let leadId = generateNewId(); // Überschreibt Webhook-ID!
```

### 2. Single-Row Output

**Node 70_Generate_Profile:**
```javascript
// RICHTIG:
return [{ json: customerProfile }]; // Immer 1 Item!

// FALSCH:
return items.map(...); // Kann mehrere Items sein!
```

### 3. Hunter-Aggregation

**Node 63a_Hunter_Wrapper:**
```javascript
// Aggregiere alle Hunter-Items zu 1 Item
const allEmails = [];
for (const item of items) {
  allEmails.push(item.json.email);
}
return [{ json: { hunter_data: { emails: allEmails } } }];
```

---

## 🧪 TESTING-CHECKPOINTS

Nach Setup testen:

1. **Node 40:** Console-Log prüfen
   ```
   ✅ Lead_ID aus Webhook übernommen: LEAD_999
   oder
   🆕 Neue Lead_ID generiert: LEAD_250002
   ```

2. **Node 70:** Item-Count = 1
   ```
   ✅ Kundenprofil erstellt für LEAD_250002 mit 3 Sekundärkontakten
   ```

3. **Google Sheets MASTER_LOG:** Nur 1 neue Zeile pro Lead

4. **Google Sheets CONTACTS:** Mehrere Zeilen möglich (1 Primär + n Sekundär)

---

## 📊 PERFORMANCE

### Durchschnittliche Execution-Zeit:

- **Minimal** (ohne Enrichment): ~5 Sekunden
- **Standard** (mit Website + Hunter): ~15 Sekunden
- **Vollständig** (+ LinkedIn + AI): ~30 Sekunden

### Bottlenecks:

1. Website-Scraping (10-15s)
2. Hunter.io API (5-10s)
3. AI-Dossier-Generierung (10-15s)

### Optimierungen:

- Parallel-Execution für Enrichment-Nodes
- Caching für Website-Daten
- Async-Logging (fire-and-forget)

---

**Template-Version:** 1.0.0
**Letzte Aktualisierung:** 2025-01-21
