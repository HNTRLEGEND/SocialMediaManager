/**
 * WiesLogic Sheet Mapping Helper
 * Version: 2025.10.2
 *
 * Centralized sheet name management for multi-customer deployments
 * Ensures all agents use correct Google Sheets tab names
 */

class SheetMapper {
  constructor(customerId = 'default') {
    this.customerId = customerId;
    this.mappings = this.loadMappings();
  }

  /**
   * Standard sheet mappings for Robopac/AETNA Group
   * These are the correct tab names in the Robopac_Database
   */
  loadMappings() {
    return {
      default: {
        // Lead Management Sheets
        inquiries: '01_📋Inquiries_Log',
        quotations: '02💰Quotation_Options',
        customer_profile: '03🔍Customer_Profile',
        reports: '04📑Reports',
        service_log: '05📑Service_Log',

        // Product Data Sheets
        product_portfolio: '06📦Product_Portfolio',
        mechanical_specs: '07⚙️Mechanical_Specs',
        electrical_specs: '08🔌Electrical_Specs',
        packaging_specs: '09🎞️Packaging_Process_Specs',

        // Activity Tracking
        marketing_log: '10📑Marketing_Activity_Log',
        chart_data: '12_📈Chart_Data',

        // System Logs
        master_log: '13📑Master_Log',
        performance_log: '14🔍Performance_Log',
        health_log: '15🔍System_Health_Log',
        evaluation_log: '16_Evaluation_Log',

        // Configuration
        client_config: '17🔍Client_Config',
        lead_intelligence: '19🔍_Lead_Intelligence_Log'
      }
    };
  }

  /**
   * Get sheet name for a logical sheet identifier
   */
  getSheet(logicalName) {
    const customerMappings = this.mappings[this.customerId] || this.mappings.default;
    const sheetName = customerMappings[logicalName];

    if (!sheetName) {
      throw new Error(`Unknown sheet identifier: ${logicalName} for customer: ${this.customerId}`);
    }

    return sheetName;
  }

  /**
   * Get multiple sheet names at once
   */
  getSheets(logicalNames) {
    const result = {};
    logicalNames.forEach(name => {
      result[name] = this.getSheet(name);
    });
    return result;
  }

  /**
   * Add custom mapping for a specific customer
   */
  addCustomerMapping(customerId, mappings) {
    this.mappings[customerId] = {
      ...this.mappings.default,
      ...mappings
    };
  }

  /**
   * Get all sheet names for current customer
   */
  getAllSheets() {
    return this.mappings[this.customerId] || this.mappings.default;
  }

  /**
   * Validate that all required sheets exist in mapping
   */
  validateRequiredSheets(requiredSheets) {
    const customerMappings = this.mappings[this.customerId] || this.mappings.default;
    const missing = [];

    requiredSheets.forEach(sheet => {
      if (!customerMappings[sheet]) {
        missing.push(sheet);
      }
    });

    if (missing.length > 0) {
      throw new Error(`Missing required sheet mappings: ${missing.join(', ')}`);
    }

    return true;
  }
}

/**
 * Agent-specific sheet requirements
 */
const AGENT_SHEET_REQUIREMENTS = {
  lead_agent: [
    'inquiries',
    'customer_profile',
    'master_log',
    'lead_intelligence',
    'client_config'
  ],
  technical_agent: [
    'inquiries',
    'product_portfolio',
    'mechanical_specs',
    'electrical_specs',
    'packaging_specs',
    'evaluation_log',
    'master_log',
    'client_config'
  ],
  sales_agent: [
    'inquiries',
    'quotations',
    'customer_profile',
    'reports',
    'master_log',
    'client_config'
  ],
  service_agent: [
    'service_log',
    'customer_profile',
    'master_log',
    'client_config'
  ]
};

/**
 * Helper function for n8n workflows
 * Returns sheet configuration for a specific agent
 */
function getAgentSheets(agentName, customerId = 'default') {
  const mapper = new SheetMapper(customerId);
  const requiredSheets = AGENT_SHEET_REQUIREMENTS[agentName];

  if (!requiredSheets) {
    throw new Error(`Unknown agent: ${agentName}`);
  }

  mapper.validateRequiredSheets(requiredSheets);
  return mapper.getSheets(requiredSheets);
}

/**
 * Generate Google Sheets range string
 */
function buildRange(sheetName, startRow = 2, endRow = null, columns = null) {
  let range = `'${sheetName}'!`;

  if (columns) {
    range += columns;
  } else {
    range += 'A';
  }

  range += startRow;

  if (endRow) {
    if (columns) {
      range += `:${columns.split(':')[1] || columns}${endRow}`;
    } else {
      range += `:Z${endRow}`;
    }
  }

  return range;
}

/**
 * Create append range (for adding new rows)
 */
function buildAppendRange(sheetName, columns = 'A:Z') {
  return `'${sheetName}'!${columns}`;
}

/**
 * Standardized column mappings for each sheet
 */
const COLUMN_MAPPINGS = {
  inquiries: {
    timestamp: 'A',
    inquiry_id: 'B',
    company_name: 'C',
    contact_name: 'D',
    email: 'E',
    phone: 'F',
    product_interest: 'G',
    message: 'H',
    source: 'I',
    status: 'J',
    assigned_agent: 'K',
    lead_score: 'L',
    next_action: 'M'
  },
  quotations: {
    timestamp: 'A',
    quotation_id: 'B',
    inquiry_id: 'C',
    company_name: 'D',
    product_type: 'E',
    model: 'F',
    quantity: 'G',
    base_price: 'H',
    discount_percent: 'I',
    final_price: 'J',
    valid_until: 'K',
    status: 'L',
    created_by: 'M'
  },
  customer_profile: {
    customer_id: 'A',
    company_name: 'B',
    industry: 'C',
    company_size: 'D',
    annual_revenue: 'E',
    address: 'F',
    country: 'G',
    website: 'H',
    linkedin: 'I',
    decision_maker: 'J',
    technical_contact: 'K',
    procurement_contact: 'L'
  },
  product_portfolio: {
    product_id: 'A',
    category: 'B',
    model_name: 'C',
    description: 'D',
    base_price: 'E',
    lead_time_weeks: 'F',
    warranty_years: 'G',
    availability: 'H',
    datasheet_url: 'I',
    image_url: 'J'
  },
  mechanical_specs: {
    product_id: 'A',
    model_name: 'B',
    throughput_min: 'C',
    throughput_max: 'D',
    dimensions_l: 'E',
    dimensions_w: 'F',
    dimensions_h: 'G',
    weight_kg: 'H',
    max_payload_kg: 'I',
    speed_setting: 'J'
  },
  electrical_specs: {
    product_id: 'A',
    model_name: 'B',
    voltage: 'C',
    frequency: 'D',
    power_kw: 'E',
    phase: 'F',
    protection_class: 'G',
    control_voltage: 'H'
  },
  packaging_specs: {
    product_id: 'A',
    model_name: 'B',
    min_product_size: 'C',
    max_product_size: 'D',
    min_speed_ppm: 'E',
    max_speed_ppm: 'F',
    film_type: 'G',
    changeover_time_min: 'H'
  },
  master_log: {
    timestamp: 'A',
    log_id: 'B',
    customer_id: 'C',
    agent_name: 'D',
    action: 'E',
    inquiry_id: 'F',
    status: 'G',
    details: 'H',
    error_message: 'I'
  },
  health_log: {
    timestamp: 'A',
    check_id: 'B',
    system_status: 'C',
    agent_status: 'D',
    error_count: 'E',
    warning_count: 'F',
    response_time_ms: 'G',
    details: 'H'
  },
  evaluation_log: {
    timestamp: 'A',
    evaluation_id: 'B',
    inquiry_id: 'C',
    product_type: 'D',
    technical_score: 'E',
    feasibility: 'F',
    recommended_model: 'G',
    confidence: 'H',
    notes: 'I'
  }
};

/**
 * Get column letter for a field
 */
function getColumn(sheetType, fieldName) {
  const mapping = COLUMN_MAPPINGS[sheetType];
  if (!mapping || !mapping[fieldName]) {
    throw new Error(`Unknown column: ${fieldName} in sheet type: ${sheetType}`);
  }
  return mapping[fieldName];
}

/**
 * Build cell reference
 */
function buildCell(sheetName, row, fieldName, sheetType) {
  const column = getColumn(sheetType, fieldName);
  return `'${sheetName}'!${column}${row}`;
}

/**
 * Export for n8n usage
 */
module.exports = {
  SheetMapper,
  AGENT_SHEET_REQUIREMENTS,
  COLUMN_MAPPINGS,
  getAgentSheets,
  buildRange,
  buildAppendRange,
  getColumn,
  buildCell
};

/**
 * Usage examples for n8n workflows:
 *
 * // Example 1: Get all sheets for Lead Agent
 * const sheets = getAgentSheets('lead_agent', 'ROBOPAC_AETNA_001');
 * console.log(sheets.inquiries); // Output: '01_📋Inquiries_Log'
 *
 * // Example 2: Build a range to read data
 * const mapper = new SheetMapper('ROBOPAC_AETNA_001');
 * const sheetName = mapper.getSheet('inquiries');
 * const range = buildRange(sheetName, 2, 100); // Read rows 2-100
 *
 * // Example 3: Append data to a sheet
 * const appendRange = buildAppendRange(sheetName);
 * // Use appendRange in Google Sheets append operation
 *
 * // Example 4: Get specific cell
 * const cell = buildCell(sheetName, 5, 'company_name', 'inquiries');
 * // Output: '01_📋Inquiries_Log'!C5
 */
