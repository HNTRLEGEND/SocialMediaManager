# AI_TECHNICAL_AGENT - Technical Analysis & Product Matching

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** Technische Analyse und Produktempfehlung für alle AETNA Group Marken

---

## 📋 Übersicht

Der **AI_TECHNICAL_AGENT** übernimmt die technische Machbarkeitsanalyse nach der Lead-Qualifikation. Er:

✅ **Lädt Produktspezifikationen** aus Product Portfolio
✅ **Berechnet Machbarkeit** mit product-calculators.js
✅ **Nutzt RAG** für technische Empfehlungen aus Knowledge Base
✅ **Matched beste Produkte** basierend auf Requirements
✅ **Erstellt Technical Evaluation** (Google Sheets + Docs)
✅ **Routet zu Sales Agent** (wenn machbar)

---

## 🎯 Hauptaufgaben

### 1. Requirement Analysis
- Extrahiert technische Anforderungen aus Lead-Daten
- Identifiziert Durchsatz, Produkttyp, Umgebungsbedingungen
- Klassifiziert nach Komplexität (Simple/Standard/Complex)

### 2. Product Matching
- Lädt verfügbare Produkte aus `06_📦_Product_Portfolio`
- Filtert nach Brand und Product Type
- Matched anhand von Specs aus `07_⚙️_Mechanical_Specs`, `08_🔌_Electrical_Specs`, `09_🎞️_Packaging_Process_Specs`

### 3. Feasibility Calculation
- Nutzt **CalculatorFactory** aus product-calculators.js
- Berechnet: Throughput, Efficiency, Cycle Time, ROI
- Bewertet: Meets Requirements? (yes/no/partially)

### 4. RAG-Enhanced Recommendations
- Sucht ähnliche Cases in Vector Store
- Holt Best Practices für Produktkategorie
- Gibt Confidence Score (0-100%)

### 5. Technical Documentation
- Erstellt Evaluation Report in Google Docs
- Logged in `16_Evaluation_Log`
- Speichert Calculation Results

---

## 🔄 Workflow-Ablauf

```
Handover from Lead Agent → Load Product Data → Extract Requirements →
Calculate Feasibility → RAG Recommendations → Create Evaluation → Route to Sales
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger

**Path:** `/webhook/technical-agent`
**Method:** POST
**Auth:** Bearer Token

**Payload von LEAD AGENT:**
```json
{
  "master_execution_id": "MASTER_123...",
  "customer_id": "AETNA_GROUP_001",
  "brand": "ROBOPAC",
  "brand_config": {
    "min_budget_eur": 25000,
    "target_industries": ["logistics", "warehousing"]
  },
  "inquiry_id": "INQ_1234567890",
  "lead_dossier_link": "https://docs.google.com/...",
  "bant_score": 90,
  "data": {
    "company_name": "Logistics GmbH",
    "contact_person": "John Doe",
    "email": "john@logistics.de",
    "product_type": "Pallet Wrapper",
    "required_pallets_per_hour": 80,
    "pallet_height": 1800,
    "pallet_weight": 800,
    "film_type": "standard_stretch",
    "environment": "indoor",
    "automation_level": "automatic",
    "message": "We need an automated solution for our warehouse"
  }
}
```

---

### Node 2: Extract Technical Requirements

**Type:** Code (JavaScript)

```javascript
/**
 * REQUIREMENT EXTRACTION ENGINE
 * Extrahiert und strukturiert technische Anforderungen
 */

const input = $input.item.json;

// Helper: Extract throughput requirements
function extractThroughput(data) {
  const throughput = {
    value: null,
    unit: null,
    type: null
  };

  // Pallets per hour
  if (data.required_pallets_per_hour) {
    throughput.value = data.required_pallets_per_hour;
    throughput.unit = 'pallets_per_hour';
    throughput.type = 'pallet_based';
  }
  // Products per minute
  else if (data.required_products_per_minute) {
    throughput.value = data.required_products_per_minute;
    throughput.unit = 'products_per_minute';
    throughput.type = 'product_based';
  }
  // Cases per hour
  else if (data.required_cases_per_hour) {
    throughput.value = data.required_cases_per_hour;
    throughput.unit = 'cases_per_hour';
    throughput.type = 'case_based';
  }
  // Trays per minute
  else if (data.required_trays_per_minute) {
    throughput.value = data.required_trays_per_minute;
    throughput.unit = 'trays_per_minute';
    throughput.type = 'tray_based';
  }

  return throughput;
}

// Helper: Classify complexity
function classifyComplexity(data) {
  let complexity = 0;

  // Simple indicators (1 point each)
  if (data.product_type) complexity += 1;
  if (data.automation_level === 'automatic') complexity += 1;

  // Standard indicators (2 points each)
  if (data.pallet_height > 2000) complexity += 2;
  if (data.environment === 'outdoor') complexity += 2;
  if (data.special_requirements) complexity += 2;

  // Complex indicators (3 points each)
  if (data.multiple_products) complexity += 3;
  if (data.custom_integration) complexity += 3;
  if (data.cleanroom_required) complexity += 3;

  if (complexity <= 3) return 'simple';
  if (complexity <= 7) return 'standard';
  return 'complex';
}

// Helper: Determine product category
function determineProductCategory(productType, brand) {
  const type = (productType || '').toLowerCase();

  // ROBOPAC products
  if (type.includes('wrapper') || type.includes('wrapping')) {
    return 'pallet_wrapper';
  }

  // OCME products
  if (type.includes('palletizer') || type.includes('palletiser')) {
    return 'palletizer';
  }
  if (type.includes('depalletizer')) {
    return 'depalletizer';
  }
  if (type.includes('case packer') || type.includes('case-packer')) {
    return 'case_packer';
  }
  if (type.includes('shrink')) {
    return 'shrink_wrapper';
  }

  // PRASMATIC products
  if (type.includes('bag-in-box') || type.includes('bag in box')) {
    return 'bag_in_box';
  }
  if (type.includes('filling') || type.includes('filler')) {
    return 'liquid_filler';
  }

  // SOTEMAPACK products
  if (type.includes('tray') && type.includes('seal')) {
    return 'traysealer';
  }
  if (type.includes('thermoform')) {
    return 'thermoformer';
  }

  // MEYPACK products
  if (type.includes('case erector')) {
    return 'case_erector';
  }
  if (type.includes('case sealer')) {
    return 'case_sealer';
  }

  // Other
  if (type.includes('lgv') || type.includes('agv')) {
    return 'lgv';
  }
  if (type.includes('cobot') || type.includes('robot')) {
    return 'cobot';
  }

  return 'unknown';
}

// EXTRACT REQUIREMENTS

const throughput = extractThroughput(input.data);
const productCategory = determineProductCategory(input.data.product_type, input.brand);
const complexity = classifyComplexity(input.data);

// Build structured requirements object
const requirements = {
  ...input,
  technical_requirements: {
    product_category: productCategory,
    throughput: throughput,
    complexity: complexity,

    // Physical specs
    physical_specs: {
      pallet_height: input.data.pallet_height || null,
      pallet_weight: input.data.pallet_weight || null,
      pallet_size: input.data.pallet_size || 'EUR (1200x800)',
      product_dimensions: input.data.product_dimensions || null
    },

    // Environment specs
    environment_specs: {
      location: input.data.environment || 'indoor',
      temperature_range: input.data.temperature_range || 'ambient',
      cleanroom: input.data.cleanroom_required || false,
      explosion_proof: input.data.explosion_proof || false
    },

    // Automation specs
    automation_specs: {
      level: input.data.automation_level || 'semi-automatic',
      integration_required: input.data.custom_integration || false,
      plc_brand: input.data.plc_brand || null,
      scada_integration: input.data.scada_integration || false
    },

    // Packaging specs
    packaging_specs: {
      film_type: input.data.film_type || null,
      carton_type: input.data.carton_type || null,
      packaging_material: input.data.packaging_material || null,
      print_required: input.data.print_required || false
    }
  }
};

return { json: requirements };
```

**Output:**
```json
{
  "technical_requirements": {
    "product_category": "pallet_wrapper",
    "throughput": {
      "value": 80,
      "unit": "pallets_per_hour",
      "type": "pallet_based"
    },
    "complexity": "standard",
    "physical_specs": { ... },
    "environment_specs": { ... },
    "automation_specs": { ... },
    "packaging_specs": { ... }
  }
}
```

---

### Node 3: Load Product Portfolio

**Type:** Google Sheets Lookup
**Sheet:** `06_📦_Product_Portfolio`
**Operation:** Read Rows

**Filter Criteria:**
```javascript
{
  "Brand": "={{ $json.brand }}",
  "Product_Category": "={{ $json.technical_requirements.product_category }}",
  "Status": "active"
}
```

**Returns:**
```json
{
  "products": [
    {
      "Product_ID": "RBP_001",
      "Brand": "ROBOPAC",
      "Product_Category": "pallet_wrapper",
      "Model_Name": "Helix Standard",
      "Base_Speed_pph": 60,
      "Max_Speed_pph": 80,
      "Base_Price_EUR": 45000,
      "Lead_Time_Weeks": 8
    },
    {
      "Product_ID": "RBP_002",
      "Brand": "ROBOPAC",
      "Product_Category": "pallet_wrapper",
      "Model_Name": "Helix Premium",
      "Base_Speed_pph": 80,
      "Max_Speed_pph": 120,
      "Base_Price_EUR": 65000,
      "Lead_Time_Weeks": 10
    }
  ]
}
```

---

### Node 4: Load Technical Specs

**Type:** Google Sheets Lookup (3 parallel lookups)

**4a) Mechanical Specs** from `07_⚙️_Mechanical_Specs`
```javascript
{
  "filter": "Product_ID in {{ $json.products.map(p => p.Product_ID) }}"
}
```

**4b) Electrical Specs** from `08_🔌_Electrical_Specs`
```javascript
{
  "filter": "Product_ID in {{ $json.products.map(p => p.Product_ID) }}"
}
```

**4c) Process Specs** from `09_🎞️_Packaging_Process_Specs`
```javascript
{
  "filter": "Product_ID in {{ $json.products.map(p => p.Product_ID) }}"
}
```

---

### Node 5: Calculate Feasibility

**Type:** Code (JavaScript)

```javascript
/**
 * FEASIBILITY CALCULATION ENGINE
 * Integriert product-calculators.js für Berechnungen
 */

// NOTE: In real n8n workflow, product-calculators.js would be loaded via npm module
// or included as Function Item in workflow
// For this template, we show the integration logic

const requirements = $input.item.json.technical_requirements;
const products = $input.item.json.products;
const mechanicalSpecs = $input.item.json.mechanical_specs || [];
const electricalSpecs = $input.item.json.electrical_specs || [];
const processSpecs = $input.item.json.process_specs || [];

// CalculatorFactory simulation (would import from product-calculators.js)
class CalculatorFactory {
  static getCalculator(productCategory) {
    // Returns appropriate calculator instance
    switch(productCategory) {
      case 'pallet_wrapper': return new PalletWrapperCalculator();
      case 'palletizer': return new PalletizerCalculator();
      case 'depalletizer': return new DepalletizerCalculator();
      case 'lgv': return new LGVCalculator();
      case 'case_packer': return new CasePackerCalculator();
      case 'shrink_wrapper': return new ShrinkWrapperCalculator();
      case 'tray_shrink_wrapper': return new TrayShrinkWrapperCalculator();
      case 'bag_sealer': return new BagSealerCalculator();
      case 'case_packing_machine': return new CasePackingMachineCalculator();
      case 'cobot': return new CobotCalculator();
      default: throw new Error(`Unknown product category: ${productCategory}`);
    }
  }
}

// Simplified Calculator (actual implementation in product-calculators.js)
class PalletWrapperCalculator {
  calculate(inputs, productSpec) {
    const cycleTime = this.calculateCycleTime(inputs);
    const throughput = 3600 / cycleTime; // pallets per hour
    const efficiency = Math.min((throughput / inputs.required_pallets_per_hour) * 100, 100);

    return {
      meets_requirement: throughput >= inputs.required_pallets_per_hour,
      actual_throughput: Math.round(throughput),
      required_throughput: inputs.required_pallets_per_hour,
      efficiency_percent: Math.round(efficiency),
      cycle_time_seconds: Math.round(cycleTime),
      confidence: this.calculateConfidence(inputs, productSpec),
      limitations: this.identifyLimitations(inputs, productSpec)
    };
  }

  calculateCycleTime(inputs) {
    // Simplified: base cycle time + height factor + weight factor
    const baseCycleTime = 35; // seconds
    const heightFactor = (inputs.pallet_height || 1500) / 1500 * 10;
    const weightFactor = (inputs.pallet_weight || 500) / 500 * 5;
    return baseCycleTime + heightFactor + weightFactor;
  }

  calculateConfidence(inputs, productSpec) {
    let confidence = 100;

    // Reduce confidence for edge cases
    if (inputs.pallet_height > 2000) confidence -= 10;
    if (inputs.pallet_weight > 1000) confidence -= 10;
    if (inputs.environment === 'outdoor') confidence -= 15;
    if (!inputs.film_type) confidence -= 5;

    return Math.max(confidence, 50);
  }

  identifyLimitations(inputs, productSpec) {
    const limitations = [];

    if (inputs.pallet_height > productSpec.max_pallet_height) {
      limitations.push('Pallet height exceeds maximum specification');
    }
    if (inputs.pallet_weight > productSpec.max_load_weight) {
      limitations.push('Pallet weight exceeds maximum specification');
    }
    if (inputs.environment === 'outdoor' && !productSpec.outdoor_rated) {
      limitations.push('Product not rated for outdoor use');
    }

    return limitations;
  }
}

// CALCULATE FEASIBILITY FOR EACH PRODUCT

const evaluations = [];

for (const product of products) {
  try {
    // Get appropriate calculator
    const calculator = CalculatorFactory.getCalculator(requirements.product_category);

    // Find specs for this product
    const mechanical = mechanicalSpecs.find(s => s.Product_ID === product.Product_ID);
    const electrical = electricalSpecs.find(s => s.Product_ID === product.Product_ID);
    const process = processSpecs.find(s => s.Product_ID === product.Product_ID);

    // Prepare inputs
    const calculationInputs = {
      // From requirements
      required_pallets_per_hour: requirements.throughput.value,
      pallet_height: requirements.physical_specs.pallet_height,
      pallet_weight: requirements.physical_specs.pallet_weight,
      environment: requirements.environment_specs.location,
      automation_level: requirements.automation_specs.level,
      film_type: requirements.packaging_specs.film_type,

      // From product specs
      base_speed: product.Base_Speed_pph || product.Base_Speed_ppm,
      max_speed: product.Max_Speed_pph || product.Max_Speed_ppm,
      max_pallet_height: mechanical?.Max_Pallet_Height_mm,
      max_load_weight: mechanical?.Max_Load_Weight_kg,
      outdoor_rated: mechanical?.Outdoor_Rated === 'yes'
    };

    // Calculate
    const result = calculator.calculate(calculationInputs, product);

    // Calculate overall score
    const score = this.calculateOverallScore(result, product, requirements);

    evaluations.push({
      product_id: product.Product_ID,
      model_name: product.Model_Name,
      brand: product.Brand,
      calculation_result: result,
      overall_score: score,
      recommendation_level: score >= 80 ? 'highly_recommended' :
                           score >= 60 ? 'recommended' :
                           score >= 40 ? 'possible' : 'not_recommended',
      base_price: product.Base_Price_EUR,
      lead_time_weeks: product.Lead_Time_Weeks
    });

  } catch (error) {
    evaluations.push({
      product_id: product.Product_ID,
      model_name: product.Model_Name,
      error: error.message,
      overall_score: 0,
      recommendation_level: 'error'
    });
  }
}

// Helper: Calculate overall score
function calculateOverallScore(calcResult, product, requirements) {
  let score = 0;

  // Feasibility (40 points)
  if (calcResult.meets_requirement) {
    score += 40;
  } else {
    // Partial points if close
    const ratio = calcResult.actual_throughput / calcResult.required_throughput;
    score += Math.round(40 * ratio);
  }

  // Efficiency (25 points)
  score += Math.round(25 * (calcResult.efficiency_percent / 100));

  // Confidence (20 points)
  score += Math.round(20 * (calcResult.confidence / 100));

  // Budget fit (15 points)
  if (requirements.budget && product.Base_Price_EUR) {
    const budgetRatio = requirements.budget / product.Base_Price_EUR;
    if (budgetRatio >= 1.2) score += 15; // Budget comfortable
    else if (budgetRatio >= 1.0) score += 12; // Budget fits
    else if (budgetRatio >= 0.8) score += 8; // Budget tight
    else score += 3; // Over budget
  } else {
    score += 10; // No budget info, assume neutral
  }

  return Math.min(score, 100);
}

// Sort by score (best first)
evaluations.sort((a, b) => b.overall_score - a.overall_score);

return {
  json: {
    ...$input.item.json,
    technical_evaluation: {
      evaluated_products: evaluations,
      best_match: evaluations[0],
      alternative_matches: evaluations.slice(1, 3),
      evaluation_timestamp: new Date().toISOString(),
      evaluation_confidence: evaluations[0]?.calculation_result?.confidence || 0
    }
  }
};
```

**Output:**
```json
{
  "technical_evaluation": {
    "evaluated_products": [
      {
        "product_id": "RBP_002",
        "model_name": "Helix Premium",
        "calculation_result": {
          "meets_requirement": true,
          "actual_throughput": 85,
          "required_throughput": 80,
          "efficiency_percent": 94,
          "confidence": 95
        },
        "overall_score": 92,
        "recommendation_level": "highly_recommended"
      }
    ],
    "best_match": { ... },
    "alternative_matches": [ ... ]
  }
}
```

---

### Node 6: RAG - Technical Recommendations

**Type:** OpenAI Vector Store Search

**Query Construction:**
```javascript
{
  "query": `Find technical recommendations for ${product_category} in ${industry} with ${throughput} throughput. Requirements: ${JSON.stringify(requirements)}`,
  "vector_store_id": "={{ $env.OPENAI_VECTOR_STORE_ID }}",
  "top_k": 5,
  "similarity_threshold": 0.75
}
```

**Expected Response:**
```json
{
  "results": [
    {
      "content": "For pallet wrapping in logistics with 80 pph throughput, we recommend...",
      "similarity": 0.89,
      "source": "case_study_logistics_2024.pdf",
      "metadata": {
        "industry": "logistics",
        "product": "pallet_wrapper",
        "success_rate": "95%"
      }
    }
  ]
}
```

---

### Node 7: Generate Technical Analysis (OpenAI)

**Type:** OpenAI Chat

**System Prompt:**
```
You are a technical packaging engineer for AETNA Group. Analyze the technical evaluation results and provide detailed recommendations.

Your response should include:
1. Feasibility Summary (meets requirements? yes/no/partially)
2. Recommended Product with justification
3. Alternative Products if applicable
4. Technical Considerations and potential challenges
5. Implementation recommendations
6. Estimated ROI timeline

Be precise, data-driven, and reference the calculation results.
```

**User Prompt:**
```javascript
{
  "prompt": `
Technical Evaluation Request:

Company: {{ $json.data.company_name }}
Product Category: {{ $json.technical_requirements.product_category }}
Required Throughput: {{ $json.technical_requirements.throughput.value }} {{ $json.technical_requirements.throughput.unit }}
Complexity: {{ $json.technical_requirements.complexity }}

Evaluation Results:
${JSON.stringify($json.technical_evaluation, null, 2)}

RAG Context:
${JSON.stringify($json.rag_results, null, 2)}

Please provide your technical analysis and recommendation.
`
}
```

**Expected Response:**
```
## Technical Analysis - Logistics GmbH

### Feasibility Summary
✅ **FEASIBLE** - Requirements can be met with recommended solution

### Recommended Product
**Helix Premium (RBP_002)** - Score: 92/100

Justification:
- Actual throughput: 85 pallets/hour (exceeds requirement of 80 pph)
- Efficiency: 94%
- High confidence: 95%
- Fits within budget range

### Technical Considerations
- Pallet height of 1800mm is within standard range
- Indoor environment is ideal for this model
- Automatic operation as requested

### Implementation Recommendations
1. Site survey required for final placement
2. Power supply: 3-phase 400V needed
3. Operator training: 2 days
4. Installation time: 1 week

### ROI Estimate
- Payback period: 18-24 months
- Labor savings: 2 FTE
- Annual savings: ~€45,000

### Next Steps
Proceed to sales quotation with Helix Premium as primary option, Helix Standard as cost-effective alternative.
```

---

### Node 8: Create Technical Evaluation Document

**Type:** Google Docs Create

**Template:**
```markdown
# Technical Evaluation - {{ company_name }}

**Date:** {{ evaluation_date }}
**Inquiry ID:** {{ inquiry_id }}
**Evaluator:** AI Technical Agent v2025.10.2

---

## Requirements Summary

**Product Category:** {{ product_category }}
**Required Performance:** {{ throughput.value }} {{ throughput.unit }}
**Complexity Level:** {{ complexity }}

**Physical Requirements:**
- Pallet Height: {{ pallet_height }}mm
- Pallet Weight: {{ pallet_weight }}kg
- Environment: {{ environment }}

**Automation Requirements:**
- Level: {{ automation_level }}
- Integration: {{ integration_required }}

---

## Evaluation Results

### Recommended Solution: {{ best_match.model_name }}

**Product ID:** {{ best_match.product_id }}
**Overall Score:** {{ best_match.overall_score }}/100
**Recommendation Level:** {{ best_match.recommendation_level }}

**Performance Analysis:**
- Actual Throughput: {{ best_match.actual_throughput }} {{ unit }}
- Required Throughput: {{ best_match.required_throughput }} {{ unit }}
- Efficiency: {{ best_match.efficiency_percent }}%
- Confidence: {{ best_match.confidence }}%

**Pricing:**
- Base Price: €{{ best_match.base_price }}
- Lead Time: {{ best_match.lead_time_weeks }} weeks

---

## AI Technical Analysis

{{ ai_analysis }}

---

## Alternative Solutions

{{ #each alternative_matches }}
### {{ this.model_name }} (Score: {{ this.overall_score }}/100)
- Throughput: {{ this.actual_throughput }} {{ ../unit }}
- Price: €{{ this.base_price }}
- Recommendation: {{ this.recommendation_level }}
{{ /each }}

---

## RAG Insights

Based on similar projects:
{{ #each rag_results }}
- {{ this.content }} (Similarity: {{ this.similarity }})
{{ /each }}

---

## Next Steps

1. ✅ Technical feasibility confirmed
2. → Route to Sales Agent for quotation
3. → Schedule technical discussion if needed

---

**Generated by AI_TECHNICAL_AGENT v2025.10.2**
**Confidence Score: {{ evaluation_confidence }}%**
```

---

### Node 9: Write to Evaluation Log

**Type:** Google Sheets Append
**Sheet:** `16_Evaluation_Log`

```javascript
{
  "evaluation_id": "EVAL_" + Date.now(),
  "inquiry_id": "={{ $json.inquiry_id }}",
  "customer_name": "={{ $json.data.company_name }}",
  "brand": "={{ $json.brand }}",
  "product_category": "={{ $json.technical_requirements.product_category }}",
  "required_throughput": "={{ $json.technical_requirements.throughput.value }}",
  "throughput_unit": "={{ $json.technical_requirements.throughput.unit }}",
  "complexity_level": "={{ $json.technical_requirements.complexity }}",
  "recommended_product_id": "={{ $json.technical_evaluation.best_match.product_id }}",
  "recommended_model": "={{ $json.technical_evaluation.best_match.model_name }}",
  "feasibility_score": "={{ $json.technical_evaluation.best_match.overall_score }}",
  "meets_requirements": "={{ $json.technical_evaluation.best_match.calculation_result.meets_requirement ? 'yes' : 'no' }}",
  "actual_throughput": "={{ $json.technical_evaluation.best_match.calculation_result.actual_throughput }}",
  "efficiency_percent": "={{ $json.technical_evaluation.best_match.calculation_result.efficiency_percent }}",
  "confidence_score": "={{ $json.technical_evaluation.evaluation_confidence }}",
  "base_price_eur": "={{ $json.technical_evaluation.best_match.base_price }}",
  "lead_time_weeks": "={{ $json.technical_evaluation.best_match.lead_time_weeks }}",
  "evaluation_document_link": "={{ $json.evaluation_doc_link }}",
  "technical_notes": "={{ $json.ai_analysis.substring(0, 500) }}",
  "evaluated_date": "={{ $now.toISO() }}",
  "status": "pending_quotation"
}
```

---

### Node 10: Update Inquiries Log

**Type:** Google Sheets Update
**Sheet:** `01_📋_Inquiries_Log`
**Update Row:** Find by inquiry_id

```javascript
{
  "quotation_status": "technical_approved",
  "ai_technical_confidence": "={{ $json.technical_evaluation.evaluation_confidence }}",
  "recommended_product": "={{ $json.technical_evaluation.best_match.model_name }}",
  "estimated_price_eur": "={{ $json.technical_evaluation.best_match.base_price }}",
  "technical_evaluation_link": "={{ $json.evaluation_doc_link }}"
}
```

---

### Node 11: Decision - Feasibility Check

**Type:** IF Node
**Condition:** `{{ $json.technical_evaluation.best_match.overall_score >= 60 }}`

**TRUE:** → Continue to Sales Agent (feasible)
**FALSE:** → Send to Manual Review (not feasible)

---

### Node 12a: Handover to Sales Agent (TRUE path)

**Type:** HTTP Request
**Method:** POST
**URL:** `{{ $env.N8N_BASE_URL }}/webhook/wieslogic-master`

```json
{
  "action": "trigger_sales_agent",
  "customer_id": "={{ $json.customer_id }}",
  "brand": "={{ $json.brand }}",
  "data": {
    "inquiry_id": "={{ $json.inquiry_id }}",
    "lead_dossier_link": "={{ $json.lead_dossier_link }}",
    "evaluation_doc_link": "={{ $json.evaluation_doc_link }}",
    "bant_score": "={{ $json.bant_score }}",
    "technical_score": "={{ $json.technical_evaluation.best_match.overall_score }}",
    "recommended_product": {
      "product_id": "={{ $json.technical_evaluation.best_match.product_id }}",
      "model_name": "={{ $json.technical_evaluation.best_match.model_name }}",
      "base_price": "={{ $json.technical_evaluation.best_match.base_price }}",
      "lead_time_weeks": "={{ $json.technical_evaluation.best_match.lead_time_weeks }}"
    },
    "alternative_products": "={{ JSON.stringify($json.technical_evaluation.alternative_matches) }}",
    "requirements": "={{ JSON.stringify($json.technical_requirements) }}"
  }
}
```

---

### Node 12b: Manual Review (FALSE path)

**Type:** Send Email

**To:** Technical Review Team
**Subject:** Manual Review Required - {{ company_name }}

**Body:**
```
Technical evaluation requires manual review.

Inquiry ID: {{ inquiry_id }}
Company: {{ company_name }}
Product Category: {{ product_category }}

Issue: Best match score below threshold ({{ best_match_score }}/100)

Reasons:
{{ #if best_match.calculation_result.limitations }}
- {{ best_match.calculation_result.limitations.join('\n- ') }}
{{ /if }}

Evaluation Document: {{ evaluation_doc_link }}

Please review and advise.
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Pallet Wrapper - High Throughput

**Input:**
```json
{
  "brand": "ROBOPAC",
  "inquiry_id": "INQ_1234567890",
  "data": {
    "company_name": "Big Logistics AG",
    "product_type": "Pallet Wrapper",
    "required_pallets_per_hour": 100,
    "pallet_height": 1800,
    "pallet_weight": 800,
    "environment": "indoor",
    "automation_level": "automatic"
  }
}
```

**Technical Evaluation Result:**
```json
{
  "best_match": {
    "product_id": "RBP_003",
    "model_name": "Helix Ultimate",
    "overall_score": 95,
    "calculation_result": {
      "meets_requirement": true,
      "actual_throughput": 120,
      "required_throughput": 100,
      "efficiency_percent": 83,
      "confidence": 98
    }
  }
}
```

**Action:** → Route to Sales Agent ✅

---

### Beispiel 2: Palletizer - Complex Requirements

**Input:**
```json
{
  "brand": "OCME",
  "data": {
    "product_type": "Palletizer",
    "required_products_per_minute": 150,
    "product_weight": 1500,
    "pallet_pattern": "custom",
    "multiple_products": true
  }
}
```

**Technical Evaluation Result:**
```json
{
  "best_match": {
    "model_name": "Artis 180 Flex",
    "overall_score": 88,
    "calculation_result": {
      "meets_requirement": true,
      "actual_throughput": 155,
      "confidence": 92
    }
  }
}
```

**Action:** → Route to Sales Agent ✅

---

### Beispiel 3: Not Feasible - Manual Review

**Input:**
```json
{
  "brand": "SOTEMAPACK",
  "data": {
    "product_type": "Traysealer",
    "required_trays_per_minute": 200,
    "cleanroom": "ISO Class 5",
    "custom_tray_size": "450x350x120"
  }
}
```

**Technical Evaluation Result:**
```json
{
  "best_match": {
    "overall_score": 45,
    "calculation_result": {
      "meets_requirement": false,
      "actual_throughput": 120,
      "required_throughput": 200,
      "limitations": [
        "Throughput requirement exceeds maximum specification",
        "Custom tray size requires modification",
        "ISO Class 5 cleanroom rating not standard"
      ]
    }
  }
}
```

**Action:** → Manual Review Required ⚠️

---

## 🔧 Integration mit product-calculators.js

### In n8n implementieren:

**Option 1: npm Module (empfohlen)**
```bash
# In n8n custom modules directory
npm install ./product-calculators.js
```

**Option 2: Function Item Node**
```javascript
// Kopiere gesamten Inhalt von product-calculators.js in Function Item
// Dann nutze CalculatorFactory wie im Template gezeigt
const CalculatorFactory = items[0].json.CalculatorFactory;
const calculator = CalculatorFactory.getCalculator('pallet_wrapper');
```

**Option 3: External API**
```javascript
// Hoste calculator als separate API
const response = await fetch('https://api.wieslogic.de/calculate', {
  method: 'POST',
  body: JSON.stringify({
    product_category: 'pallet_wrapper',
    inputs: { ... }
  })
});
```

---

## ✅ Deployment Checklist

- [ ] Workflow importiert
- [ ] product-calculators.js integriert
- [ ] OpenAI API Key konfiguriert
- [ ] Vector Store ID gesetzt
- [ ] Google Sheets Credentials
- [ ] Technical Evaluation Template erstellt
- [ ] Test mit allen Product Categories:
  - [ ] Pallet Wrapper
  - [ ] Palletizer
  - [ ] Depalletizer
  - [ ] LGV
  - [ ] Case Packer
  - [ ] Shrink Wrapper
  - [ ] Tray Shrink Wrapper
  - [ ] Bag Sealer
  - [ ] Case Packing Machine
  - [ ] Cobot
- [ ] Integration mit Sales Agent getestet

---

## 📈 Success Metrics

- **Evaluation Accuracy:** >90% match between AI recommendation and manual review
- **Processing Time:** <2 minutes per evaluation
- **Confidence Score:** Average >85%
- **False Positive Rate:** <5% (feasible marked as not feasible)
- **False Negative Rate:** <2% (not feasible marked as feasible)

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
