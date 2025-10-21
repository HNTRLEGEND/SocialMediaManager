# 🚀 LEAD-MANAGER WORKFLOW - SCHNELLSTART

## ⏱️ IN 15 MINUTEN EINSATZBEREIT!

Diese Anleitung bringt dich vom Download zum funktionierenden Lead-Manager.

---

## 📋 VORAUSSETZUNGEN

✅ n8n installiert (self-hosted oder Cloud)
✅ Google Account (für Sheets & Docs)
✅ OpenAI API Key (optional, für AI-Dossier)

---

## 🎯 SCHRITT 1: GOOGLE SHEETS VORBEREITEN (5 Minuten)

### 1.1 Neues Spreadsheet erstellen

1. Öffne [Google Sheets](https://sheets.google.com)
2. Erstelle neues Spreadsheet: "LEAD MANAGER LOG"
3. Kopiere die Spreadsheet-ID aus der URL:
   ```
   https://docs.google.com/spreadsheets/d/DIESE_ID_KOPIEREN/edit
   ```

### 1.2 Tabs erstellen

Erstelle 4 Tabs mit folgenden Namen:

#### Tab 1: **MASTER_LOG**
Kopiere folgende Spalten in Zeile 1:

```
Lead-ID | Offer-ID | Timestamp_Created | Customer_Type | Firmenname | Email_Primary |
Phone_Primary | Website | Energieverbrauch_Jahr_kWh | Speicherkapazitaet_kWh |
Wechselrichterleistung_kW | Batterietyp | Projektziel | Lead_Score | Lead_Category |
Qualified | Next_Action | Dossier-ID
```

#### Tab 2: **CONTACTS**
```
Lead-ID | Contact-ID | Contact_Name | Contact_Email | Contact_Phone | Contact_Role | Source
```

#### Tab 3: **COUNTER**
```
ID_Type | Last_Number | Next
```

Füge 2 Zeilen ein:
| ID_Type | Last_Number | Next |
|---------|-------------|------|
| LEAD_ID | LEAD_000000 | 1 |
| OFFER_ID | OFFER_25_0000 | 1 |

#### Tab 4: **DOCUMENT_LIBRARY**
```
Lead-ID | Dossier_Link | Last_Updated
```

---

## 🎯 SCHRITT 2: GOOGLE DRIVE ORDNER ERSTELLEN (2 Minuten)

1. Öffne [Google Drive](https://drive.google.com)
2. Erstelle Ordner: "Lead-Dossiers"
3. Rechtsklick → "Freigeben" → "Link kopieren"
4. Extrahiere Folder-ID aus URL:
   ```
   https://drive.google.com/drive/folders/DIESE_ID_KOPIEREN
   ```

---

## 🎯 SCHRITT 3: N8N WORKFLOW IMPORTIEREN (3 Minuten)

### 3.1 Workflow erstellen

1. Öffne n8n
2. Klicke auf "+ New Workflow"
3. Name: "LEAD MANAGER - Template"

### 3.2 Nodes hinzufügen

Füge folgende Nodes hinzu (in dieser Reihenfolge):

| Nr | Node-Typ | Name |
|----|----------|------|
| 00 | Code | 00_Config |
| 10 | Webhook | 10_Webhook_Trigger |
| 20 | Code | 20_Validate_Classify |
| 30 | Google Sheets | 30_Read_Counter |
| 40 | Code | 40_Generate_IDs |
| 50 | Code | 50_Lead_Scoring |
| 70 | Code | 70_Generate_Profile |
| 91 | Google Sheets | 91_Write_Master_Log |

### 3.3 Code einfügen

Für jeden Code-Node:
1. Öffne die entsprechende Datei aus `/nodes/`
2. Kopiere den kompletten Code
3. Füge ihn in den n8n Code-Editor ein
4. Speichern

---

## 🎯 SCHRITT 4: KONFIGURATION ANPASSEN (5 Minuten)

### 4.1 Node 00_Config öffnen

Passe folgende Werte an:

```javascript
// Zeile 20-30: Deine Firma
const UNTERNEHMEN = {
  name: "DEIN FIRMENNAME",
  branche: "DEINE BRANCHE",
  kontakt_email: "sales@deine-firma.de"
};

// Zeile 130-140: Google Sheets ID
const GOOGLE_SHEETS = {
  spreadsheet_id: "DEINE_SPREADSHEET_ID_AUS_SCHRITT_1"
};

// Zeile 150: Google Drive Ordner-ID
const GOOGLE_DOCS = {
  dossier_folder_id: "DEINE_FOLDER_ID_AUS_SCHRITT_2"
};
```

**Speichern!**

### 4.2 Google Sheets Credentials

Für Nodes 30 und 91:
1. Klicke auf Node
2. "Credential to connect with" → "+ Create New"
3. Wähle "Google Sheets OAuth2"
4. Folge dem OAuth-Flow
5. Speichern

---

## 🎯 SCHRITT 5: TESTEN!

### 5.1 Workflow aktivieren

1. Klicke oben rechts auf "Inactive" → wird zu "Active"
2. Kopiere Webhook-URL vom Node "10_Webhook_Trigger"

### 5.2 Test-Webhook senden

```bash
curl -X POST https://DEINE_N8N_URL/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Firmenname": "Test GmbH",
    "Email": "test@test.de",
    "Phone": "+49 123 456789",
    "Energieverbrauch_Jahr_kWh": 50000,
    "Projektziel": "Batteriespeicher"
  }'
```

### 5.3 Erfolg prüfen

✅ n8n Execution Log: Grün?
✅ Google Sheets MASTER_LOG: Neue Zeile?
✅ Google Sheets COUNTER: Erhöht?
✅ Console-Logs: Keine Fehler?

---

## 🎉 FERTIG!

Dein Lead-Manager läuft!

### Nächste Schritte:

1. **Branche anpassen** → `TEMPLATE_COMPLETE_WORKFLOW.md` lesen
2. **Scoring konfigurieren** → Node 00_Config anpassen
3. **Erweiterte Features** → Nodes 60 (Scraping), 80 (AI) hinzufügen

---

## 🔧 ANPASSUNG FÜR ANDERE BRANCHEN

### Beispiel: Software-Branche

#### 1. Node 00_Config anpassen

```javascript
// Zeile 35-80
BRANCHENFELDER.software = {
  "Nutzeranzahl": {
    typ: "number",
    pflicht: true,
    beschreibung: "Aktive Nutzer"
  },
  "Lizenzmodell": {
    typ: "string",
    optionen: ["Free", "Pro", "Enterprise"]
  },
  "Tech_Stack": {
    typ: "string"
  }
};
```

#### 2. Node 20_Validate_Classify anpassen

```javascript
// Zeile 142: Branchenfelder extrahieren
const nutzeranzahl = safeNumber(
  safeExtract(input, ['Nutzeranzahl', 'users']),
  0
);
const lizenzmodell = safeExtract(input, ['Lizenzmodell'], 'Free');

// Zeile 295: Output
return {
  json: {
    ...input,
    Nutzeranzahl: nutzeranzahl,
    Lizenzmodell: lizenzmodell
  }
};
```

#### 3. Node 50_Lead_Scoring anpassen

```javascript
// Zeile 40: Scoring-Kriterium
const nutzeranzahl = parseInt(input.Nutzeranzahl) || 0;

if (nutzeranzahl > 1000) {
  score += 30;
} else if (nutzeranzahl > 500) {
  score += 20;
}
```

#### 4. Test-Webhook

```bash
curl -X POST https://DEINE_N8N_URL/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "Firmenname": "Software Startup GmbH",
    "Email": "ceo@startup.de",
    "Nutzeranzahl": 750,
    "Lizenzmodell": "Pro",
    "Tech_Stack": "React, Node.js"
  }'
```

---

## 📚 WEITERFÜHRENDE DOKUMENTATION

| Dokument | Beschreibung |
|----------|--------------|
| `TEMPLATE_COMPLETE_WORKFLOW.md` | Vollständige Node-Dokumentation |
| `nodes/00_Config.js` | Zentrale Konfiguration (ausführlich kommentiert) |
| `nodes/20_Validate_Classify.js` | Datenvalidierung (Beispiele) |
| `nodes/50_Lead_Scoring.js` | Scoring-Logik (anpassbar) |
| `nodes/70_Generate_Profile.js` | Profil-Erstellung |

---

## 🆘 HÄUFIGE PROBLEME

### Problem: "Workflow execution failed"
**Lösung:**
1. Prüfe Execution Log in n8n
2. Validiere Google Sheets IDs in Node 00_Config
3. Prüfe Credentials (Google OAuth)

### Problem: "Lead_ID wird immer neu generiert"
**Lösung:**
- Webhook muss Feld "Lead_ID" oder "Lead-ID" enthalten
- Prüfe Node 40 Console-Log: "Lead_ID aus Webhook übernommen"

### Problem: "Mehrere Rows in Google Sheets"
**Lösung:**
- Node 70 muss exakt 1 Item zurückgeben
- Prüfe Console-Log: "Kundenprofil erstellt für..."
- Falls Hunter mehrere Items liefert: Node 62a_Hunter_Wrapper fehlt

### Problem: "undefined in Feldern"
**Lösung:**
- Alle Felder müssen Defaults haben
- Prüfe Node 20: safeExtract() Funktionen
- Prüfe Node 00_Config: DEFAULTS

---

## ✅ CHECKLISTE

Nach Setup:
- [ ] Google Sheets erstellt (4 Tabs)
- [ ] COUNTER-Tab befüllt (2 Zeilen)
- [ ] Google Drive Ordner erstellt
- [ ] n8n Workflow importiert
- [ ] Node 00_Config angepasst (IDs eingetragen)
- [ ] Google Credentials verbunden
- [ ] Workflow aktiviert
- [ ] Test-Webhook erfolgreich
- [ ] Daten in Google Sheets sichtbar
- [ ] Counter erhöht

---

## 🎯 SUPPORT

Bei Fragen:
1. Prüfe Console-Logs in n8n (jeder Node)
2. Validiere Konfiguration (Node 00_Config)
3. Teste mit minimalem Webhook (nur Email + Firmenname)
4. Prüfe Google Sheets Permissions

---

**Happy Lead Managing!** 🚀

*Template-Version: 1.0.0*
*Erstellt: 2025-01-21*
