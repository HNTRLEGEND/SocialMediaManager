/**
 * n8n Function Node: 0_Config
 *
 * Diese Function Node lädt die Client-spezifische Config und stellt sie
 * für alle nachfolgenden Nodes im Workflow zur Verfügung.
 *
 * VERWENDUNG:
 * 1. Diese Function Node als erste Node im Workflow platzieren (Name: "0_Config")
 * 2. Client-Key über Webhook/Trigger übergeben ODER hartcodieren
 * 3. In anderen Nodes zugreifen mit: {{ $('0_Config').json.company.name }}
 *
 * BEISPIEL-ZUGRIFFE:
 * - {{ $('0_Config').json.company.brand }}
 * - {{ $('0_Config').json.workflow.ai.model }}
 * - {{ $('0_Config').json.technical.battery_systems.efficiency }}
 * - {{ $('0_Config').json.technical.machines.default_voltage }}
 */

// ========== KONFIGURATION ==========

// Option 1: Hartcodierter Client
const HARDCODED_CLIENT = 'SEINE'; // Ändere dies zu 'HNTR', 'MEYPACK' etc.

// Option 2: Client aus Input-Daten (z.B. Webhook)
// const clientKey = $input.json.body?.client_key || $input.json.query?.client || HARDCODED_CLIENT;

// Für dieses Beispiel: Nutze Option 1
const clientKey = HARDCODED_CLIENT;

// ========== CONFIG DEFINITIONEN ==========

// Alle Configs inline definiert (kopiere deine JSON-Configs hier rein)
const configs = {
  SEINE: {
    company: {
      name: "SEINE Batteriesysteme GmbH",
      brand: "SEINE",
      domain: "seine-batteriesysteme.de",
      country: "DE",
      language: "de",
      currency: "EUR",
      crm_customer_id_prefix: "SEINE",
      crm_sheet_id: "1A2B3C4D_SEINE_EXAMPLE_ID",
      crm_sheet_tab: "Leads_Master",
      timezone: "Europe/Berlin",
      contact: {
        support_email: "info@seine-batteriesysteme.de",
        phone: "+49 123 456 789",
        sales_email: "vertrieb@seine-batteriesysteme.de"
      },
      google_drive: {
        folder_id: "19Af1239XYZ_SEINE_DRIVE",
        templates_folder: "1B2C3D_SEINE_TEMPLATES"
      }
    },
    workflow: {
      lead_id_prefix: "LEAD_SEINE_",
      offer_id_prefix: "OFFER_SEINE_",
      timezone: "Europe/Berlin",
      ai: {
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 2000
      },
      api_keys: {
        hunter: $env.HUNTER_API_KEY,
        linkedin: $env.LINKEDIN_API_KEY,
        scraper: $env.SCRAPER_API_KEY,
        openai: $env.OPENAI_API_KEY
      },
      crm_sync: {
        enabled: true,
        method: "google_sheets",
        counter_tab: "Counter"
      },
      performance: {
        scraper_timeout_ms: 8000,
        max_items_per_run: 3
      }
    },
    technical: {
      battery_systems: {
        types: ["LiFePO4", "LTO", "NMC"],
        default_type: "LiFePO4",
        efficiency: 0.94,
        usable_capacity_factor: 0.9,
        temperature_limits: { min: -10, max: 45 },
        voltage_range: { min: 48, max: 800 },
        cycle_life: {
          LiFePO4: 6000,
          NMC: 4000,
          LTO: 15000
        }
      },
      inverters: {
        default_efficiency: 0.97,
        max_ac_output_kw: 50,
        mppt_voltage_range: [250, 600],
        recommended_brands: ["SMA", "Fronius", "Victron"]
      },
      pv_systems: {
        standard_yield_kwh_per_kwp: 950,
        roof_tilt_optimum_deg: 30,
        azimuth_optimum_deg: 180,
        default_safety_margin: 0.9
      },
      energy_design_rules: {
        max_battery_to_pv_ratio: 2.0,
        min_autarky_factor: 0.6,
        voltage_tolerance: 0.05,
        recommended_backup_time_hours: 4
      }
    }
  },

  HNTR: {
    company: {
      name: "HNTR Solutions GmbH",
      brand: "HNTR",
      domain: "hntr-solutions.com",
      country: "DE",
      language: "de",
      currency: "EUR",
      crm_customer_id_prefix: "HNTR",
      crm_sheet_id: "1X2Y3Z4A_HNTR_EXAMPLE_ID",
      crm_sheet_tab: "Leads_Master",
      timezone: "Europe/Berlin",
      contact: {
        support_email: "support@hntr-solutions.com",
        phone: "+49 987 654 321"
      },
      google_drive: {
        folder_id: "19Bf2345ABC_HNTR_DRIVE",
        templates_folder: "1C3D4E_HNTR_TEMPLATES"
      }
    },
    workflow: {
      lead_id_prefix: "LEAD_HNTR_",
      offer_id_prefix: "OFFER_HNTR_",
      timezone: "Europe/Berlin",
      ai: {
        model: "gpt-4o",
        temperature: 0.4,
        max_tokens: 3000
      },
      api_keys: {
        hunter: $env.HUNTER_API_KEY,
        openai: $env.OPENAI_API_KEY
      },
      crm_sync: {
        enabled: true,
        method: "google_sheets",
        counter_tab: "Counter"
      },
      performance: {
        scraper_timeout_ms: 10000,
        max_items_per_run: 5
      }
    },
    technical: {
      machines: {
        default_voltage: 400,
        default_frequency: 50,
        default_air_pressure_bar: 6,
        motor_power_range_kw: [0.5, 45],
        max_conveyor_speed_m_per_min: 120,
        temperature_operating_range: { min: 5, max: 40 },
        ip_protection_min: "IP54",
        noise_limit_db: 75,
        standard_safety_level: "PL d",
        recommended_brands: ["Festo", "SEW", "Siemens"]
      },
      components: {
        sensor_types: ["Induktiv", "Optisch", "Ultraschall"],
        default_safety_margin_percent: 15,
        material_options: ["Edelstahl", "Aluminium", "Kunststoff"]
      },
      machine_design_rules: {
        max_energy_consumption_kw: 25,
        target_efficiency_percent: 92,
        maintenance_interval_months: 12,
        required_certifications: ["CE", "ISO 13849-1"]
      }
    }
  },

  MEYPACK: {
    company: {
      name: "MEYPACK Verpackungssysteme GmbH",
      brand: "MEYPACK",
      domain: "meypack.de",
      country: "DE",
      language: "de",
      currency: "EUR",
      crm_customer_id_prefix: "MEYPACK",
      crm_sheet_id: "1M2E3Y4P_MEYPACK_EXAMPLE_ID",
      crm_sheet_tab: "Leads_Master",
      timezone: "Europe/Berlin",
      contact: {
        support_email: "info@meypack.de",
        phone: "+49 555 666 777"
      },
      google_drive: {
        folder_id: "19Cf3456BCD_MEYPACK_DRIVE",
        templates_folder: "1D4E5F_MEYPACK_TEMPLATES"
      }
    },
    workflow: {
      lead_id_prefix: "LEAD_MP_",
      offer_id_prefix: "OFFER_MP_",
      timezone: "Europe/Berlin",
      ai: {
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1500
      },
      api_keys: {
        hunter: $env.HUNTER_API_KEY,
        openai: $env.OPENAI_API_KEY
      },
      crm_sync: {
        enabled: true,
        method: "google_sheets",
        counter_tab: "Counter"
      },
      performance: {
        scraper_timeout_ms: 7000,
        max_items_per_run: 2
      }
    },
    technical: {
      machines: {
        default_voltage: 400,
        default_frequency: 50,
        default_air_pressure_bar: 6,
        motor_power_range_kw: [0.37, 30],
        temperature_operating_range: { min: 10, max: 35 },
        ip_protection_min: "IP54",
        noise_limit_db: 70,
        standard_safety_level: "PL d",
        recommended_brands: ["Festo", "SEW", "Nord"]
      },
      packaging_specs: {
        max_package_weight_kg: 25,
        max_package_dimensions_mm: {
          length: 600,
          width: 400,
          height: 400
        },
        supported_materials: ["Karton", "Wellpappe", "Folienverpackung"],
        throughput_packages_per_minute: 60
      }
    }
  }
};

// ========== LOGIC ==========

// Config laden
const config = configs[clientKey] || configs['SEINE']; // Fallback auf SEINE

// Zusätzliche Runtime-Informationen hinzufügen
config.runtime = {
  loaded_client: clientKey,
  loaded_at: new Date().toISOString(),
  workflow_execution_id: $execution.id,
  workflow_name: $workflow.name
};

// Config zurückgeben
return { json: config };
