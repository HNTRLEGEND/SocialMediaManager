# WiesLogic Agent System - Workflow Templates

## Übersicht

Dieser Ordner enthält alle n8n Workflow-Templates für das WiesLogic Agent System mit AETNA Group Multi-Brand Support.

## 🎯 Verfügbare Workflows

### Core Sales Agents
1. **AI_WIESLOGIC_MASTER** - Zentraler Orchestrator mit Brand-Routing
2. **AI_LEAD_AGENT** - Lead Qualifikation (BANT Scoring)
3. **AI_TECHNICAL_AGENT** - Technische Analyse & Produktempfehlung
4. **AI_SALES_AGENT** - Angebotserstellung & Pricing
5. **AI_SERVICE_AGENT** - After-Sales Service & Support

### Marketing & Content Agents
6. **AI_LEAD_GENERATOR** - Automatische Lead-Generierung
7. **AI_CONTENT_AGENT** - Content-Erstellung (Blogs, Case Studies)
8. **AI_MARKETING_AGENT** - Kampagnen-Management & Nurturing

### Support Agent
9. **AI_PERSONAL_ASSISTANT** - Email, Kalender, Tasks Management

## 🏢 AETNA Group Brands

Alle Workflows unterstützen die 5 AETNA Marken:

- **ROBOPAC** - Pallet Wrapping
- **OCME** - End-of-Line Solutions
- **PRASMATIC** - Flexible Packaging / Liquid Filling  
- **SOTEMAPACK** - Traysealing / Thermoforming
- **MEYPACK** - Case Erecting / Cartonizing

## 📊 Google Sheets Integration

Alle Workflows nutzen diese Sheets aus dem Main-Dokument:

### Lead Management
- `01_📋_Inquiries_Log` - Alle eingehenden Anfragen
- `19_🔍_Lead_Intelligence_Log` - Angereicherte Lead-Daten

### Products & Technical
- `06_📦_Product_Portfolio` - Produktkatalog aller 5 Marken
- `07_⚙️_Mechanical_Specs` - Mechanische Spezifikationen
- `08_🔌_Electrical_Specs` - Elektrische Spezifikationen
- `09_🎞️_Packaging_Process_Specs` - Verpackungsprozess-Daten

### Sales & Quotations
- `02_💰_Quotation_Options` - Angebotsvarianten
- `03_🔍_Customer_Profile` - Kundenstammdaten

### Service & Reports
- `04_📑_Reports` - Generierte Dokumente
- `05_📑_Service_Log` - Service-Aktivitäten

### Marketing & Performance
- `10_📑Marketing_Activity_Log` - Marketing-Kampagnen
- `11_📑Financial_Log` - Finanz-KPIs
- `12_📈_Chart_Data` - Dashboard-Daten

### System & Monitoring
- `13_📑_Master_Log` - Alle Workflow-Ausführungen
- `14_🔍_Performance_Log` - Performance-Metriken
- `15_🔍_System_Health_Log` - System-Gesundheit
- `16_Evaluation_Log` - AI-Evaluierungen

### Configuration
- `17_🔍_Client_Config` - Kundenkonfigurationen
- `18_🔍_Lookups` - Dropdown-Werte

## 🔄 Workflow-Ablauf

```
Inquiry → MASTER → Lead Agent → Technical Agent → Sales Agent → Service Agent
                      ↓              ↓                ↓
                Lead Gen      Content Agent    Marketing Agent
```

## 🚀 Deployment

### 1. Import Workflows
Jedes Template als separate Workflow in n8n importieren.

### 2. Konfiguriere Environment Variables
```env
GOOGLE_SHEET_ID=your_main_sheet_id
N8N_BASE_URL=https://n8n.yourdomain.com
WEBHOOK_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
HUNTER_API_KEY=your_hunter_key
```

### 3. Aktiviere Workflows
Alle Workflows aktivieren und testen.

## 📖 Template-Nutzung

Jedes Template enthält:
- Komplette Node-Struktur
- JavaScript/Python Code-Beispiele
- Google Sheets Integration
- OpenAI API Calls
- Error Handling
- Logging

## 🔧 Anpassungen

Templates sind konfigurierbar für:
- Marken-spezifische Logik
- Kunden-spezifische Workflows
- Custom Business Rules
- Multi-Language Support

## 📝 Nächste Schritte

1. ✅ Review der Templates
2. ✅ Import in n8n
3. ✅ Konfiguration der Credentials
4. ✅ Testing mit Test-Daten
5. ✅ Produktiv-Deployment

---

**Version:** 2025.10.2  
**Status:** Ready for Deployment  
**Support:** WiesLogic Team
