# Universal Config System

Ein zukunftssicheres, skalierbares Template-System für Multi-Client-Management mit Fokus auf technische Produktparameter (Batteriesysteme, Maschinen, Anlagen).

## 🚀 Features

- ✅ **Multi-Client fähig**: Unterstützt SEINE, HNTR, MEYPACK und beliebig viele weitere Kunden
- ✅ **Typsicher**: Vollständige TypeScript-Type-Definitions
- ✅ **n8n-optimiert**: Ready-to-use Function Node Templates
- ✅ **Flexibel erweiterbar**: Einfaches Hinzufügen neuer Parameter ohne Breaking Changes
- ✅ **Validiert**: JSON Schema für automatische Config-Validierung
- ✅ **Environment-aware**: Sichere Integration von API-Keys via Environment Variables

## 📋 Struktur

```
/config
├── /types              # TypeScript Type Definitions
├── /clients            # Client-spezifische Configs (SEINE, HNTR, MEYPACK)
├── /loaders            # Config Loader (TypeScript & JavaScript)
├── /n8n                # n8n Integration Templates
└── schema.json         # JSON Schema für Validation

/docs
├── CONFIG_GUIDE.md     # Vollständiger Guide
└── EXAMPLES.md         # Verwendungsbeispiele
```

## 🏁 Quick Start

### 1. TypeScript/Node.js

```bash
# Dependencies installieren
npm install

# Config laden und nutzen
npx ts-node
```

```typescript
import { getConfig } from './config/loaders/configLoader';

const config = getConfig('SEINE');
console.log(config.company.name); // "SEINE Batteriesysteme GmbH"
console.log(config.technical.battery_systems.efficiency); // 0.94
```

### 2. n8n Integration

1. **Function Node** erstellen → Name: `0_Config`
2. Code aus `config/n8n/0_Config_Function.js` kopieren
3. Client wählen (SEINE/HNTR/MEYPACK)
4. In anderen Nodes nutzen:

```javascript
{{ $('0_Config').json.company.brand }}
{{ $('0_Config').json.workflow.ai.model }}
{{ $('0_Config').json.technical.battery_systems.efficiency }}
```

## 🔧 Verwendungsbeispiele

### Batteriesystem-Konfiguration (SEINE)

```typescript
const config = getConfig('SEINE');

const batteryType = config.technical.battery_systems.default_type; // "LiFePO4"
const efficiency = config.technical.battery_systems.efficiency; // 0.94
const cycles = config.technical.battery_systems.cycle_life.LiFePO4; // 6000
```

### Maschinen-Konfiguration (HNTR)

```typescript
const config = getConfig('HNTR');

const voltage = config.technical.machines.default_voltage; // 400
const noiseLimit = config.technical.machines.noise_limit_db; // 75
const safetyLevel = config.technical.machines.standard_safety_level; // "PL d"
```

### Verpackungsanlagen (MEYPACK)

```typescript
const config = getConfig('MEYPACK');

const maxWeight = config.technical.packaging_specs.max_package_weight_kg; // 25
const throughput = config.technical.packaging_specs.throughput_packages_per_minute; // 60
```

## 📚 Dokumentation

- **[CONFIG_GUIDE.md](docs/CONFIG_GUIDE.md)** - Vollständiger Setup- und Verwendungs-Guide
- **[EXAMPLES.md](docs/EXAMPLES.md)** - Praktische Verwendungsbeispiele
- **[n8n Integration](config/n8n/README_N8N_INTEGRATION.md)** - n8n-spezifische Anleitung

## 🛠 Verfügbare Configs

| Client | Firma | Schwerpunkt | Config-Datei |
|--------|-------|-------------|--------------|
| **SEINE** | SEINE Batteriesysteme GmbH | Batterien, PV, Energie | `seine.config.json` |
| **HNTR** | HNTR Solutions GmbH | Maschinen, Automation | `hntr.config.json` |
| **MEYPACK** | MEYPACK Verpackungssysteme | Verpackungsanlagen | `meypack.config.json` |
| **DEFAULT** | Fallback Template | Universal | `default.config.json` |

## 🔐 Environment Variables

Erstelle eine `.env` Datei:

```bash
# API Keys
HUNTER_API_KEY=your_hunter_key
LINKEDIN_API_KEY=your_linkedin_key
SCRAPER_API_KEY=your_scraper_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 🧪 Testing

```bash
# Config laden und validieren
node -e "const { getConfig, validateConfig } = require('./config/loaders/configLoader'); \
const cfg = getConfig('SEINE'); \
const val = validateConfig(cfg); \
console.log(val.valid ? 'Config OK ✓' : val.errors);"
```

## 🎯 Use Cases

### 1. **Multi-Client Lead-Management**
Automatisches Routing von Anfragen basierend auf Client-Parametern

### 2. **Technische Kalkulation**
Batterie-Sizing, Maschinen-Auslegung, PV-Ertragsprognose

### 3. **CRM-Integration**
Automatische Synchronisation mit Google Sheets, HubSpot, etc.

### 4. **KI-gestützte Angebotserstellung**
Client-spezifische Prompts mit technischen Parametern

### 5. **Workflow-Automation (n8n)**
Zentrale Config für alle Workflows

## 📦 Installation

```bash
# Repository klonen
git clone <your-repo>
cd SocialMediaManager

# Dependencies installieren
npm install

# TypeScript kompilieren (optional)
npm run build
```

## 🤝 Neuen Client hinzufügen

1. **Config erstellen**: `config/clients/newclient.config.json` (Template von `default.config.json`)
2. **Anpassen**: Firmen-, Workflow- und Technical-Parameter
3. **Validieren**: `validateConfig(getConfig('NEWCLIENT'))`
4. **Nutzen**: `getConfig('NEWCLIENT')` oder in n8n Function Node

## 🔄 Update-Strategie

```json
{
  "metadata": {
    "version": "1.0.0",
    "last_updated": "2025-10-21",
    "updated_by": "Dein Name"
  }
}
```

## 📈 Roadmap

- [ ] Web-UI für Config-Management
- [ ] Automatische Validation Webhooks
- [ ] REST API für Config-Zugriff
- [ ] Weitere Client-Templates
- [ ] Migration-Scripts für Breaking Changes

## 💡 Support

- **Dokumentation**: [docs/CONFIG_GUIDE.md](docs/CONFIG_GUIDE.md)
- **Beispiele**: [docs/EXAMPLES.md](docs/EXAMPLES.md)
- **Issues**: GitHub Issues

## 📄 Lizenz

MIT License (oder deine Wahl)

---

**Version:** 1.0.0
**Status:** Production Ready
**Letztes Update:** 2025-10-21
