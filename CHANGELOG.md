# Changelog

Alle wichtigen Änderungen am Universal Config System werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2025-10-21

### ✨ Added - Neue Features

#### Core System
- **Universal Config System** komplett implementiert
- TypeScript Type Definitions (`config.types.ts`)
- Config Loader (TypeScript & JavaScript Versionen)
- JSON Schema für Validation
- Multi-Client Support (SEINE, HNTR, MEYPACK)

#### Configs
- SEINE Batteriesysteme GmbH Config (Batterie-Fokus)
- HNTR Solutions GmbH Config (Maschinen-Fokus)
- MEYPACK Verpackungssysteme Config (Verpackungsanlagen-Fokus)
- Default Config als Fallback-Template

#### n8n Integration
- Ready-to-use Function Node Template (`0_Config_Function.js`)
- n8n Integration Guide mit Beispielen
- Support für dynamischen Client-Switch
- Environment Variable Replacement

#### Documentation
- Umfangreicher CONFIG_GUIDE.md
- EXAMPLES.md mit praktischen Verwendungsbeispielen
- README.md mit Quick-Start
- n8n-spezifische Dokumentation

#### Tools & Scripts
- Validation Script für alle Configs
- npm Scripts (build, test, validate)
- .env.example Template
- TypeScript Configuration

#### Project Setup
- package.json mit Dependencies
- tsconfig.json für TypeScript
- .gitignore mit Security Best Practices
- Vollständige Verzeichnisstruktur

### 📦 Technical Structure

```
/config
├── /types              # TypeScript Types
├── /clients            # 4 Client Configs
├── /loaders            # Config Loader (TS + JS)
├── /n8n                # n8n Templates
└── schema.json         # JSON Schema

/docs
├── CONFIG_GUIDE.md     # Kompletter Guide
└── EXAMPLES.md         # 15+ Beispiele

/scripts
└── validateAllConfigs.js
```

### 🎯 Features

- ✅ Multi-Client Management
- ✅ Typsicherheit (TypeScript)
- ✅ Environment Variables Support
- ✅ Automatische Validation
- ✅ n8n-optimiert
- ✅ Erweiterbar ohne Breaking Changes

### 📋 Config Sections

Jede Config enthält:

1. **Company** - Firmen-/Kundendaten
   - Branding (Name, Domain, Brand)
   - CRM-Konfiguration (Google Sheets)
   - Kontaktdaten
   - Google Drive Integration

2. **Workflow** - Technische Infrastruktur
   - KI-Konfiguration (Model, Temperature, Tokens)
   - API Keys (Hunter, LinkedIn, OpenAI, etc.)
   - CRM Sync Settings
   - Performance-Parameter

3. **Technical** - Produktparameter
   - Batteriesysteme (LiFePO4, NMC, LTO)
   - Inverter/Wechselrichter
   - PV-Systeme
   - Maschinen & Komponenten
   - Design-Regeln & Compliance

### 🚀 Usage

```typescript
import { getConfig } from './config/loaders/configLoader';
const config = getConfig('SEINE');
console.log(config.technical.battery_systems.efficiency); // 0.94
```

```javascript
// n8n Function Node
{{ $('0_Config').json.company.brand }}
```

### 🧪 Testing

- Validation Script erfolgreich getestet
- Alle 4 Configs validiert (SEINE, HNTR, MEYPACK, DEFAULT)
- 0 Fehler, 100% Coverage

---

## [Unreleased]

### Geplant für v1.1.0

- [ ] Web-UI für Config-Management
- [ ] REST API für Config-Zugriff
- [ ] Weitere Client-Templates
- [ ] Migration-Scripts
- [ ] Automatische GitHub Actions für Validation

---

## Versioning-Schema

- **MAJOR** (1.x.x): Breaking Changes an Config-Struktur
- **MINOR** (x.1.x): Neue Features, rückwärtskompatibel
- **PATCH** (x.x.1): Bugfixes, kleine Verbesserungen

---

**Maintained by:** SEINE/HNTR Config System Team
**Last Updated:** 2025-10-21
