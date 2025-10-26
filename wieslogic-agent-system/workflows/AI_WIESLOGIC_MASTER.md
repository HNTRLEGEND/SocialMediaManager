# AI_WIESLOGIC_MASTER - Central Orchestration System

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** Zentraler Orchestrator für alle WiesLogic Agents mit AETNA Group Multi-Brand Support

---

## 📋 Übersicht

Der **AI_WIESLOGIC_MASTER** ist das Herzstück des gesamten WiesLogic Agent Systems. Er:

✅ **Empfängt alle eingehenden Anfragen** (Webhook Entry Point)
✅ **Erkennt automatisch die AETNA Marke** (ROBOPAC, OCME, PRASMATIC, SOTEMAPACK, MEYPACK)
✅ **Prüft verfügbare Agents** (welche Agents hat der Kunde gekauft?)
✅ **Routet zum richtigen Agent** (intelligente Fallback-Logik)
✅ **Monitored alle Ausführungen** (Logging & Health Checks)

---

## 🔄 Workflow-Ablauf

```
Webhook → Validate → Load Config → Detect Brand → Check Agents → Route → Execute → Log
```

**Beispiel-Flow:**
```
1. Anfrage kommt rein: "Ich brauche einen Palettenwrapper"
2. MASTER erkennt: Brand = ROBOPAC
3. MASTER prüft: Kunde hat Lead + Technical + Sales Agent
4. MASTER routet: → Lead Agent
5. Lead Agent qualifiziert → routet zurück zu MASTER
6. MASTER routet: → Technical Agent
7. Technical Agent analysiert → routet zurück zu MASTER
8. MASTER routet: → Sales Agent
9. Alles wird geloggt in 13_📑_Master_Log
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger (`00_webhook_trigger`)

**Typ:** Webhook
**Path:** `/wieslogic-master`
**Method:** POST

**Erwartetes Payload:**
```json
{
  "action": "process_inquiry|trigger_lead_agent|trigger_technical_agent|...",
  "customer_id": "AETNA_GROUP_001",
  "brand": "ROBOPAC", // Optional, wird automatisch erkannt
  "data": {
    // Inquiry-Daten oder Agent-spezifische Daten
    "company_name": "Logistics GmbH",
    "product_type": "Pallet Wrapper",
    "required_pallets_per_hour": 80
  }
}
```

**Konfiguration:**
```javascript
{
  "httpMethod": "POST",
  "path": "wieslogic-master",
  "responseMode": "responseNode",
  "authentication": "headerAuth",
  "options": {
    "rawBody": false
  }
}
```

---

### Node 2: Validate Input (`05_validate_input`)

**Typ:** Code (JavaScript)
**Purpose:** Validiert eingehende Anfrage und wirft Fehler bei Problemen

**Code:**
```javascript
/**
 * INPUT VALIDATION
 * Prüft ob alle erforderlichen Felder vorhanden sind
 */

// Liste der erforderlichen Felder
const requiredFields = ['action', 'customer_id'];
const missingFields = [];

// Prüfe jedes erforderliche Feld
for (const field of requiredFields) {
  if (!$input.item.json[field]) {
    missingFields.push(field);
  }
}

// Fehler werfen wenn Felder fehlen
if (missingFields.length > 0) {
  throw new Error(`❌ Missing required fields: ${missingFields.join(', ')}`);
}

// Validiere Action
const validActions = [
  'process_inquiry',           // Neue Anfrage verarbeiten
  'trigger_lead_agent',        // Direkt Lead Agent starten
  'trigger_technical_agent',   // Direkt Technical Agent starten
  'trigger_sales_agent',       // Direkt Sales Agent starten
  'trigger_service_agent',     // Direkt Service Agent starten
  'trigger_lead_generator',    // Marketing: Lead Gen
  'trigger_content_agent',     // Marketing: Content
  'trigger_marketing_agent',   // Marketing: Campaigns
  'trigger_personal_assistant',// Personal Assistant
  'health_check'               // System Health Check
];

if (!validActions.includes($input.item.json.action)) {
  throw new Error(`❌ Invalid action: ${$input.item.json.action}. Valid actions: ${validActions.join(', ')}`);
}

// Generiere eindeutige Execution ID
const executionId = `MASTER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Erfolgreiche Validierung
return {
  json: {
    ...$input.item.json,
    validated: true,
    timestamp: new Date().toISOString(),
    master_execution_id: executionId,
    validation_status: 'success'
  }
};
```

**Output:**
```json
{
  "action": "process_inquiry",
  "customer_id": "AETNA_GROUP_001",
  "data": { ... },
  "validated": true,
  "timestamp": "2025-10-26T10:30:00Z",
  "master_execution_id": "MASTER_1730023800_abc123xyz",
  "validation_status": "success"
}
```

---

### Node 3: Load Client Configuration (`10_load_client_config`)

**Typ:** Google Sheets (Read)
**Sheet:** `17_🔍_Client_Config`
**Purpose:** Lädt Kundenkonfiguration (welche Agents sind aktiv?)

**Konfiguration:**
```javascript
{
  "operation": "read",
  "sheetId": "={{ $env.GOOGLE_SHEET_ID }}",
  "sheetName": "17_🔍_Client_Config",
  "filtersUI": {
    "values": [
      {
        "lookupColumn": "customer_name",
        "lookupValue": "={{ $json.customer_id }}"
      }
    ]
  },
  "options": {
    "returnAllMatches": false  // Nur erste Zeile
  }
}
```

**Gelesene Spalten:**
- `customer_name` - Kundenname
- `active_modules` - Komma-getrennte Liste aktiver Module (z.B. "lead,technical,sales,marketing")
- `api_key_openai` - OpenAI API Key
- `api_key_hunterio` - Hunter.io API Key
- `language` - Präferierte Sprache
- `timezone` - Zeitzone

**Beispiel Output:**
```json
{
  "customer_name": "AETNA_GROUP_001",
  "active_modules": "lead,technical,sales,assistant",
  "api_key_openai": "sk-...",
  "language": "de",
  "timezone": "Europe/Berlin"
}
```

---

### Node 4: Detect AETNA Brand (`15_detect_brand`)

**Typ:** Code (JavaScript)
**Purpose:** Erkennt automatisch welche AETNA Marke basierend auf Produkttyp

**Code:**
```javascript
/**
 * AETNA BRAND DETECTION
 * Erkennt automatisch die Marke basierend auf:
 * - Explizite Marken-Angabe
 * - Produkttyp
 * - Industrie/Kategorie
 */

const inquiry = $input.item.json;
const config = $input.item.json.client_config || {};

/**
 * Haupt-Detektions-Funktion
 */
function detectBrand(data) {
  const productType = (data.product_type || data.primary_product_type || '').toLowerCase();
  const category = (data.category || data.requested_packaging_category || '').toLowerCase();
  const brand = (data.brand || '').toUpperCase();

  // 1. EXPLIZITE MARKEN-ANGABE
  if (['ROBOPAC', 'OCME', 'PRASMATIC', 'SOTEMAPACK', 'MEYPACK'].includes(brand)) {
    return brand;
  }

  // 2. ROBOPAC - Pallet Wrapping
  if (productType.includes('wrapper') ||
      productType.includes('stretch') ||
      productType.includes('pallet wrap') ||
      category.includes('wrapping')) {
    return 'ROBOPAC';
  }

  // 3. OCME - End-of-Line Solutions
  if (productType.includes('palletizer') ||
      productType.includes('depalletizer') ||
      productType.includes('case packer') ||
      category.includes('end-of-line') ||
      category.includes('palletizing')) {
    return 'OCME';
  }

  // 4. PRASMATIC - Flexible Packaging / Liquid Filling
  if (productType.includes('bag-in-box') ||
      productType.includes('filling') ||
      productType.includes('aseptic') ||
      category.includes('liquid') ||
      category.includes('flexible')) {
    return 'PRASMATIC';
  }

  // 5. SOTEMAPACK - Traysealing / Thermoforming
  if (productType.includes('tray') ||
      productType.includes('thermoform') ||
      productType.includes('map') ||
      productType.includes('skin') ||
      category.includes('fresh') ||
      category.includes('sealing')) {
    return 'SOTEMAPACK';
  }

  // 6. MEYPACK - Case Erecting / Cartonizing
  if (productType.includes('case erector') ||
      productType.includes('carton') ||
      productType.includes('case sealer') ||
      category.includes('retail') ||
      category.includes('e-commerce')) {
    return 'MEYPACK';
  }

  // DEFAULT: ROBOPAC (größte Marke)
  return 'ROBOPAC';
}

// Marke erkennen
const detectedBrand = detectBrand(inquiry);

/**
 * MARKEN-SPEZIFISCHE KONFIGURATIONEN
 * Jede Marke hat eigene Business Rules
 */
const brandConfigs = {
  'ROBOPAC': {
    name: 'ROBOPAC',
    description: 'Pallet Wrapping Solutions',
    primary_products: ['Pallet Wrapper', 'Stretch Wrapper', 'Ring Wrapper'],
    min_budget_eur: 25000,
    avg_deal_size_eur: 45000,
    target_industries: ['Logistics', 'Warehousing', 'E-Commerce', 'Manufacturing'],
    lead_qualification_threshold: 60,
    typical_sales_cycle_days: 45,
    key_decision_criteria: ['throughput', 'film_savings', 'automation_level']
  },
  'OCME': {
    name: 'OCME',
    description: 'End-of-Line Solutions',
    primary_products: ['Palletizer', 'Depalletizer', 'Case Packer', 'Wraparound'],
    min_budget_eur: 100000,
    avg_deal_size_eur: 180000,
    target_industries: ['Beverage', 'Food & Beverage', 'Consumer Goods', 'Pharma'],
    lead_qualification_threshold: 70,
    typical_sales_cycle_days: 90,
    key_decision_criteria: ['speed', 'flexibility', 'integration']
  },
  'PRASMATIC': {
    name: 'PRASMATIC',
    description: 'Flexible Packaging & Liquid Filling',
    primary_products: ['Bag-in-Box', 'Filling Systems', 'Aseptic Filling'],
    min_budget_eur: 75000,
    avg_deal_size_eur: 95000,
    target_industries: ['Liquid Food', 'Dairy', 'Juice', 'Wine'],
    lead_qualification_threshold: 65,
    typical_sales_cycle_days: 60,
    key_decision_criteria: ['hygiene', 'filling_accuracy', 'product_shelf_life']
  },
  'SOTEMAPACK': {
    name: 'SOTEMAPACK',
    description: 'Traysealing & Thermoforming',
    primary_products: ['Traysealer', 'Thermoforming', 'MAP', 'Skin Packaging'],
    min_budget_eur: 80000,
    avg_deal_size_eur: 120000,
    target_industries: ['Fresh Meat', 'Poultry', 'Fish', 'Dairy', 'Convenience Food'],
    lead_qualification_threshold: 65,
    typical_sales_cycle_days: 60,
    key_decision_criteria: ['food_safety', 'shelf_life', 'package_appearance']
  },
  'MEYPACK': {
    name: 'MEYPACK',
    description: 'Case Erecting & Cartonizing',
    primary_products: ['Case Erector', 'Case Sealer', 'Tray Former', 'Display Packer'],
    min_budget_eur: 30000,
    avg_deal_size_eur: 35000,
    target_industries: ['Retail', 'E-Commerce', 'Consumer Goods', 'Food'],
    lead_qualification_threshold: 55,
    typical_sales_cycle_days: 30,
    key_decision_criteria: ['speed', 'format_flexibility', 'ease_of_use']
  }
};

// Ausgabe mit erkannter Marke und Config
return {
  json: {
    ...inquiry,
    brand: detectedBrand,
    brand_config: brandConfigs[detectedBrand],
    brand_detection_confidence: detectedBrand === inquiry.brand ? 'explicit' : 'automatic',
    client_config: config
  }
};
```

**Output:**
```json
{
  "brand": "ROBOPAC",
  "brand_config": {
    "name": "ROBOPAC",
    "min_budget_eur": 25000,
    "primary_products": ["Pallet Wrapper", ...],
    ...
  },
  "brand_detection_confidence": "automatic"
}
```

---

### Node 5: Check Agent Availability (`20_check_agent_availability`)

**Typ:** Code (JavaScript)
**Purpose:** Prüft welche Agents für diesen Kunden verfügbar sind

**Code:**
```javascript
/**
 * AGENT AVAILABILITY CHECK
 * Prüft welche Agents der Kunde gekauft hat
 * und bestimmt den nächsten Agent im Flow
 */

const clientConfig = $input.item.json.client_config || {};
const activeModules = (clientConfig.active_modules || '').split(',').map(m => m.trim());

console.log('🔍 Checking agent availability for customer:', $input.item.json.customer_id);
console.log('📋 Active modules:', activeModules);

/**
 * AGENT AVAILABILITY MAP
 * Welche Agents sind für diesen Kunden aktiv?
 */
const agentAvailability = {
  'lead_agent': activeModules.includes('lead') || activeModules.includes('all'),
  'technical_agent': activeModules.includes('technical') || activeModules.includes('all'),
  'sales_agent': activeModules.includes('sales') || activeModules.includes('all'),
  'service_agent': activeModules.includes('service') || activeModules.includes('all'),
  'lead_generator': activeModules.includes('marketing') || activeModules.includes('all'),
  'content_agent': activeModules.includes('marketing') || activeModules.includes('all'),
  'marketing_agent': activeModules.includes('marketing') || activeModules.includes('all'),
  'personal_assistant': activeModules.includes('assistant') || activeModules.includes('all')
};

console.log('✅ Agent Availability:', agentAvailability);

/**
 * DETERMINE NEXT AGENT
 * Basierend auf Action und Verfügbarkeit
 */
function getNextAgent(action, availability) {
  // Action → Agent Mapping
  const actionAgentMap = {
    'process_inquiry': 'lead_agent',              // Standard Flow
    'trigger_lead_agent': 'lead_agent',
    'trigger_technical_agent': 'technical_agent',
    'trigger_sales_agent': 'sales_agent',
    'trigger_service_agent': 'service_agent',
    'trigger_lead_generator': 'lead_generator',
    'trigger_content_agent': 'content_agent',
    'trigger_marketing_agent': 'marketing_agent',
    'trigger_personal_assistant': 'personal_assistant'
  };

  const requestedAgent = actionAgentMap[action];

  if (!requestedAgent) {
    console.log('❌ Unknown action:', action);
    return null;
  }

  console.log('🎯 Requested agent:', requestedAgent);

  // Ist der Agent verfügbar?
  if (availability[requestedAgent]) {
    console.log('✅ Agent is available');
    return requestedAgent;
  }

  console.log('⚠️ Agent not available, checking fallback...');

  /**
   * FALLBACK LOGIC
   * Was machen wir wenn ein Agent nicht verfügbar ist?
   */

  // Technical Agent nicht verfügbar → Sales Agent
  if (requestedAgent === 'technical_agent' && !availability.technical_agent) {
    if (availability.sales_agent) {
      console.log('↪️ Fallback: technical → sales');
      return 'sales_agent_with_basic_matching';  // Special flag
    }
  }

  // Sales Agent nicht verfügbar → Manual Review
  if (requestedAgent === 'sales_agent' && !availability.sales_agent) {
    console.log('↪️ Fallback: sales → manual_review');
    return 'manual_review';
  }

  // Kein Agent verfügbar
  console.log('❌ No agent available and no fallback');
  return 'agent_not_available';
}

const nextAgent = getNextAgent($input.item.json.action, agentAvailability);

// Special handling for fallback cases
const requiresBasicMatching = nextAgent === 'sales_agent_with_basic_matching';
const actualNextAgent = requiresBasicMatching ? 'sales_agent' : nextAgent;

return {
  json: {
    ...$input.item.json,
    agent_availability: agentAvailability,
    next_agent: actualNextAgent,
    requires_fallback: nextAgent === 'manual_review' || nextAgent === 'agent_not_available',
    requires_basic_matching: requiresBasicMatching,
    routing_decision: {
      requested: $input.item.json.action,
      assigned: actualNextAgent,
      reason: requiresBasicMatching ? 'Technical agent not available, using basic matching' : 'Direct routing'
    }
  }
};
```

---

### Node 6: Route to Agent (`25_route_to_agent`)

**Typ:** Switch
**Property:** `{{ $json.next_agent }}`

**Routes:**
- Output 0: `lead_agent`
- Output 1: `technical_agent`
- Output 2: `sales_agent`
- Output 3: `service_agent`
- Output 4: `lead_generator`
- Output 5: `content_agent`
- Output 6: `marketing_agent`
- Output 7: `personal_assistant`
- Output 8: `manual_review`

---

### Node 7a: Trigger Lead Agent (`30_trigger_lead_agent`)

**Typ:** HTTP Request
**Method:** POST
**URL:** `{{ $env.N8N_BASE_URL }}/webhook/lead-agent`

**Headers:**
```json
{
  "Authorization": "Bearer {{ $env.WEBHOOK_SECRET }}",
  "Content-Type": "application/json",
  "X-Customer-ID": "{{ $json.customer_id }}",
  "X-Brand": "{{ $json.brand }}",
  "X-Execution-ID": "{{ $json.master_execution_id }}"
}
```

**Body:**
```json
{
  "master_execution_id": "{{ $json.master_execution_id }}",
  "customer_id": "{{ $json.customer_id }}",
  "brand": "{{ $json.brand }}",
  "brand_config": {{ JSON.stringify($json.brand_config) }},
  "client_config": {{ JSON.stringify($json.client_config) }},
  "data": {{ JSON.stringify($json.data) }},
  "timestamp": "{{ $json.timestamp }}"
}
```

*Hinweis: Analog für alle anderen Agents (technical_agent, sales_agent, etc.)*

---

### Node 8: Log to Master Log (`35_log_to_master`)

**Typ:** Google Sheets (Append)
**Sheet:** `13_📑_Master_Log`

**Spalten-Mapping:**
```javascript
{
  "workflow_name": "AI_WIESLOGIC_MASTER",
  "workflow_id": "={{ $json.master_execution_id }}",
  "agent_type": "master_controller",
  "active_modules": "={{ $json.next_agent }}",
  "api_keys_used": "openai,google_sheets",
  "last_run": "={{ $json.timestamp }}",
  "success_rate_percent": "100",
  "notes": "={{ JSON.stringify({
    action: $json.action,
    brand: $json.brand,
    next_agent: $json.next_agent,
    customer: $json.customer_id
  }) }}"
}
```

---

## 🔧 Konfiguration

### Environment Variables

```env
# Google Sheets
GOOGLE_SHEET_ID=your_main_sheet_id

# n8n Base URL
N8N_BASE_URL=https://n8n.yourdomain.com

# Webhook Security
WEBHOOK_SECRET=your_secure_webhook_secret

# OpenAI (falls Master direkt AI nutzt)
OPENAI_API_KEY=sk-...
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Neue Inquiry verarbeiten

```bash
curl -X POST https://n8n.yourdomain.com/webhook/wieslogic-master \
  -H "Content-Type: application/json" \
  -d '{
    "action": "process_inquiry",
    "customer_id": "AETNA_GROUP_001",
    "data": {
      "company_name": "Logistics GmbH",
      "contact_person": "John Doe",
      "email": "john@logistics.de",
      "product_type": "Pallet Wrapper",
      "required_pallets_per_hour": 80
    }
  }'
```

**Flow:**
1. MASTER empfängt Request
2. Validiert Input ✅
3. Lädt Client Config (active_modules: "lead,technical,sales")
4. Erkennt Brand: ROBOPAC
5. Prüft Agents: ✅ lead_agent verfügbar
6. Routet zu: Lead Agent
7. Lead Agent verarbeitet → BANT Scoring
8. Loggt Ausführung

---

### Beispiel 2: Direkt Technical Agent triggern

```bash
curl -X POST https://n8n.yourdomain.com/webhook/wieslogic-master \
  -H "Content-Type: application/json" \
  -d '{
    "action": "trigger_technical_agent",
    "customer_id": "AETNA_GROUP_001",
    "brand": "OCME",
    "data": {
      "inquiry_id": "INQ_12345",
      "product_type": "Palletizer",
      "required_products_per_minute": 120
    }
  }'
```

---

### Beispiel 3: Fallback wenn Technical Agent deaktiviert

**Request:**
```json
{
  "action": "trigger_technical_agent",
  "customer_id": "CUSTOMER_WITHOUT_TECH",
  "data": { "inquiry_id": "INQ_99999" }
}
```

**Kunde hat nur:** lead,sales (KEIN technical)

**MASTER Verhalten:**
1. Prüft: technical_agent = false
2. Fallback: → sales_agent_with_basic_matching
3. Fügt Flag hinzu: requires_basic_matching = true
4. Sales Agent weiß: "Mache basic product matching selbst"

---

## 🩺 Health Check

**Endpoint:** `POST /webhook/wieslogic-master`

**Payload:**
```json
{
  "action": "health_check",
  "customer_id": "system"
}
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T10:30:00Z",
  "agents": {
    "lead_agent": "online",
    "technical_agent": "online",
    "sales_agent": "online"
  }
}
```

---

## 🚨 Error Handling

### Fehler: Invalid Action

**Symptom:** `Error: Invalid action: xyz`

**Lösung:** Verwende eine der gültigen Actions (siehe Node 2)

---

### Fehler: Agent Not Available

**Symptom:** `next_agent: "agent_not_available"`

**Lösung:**
1. Prüfe `17_🔍_Client_Config` → `active_modules`
2. Aktiviere den benötigten Agent oder
3. Nutze Fallback-Option

---

### Fehler: Missing Customer Config

**Symptom:** Google Sheets liefert keine Daten

**Lösung:**
1. Prüfe ob `customer_id` in `17_🔍_Client_Config` existiert
2. Erstelle neue Zeile wenn nötig

---

## 📈 Monitoring

### Wichtige Metriken

Track in `13_📑_Master_Log`:
- **Total Executions** - Wie oft wurde MASTER aufgerufen?
- **Success Rate** - % erfolgreicher Routen
- **Agent Distribution** - Welcher Agent wird am häufigsten genutzt?
- **Brand Distribution** - Welche Marke ist am aktivsten?

### Dashboard Query

```sql
SELECT
  DATE(last_run) as date,
  COUNT(*) as total_executions,
  JSON_EXTRACT(notes, '$.brand') as brand,
  JSON_EXTRACT(notes, '$.next_agent') as agent
FROM `13_📑_Master_Log`
WHERE workflow_name = 'AI_WIESLOGIC_MASTER'
GROUP BY date, brand, agent
ORDER BY date DESC
```

---

## ✅ Deployment Checklist

- [ ] n8n Workflow importiert
- [ ] Environment Variables gesetzt
- [ ] Google Sheets Credentials konfiguriert
- [ ] Webhook-URL getestet
- [ ] Client Config befüllt (`17_🔍_Client_Config`)
- [ ] Test-Request durchgeführt
- [ ] Logging funktioniert (`13_📑_Master_Log`)
- [ ] Alle Sub-Agents deployt (Lead, Technical, Sales, etc.)
- [ ] Error Handling getestet
- [ ] Health Check funktioniert

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
**Nächster Schritt:** Deploy AI_LEAD_AGENT
