# Universal Config System - Verwendungsbeispiele

## 📚 Inhaltsverzeichnis

1. [Basis-Verwendung](#basis-verwendung)
2. [n8n Workflows](#n8n-workflows)
3. [Technische Berechnungen](#technische-berechnungen)
4. [Multi-Client Scenarios](#multi-client-scenarios)
5. [API-Integration](#api-integration)
6. [Custom Extensions](#custom-extensions)

---

## Basis-Verwendung

### Beispiel 1: Config laden und ausgeben

```typescript
import { getConfig } from './config/loaders/configLoader';

const config = getConfig('SEINE');

console.log('Firma:', config.company.name);
console.log('E-Mail:', config.company.contact.support_email);
console.log('KI-Modell:', config.workflow.ai.model);
```

**Output:**
```
Firma: SEINE Batteriesysteme GmbH
E-Mail: info@seine-batteriesysteme.de
KI-Modell: gpt-4o-mini
```

### Beispiel 2: Alle Clients auflisten

```javascript
const { getAllConfigs } = require('./config/loaders/configLoader');

const allConfigs = getAllConfigs();

for (const [clientKey, config] of allConfigs.entries()) {
  console.log(`${clientKey} → ${config.company.name}`);
}
```

**Output:**
```
SEINE → SEINE Batteriesysteme GmbH
HNTR → HNTR Solutions GmbH
MEYPACK → MEYPACK Verpackungssysteme GmbH
```

---

## n8n Workflows

### Beispiel 3: Lead-ID generieren

**Function Node:**

```javascript
const config = $('0_Config').json;
const timestamp = Date.now();
const randomSuffix = Math.random().toString(36).substr(2, 5).toUpperCase();

const leadId = `${config.workflow.lead_id_prefix}${timestamp}_${randomSuffix}`;

return {
  json: {
    lead_id: leadId,
    created_at: new Date().toISOString(),
    client: config.company.brand
  }
};
```

**Output:**
```json
{
  "lead_id": "LEAD_SEINE_1729536000000_X7K9Q",
  "created_at": "2025-10-21T10:30:00.000Z",
  "client": "SEINE"
}
```

### Beispiel 4: Google Sheets CRM-Update

**Google Sheets Node Settings:**

```
Spreadsheet ID: {{ $('0_Config').json.company.crm_sheet_id }}
Sheet Name: {{ $('0_Config').json.company.crm_sheet_tab }}

Row Data:
- Lead ID: {{ $json.lead_id }}
- Company: {{ $('0_Config').json.company.name }}
- Timestamp: {{ $json.created_at }}
```

### Beispiel 5: OpenAI Chat mit Config-Parametern

**OpenAI Chat Node:**

```
Model: {{ $('0_Config').json.workflow.ai.model }}
Temperature: {{ $('0_Config').json.workflow.ai.temperature }}
Max Tokens: {{ $('0_Config').json.workflow.ai.max_tokens }}

System Prompt:
Du bist ein technischer Berater für {{ $('0_Config').json.company.brand }}.
Unsere Spezialität sind {{ $('0_Config').json.technical.battery_systems.types }}.
```

---

## Technische Berechnungen

### Beispiel 6: Batterie-Sizing Kalkulation

**Function Node:**

```javascript
const config = $('0_Config').json;
const batteryConfig = config.technical.battery_systems;

// Input: Kundenanforderung
const requiredUsableCapacity = 50; // kWh

// Berechnung
const efficiency = batteryConfig.efficiency;
const usableFactor = batteryConfig.usable_capacity_factor;

const totalCapacity = requiredUsableCapacity / (efficiency * usableFactor);
const batteryType = batteryConfig.default_type;
const expectedCycles = batteryConfig.cycle_life[batteryType];
const lifespanYears = Math.floor(expectedCycles / 365); // 1 Zyklus/Tag

return {
  json: {
    input: {
      required_usable_kwh: requiredUsableCapacity
    },
    calculation: {
      total_capacity_kwh: Math.round(totalCapacity * 100) / 100,
      battery_type: batteryType,
      efficiency: efficiency,
      usable_factor: usableFactor
    },
    result: {
      recommended_capacity_kwh: Math.ceil(totalCapacity / 5) * 5, // Auf 5er runden
      expected_lifetime_cycles: expectedCycles,
      expected_lifespan_years: lifespanYears
    }
  }
};
```

**Output:**
```json
{
  "input": {
    "required_usable_kwh": 50
  },
  "calculation": {
    "total_capacity_kwh": 59.07,
    "battery_type": "LiFePO4",
    "efficiency": 0.94,
    "usable_factor": 0.9
  },
  "result": {
    "recommended_capacity_kwh": 60,
    "expected_lifetime_cycles": 6000,
    "expected_lifespan_years": 16
  }
}
```

### Beispiel 7: PV-Ertrag Schätzung

**Function Node:**

```javascript
const config = $('0_Config').json;
const pvConfig = config.technical.pv_systems;

// Input
const installedPowerKWp = 30; // kWp
const location = 'München'; // Für Beispiel

// Berechnung
const annualYieldKWh = installedPowerKWp * pvConfig.standard_yield_kwh_per_kwp;
const safetyMargin = pvConfig.default_safety_margin;
const conservativeYieldKWh = annualYieldKWh * safetyMargin;

// Degradation über 25 Jahre
const degradationPerYear = pvConfig.degradation_per_year || 0.005;
const years = 25;
const avgDegradation = 1 - (degradationPerYear * years / 2);
const lifetimeYieldKWh = conservativeYieldKWh * years * avgDegradation;

return {
  json: {
    system: {
      power_kwp: installedPowerKWp,
      location: location,
      tilt_deg: pvConfig.roof_tilt_optimum_deg,
      azimuth_deg: pvConfig.azimuth_optimum_deg
    },
    yield: {
      annual_kwh: Math.round(annualYieldKWh),
      annual_conservative_kwh: Math.round(conservativeYieldKWh),
      lifetime_25y_kwh: Math.round(lifetimeYieldKWh)
    },
    economics: {
      co2_saved_tons_25y: Math.round(lifetimeYieldKWh * 0.000401), // 401g CO2/kWh
      equivalent_trees: Math.round(lifetimeYieldKWh * 0.000401 / 0.021) // 21kg/Baum/Jahr
    }
  }
};
```

### Beispiel 8: Maschinen-Leistung validieren

**Function Node:**

```javascript
const config = $('0_Config').json;
const machineRules = config.technical.machine_design_rules;
const machineConfig = config.technical.machines;

// Input: Kundenanforderung
const requestedPowerKW = 28;
const requestedNoiseLevelDB = 80;

// Validierung
const errors = [];
const warnings = [];

if (requestedPowerKW > machineRules.max_energy_consumption_kw) {
  errors.push(
    `Leistung ${requestedPowerKW}kW überschreitet Maximum ${machineRules.max_energy_consumption_kw}kW`
  );
}

if (requestedNoiseLevelDB > machineConfig.noise_limit_db) {
  errors.push(
    `Lärmpegel ${requestedNoiseLevelDB}dB überschreitet Limit ${machineConfig.noise_limit_db}dB`
  );
}

// Empfehlungen
const motorRange = machineConfig.motor_power_range_kw;
if (requestedPowerKW < motorRange[0]) {
  warnings.push(`Leistung unter Minimum ${motorRange[0]}kW - prüfe ob Überdimensionierung`);
} else if (requestedPowerKW > motorRange[1]) {
  warnings.push(`Leistung über Maximum ${motorRange[1]}kW - mehrere Motoren erwägen`);
}

return {
  json: {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    requirements: {
      power_kw: requestedPowerKW,
      noise_db: requestedNoiseLevelDB
    },
    compliance: {
      ip_protection: machineConfig.ip_protection_min,
      safety_level: machineConfig.standard_safety_level,
      certifications: machineRules.required_certifications
    }
  }
};
```

---

## Multi-Client Scenarios

### Beispiel 9: Dynamischer Client-Switch im Workflow

**Webhook → 0_Config → Processing**

**Webhook Payload:**
```json
{
  "client_key": "HNTR",
  "request_type": "machine_quote",
  "power_kw": 15
}
```

**0_Config Function Node:**

```javascript
// Client aus Webhook extrahieren
const clientKey = $input.json.body.client_key || 'SEINE';

// Config laden
const config = configs[clientKey] || configs['SEINE'];

// Für Debugging
config.runtime = {
  selected_client: clientKey,
  original_request: $input.json.body
};

return { json: config };
```

**Processing Function Node:**

```javascript
const config = $('0_Config').json;
const request = config.runtime.original_request;

// Client-spezifische Verarbeitung
let response;

if (config.company.brand === 'HNTR') {
  // HNTR = Maschinen
  const machineConfig = config.technical.machines;
  response = {
    type: 'machine',
    voltage: machineConfig.default_voltage,
    frequency: machineConfig.default_frequency,
    power_kw: request.power_kw,
    brands: machineConfig.recommended_brands
  };
} else if (config.company.brand === 'SEINE') {
  // SEINE = Batterien
  const batteryConfig = config.technical.battery_systems;
  response = {
    type: 'battery',
    chemistry: batteryConfig.default_type,
    efficiency: batteryConfig.efficiency,
    voltage_range: batteryConfig.voltage_range
  };
}

return { json: response };
```

### Beispiel 10: Multi-Client Reporting

**Function Node:**

```javascript
const { getAllConfigs } = require('./config/loaders/configLoader');
const allConfigs = getAllConfigs();

const report = [];

for (const [clientKey, config] of allConfigs.entries()) {
  const item = {
    client: clientKey,
    company: config.company.name,
    crm_sheet: config.company.crm_sheet_id,
    ai_model: config.workflow.ai.model,
    has_battery_config: !!config.technical.battery_systems,
    has_machine_config: !!config.technical.machines
  };
  report.push(item);
}

return { json: report };
```

**Output:**
```json
[
  {
    "client": "SEINE",
    "company": "SEINE Batteriesysteme GmbH",
    "crm_sheet": "1A2B3C4D_SEINE_EXAMPLE_ID",
    "ai_model": "gpt-4o-mini",
    "has_battery_config": true,
    "has_machine_config": false
  },
  {
    "client": "HNTR",
    "company": "HNTR Solutions GmbH",
    "crm_sheet": "1X2Y3Z4A_HNTR_EXAMPLE_ID",
    "ai_model": "gpt-4o",
    "has_battery_config": false,
    "has_machine_config": true
  }
]
```

---

## API-Integration

### Beispiel 11: OpenAI API Call mit Config

```javascript
const config = $('0_Config').json;
const apiKey = config.workflow.api_keys.openai;
const aiConfig = config.workflow.ai;

const axios = require('axios');

const response = await axios.post(
  'https://api.openai.com/v1/chat/completions',
  {
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    max_tokens: aiConfig.max_tokens,
    messages: [
      {
        role: 'system',
        content: `Du bist technischer Berater für ${config.company.name}.`
      },
      {
        role: 'user',
        content: $input.json.user_question
      }
    ]
  },
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  }
);

return {
  json: {
    question: $input.json.user_question,
    answer: response.data.choices[0].message.content,
    model_used: aiConfig.model,
    company: config.company.brand
  }
};
```

### Beispiel 12: Google Drive File Upload

```javascript
const config = $('0_Config').json;
const driveConfig = config.company.google_drive;

// Nutze n8n Google Drive Node
// Node Settings:
return {
  json: {
    folder_id: driveConfig.folder_id,
    file_name: `${config.workflow.offer_id_prefix}${Date.now()}.pdf`,
    file_content: $binary.data
  }
};
```

---

## Custom Extensions

### Beispiel 13: Custom Technical Parameter hinzufügen

**Neue Config: robotics.config.json**

```json
{
  "company": { "...": "..." },
  "workflow": { "...": "..." },
  "technical": {
    "robots": {
      "types": ["Scara", "6-Achser", "Kollaborativ"],
      "default_type": "Kollaborativ",
      "max_payload_kg": 25,
      "reach_mm": 1300,
      "repeatability_mm": 0.05,
      "safety_standard": "ISO 10218",
      "recommended_brands": ["Universal Robots", "Kuka", "Fanuc"]
    },
    "robot_design_rules": {
      "min_workspace_m2": 4,
      "safety_zone_mm": 500,
      "max_cycle_time_s": 30
    }
  }
}
```

**TypeScript Type Extension:**

```typescript
// config.types.ts ergänzen
export interface RobotsConfig {
  types: string[];
  default_type: string;
  max_payload_kg: number;
  reach_mm: number;
  repeatability_mm: number;
  safety_standard: string;
  recommended_brands: string[];
}

export interface TechnicalConfig {
  // ...existing
  robots?: RobotsConfig;
  robot_design_rules?: {
    min_workspace_m2: number;
    safety_zone_mm: number;
    max_cycle_time_s: number;
  };
}
```

### Beispiel 14: Config Merge für Inheritance

```javascript
const { getConfig } = require('./config/loaders/configLoader');

function getMergedConfig(clientKey, baseKey = 'DEFAULT') {
  const baseConfig = getConfig(baseKey);
  const clientConfig = getConfig(clientKey);

  // Deep merge
  return {
    ...baseConfig,
    ...clientConfig,
    company: { ...baseConfig.company, ...clientConfig.company },
    workflow: { ...baseConfig.workflow, ...clientConfig.workflow },
    technical: { ...baseConfig.technical, ...clientConfig.technical }
  };
}

const mergedConfig = getMergedConfig('SEINE');
```

### Beispiel 15: Dynamic Config Modification (Runtime)

```javascript
const config = $('0_Config').json;

// Temporäre Anpassung für spezielle Anforderung
if ($input.json.is_priority) {
  config.workflow.performance.max_items_per_run = 10; // Erhöhe Limit
  config.workflow.ai.model = 'gpt-4o'; // Nutze besseres Modell
}

// Logging
console.log('Modified config for priority request');

return { json: config };
```

---

## Zusammenfassung

Diese Beispiele zeigen:

✅ **Basis-Operationen**: Config laden, validieren, ausgeben
✅ **n8n Integration**: Praktische Workflow-Beispiele
✅ **Berechnungen**: Technische Sizing- und Validierungs-Logik
✅ **Multi-Client**: Dynamisches Switching und Reporting
✅ **APIs**: Integration mit externen Services
✅ **Extensions**: Custom Technical Parameters hinzufügen

Für weitere Fragen siehe [CONFIG_GUIDE.md](./CONFIG_GUIDE.md).

**Version:** 1.0.0
**Letztes Update:** 2025-10-21
