# AI_CONTENT_AGENT - Content Creation & Management

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** Automatische Content-Erstellung für alle Marketing-Kanäle und AETNA Group Marken

---

## 📋 Übersicht

Der **AI_CONTENT_AGENT** ist der Content-Creator des WiesLogic Systems. Er:

✅ **Erstellt Blog Posts** mit SEO-Optimierung
✅ **Generiert Social Media Content** (LinkedIn, Twitter, Facebook)
✅ **Schreibt Case Studies** aus erfolgreichen Projekten
✅ **Erstellt Product Descriptions** und Technical Content
✅ **Generiert Email Content** für Kampagnen
✅ **Schreibt Video Scripts** und Präsentationen
✅ **Managed Content Calendar** mit Publishing-Workflow
✅ **Multi-lingual** (Deutsch, Englisch, weitere Sprachen)

---

## 🎯 Hauptaufgaben

### 1. Content Creation
- Blog Posts (SEO-optimiert, 800-1500 Wörter)
- Social Media Posts (plattformspezifisch)
- Case Studies (Success Stories mit ROI-Daten)
- Product Descriptions (technisch + marketing)
- Email Copy (Subject Lines, Body, CTAs)
- Video Scripts (YouTube, Product Demos)
- Landing Pages (Conversion-optimiert)
- Whitepapers & E-Books

### 2. Content Optimization
- SEO Keyword Integration
- Readability Scoring
- Brand Voice Compliance
- Multi-language Translation
- A/B Testing Variants

### 3. Content Management
- Content Calendar Management
- Publishing Workflow (Draft → Review → Approved → Published)
- Content Performance Tracking
- Content Repurposing (Blog → Social → Email)

### 4. Brand Alignment
- Separate Brand Voice per AETNA Marke
- Industry-specific Terminology
- Technical Accuracy Validation
- Compliance & Legal Review

---

## 🔄 Workflow-Ablauf

```
Content Request → Topic Research → AI Generation → SEO Optimization →
Brand Review → Approval → Publishing → Performance Tracking
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger

**Path:** `/webhook/content-agent`
**Method:** POST
**Auth:** Bearer Token

**Trigger Sources:**

**1. Manual Content Request:**
```json
{
  "source": "manual_request",
  "content_type": "blog_post",
  "data": {
    "brand": "ROBOPAC",
    "topic": "ROI of Automated Pallet Wrapping",
    "target_audience": "logistics_managers",
    "language": "EN",
    "keywords": ["pallet wrapping", "ROI", "automation", "logistics"],
    "tone": "professional_informative",
    "word_count": 1200,
    "deadline": "2025-11-01",
    "requested_by": "marketing@robopac.com"
  }
}
```

**2. Scheduled Content (Content Calendar):**
```json
{
  "source": "content_calendar",
  "content_type": "social_media",
  "data": {
    "brand": "OCME",
    "platform": "linkedin",
    "campaign": "End-of-Line Automation Week",
    "scheduled_date": "2025-10-28",
    "content_template": "product_showcase"
  }
}
```

**3. Case Study from Completed Project:**
```json
{
  "source": "completed_project",
  "content_type": "case_study",
  "data": {
    "brand": "ROBOPAC",
    "customer_name": "Logistics GmbH",
    "project_id": "PROJ_123456",
    "product_installed": "Helix Premium",
    "installation_date": "2024-01-15",
    "results": {
      "throughput_increase": "40%",
      "labor_savings": "2 FTE",
      "roi_months": 18,
      "customer_satisfaction": 5.0
    }
  }
}
```

**4. Product Launch Content:**
```json
{
  "source": "product_launch",
  "content_type": "multi_channel",
  "data": {
    "brand": "SOTEMAPACK",
    "product_name": "EcoSeal Pro",
    "product_category": "traysealer",
    "launch_date": "2025-11-15",
    "key_features": ["energy_efficient", "sustainable", "high_speed"],
    "channels": ["blog", "linkedin", "email", "landing_page"]
  }
}
```

---

### Node 2: Load Brand Guidelines

**Type:** Code (JavaScript) + Google Sheets Lookup

```javascript
/**
 * BRAND GUIDELINES LOADER
 * Lädt Brand-spezifische Content-Richtlinien
 */

const input = $input.item.json;
const brand = input.data.brand;

// Brand Voice Guidelines für alle AETNA Marken
const brandGuidelines = {
  'ROBOPAC': {
    brand_name: 'ROBOPAC',
    tagline: 'Wrapping the world',
    voice: 'Professional, innovative, reliability-focused',
    tone: 'Confident but approachable',
    key_messages: [
      'Global leader in pallet wrapping',
      'Innovation through engineering excellence',
      'Reliability and durability',
      'Sustainable packaging solutions'
    ],
    target_audiences: ['logistics_managers', 'warehouse_directors', 'operations_teams'],
    forbidden_terms: ['cheap', 'basic', 'simple'],
    preferred_terms: ['cost-effective', 'efficient', 'streamlined'],
    color_palette: ['#E30613', '#000000', '#FFFFFF'],
    primary_industries: ['logistics', 'warehousing', 'distribution', 'manufacturing']
  },

  'OCME': {
    brand_name: 'OCME',
    tagline: 'Excellence in end-of-line',
    voice: 'Technical expert, precision-focused, innovative',
    tone: 'Authoritative and solution-oriented',
    key_messages: [
      'Complete end-of-line solutions',
      'Precision engineering',
      'Customized solutions for complex needs',
      'Industry 4.0 ready'
    ],
    target_audiences: ['production_managers', 'plant_engineers', 'technical_directors'],
    forbidden_terms: ['one-size-fits-all', 'generic'],
    preferred_terms: ['tailored', 'engineered', 'customized'],
    color_palette: ['#005EB8', '#000000', '#FFFFFF'],
    primary_industries: ['food_beverage', 'pharmaceutical', 'consumer_goods']
  },

  'PRASMATIC': {
    brand_name: 'PRASMATIC',
    tagline: 'Liquid packaging innovation',
    voice: 'Innovative, flexible, sustainability-conscious',
    tone: 'Forward-thinking and eco-aware',
    key_messages: [
      'Flexible liquid packaging solutions',
      'Bag-in-Box technology leaders',
      'Sustainability through innovation',
      'Food safety and quality'
    ],
    target_audiences: ['beverage_producers', 'food_manufacturers', 'chemical_companies'],
    forbidden_terms: ['rigid', 'inflexible'],
    preferred_terms: ['flexible', 'adaptable', 'sustainable'],
    color_palette: ['#00A651', '#000000', '#FFFFFF'],
    primary_industries: ['beverage', 'food', 'chemicals', 'wine_spirits']
  },

  'SOTEMAPACK': {
    brand_name: 'SOTEMAPACK',
    tagline: 'Fresh thinking in packaging',
    voice: 'Fresh, modern, quality-focused',
    tone: 'Clean and precise',
    key_messages: [
      'Fresh food packaging experts',
      'MAP technology leaders',
      'Quality and food safety',
      'Aesthetic and functional design'
    ],
    target_audiences: ['food_producers', 'ready_meal_manufacturers', 'retail_chains'],
    forbidden_terms: ['preservatives', 'artificial'],
    preferred_terms: ['fresh', 'natural', 'quality'],
    color_palette: ['#0066CC', '#FFFFFF', '#F0F0F0'],
    primary_industries: ['fresh_food', 'ready_meals', 'meat_poultry', 'seafood']
  },

  'MEYPACK': {
    brand_name: 'MEYPACK',
    tagline: 'Carton handling solutions',
    voice: 'Reliable, efficient, pragmatic',
    tone: 'Straightforward and solution-focused',
    key_messages: [
      'Efficient case handling',
      'Robust and reliable machinery',
      'Easy integration',
      'Low total cost of ownership'
    ],
    target_audiences: ['packaging_managers', 'operations_managers', 'plant_supervisors'],
    forbidden_terms: ['complicated', 'difficult'],
    preferred_terms: ['straightforward', 'efficient', 'reliable'],
    color_palette: ['#FF6600', '#000000', '#FFFFFF'],
    primary_industries: ['consumer_goods', 'e-commerce', 'retail', 'distribution']
  }
};

const guidelines = brandGuidelines[brand] || brandGuidelines['ROBOPAC'];

return {
  json: {
    ...input,
    brand_guidelines: guidelines
  }
};
```

---

### Node 3: Research & Context Gathering

**Type:** Multiple Parallel Operations

**3a) RAG - Topic Research:**
```javascript
{
  "query": "Research content about {{ topic }} in {{ industry }} for {{ brand }}",
  "vector_store_id": "{{ $env.OPENAI_CONTENT_KB_VECTOR_STORE_ID }}",
  "top_k": 10,
  "similarity_threshold": 0.70
}
```

**3b) Load Related Case Studies:**
```javascript
// Query Google Sheets for relevant case studies
{
  "sheet": "14_🎯_Case_Studies",
  "filter": "Brand = '{{ brand }}' AND Status = 'published'"
}
```

**3c) Load Product Data (if product-related):**
```javascript
{
  "sheet": "06_📦_Product_Portfolio",
  "filter": "Brand = '{{ brand }}' AND Status = 'active'"
}
```

**3d) SEO Keyword Research (if blog post):**
```javascript
// Simulate keyword research
// In production, integrate with SEMrush, Ahrefs, or Google Keyword Planner API

const keywords = {
  primary: input.data.keywords[0],
  secondary: input.data.keywords.slice(1),
  long_tail: generateLongTailKeywords(input.data.keywords),
  search_volume: getSearchVolume(input.data.keywords), // External API
  competition: getKeywordCompetition(input.data.keywords) // External API
};
```

---

### Node 4: AI Content Generation

**Type:** OpenAI Chat (GPT-4)

**System Prompt (Dynamic based on content type):**
```javascript
function buildSystemPrompt(contentType, brandGuidelines) {
  const basePrompt = `You are a professional content writer for ${brandGuidelines.brand_name}, part of AETNA Group.

Brand Voice: ${brandGuidelines.voice}
Tone: ${brandGuidelines.tone}

Key Messages to incorporate:
${brandGuidelines.key_messages.map(m => `- ${m}`).join('\n')}

IMPORTANT Guidelines:
- Always maintain ${brandGuidelines.tone} tone
- Use preferred terms: ${brandGuidelines.preferred_terms.join(', ')}
- NEVER use forbidden terms: ${brandGuidelines.forbidden_terms.join(', ')}
- Target audience: ${brandGuidelines.target_audiences.join(', ')}
- Primary industries: ${brandGuidelines.primary_industries.join(', ')}
`;

  // Content-type specific instructions
  const typeInstructions = {
    'blog_post': `
Create a comprehensive blog post that:
1. Has an engaging headline (60-80 characters)
2. Includes an introduction that hooks the reader
3. Uses H2 and H3 subheadings for structure
4. Incorporates SEO keywords naturally
5. Includes data and statistics where relevant
6. Has a strong conclusion with clear CTA
7. Is 800-1500 words
8. Readability score: 60+ (Flesch Reading Ease)
`,
    'social_media': `
Create engaging social media content that:
1. Platform: {{ platform }}
2. Character limit awareness (LinkedIn: 3000, Twitter: 280)
3. Includes relevant hashtags (3-5)
4. Has clear CTA
5. Eye-catching hook in first line
6. Mentions or tags when relevant
`,
    'case_study': `
Create a compelling case study that:
1. Follows structure: Challenge → Solution → Results
2. Includes specific metrics and ROI data
3. Customer quote/testimonial
4. Technical details but accessible language
5. Before/after comparison
6. 600-1000 words
`,
    'email': `
Create persuasive email content that:
1. Subject line (40-50 characters, high open rate)
2. Preview text (90-140 characters)
3. Personalized greeting
4. Clear value proposition
5. Single, clear CTA
6. Mobile-optimized (short paragraphs)
7. 150-300 words
`,
    'product_description': `
Create compelling product description that:
1. Headline with key benefit
2. Feature-benefit format
3. Technical specifications clearly presented
4. Use cases and applications
5. What makes it unique
6. Strong CTA
7. 300-500 words
`
  };

  return basePrompt + (typeInstructions[contentType] || '');
}
```

**User Prompt:**
```javascript
{
  "prompt": `
Content Request:

Type: {{ content_type }}
Topic: {{ topic }}
Brand: {{ brand }}
Language: {{ language }}
Target Audience: {{ target_audience }}

{{ #if keywords }}
SEO Keywords to include:
- Primary: {{ keywords[0] }}
- Secondary: {{ keywords.slice(1).join(', ') }}
{{ /if }}

{{ #if case_study_data }}
Case Study Data:
Customer: {{ customer_name }}
Product: {{ product_installed }}
Results:
- Throughput Increase: {{ results.throughput_increase }}
- Labor Savings: {{ results.labor_savings }}
- ROI: {{ results.roi_months }} months
{{ /if }}

{{ #if research_context }}
Research Context:
{{ research_context }}
{{ /if }}

{{ #if product_data }}
Product Information:
{{ JSON.stringify(product_data, null, 2) }}
{{ /if }}

Please create the content following all brand guidelines and best practices.
`
}
```

**Expected Response (Blog Post Example):**
```markdown
# The True ROI of Automated Pallet Wrapping: A Data-Driven Analysis

In today's competitive logistics landscape, warehouse managers face mounting pressure to increase efficiency while controlling costs. Automated pallet wrapping has emerged as a critical solution, but what's the real return on investment?

## The Hidden Costs of Manual Wrapping

Manual pallet wrapping might seem cost-effective at first glance, but hidden costs add up quickly:

- **Labor Costs**: 2-3 operators per shift at €15-20/hour
- **Film Waste**: 20-30% higher consumption due to inconsistent wrapping
- **Load Damage**: 5-8% of manually wrapped loads suffer transport damage
- **Worker Safety**: Repetitive strain injuries and back problems

### Real-World Example: Logistics GmbH

When Logistics GmbH evaluated their wrapping operations, they discovered:
- 45 minutes average time per operator per shift on wrapping tasks
- €45,000 annual labor cost for wrapping alone
- 12% load damage rate resulting in €25,000 claims

## The Automated Solution

ROBOPAC's Helix Premium automated wrapper transformed their operations:

**Results after 6 months:**
- ⚡ **Throughput**: 85 pallets/hour vs. 15 manual
- 💰 **Labor Savings**: €30,000/year (2 FTE redeployed)
- 📉 **Film Savings**: 25% reduction in consumption
- ✅ **Quality**: Load damage reduced to <2%

### ROI Breakdown

Investment: €72,000 (equipment + installation)
Annual Savings: €45,000
**Payback Period: 18 months**

Year 1-3 Total Savings: €135,000
**Net Benefit: €63,000**

## Key Factors for Maximum ROI

1. **Volume Matters**: Wrapping 40+ pallets/day makes automation highly attractive
2. **Film Optimization**: Pre-stretch technology saves 20-30% on material costs
3. **Labor Reallocation**: Don't cut staff—redeploy to higher-value tasks
4. **Maintenance**: Proper maintenance ensures 10+ year operational life

## Making the Decision

Calculate your potential ROI:
1. Current wrapping costs (labor + materials + damage)
2. Estimated automation benefits
3. Available automation options
4. Integration requirements

[Download Our ROI Calculator] →

## Conclusion

The data is clear: automated pallet wrapping delivers measurable ROI, typically within 18-24 months. For operations wrapping 50+ pallets daily, the business case is compelling.

Ready to explore automation for your operation? Contact ROBOPAC for a free site assessment and customized ROI analysis.

**About ROBOPAC**: Global leader in pallet wrapping solutions, part of AETNA Group. Wrapping the world with innovation and reliability.

---
Keywords: pallet wrapping ROI, automated pallet wrapper, logistics automation, warehouse efficiency, ROBOPAC
Word Count: 1,247
```

---

### Node 5: SEO Optimization & Analysis

**Type:** Code (JavaScript)

```javascript
/**
 * SEO OPTIMIZATION ENGINE
 * Analysiert und optimiert Content für SEO
 */

const content = $input.item.json.ai_generated_content;
const keywords = $input.item.json.data.keywords || [];
const contentType = $input.item.json.content_type;

// Only for blog posts and landing pages
if (!['blog_post', 'landing_page'].includes(contentType)) {
  return { json: { ...$input.item.json, seo_analysis: null } };
}

// Helper: Calculate keyword density
function calculateKeywordDensity(content, keyword) {
  const text = content.toLowerCase();
  const words = text.split(/\s+/).length;
  const keywordOccurrences = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  return (keywordOccurrences / words) * 100;
}

// Helper: Check title tag
function analyzeTitleTag(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (!titleMatch) return { exists: false, length: 0, score: 0 };

  const title = titleMatch[1];
  const length = title.length;
  const score = (length >= 50 && length <= 80) ? 100 :
                (length >= 40 && length <= 90) ? 70 : 40;

  return { exists: true, title, length, score };
}

// Helper: Check meta description (from first paragraph)
function analyzeMetaDescription(content) {
  const firstPara = content.split('\n\n')[1] || '';
  const length = firstPara.length;
  const score = (length >= 140 && length <= 160) ? 100 :
                (length >= 120 && length <= 180) ? 70 : 40;

  return { text: firstPara, length, score };
}

// Helper: Check heading structure
function analyzeHeadings(content) {
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;

  const hasStructure = h2Count >= 2;
  const score = hasStructure ? 100 : h2Count > 0 ? 50 : 0;

  return { h2_count: h2Count, h3_count: h3Count, has_structure: hasStructure, score };
}

// Helper: Calculate readability (Flesch Reading Ease approximation)
function calculateReadability(content) {
  const sentences = content.split(/[.!?]+/).length;
  const words = content.split(/\s+/).length;
  const syllables = estimateSyllables(content);

  // Flesch Reading Ease formula (approximation)
  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  let rating;
  if (score >= 80) rating = 'very_easy';
  else if (score >= 60) rating = 'easy';
  else if (score >= 50) rating = 'fairly_difficult';
  else rating = 'difficult';

  return { score: Math.round(score), rating };
}

function estimateSyllables(text) {
  // Rough syllable estimation
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  for (const word of words) {
    count += (word.match(/[aeiou]+/g) || []).length;
  }
  return count;
}

// Helper: Check internal links
function analyzeInternalLinks(content) {
  const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  const internalLinks = links.filter(link => !link.includes('http'));

  return {
    total_links: links.length,
    internal_links: internalLinks.length,
    score: internalLinks.length >= 2 ? 100 : internalLinks.length > 0 ? 50 : 0
  };
}

// PERFORM SEO ANALYSIS

const titleAnalysis = analyzeTitleTag(content);
const metaAnalysis = analyzeMetaDescription(content);
const headingAnalysis = analyzeHeadings(content);
const readabilityAnalysis = calculateReadability(content);
const linkAnalysis = analyzeInternalLinks(content);

// Keyword analysis
const keywordAnalysis = keywords.map(kw => ({
  keyword: kw,
  density: calculateKeywordDensity(content, kw),
  in_title: titleAnalysis.title?.toLowerCase().includes(kw.toLowerCase()) || false,
  in_first_paragraph: metaAnalysis.text.toLowerCase().includes(kw.toLowerCase()),
  score: calculateKeywordScore(kw, content, titleAnalysis, metaAnalysis)
}));

function calculateKeywordScore(keyword, content, title, meta) {
  let score = 0;
  const density = calculateKeywordDensity(content, keyword);

  // Density score (optimal: 1-2%)
  if (density >= 1 && density <= 2) score += 40;
  else if (density >= 0.5 && density <= 3) score += 25;
  else score += 10;

  // Title presence
  if (title.title?.toLowerCase().includes(keyword.toLowerCase())) score += 30;

  // First paragraph presence
  if (meta.text.toLowerCase().includes(keyword.toLowerCase())) score += 30;

  return score;
}

// Calculate overall SEO score
const overallScore = Math.round(
  (titleAnalysis.score * 0.20) +
  (metaAnalysis.score * 0.15) +
  (headingAnalysis.score * 0.15) +
  (readabilityAnalysis.score >= 60 ? 100 : readabilityAnalysis.score) * 0.20 +
  (linkAnalysis.score * 0.10) +
  (keywordAnalysis.reduce((sum, k) => sum + k.score, 0) / keywordAnalysis.length) * 0.20
);

return {
  json: {
    ...$input.item.json,
    seo_analysis: {
      overall_score: overallScore,
      title: titleAnalysis,
      meta_description: metaAnalysis,
      headings: headingAnalysis,
      readability: readabilityAnalysis,
      internal_links: linkAnalysis,
      keywords: keywordAnalysis,
      recommendations: generateSEORecommendations(overallScore, {
        titleAnalysis,
        metaAnalysis,
        headingAnalysis,
        readabilityAnalysis,
        linkAnalysis,
        keywordAnalysis
      })
    }
  }
};

function generateSEORecommendations(score, analyses) {
  const recommendations = [];

  if (analyses.titleAnalysis.score < 80) {
    recommendations.push('Optimize title length to 50-80 characters');
  }
  if (analyses.keywordAnalysis.some(k => !k.in_title)) {
    recommendations.push('Include primary keyword in title');
  }
  if (analyses.headingAnalysis.h2_count < 2) {
    recommendations.push('Add more H2 subheadings for better structure');
  }
  if (analyses.readabilityAnalysis.score < 60) {
    recommendations.push('Simplify language for better readability');
  }
  if (analyses.linkAnalysis.internal_links < 2) {
    recommendations.push('Add 2-3 internal links to related content');
  }

  return recommendations;
}
```

**Output:**
```json
{
  "seo_analysis": {
    "overall_score": 87,
    "title": {
      "title": "The True ROI of Automated Pallet Wrapping: A Data-Driven Analysis",
      "length": 68,
      "score": 100
    },
    "readability": {
      "score": 64,
      "rating": "easy"
    },
    "keywords": [
      {
        "keyword": "pallet wrapping",
        "density": 1.8,
        "in_title": true,
        "score": 100
      }
    ],
    "recommendations": []
  }
}
```

---

### Node 6: Multi-language Translation (if needed)

**Type:** OpenAI Chat (GPT-4)

**Condition:** Only if language !== original language

```javascript
{
  "system": "You are a professional translator specializing in technical and marketing content for the packaging industry. Translate the following content while maintaining technical accuracy, brand voice, and SEO keywords.",
  "user": `
Translate this content from {{ source_language }} to {{ target_language }}:

{{ ai_generated_content }}

IMPORTANT:
- Maintain brand voice: {{ brand_voice }}
- Keep technical terms accurate
- Preserve SEO keywords (adapt for target market)
- Maintain formatting and structure
`
}
```

---

### Node 7: Content Review & Approval Decision

**Type:** Code (JavaScript)

```javascript
/**
 * CONTENT APPROVAL LOGIC
 * Entscheidet ob Content auto-approved oder Review benötigt
 */

const input = $input.item.json;
const contentType = input.content_type;
const seoScore = input.seo_analysis?.overall_score || 0;
const brand = input.data.brand;

// Auto-approval criteria
let requiresReview = false;
let approvalReason = [];

// Always require review for:
if (contentType === 'case_study') {
  requiresReview = true;
  approvalReason.push('Case studies always require customer approval');
}

if (contentType === 'product_launch') {
  requiresReview = true;
  approvalReason.push('Product launch content requires management review');
}

// SEO score too low
if (seoScore > 0 && seoScore < 70) {
  requiresReview = true;
  approvalReason.push(`SEO score too low: ${seoScore}/100`);
}

// Content length check (blog posts)
if (contentType === 'blog_post') {
  const wordCount = input.ai_generated_content.split(/\s+/).length;
  if (wordCount < 800 || wordCount > 2000) {
    requiresReview = true;
    approvalReason.push(`Word count outside range: ${wordCount} words`);
  }
}

// Forbidden terms check
const forbiddenTerms = input.brand_guidelines.forbidden_terms || [];
const contentLower = input.ai_generated_content.toLowerCase();
const foundForbidden = forbiddenTerms.filter(term =>
  contentLower.includes(term.toLowerCase())
);

if (foundForbidden.length > 0) {
  requiresReview = true;
  approvalReason.push(`Contains forbidden terms: ${foundForbidden.join(', ')}`);
}

// Determine status
let status;
if (requiresReview) {
  status = 'pending_review';
} else {
  status = 'auto_approved';
}

return {
  json: {
    ...input,
    approval_decision: {
      requires_review: requiresReview,
      status: status,
      reasons: approvalReason,
      reviewer_email: requiresReview ? 'content-review@aetnagroup.com' : null
    },
    content_id: 'CONTENT_' + Date.now()
  }
};
```

---

### Node 8: Decision - Auto-approved?

**Type:** IF Node
**Condition:** `{{ $json.approval_decision.requires_review === false }}`

**TRUE:** → Publish Content Directly
**FALSE:** → Send for Review

---

### Node 9a: Send for Review (FALSE path)

**Type:** Send Email + Google Docs

**Create Review Document:**
```markdown
# Content Review Required

**Content ID:** {{ content_id }}
**Type:** {{ content_type }}
**Brand:** {{ brand }}
**Language:** {{ language }}
**Requested by:** {{ requested_by }}
**Deadline:** {{ deadline }}

---

## Review Reasons

{{ #each approval_decision.reasons }}
- {{ this }}
{{ /each }}

---

## Content Preview

{{ ai_generated_content }}

---

{{ #if seo_analysis }}
## SEO Analysis

**Overall Score:** {{ seo_analysis.overall_score }}/100

**Recommendations:**
{{ #each seo_analysis.recommendations }}
- {{ this }}
{{ /each }}
{{ /if }}

---

## Actions

[APPROVE] [REQUEST CHANGES] [REJECT]

**Comments:**
[Add your feedback here]
```

**Send Email:**
```javascript
{
  "to": "content-review@aetnagroup.com",
  "subject": "Content Review Required - {{ brand }} {{ content_type }}",
  "body": "New content requires your review. Document: {{ review_doc_link }}"
}
```

**Write to Approval Queue:**
```javascript
{
  "sheet": "12_🔐_Approval_Queue",
  "data": {
    "content_id": "{{ content_id }}",
    "content_type": "{{ content_type }}",
    "brand": "{{ brand }}",
    "status": "pending_review",
    "submitted_date": "{{ $now.toISO() }}"
  }
}
```

---

### Node 9b: Publish Content (TRUE path / After Approval)

**Type:** Multiple Parallel Actions

**Write to Content Library:**
```javascript
{
  "sheet": "20_📚_Content_Library",
  "data": {
    "content_id": "{{ content_id }}",
    "content_type": "{{ content_type }}",
    "brand": "{{ brand }}",
    "title": "{{ extractTitle(ai_generated_content) }}",
    "language": "{{ language }}",
    "word_count": "{{ ai_generated_content.split(/\s+/).length }}",
    "keywords": "{{ data.keywords.join(', ') }}",
    "seo_score": "{{ seo_analysis.overall_score }}",
    "target_audience": "{{ data.target_audience }}",
    "status": "published",
    "content_text": "{{ ai_generated_content }}",
    "created_date": "{{ $now.toISO() }}",
    "published_date": "={{ $now.toISO() }}",
    "created_by": "AI_CONTENT_AGENT",
    "performance_tracking_url": ""
  }
}
```

**If blog_post → Create Google Doc + Publish to CMS:**
```javascript
// Create formatted Google Doc
// Publish to WordPress/CMS via API
```

**If social_media → Schedule posting:**
```javascript
// Send to social media scheduling tool (Buffer, Hootsuite, LinkedIn API)
{
  "platform": "{{ data.platform }}",
  "content": "{{ ai_generated_content }}",
  "scheduled_time": "{{ data.scheduled_date }}"
}
```

**If email → Add to email campaign:**
```javascript
// Add to email marketing platform (Mailchimp, HubSpot)
```

---

### Node 10: Log to Master Log

**Type:** Google Sheets Append
**Sheet:** `13📑Master_Log`

```javascript
{
  "execution_id": "CONTENT_{{ Date.now() }}",
  "step_name": "content_generated",
  "agent_name": "AI_CONTENT_AGENT",
  "content_id": "{{ content_id }}",
  "brand": "{{ brand }}",
  "action": "content_{{ approval_decision.status }}",
  "content_type": "{{ content_type }}",
  "seo_score": "{{ seo_analysis.overall_score }}",
  "result": "success",
  "timestamp": "{{ $now.toISO() }}",
  "notes": "{{ content_type }} created for {{ brand }}, status: {{ approval_decision.status }}"
}
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Blog Post - Auto-approved

**Input:**
```json
{
  "content_type": "blog_post",
  "data": {
    "brand": "ROBOPAC",
    "topic": "ROI of Automated Pallet Wrapping",
    "language": "EN",
    "keywords": ["pallet wrapping", "ROI", "automation"]
  }
}
```

**Output:**
- 1,247 word blog post
- SEO Score: 87/100
- Auto-approved ✅
- Published to WordPress
- Added to content library

---

### Beispiel 2: Case Study - Requires Review

**Input:**
```json
{
  "content_type": "case_study",
  "data": {
    "brand": "OCME",
    "customer_name": "Food Corp AG",
    "results": {
      "throughput_increase": "60%",
      "roi_months": 12
    }
  }
}
```

**Output:**
- Complete case study generated
- Status: Pending Review (customer approval required)
- Review doc created
- Email sent to content team

---

### Beispiel 3: Multi-channel Product Launch

**Input:**
```json
{
  "content_type": "multi_channel",
  "data": {
    "brand": "SOTEMAPACK",
    "product_name": "EcoSeal Pro",
    "channels": ["blog", "linkedin", "email"]
  }
}
```

**Output:**
- Blog post (1200 words)
- LinkedIn post (300 chars + image suggestion)
- Email campaign (subject + body + CTA)
- Landing page copy
- All in content library, pending review

---

## ✅ Deployment Checklist

- [ ] Workflow importiert
- [ ] OpenAI API Key konfiguriert (GPT-4)
- [ ] Vector Store für Content KB erstellt
- [ ] Brand Guidelines für alle 5 Marken konfiguriert
- [ ] CMS Integration (WordPress API)
- [ ] Social Media APIs (LinkedIn, Twitter)
- [ ] Email Marketing Platform API
- [ ] Google Docs Templates erstellt
- [ ] Review Workflow Email Adressen gesetzt
- [ ] Content Library Sheet erstellt
- [ ] Test Content für alle Typen:
  - [ ] Blog Post
  - [ ] Social Media (LinkedIn, Twitter, Facebook)
  - [ ] Case Study
  - [ ] Email
  - [ ] Product Description
  - [ ] Landing Page

---

## 📈 Success Metrics

- **Content Generation Time:** <10 minutes per piece
- **SEO Score Average:** >80/100
- **Auto-approval Rate:** >60%
- **Content Engagement:** Track clicks, shares, conversions
- **Publish Frequency:** 4-8 pieces per brand per month
- **Multi-language Coverage:** DE/EN minimum

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
