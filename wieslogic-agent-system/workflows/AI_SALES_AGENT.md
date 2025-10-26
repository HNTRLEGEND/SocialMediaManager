# AI_SALES_AGENT - Quotation Creation & Sales Management

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** Angebotserstellung und Sales-Prozess für alle AETNA Group Marken

---

## 📋 Übersicht

Der **AI_SALES_AGENT** übernimmt den Verkaufsprozess nach erfolgreicher technischer Evaluation. Er:

✅ **Erstellt Angebote** mit automatischer Preiskalkulation
✅ **Berechnet Discounts** basierend auf Deal-Size und Strategie
✅ **Generiert Quotation Documents** in Google Docs
✅ **Managed Payment Terms** und Delivery Conditions
✅ **Handled Approval Workflow** für große Discounts
✅ **Tracked Sales Pipeline** in Google Sheets

---

## 🎯 Hauptaufgaben

### 1. Price Calculation
- Base Price von empfohlenem Produkt
- Optional Features & Upgrades
- Installation & Training Costs
- Brand-spezifische Pricing Rules
- Volume Discounts & Deal Complexity

### 2. Discount Management
- Standard Discounts: 0-10% (auto-approved)
- Special Discounts: 10-20% (manager approval)
- Strategic Discounts: 20%+ (director approval)
- AETNA-weite Bundle Discounts (multi-brand deals)

### 3. Quotation Generation
- Professional Quote Document (Google Docs)
- Technical Specifications Summary
- Pricing Breakdown with Options
- Payment Terms & Delivery Timeline
- Terms & Conditions per Brand

### 4. Sales Pipeline Management
- Writes to `02💰Quotation_Options`
- Updates `01_📋_Inquiries_Log`
- Tracks in `13📑Master_Log`
- Creates Follow-up Tasks

### 5. Multi-Brand Opportunities
- Detects cross-sell opportunities
- Bundles multiple AETNA products
- Calculates bundle discounts
- Coordinates multi-brand quotes

---

## 🔄 Workflow-Ablauf

```
Handover from Technical Agent → Calculate Pricing → Check Discount Rules →
Generate Quotation → Approval Workflow → Send to Customer → Track Pipeline
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger

**Path:** `/webhook/sales-agent`
**Method:** POST
**Auth:** Bearer Token

**Payload von TECHNICAL AGENT:**
```json
{
  "master_execution_id": "MASTER_123...",
  "customer_id": "AETNA_GROUP_001",
  "brand": "ROBOPAC",
  "brand_config": {
    "min_budget_eur": 25000,
    "target_industries": ["logistics", "warehousing"],
    "discount_authority": {
      "standard": 10,
      "manager": 20,
      "director": 30
    }
  },
  "inquiry_id": "INQ_1234567890",
  "lead_dossier_link": "https://docs.google.com/...",
  "evaluation_doc_link": "https://docs.google.com/...",
  "bant_score": 90,
  "technical_score": 92,
  "data": {
    "company_name": "Logistics GmbH",
    "contact_person": "John Doe",
    "email": "john@logistics.de",
    "phone": "+49 123 456789",
    "industry": "logistics"
  },
  "recommended_product": {
    "product_id": "RBP_002",
    "model_name": "Helix Premium",
    "base_price": 65000,
    "lead_time_weeks": 10,
    "actual_throughput": 85,
    "efficiency_percent": 94
  },
  "alternative_products": [
    {
      "product_id": "RBP_001",
      "model_name": "Helix Standard",
      "base_price": 45000,
      "lead_time_weeks": 8
    }
  ],
  "requirements": {
    "product_category": "pallet_wrapper",
    "throughput": {
      "value": 80,
      "unit": "pallets_per_hour"
    },
    "complexity": "standard"
  }
}
```

---

### Node 2: Load Product Pricing Details

**Type:** Google Sheets Lookup (Multiple Sheets)

**2a) Product Base Pricing** from `06_📦_Product_Portfolio`
```javascript
{
  "filter": "Product_ID = '{{ $json.recommended_product.product_id }}'"
}
```

**Returns:**
```json
{
  "Product_ID": "RBP_002",
  "Model_Name": "Helix Premium",
  "Base_Price_EUR": 65000,
  "Installation_Cost_EUR": 3500,
  "Training_Cost_EUR": 1500,
  "Warranty_Years": 2,
  "Extended_Warranty_EUR_per_year": 2500
}
```

**2b) Optional Features** from `06_📦_Product_Portfolio` (related items)
```javascript
{
  "filter": "Compatible_With CONTAINS '{{ $json.recommended_product.product_id }}'"
}
```

**Returns:**
```json
{
  "optional_features": [
    {
      "Feature_ID": "OPT_001",
      "Feature_Name": "Remote Monitoring System",
      "Price_EUR": 5000,
      "Recommended": "yes"
    },
    {
      "Feature_ID": "OPT_002",
      "Feature_Name": "Automatic Film Changeover",
      "Price_EUR": 3500,
      "Recommended": "no"
    }
  ]
}
```

---

### Node 3: Calculate Total Pricing

**Type:** Code (JavaScript)

```javascript
/**
 * PRICING CALCULATION ENGINE
 * Berechnet Gesamtpreis mit allen Komponenten
 */

const input = $input.item.json;
const product = input.recommended_product;
const pricingDetails = input.pricing_details;
const optionalFeatures = input.optional_features || [];
const requirements = input.requirements;
const brand = input.brand;

// Helper: Calculate base configuration price
function calculateBasePrice(product, pricingDetails) {
  return {
    product_base_price: pricingDetails.Base_Price_EUR || product.base_price,
    installation: pricingDetails.Installation_Cost_EUR || 0,
    training: pricingDetails.Training_Cost_EUR || 0,
    commissioning: 1500, // Standard commissioning fee
    documentation: 500 // Technical documentation
  };
}

// Helper: Recommend optional features based on requirements
function recommendFeatures(optionalFeatures, requirements, bantScore) {
  const recommended = [];

  for (const feature of optionalFeatures) {
    let recommendationScore = 0;

    // High BANT score = recommend premium features
    if (bantScore >= 80 && feature.Recommended === 'yes') {
      recommendationScore += 50;
    }

    // Complex requirements = recommend advanced features
    if (requirements.complexity === 'complex') {
      recommendationScore += 30;
    }

    // Automatic automation = recommend automation features
    if (requirements.automation_specs?.level === 'automatic') {
      if (feature.Feature_Name.toLowerCase().includes('automatic') ||
          feature.Feature_Name.toLowerCase().includes('remote')) {
        recommendationScore += 40;
      }
    }

    if (recommendationScore >= 50) {
      recommended.push({
        ...feature,
        recommendation_score: recommendationScore,
        justification: this.getFeatureJustification(feature, requirements)
      });
    }
  }

  return recommended.sort((a, b) => b.recommendation_score - a.recommendation_score);
}

// Helper: Get feature justification
function getFeatureJustification(feature, requirements) {
  const name = feature.Feature_Name.toLowerCase();

  if (name.includes('remote') || name.includes('monitoring')) {
    return 'Recommended for proactive maintenance and uptime optimization';
  }
  if (name.includes('automatic')) {
    return 'Reduces operator intervention and improves efficiency';
  }
  if (name.includes('safety')) {
    return 'Enhances workplace safety and compliance';
  }

  return 'Enhances overall system performance';
}

// Helper: Calculate volume discount
function calculateVolumeDiscount(totalValue) {
  if (totalValue >= 200000) return 0.12; // 12% for large deals
  if (totalValue >= 100000) return 0.08; // 8% for medium deals
  if (totalValue >= 50000) return 0.05; // 5% for small deals
  return 0; // No discount
}

// Helper: Calculate complexity surcharge
function calculateComplexitySurcharge(requirements) {
  if (requirements.complexity === 'complex') return 0.10; // +10%
  if (requirements.complexity === 'standard') return 0.05; // +5%
  return 0; // No surcharge for simple
}

// Helper: Calculate multi-brand discount
function calculateMultiBrandDiscount(brands) {
  const uniqueBrands = new Set(brands);
  if (uniqueBrands.size >= 3) return 0.15; // 15% for 3+ brands
  if (uniqueBrands.size >= 2) return 0.10; // 10% for 2 brands
  return 0;
}

// CALCULATE BASE PRICE

const basePrice = calculateBasePrice(product, pricingDetails);
const basePriceTotal = Object.values(basePrice).reduce((sum, val) => sum + val, 0);

// RECOMMEND OPTIONAL FEATURES

const recommendedFeatures = recommendFeatures(
  optionalFeatures,
  requirements,
  input.bant_score
);

// Calculate optional features total
const optionalFeaturesTotal = recommendedFeatures
  .reduce((sum, f) => sum + (f.Price_EUR || 0), 0);

// CALCULATE SUBTOTAL

const subtotal = basePriceTotal + optionalFeaturesTotal;

// CALCULATE DISCOUNTS & SURCHARGES

const volumeDiscount = calculateVolumeDiscount(subtotal);
const complexitySurcharge = calculateComplexitySurcharge(requirements);

// Net adjustments
const discountAmount = subtotal * volumeDiscount;
const surchargeAmount = subtotal * complexitySurcharge;

// CALCULATE TOTAL

const totalBeforeTax = subtotal - discountAmount + surchargeAmount;
const taxRate = 0.19; // 19% MwSt (Germany)
const taxAmount = totalBeforeTax * taxRate;
const totalIncludingTax = totalBeforeTax + taxAmount;

// PAYMENT TERMS CALCULATION

const paymentTerms = calculatePaymentTerms(totalIncludingTax, product.lead_time_weeks);

// Helper: Calculate payment terms
function calculatePaymentTerms(total, leadTimeWeeks) {
  return {
    deposit_percent: 30,
    deposit_amount: Math.round(total * 0.30),
    deposit_due: 'Upon order confirmation',

    progress_percent: 40,
    progress_amount: Math.round(total * 0.40),
    progress_due: 'Before shipment',

    final_percent: 30,
    final_amount: Math.round(total * 0.30),
    final_due: 'Within 30 days of delivery',

    total_amount: total,
    payment_method: 'Bank transfer',
    currency: 'EUR'
  };
}

// DETERMINE DISCOUNT APPROVAL LEVEL

let approvalLevel = 'auto_approved';
let requiresApproval = false;
const effectiveDiscountPercent = (discountAmount / subtotal) * 100;

if (effectiveDiscountPercent > 20) {
  approvalLevel = 'director_approval';
  requiresApproval = true;
} else if (effectiveDiscountPercent > 10) {
  approvalLevel = 'manager_approval';
  requiresApproval = true;
}

// BUILD PRICING SUMMARY

return {
  json: {
    ...input,
    pricing_calculation: {
      // Base pricing
      base_price_breakdown: basePrice,
      base_price_total: basePriceTotal,

      // Optional features
      recommended_features: recommendedFeatures,
      optional_features_total: optionalFeaturesTotal,

      // Subtotal
      subtotal: subtotal,

      // Adjustments
      volume_discount_percent: volumeDiscount * 100,
      volume_discount_amount: discountAmount,
      complexity_surcharge_percent: complexitySurcharge * 100,
      complexity_surcharge_amount: surchargeAmount,

      // Totals
      total_before_tax: totalBeforeTax,
      tax_rate_percent: taxRate * 100,
      tax_amount: taxAmount,
      total_including_tax: totalIncludingTax,

      // Payment
      payment_terms: paymentTerms,

      // Approval
      approval_level: approvalLevel,
      requires_approval: requiresApproval,
      effective_discount_percent: effectiveDiscountPercent
    },
    quotation_id: 'QUO_' + Date.now() + '_' + input.inquiry_id.split('_')[1]
  }
};
```

**Output:**
```json
{
  "pricing_calculation": {
    "base_price_breakdown": {
      "product_base_price": 65000,
      "installation": 3500,
      "training": 1500,
      "commissioning": 1500,
      "documentation": 500
    },
    "base_price_total": 72000,
    "recommended_features": [
      {
        "Feature_Name": "Remote Monitoring System",
        "Price_EUR": 5000,
        "recommendation_score": 90,
        "justification": "Recommended for proactive maintenance..."
      }
    ],
    "optional_features_total": 5000,
    "subtotal": 77000,
    "volume_discount_percent": 5,
    "volume_discount_amount": 3850,
    "total_including_tax": 87031,
    "approval_level": "auto_approved",
    "requires_approval": false
  },
  "quotation_id": "QUO_1729958400000_1234567890"
}
```

---

### Node 4: Check Multi-Brand Opportunities

**Type:** Code (JavaScript)

```javascript
/**
 * CROSS-SELL & BUNDLE DETECTION
 * Erkennt Opportunities für Multi-Brand Deals
 */

const input = $input.item.json;
const company = input.data.company_name;
const currentBrand = input.brand;
const industry = input.data.industry;
const productCategory = input.requirements.product_category;

// Helper: Detect cross-sell opportunities
function detectCrossSellOpportunities(productCategory, industry, currentBrand) {
  const opportunities = [];

  // Pallet Wrapper → suggest Palletizer (ROBOPAC → OCME)
  if (productCategory === 'pallet_wrapper' && currentBrand === 'ROBOPAC') {
    opportunities.push({
      target_brand: 'OCME',
      target_product_category: 'palletizer',
      justification: 'Complete end-of-line solution: Palletizing + Wrapping',
      bundle_discount_percent: 10,
      priority: 'high'
    });
  }

  // Palletizer → suggest Case Packer (OCME → OCME)
  if (productCategory === 'palletizer' && currentBrand === 'OCME') {
    opportunities.push({
      target_brand: 'OCME',
      target_product_category: 'case_packer',
      justification: 'Upstream solution: Case packing before palletizing',
      bundle_discount_percent: 8,
      priority: 'medium'
    });
  }

  // Case Erector → suggest Case Sealer (MEYPACK → MEYPACK)
  if (productCategory === 'case_erector' && currentBrand === 'MEYPACK') {
    opportunities.push({
      target_brand: 'MEYPACK',
      target_product_category: 'case_sealer',
      justification: 'Complete case handling: Erecting + Sealing',
      bundle_discount_percent: 10,
      priority: 'high'
    });
  }

  // Food industry → suggest Traysealer (any → SOTEMAPACK)
  if (industry === 'food' || industry === 'beverage') {
    if (!['traysealer', 'thermoformer'].includes(productCategory)) {
      opportunities.push({
        target_brand: 'SOTEMAPACK',
        target_product_category: 'traysealer',
        justification: 'Food packaging solution for portion control',
        bundle_discount_percent: 8,
        priority: 'low'
      });
    }
  }

  // Beverage/Liquid → suggest Bag-in-Box (any → PRASMATIC)
  if (industry === 'beverage' || industry === 'chemicals') {
    if (productCategory !== 'bag_in_box') {
      opportunities.push({
        target_brand: 'PRASMATIC',
        target_product_category: 'bag_in_box',
        justification: 'Liquid packaging solution for bulk products',
        bundle_discount_percent: 8,
        priority: 'low'
      });
    }
  }

  return opportunities;
}

// DETECT OPPORTUNITIES

const crossSellOpportunities = detectCrossSellOpportunities(
  productCategory,
  industry,
  currentBrand
);

return {
  json: {
    ...input,
    cross_sell_analysis: {
      has_opportunities: crossSellOpportunities.length > 0,
      opportunities: crossSellOpportunities,
      current_brand: currentBrand,
      potential_brands: [...new Set(crossSellOpportunities.map(o => o.target_brand))]
    }
  }
};
```

---

### Node 5: Generate Quotation Document

**Type:** Google Docs Create

**Template:**
```markdown
# QUOTATION - {{ brand }}

**Quotation Number:** {{ quotation_id }}
**Date:** {{ $now.toFormat('dd.MM.yyyy') }}
**Valid Until:** {{ $now.plus({days: 30}).toFormat('dd.MM.yyyy') }}

---

## CUSTOMER INFORMATION

**Company:** {{ company_name }}
**Contact Person:** {{ contact_person }}
**Email:** {{ email }}
**Phone:** {{ phone }}

---

## RECOMMENDED SOLUTION

### {{ recommended_product.model_name }}

{{ ai_technical_analysis_summary }}

**Performance:**
- Throughput: {{ recommended_product.actual_throughput }} {{ requirements.throughput.unit }}
- Efficiency: {{ recommended_product.efficiency_percent }}%
- Technical Score: {{ technical_score }}/100

---

## PRICING BREAKDOWN

### Base Configuration

| Item | Description | Price (EUR) |
|------|-------------|-------------|
| {{ model_name }} | Base machine | €{{ base_price_breakdown.product_base_price | number_format }} |
| Installation | On-site installation | €{{ base_price_breakdown.installation | number_format }} |
| Training | Operator training (2 days) | €{{ base_price_breakdown.training | number_format }} |
| Commissioning | System commissioning | €{{ base_price_breakdown.commissioning | number_format }} |
| Documentation | Technical documentation | €{{ base_price_breakdown.documentation | number_format }} |
| **Subtotal** | | **€{{ base_price_total | number_format }}** |

### Recommended Optional Features

{{ #each recommended_features }}
| {{ this.Feature_Name }} | {{ this.justification }} | €{{ this.Price_EUR | number_format }} |
{{ /each }}

| **Optional Features Total** | | **€{{ optional_features_total | number_format }}** |

---

### Price Summary

| Item | Amount (EUR) |
|------|--------------|
| Subtotal | €{{ subtotal | number_format }} |
{{ #if volume_discount_amount }}
| Volume Discount (-{{ volume_discount_percent }}%) | -€{{ volume_discount_amount | number_format }} |
{{ /if }}
{{ #if complexity_surcharge_amount }}
| Complexity Surcharge (+{{ complexity_surcharge_percent }}%) | +€{{ complexity_surcharge_amount | number_format }} |
{{ /if }}
| **Total (excl. Tax)** | **€{{ total_before_tax | number_format }}** |
| Tax ({{ tax_rate_percent }}%) | €{{ tax_amount | number_format }} |
| **TOTAL (incl. Tax)** | **€{{ total_including_tax | number_format }}** |

---

## PAYMENT TERMS

- **Deposit ({{ payment_terms.deposit_percent }}%):** €{{ payment_terms.deposit_amount | number_format }} - {{ payment_terms.deposit_due }}
- **Progress Payment ({{ payment_terms.progress_percent }}%):** €{{ payment_terms.progress_amount | number_format }} - {{ payment_terms.progress_due }}
- **Final Payment ({{ payment_terms.final_percent }}%):** €{{ payment_terms.final_amount | number_format }} - {{ payment_terms.final_due }}

**Payment Method:** {{ payment_terms.payment_method }}
**Currency:** {{ payment_terms.currency }}

---

## DELIVERY & LEAD TIME

- **Estimated Lead Time:** {{ lead_time_weeks }} weeks from order confirmation
- **Delivery:** Ex-Works (Incoterms 2020)
- **Installation Timeline:** 1 week
- **Training:** 2 days on-site

---

## WARRANTY & SUPPORT

- **Standard Warranty:** {{ warranty_years }} years
- **Support Hotline:** 24/7 available
- **Spare Parts:** Guaranteed availability for 10 years

{{ #if extended_warranty_available }}
**Optional Extended Warranty:** €{{ extended_warranty_price }}/year
{{ /if }}

---

{{ #if cross_sell_analysis.has_opportunities }}
## ADDITIONAL OPPORTUNITIES

We identified complementary solutions that could enhance your production line:

{{ #each cross_sell_analysis.opportunities }}
### {{ this.target_brand }} - {{ this.target_product_category }}

{{ this.justification }}

**Bundle Discount Available:** {{ this.bundle_discount_percent }}% when ordered together

{{ /each }}

*Contact your sales representative to discuss these opportunities.*
{{ /if }}

---

## TERMS & CONDITIONS

1. **Validity:** This quotation is valid for 30 days from date of issue
2. **Price Basis:** Prices in EUR, ex-works
3. **Delivery:** Subject to final technical review and site survey
4. **Installation:** Requires suitable foundation and utilities
5. **Training:** Included in price (2 days, up to 4 operators)
6. **Warranty:** Standard manufacturer warranty applies
7. **Taxes:** Local taxes and duties not included

---

## TECHNICAL DOCUMENTATION

**Detailed Technical Evaluation:** {{ evaluation_doc_link }}
**Lead Dossier:** {{ lead_dossier_link }}

---

## ACCEPTANCE

To accept this quotation, please:
1. Sign and return this document
2. Provide purchase order
3. Transfer deposit payment

**Authorized Signature:** ___________________________

**Date:** ___________________________

---

**Prepared by:** AI Sales Agent v2025.10.2
**Contact:** {{ sales_representative_email }}
**Phone:** {{ sales_representative_phone }}

*{{ brand }} is part of AETNA Group - Leading the packaging industry worldwide*
```

---

### Node 6: Decision - Requires Approval?

**Type:** IF Node
**Condition:** `{{ $json.pricing_calculation.requires_approval === true }}`

**TRUE:** → Send to Approval Workflow
**FALSE:** → Continue to Write Quotation Log

---

### Node 7a: Send for Approval (TRUE path)

**Type:** Send Email

**To:** Manager/Director (based on approval_level)
**Subject:** Quotation Approval Required - {{ company_name }}

**Body:**
```
Quotation requires approval before sending to customer.

**Quotation ID:** {{ quotation_id }}
**Company:** {{ company_name }}
**Amount:** €{{ total_including_tax }}

**Discount Details:**
- Effective Discount: {{ effective_discount_percent }}%
- Approval Level Required: {{ approval_level }}

**Deal Quality:**
- BANT Score: {{ bant_score }}/100
- Technical Score: {{ technical_score }}/100

**Quotation Document:** {{ quotation_doc_link }}

Please approve or reject within 24 hours.

[APPROVE] [REJECT] [REQUEST CHANGES]
```

**Also writes to:** `12_🔐_Approval_Queue`

---

### Node 7b: Write Quotation Log (FALSE path / After Approval)

**Type:** Google Sheets Append
**Sheet:** `02💰Quotation_Options`

```javascript
{
  "quotation_id": "={{ $json.quotation_id }}",
  "inquiry_id": "={{ $json.inquiry_id }}",
  "customer_name": "={{ $json.data.company_name }}",
  "contact_person": "={{ $json.data.contact_person }}",
  "email": "={{ $json.data.email }}",
  "brand": "={{ $json.brand }}",
  "product_category": "={{ $json.requirements.product_category }}",
  "model_name": "={{ $json.recommended_product.model_name }}",
  "base_price_eur": "={{ $json.pricing_calculation.base_price_total }}",
  "optional_features_eur": "={{ $json.pricing_calculation.optional_features_total }}",
  "subtotal_eur": "={{ $json.pricing_calculation.subtotal }}",
  "discount_percent": "={{ $json.pricing_calculation.volume_discount_percent }}",
  "discount_amount_eur": "={{ $json.pricing_calculation.volume_discount_amount }}",
  "total_excl_tax_eur": "={{ $json.pricing_calculation.total_before_tax }}",
  "total_incl_tax_eur": "={{ $json.pricing_calculation.total_including_tax }}",
  "payment_terms": "30/40/30",
  "lead_time_weeks": "={{ $json.recommended_product.lead_time_weeks }}",
  "quotation_doc_link": "={{ $json.quotation_doc_link }}",
  "bant_score": "={{ $json.bant_score }}",
  "technical_score": "={{ $json.technical_score }}",
  "cross_sell_opportunities": "={{ $json.cross_sell_analysis.has_opportunities ? 'yes' : 'no' }}",
  "approval_status": "={{ $json.pricing_calculation.requires_approval ? 'pending_approval' : 'approved' }}",
  "created_date": "={{ $now.toISO() }}",
  "valid_until_date": "={{ $now.plus({days: 30}).toISO() }}",
  "status": "sent_to_customer"
}
```

---

### Node 8: Update Inquiries Log

**Type:** Google Sheets Update
**Sheet:** `01_📋_Inquiries_Log`
**Update Row:** Find by inquiry_id

```javascript
{
  "quotation_status": "quotation_sent",
  "quotation_id": "={{ $json.quotation_id }}",
  "quotation_amount_eur": "={{ $json.pricing_calculation.total_including_tax }}",
  "quotation_sent_date": "={{ $now.toISO() }}",
  "quotation_doc_link": "={{ $json.quotation_doc_link }}"
}
```

---

### Node 9: Send Quotation to Customer

**Type:** Send Email (Gmail)

**To:** `{{ $json.data.email }}`
**CC:** `{{ sales_representative_email }}`
**Subject:** Your Quotation from {{ brand }} - {{ model_name }}

**Body:**
```
Dear {{ contact_person }},

Thank you for your interest in {{ brand }} solutions.

We are pleased to present our quotation for {{ model_name }}.

**Quotation Summary:**
- Solution: {{ model_name }}
- Total Investment: €{{ total_including_tax }}
- Delivery Time: {{ lead_time_weeks }} weeks

**Your Solution Delivers:**
- Throughput: {{ actual_throughput }} {{ throughput_unit }}
- Efficiency: {{ efficiency_percent }}%
- ROI Period: Estimated 18-24 months

**Next Steps:**
1. Review the detailed quotation (attached)
2. Schedule a call to discuss any questions
3. Provide purchase order to proceed

Please find your complete quotation attached.

This offer is valid until {{ valid_until_date }}.

{{ #if cross_sell_opportunities }}
We also identified additional opportunities to optimize your complete production line. Let's discuss these in our next call.
{{ /if }}

Best regards,
{{ sales_representative_name }}
{{ brand }} Sales Team
{{ sales_representative_email }}
{{ sales_representative_phone }}

---
AETNA Group - Your Partner in Packaging Solutions
```

**Attachments:**
- Quotation Document (PDF export from Google Docs)
- Technical Evaluation (PDF)
- Product Brochure

---

### Node 10: Create Follow-up Tasks

**Type:** Code (JavaScript)

```javascript
/**
 * FOLLOW-UP TASK CREATION
 * Erstellt automatische Follow-up Tasks
 */

const input = $input.item.json;

const followUpTasks = [
  {
    task_id: 'TASK_' + Date.now() + '_01',
    inquiry_id: input.inquiry_id,
    quotation_id: input.quotation_id,
    task_type: 'follow_up_call',
    task_description: 'Call customer to confirm quotation receipt',
    due_date: $now.plus({days: 2}).toISO(),
    priority: 'medium',
    assigned_to: 'sales_team',
    status: 'pending'
  },
  {
    task_id: 'TASK_' + Date.now() + '_02',
    inquiry_id: input.inquiry_id,
    quotation_id: input.quotation_id,
    task_type: 'follow_up_email',
    task_description: 'Send follow-up email if no response',
    due_date: $now.plus({days: 7}).toISO(),
    priority: 'low',
    assigned_to: 'sales_team',
    status: 'pending'
  },
  {
    task_id: 'TASK_' + Date.now() + '_03',
    inquiry_id: input.inquiry_id,
    quotation_id: input.quotation_id,
    task_type: 'quotation_expiry',
    task_description: 'Quotation expires - send renewal offer',
    due_date: $now.plus({days: 30}).toISO(),
    priority: 'high',
    assigned_to: 'sales_team',
    status: 'pending'
  }
];

return { json: { ...input, follow_up_tasks: followUpTasks } };
```

---

### Node 11: Write Follow-up Tasks

**Type:** Google Sheets Append (Loop over tasks)
**Sheet:** `10_✅_Tasks_Workflow`

```javascript
{
  "task_id": "={{ $json.task_id }}",
  "inquiry_id": "={{ $json.inquiry_id }}",
  "quotation_id": "={{ $json.quotation_id }}",
  "task_type": "={{ $json.task_type }}",
  "task_description": "={{ $json.task_description }}",
  "due_date": "={{ $json.due_date }}",
  "priority": "={{ $json.priority }}",
  "assigned_to": "={{ $json.assigned_to }}",
  "status": "={{ $json.status }}",
  "created_date": "={{ $now.toISO() }}"
}
```

---

### Node 12: Log to Master Log

**Type:** Google Sheets Append
**Sheet:** `13📑Master_Log`

```javascript
{
  "execution_id": "={{ $json.master_execution_id }}",
  "step_name": "sales_agent_quotation_sent",
  "agent_name": "AI_SALES_AGENT",
  "inquiry_id": "={{ $json.inquiry_id }}",
  "quotation_id": "={{ $json.quotation_id }}",
  "customer_name": "={{ $json.data.company_name }}",
  "brand": "={{ $json.brand }}",
  "action": "quotation_created_and_sent",
  "quotation_amount_eur": "={{ $json.pricing_calculation.total_including_tax }}",
  "result": "success",
  "timestamp": "={{ $now.toISO() }}",
  "notes": "Quotation sent to customer. Follow-up tasks created."
}
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Standard Quotation - Auto-approved

**Input:**
```json
{
  "brand": "ROBOPAC",
  "bant_score": 85,
  "technical_score": 90,
  "recommended_product": {
    "model_name": "Helix Premium",
    "base_price": 65000
  }
}
```

**Pricing Result:**
```json
{
  "subtotal": 77000,
  "volume_discount_percent": 5,
  "total_including_tax": 87031,
  "approval_level": "auto_approved",
  "requires_approval": false
}
```

**Action:** → Send quotation directly to customer ✅

---

### Beispiel 2: Large Deal - Manager Approval Required

**Input:**
```json
{
  "brand": "OCME",
  "bant_score": 95,
  "technical_score": 92,
  "recommended_product": {
    "model_name": "Artis 180 Flex",
    "base_price": 180000
  }
}
```

**Pricing Result:**
```json
{
  "subtotal": 195000,
  "volume_discount_percent": 12,
  "discount_amount": 23400,
  "total_including_tax": 204204,
  "approval_level": "manager_approval",
  "requires_approval": true
}
```

**Action:** → Send to manager for approval ⚠️

---

### Beispiel 3: Multi-Brand Bundle Opportunity

**Input:**
```json
{
  "brand": "ROBOPAC",
  "product_category": "pallet_wrapper",
  "industry": "logistics"
}
```

**Cross-Sell Analysis:**
```json
{
  "cross_sell_analysis": {
    "has_opportunities": true,
    "opportunities": [
      {
        "target_brand": "OCME",
        "target_product_category": "palletizer",
        "bundle_discount_percent": 10,
        "priority": "high"
      }
    ]
  }
}
```

**Action:** → Quotation includes cross-sell section with bundle discount 💡

---

## ✅ Deployment Checklist

- [ ] Workflow importiert
- [ ] Google Sheets Credentials konfiguriert
- [ ] Google Docs Template erstellt
- [ ] Email Credentials (Gmail) konfiguriert
- [ ] Pricing Rules validiert für alle Brands
- [ ] Approval Workflow Email-Adressen gesetzt
- [ ] Payment Terms pro Brand konfiguriert
- [ ] Test Quotations erstellt für:
  - [ ] ROBOPAC
  - [ ] OCME
  - [ ] PRASMATIC
  - [ ] SOTEMAPACK
  - [ ] MEYPACK
- [ ] Integration mit Service Agent getestet

---

## 📈 Success Metrics

- **Quotation Generation Time:** <5 minutes
- **Pricing Accuracy:** >95%
- **Approval Time:** <24 hours
- **Quote-to-Order Conversion:** Target 25-30%
- **Cross-sell Hit Rate:** Target 15-20%

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
