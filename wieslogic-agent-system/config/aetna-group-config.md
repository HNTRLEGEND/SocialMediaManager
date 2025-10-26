# AETNA Group - Multi-Brand Configuration

## Übersicht

Die AETNA Group umfasst 5 führende Marken in der Verpackungsindustrie:

### 1. ROBOPAC (Roboter-Palettierlösungen)
**Produkte:**
- Automatische Pallet Wrapper
- Roboter-Wickelmaschinen
- Halbautomatische Wickelmaschinen
- Ring-Wickelmaschinen
- Mobile Wickelgeräte

**Kernkompetenzen:**
- Palletenwrapping
- Stretch-Folien-Technologie
- Automatisierung

**Zielgruppe:**
- Logistik & Warehousing
- Produktion & Fertigung
- E-Commerce Fulfillment

---

### 2. OCME (End-of-Line-Lösungen)
**Produkte:**
- Palletizer (Palletierer)
- Depalletizer (Depalletierer)
- Case Packer (Kartonverpackungsmaschinen)
- Wraparound Packer
- Tray Former & Sealer
- Shrink Wrapper

**Kernkompetenzen:**
- End-of-Line Automatisierung
- Sekundärverpackung
- Komplette Produktionslinien

**Zielgruppe:**
- Getränkeindustrie
- Food & Beverage
- Consumer Goods

---

### 3. PRASMATIC (Flexible Verpackungslösungen)
**Produkte:**
- Bag-in-Box Maschinen
- Liquid Filling Systems
- Aseptic Filling
- Flexible Packaging Lines

**Kernkompetenzen:**
- Flüssigkeitsverpackung
- Aseptische Abfüllung
- Flexible Verpackungen

**Zielgruppe:**
- Getränkeindustrie
- Flüssige Lebensmittel
- Chemie & Pharma

---

### 4. SOTEMAPACK (Traysealing & Thermoforming)
**Produkte:**
- Traysealing Machines
- Thermoforming Lines
- Skin Packaging
- Vacuum Packaging
- MAP (Modified Atmosphere Packaging)

**Kernkompetenzen:**
- Lebensmittelverpackung
- Haltbarkeitsverlängerung
- Hygienische Verpackung

**Zielgruppe:**
- Fleisch & Geflügel
- Milchprodukte
- Convenience Food
- Frische Produkte

---

### 5. MEYPACK (Kartonverpackungslösungen)
**Produkte:**
- Kartonierer
- Case Erector
- Case Sealer
- Tray Former
- Display Packer

**Kernkompetenzen:**
- Kartonverarbeitung
- Sekundärverpackung
- Display-Verpackungen

**Zielgruppe:**
- Retail & Consumer Goods
- E-Commerce
- Food & Beverage

---

## Produkt-Matrix

| Marke | Hauptprodukte | Technologie | Typische Geschwindigkeit |
|-------|---------------|-------------|-------------------------|
| ROBOPAC | Pallet Wrapper | Stretch Film | 60-120 pallets/hour |
| OCME | Palletizer | Pick & Place | 30-150 products/min |
| OCME | Case Packer | Robotic | 60-180 cases/hour |
| PRASMATIC | Bag-in-Box | Filling | 20-60 units/min |
| SOTEMAPACK | Traysealer | Thermoform | 30-120 trays/min |
| MEYPACK | Case Erector | Carton | 15-40 cases/min |

---

## Customer Journey per Marke

### ROBOPAC Customer
```
Need: "Wir müssen 80 Paletten pro Stunde wickeln"
↓
Lead Agent: Qualifiziert Budget, Timeline
↓
Technical Agent: Berechnet → Empfiehlt "Helix 80"
↓
Sales Agent: Erstellt Angebot mit ROI-Kalkulation
↓
Service Agent: Installation, Training, Wartung
```

### OCME Customer
```
Need: "Wir brauchen eine komplette End-of-Line für Getränke"
↓
Lead Agent: BANT Qualification
↓
Technical Agent: Analysiert Produkt, Output → Empfiehlt Palletizer + Wrapper
↓
Sales Agent: Systemlösung mit mehreren Maschinen
↓
Service Agent: Komplette Linie installieren
```

### PRASMATIC Customer
```
Need: "Aseptische Abfüllung für Fruchtsäfte"
↓
Lead Agent: Spezielle Anforderungen erfassen
↓
Technical Agent: Hygiene-Standards, Output → Bag-in-Box System
↓
Sales Agent: Maßgeschneidertes Angebot
↓
Service Agent: GMP-konforme Installation
```

### SOTEMAPACK Customer
```
Need: "Frischfleisch länger haltbar machen"
↓
Lead Agent: Food-Safety Anforderungen
↓
Technical Agent: MAP-Technologie, Durchsatz → Traysealer
↓
Sales Agent: Mit Folienkalkulation
↓
Service Agent: HACCP-konforme Installation
```

### MEYPACK Customer
```
Need: "Kartons automatisch aufrichten und befüllen"
↓
Lead Agent: E-Commerce / Retail Anforderungen
↓
Technical Agent: Kartonformat, Durchsatz → Case Erector
↓
Sales Agent: Angebot mit Karton-ROI
↓
Service Agent: Installation und Schulung
```

---

## Gemeinsame Google Sheet Struktur

### Sheet: 00_🏢_AETNA_Group_Overview
```
| Brand | Active | Products | Target Markets | Sheet_Prefix |
|-------|--------|----------|----------------|--------------|
| ROBOPAC | Yes | Pallet Wrapper | Logistics | RBP_ |
| OCME | Yes | Palletizer, Case Packer | Beverage | OCM_ |
| PRASMATIC | Yes | Bag-in-Box, Filling | Liquid Food | PRS_ |
| SOTEMAPACK | Yes | Traysealer, Thermoform | Fresh Food | STM_ |
| MEYPACK | Yes | Case Erector, Sealer | Retail | MEY_ |
```

### Sheet: 01_📋Inquiries_Log
```
| Timestamp | Inquiry_ID | Brand | Company | Contact | Product_Interest | Status |
|-----------|-----------|-------|---------|---------|------------------|--------|
| 2025-10-26 | INQ_001 | ROBOPAC | Logistics Inc | John | Pallet Wrapper | qualified |
| 2025-10-26 | INQ_002 | OCME | Beverage Co | Jane | Palletizer | technical |
```

### Sheet: 06_📦Product_Portfolio
```
| Product_ID | Brand | Category | Model | Speed | Base_Price |
|-----------|-------|----------|-------|-------|-----------|
| RBP_001 | ROBOPAC | Wrapper | Helix 80 | 80 pph | 45000 |
| OCM_001 | OCME | Palletizer | Artis 120 | 120 ppm | 180000 |
| PRS_001 | PRASMATIC | Bag-in-Box | BiB Pro 40 | 40 upm | 95000 |
| STM_001 | SOTEMAPACK | Traysealer | TS 500 | 60 tpm | 120000 |
| MEY_001 | MEYPACK | Case Erector | CE 300 | 30 cpm | 35000 |
```

---

## Agent Konfiguration per Marke

### Lead Agent
**Alle Marken:** Gemeinsamer Workflow, brand-spezifische Qualifikationsfragen

```javascript
{
  "ROBOPAC": {
    "key_questions": [
      "Wie viele Paletten pro Stunde?",
      "Aktueller Wickelprozess?",
      "Palettengewicht & -höhe?"
    ],
    "min_budget": 25000
  },
  "OCME": {
    "key_questions": [
      "End-of-Line Anforderungen?",
      "Produkte pro Minute?",
      "Bestehende Linie?"
    ],
    "min_budget": 100000
  },
  "PRASMATIC": {
    "key_questions": [
      "Welche Flüssigkeiten?",
      "Hygiene-Anforderungen?",
      "Tagesproduktion?"
    ],
    "min_budget": 75000
  },
  "SOTEMAPACK": {
    "key_questions": [
      "Welche Lebensmittel?",
      "Haltbarkeitsanforderungen?",
      "Durchsatz?"
    ],
    "min_budget": 80000
  },
  "MEYPACK": {
    "key_questions": [
      "Kartonformate?",
      "Durchsatz?",
      "Manuell oder automatisch?"
    ],
    "min_budget": 30000
  }
}
```

### Technical Agent
**Pro Marke:** Spezifische Berechnungen und Produktempfehlungen

### Sales Agent
**Pro Marke:** Marken-spezifische Preisgestaltung und Angebote

---

## System-Architektur für AETNA Group

```
┌────────────────────────────────────────────────────────────┐
│              AI_WIESLOGIC_MASTER (Orchestrator)            │
│                                                            │
│  Brand Router → Detects brand from inquiry/domain         │
└──────────┬─────────────────────────────────────────────────┘
           │
           ├─────▶ ROBOPAC Pipeline
           │       ├─ Lead Agent (Pallet Wrapper Focus)
           │       ├─ Technical Agent (Wrapping Calculations)
           │       ├─ Sales Agent (Wrapping Quotes)
           │       └─ Service Agent (Installation)
           │
           ├─────▶ OCME Pipeline
           │       ├─ Lead Agent (End-of-Line Focus)
           │       ├─ Technical Agent (Palletizer Calculations)
           │       ├─ Sales Agent (System Quotes)
           │       └─ Service Agent (Full Line Setup)
           │
           ├─────▶ PRASMATIC Pipeline
           │       ├─ Lead Agent (Liquid Focus)
           │       ├─ Technical Agent (Filling Calculations)
           │       ├─ Sales Agent (Aseptic Quotes)
           │       └─ Service Agent (GMP Installation)
           │
           ├─────▶ SOTEMAPACK Pipeline
           │       ├─ Lead Agent (Fresh Food Focus)
           │       ├─ Technical Agent (Traysealing Calculations)
           │       ├─ Sales Agent (MAP Quotes)
           │       └─ Service Agent (HACCP Setup)
           │
           └─────▶ MEYPACK Pipeline
                   ├─ Lead Agent (Carton Focus)
                   ├─ Technical Agent (Case Erector Calc)
                   ├─ Sales Agent (Carton Quotes)
                   └─ Service Agent (Standard Setup)
```

---

## Marketing Agents für AETNA Group

### AI_LEAD_GENERATOR
- **Pro Marke:** Generiert Leads basierend auf Branchen
- **ROBOPAC:** Logistics, Warehousing, E-Commerce
- **OCME:** Beverage, Food & Beverage
- **PRASMATIC:** Liquid Food, Dairy, Juice
- **SOTEMAPACK:** Fresh Meat, Poultry, Dairy
- **MEYPACK:** Retail, E-Commerce, Consumer Goods

### AI_CONTENT_AGENT
- **Pro Marke:** Erstellt marken-spezifischen Content
- Blog-Posts, Case Studies, White Papers
- Technische Artikel, ROI-Rechner
- Video-Scripte, Social Media Posts

### AI_MARKETING_AGENT
- **Marken-übergreifend:** Kampagnen-Management
- Lead Nurturing Campaigns
- Email Marketing
- Social Media Management
- Event Marketing

---

## Deployment-Strategie

### Phase 1: ROBOPAC (bereits begonnen)
- ✅ Lead/Technical/Sales Agents
- ✅ Product Calculators
- ⏳ Service Agent
- ⏳ Marketing Agents

### Phase 2: OCME (parallel)
- ⏳ Spezifische Calculators
- ⏳ Brand-spezifische Workflows
- ⏳ Integration mit ROBOPAC Master

### Phase 3: PRASMATIC, SOTEMAPACK, MEYPACK
- ⏳ Alle Calculators
- ⏳ Alle Workflows
- ⏳ Komplette Integration

### Phase 4: AETNA Group Master
- ⏳ Übergreifendes Reporting
- ⏳ Cross-Selling Opportunities
- ⏳ Gemeinsame Marketing Campaigns

---

## Nächste Schritte

1. ✅ Alle Workflow-Templates erstellen
2. ✅ Product Calculators für alle 5 Marken
3. ✅ Master Controller mit Brand-Routing
4. ✅ Marketing Agents (Lead Gen, Content, Marketing)
5. ✅ AETNA-Group übergreifende Dashboards

---

**Version:** 2025.10.2
**Status:** In Entwicklung
**Ziel:** Q4 2025 - Alle 5 Marken vollständig integriert
