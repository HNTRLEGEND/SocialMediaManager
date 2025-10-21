/**
 * Universal Config Type Definitions
 *
 * Dieses Modul definiert die komplette Typsicherheit für das Multi-Client Config System.
 * Geeignet für: Batteriesysteme, Maschinen, Anlagen, und jede technische Produktlinie.
 *
 * @version 1.0.0
 * @author SEINE/HNTR Config System
 */

// ==================== COMPANY CONFIG ====================

export interface CompanyContact {
  support_email: string;
  phone: string;
  sales_email?: string;
  technical_support?: string;
}

export interface GoogleDriveConfig {
  folder_id: string;
  templates_folder: string;
  exports_folder?: string;
  archives_folder?: string;
}

export interface CompanyConfig {
  name: string;
  brand: string;
  domain: string;
  country: string;
  language: string;
  currency: string;
  crm_customer_id_prefix: string;
  crm_sheet_id: string;
  crm_sheet_tab: string;
  contact: CompanyContact;
  google_drive: GoogleDriveConfig;
  timezone?: string;
  vat_id?: string;
  registration_number?: string;
}

// ==================== WORKFLOW CONFIG ====================

export interface AIConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  fallback_model?: string;
  streaming?: boolean;
}

export interface APIKeys {
  hunter?: string;
  linkedin?: string;
  scraper?: string;
  openai?: string;
  anthropic?: string;
  [key: string]: string | undefined;
}

export interface CRMSyncConfig {
  enabled: boolean;
  method: 'google_sheets' | 'airtable' | 'hubspot' | 'custom';
  counter_tab?: string;
  sync_interval_minutes?: number;
  batch_size?: number;
}

export interface PerformanceConfig {
  scraper_timeout_ms: number;
  max_items_per_run: number;
  retry_attempts?: number;
  backoff_multiplier?: number;
  max_concurrent_requests?: number;
}

export interface WorkflowConfig {
  lead_id_prefix: string;
  offer_id_prefix: string;
  timezone: string;
  ai: AIConfig;
  api_keys: APIKeys;
  crm_sync: CRMSyncConfig;
  performance: PerformanceConfig;
}

// ==================== TECHNICAL CONFIG ====================

// Batterie-Systeme
export interface BatterySystemsConfig {
  types: string[];
  default_type: string;
  efficiency: number;
  usable_capacity_factor: number;
  temperature_limits: {
    min: number;
    max: number;
  };
  voltage_range: {
    min: number;
    max: number;
  };
  cycle_life: {
    [batteryType: string]: number;
  };
  safety_certifications?: string[];
  warranty_years?: number;
}

// Inverter/Wechselrichter
export interface InvertersConfig {
  default_efficiency: number;
  max_ac_output_kw: number;
  mppt_voltage_range: [number, number];
  recommended_brands: string[];
  grid_connection_types?: string[];
  protection_class?: string;
}

// PV-Systeme
export interface PVSystemsConfig {
  standard_yield_kwh_per_kwp: number;
  roof_tilt_optimum_deg: number;
  azimuth_optimum_deg: number;
  default_safety_margin: number;
  module_types?: string[];
  degradation_per_year?: number;
}

// Design-Regeln für Energiesysteme
export interface EnergyDesignRules {
  max_battery_to_pv_ratio: number;
  min_autarky_factor: number;
  voltage_tolerance: number;
  recommended_backup_time_hours: number;
  max_string_length?: number;
  min_distance_to_roof_edge_m?: number;
}

// Maschinen-Konfiguration
export interface MachinesConfig {
  default_voltage: number;
  default_frequency: number;
  default_air_pressure_bar: number;
  motor_power_range_kw: [number, number];
  max_conveyor_speed_m_per_min?: number;
  temperature_operating_range: {
    min: number;
    max: number;
  };
  ip_protection_min: string;
  noise_limit_db: number;
  standard_safety_level: string;
  recommended_brands: string[];
  maintenance_interval_months?: number;
}

// Komponenten
export interface ComponentsConfig {
  sensor_types: string[];
  default_safety_margin_percent: number;
  material_options: string[];
  actuator_types?: string[];
  controller_brands?: string[];
}

// Design-Regeln für Maschinen
export interface MachineDesignRules {
  max_energy_consumption_kw: number;
  target_efficiency_percent: number;
  maintenance_interval_months: number;
  required_certifications: string[];
  max_footprint_m2?: number;
  min_accessibility_clearance_m?: number;
}

// Gesamte Technical Config
export interface TechnicalConfig {
  // Energie/Batterie-Bereich
  battery_systems?: BatterySystemsConfig;
  inverters?: InvertersConfig;
  pv_systems?: PVSystemsConfig;
  energy_design_rules?: EnergyDesignRules;

  // Maschinen/Anlagen-Bereich
  machines?: MachinesConfig;
  components?: ComponentsConfig;
  machine_design_rules?: MachineDesignRules;

  // Erweiterbare Custom Fields
  [key: string]: any;
}

// ==================== MASTER CONFIG ====================

export interface UniversalConfig {
  company: CompanyConfig;
  workflow: WorkflowConfig;
  technical: TechnicalConfig;
  metadata?: {
    version: string;
    last_updated: string;
    updated_by: string;
    environment?: 'production' | 'staging' | 'development';
  };
}

// ==================== MULTI-CLIENT CONFIG ====================

export interface ClientConfigs {
  [clientKey: string]: UniversalConfig;
}

// ==================== VALIDATION HELPERS ====================

export type ConfigValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

// ==================== DEFAULTS ====================

export const DEFAULT_PERFORMANCE: PerformanceConfig = {
  scraper_timeout_ms: 8000,
  max_items_per_run: 3,
  retry_attempts: 3,
  backoff_multiplier: 2,
  max_concurrent_requests: 5
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  max_tokens: 2000,
  streaming: false
};
