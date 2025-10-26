/**
 * WiesLogic Product Calculation Modules
 * Version: 2025.10.2
 *
 * Modular calculation engine for different Robopac machine types
 * All machines primarily based on speeds (input, formations, output)
 */

class ProductCalculator {
  constructor(productType, specs) {
    this.productType = productType;
    this.specs = specs;
  }

  calculateEfficiency(actual, theoretical) {
    return (actual / theoretical) * 100;
  }

  formatResult(data) {
    return {
      timestamp: new Date().toISOString(),
      product_type: this.productType,
      calculations: data,
      confidence_score: this.calculateConfidence(data)
    };
  }

  calculateConfidence(data) {
    // Base confidence on data completeness and validity
    const fields = Object.values(data).filter(v => v !== null && v !== undefined);
    return Math.min(100, (fields.length / Object.keys(data).length) * 100);
  }
}

/**
 * Pallet Wrapper Calculations
 * Based on: pallets/hour, film usage, turntable speed
 */
class PalletWrapperCalculator extends ProductCalculator {
  constructor(specs) {
    super('pallet_wrapper', specs);
  }

  calculate(inputs) {
    const {
      required_pallets_per_hour = 0,
      pallet_height = 1500, // mm
      pallet_weight = 800, // kg
      film_overlap = 50, // percentage
      turntable_speed = 12 // rpm
    } = inputs;

    // Calculate cycle time
    const wraps_per_pallet = Math.ceil(pallet_height / (250 * (film_overlap / 100)));
    const seconds_per_wrap = 60 / turntable_speed;
    const cycle_time = wraps_per_pallet * seconds_per_wrap;

    // Calculate throughput
    const theoretical_pallets_per_hour = Math.floor(3600 / cycle_time);
    const actual_pallets_per_hour = theoretical_pallets_per_hour * 0.85; // 85% OEE

    // Film usage calculation
    const film_length_per_pallet = wraps_per_pallet * 2400; // mm circumference approx
    const film_usage_meters = film_length_per_pallet / 1000;

    // Cost estimation (example values)
    const film_cost_per_meter = 0.02; // EUR
    const cost_per_pallet = film_usage_meters * film_cost_per_meter;

    return this.formatResult({
      cycle_time_seconds: Math.round(cycle_time),
      theoretical_pallets_per_hour,
      actual_pallets_per_hour: Math.round(actual_pallets_per_hour),
      meets_requirement: actual_pallets_per_hour >= required_pallets_per_hour,
      efficiency_percentage: this.calculateEfficiency(actual_pallets_per_hour, theoretical_pallets_per_hour),
      film_usage_meters_per_pallet: Math.round(film_usage_meters),
      estimated_cost_per_pallet: cost_per_pallet.toFixed(2),
      recommended_model: this.recommendModel(actual_pallets_per_hour)
    });
  }

  recommendModel(pph) {
    if (pph >= 120) return 'Helix Heavy Duty';
    if (pph >= 80) return 'Helix Standard';
    if (pph >= 40) return 'Robot S6';
    return 'Compacta';
  }
}

/**
 * Palletizer Calculations
 * Based on: products/minute, formation patterns, layers
 */
class PalletizerCalculator extends ProductCalculator {
  constructor(specs) {
    super('palletizer', specs);
  }

  calculate(inputs) {
    const {
      products_per_minute = 0,
      products_per_layer = 12,
      layers_per_pallet = 8,
      pick_and_place_time = 2, // seconds
      layer_formation_time = 5 // seconds
    } = inputs;

    // Calculate products per pallet
    const products_per_pallet = products_per_layer * layers_per_pallet;

    // Calculate cycle time
    const pick_cycles_per_pallet = products_per_pallet;
    const total_pick_time = (pick_cycles_per_pallet * pick_and_place_time);
    const total_layer_time = layers_per_pallet * layer_formation_time;
    const cycle_time_seconds = total_pick_time + total_layer_time;

    // Calculate throughput
    const theoretical_pallets_per_hour = Math.floor(3600 / cycle_time_seconds);
    const actual_pallets_per_hour = theoretical_pallets_per_hour * 0.80; // 80% OEE
    const actual_products_per_minute = (actual_pallets_per_hour * products_per_pallet) / 60;

    return this.formatResult({
      products_per_pallet,
      cycle_time_seconds: Math.round(cycle_time_seconds),
      theoretical_pallets_per_hour,
      actual_pallets_per_hour: Math.round(actual_pallets_per_hour),
      actual_products_per_minute: Math.round(actual_products_per_minute),
      meets_requirement: actual_products_per_minute >= products_per_minute,
      efficiency_percentage: this.calculateEfficiency(actual_products_per_minute, products_per_minute),
      recommended_pattern: this.recommendPattern(products_per_layer),
      recommended_model: this.recommendModel(products_per_minute)
    });
  }

  recommendPattern(productsPerLayer) {
    const patterns = {
      6: 'Column 2x3',
      8: 'Column 2x4',
      9: 'Grid 3x3',
      12: 'Grid 3x4',
      15: 'Grid 3x5',
      16: 'Grid 4x4'
    };
    return patterns[productsPerLayer] || 'Custom Pattern Required';
  }

  recommendModel(ppm) {
    if (ppm >= 100) return 'Artis High Speed';
    if (ppm >= 60) return 'Artis Standard';
    if (ppm >= 30) return 'Artic Compact';
    return 'Artic Entry';
  }
}

/**
 * Depalletizer Calculations
 * Based on: pallets/hour, product types, gripper cycles
 */
class DepalletizerCalculator extends ProductCalculator {
  constructor(specs) {
    super('depalletizer', specs);
  }

  calculate(inputs) {
    const {
      required_products_per_minute = 0,
      products_per_layer = 12,
      layers_per_pallet = 8,
      pick_cycle_time = 3, // seconds
      pallet_exchange_time = 15 // seconds
    } = inputs;

    const products_per_pallet = products_per_layer * layers_per_pallet;
    const total_pick_time = layers_per_pallet * pick_cycle_time;
    const cycle_time_seconds = total_pick_time + pallet_exchange_time;

    const theoretical_pallets_per_hour = Math.floor(3600 / cycle_time_seconds);
    const actual_pallets_per_hour = theoretical_pallets_per_hour * 0.82; // 82% OEE
    const actual_products_per_minute = (actual_pallets_per_hour * products_per_pallet) / 60;

    return this.formatResult({
      products_per_pallet,
      cycle_time_seconds: Math.round(cycle_time_seconds),
      theoretical_pallets_per_hour,
      actual_pallets_per_hour: Math.round(actual_pallets_per_hour),
      actual_products_per_minute: Math.round(actual_products_per_minute),
      meets_requirement: actual_products_per_minute >= required_products_per_minute,
      efficiency_percentage: this.calculateEfficiency(actual_products_per_minute, required_products_per_minute),
      recommended_model: this.recommendModel(required_products_per_minute)
    });
  }

  recommendModel(ppm) {
    if (ppm >= 80) return 'Artis Depal High Speed';
    if (ppm >= 50) return 'Artis Depal Standard';
    return 'Artis Depal Compact';
  }
}

/**
 * LGV (Laser Guided Vehicle) Calculations
 * Based on: travel speed, loading time, route distance
 */
class LGVCalculator extends ProductCalculator {
  constructor(specs) {
    super('lgv', specs);
  }

  calculate(inputs) {
    const {
      required_trips_per_hour = 0,
      route_distance = 100, // meters
      travel_speed = 1.5, // m/s
      loading_time = 30, // seconds
      unloading_time = 30, // seconds
      payload_capacity = 1200 // kg
    } = inputs;

    // Calculate round trip time
    const travel_time_one_way = route_distance / travel_speed;
    const total_travel_time = travel_time_one_way * 2; // round trip
    const cycle_time_seconds = total_travel_time + loading_time + unloading_time;

    // Calculate throughput
    const theoretical_trips_per_hour = Math.floor(3600 / cycle_time_seconds);
    const actual_trips_per_hour = theoretical_trips_per_hour * 0.88; // 88% utilization

    // Calculate capacity
    const total_throughput_kg_per_hour = actual_trips_per_hour * payload_capacity;

    return this.formatResult({
      cycle_time_seconds: Math.round(cycle_time_seconds),
      theoretical_trips_per_hour,
      actual_trips_per_hour: Math.round(actual_trips_per_hour),
      meets_requirement: actual_trips_per_hour >= required_trips_per_hour,
      capacity_utilization_percentage: this.calculateEfficiency(actual_trips_per_hour, theoretical_trips_per_hour),
      total_throughput_kg_per_hour,
      recommended_fleet_size: this.recommendFleetSize(required_trips_per_hour, actual_trips_per_hour),
      recommended_model: this.recommendModel(payload_capacity)
    });
  }

  recommendFleetSize(required, actual) {
    return Math.ceil(required / actual);
  }

  recommendModel(payload) {
    if (payload >= 1500) return 'Agilus Heavy Duty';
    if (payload >= 1000) return 'Agilus Standard';
    return 'Agilus Compact';
  }
}

/**
 * Case Packer Calculations
 * Based on: products/minute, cases/minute, configuration
 */
class CasePackerCalculator extends ProductCalculator {
  constructor(specs) {
    super('case_packer', specs);
  }

  calculate(inputs) {
    const {
      required_products_per_minute = 0,
      products_per_case = 24,
      case_forming_time = 2, // seconds
      product_loading_time = 0.5, // seconds per product
      case_sealing_time = 3 // seconds
    } = inputs;

    // Calculate cycle time per case
    const total_loading_time = products_per_case * product_loading_time;
    const cycle_time_seconds = case_forming_time + total_loading_time + case_sealing_time;

    // Calculate throughput
    const theoretical_cases_per_minute = 60 / cycle_time_seconds;
    const actual_cases_per_minute = theoretical_cases_per_minute * 0.85; // 85% OEE
    const actual_products_per_minute = actual_cases_per_minute * products_per_case;

    return this.formatResult({
      cycle_time_seconds: Math.round(cycle_time_seconds * 10) / 10,
      theoretical_cases_per_minute: Math.round(theoretical_cases_per_minute),
      actual_cases_per_minute: Math.round(actual_cases_per_minute),
      actual_products_per_minute: Math.round(actual_products_per_minute),
      meets_requirement: actual_products_per_minute >= required_products_per_minute,
      efficiency_percentage: this.calculateEfficiency(actual_products_per_minute, required_products_per_minute),
      recommended_configuration: this.recommendConfiguration(products_per_case),
      recommended_model: this.recommendModel(required_products_per_minute)
    });
  }

  recommendConfiguration(productsPerCase) {
    if (productsPerCase <= 12) return 'Single Lane';
    if (productsPerCase <= 24) return 'Dual Lane';
    return 'Multi Lane';
  }

  recommendModel(ppm) {
    if (ppm >= 200) return 'WrapMax High Speed';
    if (ppm >= 100) return 'WrapMax Standard';
    return 'WrapMax Compact';
  }
}

/**
 * Shrink Wrapper Calculations
 * Based on: packs/minute, film type, tunnel speed
 */
class ShrinkWrapperCalculator extends ProductCalculator {
  constructor(specs) {
    super('shrink_wrapper', specs);
  }

  calculate(inputs) {
    const {
      required_packs_per_minute = 0,
      pack_size_length = 400, // mm
      pack_size_width = 300, // mm
      tunnel_speed = 15, // m/min
      seal_time = 1.5 // seconds
    } = inputs;

    // Calculate pack spacing in tunnel
    const pack_length_meters = pack_size_length / 1000;
    const tunnel_speed_per_second = tunnel_speed / 60;
    const packs_in_tunnel = Math.floor(tunnel_speed / pack_length_meters);

    // Calculate throughput
    const theoretical_packs_per_minute = Math.floor(60 / seal_time);
    const actual_packs_per_minute = Math.min(theoretical_packs_per_minute, tunnel_speed * 0.85);

    // Film usage calculation
    const film_area_per_pack = ((pack_size_length + pack_size_width) * 2 + 100) * (pack_size_length + 100) / 1000000; // m²
    const film_cost_per_m2 = 0.50; // EUR
    const cost_per_pack = film_area_per_pack * film_cost_per_m2;

    return this.formatResult({
      theoretical_packs_per_minute,
      actual_packs_per_minute: Math.round(actual_packs_per_minute),
      meets_requirement: actual_packs_per_minute >= required_packs_per_minute,
      efficiency_percentage: this.calculateEfficiency(actual_packs_per_minute, required_packs_per_minute),
      film_usage_m2_per_pack: film_area_per_pack.toFixed(3),
      estimated_cost_per_pack: cost_per_pack.toFixed(3),
      energy_consumption_kwh: this.estimateEnergy(actual_packs_per_minute),
      recommended_model: this.recommendModel(required_packs_per_minute)
    });
  }

  estimateEnergy(ppm) {
    // Rough estimate: 0.05 kWh per pack
    return (ppm * 60 * 0.05).toFixed(2);
  }

  recommendModel(ppm) {
    if (ppm >= 80) return 'Shrink Tunnel Pro Max';
    if (ppm >= 40) return 'Shrink Tunnel Pro';
    return 'Shrink Tunnel Compact';
  }
}

/**
 * Tray Shrink Wrapper Calculations
 */
class TrayShrinkWrapperCalculator extends ShrinkWrapperCalculator {
  constructor(specs) {
    super(specs);
    this.productType = 'tray_shrink_wrapper';
  }

  recommendModel(ppm) {
    if (ppm >= 60) return 'Tray Wrapper Pro';
    if (ppm >= 30) return 'Tray Wrapper Standard';
    return 'Tray Wrapper Compact';
  }
}

/**
 * Bag Sealer Calculations
 * Based on: bags/minute, seal type, bag size
 */
class BagSealerCalculator extends ProductCalculator {
  constructor(specs) {
    super('bag_sealer', specs);
  }

  calculate(inputs) {
    const {
      required_bags_per_minute = 0,
      bag_width = 200, // mm
      seal_type = 'heat', // heat, ultrasonic, impulse
      seal_time = 0.8, // seconds
      cooling_time = 0.5 // seconds
    } = inputs;

    // Calculate cycle time
    const cycle_time_seconds = seal_type === 'ultrasonic' ? seal_time : seal_time + cooling_time;

    // Calculate throughput
    const theoretical_bags_per_minute = Math.floor(60 / cycle_time_seconds);
    const actual_bags_per_minute = theoretical_bags_per_minute * 0.90; // 90% OEE

    // Seal quality prediction
    const seal_quality_score = this.predictSealQuality(seal_type, bag_width);

    return this.formatResult({
      cycle_time_seconds: cycle_time_seconds.toFixed(2),
      theoretical_bags_per_minute,
      actual_bags_per_minute: Math.round(actual_bags_per_minute),
      meets_requirement: actual_bags_per_minute >= required_bags_per_minute,
      efficiency_percentage: this.calculateEfficiency(actual_bags_per_minute, required_bags_per_minute),
      seal_quality_score,
      maintenance_prediction_hours: this.predictMaintenance(actual_bags_per_minute),
      recommended_model: this.recommendModel(required_bags_per_minute, seal_type)
    });
  }

  predictSealQuality(sealType, bagWidth) {
    const baseScores = {
      'heat': 85,
      'ultrasonic': 95,
      'impulse': 80
    };
    const widthFactor = bagWidth < 300 ? 1.0 : 0.95;
    return Math.round((baseScores[sealType] || 80) * widthFactor);
  }

  predictMaintenance(bpm) {
    // Maintenance every X bags
    const bags_until_maintenance = 100000;
    const hours_until_maintenance = bags_until_maintenance / (bpm * 60);
    return Math.round(hours_until_maintenance);
  }

  recommendModel(bpm, sealType) {
    if (bpm >= 100 && sealType === 'ultrasonic') return 'UltraSeal Pro';
    if (bpm >= 60) return 'BagSealer Industrial';
    return 'BagSealer Standard';
  }
}

/**
 * Case Packing Machine Calculations (Advanced)
 * Based on: formation patterns, case formats
 */
class CasePackingMachineCalculator extends ProductCalculator {
  constructor(specs) {
    super('case_packing_machine', specs);
  }

  calculate(inputs) {
    const {
      required_products_per_minute = 0,
      products_per_case = 12,
      case_format = 'RSC', // Regular Slotted Container
      packing_pattern = '3x4',
      pick_time_per_product = 0.6, // seconds
      case_erection_time = 2, // seconds
      case_closing_time = 2.5 // seconds
    } = inputs;

    // Calculate cycle time
    const total_pick_time = products_per_case * pick_time_per_product;
    const cycle_time_seconds = case_erection_time + total_pick_time + case_closing_time;

    // Calculate throughput
    const theoretical_cases_per_hour = Math.floor(3600 / cycle_time_seconds);
    const actual_cases_per_hour = theoretical_cases_per_hour * 0.83; // 83% OEE
    const actual_products_per_minute = (actual_cases_per_hour * products_per_case) / 60;

    // Changeover estimation
    const changeover_time = this.estimateChangeoverTime(case_format, products_per_case);

    return this.formatResult({
      cycle_time_seconds: Math.round(cycle_time_seconds),
      theoretical_cases_per_hour,
      actual_cases_per_hour: Math.round(actual_cases_per_hour),
      actual_products_per_minute: Math.round(actual_products_per_minute),
      meets_requirement: actual_products_per_minute >= required_products_per_minute,
      efficiency_percentage: this.calculateEfficiency(actual_products_per_minute, required_products_per_minute),
      changeover_time_minutes: changeover_time,
      recommended_pattern: packing_pattern,
      recommended_model: this.recommendModel(required_products_per_minute)
    });
  }

  estimateChangeoverTime(caseFormat, productsPerCase) {
    const baseTime = 15; // minutes
    const complexityFactor = productsPerCase > 24 ? 1.5 : 1.0;
    return Math.round(baseTime * complexityFactor);
  }

  recommendModel(ppm) {
    if (ppm >= 150) return 'PackMaster Ultra';
    if (ppm >= 80) return 'PackMaster Pro';
    return 'PackMaster Standard';
  }
}

/**
 * Cobot (Collaborative Robot) Calculations
 * Based on: pick-and-place cycles, payload, reach
 */
class CobotCalculator extends ProductCalculator {
  constructor(specs) {
    super('cobot', specs);
  }

  calculate(inputs) {
    const {
      required_picks_per_minute = 0,
      payload_weight = 5, // kg
      reach_distance = 800, // mm
      pick_height_change = 300, // mm
      place_height_change = 300, // mm
      gripper_cycle_time = 0.5 // seconds
    } = inputs;

    // Calculate cycle time based on distance and payload
    const travel_time_per_cycle = this.calculateTravelTime(reach_distance, payload_weight);
    const height_adjustment_time = (pick_height_change + place_height_change) / 1000 * 2; // 2s per meter
    const cycle_time_seconds = travel_time_per_cycle + height_adjustment_time + gripper_cycle_time;

    // Calculate throughput
    const theoretical_picks_per_minute = Math.floor(60 / cycle_time_seconds);
    const actual_picks_per_minute = theoretical_picks_per_minute * 0.87; // 87% utilization

    // Safety compliance score
    const safety_score = this.calculateSafetyCompliance(payload_weight, reach_distance);

    return this.formatResult({
      cycle_time_seconds: cycle_time_seconds.toFixed(2),
      theoretical_picks_per_minute,
      actual_picks_per_minute: Math.round(actual_picks_per_minute),
      meets_requirement: actual_picks_per_minute >= required_picks_per_minute,
      utilization_percentage: this.calculateEfficiency(actual_picks_per_minute, theoretical_picks_per_minute),
      safety_compliance_score: safety_score,
      recommended_configuration: this.recommendConfiguration(payload_weight),
      recommended_model: this.recommendModel(payload_weight, reach_distance)
    });
  }

  calculateTravelTime(distance, payload) {
    // Speed decreases with payload
    const base_speed = 1.5; // m/s
    const payload_factor = Math.max(0.6, 1 - (payload / 20));
    const adjusted_speed = base_speed * payload_factor;
    return (distance / 1000) / adjusted_speed * 2; // round trip
  }

  calculateSafetyCompliance(payload, reach) {
    // Higher score for lighter payloads and shorter reach (safer)
    const payload_score = Math.max(0, 100 - (payload * 5));
    const reach_score = Math.max(0, 100 - (reach / 20));
    return Math.round((payload_score + reach_score) / 2);
  }

  recommendConfiguration(payload) {
    if (payload >= 10) return 'Heavy Duty Gripper + Safety Scanner';
    if (payload >= 5) return 'Standard Gripper + Light Curtain';
    return 'Vacuum Gripper + Safety Mat';
  }

  recommendModel(payload, reach) {
    if (payload >= 10 && reach >= 1200) return 'Cobot CR-15';
    if (payload >= 5 && reach >= 900) return 'Cobot CR-10';
    if (payload >= 3) return 'Cobot CR-5';
    return 'Cobot CR-3';
  }
}

/**
 * Calculator Factory
 * Returns the appropriate calculator for a product type
 */
class CalculatorFactory {
  static getCalculator(productType, specs = {}) {
    const calculators = {
      'pallet_wrapper': PalletWrapperCalculator,
      'pallet_wrappers': PalletWrapperCalculator,
      'palletizer': PalletizerCalculator,
      'palletizers': PalletizerCalculator,
      'depalletizer': DepalletizerCalculator,
      'depalletizers': DepalletizerCalculator,
      'lgv': LGVCalculator,
      'lgvs': LGVCalculator,
      'case_packer': CasePackerCalculator,
      'case_packers': CasePackerCalculator,
      'shrink_wrapper': ShrinkWrapperCalculator,
      'shrink_wrappers': ShrinkWrapperCalculator,
      'tray_shrink_wrapper': TrayShrinkWrapperCalculator,
      'tray_shrink_wrappers': TrayShrinkWrapperCalculator,
      'bag_sealer': BagSealerCalculator,
      'bag_sealers': BagSealerCalculator,
      'case_packing_machine': CasePackingMachineCalculator,
      'case_packing_machines': CasePackingMachineCalculator,
      'cobot': CobotCalculator,
      'cobots': CobotCalculator
    };

    const CalculatorClass = calculators[productType.toLowerCase()];
    if (!CalculatorClass) {
      throw new Error(`Unknown product type: ${productType}`);
    }

    return new CalculatorClass(specs);
  }

  static getSupportedTypes() {
    return [
      'pallet_wrappers',
      'palletizers',
      'depalletizers',
      'lgvs',
      'case_packers',
      'shrink_wrappers',
      'tray_shrink_wrappers',
      'bag_sealers',
      'case_packing_machines',
      'cobots'
    ];
  }
}

// Export for n8n usage
module.exports = {
  CalculatorFactory,
  PalletWrapperCalculator,
  PalletizerCalculator,
  DepalletizerCalculator,
  LGVCalculator,
  CasePackerCalculator,
  ShrinkWrapperCalculator,
  TrayShrinkWrapperCalculator,
  BagSealerCalculator,
  CasePackingMachineCalculator,
  CobotCalculator
};

// Example usage for n8n:
// const { CalculatorFactory } = require('./product-calculators.js');
// const calculator = CalculatorFactory.getCalculator('pallet_wrapper');
// const result = calculator.calculate({ required_pallets_per_hour: 60, pallet_height: 1800 });
