# 🎯 LEAD-MANAGER WORKFLOW - VOLLSTÄNDIGE TEMPLATE-DOKUMENTATION

## 📋 ÜBERSICHT

Dieser n8n-Workflow ist ein **universal einsetzbares Template** für Lead-Management in verschiedenen Branchen.

**Hauptfunktionen:**
✅ Automatische Lead-Erfassung via Webhook
✅ Datenvalidierung & -qualität-Prüfung
✅ Intelligentes Lead-Scoring (konfigurierbar)
✅ Multi-Source-Datenanreicherung (Website, Hunter.io, LinkedIn)
✅ Automatische Dossier-Erstellung
✅ Vollständiges Google Sheets Logging
✅ Email & Telefon-Validierung
✅ Duplikats-Erkennung

---

## 🏗️ WORKFLOW-ARCHITEKTUR (10er-Schritte)

```
00_Config               → Zentrale Konfiguration (Template-Anpassungen)
   ↓
10_Webhook_Trigger      → Empfängt Lead-Daten
   ↓
20_Validate_Classify    → Validierung & Datenbereinigung
   ↓
30_Read_Counter         → Liest ID-Zähler (Google Sheets)
   ↓
40_Generate_IDs         → Erstellt/übernimmt Lead_ID & Offer_ID
   ↓
50_Lead_Scoring         → Bewertet Lead (0-10 Score)
   ↓
60_Data_Enrichment      → Multi-Source-Datenanreicherung
   ├── 61_Search_Website
   ├── 62_Scrape_Website
   ├── 63_Hunter_Email_Finder
   └── 64_LinkedIn_Company_Search
   ↓
70_Generate_Profile     → Erstellt Kundenprofil (single row!)
   ↓
80_AI_Dossier_Generator → AI erstellt umfassendes Dossier
   ↓
90_Google_Sheets_Logging
   ├── 91_Write_Master_Log
   ├── 92_Write_Contacts
   ├── 93_Write_Document_Library
   └── 94_Update_Counter
   ↓
95_Webhook_Response     → Sendet Tracking-Info zurück
```

---

## 📦 NODE-ÜBERSICHT MIT KONFIGURATION

### **00_Config** - Zentrale Konfiguration

**Typ:** Code (JavaScript)
**Datei:** `nodes/00_Config.js`

**ZWECK:** Template-Anpassungen für verschiedene Branchen

**Anpassungen:**
```javascript
// 1. Unternehmensdaten
UNTERNEHMEN.name = "Dein Firmenname GmbH";
UNTERNEHMEN.branche = "Deine Branche";

// 2. Branchenfelder definieren
BRANCHENFELDER.deine_felder = {
  "Hauptkennzahl": { typ: "number", pflicht: true },
  "Sekundärkennzahl": { typ: "string", pflicht: false }
};

// 3. Scoring-Gewichtung (muss 100 ergeben!)
SCORING_GEWICHTUNG = {
  hauptkriterium: { gewicht: 40 },
  nebenkriterium: { gewicht: 30 },
  datenqualitaet: { gewicht: 20 },
  dringlichkeit: { gewicht: 10 }
};

// 4. Google Sheets IDs
GOOGLE_SHEETS.spreadsheet_id = "DEINE_SHEET_ID";
```

---

### **10_Webhook_Trigger** - Lead-Eingang

**Typ:** Webhook
**Methode:** POST
**Pfad:** `lead-intake` (anpassbar)

**Webhook-URL:**
```
https://deine-n8n-instanz.com/webhook/lead-intake
```

**Erwartetes Format:**
```json
{
  "Lead_ID": "optional",
  "Firmenname": "string",
  "Email": "string",
  "Phone": "string",
  "Dein_Hauptfeld": "number/string"
}
```

**Test-Befehl:**
```bash
curl -X POST https://deine-n8n-instanz.com/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Firmenname": "Test GmbH",
    "Email": "test@test.de",
    "Dein_Hauptfeld": 12345
  }'
```

---

### **20_Validate_Classify** - Datenvalidierung

**Typ:** Code (JavaScript)
**Datei:** `nodes/20_Validate_Classify.js`

**Funktionen:**
- ✅ Webhook-Rohdaten extrahieren
- ✅ Lead_ID erkennen (falls vorhanden)
- ✅ Datentypen konvertieren
- ✅ Fehlende Werte mit Defaults befüllen
- ✅ Email-Validierung
- ✅ Datenqualität berechnen
- ✅ Dringlichkeit erkennen

**Anpassungen:**
```javascript
// Zeile 142-186: Branchenfelder extrahieren
const deinHauptfeld = safeNumber(
  safeExtract(input, ['Dein_Hauptfeld', 'hauptfeld']),
  0
);

// Zeile 295-324: Output anpassen
return {
  json: {
    ...input,
    Dein_Hauptfeld: deinHauptfeld,
    // weitere Felder...
  }
};
```

---

### **30_Read_Counter** - ID-Zähler lesen

**Typ:** Google Sheets
**Operation:** Read
**Sheet:** `{{ $('00_Config').first().json.GOOGLE_SHEETS.spreadsheet_id }}`
**Tab:** `COUNTER`

**Erwartete Struktur:**
| ID_Type | Last_Number | Next |
|---------|-------------|------|
| LEAD_ID | LEAD_250001 | 250002 |
| OFFER_ID | OFFER_25_0123 | 0124 |

---

### **40_Generate_IDs** - Lead-ID & Offer-ID

**Typ:** Code (JavaScript)
**Datei:** `nodes/40_Generate_IDs.js`

**Funktionen:**
- ✅ Webhook Lead_ID übernehmen (falls vorhanden)
- ✅ Neue Lead_ID generieren (falls nicht vorhanden)
- ✅ Offer-ID generieren
- ✅ Tracking-ID erstellen
- ✅ Dossier-ID vorbereiten

**Output:**
```json
{
  "Lead_ID": "LEAD_250002",
  "Offer_ID": "OFFER_25_0124",
  "Tracking_ID": "TRACK_20250121_001",
  "Lead_ID_Quelle": "generiert" // oder "webhook"
}
```

**Anpassung Präfix:**
```javascript
// Zeile 89: Ändere "LEAD_" zu deinem Kürzel
leadId = `DEIN_PREFIX_${String(newLeadNumber).padStart(6, '0')}`;
// Beispiel: SW_250002, IMMO_250002, MB_250002
```

---

### **50_Lead_Scoring** - Bewertung & Qualifikation

**Typ:** Code (JavaScript)
**Datei:** `nodes/50_Lead_Scoring.js`

**Scoring-Kriterien (anpassbar):**
1. **Hauptkriterium** (0-30 Punkte) - z.B. Energieverbrauch, Nutzeranzahl, Kaufpreis
2. **Projektvolumen** (0-25 Punkte) - Investitionsrahmen
3. **Datenvollständigkeit** (0-20 Punkte) - Ausgefüllte Felder
4. **Kontaktqualität** (0-15 Punkte) - Business-Email, Telefon
5. **Dringlichkeit** (0-10 Punkte) - Zeitliche Priorität

**Output:**
```json
{
  "Lead_Score": 7.5,
  "Lead_Category": "WARM",
  "Qualified": true,
  "Next_Action": "Kontaktaufnahme innerhalb 3 Werktagen"
}
```

**Schwellwerte (in Node 00_Config):**
- ≥ 8.0 → HOT
- ≥ 6.0 → WARM (qualifiziert)
- ≥ 4.0 → COLD
- < 4.0 → NURTURE

**Anpassung:**
```javascript
// Zeile 40-70: Ersetze Energieintensität durch dein Hauptkriterium
const deinHauptwert = parseFloat(input.Dein_Hauptfeld) || 0;

if (deinHauptwert > 10000) {
  energieScore = 30;
} else if (deinHauptwert > 5000) {
  energieScore = 20;
}
// etc.
```

---

### **60_Data_Enrichment** - Datenanreicherung

**Untergliederung:**
- **61_Search_Website** (Google/DuckDuckGo Suche)
- **62_Scrape_Website** (Website-Inhalte extrahieren)
- **63_Hunter_Email_Finder** (Kontakte finden)
- **64_LinkedIn_Company_Search** (Unternehmensprofil)

**Output:**
```json
{
  "website_data": {
    "url": "https://...",
    "content": "...",
    "emails": ["..."],
    "phones": ["..."]
  },
  "hunter_contacts": [
    { "email": "...", "name": "...", "position": "..." }
  ],
  "linkedin_data": {
    "industry": "...",
    "employee_count": "...",
    "linkedin_url": "..."
  }
}
```

---

### **70_Generate_Profile** - Kundenprofil erstellen

**Typ:** Code (JavaScript)
**Datei:** `nodes/70_Generate_Profile.js`

**KRITISCH:** Gibt IMMER nur 1 Item zurück!

**Funktionen:**
- ✅ Aggregiert alle Datenquellen (Webhook, Website, Hunter, LinkedIn)
- ✅ Primärkontakt aus Webhook
- ✅ Sekundärkontakte in `contacts_found[]` Array
- ✅ Datenqualitäts-Score
- ✅ Vollständiges Kundenprofil

**Output-Struktur:**
```json
{
  "Lead_ID": "LEAD_250002",
  "customer_profile": {
    "contact_info": { ... },
    "company_details": { ... },
    "project_data": { ... },
    "contacts_found": [
      {
        "contact_id": "LEAD_250002_SEC1",
        "source": "Hunter.io",
        "name": "...",
        "email": "...",
        "position": "..."
      }
    ],
    "metadata": {
      "total_contacts": 3,
      "data_completeness": 85
    }
  }
}
```

---

### **80_AI_Dossier_Generator** - Umfassendes Dossier

**Typ:** AI Agent (OpenAI/Anthropic)
**Tools:**
- Create Google Doc
- Update Google Doc
- Think Tool

**Dossier-Struktur:**
```markdown
# Lead-Dossier: LEAD_250002

## 📊 Lead-Übersicht
- Lead-ID: ...
- Score: 7.5/10 (WARM)
- Qualified: ✅ Ja

## 👤 Kontaktinformationen
- Name: ...
- Email: ...
- Telefon: ...

## 🏢 Unternehmensprofil
- Firma: ...
- Branche: ...
- Website: ...
- LinkedIn: ...

## ⚡ Projekt- & Branchendaten
- Hauptkennzahl: ...
- Projektziel: ...
- Budget: ...

## 🎯 Lead-Qualifikation
- Score Breakdown:
  * Hauptkriterium: 25/30 pts
  * Projektvolumen: 20/25 pts
  * Daten: 18/20 pts
  * Kontakt: 12/15 pts
  * Dringlichkeit: 10/10 pts

## 🔍 Research-Ergebnisse
- Website-Analyse: ...
- Gefundene Informationen: ...

## 📞 Gefundene Kontakte
1. Max Mustermann (CEO) - max@firma.de
2. Anna Schmidt (CFO) - anna@firma.de
[Quelle: Hunter.io]

## 💡 Empfehlungen & Next Steps
✅ Kontaktaufnahme innerhalb 3 Werktagen
✅ Individuelles Angebot erstellen
✅ Technical Deep-Dive anbieten

## 🚩 Flags & Notizen
🟢 Green Flags:
- Business Email
- Hoher Energieverbrauch
- Dringend

🔴 Red Flags:
- (keine)
```

---

### **90_Google_Sheets_Logging** - Vollständiges Logging

**Untergliederung:**

#### **91_Write_Master_Log**
**Typ:** Google Sheets - Append
**Sheet:** MASTER_LOG
**Spalten:** Alle Lead-Daten (40+ Felder)

#### **92_Write_Contacts**
**Typ:** Google Sheets - Append
**Sheet:** CONTACTS
**Spalten:**
- Lead-ID
- Contact-ID
- Contact_Name
- Contact_Email
- Contact_Phone
- Contact_Role
- Source

#### **93_Write_Document_Library**
**Typ:** Google Sheets - Append
**Sheet:** DOCUMENT_LIBRARY
**Spalten:**
- Lead-ID
- Dossier_Link
- Last_Updated

#### **94_Update_Counter**
**Typ:** Google Sheets - Update
**Sheet:** COUNTER
**Aktion:** Erhöhe Counter für nächsten Lead

---

### **95_Webhook_Response** - Tracking-Info zurück

**Typ:** Webhook Response
**Status:** 200 OK

**Response:**
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

## 🔧 KONFIGURATION FÜR NEUE BRANCHEN

### Schritt 1: Node 00_Config anpassen

```javascript
// 1. Unternehmensdaten
UNTERNEHMEN.name = "Meine Software GmbH";
UNTERNEHMEN.branche = "SaaS & Cloud-Lösungen";

// 2. Branchenfelder definieren
BRANCHENFELDER.software = {
  "Nutzeranzahl": {
    typ: "number",
    pflicht: true,
    beschreibung: "Aktuelle Nutzeranzahl"
  },
  "Lizenzmodell": {
    typ: "string",
    pflicht: false,
    optionen: ["Free", "Basic", "Pro", "Enterprise"]
  },
  "Tech_Stack": {
    typ: "string",
    pflicht: false
  }
};

// 3. Scoring anpassen
SCORING_GEWICHTUNG = {
  nutzeranzahl: { gewicht: 40 }, // Wichtigstes Kriterium
  lizenzmodell: { gewicht: 25 },
  datenvollstaendigkeit: { gewicht: 20 },
  kontaktqualitaet: { gewicht: 10 },
  dringlichkeit: { gewicht: 5 }
};
```

### Schritt 2: Node 20_Validate_Classify anpassen

```javascript
// Zeile 142: Extrahiere deine Branchenfelder
const nutzeranzahl = safeNumber(
  safeExtract(input, ['Nutzeranzahl', 'nutzer', 'users']),
  0
);

const lizenzmodell = safeExtract(input, ['Lizenzmodell', 'license'], 'Free');
const techStack = safeExtract(input, ['Tech_Stack', 'tech', 'stack']);

// Zeile 295: Füge zu Output hinzu
return {
  json: {
    ...input,
    Nutzeranzahl: nutzeranzahl,
    Lizenzmodell: lizenzmodell,
    Tech_Stack: techStack
  }
};
```

### Schritt 3: Node 50_Lead_Scoring anpassen

```javascript
// Zeile 40: Ersetze Energieintensität
const nutzeranzahl = parseInt(input.Nutzeranzahl) || 0;
let nutzerScore = 0;

if (nutzeranzahl > 1000) {
  nutzerScore = 30;
} else if (nutzeranzahl > 500) {
  nutzerScore = 20;
} else if (nutzeranzahl > 100) {
  nutzerScore = 15;
}
// etc.

score += nutzerScore;
```

### Schritt 4: Google Sheets vorbereiten

1. **Spreadsheet erstellen**
2. **Tabs anlegen:**
   - MASTER_LOG
   - CONTACTS
   - COUNTER
   - DOCUMENT_LIBRARY

3. **COUNTER-Tab befüllen:**
   | ID_Type | Last_Number | Next |
   |---------|-------------|------|
   | LEAD_ID | LEAD_000000 | 1 |
   | OFFER_ID | OFFER_25_0000 | 1 |

4. **IDs in Node 00_Config eintragen**

---

## 🧪 TESTING

### Test 1: Einfacher Lead
```bash
curl -X POST https://deine-n8n.com/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Firmenname": "Test GmbH",
    "Email": "test@test.de",
    "Nutzeranzahl": 500
  }'
```

**Erwartung:**
- ✅ Lead_ID generiert
- ✅ Score berechnet
- ✅ Dossier erstellt
- ✅ In Google Sheets geloggt

### Test 2: Lead mit vorhandener ID
```bash
curl -X POST https://deine-n8n.com/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Lead_ID": "LEAD_999999",
    "Firmenname": "Wichtiger Kunde GmbH",
    "Email": "ceo@wichtig.de",
    "Nutzeranzahl": 5000
  }'
```

**Erwartung:**
- ✅ Lead_ID "LEAD_999999" übernommen (nicht neu generiert!)
- ✅ Hoher Score (HOT Lead)

---

## 📊 DATENQUALITÄTS-CHECKS

Der Workflow führt automatisch folgende Checks durch:

1. ✅ **Email-Validierung** (Format, Business/Private)
2. ✅ **Telefon-Prüfung** (Mindestlänge)
3. ✅ **Pflichtfeld-Check** (definiert in Node 00_Config)
4. ✅ **Datentyp-Konvertierung** (String → Number)
5. ✅ **Duplikats-Warnung** (falls Lead_ID schon existiert)
6. ✅ **Vollständigkeits-Score** (0-100%)

---

## 🚨 FEHLERBEHANDLUNG

Alle Nodes enthalten:
- ✅ Try-Catch-Blöcke
- ✅ Validierungs-Checks
- ✅ Console-Logs für Debugging
- ✅ Fehler-Meldungen an Admin

**Fehler-Node konfigurieren:**
```
Settings → Error Workflow → Auswählen
```

---

## 📚 WEITERE DOKUMENTATION

- `nodes/00_Config.js` - Zentrale Konfiguration
- `nodes/20_Validate_Classify.js` - Datenvalidierung
- `nodes/40_Generate_IDs.js` - ID-Generierung
- `nodes/50_Lead_Scoring.js` - Scoring-Logik
- `nodes/70_Generate_Profile.js` - Profil-Erstellung

---

## 🎯 ERFOLGS-CHECKLISTE

Nach Setup:
- [ ] Node 00_Config angepasst
- [ ] Google Sheets erstellt & IDs eingetragen
- [ ] Google Docs Ordner erstellt
- [ ] Webhook-URL getestet
- [ ] Test-Lead erfolgreich verarbeitet
- [ ] Dossier in Google Docs erstellt
- [ ] Daten in Google Sheets geloggt
- [ ] Counter erhöht

---

## 🆘 SUPPORT

Bei Fragen:
1. Prüfe Console-Logs in n8n
2. Validiere Konfiguration in Node 00
3. Teste mit einfachem Webhook
4. Prüfe Google Sheets Permissions

---

**Template-Version:** 1.0.0
**Letzte Aktualisierung:** 2025-01-21
**Lizenz:** MIT
