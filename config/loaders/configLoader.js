/**
 * Universal Config Loader (JavaScript/Node.js Version für n8n)
 *
 * Lädt Client-spezifische Konfigurationen mit Fallback auf Default.
 * Unterstützt Environment-Variable Replacement.
 *
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class ConfigLoader {
  constructor(configDir) {
    this.configsCache = new Map();
    this.configDir = configDir || path.join(__dirname, '../clients');
  }

  /**
   * Lädt eine Config für einen spezifischen Client
   *
   * @param {string} clientKey - Der Client-Identifier (z.B. 'SEINE', 'HNTR', 'MEYPACK')
   * @param {boolean} useCache - Ob Cache verwendet werden soll (default: true)
   * @returns {Object|null} Die vollständige Config oder null bei Fehler
   */
  loadConfig(clientKey, useCache = true) {
    // Cache-Check
    if (useCache && this.configsCache.has(clientKey)) {
      return this.configsCache.get(clientKey);
    }

    try {
      const configPath = path.join(this.configDir, `${clientKey.toLowerCase()}.config.json`);

      // Prüfen ob Client-Config existiert
      if (!fs.existsSync(configPath)) {
        console.warn(`Config für Client '${clientKey}' nicht gefunden. Lade Default-Config.`);
        return this.loadDefaultConfig();
      }

      // Config laden
      const rawConfig = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(rawConfig);

      // Environment-Variablen ersetzen
      const processedConfig = this.replaceEnvVars(config);

      // In Cache speichern
      if (useCache) {
        this.configsCache.set(clientKey, processedConfig);
      }

      return processedConfig;
    } catch (error) {
      console.error(`Fehler beim Laden der Config für '${clientKey}':`, error);
      return this.loadDefaultConfig();
    }
  }

  /**
   * Lädt die Default-Config als Fallback
   */
  loadDefaultConfig() {
    try {
      const defaultPath = path.join(this.configDir, 'default.config.json');
      const rawConfig = fs.readFileSync(defaultPath, 'utf-8');
      const config = JSON.parse(rawConfig);
      return this.replaceEnvVars(config);
    } catch (error) {
      console.error('Fehler beim Laden der Default-Config:', error);
      return null;
    }
  }

  /**
   * Lädt alle verfügbaren Configs
   */
  loadAllConfigs() {
    const configs = new Map();

    try {
      const files = fs.readdirSync(this.configDir);
      const configFiles = files.filter((f) => f.endsWith('.config.json') && f !== 'default.config.json');

      for (const file of configFiles) {
        const clientKey = file.replace('.config.json', '').toUpperCase();
        const config = this.loadConfig(clientKey, false);
        if (config) {
          configs.set(clientKey, config);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden aller Configs:', error);
    }

    return configs;
  }

  /**
   * Ersetzt Environment-Variablen im Format {{ $env.VAR_NAME }}
   */
  replaceEnvVars(obj) {
    if (typeof obj === 'string') {
      // Regex für {{ $env.VAR_NAME }}
      const envVarPattern = /\{\{\s*\$env\.(\w+)\s*\}\}/g;
      return obj.replace(envVarPattern, (match, varName) => {
        return process.env[varName] || match; // Falls nicht gefunden, Original behalten
      });
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceEnvVars(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const key in obj) {
        result[key] = this.replaceEnvVars(obj[key]);
      }
      return result;
    }

    return obj;
  }

  /**
   * Validiert eine Config (Basis-Validation)
   */
  validateConfig(config) {
    const errors = [];
    const warnings = [];

    // Company Validation
    if (!config.company?.name) errors.push('company.name ist erforderlich');
    if (!config.company?.brand) errors.push('company.brand ist erforderlich');
    if (!config.company?.crm_sheet_id) warnings.push('company.crm_sheet_id fehlt');

    // Workflow Validation
    if (!config.workflow?.ai?.model) errors.push('workflow.ai.model ist erforderlich');
    if (!config.workflow?.lead_id_prefix) errors.push('workflow.lead_id_prefix ist erforderlich');

    // Technical Validation
    if (!config.technical) {
      warnings.push('Keine technischen Parameter definiert');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Cache leeren
   */
  clearCache() {
    this.configsCache.clear();
  }

  /**
   * Spezifischen Cache-Eintrag löschen
   */
  clearCacheFor(clientKey) {
    this.configsCache.delete(clientKey);
  }
}

// Singleton-Instance für einfache Nutzung
const configLoader = new ConfigLoader();

// Helper-Funktionen für direkten Import
function getConfig(clientKey) {
  return configLoader.loadConfig(clientKey);
}

function getAllConfigs() {
  return configLoader.loadAllConfigs();
}

function validateConfig(config) {
  return configLoader.validateConfig(config);
}

// Exports
module.exports = {
  ConfigLoader,
  configLoader,
  getConfig,
  getAllConfigs,
  validateConfig
};
