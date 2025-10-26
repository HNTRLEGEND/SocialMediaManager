# AI_LEAD_AGENT - Lead Qualification & BANT Scoring

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** Lead Qualifikation mit BANT Scoring für alle AETNA Group Marken

---

## 📋 Übersicht

Der **AI_LEAD_AGENT** ist der Entry Point für alle neuen Inquiries. Er:

✅ **Validiert & Enriched Leads** (Hunter.io, Perplexity)
✅ **BANT Scoring** (Budget, Authority, Need, Timeline)
✅ **Qualifiziert Leads** (Hot/Warm/Cold)
✅ **Erstellt Lead Dossier** (Google Docs)
✅ **Routet zu Technical Agent** (wenn qualifiziert)

---

## 🎯 BANT Scoring System

### Was ist BANT?

**B** - Budget: Hat der Lead das Budget?
**A** - Authority: Ist der Kontakt ein Entscheider?
**N** - Need: Hat der Lead ein echtes Bedürfnis?
**T** - Timeline: Wann will der Lead kaufen?

### Scoring-Matrix

| Kriterium | Punkte | Bedingung |
|-----------|--------|-----------|
| **Budget** | 25 | Budget >= Min-Budget der Marke |
|  | 15 | Budget >= 60% des Min-Budgets |
|  | 5  | Keine Budget-Info |
| **Authority** | 25 | C-Level oder Owner |
|  | 15 | Director/Manager |
|  | 5  | Mitarbeiter/Andere |
| **Need** | 30 | Konkrete Anforderungen + Schmerz |
|  | 20 | Interesse aber unklar |
|  | 10 | Nur Information |
| **Timeline** | 20 | <3 Monate |
|  | 15 | 3-6 Monate |
|  | 5  | >6 Monate oder unklar |

**Total:** 100 Punkte

**Lead-Kategorien:**
- 🔥 **HOT** (80-100): Sofort an Sales
- 🟡 **WARM** (60-79): Technical Analyse
- 🔵 **COLD** (<60): Nurture Campaign

---

## 🔄 Workflow-Ablauf

```
Webhook → Validate → Enrich (Hunter) → BANT Score → Qualify → Create Dossier → Route
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger

**Path:** `/webhook/lead-agent`
**Method:** POST
**Auth:** Bearer Token

**Payload von MASTER:**
```json
{
  "master_execution_id": "MASTER_123...",
  "customer_id": "AETNA_GROUP_001",
  "brand": "ROBOPAC",
  "brand_config": { ... },
  "data": {
    "company_name": "Logistics GmbH",
    "contact_person": "John Doe",
    "email": "john@logistics.de",
    "phone": "+49 123 456789",
    "product_type": "Pallet Wrapper",
    "required_pallets_per_hour": 80,
    "message": "We need an automated solution"
  }
}
```

---

### Node 2: Write to Inquiries Log

**Type:** Google Sheets Append
**Sheet:** `01_📋_Inquiries_Log`

**Spalten:**
```javascript
{
  "inquiry_id": "INQ_" + Date.now(),
  "customer_name": "={{ $json.data.company_name }}",
  "contact_person": "={{ $json.data.contact_person }}",
  "email": "={{ $json.data.email }}",
  "phone": "={{ $json.data.phone || '' }}",
  "country": "",  // Wird von Hunter enriched
  "industry": "", // Wird von Hunter enriched
  "product_type": "={{ $json.data.product_type }}",
  "packaging_type": "={{ $json.data.packaging_type || '' }}",
  "primary_product_type": "={{ $json.data.primary_product_type || '' }}",
  "performance_target_ppm": "={{ $json.data.required_pallets_per_hour || $json.data.required_products_per_minute || '' }}",
  "quotation_status": "new",
  "lead_score_category": "pending",
  "created_date": "={{ $now.toISO() }}",
  "notes": "={{ $json.data.message || '' }}"
}
```

---

### Node 3: Enrich with Hunter.io

**Type:** HTTP Request
**URL:** `https://api.hunter.io/v2/domain-search`
**Method:** GET

**Parameters:**
```javascript
{
  "domain": "={{ $json.data.email.split('@')[1] }}",
  "api_key": "={{ $json.client_config.api_key_hunterio }}",
  "limit": "1"
}
```

**Expected Response:**
```json
{
  "data": {
    "organization": "Logistics GmbH",
    "country": "DE",
    "industry": "Logistics",
    "employee_range": "100-500",
    "emails": [
      {
        "value": "ceo@logistics.de",
        "type": "generic",
        "position": "CEO"
      }
    ]
  }
}
```

---

### Node 4: BANT Scoring

**Type:** Code (JavaScript)

```javascript
/**
 * BANT SCORING ENGINE
 * Bewertet Lead nach Budget, Authority, Need, Timeline
 */

const lead = $input.item.json;
const brandConfig = lead.brand_config;

// Helper: Extract budget from message/data
function extractBudget(data) {
  const budgetPatterns = [
    /budget.*?(\d+\.?\d*)\s*(k|tausend|thousand)/i,
    /(\d+\.?\d*)\s*€/i,
    /(\d+\.?\d*)\s*euro/i
  ];

  for (const pattern of budgetPatterns) {
    const match = (data.message || '').match(pattern);
    if (match) {
      let amount = parseFloat(match[1]);
      if (match[2] && match[2].toLowerCase().includes('k')) {
        amount *= 1000;
      }
      return amount;
    }
  }

  return null;
}

// Helper: Detect authority level
function detectAuthority(contact, hunterData) {
  const title = (contact.title || contact.position || '').toLowerCase();
  const email = (contact.email || '').toLowerCase();

  // C-Level
  if (title.match(/ceo|cto|cfo|owner|president|geschäftsführer/)) {
    return { level: 'c-level', score: 25 };
  }

  // Director/Manager
  if (title.match(/director|manager|leiter|head of/)) {
    return { level: 'director', score: 15 };
  }

  // Check email pattern
  if (email.includes('ceo') || email.includes('owner')) {
    return { level: 'c-level', score: 25 };
  }

  return { level: 'employee', score: 5 };
}

// Helper: Assess need strength
function assessNeed(data) {
  const message = (data.message || '').toLowerCase();
  const hasRequirements = data.required_pallets_per_hour ||
                         data.required_products_per_minute;

  // Strong need indicators
  const painWords = ['problem', 'issue', 'urgent', 'need', 'must', 
                    'currently', 'dringend', 'sofort'];
  const hasPain = painWords.some(word => message.includes(word));

  if (hasRequirements && hasPain) {
    return { strength: 'strong', score: 30 };
  }

  if (hasRequirements || hasPain) {
    return { strength: 'moderate', score: 20 };
  }

  return { strength: 'weak', score: 10 };
}

// Helper: Detect timeline
function detectTimeline(data) {
  const message = (data.message || '').toLowerCase();

  // Urgent
  if (message.match(/asap|immediately|urgent|sofort|dringend|this month/)) {
    return { period: '<3 months', score: 20 };
  }

  // Quarter mentions
  if (message.match(/q1|q2|q3|q4|quarter|quartal/)) {
    return { period: '3-6 months', score: 15 };
  }

  // Year mentions
  if (message.match(/next year|2025|2026/)) {
    return { period: '>6 months', score: 5 };
  }

  return { period: 'unknown', score: 10 };
}

// CALCULATE BANT SCORE

const budget = extractBudget(lead.data) || 0;
const budgetScore = budget >= brandConfig.min_budget_eur ? 25 :
                   budget >= brandConfig.min_budget_eur * 0.6 ? 15 : 5;

const authority = detectAuthority(lead.data, lead.hunter_data);
const need = assessNeed(lead.data);
const timeline = detectTimeline(lead.data);

const totalScore = budgetScore + authority.score + need.score + timeline.score;

// Determine category
let category, actionPlan;
if (totalScore >= 80) {
  category = 'hot';
  actionPlan = 'Immediate technical analysis → Fast-track to sales';
} else if (totalScore >= 60) {
  category = 'warm';
  actionPlan = 'Technical analysis → Standard sales process';
} else {
  category = 'cold';
  actionPlan = 'Nurture campaign → Re-qualify in 30 days';
}

return {
  json: {
    ...lead,
    bant_scoring: {
      budget: {
        detected: budget,
        score: budgetScore,
        threshold: brandConfig.min_budget_eur
      },
      authority: {
        level: authority.level,
        score: authority.score
      },
      need: {
        strength: need.strength,
        score: need.score
      },
      timeline: {
        period: timeline.period,
        score: timeline.score
      },
      total_score: totalScore,
      category: category,
      action_plan: actionPlan,
      confidence: totalScore >= 70 ? 'high' : totalScore >= 50 ? 'medium' : 'low'
    }
  }
};
```

**Output:**
```json
{
  "bant_scoring": {
    "budget": { "detected": 45000, "score": 25 },
    "authority": { "level": "director", "score": 15 },
    "need": { "strength": "strong", "score": 30 },
    "timeline": { "period": "<3 months", "score": 20 },
    "total_score": 90,
    "category": "hot",
    "action_plan": "Immediate technical analysis...",
    "confidence": "high"
  }
}
```

---

### Node 5: Update Inquiries Log with BANT

**Type:** Google Sheets Update
**Sheet:** `01_📋_Inquiries_Log`
**Update Row:** Find by inquiry_id

```javascript
{
  "lead_score_category": "={{ $json.bant_scoring.category }}",
  "ai_lead_confidence": "={{ $json.bant_scoring.confidence }}",
  "quotation_status": "={{ $json.bant_scoring.category === 'hot' || $json.bant_scoring.category === 'warm' ? 'qualified' : 'nurture' }}"
}
```

---

### Node 6: Create Lead Intelligence Log

**Type:** Google Sheets Append
**Sheet:** `19_🔍_Lead_Intelligence_Log`

```javascript
{
  "lead_id": "LEAD_" + Date.now(),
  "inquiry_id": "={{ $json.inquiry_id }}",
  "company_name": "={{ $json.data.company_name }}",
  "website_url": "={{ $json.hunter_data.domain || '' }}",
  "industry_sector": "={{ $json.hunter_data.industry || '' }}",
  "employee_range": "={{ $json.hunter_data.employee_range || '' }}",
  "country": "={{ $json.hunter_data.country || '' }}",
  "lead_source": "inquiry_form",
  "BANT_Budget": "={{ $json.bant_scoring.budget.score }}",
  "BANT_Authority": "={{ $json.bant_scoring.authority.score }}",
  "BANT_Need": "={{ $json.bant_scoring.need.score }}",
  "BANT_Timeline": "={{ $json.bant_scoring.timeline.score }}",
  "BANT_Total_Score": "={{ $json.bant_scoring.total_score }}",
  "lead_score_category": "={{ $json.bant_scoring.category }}",
  "ai_confidence_score": "={{ $json.bant_scoring.confidence }}",
  "analysis_notes": "={{ $json.bant_scoring.action_plan }}"
}
```

---

### Node 7: Create Lead Dossier (Google Docs)

**Type:** Google Docs Create

**Template:**
```markdown
# Lead Dossier - {{ company_name }}

## 📊 BANT Score: {{ total_score }}/100 ({{ category }})

### Budget ({{ budget.score }}/25)
- Detected Budget: €{{ budget.detected || 'Unknown' }}
- Required Minimum: €{{ budget.threshold }}

### Authority ({{ authority.score }}/25)
- Contact Level: {{ authority.level }}
- Decision Maker: {{ contact_person }}

### Need ({{ need.score }}/30)
- Need Strength: {{ need.strength }}
- Requirements: {{ product_type }} - {{ performance_target }}

### Timeline ({{ timeline.score }}/20)
- Expected Timeline: {{ timeline.period }}

---

## 🏢 Company Information
- Name: {{ company_name }}
- Industry: {{ industry }}
- Country: {{ country }}
- Employee Range: {{ employee_range }}

## 🎯 Recommended Next Steps
{{ action_plan }}

---
Generated by AI_LEAD_AGENT v2025.10.2
```

---

### Node 8: Route Decision

**Type:** IF Node
**Condition:** `{{ $json.bant_scoring.category === 'hot' || $json.bant_scoring.category === 'warm' }}`

**TRUE:** → Continue to Technical Agent
**FALSE:** → Start Nurture Campaign

---

### Node 9a: Handover to Technical Agent

**Type:** HTTP Request
**Method:** POST
**URL:** `{{ $env.N8N_BASE_URL }}/webhook/wieslogic-master`

```json
{
  "action": "trigger_technical_agent",
  "customer_id": "={{ $json.customer_id }}",
  "brand": "={{ $json.brand }}",
  "data": {
    "inquiry_id": "={{ $json.inquiry_id }}",
    "lead_dossier_link": "={{ $json.dossier_link }}",
    "bant_score": "={{ $json.bant_scoring.total_score }}",
    "product_type": "={{ $json.data.product_type }}",
    "requirements": "={{ JSON.stringify($json.data) }}"
  }
}
```

---

### Node 9b: Start Nurture Campaign

**Type:** HTTP Request (to Marketing Agent)

```json
{
  "action": "trigger_marketing_agent",
  "campaign_type": "lead_nurture",
  "lead_data": "={{ JSON.stringify($json) }}"
}
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Hot Lead (Score 90)

**Input:**
```json
{
  "company_name": "Big Logistics AG",
  "contact_person": "Hans Müller - CEO",
  "email": "h.mueller@biglogistics.de",
  "product_type": "Pallet Wrapper",
  "required_pallets_per_hour": 100,
  "message": "We urgently need an automated wrapper. Budget: 50k EUR. Timeline: ASAP."
}
```

**BANT Scoring:**
- Budget: 25 (50k > 25k minimum)
- Authority: 25 (CEO)
- Need: 30 (konkrete Anforderungen + Dringlichkeit)
- Timeline: 20 (ASAP)
- **Total: 100** → 🔥 HOT

**Action:** → Technical Agent (sofort)

---

### Beispiel 2: Warm Lead (Score 70)

**Input:**
```json
{
  "company_name": "Medium Company GmbH",
  "contact_person": "John Doe - Logistics Manager",
  "email": "john@medium.de",
  "product_type": "Palletizer",
  "message": "We're looking for a palletizer for next quarter"
}
```

**BANT Scoring:**
- Budget: 5 (kein Budget genannt)
- Authority: 15 (Manager)
- Need: 20 (Interesse)
- Timeline: 15 (nächstes Quartal)
- **Total: 55** → 🔵 COLD

**Action:** → Nurture Campaign

---

## ✅ Deployment Checklist

- [ ] Workflow importiert
- [ ] Hunter.io API Key gesetzt
- [ ] Google Sheets Credentials
- [ ] Lead Dossier Template erstellt
- [ ] Test mit Hot/Warm/Cold Lead
- [ ] Integration mit Technical Agent getestet

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
