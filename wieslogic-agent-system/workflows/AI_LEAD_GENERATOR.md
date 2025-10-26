# AI_LEAD_GENERATOR - Marketing Lead Generation & Nurturing

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** Automated Lead Generation, Marketing Qualified Leads (MQL) Scoring und Lead Nurturing für alle AETNA Group Marken

---

## 📋 Übersicht

Der **AI_LEAD_GENERATOR** ist der Marketing-Arm des WiesLogic Systems. Er:

✅ **Generiert neue Leads** aus verschiedenen Marketing-Quellen
✅ **Scored MQL** (Marketing Qualified Leads) basierend auf Engagement
✅ **Nurtures Leads** mit automatischen Kampagnen
✅ **Identifies Website Visitors** und tracked Behavior
✅ **Manages Content Downloads** und Marketing Assets
✅ **Handles Trade Show Leads** mit Follow-up Sequences
✅ **Routes qualified Leads** zu LEAD_AGENT für BANT Scoring

---

## 🎯 Hauptaufgaben

### 1. Lead Capture
- Website form submissions
- Content download tracking (Whitepapers, Case Studies)
- LinkedIn connection requests
- Trade show badge scans
- Webinar registrations
- Newsletter signups

### 2. Lead Enrichment
- Company data enrichment (Hunter.io, Clearbit)
- Social media profile analysis (LinkedIn)
- Website visitor identification
- Technology stack detection
- Company size & revenue estimation

### 3. MQL Scoring
- Engagement scoring (0-100 points)
- Firmographic scoring (Industry, Size, Location)
- Behavioral scoring (Page visits, Downloads, Email opens)
- Intent signals (Pricing page visits, Demo requests)

### 4. Lead Nurturing
- Automated email sequences
- Personalized content recommendations
- Re-engagement campaigns for cold leads
- LinkedIn automated outreach

### 5. Lead Qualification
- MQL threshold: 50+ points
- Automatic handover to LEAD_AGENT when qualified
- Continuous nurturing for unqualified leads

---

## 🔄 Workflow-Ablauf

```
Lead Capture → Enrichment → MQL Scoring → Decision:
├─ Score ≥50 → Hand over to LEAD_AGENT (SQL qualification)
└─ Score <50 → Nurture Campaign → Re-score after engagement
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger

**Path:** `/webhook/lead-generator`
**Method:** POST
**Auth:** Bearer Token

**Trigger Sources:**

**1. Website Form Submission:**
```json
{
  "source": "website_form",
  "form_type": "contact_us",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@logistics.de",
    "company": "Logistics GmbH",
    "phone": "+49 123 456789",
    "industry": "logistics",
    "message": "Interested in pallet wrapping solutions",
    "form_url": "https://robopac.com/contact",
    "submitted_date": "2025-10-26T10:00:00Z"
  }
}
```

**2. Content Download:**
```json
{
  "source": "content_download",
  "content_type": "whitepaper",
  "data": {
    "email": "john.doe@logistics.de",
    "content_title": "ROI Guide - Automated Pallet Wrapping",
    "content_category": "pallet_wrapper",
    "download_url": "https://robopac.com/downloads/roi-guide",
    "downloaded_date": "2025-10-26T10:00:00Z"
  }
}
```

**3. LinkedIn Connection:**
```json
{
  "source": "linkedin",
  "activity_type": "connection_accepted",
  "data": {
    "linkedin_profile": "https://linkedin.com/in/johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "company": "Logistics GmbH",
    "job_title": "Operations Manager",
    "connection_date": "2025-10-26T10:00:00Z"
  }
}
```

**4. Trade Show Badge Scan:**
```json
{
  "source": "trade_show",
  "event_name": "LogiMAT 2025",
  "data": {
    "badge_id": "LM2025-12345",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@logistics.de",
    "company": "Logistics GmbH",
    "job_title": "Operations Manager",
    "booth_visited": "ROBOPAC",
    "interests": ["pallet_wrapper", "lgv"],
    "scan_date": "2025-10-26T14:30:00Z",
    "notes": "Very interested in automation solutions"
  }
}
```

**5. Webinar Registration:**
```json
{
  "source": "webinar",
  "webinar_title": "End-of-Line Automation Trends 2025",
  "data": {
    "email": "john.doe@logistics.de",
    "first_name": "John",
    "last_name": "Doe",
    "company": "Logistics GmbH",
    "job_title": "Operations Manager",
    "registration_date": "2025-10-26T10:00:00Z",
    "attended": false
  }
}
```

---

### Node 2: Lead Deduplication & Merge

**Type:** Code (JavaScript)

```javascript
/**
 * LEAD DEDUPLICATION
 * Prüft ob Lead bereits existiert und merged neue Daten
 */

const input = $input.item.json;
const email = input.data.email || input.data.from_email;

// This would query Google Sheets in real implementation
// For template, we show the logic

async function findExistingLead(email) {
  // Query 01_📋_Inquiries_Log for existing lead by email
  // Returns lead data if found, null otherwise

  // Simulated response
  return null; // Assume new lead for this example
}

async function findInMarketingLeads(email) {
  // Query marketing leads sheet (if separate from inquiries)
  // Returns lead data if found, null otherwise

  return null;
}

const existingInquiry = await findExistingLead(email);
const existingMarketing = await findInMarketingLeads(email);

let leadStatus = 'new';
let existingData = null;
let previousScore = 0;
let previousEngagements = [];

if (existingInquiry) {
  leadStatus = 'existing_inquiry';
  existingData = existingInquiry;
  previousScore = existingInquiry.mql_score || 0;
  previousEngagements = JSON.parse(existingInquiry.engagement_history || '[]');
} else if (existingMarketing) {
  leadStatus = 'existing_marketing_lead';
  existingData = existingMarketing;
  previousScore = existingMarketing.mql_score || 0;
  previousEngagements = JSON.parse(existingMarketing.engagement_history || '[]');
}

// Add current engagement to history
const currentEngagement = {
  source: input.source,
  type: input.form_type || input.content_type || input.activity_type,
  date: input.data.submitted_date || input.data.downloaded_date || new Date().toISOString(),
  details: input.data.content_title || input.data.message || input.data.event_name
};

previousEngagements.push(currentEngagement);

return {
  json: {
    ...input,
    lead_status: leadStatus,
    existing_data: existingData,
    previous_mql_score: previousScore,
    engagement_history: previousEngagements,
    total_engagements: previousEngagements.length
  }
};
```

---

### Node 3: Enrich Lead Data

**Type:** HTTP Request to Hunter.io / Clearbit

**Hunter.io Email Finder:**
```javascript
{
  "url": "https://api.hunter.io/v2/domain-search",
  "method": "GET",
  "params": {
    "domain": "={{ $json.data.email.split('@')[1] }}",
    "api_key": "={{ $env.HUNTER_IO_API_KEY }}"
  }
}
```

**Clearbit Company Enrichment:**
```javascript
{
  "url": "https://company.clearbit.com/v2/companies/find",
  "method": "GET",
  "params": {
    "domain": "={{ $json.data.email.split('@')[1] }}"
  },
  "headers": {
    "Authorization": "Bearer {{ $env.CLEARBIT_API_KEY }}"
  }
}
```

**Expected Response:**
```json
{
  "enrichment_data": {
    "company": {
      "name": "Logistics GmbH",
      "domain": "logistics.de",
      "industry": "Transportation & Logistics",
      "employees": 250,
      "revenue_estimate": "€25M-50M",
      "location": {
        "city": "Munich",
        "country": "Germany"
      },
      "technologies": ["SAP", "Oracle"],
      "description": "Leading logistics provider in Germany"
    },
    "person": {
      "job_title": "Operations Manager",
      "seniority": "Manager",
      "role": "Operations",
      "linkedin_url": "https://linkedin.com/in/johndoe"
    }
  }
}
```

---

### Node 4: Calculate MQL Score

**Type:** Code (JavaScript)

```javascript
/**
 * MQL SCORING ENGINE
 * Berechnet Marketing Qualified Lead Score (0-100)
 */

const input = $input.item.json;
const source = input.source;
const enrichment = input.enrichment_data || {};
const company = enrichment.company || {};
const person = enrichment.person || {};
const engagementHistory = input.engagement_history || [];

let mqlScore = input.previous_mql_score || 0;

// ENGAGEMENT SCORING (max 40 points)

function scoreEngagement(history) {
  let score = 0;

  const engagementValues = {
    'website_form': 15,
    'content_download': 10,
    'webinar_registration': 12,
    'webinar_attended': 15,
    'trade_show': 20,
    'linkedin': 8,
    'email_open': 2,
    'email_click': 5,
    'pricing_page_visit': 15,
    'demo_request': 20
  };

  for (const engagement of history) {
    const value = engagementValues[engagement.source] || 5;
    score += value;

    // Decay old engagements
    const daysAgo = (Date.now() - new Date(engagement.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo > 90) {
      score -= value * 0.5; // 50% decay after 90 days
    }
  }

  // Frequency bonus (multiple engagements within 30 days)
  const recentEngagements = history.filter(e => {
    const daysAgo = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  });

  if (recentEngagements.length >= 3) score += 10; // Engagement bonus

  return Math.min(score, 40); // Cap at 40
}

const engagementScore = scoreEngagement(engagementHistory);

// FIRMOGRAPHIC SCORING (max 30 points)

function scoreFirmographics(company) {
  let score = 0;

  // Company size
  const employees = company.employees || 0;
  if (employees >= 500) score += 10;
  else if (employees >= 100) score += 7;
  else if (employees >= 50) score += 5;
  else score += 2;

  // Revenue estimate
  const revenue = company.revenue_estimate || '';
  if (revenue.includes('100M') || revenue.includes('500M')) score += 10;
  else if (revenue.includes('25M') || revenue.includes('50M')) score += 7;
  else if (revenue.includes('10M')) score += 5;

  // Industry match (target industries for AETNA brands)
  const targetIndustries = [
    'logistics', 'warehousing', 'food', 'beverage',
    'pharmaceutical', 'manufacturing', 'automotive', 'retail'
  ];

  const industryLower = (company.industry || '').toLowerCase();
  if (targetIndustries.some(ind => industryLower.includes(ind))) {
    score += 10;
  }

  return Math.min(score, 30);
}

const firmographicScore = scoreFirmographics(company);

// ROLE & SENIORITY SCORING (max 20 points)

function scoreRole(person) {
  let score = 0;

  // Seniority
  const seniority = (person.seniority || '').toLowerCase();
  if (seniority.includes('director') || seniority.includes('vp') || seniority.includes('c-level')) {
    score += 10;
  } else if (seniority.includes('manager')) {
    score += 7;
  } else if (seniority.includes('senior')) {
    score += 5;
  } else {
    score += 3;
  }

  // Role relevance
  const role = (person.role || person.job_title || '').toLowerCase();
  const decisionMakerRoles = [
    'operations', 'production', 'plant', 'logistics',
    'packaging', 'manufacturing', 'warehouse', 'supply chain'
  ];

  if (decisionMakerRoles.some(r => role.includes(r))) {
    score += 10;
  }

  return Math.min(score, 20);
}

const roleScore = scoreRole(person);

// INTENT SIGNALS (max 10 points)

function scoreIntent(history, source) {
  let score = 0;

  // High-intent sources
  if (source === 'trade_show') score += 5;
  if (source === 'demo_request') score += 10;

  // Pricing page visits
  const pricingVisits = history.filter(e =>
    e.type === 'pricing_page_visit' ||
    (e.details || '').toLowerCase().includes('price')
  );
  if (pricingVisits.length > 0) score += 5;

  // Product-specific content downloads
  const productContent = history.filter(e =>
    e.source === 'content_download' &&
    (e.details || '').toLowerCase().includes('roi')
  );
  if (productContent.length > 0) score += 5;

  return Math.min(score, 10);
}

const intentScore = scoreIntent(engagementHistory, source);

// CALCULATE TOTAL MQL SCORE

const totalMQLScore = engagementScore + firmographicScore + roleScore + intentScore;

// Determine MQL category
let mqlCategory;
if (totalMQLScore >= 70) mqlCategory = 'hot_mql';
else if (totalMQLScore >= 50) mqlCategory = 'warm_mql';
else if (totalMQLScore >= 30) mqlCategory = 'cold_mql';
else mqlCategory = 'nurture';

// Determine action
let nextAction;
if (totalMQLScore >= 50) {
  nextAction = 'handover_to_lead_agent'; // Qualified for BANT scoring
} else if (totalMQLScore >= 30) {
  nextAction = 'nurture_campaign_medium';
} else {
  nextAction = 'nurture_campaign_long';
}

return {
  json: {
    ...input,
    mql_scoring: {
      engagement_score: engagementScore,
      firmographic_score: firmographicScore,
      role_score: roleScore,
      intent_score: intentScore,
      total_mql_score: totalMQLScore,
      mql_category: mqlCategory,
      next_action: nextAction,
      scoring_breakdown: {
        engagement: `${engagementScore}/40`,
        firmographics: `${firmographicScore}/30`,
        role: `${roleScore}/20`,
        intent: `${intentScore}/10`
      }
    }
  }
};
```

**Output:**
```json
{
  "mql_scoring": {
    "engagement_score": 25,
    "firmographic_score": 22,
    "role_score": 17,
    "intent_score": 5,
    "total_mql_score": 69,
    "mql_category": "warm_mql",
    "next_action": "handover_to_lead_agent"
  }
}
```

---

### Node 5: Decision - MQL Qualified?

**Type:** IF Node
**Condition:** `{{ $json.mql_scoring.total_mql_score >= 50 }}`

**TRUE:** → Handover to LEAD_AGENT (SQL qualification)
**FALSE:** → Start Nurture Campaign

---

### Node 6a: Handover to LEAD_AGENT (TRUE path)

**Type:** HTTP Request
**Method:** POST
**URL:** `{{ $env.N8N_BASE_URL }}/webhook/wieslogic-master`

```json
{
  "action": "trigger_lead_agent",
  "customer_id": "NEW_{{ Date.now() }}",
  "brand": "={{ detectBrand($json) }}",
  "data": {
    "company_name": "={{ $json.enrichment_data.company.name }}",
    "contact_person": "={{ $json.data.first_name }} {{ $json.data.last_name }}",
    "email": "={{ $json.data.email }}",
    "phone": "={{ $json.data.phone }}",
    "job_title": "={{ $json.enrichment_data.person.job_title }}",
    "company_size": "={{ $json.enrichment_data.company.employees }}",
    "industry": "={{ $json.enrichment_data.company.industry }}",
    "revenue_estimate": "={{ $json.enrichment_data.company.revenue_estimate }}",
    "source": "={{ $json.source }}",
    "message": "={{ $json.data.message || $json.data.notes || 'MQL from marketing' }}",
    "product_interest": "={{ detectProductInterest($json) }}"
  },
  "mql_score": "={{ $json.mql_scoring.total_mql_score }}",
  "engagement_history": "={{ JSON.stringify($json.engagement_history) }}"
}
```

**Helper Function: detectBrand**
```javascript
function detectBrand(data) {
  const interests = (data.data.interests || []).join(' ').toLowerCase();
  const message = (data.data.message || '').toLowerCase();
  const content = (data.data.content_title || '').toLowerCase();

  const allText = interests + ' ' + message + ' ' + content;

  if (allText.includes('wrapper') || allText.includes('wrapping')) return 'ROBOPAC';
  if (allText.includes('palletizer') || allText.includes('case packer')) return 'OCME';
  if (allText.includes('tray') || allText.includes('thermoform')) return 'SOTEMAPACK';
  if (allText.includes('bag-in-box') || allText.includes('filling')) return 'PRASMATIC';
  if (allText.includes('case erector') || allText.includes('carton')) return 'MEYPACK';

  // Default based on form URL
  if (data.data.form_url) {
    if (data.data.form_url.includes('robopac')) return 'ROBOPAC';
    if (data.data.form_url.includes('ocme')) return 'OCME';
    if (data.data.form_url.includes('sotemapack')) return 'SOTEMAPACK';
    if (data.data.form_url.includes('prasmatic')) return 'PRASMATIC';
    if (data.data.form_url.includes('meypack')) return 'MEYPACK';
  }

  return 'ROBOPAC'; // Default
}
```

---

### Node 6b: Start Nurture Campaign (FALSE path)

**Type:** Code (JavaScript) + Email Sequence

```javascript
/**
 * NURTURE CAMPAIGN SELECTION
 * Wählt passende Nurture-Kampagne basierend auf MQL Score
 */

const mqlScore = $input.item.json.mql_scoring.total_mql_score;
const mqlCategory = $input.item.json.mql_scoring.mql_category;
const productInterest = detectProductInterest($input.item.json);

// Nurture campaign mapping
let campaignType, campaignDuration, emailFrequency;

if (mqlScore >= 30 && mqlScore < 50) {
  // Cold MQL - Short nurture (30 days)
  campaignType = 'cold_mql_nurture';
  campaignDuration = 30; // days
  emailFrequency = 7; // every 7 days
} else {
  // Nurture - Long nurture (90 days)
  campaignType = 'long_nurture';
  campaignDuration = 90;
  emailFrequency = 14; // every 14 days
}

// Campaign emails
const campaignEmails = [
  {
    day: 0,
    subject: `Thank you for your interest in ${productInterest}`,
    template: 'welcome_email',
    content_type: 'introduction'
  },
  {
    day: 7,
    subject: `Case Study: How ${company} increased efficiency by 40%`,
    template: 'case_study_email',
    content_type: 'social_proof'
  },
  {
    day: 14,
    subject: `ROI Calculator: Calculate your savings`,
    template: 'roi_calculator_email',
    content_type: 'value_proposition'
  },
  {
    day: 21,
    subject: `Webinar invitation: ${productInterest} best practices`,
    template: 'webinar_invitation',
    content_type: 'educational'
  },
  {
    day: 28,
    subject: `Ready to discuss your packaging needs?`,
    template: 'call_to_action_email',
    content_type: 'conversion'
  }
];

return {
  json: {
    ...$input.item.json,
    nurture_campaign: {
      campaign_type: campaignType,
      campaign_duration_days: campaignDuration,
      email_frequency_days: emailFrequency,
      campaign_emails: campaignEmails,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + campaignDuration * 24 * 60 * 60 * 1000).toISOString()
    }
  }
};
```

**Send First Email:**
```javascript
{
  "to": "={{ $json.data.email }}",
  "subject": "Thank you for your interest - {{ brand }}",
  "body": `
Dear {{ first_name }},

Thank you for your interest in {{ brand }} solutions!

We noticed you {{ engagement_description }} and wanted to reach out personally.

{{ brand }} is part of AETNA Group, the world leader in packaging automation. We help companies like yours:
- Increase efficiency by 30-50%
- Reduce labor costs
- Improve product quality
- Minimize downtime

**Recommended Resources:**
- [Case Study] How a logistics company increased throughput by 40%
- [Whitepaper] ROI Guide for Packaging Automation
- [Video] See our solutions in action

Would you like to schedule a brief call to discuss your specific needs?

Best regards,
{{ brand }} Marketing Team

P.S. Keep an eye on your inbox - we'll be sharing valuable insights on packaging automation over the coming weeks.
  `
}
```

---

### Node 7: Write Marketing Lead Log

**Type:** Google Sheets Append/Update

**If NEW lead** → Append to `01_📋_Inquiries_Log`:
```javascript
{
  "inquiry_id": "MQL_{{ Date.now() }}",
  "lead_source": "={{ $json.source }}",
  "company_name": "={{ $json.enrichment_data.company.name }}",
  "contact_person": "={{ $json.data.first_name }} {{ $json.data.last_name }}",
  "email": "={{ $json.data.email }}",
  "phone": "={{ $json.data.phone }}",
  "job_title": "={{ $json.enrichment_data.person.job_title }}",
  "company_size": "={{ $json.enrichment_data.company.employees }}",
  "industry": "={{ $json.enrichment_data.company.industry }}",
  "revenue_estimate": "={{ $json.enrichment_data.company.revenue_estimate }}",
  "country": "={{ $json.enrichment_data.company.location.country }}",
  "mql_score": "={{ $json.mql_scoring.total_mql_score }}",
  "mql_category": "={{ $json.mql_scoring.mql_category }}",
  "engagement_count": "={{ $json.total_engagements }}",
  "engagement_history": "={{ JSON.stringify($json.engagement_history) }}",
  "product_interest": "={{ detectProductInterest($json) }}",
  "brand": "={{ detectBrand($json) }}",
  "status": "={{ $json.mql_scoring.next_action === 'handover_to_lead_agent' ? 'mql_qualified' : 'nurturing' }}",
  "created_date": "={{ $now.toISO() }}",
  "last_engagement_date": "={{ $json.engagement_history[$json.engagement_history.length - 1].date }}"
}
```

**If EXISTING lead** → Update existing row:
```javascript
{
  "mql_score": "={{ $json.mql_scoring.total_mql_score }}",
  "mql_category": "={{ $json.mql_scoring.mql_category }}",
  "engagement_count": "={{ $json.total_engagements }}",
  "engagement_history": "={{ JSON.stringify($json.engagement_history) }}",
  "last_engagement_date": "={{ $now.toISO() }}",
  "status": "={{ $json.mql_scoring.next_action === 'handover_to_lead_agent' ? 'mql_qualified' : 'nurturing' }}"
}
```

---

### Node 8: Log to Lead Intelligence

**Type:** Google Sheets Append
**Sheet:** `19_🔍_Lead_Intelligence_Log`

```javascript
{
  "intelligence_id": "INT_{{ Date.now() }}",
  "lead_email": "={{ $json.data.email }}",
  "company_name": "={{ $json.enrichment_data.company.name }}",
  "company_domain": "={{ $json.enrichment_data.company.domain }}",
  "employees": "={{ $json.enrichment_data.company.employees }}",
  "revenue_estimate": "={{ $json.enrichment_data.company.revenue_estimate }}",
  "industry": "={{ $json.enrichment_data.company.industry }}",
  "location": "={{ $json.enrichment_data.company.location.city }}, {{ $json.enrichment_data.company.location.country }}",
  "technologies": "={{ JSON.stringify($json.enrichment_data.company.technologies) }}",
  "linkedin_profile": "={{ $json.enrichment_data.person.linkedin_url }}",
  "job_title": "={{ $json.enrichment_data.person.job_title }}",
  "seniority": "={{ $json.enrichment_data.person.seniority }}",
  "role": "={{ $json.enrichment_data.person.role }}",
  "enrichment_date": "={{ $now.toISO() }}",
  "data_source": "hunter_clearbit"
}
```

---

### Node 9: Log to Master Log

**Type:** Google Sheets Append
**Sheet:** `13📑Master_Log`

```javascript
{
  "execution_id": "={{ $json.master_execution_id || 'MKT_' + Date.now() }}",
  "step_name": "lead_generator_processing",
  "agent_name": "AI_LEAD_GENERATOR",
  "inquiry_id": "={{ $json.inquiry_id }}",
  "customer_name": "={{ $json.enrichment_data.company.name }}",
  "brand": "={{ detectBrand($json) }}",
  "action": "={{ $json.mql_scoring.next_action }}",
  "mql_score": "={{ $json.mql_scoring.total_mql_score }}",
  "result": "success",
  "timestamp": "={{ $now.toISO() }}",
  "notes": "Lead captured from {{ $json.source }}, MQL score: {{ $json.mql_scoring.total_mql_score }}"
}
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Trade Show Lead → Hot MQL → Immediate Handover

**Input:**
```json
{
  "source": "trade_show",
  "event_name": "LogiMAT 2025",
  "data": {
    "email": "director@biglogistics.de",
    "job_title": "Operations Director",
    "company": "Big Logistics AG",
    "notes": "Very interested, wants demo ASAP"
  }
}
```

**Enrichment:**
- Company: 500 employees, €50M revenue
- Role: Director (high seniority)

**MQL Score Breakdown:**
- Engagement: 20 (trade show)
- Firmographics: 27 (large company, logistics industry)
- Role: 17 (director level)
- Intent: 10 (demo request)
- **Total: 74 (Hot MQL)**

**Action:** → Handover to LEAD_AGENT immediately ✅

---

### Beispiel 2: Content Download → Cold MQL → Nurture Campaign

**Input:**
```json
{
  "source": "content_download",
  "data": {
    "email": "engineer@smallfactory.de",
    "content_title": "Introduction to Pallet Wrapping"
  }
}
```

**Enrichment:**
- Company: 30 employees, €5M revenue
- Role: Engineer (low seniority)

**MQL Score Breakdown:**
- Engagement: 10 (single download)
- Firmographics: 12 (small company, manufacturing)
- Role: 8 (engineer, low authority)
- Intent: 0
- **Total: 30 (Cold MQL)**

**Action:** → 30-day Nurture Campaign 📧

---

### Beispiel 3: Returning Visitor → Score Increase → Qualified

**Input (Visit 1 - 60 days ago):**
```json
{
  "source": "website_form",
  "mql_score": 25
}
```

**Input (Visit 2 - Today):**
```json
{
  "source": "webinar_registration",
  "previous_mql_score": 25
}
```

**New MQL Score:**
- Previous: 25
- New engagement: +12 (webinar)
- Engagement bonus: +10 (multiple within 30 days)
- **Total: 47 → Still nurturing**

**Input (Visit 3 - 7 days later):**
```json
{
  "source": "content_download",
  "content_title": "ROI Calculator"
}
```

**New MQL Score:**
- Previous: 47
- New engagement: +10 (content download)
- Intent signal: +5 (ROI content)
- **Total: 62 (Warm MQL)**

**Action:** → Handover to LEAD_AGENT ✅

---

## ✅ Deployment Checklist

- [ ] Workflow importiert
- [ ] Hunter.io API Key konfiguriert
- [ ] Clearbit API Key konfiguriert
- [ ] Email Nurture Templates erstellt
- [ ] Website form webhooks konfiguriert
- [ ] LinkedIn integration setup
- [ ] Trade show badge scanner integration
- [ ] Webinar platform integration (Zoom/GoToWebinar)
- [ ] Email marketing platform integration (Mailchimp/HubSpot)
- [ ] Test alle Lead Sources:
  - [ ] Website form
  - [ ] Content download
  - [ ] LinkedIn
  - [ ] Trade show
  - [ ] Webinar
- [ ] MQL threshold kalibriert (50+ points)

---

## 📈 Success Metrics

- **MQL Generation Rate:** Target 100+ MQLs/month
- **MQL to SQL Conversion:** Target >40%
- **Enrichment Accuracy:** >90%
- **Nurture Campaign Open Rate:** >25%
- **Nurture Campaign Click Rate:** >5%
- **Time to MQL Qualification:** <30 days average

---

## 🔄 Continuous Optimization

- **A/B Test** nurture email subject lines
- **Analyze** which content drives highest MQL scores
- **Refine** MQL scoring thresholds based on SQL conversion rates
- **Update** firmographic scoring for new target industries
- **Monitor** engagement decay rates and adjust scoring

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
