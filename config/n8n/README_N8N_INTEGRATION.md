# n8n Integration Guide

## Übersicht

Dieses Dokument erklärt, wie du das Universal Config System in n8n integrierst.

## 🚀 Schnellstart

### Schritt 1: Function Node erstellen

1. Erstelle eine neue **Function Node** in deinem n8n Workflow
2. Benenne sie **"0_Config"** (die 0 sorgt dafür, dass sie zuerst ausgeführt wird)
3. Kopiere den Code aus `0_Config_Function.js` in die Function Node

### Schritt 2: Client konfigurieren

Es gibt zwei Möglichkeiten, den Client zu bestimmen:

#### Option A: Hartcodiert (empfohlen für Entwicklung)

```javascript
const HARDCODED_CLIENT = 'SEINE'; // oder 'HNTR', 'MEYPACK'
const clientKey = HARDCODED_CLIENT;
```

#### Option B: Dynamisch über Webhook/Trigger

```javascript
const clientKey = $input.json.body?.client_key ||
                  $input.json.query?.client ||
                  'SEINE'; // Fallback
```

### Schritt 3: Config in anderen Nodes nutzen

Greife auf die Config zu mit der n8n Expression-Syntax:

```javascript
// Company-Daten
{{ $('0_Config').json.company.name }}
{{ $('0_Config').json.company.brand }}
{{ $('0_Config').json.company.contact.support_email }}

// Workflow-Parameter
{{ $('0_Config').json.workflow.ai.model }}
{{ $('0_Config').json.workflow.lead_id_prefix }}

// Technische Parameter - Batterie
{{ $('0_Config').json.technical.battery_systems.efficiency }}
{{ $('0_Config').json.technical.battery_systems.default_type }}

// Technische Parameter - Maschinen
{{ $('0_Config').json.technical.machines.default_voltage }}
{{ $('0_Config').json.technical.machines.noise_limit_db }}
```

## 📋 Verwendungsbeispiele

### Beispiel 1: Lead-ID generieren

```javascript
// In einer Function Node:
const config = $('0_Config').json;
const leadId = config.workflow.lead_id_prefix + Date.now();
return { json: { leadId } };
```

### Beispiel 2: E-Mail mit Company-Daten versenden

In einer **Send Email Node**:

```
To: {{ $('0_Config').json.company.contact.support_email }}
Subject: Neue Anfrage für {{ $('0_Config').json.company.brand }}
Body: Sehr geehrtes {{ $('0_Config').json.company.name }} Team...
```

### Beispiel 3: OpenAI-Node konfigurieren

In einer **OpenAI Chat Node**:

```
Model: {{ $('0_Config').json.workflow.ai.model }}
Temperature: {{ $('0_Config').json.workflow.ai.temperature }}
Max Tokens: {{ $('0_Config').json.workflow.ai.max_tokens }}
```

### Beispiel 4: Technische Berechnung (Batterie-Sizing)

```javascript
// In einer Function Node:
const config = $('0_Config').json;
const batteryConfig = config.technical.battery_systems;

const requestedCapacity = $input.json.capacity_kwh;
const efficiency = batteryConfig.efficiency;
const usableFactor = batteryConfig.usable_capacity_factor;

const actualCapacity = requestedCapacity / (efficiency * usableFactor);

return {
  json: {
    requested_kwh: requestedCapacity,
    actual_kwh: actualCapacity,
    battery_type: batteryConfig.default_type,
    expected_cycles: batteryConfig.cycle_life[batteryConfig.default_type]
  }
};
```

### Beispiel 5: Maschinenkonfiguration validieren

```javascript
// In einer Function Node:
const config = $('0_Config').json;
const machineRules = config.technical.machine_design_rules;

const requestedPower = $input.json.power_kw;

if (requestedPower > machineRules.max_energy_consumption_kw) {
  throw new Error(
    `Leistung ${requestedPower}kW überschreitet Maximum von ${machineRules.max_energy_consumption_kw}kW`
  );
}

return { json: { valid: true, power_kw: requestedPower } };
```

## 🔄 Multi-Client Workflows

### Dynamischer Client-Switch

```javascript
// Webhook-Payload:
// POST /webhook { "client_key": "HNTR", "data": {...} }

// In 0_Config Function Node:
const clientKey = $input.json.body?.client_key || 'SEINE';
const config = configs[clientKey] || configs['SEINE'];

// Jetzt läuft der gesamte Workflow mit HNTR-Config
```

### Client-spezifische Verzweigungen

Nutze **IF/Switch Nodes** für client-spezifische Logik:

```javascript
// In einer IF Node:
{{ $('0_Config').json.company.brand }} === "SEINE"

// Dann: Batterie-spezifischer Workflow
// Sonst: Maschinen-spezifischer Workflow
```

## 📊 Google Sheets Integration

```javascript
// In einer Google Sheets Node:
Spreadsheet ID: {{ $('0_Config').json.company.crm_sheet_id }}
Sheet Name: {{ $('0_Config').json.company.crm_sheet_tab }}
```

## 🔐 Environment Variables

Die Configs nutzen n8n Environment Variables für sensible Daten:

```javascript
api_keys: {
  hunter: $env.HUNTER_API_KEY,
  openai: $env.OPENAI_API_KEY
}
```

**Setze diese in n8n:**
- Settings → Environment Variables
- Oder in `.env` Datei bei Self-Hosted

## ⚡ Performance-Tipps

1. **0_Config immer zuerst**: Platziere die Config-Node am Anfang
2. **Einmalig laden**: Die Config wird einmal geladen und im gesamten Workflow wiederverwendet
3. **Caching**: Die Configs sind statisch - kein Reload während der Ausführung nötig

## 🧪 Testing

### Test-Workflow

1. Erstelle einen einfachen Workflow:
   - **Manual Trigger** → **0_Config** → **Edit Fields Node**
2. In der Edit Fields Node:
   - Füge alle wichtigen Config-Werte als Fields hinzu
3. Führe aus und prüfe die Output-Daten

### Debug-Output

Füge eine Debug-Function Node hinzu:

```javascript
const config = $('0_Config').json;
console.log('Loaded Config:', JSON.stringify(config, null, 2));
return { json: config };
```

## 🔧 Troubleshooting

### Problem: "0_Config not found"

**Lösung:** Stelle sicher, dass die Function Node exakt "0_Config" heißt (Case-sensitive)

### Problem: Environment Variables werden nicht ersetzt

**Lösung:** In n8n nutze direkt `$env.VAR_NAME` ohne `{{ }}` in Function Nodes

### Problem: Technische Parameter fehlen

**Lösung:** Prüfe, ob der richtige Client geladen wurde:

```javascript
{{ $('0_Config').json.runtime.loaded_client }}
```

## 📚 Weitere Ressourcen

- `../clients/` - Alle Config-JSONs
- `../types/config.types.ts` - TypeScript Type Definitions
- `CONFIG_GUIDE.md` - Vollständige Dokumentation
