# AI_MARKETING_AGENT - Campaign Management & Performance Optimization

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** End-to-End Marketing Campaign Management für alle AETNA Group Marken

---

## 📋 Übersicht

Der **AI_MARKETING_AGENT** ist der Campaign Manager des WiesLogic Systems. Er:

✅ **Plant Marketing Campaigns** mit Multi-Channel Strategie
✅ **Managed Ad Campaigns** (Google Ads, LinkedIn Ads, Facebook Ads)
✅ **Orchestriert Email Campaigns** mit Segmentierung
✅ **Koordiniert Social Media Campaigns** über alle Plattformen
✅ **Organisiert Events** (Trade Shows, Webinars, Open Houses)
✅ **Tracked Campaign Performance** mit ROI-Analyse
✅ **Optimiert Budgets** mit AI-basiertem Bid Management
✅ **A/B Tests** für kontinuierliche Verbesserung

---

## 🎯 Hauptaufgaben

### 1. Campaign Planning
- Multi-channel campaign strategy
- Budget allocation across channels
- Timeline and milestone planning
- Target audience definition
- KPI setting and tracking

### 2. Ad Campaign Management
- Google Ads (Search, Display, YouTube)
- LinkedIn Ads (Sponsored Content, InMail)
- Facebook/Instagram Ads
- Retargeting campaigns
- Bid optimization

### 3. Email Marketing
- Segmented email campaigns
- Drip campaigns and automation
- A/B testing (subject lines, CTAs)
- Personalization at scale
- Deliverability optimization

### 4. Social Media Campaigns
- Multi-platform coordination
- Hashtag strategy
- Influencer partnerships
- Employee advocacy
- Community engagement

### 5. Event Marketing
- Trade show lead generation
- Webinar promotion and follow-up
- Open house campaigns
- Virtual event management

### 6. Performance Analytics
- Real-time campaign tracking
- Attribution modeling
- ROI calculation
- Budget optimization recommendations
- Automated reporting

---

## 🔄 Workflow-Ablauf

```
Campaign Request → Strategy & Planning → Budget Allocation → Content Coordination →
Multi-Channel Execution → Performance Monitoring → Optimization → ROI Reporting
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger

**Path:** `/webhook/marketing-agent`
**Method:** POST
**Auth:** Bearer Token

**Trigger Sources:**

**1. New Campaign Request:**
```json
{
  "source": "campaign_request",
  "campaign_type": "product_launch",
  "data": {
    "brand": "ROBOPAC",
    "campaign_name": "Helix Ultimate Launch Q4 2025",
    "objective": "awareness_and_leads",
    "target_audience": {
      "industries": ["logistics", "warehousing"],
      "job_titles": ["operations_manager", "warehouse_director"],
      "company_size": "100-1000",
      "regions": ["DACH", "Benelux", "UK"]
    },
    "budget_eur": 50000,
    "duration_days": 90,
    "start_date": "2025-11-01",
    "kpis": {
      "leads": 200,
      "mql": 100,
      "sql": 30,
      "cpl_target": 250
    },
    "channels": ["google_ads", "linkedin", "email", "content"],
    "requested_by": "marketing.director@robopac.com"
  }
}
```

**2. Trade Show Campaign:**
```json
{
  "source": "event_campaign",
  "campaign_type": "trade_show",
  "data": {
    "brand": "OCME",
    "event_name": "interpack 2026",
    "event_dates": {
      "start": "2026-05-07",
      "end": "2026-05-13"
    },
    "booth_number": "Hall 6 / A45",
    "budget_eur": 30000,
    "pre_event_campaign": true,
    "during_event_activities": ["demos", "prize_draw", "expert_talks"],
    "post_event_follow_up": true,
    "target_visitors": 500,
    "target_qualified_leads": 150
  }
}
```

**3. Quarterly Campaign Plan:**
```json
{
  "source": "quarterly_plan",
  "data": {
    "quarter": "Q1_2026",
    "brands": ["ROBOPAC", "OCME", "SOTEMAPACK", "PRASMATIC", "MEYPACK"],
    "budget_total_eur": 200000,
    "strategic_priorities": [
      "brand_awareness_DACH",
      "lead_generation_uk",
      "customer_retention"
    ]
  }
}
```

**4. Performance Alert (Auto-trigger):**
```json
{
  "source": "performance_alert",
  "alert_type": "underperforming_campaign",
  "data": {
    "campaign_id": "CAMP_123456",
    "campaign_name": "ROBOPAC DACH Search Q3",
    "issue": "cpl_above_target",
    "current_cpl": 320,
    "target_cpl": 250,
    "days_running": 14,
    "budget_spent": 4500,
    "leads_generated": 14
  }
}
```

---

### Node 2: Campaign Strategy & Planning

**Type:** OpenAI Chat (GPT-4) + Code

```javascript
/**
 * CAMPAIGN STRATEGY GENERATOR
 * Erstellt comprehensive Campaign Strategy
 */

const input = $input.item.json;
const campaignType = input.campaign_type;
const brand = input.data.brand;
const budget = input.data.budget_eur;
const objectives = input.data.objective || input.data.kpis;

// AI Strategy Generation
const strategyPrompt = `
You are a senior marketing strategist for ${brand}, part of AETNA Group packaging solutions.

Campaign Brief:
- Type: ${campaignType}
- Budget: €${budget}
- Objective: ${input.data.objective}
- Duration: ${input.data.duration_days} days
- Target Audience: ${JSON.stringify(input.data.target_audience)}

Create a comprehensive campaign strategy including:

1. **Campaign Positioning**
   - Core message
   - Value proposition
   - Differentiation from competitors

2. **Channel Strategy**
   Available channels: ${input.data.channels?.join(', ')}
   - Recommend budget allocation per channel
   - Reasoning for allocation
   - Expected performance per channel

3. **Content Requirements**
   - Landing page
   - Ad creatives (formats and quantities)
   - Email templates needed
   - Social media assets
   - Gated content (whitepapers, case studies)

4. **Audience Segmentation**
   - Primary segments
   - Secondary segments
   - Messaging per segment

5. **Timeline & Milestones**
   - Week-by-week plan
   - Key milestones
   - Decision points

6. **Success Metrics**
   - Primary KPIs
   - Secondary KPIs
   - Benchmarks for success

7. **Risk Mitigation**
   - Potential challenges
   - Contingency plans
   - Budget reserve allocation

Provide data-driven recommendations based on B2B packaging industry benchmarks.
`;

// Execute OpenAI call
const aiStrategy = await executeOpenAICall(strategyPrompt);

// Parse and structure strategy
const strategy = parseStrategy(aiStrategy);

// Calculate budget allocation
const budgetAllocation = calculateBudgetAllocation(
  budget,
  input.data.channels,
  campaignType,
  objectives
);

return {
  json: {
    ...input,
    campaign_strategy: {
      ai_strategy: aiStrategy,
      budget_allocation: budgetAllocation,
      timeline: generateTimeline(input.data.start_date, input.data.duration_days),
      content_requirements: extractContentRequirements(aiStrategy)
    },
    campaign_id: 'CAMP_' + Date.now()
  }
};

// Helper: Budget allocation based on campaign type and channels
function calculateBudgetAllocation(totalBudget, channels, type, objectives) {
  // Industry benchmarks for B2B packaging
  const allocationRules = {
    'product_launch': {
      'google_ads': 0.35,
      'linkedin': 0.30,
      'content': 0.15,
      'email': 0.10,
      'events': 0.10
    },
    'lead_generation': {
      'google_ads': 0.40,
      'linkedin': 0.35,
      'content': 0.15,
      'email': 0.10
    },
    'brand_awareness': {
      'linkedin': 0.35,
      'content': 0.25,
      'google_ads': 0.20,
      'events': 0.20
    },
    'trade_show': {
      'email': 0.30,
      'linkedin': 0.30,
      'content': 0.20,
      'google_ads': 0.20
    }
  };

  const rules = allocationRules[type] || allocationRules['lead_generation'];
  const allocation = {};

  for (const channel of channels) {
    allocation[channel] = {
      budget_eur: Math.round(totalBudget * (rules[channel] || 0.1)),
      percentage: Math.round((rules[channel] || 0.1) * 100)
    };
  }

  return allocation;
}

function generateTimeline(startDate, durationDays) {
  const start = new Date(startDate);
  const milestones = [];

  // Pre-launch (1-2 weeks before)
  milestones.push({
    week: -2,
    date: new Date(start.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    phase: 'preparation',
    activities: ['Finalize content', 'Setup tracking', 'Test campaigns']
  });

  // Launch week
  milestones.push({
    week: 0,
    date: start.toISOString().split('T')[0],
    phase: 'launch',
    activities: ['Activate all channels', 'Monitor closely', 'Quick optimizations']
  });

  // Weekly milestones
  const weeks = Math.ceil(durationDays / 7);
  for (let i = 1; i <= weeks; i++) {
    milestones.push({
      week: i,
      date: new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phase: i < weeks ? 'optimization' : 'final_push',
      activities: i < weeks ?
        ['Review performance', 'Optimize bids', 'Refresh creatives'] :
        ['Final optimizations', 'Prepare wrap-up report', 'Plan follow-up']
    });
  }

  return milestones;
}
```

**Output:**
```json
{
  "campaign_strategy": {
    "budget_allocation": {
      "google_ads": {
        "budget_eur": 17500,
        "percentage": 35
      },
      "linkedin": {
        "budget_eur": 15000,
        "percentage": 30
      },
      "content": {
        "budget_eur": 7500,
        "percentage": 15
      },
      "email": {
        "budget_eur": 5000,
        "percentage": 10
      },
      "events": {
        "budget_eur": 5000,
        "percentage": 10
      }
    },
    "content_requirements": {
      "landing_page": 1,
      "ad_creatives": 15,
      "emails": 5,
      "social_posts": 20,
      "case_studies": 2
    }
  }
}
```

---

### Node 3: Trigger Content Creation

**Type:** HTTP Request (Multiple parallel requests to CONTENT_AGENT)

```javascript
// For each content requirement, trigger CONTENT_AGENT

const contentRequirements = $input.item.json.campaign_strategy.content_requirements;

const contentRequests = [];

// Landing page
if (contentRequirements.landing_page) {
  contentRequests.push({
    url: '{{ $env.N8N_BASE_URL }}/webhook/content-agent',
    method: 'POST',
    body: {
      content_type: 'landing_page',
      data: {
        brand: $json.data.brand,
        topic: $json.data.campaign_name,
        target_audience: $json.data.target_audience,
        keywords: extractKeywords($json),
        tone: 'conversion_focused'
      }
    }
  });
}

// Ad creatives (request to CONTENT_AGENT)
for (let i = 0; i < contentRequirements.ad_creatives; i++) {
  contentRequests.push({
    url: '{{ $env.N8N_BASE_URL }}/webhook/content-agent',
    method: 'POST',
    body: {
      content_type: 'ad_creative',
      data: {
        brand: $json.data.brand,
        format: i % 3 === 0 ? 'headline' : i % 3 === 1 ? 'description' : 'cta',
        campaign_name: $json.data.campaign_name
      }
    }
  });
}

// Emails
for (let i = 0; i < contentRequirements.emails; i++) {
  contentRequests.push({
    url: '{{ $env.N8N_BASE_URL }}/webhook/content-agent',
    method: 'POST',
    body: {
      content_type: 'email',
      data: {
        brand: $json.data.brand,
        sequence_position: i + 1,
        campaign_name: $json.data.campaign_name
      }
    }
  });
}

return contentRequests;
```

---

### Node 4: Setup Ad Campaigns

**Type:** Multiple API Calls (Google Ads, LinkedIn Ads, Facebook Ads)

**4a) Google Ads Setup:**
```javascript
/**
 * GOOGLE ADS CAMPAIGN SETUP
 * Creates campaign via Google Ads API
 */

const campaign = {
  name: $json.data.campaign_name + ' - Search',
  budget: $json.campaign_strategy.budget_allocation.google_ads.budget_eur,
  bidding_strategy: 'target_cpa',
  target_cpa: $json.data.kpis.cpl_target,
  networks: ['search', 'display'],
  locations: convertRegionsToGeoTargets($json.data.target_audience.regions),
  languages: ['en', 'de'],
  start_date: $json.data.start_date
};

// Ad Groups
const adGroups = [
  {
    name: 'Pallet Wrapper - Exact',
    keywords: [
      { text: 'automated pallet wrapper', match_type: 'EXACT' },
      { text: 'pallet wrapping machine', match_type: 'EXACT' }
    ],
    max_cpc: 3.50
  },
  {
    name: 'Pallet Wrapper - Phrase',
    keywords: [
      { text: 'pallet wrapper', match_type: 'PHRASE' },
      { text: 'wrapping automation', match_type: 'PHRASE' }
    ],
    max_cpc: 2.80
  }
];

// Create campaign via Google Ads API
const googleCampaignId = await createGoogleAdsCampaign(campaign, adGroups);

return {
  json: {
    ...$input.item.json,
    google_ads: {
      campaign_id: googleCampaignId,
      status: 'active',
      budget_daily: Math.round(campaign.budget / 90),
      ad_groups: adGroups.length
    }
  }
};
```

**4b) LinkedIn Ads Setup:**
```javascript
/**
 * LINKEDIN ADS CAMPAIGN SETUP
 */

const linkedinCampaign = {
  name: $json.data.campaign_name + ' - LinkedIn',
  account_id: $env.LINKEDIN_ADS_ACCOUNT_ID,
  campaign_group: 'lead_generation',
  objective: 'LEAD_GENERATION',
  budget: $json.campaign_strategy.budget_allocation.linkedin.budget_eur,
  daily_budget: Math.round($json.campaign_strategy.budget_allocation.linkedin.budget_eur / 90),
  start_date: $json.data.start_date,
  targeting: {
    job_titles: $json.data.target_audience.job_titles,
    industries: convertIndustriesToLinkedInIds($json.data.target_audience.industries),
    company_size: $json.data.target_audience.company_size,
    locations: $json.data.target_audience.regions
  },
  bid_type: 'MAXIMUM_CPM',
  bid_amount: 50 // €50 CPM starting bid
};

// Create sponsored content ads
const linkedinAds = [
  {
    type: 'SPONSORED_CONTENT',
    creative: {
      headline: 'Transform Your Packaging Line',
      description: 'Increase efficiency by 40% with ROBOPAC automation',
      image_url: 'https://assets.robopac.com/helix-ultimate.jpg',
      cta: 'Learn More',
      landing_page: $json.landing_page_url
    }
  },
  {
    type: 'SPONSORED_INMAIL',
    creative: {
      subject: 'Exclusive ROI Calculator for Warehouse Managers',
      body: 'Calculate your potential savings...',
      cta: 'Download Calculator'
    }
  }
];

const linkedinCampaignId = await createLinkedInCampaign(linkedinCampaign, linkedinAds);

return {
  json: {
    ...$input.item.json,
    linkedin_ads: {
      campaign_id: linkedinCampaignId,
      status: 'active',
      ads_count: linkedinAds.length
    }
  }
};
```

---

### Node 5: Setup Email Campaign

**Type:** Email Marketing Platform API (Mailchimp / HubSpot)

```javascript
/**
 * EMAIL CAMPAIGN SETUP
 */

const emailCampaign = {
  name: $json.data.campaign_name + ' - Email Sequence',
  list_id: getSegmentedList($json.data.target_audience),
  from_name: $json.data.brand,
  from_email: `marketing@${$json.data.brand.toLowerCase()}.com`,
  subject_line: 'Transform Your Packaging Operation', // A/B test variant A
  subject_line_b: 'See How We Increased Efficiency 40%', // A/B test variant B
  emails: [
    {
      sequence: 1,
      delay_days: 0,
      subject: 'Introduction to {{ brand }} Solutions',
      body: $json.content_agent_emails[0],
      cta: 'Download ROI Guide'
    },
    {
      sequence: 2,
      delay_days: 3,
      subject: 'Case Study: {{ customer_success }}',
      body: $json.content_agent_emails[1],
      cta: 'Read Full Story'
    },
    {
      sequence: 3,
      delay_days: 7,
      subject: 'Exclusive Webinar Invitation',
      body: $json.content_agent_emails[2],
      cta: 'Register Now'
    },
    {
      sequence: 4,
      delay_days: 14,
      subject: 'Limited Time: Free Site Assessment',
      body: $json.content_agent_emails[3],
      cta: 'Book Assessment'
    }
  ]
};

// Segmentation
const segments = [
  {
    name: 'Hot Prospects',
    filter: 'mql_score >= 70',
    emails: [1, 2, 3, 4] // All emails
  },
  {
    name: 'Warm Prospects',
    filter: 'mql_score >= 50 AND mql_score < 70',
    emails: [1, 2, 4] // Skip case study
  },
  {
    name: 'Cold Prospects',
    filter: 'mql_score < 50',
    emails: [1, 3] // Only intro and webinar
  }
];

const emailCampaignId = await createEmailCampaign(emailCampaign, segments);

return {
  json: {
    ...$input.item.json,
    email_campaign: {
      campaign_id: emailCampaignId,
      segments: segments.length,
      total_recipients: await getRecipientCount(segments),
      status: 'scheduled'
    }
  }
};
```

---

### Node 6: Setup Social Media Campaign

**Type:** Social Media Scheduling API (Buffer / Hootsuite)

```javascript
/**
 * SOCIAL MEDIA CAMPAIGN SETUP
 */

const socialCampaign = {
  campaign_name: $json.data.campaign_name,
  platforms: ['linkedin', 'twitter', 'facebook'],
  posting_schedule: generatePostingSchedule(90), // 90 days
  hashtag_strategy: {
    brand: ['#' + $json.data.brand, '#AETNAGroup'],
    industry: ['#packaging', '#automation', '#logistics'],
    campaign: ['#Helix Ultimate', '#TransformYourWarehouse']
  }
};

// Generate social posts
const socialPosts = [];

// Weekly product showcase (LinkedIn)
for (let week = 0; week < 13; week++) {
  socialPosts.push({
    platform: 'linkedin',
    scheduled_date: addDays($json.data.start_date, week * 7),
    content_type: 'product_showcase',
    text: `Week ${week + 1}: Discover how ${$json.data.brand} helps companies...\n\n${$json.social_content[week]}\n\n#packaging #automation`,
    media: `product_image_${week}.jpg`,
    link: $json.landing_page_url
  });
}

// Daily tips (Twitter)
for (let day = 0; day < 90; day += 3) {
  socialPosts.push({
    platform: 'twitter',
    scheduled_date: addDays($json.data.start_date, day),
    content_type: 'tip',
    text: `💡 Packaging Tip: ${$json.tips[day / 3]} #packagingautomation`,
    link: $json.blog_url
  });
}

// Case study highlights (LinkedIn + Facebook)
const caseStudyDays = [14, 35, 56, 77];
for (const day of caseStudyDays) {
  ['linkedin', 'facebook'].forEach(platform => {
    socialPosts.push({
      platform,
      scheduled_date: addDays($json.data.start_date, day),
      content_type: 'case_study',
      text: `📊 Success Story: ${$json.case_studies[day / 14].customer}\n\nResults:\n✅ ${$json.case_studies[day / 14].result_1}\n✅ ${$json.case_studies[day / 14].result_2}\n\nRead more ⬇️`,
      link: $json.case_studies[day / 14].url
    });
  });
}

const scheduledPosts = await scheduleSocialPosts(socialPosts);

return {
  json: {
    ...$input.item.json,
    social_media_campaign: {
      total_posts: socialPosts.length,
      platforms: socialCampaign.platforms,
      scheduled_posts: scheduledPosts,
      status: 'scheduled'
    }
  }
};
```

---

### Node 7: Setup Tracking & Analytics

**Type:** Code (JavaScript)

```javascript
/**
 * CAMPAIGN TRACKING SETUP
 * UTM parameters, conversion tracking, analytics dashboard
 */

const campaignId = $input.item.json.campaign_id;
const campaignName = $input.item.json.data.campaign_name;

// Generate UTM parameters for all channels
const utmParameters = {
  google_ads: {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: campaignId,
    utm_term: '{keyword}',
    utm_content: '{creative}'
  },
  linkedin: {
    utm_source: 'linkedin',
    utm_medium: 'paid_social',
    utm_campaign: campaignId,
    utm_content: '{ad_id}'
  },
  email: {
    utm_source: 'email',
    utm_medium: 'email',
    utm_campaign: campaignId,
    utm_content: '{email_id}'
  },
  social_organic: {
    utm_source: '{platform}',
    utm_medium: 'social',
    utm_campaign: campaignId
  }
};

// Setup conversion tracking
const conversionEvents = [
  {
    event: 'landing_page_view',
    value: 0,
    category: 'engagement'
  },
  {
    event: 'content_download',
    value: 25,
    category: 'lead'
  },
  {
    event: 'contact_form_submit',
    value: 50,
    category: 'lead'
  },
  {
    event: 'demo_request',
    value: 100,
    category: 'mql'
  },
  {
    event: 'quotation_sent',
    value: 500,
    category: 'sql'
  }
];

// Setup Google Analytics Goal
const gaGoals = await setupGoogleAnalyticsGoals(conversionEvents, campaignId);

// Setup Google Ads Conversion Tracking
const gadsConversions = await setupGoogleAdsConversions(conversionEvents, campaignId);

// Setup LinkedIn Insight Tag
const linkedinPixel = await setupLinkedInConversion(conversionEvents, campaignId);

return {
  json: {
    ...$input.item.json,
    tracking: {
      utm_parameters: utmParameters,
      conversion_events: conversionEvents,
      ga_goals: gaGoals,
      gads_conversions: gadsConversions,
      linkedin_pixel: linkedinPixel,
      dashboard_url: `https://analytics.aetnagroup.com/campaign/${campaignId}`
    }
  }
};
```

---

### Node 8: Write Campaign to Database

**Type:** Google Sheets Append
**Sheet:** `21_📊_Marketing_Campaigns`

```javascript
{
  "campaign_id": "={{ $json.campaign_id }}",
  "campaign_name": "={{ $json.data.campaign_name }}",
  "campaign_type": "={{ $json.campaign_type }}",
  "brand": "={{ $json.data.brand }}",
  "start_date": "={{ $json.data.start_date }}",
  "end_date": "={{ calculateEndDate($json.data.start_date, $json.data.duration_days) }}",
  "duration_days": "={{ $json.data.duration_days }}",
  "budget_total_eur": "={{ $json.data.budget_eur }}",
  "budget_google_ads": "={{ $json.campaign_strategy.budget_allocation.google_ads.budget_eur }}",
  "budget_linkedin": "={{ $json.campaign_strategy.budget_allocation.linkedin.budget_eur }}",
  "budget_email": "={{ $json.campaign_strategy.budget_allocation.email?.budget_eur || 0 }}",
  "budget_social": "={{ $json.campaign_strategy.budget_allocation.social?.budget_eur || 0 }}",
  "target_leads": "={{ $json.data.kpis.leads }}",
  "target_mql": "={{ $json.data.kpis.mql }}",
  "target_sql": "={{ $json.data.kpis.sql }}",
  "target_cpl": "={{ $json.data.kpis.cpl_target }}",
  "google_ads_campaign_id": "={{ $json.google_ads.campaign_id }}",
  "linkedin_campaign_id": "={{ $json.linkedin_ads.campaign_id }}",
  "email_campaign_id": "={{ $json.email_campaign.campaign_id }}",
  "landing_page_url": "={{ $json.landing_page_url }}",
  "tracking_dashboard_url": "={{ $json.tracking.dashboard_url }}",
  "status": "active",
  "created_date": "={{ $now.toISO() }}",
  "created_by": "AI_MARKETING_AGENT"
}
```

---

### Node 9: Daily Performance Monitoring (Scheduled Trigger)

**Type:** Schedule Trigger (Runs daily at 9 AM)

```javascript
/**
 * DAILY PERFORMANCE CHECK
 * Monitors all active campaigns and triggers alerts
 */

// Load all active campaigns
const activeCampaigns = await loadActiveCampaigns();

for (const campaign of activeCampaigns) {
  // Fetch performance data from each platform
  const googleAdsData = await fetchGoogleAdsPerformance(campaign.google_ads_campaign_id);
  const linkedinData = await fetchLinkedInPerformance(campaign.linkedin_campaign_id);
  const emailData = await fetchEmailPerformance(campaign.email_campaign_id);
  const analyticsData = await fetchGAPerformance(campaign.campaign_id);

  // Calculate overall performance
  const performance = {
    spend: googleAdsData.cost + linkedinData.cost,
    impressions: googleAdsData.impressions + linkedinData.impressions,
    clicks: googleAdsData.clicks + linkedinData.clicks,
    leads: analyticsData.leads,
    mql: analyticsData.mql,
    sql: analyticsData.sql,
    cpl: (googleAdsData.cost + linkedinData.cost) / analyticsData.leads,
    ctr: ((googleAdsData.clicks + linkedinData.clicks) / (googleAdsData.impressions + linkedinData.impressions)) * 100,
    conversion_rate: (analyticsData.leads / (googleAdsData.clicks + linkedinData.clicks)) * 100
  };

  // Check against targets
  const alerts = [];

  if (performance.cpl > campaign.target_cpl * 1.2) {
    alerts.push({
      type: 'cpl_high',
      severity: 'high',
      message: `CPL (€${performance.cpl}) is 20% above target (€${campaign.target_cpl})`
    });
  }

  if (performance.ctr < 1.0) {
    alerts.push({
      type: 'ctr_low',
      severity: 'medium',
      message: `CTR (${performance.ctr}%) is below 1%`
    });
  }

  if (performance.conversion_rate < 2.0) {
    alerts.push({
      type: 'conversion_low',
      severity: 'medium',
      message: `Conversion rate (${performance.conversion_rate}%) is below 2%`
    });
  }

  // Update campaign performance
  await updateCampaignPerformance(campaign.campaign_id, performance);

  // Send alerts if any
  if (alerts.length > 0) {
    await sendPerformanceAlert(campaign, performance, alerts);
  }

  // AI Optimization Recommendations
  const optimizations = generateOptimizationRecommendations(campaign, performance);

  if (optimizations.length > 0) {
    await sendOptimizationRecommendations(campaign, optimizations);
  }
}

function generateOptimizationRecommendations(campaign, performance) {
  const recommendations = [];

  // High CPL → reduce bids or pause low-performing ad groups
  if (performance.cpl > campaign.target_cpl * 1.2) {
    recommendations.push({
      action: 'reduce_bids',
      channel: 'google_ads',
      recommendation: 'Reduce bids by 15% on underperforming keywords',
      expected_impact: 'Reduce CPL by 10-15%'
    });
  }

  // Low CTR → refresh ad creatives
  if (performance.ctr < 1.0) {
    recommendations.push({
      action: 'refresh_creatives',
      channel: 'linkedin',
      recommendation: 'Test new ad creatives with stronger CTAs',
      expected_impact: 'Increase CTR by 20-30%'
    });
  }

  // Low conversion rate → optimize landing page
  if (performance.conversion_rate < 2.0) {
    recommendations.push({
      action: 'optimize_landing_page',
      channel: 'all',
      recommendation: 'A/B test landing page with simplified form (3 fields instead of 5)',
      expected_impact: 'Increase conversion rate by 25-40%'
    });
  }

  return recommendations;
}
```

---

### Node 10: Weekly Campaign Report

**Type:** Schedule Trigger (Runs weekly on Monday 10 AM)

```javascript
/**
 * WEEKLY CAMPAIGN REPORT GENERATOR
 */

const campaigns = await loadActiveCampaigns();

for (const campaign of campaigns) {
  const weeklyReport = await generateWeeklyReport(campaign);

  // Send email report
  await sendEmailReport({
    to: campaign.requested_by,
    subject: `Weekly Report: ${campaign.campaign_name}`,
    body: formatReportEmail(weeklyReport)
  });

  // Update Google Sheets
  await appendWeeklyReport(weeklyReport);
}

async function generateWeeklyReport(campaign) {
  // Fetch 7-day performance
  const performance = await fetchPerformanceData(campaign, 7);

  // Calculate week-over-week changes
  const previousWeek = await fetchPerformanceData(campaign, 14, 7);
  const changes = calculateChanges(performance, previousWeek);

  return {
    campaign_id: campaign.campaign_id,
    campaign_name: campaign.campaign_name,
    week_ending: new Date().toISOString().split('T')[0],

    performance: {
      spend: performance.spend,
      impressions: performance.impressions,
      clicks: performance.clicks,
      ctr: performance.ctr,
      leads: performance.leads,
      mql: performance.mql,
      sql: performance.sql,
      cpl: performance.cpl,
      conversion_rate: performance.conversion_rate
    },

    changes: {
      spend: changes.spend_percent,
      clicks: changes.clicks_percent,
      leads: changes.leads_percent,
      cpl: changes.cpl_percent
    },

    channel_breakdown: {
      google_ads: await fetchChannelPerformance('google_ads', campaign),
      linkedin: await fetchChannelPerformance('linkedin', campaign),
      email: await fetchChannelPerformance('email', campaign),
      social: await fetchChannelPerformance('social', campaign)
    },

    top_performing: {
      keywords: await getTopKeywords(campaign, 5),
      ads: await getTopAds(campaign, 5),
      emails: await getTopEmails(campaign, 3)
    },

    insights: generateWeeklyInsights(performance, changes),
    recommendations: generateWeeklyRecommendations(performance, changes),

    budget_status: {
      total_budget: campaign.budget_total_eur,
      spent_to_date: performance.total_spend,
      remaining: campaign.budget_total_eur - performance.total_spend,
      pace: calculateBudgetPace(campaign, performance),
      projection: projectFinalSpend(campaign, performance)
    }
  };
}

function formatReportEmail(report) {
  return `
# Weekly Campaign Report - ${report.campaign_name}

Week Ending: ${report.week_ending}

## Performance Summary

| Metric | This Week | Change | Status |
|--------|-----------|--------|--------|
| Spend | €${report.performance.spend} | ${report.changes.spend > 0 ? '↑' : '↓'}${Math.abs(report.changes.spend)}% | ${getStatus(report.changes.spend, 'spend')} |
| Clicks | ${report.performance.clicks} | ${report.changes.clicks > 0 ? '↑' : '↓'}${Math.abs(report.changes.clicks)}% | ${getStatus(report.changes.clicks, 'clicks')} |
| Leads | ${report.performance.leads} | ${report.changes.leads > 0 ? '↑' : '↓'}${Math.abs(report.changes.leads)}% | ${getStatus(report.changes.leads, 'leads')} |
| CPL | €${report.performance.cpl} | ${report.changes.cpl > 0 ? '↑' : '↓'}${Math.abs(report.changes.cpl)}% | ${getStatus(report.changes.cpl, 'cpl')} |

## Channel Performance

**Google Ads:** ${report.channel_breakdown.google_ads.leads} leads @ €${report.channel_breakdown.google_ads.cpl} CPL
**LinkedIn:** ${report.channel_breakdown.linkedin.leads} leads @ €${report.channel_breakdown.linkedin.cpl} CPL
**Email:** ${report.channel_breakdown.email.opens} opens, ${report.channel_breakdown.email.clicks} clicks
**Social:** ${report.channel_breakdown.social.engagements} engagements

## Top Performers

**Keywords:**
${report.top_performing.keywords.map(k => `- ${k.keyword}: ${k.conversions} conversions @ €${k.cpl}`).join('\n')}

**Ads:**
${report.top_performing.ads.map(a => `- ${a.headline}: CTR ${a.ctr}%, ${a.conversions} conversions`).join('\n')}

## Key Insights

${report.insights.map(i => `- ${i}`).join('\n')}

## Recommendations

${report.recommendations.map(r => `- ${r.action}: ${r.description}`).join('\n')}

## Budget Status

- Total Budget: €${report.budget_status.total_budget}
- Spent: €${report.budget_status.spent_to_date} (${Math.round(report.budget_status.spent_to_date / report.budget_status.total_budget * 100)}%)
- Remaining: €${report.budget_status.remaining}
- Pace: ${report.budget_status.pace}
- Projected Final: €${report.budget_status.projection}

---

View full dashboard: ${campaign.tracking_dashboard_url}

Generated by AI_MARKETING_AGENT
  `;
}
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Product Launch Campaign

**Input:**
```json
{
  "campaign_type": "product_launch",
  "data": {
    "brand": "ROBOPAC",
    "campaign_name": "Helix Ultimate Launch Q4 2025",
    "budget_eur": 50000,
    "duration_days": 90,
    "channels": ["google_ads", "linkedin", "email", "content"]
  }
}
```

**Output:**
- Budget allocated: Google Ads (€17.5k), LinkedIn (€15k), Content (€7.5k), Email (€5k), Events (€5k)
- 15 ad creatives created
- 4-email drip campaign setup
- 30 social media posts scheduled
- Daily performance monitoring active

---

### Beispiel 2: Trade Show Campaign

**Input:**
```json
{
  "campaign_type": "trade_show",
  "data": {
    "event_name": "interpack 2026",
    "budget_eur": 30000,
    "pre_event_campaign": true
  }
}
```

**Output:**
- Pre-event email campaign (4 weeks before)
- LinkedIn ads targeting attendees
- Social media countdown posts
- On-site lead capture integration
- Post-event follow-up sequence (5 emails over 3 weeks)

---

## ✅ Deployment Checklist

- [ ] Workflow importiert
- [ ] Google Ads API credentials
- [ ] LinkedIn Ads API credentials
- [ ] Facebook Ads API credentials
- [ ] Email Marketing Platform API (Mailchimp/HubSpot)
- [ ] Social Media Scheduling API (Buffer/Hootsuite)
- [ ] Google Analytics setup
- [ ] UTM tracking configured
- [ ] Conversion pixels installed
- [ ] Budget limits configured
- [ ] Alert thresholds set
- [ ] Reporting dashboards created

---

## 📈 Success Metrics

- **CPL (Cost Per Lead):** Target <€250
- **CTR (Click-Through Rate):** Target >2%
- **Conversion Rate:** Target >3%
- **MQL to SQL Conversion:** Target >30%
- **ROI:** Target >300%
- **Budget Efficiency:** <5% variance from plan

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
