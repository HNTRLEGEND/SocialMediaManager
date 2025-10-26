# 📘 WiesLogic Multi-Customer Agent System - Komplette Systemdokumentation

**Version:** 2025.10.2
**Für:** AETNA Group (ROBOPAC, OCME, PRASMATIC, SOTEMAPACK, MEYPACK)
**Status:** ✅ Production Ready

---

## 📑 Inhaltsverzeichnis

1. [System-Übersicht](#1-system-übersicht)
2. [Schnellstart-Anleitung](#2-schnellstart-anleitung)
3. [Die 8 Agents im Detail](#3-die-8-agents-im-detail)
4. [Customer Journey Flows](#4-customer-journey-flows)
5. [Technische Integration](#5-technische-integration)
6. [Google Sheets Setup](#6-google-sheets-setup)
7. [Deployment Guide](#7-deployment-guide)
8. [Betrieb & Monitoring](#8-betrieb--monitoring)
9. [Troubleshooting](#9-troubleshooting)
10. [FAQ](#10-faq)

---

## 1. System-Übersicht

### 🎯 Was ist das WiesLogic Agent System?

Das WiesLogic Agent System ist eine **KI-gesteuerte Multi-Customer-Plattform** für vollautomatisierte Sales-, Marketing- und Service-Prozesse im B2B-Packaging-Bereich.

**Kern-Features:**
- ✅ **8 spezialisierte AI-Agents** für den kompletten Customer Lifecycle
- ✅ **Multi-Brand Support** für alle 5 AETNA Group Marken
- ✅ **Multi-Tenant Architecture** - ein System, mehrere Kunden
- ✅ **Vollautomatische Workflows** von Lead bis After-Sales
- ✅ **Google Sheets als Datenbank** - einfach, transparent, zugänglich
- ✅ **Integriert mit** n8n, OpenAI, Google Workspace, Ad-Platforms

### 🏢 Unterstützte Marken

| Brand | Hauptprodukte | Zielindustrien |
|-------|---------------|----------------|
| **ROBOPAC** | Pallet Wrapper | Logistics, Warehousing, Distribution |
| **OCME** | Palletizer, Depalletizer, Case Packer | Food, Beverage, Pharma |
| **PRASMATIC** | Bag-in-Box, Liquid Filling | Beverage, Wine, Chemicals |
| **SOTEMAPACK** | Traysealer, Thermoformer | Fresh Food, Ready Meals |
| **MEYPACK** | Case Erector, Case Sealer | Consumer Goods, E-Commerce |

### 🎨 System-Architektur

```
┌──────────────────────────────────────────────────────────────┐
│                   AETNA GROUP BRANDS                         │
│   ROBOPAC  │  OCME  │  PRASMATIC  │  SOTEMAPACK  │  MEYPACK │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────▼────────────────┐
         │   AI_WIESLOGIC_MASTER          │
         │   Central Orchestrator          │
         │   • Brand Detection             │
         │   • Agent Routing               │
         │   • Customer Management         │
         └───────────┬────────────────────┘
                     │
      ┌──────────────┼──────────────────────────┐
      │              │                          │
┌─────▼──────┐  ┌───▼──────┐        ┌─────────▼────────┐
│   LEAD     │  │ CONTENT  │        │    MARKETING     │
│ GENERATOR  │  │  AGENT   │        │      AGENT       │
│ (MQL       │  │          │        │  (Campaigns)     │
│  Scoring)  │  │          │        │                  │
└─────┬──────┘  └──────────┘        └──────────────────┘
      │
┌─────▼──────┐
│   LEAD     │
│   AGENT    │
│  (BANT     │
│  Scoring)  │
└─────┬──────┘
      │
┌─────▼──────┐
│ TECHNICAL  │
│   AGENT    │
│ (Product   │
│  Matching) │
└─────┬──────┘
      │
┌─────▼──────┐         ┌──────────────┐
│   SALES    │         │   SERVICE    │
│   AGENT    │         │    AGENT     │
│(Quotation) │         │  (Support)   │
└────────────┘         └──────────────┘
      │
      ▼
┌────────────────────────────────────────┐
│        Google Sheets Database          │
│  • Inquiries  • Quotations  • Orders  │
│  • Service    • Content     • More... │
└────────────────────────────────────────┘
```

---

## 2. Schnellstart-Anleitung

### 🚀 In 5 Schritten zum laufenden System

#### Schritt 1: Repository klonen
```bash
git clone https://github.com/HNTRLEGEND/SocialMediaManager.git
cd SocialMediaManager/wieslogic-agent-system
```

#### Schritt 2: Dokumentation lesen
```bash
# Übersicht verschaffen
cat README.md

# Workflow-Templates ansehen
ls workflows/
# → AI_WIESLOGIC_MASTER.md
# → AI_LEAD_AGENT.md
# → AI_TECHNICAL_AGENT.md
# → ... (8 Templates total)

# Konfigurationen prüfen
ls config/
# → master-controller-config.json
# → aetna-group-config.md
# → sheet-mapping-helper.js
```

#### Schritt 3: Google Sheets Setup
```bash
# 1. Kopiere das Robopac_Database Sheet Template
# 2. Erstelle neue Sheets für deine Kunden
# 3. Konfiguriere Sheet-IDs in config/
```

**Benötigte Sheets:**
- `01_📋Inquiries_Log` - Alle Anfragen
- `02💰Quotation_Options` - Angebote
- `03_📦_Orders_Contracts` - Aufträge
- `04_🛠️_Service_Tickets` - Service-Tickets
- `13📑Master_Log` - System-Log
- `17_🔍_Client_Config` - Kunden-Konfiguration
- `06_📦_Product_Portfolio` - Produkte
- ... (siehe Google Sheets Setup)

#### Schritt 4: n8n Workflows importieren
```bash
# Templates zu n8n JSON konvertieren (siehe Deployment Guide)
# Oder: Workflows manuell in n8n erstellen basierend auf Templates
```

#### Schritt 5: Erster Test-Run
```bash
# Test MASTER Agent
curl -X POST https://your-n8n-instance.com/webhook/wieslogic-master \
  -H "Content-Type: application/json" \
  -d '{
    "action": "trigger_lead_agent",
    "customer_id": "ROBOPAC_AETNA_001",
    "brand": "ROBOPAC",
    "data": {
      "company_name": "Test GmbH",
      "email": "test@test.de",
      "message": "Interested in pallet wrappers"
    }
  }'
```

---

## 3. Die 8 Agents im Detail

### 3.1 AI_WIESLOGIC_MASTER 🎯

**Rolle:** Zentraler Orchestrator und Traffic Director

**Hauptaufgaben:**
- Empfängt alle eingehenden Requests
- Erkennt automatisch die zuständige Marke (ROBOPAC, OCME, etc.)
- Prüft welche Agents der Kunde aktiviert hat
- Routet zu passenden Agent oder fallback zu Manual Review

**Webhook:** `POST /webhook/wieslogic-master`

**Input Beispiel:**
```json
{
  "action": "trigger_lead_agent",
  "customer_id": "ROBOPAC_AETNA_001",
  "brand": "ROBOPAC",
  "data": {
    "company_name": "Logistics GmbH",
    "email": "john@logistics.de",
    "product_type": "Pallet Wrapper"
  }
}
```

**Unterstützte Actions:**
- `trigger_lead_agent` - Neue Lead-Anfrage
- `trigger_technical_agent` - Direkt zu technischer Analyse
- `trigger_sales_agent` - Direkt zu Angebotserstellung
- `trigger_service_agent` - Service-Anfrage
- `trigger_content_agent` - Content-Anfrage
- `trigger_marketing_agent` - Kampagnen-Anfrage

**Output:** Routet zu entsprechendem Agent mit vollständigem Context

**Key Features:**
- Brand Detection Algorithm
- Agent Availability Check
- Fallback Logic
- Master Execution ID für End-to-End Tracking

📄 **Vollständige Dokumentation:** `workflows/AI_WIESLOGIC_MASTER.md`

---

### 3.2 AI_LEAD_AGENT 🎯

**Rolle:** Lead Qualification mit BANT Scoring

**Hauptaufgaben:**
- Bewertet Leads anhand BANT-Kriterien (Budget, Authority, Need, Timeline)
- Enrichment mit Hunter.io (Company Data)
- Erstellt Lead Dossier in Google Docs
- Kategorisiert: 🔥 HOT (80-100), 🟡 WARM (60-79), 🔵 COLD (<60)

**Webhook:** `POST /webhook/lead-agent` (normalerweise via MASTER)

**BANT Scoring System (100 Punkte):**
- **Budget (25 Punkte):** Explizit genannt oder aus Company Size geschätzt
- **Authority (25 Punkte):** Job Title (Director=25, Manager=20, Engineer=10)
- **Need (30 Punkte):** Pain Points in Message, Requirement Clarity
- **Timeline (20 Punkte):** Urgency Keywords, Explicit Deadlines

**Output:**
- `bant_score`: 0-100
- `category`: hot/warm/cold
- `lead_dossier_link`: Google Docs Link
- Routes to **TECHNICAL_AGENT** (if score ≥60) or **Nurture Campaign** (if <60)

**Key Features:**
- Automatic Budget Estimation
- Authority Detection
- Timeline Extraction
- Hunter.io Integration

📄 **Vollständige Dokumentation:** `workflows/AI_LEAD_AGENT.md`

---

### 3.3 AI_TECHNICAL_AGENT ⚙️

**Rolle:** Technische Machbarkeit & Produktempfehlung

**Hauptaufgaben:**
- Extrahiert technische Requirements (Durchsatz, Specs, Environment)
- Lädt passende Produkte aus Portfolio
- Berechnet Machbarkeit mit **product-calculators.js**
- RAG-basierte Empfehlungen (OpenAI Vector Store)
- Erstellt Technical Evaluation Document

**Scoring System (100 Punkte):**
- **Feasibility (40 Punkte):** Erfüllt Requirements?
- **Efficiency (25 Punkte):** Wie effizient?
- **Confidence (20 Punkte):** Confidence in Empfehlung
- **Budget Fit (15 Punkte):** Passt in Budget?

**Product Calculator Integration:**
```javascript
// Automatische Calculator-Auswahl
const calculator = CalculatorFactory.getCalculator('pallet_wrapper');
const result = calculator.calculate({
  required_pallets_per_hour: 80,
  pallet_height: 1800,
  environment: 'indoor'
});
// → { meets_requirement: true, actual_throughput: 85, efficiency: 94% }
```

**Output:**
- `technical_score`: 0-100
- `recommended_product`: Best match
- `alternative_products`: 2-3 Alternativen
- `evaluation_doc_link`: Technical Report
- Routes to **SALES_AGENT** (if score ≥60) or **Manual Review** (if <60)

**Key Features:**
- 10 Product Calculators (Wrapper, Palletizer, etc.)
- RAG Integration für Best Practices
- Automatic Product Matching
- Feasibility Assessment

📄 **Vollständige Dokumentation:** `workflows/AI_TECHNICAL_AGENT.md`

---

### 3.4 AI_SALES_AGENT 💰

**Rolle:** Angebotserstellung & Pricing Management

**Hauptaufgaben:**
- Berechnet Gesamtpreis (Base + Optional Features + Installation + Training)
- Empfiehlt Optional Features basierend auf Requirements
- Berechnet Discounts (Volume, Complexity, Bundle)
- Erstellt professionelles Angebot (Google Docs)
- Managed Approval Workflow (Auto/Manager/Director)

**Pricing Calculation:**
```javascript
Total = Base Price
      + Optional Features
      + Installation
      + Training
      - Volume Discount (5-12%)
      + Complexity Surcharge (0-10%)
```

**Discount Logic:**
- **Standard (0-10%):** Auto-approved
- **Special (10-20%):** Manager approval erforderlich
- **Strategic (20%+):** Director approval erforderlich

**Multi-Brand Bundle Detection:**
- ROBOPAC Wrapper + OCME Palletizer = 10% Bundle Discount
- MEYPACK Case Erector + Case Sealer = 10% Bundle Discount

**Output:**
- `quotation_id`: QUO_...
- `total_including_tax`: Gesamt-Preis
- `quotation_doc_link`: Angebots-PDF
- `approval_status`: approved/pending_approval
- Sends Quotation to Customer

**Key Features:**
- Automatic Pricing Calculation
- Optional Features Recommendation
- Cross-Brand Bundle Detection
- Payment Terms (30/40/30)

📄 **Vollständige Dokumentation:** `workflows/AI_SALES_AGENT.md`

---

### 3.5 AI_SERVICE_AGENT 🔧

**Rolle:** After-Sales Support & Service Management

**Hauptaufgaben:**
- Erstellt Service Tickets aus Email, IoT Alerts, Phone Calls
- AI-basierte Fehlerdiagnose (RAG Knowledge Base)
- Error Code Detection & Troubleshooting Steps
- Spare Parts Availability Check
- Remote vs On-site Decision
- SLA Tracking & Escalation

**Service Ticket Creation:**
```
Email → Extract Error Code → Classify Issue →
RAG Diagnosis → Parts Check → Service Decision →
Ticket Creation → Customer Response
```

**SLA Levels:**
- 🔴 **Critical:** 4 Stunden (Production Down)
- 🟠 **High:** 24 Stunden (Performance Issue)
- 🟡 **Medium:** 72 Stunden (Minor Issue)
- 🟢 **Low:** 7 Tage (Planned Maintenance)

**Service Delivery Methods:**
- **Remote Guided:** Customer kann selbst mit Anleitung
- **Parts + Remote:** Teile versenden, dann Remote Support
- **On-site:** Techniker vor Ort
- **On-site Urgent:** Sofort-Einsatz (Critical)

**Output:**
- `ticket_id`: TICKET_...
- `service_delivery_method`: remote/on-site
- `sla_deadline`: ISO Timestamp
- `required_parts`: Array of Part Numbers
- Sends Response to Customer

**Key Features:**
- Multi-Source Ticket Creation
- AI Troubleshooting Engine
- Spare Parts Management
- Preventive Maintenance Scheduling

📄 **Vollständige Dokumentation:** `workflows/AI_SERVICE_AGENT.md`

---

### 3.6 AI_LEAD_GENERATOR 📈

**Rolle:** Marketing Lead Generation & MQL Scoring

**Hauptaufgaben:**
- Captured Leads von Website, LinkedIn, Trade Shows, Webinars
- Lead Enrichment (Hunter.io, Clearbit)
- MQL Scoring (0-100 Punkte)
- Lead Nurturing Campaigns
- Deduplication & Engagement Tracking

**MQL Scoring System (100 Punkte):**
- **Engagement (40 Punkte):** Downloads, Forms, Trade Show Visits
  - Trade Show: 20 Punkte
  - Webinar Attended: 15 Punkte
  - Content Download: 10 Punkte
  - Form Submit: 15 Punkte
- **Firmographics (30 Punkte):** Company Size, Revenue, Industry Match
  - 500+ Employees: 10 Punkte
  - €100M+ Revenue: 10 Punkte
  - Target Industry: 10 Punkte
- **Role & Seniority (20 Punkte):** Job Title, Decision Making Power
  - C-Level/VP: 10 Punkte
  - Operations/Logistics Role: 10 Punkte
- **Intent Signals (10 Punkte):** Pricing Page Visits, Demo Requests
  - Demo Request: 10 Punkte
  - Pricing Page: 5 Punkte

**MQL Categories:**
- 🔥 **Hot MQL (70-100):** Immediate handover to LEAD_AGENT
- 🟡 **Warm MQL (50-69):** Qualified handover to LEAD_AGENT
- 🔵 **Cold MQL (30-49):** 30-day Nurture Campaign
- ⚪ **Nurture (<30):** 90-day Long Nurture

**Output:**
- `mql_score`: 0-100
- `mql_category`: hot/warm/cold/nurture
- Routes to **LEAD_AGENT** (if ≥50) or **Nurture Campaign** (if <50)

**Key Features:**
- Multi-Channel Lead Capture
- Lead Enrichment APIs
- Engagement History Tracking
- Automated Nurture Sequences

📄 **Vollständige Dokumentation:** `workflows/AI_LEAD_GENERATOR.md`

---

### 3.7 AI_CONTENT_AGENT ✍️

**Rolle:** Content Creation & SEO Optimization

**Hauptaufgaben:**
- Erstellt Content für alle Kanäle (Blog, Social, Email, Case Studies)
- Brand Voice Compliance für alle 5 AETNA Brands
- SEO Optimization (Keywords, Readability, Structure)
- Multi-Language Translation (DE/EN)
- Content Approval Workflow

**Content Types:**
- 📝 **Blog Posts:** 800-1500 Wörter, SEO-optimiert
- 📱 **Social Media:** Platform-spezifisch (LinkedIn, Twitter, Facebook)
- 📊 **Case Studies:** Success Stories mit ROI
- 🏷️ **Product Descriptions:** Technical + Marketing
- 📧 **Email Copy:** Subject + Body + CTA
- 🎥 **Video Scripts:** YouTube, Demos
- 🌐 **Landing Pages:** Conversion-optimiert

**SEO Optimization Engine:**
```javascript
{
  "seo_score": 87,
  "title": { "length": 68, "score": 100 },
  "readability": { "score": 64, "rating": "easy" },
  "keywords": [
    { "keyword": "pallet wrapping", "density": 1.8, "in_title": true, "score": 100 }
  ],
  "recommendations": []
}
```

**Brand Voice Guidelines:**
- **ROBOPAC:** Professional, innovative, reliability-focused
- **OCME:** Technical expert, precision-focused
- **PRASMATIC:** Innovative, flexible, sustainability-conscious
- **SOTEMAPACK:** Fresh, modern, quality-focused
- **MEYPACK:** Reliable, efficient, pragmatic

**Approval Workflow:**
- ✅ **Auto-approved:** SEO >70, No forbidden terms, Standard content types
- ⚠️ **Manual Review:** Case Studies, Product Launches, SEO <70

**Output:**
- `content_id`: CONTENT_...
- `ai_generated_content`: Full content text
- `seo_analysis`: SEO score + recommendations
- `status`: auto_approved/pending_review
- Publishes or sends for review

**Key Features:**
- Brand Voice per Marke
- SEO Analysis & Optimization
- Multi-Language Support
- Content Calendar Management

📄 **Vollständige Dokumentation:** `workflows/AI_CONTENT_AGENT.md`

---

### 3.8 AI_MARKETING_AGENT 📊

**Rolle:** Campaign Management & Performance Optimization

**Hauptaufgaben:**
- Plant Multi-Channel Marketing Campaigns
- Setup & Management von Ad Campaigns (Google, LinkedIn, Facebook)
- Email Campaign Orchestration
- Social Media Scheduling
- Daily Performance Monitoring
- Budget Optimization
- Weekly Reporting

**Campaign Types:**
- 🚀 **Product Launch:** Multi-channel coordination
- 🎯 **Lead Generation:** B2B lead acquisition
- 🏢 **Trade Show:** Pre/During/Post event campaigns
- 📅 **Quarterly Plans:** Strategic marketing planning

**Budget Allocation (Data-Driven):**
```javascript
// Example: €50k Product Launch Budget
{
  "google_ads": "€17,500 (35%)",
  "linkedin": "€15,000 (30%)",
  "content": "€7,500 (15%)",
  "email": "€5,000 (10%)",
  "events": "€5,000 (10%)"
}
```

**Multi-Channel Management:**
- **Google Ads:** Search, Display, YouTube
  - Automatic bid optimization (Target CPA)
  - Keyword performance tracking
  - A/B testing ad creatives
- **LinkedIn Ads:** Sponsored Content, InMail
  - Job title & industry targeting
  - Lead gen forms integration
- **Email Marketing:** Drip campaigns, segmentation
  - A/B testing subject lines
  - Personalization at scale
- **Social Media:** Multi-platform scheduling
  - Hashtag strategy
  - Engagement tracking

**Performance Monitoring:**
```javascript
// Daily checks
if (cpl > target_cpl * 1.2) {
  alert("CPL too high");
  recommend("Reduce bids by 15%");
}

if (ctr < 1.0) {
  alert("CTR too low");
  recommend("Refresh ad creatives");
}
```

**Output:**
- `campaign_id`: CAMP_...
- `google_ads_campaign_id`: Created campaign ID
- `linkedin_campaign_id`: Created campaign ID
- `tracking_dashboard_url`: Analytics Dashboard
- Weekly reports via Email

**Key Features:**
- AI-Powered Strategy Generation
- Multi-Channel Setup Automation
- Real-Time Performance Monitoring
- Automated Optimization Recommendations

📄 **Vollständige Dokumentation:** `workflows/AI_MARKETING_AGENT.md`

---

## 4. Customer Journey Flows

### 4.1 Sales Pipeline - Lead to Customer

```
Website Form
    ↓
LEAD_GENERATOR (MQL Score: 75)
    ↓
MASTER (Brand: ROBOPAC)
    ↓
LEAD_AGENT (BANT Score: 85 - HOT)
    ↓
TECHNICAL_AGENT (Technical Score: 92 - Helix Premium recommended)
    ↓
SALES_AGENT (Quotation: €87,031 - Auto-approved)
    ↓
Customer receives Quotation
    ↓
[Customer accepts]
    ↓
Order in 03_📦_Orders_Contracts
```

**Durchlaufzeit:** 8-12 Minuten (vollautomatisch)

---

### 4.2 Marketing Pipeline - MQL to SQL

```
LinkedIn Ad Click
    ↓
Landing Page Visit + Content Download
    ↓
LEAD_GENERATOR
    ├─ MQL Score: 45 (COLD)
    └─ Action: 30-day Nurture Campaign
         ├─ Email 1 (Day 0): Welcome
         ├─ Email 2 (Day 7): Case Study
         ├─ Email 3 (Day 14): ROI Calculator
         └─ Email 4 (Day 21): Webinar Invite
              ↓
[User registers for Webinar]
    ↓
LEAD_GENERATOR (Re-score)
    ├─ MQL Score: 68 (WARM)
    └─ Action: Handover to LEAD_AGENT
         ↓
[Continues Sales Pipeline...]
```

**Nurture Duration:** 21-30 Tage bis Qualification

---

### 4.3 Service Pipeline - Issue to Resolution

```
Machine Error (IoT Alert)
    ↓
SERVICE_AGENT
    ├─ Extract: Error E401 (Motor Overload)
    ├─ Classify: Critical (SLA: 4h)
    ├─ RAG Diagnosis: "Clean rails + lubricate"
    ├─ Parts Check: Lubricant in stock
    └─ Decision: Remote Guided Support
         ↓
Ticket Created (TICKET_...)
    ↓
Email to Customer with Steps
    ↓
[Customer follows steps]
    ↓
Issue Resolved
    ↓
Follow-up Survey (NPS)
```

**Durchlaufzeit:** 45-60 Minuten (Remote) / 4-8 Stunden (On-site)

---

### 4.4 Content & Campaign Pipeline

```
MARKETING_AGENT: Product Launch Campaign Request
    ↓
AI Strategy Generation
    ├─ Budget Allocation: €50k across 5 channels
    ├─ Timeline: 90 days
    └─ Content Requirements: 1 Landing Page, 15 Ads, 5 Emails, 20 Social Posts
         ↓
CONTENT_AGENT (15 parallel requests)
    ├─ Blog Post: "Helix Ultimate - The Future of Wrapping"
    ├─ Ad Creative 1: "Increase Efficiency 40%"
    ├─ Ad Creative 2: "ROI in 18 Months"
    ├─ Email 1: Product Introduction
    └─ ... (more content)
         ↓
All Content approved
    ↓
MARKETING_AGENT
    ├─ Google Ads Campaign Created
    ├─ LinkedIn Ads Campaign Created
    ├─ Email Sequences Scheduled
    └─ Social Posts Scheduled
         ↓
Campaign Live
    ↓
Daily Performance Monitoring
    ↓
Weekly Reports sent
```

**Setup Zeit:** 15-20 Minuten / **Campaign Duration:** 90 Tage

---

## 5. Technische Integration

### 5.1 Benötigte APIs & Services

#### OpenAI (Pflicht)
```bash
# Environment Variable
OPENAI_API_KEY=sk-...
OPENAI_VECTOR_STORE_ID=vs_...  # Technical KB
OPENAI_SERVICE_KB_VECTOR_STORE_ID=vs_...  # Service KB
OPENAI_CONTENT_KB_VECTOR_STORE_ID=vs_...  # Content KB
```

**Verwendung:**
- GPT-4 für AI-Generierung (Content, Strategy, Diagnosis)
- Vector Stores für RAG (Retrieval-Augmented Generation)

**Kosten:** ~$0.03 per 1k tokens (Input) / $0.06 per 1k tokens (Output)

---

#### Hunter.io (Pflicht für Lead Enrichment)
```bash
HUNTER_IO_API_KEY=...
```

**Verwendung:**
- Company data enrichment
- Contact discovery
- Email verification

**Kosten:** 500 requests/month (Free) / 5,000 requests/month ($49/mo)

---

#### Clearbit (Optional, Alternative zu Hunter.io)
```bash
CLEARBIT_API_KEY=sk_...
```

**Verwendung:**
- Company enrichment
- Revenue estimates
- Technology detection

---

#### Google Workspace (Pflicht)
```bash
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...

# Google Docs API (für Documents)
# Same credentials

# Gmail API (für Email-Versand)
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
```

**Setup Guide:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project "WiesLogic-Agents"
3. Enable APIs:
   - Google Sheets API
   - Google Docs API
   - Gmail API
   - Google Drive API
4. Create Service Account
5. Download JSON credentials
6. Share Google Sheets with Service Account Email

---

#### Google Ads API (für MARKETING_AGENT)
```bash
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...
```

**Setup:** [Google Ads API Setup Guide](https://developers.google.com/google-ads/api/docs/first-call/overview)

---

#### LinkedIn Ads API (für MARKETING_AGENT)
```bash
LINKEDIN_ADS_ACCESS_TOKEN=...
LINKEDIN_ADS_ACCOUNT_ID=...
```

**Setup:** [LinkedIn Marketing API](https://learn.microsoft.com/en-us/linkedin/marketing/)

---

#### Email Marketing Platform (Optional)
**Mailchimp:**
```bash
MAILCHIMP_API_KEY=...
MAILCHIMP_LIST_ID=...
```

**HubSpot:**
```bash
HUBSPOT_API_KEY=...
```

---

### 5.2 n8n Setup

#### Installation
```bash
# Docker (empfohlen)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Oder: npm
npm install n8n -g
n8n start
```

#### Credentials Setup in n8n
1. **OpenAI Account**
   - Settings → Credentials → New Credential
   - Type: OpenAI
   - API Key: `sk-...`

2. **Google Sheets**
   - Type: Google Sheets OAuth2 API
   - Upload Service Account JSON
   - Oder: OAuth2 Flow

3. **Gmail**
   - Type: Gmail OAuth2
   - Client ID + Secret
   - Authorize

4. **HTTP Request (für Hunter.io, etc.)**
   - Type: Header Auth
   - Name: `x-api-key`
   - Value: Hunter.io Key

---

### 5.3 Webhook URLs

Alle Agents haben eigene Webhooks:

```
# Production URLs (Beispiel)
https://n8n.wieslogic.de/webhook/wieslogic-master
https://n8n.wieslogic.de/webhook/lead-agent
https://n8n.wieslogic.de/webhook/technical-agent
https://n8n.wieslogic.de/webhook/sales-agent
https://n8n.wieslogic.de/webhook/service-agent
https://n8n.wieslogic.de/webhook/lead-generator
https://n8n.wieslogic.de/webhook/content-agent
https://n8n.wieslogic.de/webhook/marketing-agent
```

**Webhook Security:**
- Bearer Token Authentication
- IP Whitelisting (optional)
- Rate Limiting

---

## 6. Google Sheets Setup

### 6.1 Template Sheet: Robopac_Database

**File ID:** (Deine bestehende Sheet-ID)

**Alle Sheets (17 total):**

| Sheet Name | Zweck | Primär-Agent |
|------------|-------|--------------|
| `01_📋Inquiries_Log` | Alle Anfragen | LEAD_GEN, LEAD |
| `02💰Quotation_Options` | Angebote | SALES |
| `03_📦_Orders_Contracts` | Aufträge & Verträge | SALES |
| `04_🛠️_Service_Tickets` | Service-Tickets | SERVICE |
| `05_📞_Support_Calls_Log` | Support-Anrufe | SERVICE |
| `06_📦_Product_Portfolio` | Produkt-Katalog | TECHNICAL, SALES |
| `07_⚙️_Mechanical_Specs` | Mechanische Specs | TECHNICAL |
| `08_🔌_Electrical_Specs` | Elektrische Specs | TECHNICAL |
| `09_🎞️_Packaging_Process_Specs` | Prozess-Specs | TECHNICAL |
| `10_✅_Tasks_Workflow` | Aufgaben & Follow-ups | Alle |
| `12_🔐_Approval_Queue` | Genehmigungen | SALES, CONTENT |
| `13📑Master_Log` | System-Log (Audit) | Alle |
| `14_🎯_Case_Studies` | Erfolgsgeschichten | CONTENT |
| `16_Evaluation_Log` | Tech. Evaluations | TECHNICAL |
| `17_🔍_Client_Config` | Kunden-Konfig | MASTER |
| `19_🔍_Lead_Intelligence_Log` | Enrichment-Daten | LEAD_GEN, LEAD |
| `20_📚_Content_Library` | Content-Archiv | CONTENT |
| `21_📊_Marketing_Campaigns` | Kampagnen-Tracking | MARKETING |

### 6.2 Client Config Sheet (`17_🔍_Client_Config`)

**Spalten:**
```
Customer_ID | Customer_Name | Active_Modules | Product_Types | Budget_Range | ...
```

**Beispiel-Eintrag:**
```
ROBOPAC_AETNA_001 | ROBOPAC AETNA Group | lead_agent,technical_agent,sales_agent,service_agent | pallet_wrappers,shrink_wrappers | 25000-500000 | ...
```

**Active_Modules Format:**
```
lead_agent,technical_agent,sales_agent,service_agent,content_agent,marketing_agent
```

→ Bestimmt welche Agents dieser Kunde nutzen kann

---

### 6.3 Sheet-Zugriff konfigurieren

**Option 1: Service Account (empfohlen für Automation)**
```bash
# 1. Service Account erstellt in Google Cloud Console
SERVICE_ACCOUNT_EMAIL=wieslogic-agents@project.iam.gserviceaccount.com

# 2. Sheet freigeben
# Rechtsklick auf Sheet → Freigeben
# Email: wieslogic-agents@project.iam.gserviceaccount.com
# Berechtigung: Editor

# 3. In n8n: Service Account JSON hochladen
```

**Option 2: OAuth2 (für User-spezifischen Zugriff)**
```bash
# n8n Credentials: Google Sheets OAuth2
# Authorisiere mit Google Account
# Agents greifen mit deinem Account zu
```

---

## 7. Deployment Guide

### 7.1 Deployment-Optionen

#### Option A: Cloud Deployment (empfohlen)

**n8n Cloud:**
```bash
# Einfachster Weg
# 1. Account erstellen: n8n.io
# 2. Workflows importieren
# 3. Credentials konfigurieren
# 4. Fertig!
```

**Kosten:** $20-50/Monat (je nach Executions)

---

**Self-Hosted auf AWS/GCP/Azure:**
```bash
# Docker Compose Setup
version: '3'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=...
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

---

#### Option B: On-Premise Deployment

```bash
# VM Requirements
CPU: 4 cores
RAM: 8 GB
Storage: 50 GB SSD
OS: Ubuntu 22.04 LTS

# Installation
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER

# Deploy
cd /opt
git clone https://github.com/your-repo/wieslogic-agents.git
cd wieslogic-agents
docker-compose up -d
```

---

### 7.2 Workflow Import

**Von Markdown Templates zu n8n Workflows:**

⚠️ **Wichtig:** Die aktuellen Files sind **Markdown-Dokumentationen**, keine n8n JSON-Workflows.

**Conversion-Optionen:**

**Option 1: Manuell in n8n erstellen** (empfohlen für erstes Setup)
```bash
# 1. Öffne n8n Interface
# 2. Erstelle neuen Workflow
# 3. Folge dem Template Schritt-für-Schritt
# 4. Füge Nodes hinzu gemäß Dokumentation
# 5. Teste jeden Node
# 6. Speichere & Aktiviere
```

**Beispiel:** AI_WIESLOGIC_MASTER.md → n8n Workflow
1. Webhook Node hinzufügen (`/webhook/wieslogic-master`)
2. Code Node hinzufügen (Input Validation)
3. Google Sheets Node (Load Client Config)
4. Code Node (Brand Detection)
5. IF Node (Agent Availability)
6. Switch Node (Route to Agent)
7. HTTP Request Nodes (Agent Calls)
8. Google Sheets Node (Log to Master_Log)

**Zeit pro Workflow:** 30-60 Minuten

---

**Option 2: n8n JSON Workflow Generator** (TODO - zukünftige Entwicklung)
```bash
# Automatische Conversion (noch nicht implementiert)
python scripts/markdown_to_n8n_json.py \
  --input workflows/AI_WIESLOGIC_MASTER.md \
  --output n8n-workflows/AI_WIESLOGIC_MASTER.json
```

---

**Option 3: Bestehende JSON Workflows nutzen** (wenn vorhanden)
```bash
# In n8n:
# Workflows → Import from File → Wähle JSON
# Oder: Import from URL

# Credentials konfigurieren
# Workflow aktivieren
```

---

### 7.3 Testing & Validation

**Test-Checkliste:**

```bash
# 1. MASTER Agent
✅ Webhook erreichbar
✅ Brand Detection funktioniert
✅ Agent Routing funktioniert
✅ Master_Log Schreibzugriff

# 2. LEAD_AGENT
✅ Empfängt Input von MASTER
✅ Hunter.io Enrichment
✅ BANT Scoring korrekt
✅ Google Docs Dossier erstellt
✅ Inquiries_Log Update

# 3. TECHNICAL_AGENT
✅ Product Calculators funktionieren
✅ RAG Vector Store Zugriff
✅ Evaluation Document erstellt
✅ Routing zu SALES

# 4. SALES_AGENT
✅ Pricing Calculation
✅ Quotation Document generiert
✅ Approval Logic
✅ Email Versand

# 5. SERVICE_AGENT
✅ Multi-Source Ticket Creation
✅ Error Code Extraction
✅ RAG Troubleshooting
✅ Email Response

# 6. LEAD_GENERATOR
✅ Multi-Channel Capture
✅ MQL Scoring
✅ Deduplication
✅ Nurture Campaign Trigger

# 7. CONTENT_AGENT
✅ Content Generation (alle Typen)
✅ SEO Analysis
✅ Brand Voice Compliance
✅ Multi-Language

# 8. MARKETING_AGENT
✅ Campaign Strategy
✅ Ad Platform Setup (Google, LinkedIn)
✅ Email Campaign
✅ Performance Monitoring
```

---

## 8. Betrieb & Monitoring

### 8.1 Monitoring Dashboard

**Key Metrics zu tracken:**

**System Health:**
- ✅ Workflow Execution Success Rate (Target: >95%)
- ✅ Average Execution Time per Agent
- ✅ Error Rate per Agent
- ✅ API Rate Limit Usage

**Business Metrics:**
- 📊 Leads Generated (Daily/Weekly/Monthly)
- 📊 MQL → SQL Conversion Rate (Target: >40%)
- 📊 Quotations Sent vs Won (Target: 25-30%)
- 📊 Average Time: Lead → Quotation (Target: <12 min)
- 📊 Service Tickets: Average Resolution Time
- 📊 Campaign ROI

**Google Sheets als Monitoring:**
```bash
# Sheet: 13📑Master_Log analysieren
# Pivot Table:
# Rows: agent_name
# Columns: result (success/error)
# Values: COUNT

# Ergebnis:
Agent              Success    Error    Error Rate
LEAD_AGENT         450        5        1.1%
TECHNICAL_AGENT    430        8        1.8%
SALES_AGENT        420        3        0.7%
...
```

---

### 8.2 Alerting Setup

**n8n Error Workflow:**
```
Error Trigger (any workflow fails)
    ↓
Log Error to 13📑Master_Log
    ↓
IF: Error Count > 3 in 1 hour
    ↓
Send Slack/Email Alert
```

**Critical Alerts:**
- 🚨 Agent Down (Webhook nicht erreichbar)
- 🚨 Google Sheets API Error (Zugriff verweigert)
- 🚨 OpenAI API Error (Rate Limit oder Key ungültig)
- 🚨 High Error Rate (>5% in 1 Stunde)

---

### 8.3 Backup & Recovery

**Google Sheets Backup:**
```bash
# Automatisches Backup via Google Apps Script
function dailyBackup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var destination = DriveApp.getFolderById('BACKUP_FOLDER_ID');
  var backup = sheet.copy('Backup_' + new Date().toISOString());
  backup.moveTo(destination);
}

# Trigger: Täglich um 3 Uhr morgens
```

**n8n Workflows Backup:**
```bash
# n8n CLI Export
n8n export:workflow --all --output=./backups/workflows_$(date +%Y%m%d).json

# Oder: UI
# Settings → Export → All Workflows
```

---

## 9. Troubleshooting

### 9.1 Häufige Probleme

#### Problem: "Workflow execution failed"
**Symptom:** Workflow stoppt mit Error
**Ursachen:**
1. API Key ungültig/abgelaufen
2. Google Sheets Zugriff verweigert
3. Webhook Timeout (>120s)

**Lösung:**
```bash
# 1. Check Credentials in n8n
Settings → Credentials → Test Connection

# 2. Check Google Sheets Sharing
Rechtsklick auf Sheet → Freigeben → Service Account vorhanden?

# 3. Check Execution Logs
Workflow → Executions → Click on failed execution
```

---

#### Problem: "Hunter.io Rate Limit Exceeded"
**Symptom:** LEAD_AGENT/LEAD_GENERATOR fail mit 429 Error
**Ursache:** 500 requests/month limit überschritten

**Lösung:**
```bash
# Option 1: Upgrade Hunter.io Plan ($49/mo für 5k requests)
# Option 2: Implement Caching
# Check 19_🔍_Lead_Intelligence_Log before calling Hunter.io
const cached = await checkLeadIntelligence(company_domain);
if (cached && cached.age_days < 90) {
  return cached.enrichment_data;
}
```

---

#### Problem: "Brand Detection falsch"
**Symptom:** Lead wird zu falscher Brand geroutet
**Ursache:** Product Type nicht erkannt

**Lösung:**
```javascript
// In MASTER: detectBrand() Funktion erweitern
function detectBrand(data) {
  const productType = (data.product_type || '').toLowerCase();
  const message = (data.message || '').toLowerCase();

  // Add more keywords
  if (productType.includes('wrapper') || message.includes('wrapping')) {
    return 'ROBOPAC';
  }
  // ... more rules

  // Fallback: Ask user
  return 'ROBOPAC'; // Default
}
```

---

#### Problem: "Quotation Email nicht versendet"
**Symptom:** SALES_AGENT erstellt Quote, aber Email kommt nicht an
**Ursache:** Gmail API nicht konfiguriert oder Spam

**Lösung:**
```bash
# 1. Check Gmail API Credentials
n8n → Credentials → Gmail OAuth2 → Re-authorize

# 2. Check Spam Folder
Email könnte als Spam markiert sein

# 3. Check Email Template
Subject Line und Body müssen valide sein (keine Spam-Keywords)

# 4. Use SMTP als Alternative
n8n → Settings → Email Account (SMTP)
```

---

### 9.2 Debug Mode

**n8n Debug Logging aktivieren:**
```bash
# In docker-compose.yml
environment:
  - N8N_LOG_LEVEL=debug
  - N8N_LOG_OUTPUT=console,file
  - N8N_LOG_FILE_LOCATION=/home/node/.n8n/logs/

# Logs ansehen
docker logs n8n -f --tail=100
```

---

## 10. FAQ

### Q1: Kann ich nur einzelne Agents nutzen?
**A:** Ja! Jeder Agent ist standalone nutzbar. Du kannst z.B. nur SERVICE_AGENT für After-Sales deployen.

### Q2: Wie füge ich einen neuen Kunden hinzu?
**A:**
1. Dupliziere Google Sheet Template
2. Füge Eintrag in `17_🔍_Client_Config` hinzu
3. Konfiguriere `active_modules` für diesen Kunden
4. Fertig! System routet automatisch zu korrekten Agents

### Q3: Unterstützt das System mehrere Sprachen?
**A:** Ja! CONTENT_AGENT hat Multi-Language Support (DE/EN). Weitere Sprachen via OpenAI Translation erweiterbar.

### Q4: Was passiert wenn OpenAI API down ist?
**A:** Workflows mit OpenAI Dependency (CONTENT, MARKETING Strategy) failen. Basic Flows (LEAD→TECHNICAL→SALES) funktionieren mit Fallback-Logic.

### Q5: Kann ich eigene Brands hinzufügen (nicht AETNA)?
**A:** Ja!
1. Erweitere `config/aetna-group-config.md`
2. Füge Brand Guidelines in CONTENT_AGENT hinzu
3. Erweitere Brand Detection in MASTER
4. Update Product Portfolio mit neuen Produkten

### Q6: Wie lange dauert die komplette Implementierung?
**A:**
- **Minimal Setup** (nur MASTER + LEAD + TECHNICAL + SALES): 1-2 Tage
- **Vollständiges System** (alle 8 Agents): 5-7 Tage
- **Production-Ready mit Testing**: 2-3 Wochen

### Q7: Was kostet der Betrieb pro Monat?
**A:**
- n8n Cloud: $20-50
- OpenAI API: $50-200 (je nach Volumen)
- Hunter.io: $49 (5k enrichments)
- Google Workspace: $0 (Sheets API kostenlos)
- **Total:** ~$120-300/Monat

### Q8: Brauche ich Programmierkenntnisse?
**A:**
- **Setup:** Nein (n8n ist No-Code/Low-Code)
- **Anpassungen:** Ja (JavaScript für Custom Logic)
- **Betrieb:** Nein (alles via UI verwaltbar)

### Q9: Gibt es fertige n8n JSON Workflows?
**A:** Aktuell: Nein. Die Templates sind Markdown-Dokumentationen. Du musst Workflows manuell in n8n erstellen (30-60 min pro Workflow).
**Geplant:** Automatische JSON-Generierung (Roadmap Q1 2026)

### Q10: Was ist der Unterschied zu einem CRM wie Salesforce?
**A:** WiesLogic ist ein **AI-First Automation System**, kein klassisches CRM:
- ✅ Vollautomatische Prozesse (Lead Scoring, Technical Analysis, Quotation)
- ✅ Multi-Brand & Multi-Customer
- ✅ Leichtgewichtig (Google Sheets statt komplexer DB)
- ❌ Keine UI für Sales Team (nur Admin)
- ❌ Weniger Flexibilität als Enterprise CRM

**Use Case:** Ergänzung zu CRM oder Ersatz für kleine/mittelgroße Unternehmen

---

## 📞 Support & Weiterentwicklung

### Dokumentation
- **Hauptdokumentation:** Dieses File (`COMPLETE_SYSTEM_GUIDE.md`)
- **Agent-Details:** `workflows/AI_*_AGENT.md` (8 Files)
- **Konfiguration:** `config/`
- **Kompatibilität:** `docs/COMPATIBILITY_ANALYSIS.md`

### Repository
- **GitHub:** `HNTRLEGEND/SocialMediaManager`
- **Pfad:** `wieslogic-agent-system/`

### Roadmap
- ✅ **Q4 2025:** Alle 8 Agent-Templates
- 🔄 **Q1 2026:** n8n JSON Workflow Generator
- 🔄 **Q1 2026:** Admin Dashboard (Monitoring UI)
- 🔄 **Q2 2026:** Additional Agents (Accounting, HR-Integration)

---

**Version:** 2025.10.2
**Letzte Aktualisierung:** 26. Oktober 2025
**Status:** ✅ Production Ready

---

🎉 **Gratulation!** Du hast jetzt ein komplettes AI-gesteuertes Multi-Customer System für Sales, Marketing und Service. Viel Erfolg beim Deployment!
