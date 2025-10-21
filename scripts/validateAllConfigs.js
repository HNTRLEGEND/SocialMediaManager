#!/usr/bin/env node

/**
 * Validation Script für alle Configs
 *
 * Lädt alle Client-Configs und validiert sie gegen das Schema.
 * Nutze dieses Script vor dem Commit oder in CI/CD.
 *
 * Usage:
 *   node scripts/validateAllConfigs.js
 *   npm run validate
 */

const fs = require('fs');
const path = require('path');

// JSON Schema Validator (einfache Implementation ohne externe Dependency)
class SimpleValidator {
  validateConfig(config) {
    const errors = [];
    const warnings = [];

    // Company Validation
    if (!config.company) {
      errors.push('Missing "company" section');
    } else {
      if (!config.company.name) errors.push('company.name is required');
      if (!config.company.brand) errors.push('company.brand is required');
      if (!config.company.domain) errors.push('company.domain is required');
      if (!config.company.country || !/^[A-Z]{2}$/.test(config.company.country)) {
        errors.push('company.country must be 2-letter ISO code (e.g. DE)');
      }
      if (!config.company.language || !/^[a-z]{2}$/.test(config.company.language)) {
        errors.push('company.language must be 2-letter ISO code (e.g. de)');
      }
      if (!config.company.currency || !/^[A-Z]{3}$/.test(config.company.currency)) {
        errors.push('company.currency must be 3-letter ISO code (e.g. EUR)');
      }
      if (!config.company.crm_sheet_id) warnings.push('company.crm_sheet_id is missing');
      if (!config.company.contact) {
        errors.push('company.contact is required');
      } else {
        if (!config.company.contact.support_email) {
          errors.push('company.contact.support_email is required');
        }
        if (!config.company.contact.phone) {
          errors.push('company.contact.phone is required');
        }
      }
      if (!config.company.google_drive) {
        errors.push('company.google_drive is required');
      }
    }

    // Workflow Validation
    if (!config.workflow) {
      errors.push('Missing "workflow" section');
    } else {
      if (!config.workflow.lead_id_prefix) errors.push('workflow.lead_id_prefix is required');
      if (!config.workflow.offer_id_prefix) errors.push('workflow.offer_id_prefix is required');
      if (!config.workflow.timezone) errors.push('workflow.timezone is required');

      if (!config.workflow.ai) {
        errors.push('workflow.ai is required');
      } else {
        if (!config.workflow.ai.model) errors.push('workflow.ai.model is required');
        if (typeof config.workflow.ai.temperature !== 'number') {
          errors.push('workflow.ai.temperature must be a number');
        }
        if (typeof config.workflow.ai.max_tokens !== 'number') {
          errors.push('workflow.ai.max_tokens must be a number');
        }
      }

      if (!config.workflow.crm_sync) {
        warnings.push('workflow.crm_sync is missing');
      }

      if (!config.workflow.performance) {
        errors.push('workflow.performance is required');
      }
    }

    // Technical Validation
    if (!config.technical) {
      warnings.push('No technical parameters defined');
    } else {
      // Check if at least one technical config exists
      const hasTechnical =
        config.technical.battery_systems ||
        config.technical.machines ||
        config.technical.pv_systems ||
        Object.keys(config.technical).length > 0;

      if (!hasTechnical) {
        warnings.push('Technical section exists but is empty');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Main Validation Logic
function validateAllConfigs() {
  const configsDir = path.join(__dirname, '../config/clients');
  const validator = new SimpleValidator();

  console.log('🔍 Validating all configs...\n');

  let totalConfigs = 0;
  let validConfigs = 0;
  let invalidConfigs = 0;

  try {
    const files = fs.readdirSync(configsDir);
    const configFiles = files.filter((f) => f.endsWith('.config.json'));

    for (const file of configFiles) {
      totalConfigs++;
      const filePath = path.join(configsDir, file);
      const clientKey = file.replace('.config.json', '').toUpperCase();

      console.log(`📄 Validating: ${clientKey} (${file})`);

      try {
        const rawConfig = fs.readFileSync(filePath, 'utf-8');
        const config = JSON.parse(rawConfig);

        const result = validator.validateConfig(config);

        if (result.valid) {
          console.log(`  ✅ Valid`);
          validConfigs++;
        } else {
          console.log(`  ❌ Invalid`);
          invalidConfigs++;
        }

        if (result.errors.length > 0) {
          console.log(`  🚨 Errors:`);
          result.errors.forEach((err) => console.log(`     - ${err}`));
        }

        if (result.warnings.length > 0) {
          console.log(`  ⚠️  Warnings:`);
          result.warnings.forEach((warn) => console.log(`     - ${warn}`));
        }

        console.log('');
      } catch (err) {
        console.log(`  ❌ Failed to parse JSON`);
        console.log(`     Error: ${err.message}\n`);
        invalidConfigs++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   Total Configs: ${totalConfigs}`);
    console.log(`   Valid: ${validConfigs}`);
    console.log(`   Invalid: ${invalidConfigs}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (invalidConfigs > 0) {
      console.log('❌ Validation failed! Please fix the errors above.\n');
      process.exit(1);
    } else {
      console.log('✅ All configs are valid!\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

// Run validation
validateAllConfigs();
