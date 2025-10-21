# Universal Config System - Kompletter Guide

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Architektur](#architektur)
3. [Installation & Setup](#installation--setup)
4. [Config-Struktur](#config-struktur)
5. [Verwendung](#verwendung)
6. [n8n Integration](#n8n-integration)
7. [Erweiterte Konzepte](#erweiterte-konzepte)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Überblick

Das **Universal Config System** ist ein zukunftssicheres, skalierbares Template-System für die zentrale Verwaltung von:

- **Unternehmens-/Kundenparametern** (Branding, CRM, Kontakte)
- **Workflow-Konfiguration** (APIs, KI-Modelle, Performance)
- **Technischen Produktparametern** (Batterien, Maschinen, Anlagen)

### ✨ Hauptmerkmale

- **Multi-Client fähig**: Ein System für SEINE, HNTR, MEYPACK und beliebig viele weitere Kunden
- **Typsicher**: Vollständige TypeScript-Unterstützung
- **n8n-optimiert**: Direkt nutzbar in n8n Function Nodes
- **Erweiterbar**: Einfaches Hinzufügen neuer Parameter ohne Breaking Changes
- **Validiert**: JSON Schema für automatische Validierung
- **Environment-aware**: Unterstützt Environment Variables für sensible Daten

---

## Architektur

```
/config
├── /types              # TypeScript Type Definitions
│   └── config.types.ts
├── /clients            # Client-spezifische Configs
│   ├── seine.config.json
│   ├── hntr.config.json
│   ├── meypack.config.json
│   └── default.config.json
├── /loaders            # Config Loader Logic
│   ├── configLoader.ts  (TypeScript)
│   └── configLoader.js  (JavaScript/n8n)
├── /n8n                # n8n Integration Templates
│   ├── 0_Config_Function.js
│   └── README_N8N_INTEGRATION.md
└── schema.json         # JSON Schema für Validation

/docs
├── CONFIG_GUIDE.md     # Dieser Guide
└── EXAMPLES.md         # Verwendungsbeispiele
```

### Dateifluss

```
Client-Request
    ↓
Config Loader (lädt JSON basierend auf Client-Key)
    ↓
Environment Variable Replacement
    ↓
Validation (optional)
    ↓
Bereitstellung für Workflow/Application
```

---

## Installation & Setup

### 1. Repository klonen

```bash
git clone <your-repo>
cd SocialMediaManager
```

### 2. Dependencies installieren (für TypeScript/Node.js)

```bash
npm install
# oder
yarn install
```

### 3. Environment Variables setzen

Erstelle eine `.env` Datei im Projekt-Root:

```bash
# API Keys
HUNTER_API_KEY=your_hunter_key
LINKEDIN_API_KEY=your_linkedin_key
SCRAPER_API_KEY=your_scraper_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Custom Keys
CUSTOM_API_KEY=your_custom_key
```

### 4. Erste Config testen

```bash
# TypeScript
npx ts-node -e "import { getConfig } from './config/loaders/configLoader'; console.log(getConfig('SEINE'));"

# JavaScript
node -e "const { getConfig } = require('./config/loaders/configLoader'); console.log(getConfig('SEINE'));"
```

---

## Config-Struktur

Jede Config besteht aus drei Hauptbereichen:

### 1. Company (Unternehmens-/Kundenparameter)

```json
{
  "company": {
    "name": "SEINE Batteriesysteme GmbH",
    "brand": "SEINE",
    "domain": "seine-batteriesysteme.de",
    "country": "DE",
    "language": "de",
    "currency": "EUR",
    "crm_customer_id_prefix": "SEINE",
    "crm_sheet_id": "1A2B3C4D...",
    "crm_sheet_tab": "Leads_Master",
    "contact": {
      "support_email": "info@seine-batteriesysteme.de",
      "phone": "+49 123 456 789"
    },
    "google_drive": {
      "folder_id": "19Af1239XYZ...",
      "templates_folder": "1B2C3D..."
    }
  }
}
```

**Verwendung:**
- Branding (Firmenname, Logo-Pfad)
- CRM-Integration (Sheet-IDs, Präfixe)
- Kontaktdaten für automatische E-Mails
- Google Drive Organisation

### 2. Workflow (technische Infrastruktur)

```json
{
  "workflow": {
    "lead_id_prefix": "LEAD_SEINE_",
    "offer_id_prefix": "OFFER_SEINE_",
    "timezone": "Europe/Berlin",
    "ai": {
      "model": "gpt-4o-mini",
      "temperature": 0.3,
      "max_tokens": 2000
    },
    "api_keys": {
      "hunter": "{{ $env.HUNTER_API_KEY }}",
      "openai": "{{ $env.OPENAI_API_KEY }}"
    },
    "crm_sync": {
      "enabled": true,
      "method": "google_sheets",
      "counter_tab": "Counter"
    },
    "performance": {
      "scraper_timeout_ms": 8000,
      "max_items_per_run": 3,
      "retry_attempts": 3
    }
  }
}
```

**Verwendung:**
- KI-Modell-Konfiguration
- API-Key-Management
- Performance-Tuning
- CRM-Sync-Einstellungen

### 3. Technical (Produkt-/Maschinendaten)

#### Beispiel: Batteriesysteme

```json
{
  "technical": {
    "battery_systems": {
      "types": ["LiFePO4", "LTO", "NMC"],
      "default_type": "LiFePO4",
      "efficiency": 0.94,
      "usable_capacity_factor": 0.9,
      "temperature_limits": { "min": -10, "max": 45 },
      "voltage_range": { "min": 48, "max": 800 },
      "cycle_life": {
        "LiFePO4": 6000,
        "NMC": 4000,
        "LTO": 15000
      }
    },
    "inverters": {
      "default_efficiency": 0.97,
      "max_ac_output_kw": 50,
      "mppt_voltage_range": [250, 600]
    },
    "pv_systems": {
      "standard_yield_kwh_per_kwp": 950,
      "roof_tilt_optimum_deg": 30
    },
    "energy_design_rules": {
      "max_battery_to_pv_ratio": 2.0,
      "min_autarky_factor": 0.6,
      "voltage_tolerance": 0.05
    }
  }
}
```

#### Beispiel: Maschinen/Anlagen

```json
{
  "technical": {
    "machines": {
      "default_voltage": 400,
      "default_frequency": 50,
      "default_air_pressure_bar": 6,
      "motor_power_range_kw": [0.5, 45],
      "temperature_operating_range": { "min": 5, "max": 40 },
      "ip_protection_min": "IP54",
      "noise_limit_db": 75
    },
    "components": {
      "sensor_types": ["Induktiv", "Optisch", "Ultraschall"],
      "material_options": ["Edelstahl", "Aluminium"]
    },
    "machine_design_rules": {
      "max_energy_consumption_kw": 25,
      "target_efficiency_percent": 92,
      "required_certifications": ["CE", "ISO 13849-1"]
    }
  }
}
```

---

## Verwendung

### TypeScript/Node.js

```typescript
import { getConfig, validateConfig } from './config/loaders/configLoader';

// Config laden
const config = getConfig('SEINE');

if (config) {
  // Company-Daten
  console.log(config.company.name); // "SEINE Batteriesysteme GmbH"

  // Workflow-Parameter
  console.log(config.workflow.ai.model); // "gpt-4o-mini"

  // Technische Parameter
  const efficiency = config.technical.battery_systems?.efficiency; // 0.94
  console.log(efficiency);

  // Validierung
  const validation = validateConfig(config);
  if (!validation.valid) {
    console.error('Config-Fehler:', validation.errors);
  }
}
```

### JavaScript/CommonJS

```javascript
const { getConfig, getAllConfigs } = require('./config/loaders/configLoader');

// Einzelne Config
const seineConfig = getConfig('SEINE');
console.log(seineConfig.company.brand); // "SEINE"

// Alle Configs
const allConfigs = getAllConfigs();
for (const [clientKey, config] of allConfigs.entries()) {
  console.log(`${clientKey}: ${config.company.name}`);
}
```

### n8n Function Node

```javascript
// In 0_Config Function Node
const clientKey = 'SEINE';
const config = configs[clientKey];
return { json: config };

// In anderen Nodes
{{ $('0_Config').json.company.brand }}
{{ $('0_Config').json.technical.battery_systems.efficiency }}
```

---

## n8n Integration

Siehe [n8n Integration Guide](../config/n8n/README_N8N_INTEGRATION.md) für Details.

### Quick-Start

1. **Function Node erstellen** → Name: "0_Config"
2. **Code einfügen** aus `config/n8n/0_Config_Function.js`
3. **Client wählen** (SEINE, HNTR, MEYPACK)
4. **In Workflow nutzen** mit `{{ $('0_Config').json.* }}`

---

## Erweiterte Konzepte

### Multi-Client Management

```javascript
// Dynamischer Client-Switch basierend auf Webhook
const clientKey = $input.json.body?.client_key || 'SEINE';
const config = configs[clientKey] || configs['SEINE'];
```

### Custom Technical Parameters

Du kannst beliebige technische Parameter hinzufügen:

```json
{
  "technical": {
    "custom_product_line": {
      "parameter_1": "value",
      "parameter_2": 123,
      "sub_config": {
        "nested": "data"
      }
    }
  }
}
```

### Environment Variable Replacement

Der Config Loader ersetzt automatisch:

```json
{
  "api_keys": {
    "custom": "{{ $env.MY_API_KEY }}"
  }
}
```

wird zu:

```json
{
  "api_keys": {
    "custom": "actual_key_from_env"
  }
}
```

### Config Validation

```typescript
import { validateConfig } from './config/loaders/configLoader';

const config = getConfig('SEINE');
const result = validateConfig(config);

if (!result.valid) {
  console.error('Fehler:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('Warnungen:', result.warnings);
}
```

---

## Best Practices

### 1. Naming Conventions

- **Client-Keys**: Immer UPPERCASE (`SEINE`, `HNTR`)
- **Config-Files**: Lowercase mit `.config.json` (`seine.config.json`)
- **Präfixe**: Klar und eindeutig (`LEAD_SEINE_`, `OFFER_HNTR_`)

### 2. Secrets Management

- ❌ **NIEMALS** API-Keys direkt in JSON speichern
- ✅ **IMMER** Environment Variables nutzen
- ✅ `.env` in `.gitignore` aufnehmen

### 3. Versionierung

```json
{
  "metadata": {
    "version": "1.2.0",
    "last_updated": "2025-10-21",
    "updated_by": "Max Mustermann"
  }
}
```

### 4. Dokumentation

- Dokumentiere Custom Technical Parameters
- Erkläre spezielle Design-Regeln
- Halte Kommentare in JSON-Schemas (wenn möglich)

### 5. Testing

Teste neue Configs immer:

```bash
node -e "const { getConfig, validateConfig } = require('./config/loaders/configLoader'); \
const cfg = getConfig('NEWCLIENT'); \
const val = validateConfig(cfg); \
console.log(val.valid ? 'OK' : val.errors);"
```

---

## Troubleshooting

### Problem: Config wird nicht geladen

**Symptom:** `null` oder `undefined` zurückgegeben

**Lösung:**
1. Prüfe Client-Key (Case-sensitive!)
2. Stelle sicher, dass `clientname.config.json` existiert
3. Validiere JSON-Syntax (JSON Linter nutzen)

### Problem: Environment Variables werden nicht ersetzt

**Symptom:** `{{ $env.VAR_NAME }}` bleibt im String

**Lösung:**
1. Prüfe, ob Variable in `.env` gesetzt ist
2. Bei n8n: Nutze direkt `$env.VAR_NAME` (ohne `{{ }}`)
3. Restart der Applikation nach `.env`-Änderungen

### Problem: TypeScript-Fehler

**Symptom:** `Type 'X' is not assignable to type 'Y'`

**Lösung:**
1. Prüfe `config.types.ts` auf korrekte Typen
2. Stelle sicher, dass JSON-Config dem Schema entspricht
3. Nutze `optional` Properties (`?`) wo sinnvoll

### Problem: JSON Schema Validation schlägt fehl

**Symptom:** Validation-Errors beim Laden

**Lösung:**
1. Nutze Online JSON Schema Validator
2. Prüfe required fields
3. Validiere Datentypen (number vs string)

---

## Nächste Schritte

1. **Neue Clients hinzufügen**
   - Kopiere `default.config.json`
   - Passe Werte an
   - Speichere als `clientname.config.json`

2. **Custom Technical Parameters**
   - Erweitere `config.types.ts`
   - Füge zu `schema.json` hinzu
   - Dokumentiere in `EXAMPLES.md`

3. **n8n Workflows erstellen**
   - Siehe [n8n Integration Guide](../config/n8n/README_N8N_INTEGRATION.md)
   - Nutze Templates aus `/config/n8n`

4. **Validation automatisieren**
   - Implementiere Pre-Commit Hooks
   - Nutze CI/CD für automatische Tests

---

## Support & Contribution

- **Issues:** GitHub Issues nutzen
- **Docs:** Weitere Beispiele in `/docs/EXAMPLES.md`
- **Updates:** Regelmäßig `git pull` für neueste Features

**Version:** 1.0.0
**Letztes Update:** 2025-10-21
