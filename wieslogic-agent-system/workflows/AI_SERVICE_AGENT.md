# AI_SERVICE_AGENT - After-Sales Support & Service Management

**Version:** 2025.10.2
**Status:** Production Ready
**Purpose:** After-Sales Support, Wartung und Service-Management für alle AETNA Group Marken

---

## 📋 Übersicht

Der **AI_SERVICE_AGENT** übernimmt den kompletten After-Sales Service nach Maschinenlieferung. Er:

✅ **Managed Service Tickets** mit automatischer Priorisierung
✅ **Troubleshooting Support** mit AI-basierter Problemlösung
✅ **Ersatzteil-Management** mit automatischer Bestellung
✅ **Wartungsplanung** (Preventive & Predictive Maintenance)
✅ **Service-Verträge** Management und Renewal
✅ **Customer Satisfaction** Tracking und Feedback

---

## 🎯 Hauptaufgaben

### 1. Service Ticket Management
- Automatische Ticket-Erstellung aus Emails/Calls
- Intelligente Priorisierung (Critical/High/Medium/Low)
- Techniker-Routing basierend auf Expertise
- SLA-Tracking und Eskalation

### 2. Technical Troubleshooting
- AI-basierte Fehlerdiagnose via RAG
- Zugriff auf Knowledge Base mit historischen Cases
- Remote Diagnostics Integration
- Step-by-step Troubleshooting Guides

### 3. Spare Parts Management
- Automatische Teilidentifikation
- Lagerbestandsprüfung
- Express-Bestellung für kritische Teile
- Alternative Teile-Vorschläge

### 4. Maintenance Planning
- Preventive Maintenance Schedules
- Predictive Maintenance Alerts (IoT Integration)
- Maintenance Contract Management
- Service Visit Scheduling

### 5. Customer Satisfaction
- Automatische Feedback-Collection
- NPS (Net Promoter Score) Tracking
- Issue Resolution Tracking
- Upsell Opportunities Detection

---

## 🔄 Workflow-Ablauf

```
Service Request → Ticket Creation → Priority Assessment → Troubleshooting →
Parts Ordering (if needed) → Technician Dispatch → Resolution → Feedback
```

---

## 🏗️ Node-Struktur

### Node 1: Webhook Trigger

**Path:** `/webhook/service-agent`
**Method:** POST
**Auth:** Bearer Token

**Trigger Sources:**
1. **Email** - Customer sends support email
2. **Phone** - Support call transcription
3. **Portal** - Customer submits ticket via web portal
4. **IoT** - Machine sends error signal
5. **Scheduled** - Preventive maintenance due

**Payload Examples:**

**Email Support Request:**
```json
{
  "master_execution_id": "MASTER_123...",
  "customer_id": "AETNA_GROUP_001",
  "source": "email",
  "data": {
    "from_email": "maintenance@logistics.de",
    "from_name": "John Doe",
    "subject": "Helix Premium - Error Code E401",
    "body": "Our wrapper is showing error code E401 and stopped working. Production is halted. Please help urgently.",
    "received_date": "2025-10-26T10:30:00Z",
    "attachments": ["error_screenshot.jpg"]
  }
}
```

**IoT Alert:**
```json
{
  "source": "iot",
  "data": {
    "machine_id": "RBP_002_SN123456",
    "machine_type": "pallet_wrapper",
    "model_name": "Helix Premium",
    "error_code": "E401",
    "error_description": "Film carriage motor overload",
    "severity": "critical",
    "timestamp": "2025-10-26T10:28:45Z",
    "telemetry": {
      "motor_temperature": 85,
      "motor_current": 12.5,
      "cycle_count": 45230
    }
  }
}
```

---

### Node 2: Extract Service Request Information

**Type:** Code (JavaScript)

```javascript
/**
 * SERVICE REQUEST EXTRACTION
 * Extrahiert strukturierte Daten aus Service Request
 */

const input = $input.item.json;
const source = input.source;

// Helper: Extract error code from text
function extractErrorCode(text) {
  // Matches: E401, ERR-401, Error 401, etc.
  const patterns = [
    /E[RR]*[-\s]*(\d{3,4})/i,
    /ERROR[-\s]*CODE[-\s]*[:#]?\s*(\d{3,4})/i,
    /CODE[-\s]*(\d{3,4})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return 'E' + match[1];
    }
  }

  return null;
}

// Helper: Detect urgency from text
function detectUrgency(text) {
  const urgentKeywords = [
    'urgent', 'critical', 'emergency', 'stopped', 'down', 'halted',
    'dringend', 'notfall', 'stillstand', 'ausgefallen', 'sofort'
  ];

  const textLower = (text || '').toLowerCase();
  const urgencyScore = urgentKeywords.filter(kw => textLower.includes(kw)).length;

  if (urgencyScore >= 2) return 'critical';
  if (urgencyScore >= 1) return 'high';
  return 'medium';
}

// Helper: Extract machine information
function extractMachineInfo(text, customerId) {
  // Try to find machine model in text
  const machineModels = [
    'helix standard', 'helix premium', 'helix ultimate',
    'artis', 'vega', 'kronos',
    // Add more model names
  ];

  const textLower = text.toLowerCase();
  for (const model of machineModels) {
    if (textLower.includes(model)) {
      return { model: model, found: true };
    }
  }

  return { model: null, found: false };
}

// Helper: Classify issue type
function classifyIssueType(text, errorCode) {
  const textLower = (text || '').toLowerCase();

  // Mechanical issues
  if (textLower.match(/motor|bearing|chain|belt|gear|jam/)) {
    return 'mechanical';
  }

  // Electrical issues
  if (textLower.match(/electrical|power|voltage|circuit|sensor|wiring/)) {
    return 'electrical';
  }

  // Software issues
  if (textLower.match(/software|program|plc|hmi|display|screen/)) {
    return 'software';
  }

  // Film/material issues (pallet wrappers)
  if (textLower.match(/film|wrap|material|tear|break/)) {
    return 'material';
  }

  // Operational issues
  if (textLower.match(/operation|setting|parameter|configuration/)) {
    return 'operational';
  }

  // Error code based classification
  if (errorCode) {
    const code = parseInt(errorCode.replace(/\D/g, ''));
    if (code >= 100 && code < 200) return 'mechanical';
    if (code >= 200 && code < 300) return 'electrical';
    if (code >= 300 && code < 400) return 'sensor';
    if (code >= 400 && code < 500) return 'motor';
    if (code >= 500 && code < 600) return 'software';
  }

  return 'general';
}

// EXTRACT BASED ON SOURCE

let serviceRequest = {
  ticket_id: 'TICKET_' + Date.now(),
  customer_id: input.customer_id,
  source: source,
  received_date: new Date().toISOString()
};

if (source === 'email') {
  const emailData = input.data;
  const fullText = emailData.subject + ' ' + emailData.body;

  serviceRequest = {
    ...serviceRequest,
    customer_email: emailData.from_email,
    customer_name: emailData.from_name,
    subject: emailData.subject,
    description: emailData.body,
    error_code: extractErrorCode(fullText),
    urgency: detectUrgency(fullText),
    machine_info: extractMachineInfo(fullText, input.customer_id),
    issue_type: classifyIssueType(fullText, extractErrorCode(fullText)),
    attachments: emailData.attachments || []
  };

} else if (source === 'iot') {
  const iotData = input.data;

  serviceRequest = {
    ...serviceRequest,
    machine_id: iotData.machine_id,
    machine_type: iotData.machine_type,
    model_name: iotData.model_name,
    error_code: iotData.error_code,
    error_description: iotData.error_description,
    urgency: iotData.severity,
    issue_type: classifyIssueType(iotData.error_description, iotData.error_code),
    telemetry: iotData.telemetry,
    description: `IoT Alert: ${iotData.error_description}`
  };

} else if (source === 'phone') {
  const phoneData = input.data;
  const transcript = phoneData.call_transcript;

  serviceRequest = {
    ...serviceRequest,
    customer_phone: phoneData.caller_phone,
    customer_name: phoneData.caller_name,
    call_duration: phoneData.duration_seconds,
    description: transcript,
    error_code: extractErrorCode(transcript),
    urgency: detectUrgency(transcript),
    issue_type: classifyIssueType(transcript, extractErrorCode(transcript))
  };
}

// Calculate SLA deadline based on urgency
function calculateSLA(urgency) {
  const now = new Date();
  let slaHours = 0;

  switch(urgency) {
    case 'critical': slaHours = 4; break;  // 4 hours
    case 'high': slaHours = 24; break;     // 1 day
    case 'medium': slaHours = 72; break;   // 3 days
    case 'low': slaHours = 168; break;     // 7 days
    default: slaHours = 72;
  }

  const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
  return {
    sla_hours: slaHours,
    sla_deadline: slaDeadline.toISOString()
  };
}

const slaInfo = calculateSLA(serviceRequest.urgency);

return {
  json: {
    ...input,
    service_request: {
      ...serviceRequest,
      ...slaInfo,
      status: 'new'
    }
  }
};
```

**Output:**
```json
{
  "service_request": {
    "ticket_id": "TICKET_1729958400000",
    "customer_email": "maintenance@logistics.de",
    "error_code": "E401",
    "urgency": "critical",
    "issue_type": "motor",
    "sla_hours": 4,
    "sla_deadline": "2025-10-26T14:30:00Z",
    "status": "new"
  }
}
```

---

### Node 3: Load Customer & Machine Data

**Type:** Google Sheets Lookup (Multiple Sheets)

**3a) Customer Info** from `17_🔍_Client_Config`
```javascript
{
  "filter": "Customer_ID = '{{ $json.customer_id }}'"
}
```

**3b) Machine/Order Info** from `03_📦_Orders_Contracts`
```javascript
{
  "filter": "Customer_ID = '{{ $json.customer_id }}' AND Status = 'active'"
}
```

**Returns:**
```json
{
  "customer_info": {
    "company_name": "Logistics GmbH",
    "service_contract": "premium",
    "contract_expiry": "2026-12-31",
    "support_language": "DE"
  },
  "machines": [
    {
      "machine_id": "RBP_002_SN123456",
      "model_name": "Helix Premium",
      "installation_date": "2024-01-15",
      "warranty_expiry": "2026-01-15",
      "last_service_date": "2025-09-10"
    }
  ]
}
```

---

### Node 4: RAG - Troubleshooting Knowledge Base

**Type:** OpenAI Vector Store Search

**Query:**
```javascript
{
  "query": `Troubleshoot ${model_name} error ${error_code}: ${description}. Issue type: ${issue_type}`,
  "vector_store_id": "{{ $env.OPENAI_SERVICE_KB_VECTOR_STORE_ID }}",
  "top_k": 5,
  "similarity_threshold": 0.70
}
```

**Expected Response:**
```json
{
  "results": [
    {
      "content": "Error E401 - Film Carriage Motor Overload\n\nCause: Motor overheating due to excessive friction\n\nSolution Steps:\n1. Check film carriage rail for debris\n2. Lubricate carriage bearings\n3. Check motor temperature sensor\n4. Reset error and test",
      "similarity": 0.92,
      "source": "service_manual_helix_premium_v2.pdf",
      "metadata": {
        "error_code": "E401",
        "resolution_rate": "95%",
        "avg_resolution_time": "45 minutes"
      }
    }
  ]
}
```

---

### Node 5: AI Diagnosis & Solution Recommendation

**Type:** OpenAI Chat

**System Prompt:**
```
You are a senior service technician for AETNA Group packaging machines. Analyze service requests and provide:
1. Root cause analysis
2. Step-by-step troubleshooting guide
3. Required spare parts (if any)
4. Estimated resolution time
5. Remote vs on-site decision

Be precise, actionable, and safety-conscious.
```

**User Prompt:**
```javascript
{
  "prompt": `
Service Ticket Analysis:

Ticket ID: {{ ticket_id }}
Machine: {{ model_name }}
Error Code: {{ error_code }}
Issue Type: {{ issue_type }}
Urgency: {{ urgency }}

Description: {{ description }}

{{ #if telemetry }}
Telemetry Data:
{{ JSON.stringify(telemetry, null, 2) }}
{{ /if }}

Knowledge Base Results:
{{ JSON.stringify(rag_results, null, 2) }}

Please provide diagnosis and resolution steps.
`
}
```

**Expected Response:**
```
## Diagnosis - Ticket TICKET_1729958400000

### Root Cause
Error E401 indicates film carriage motor overload, most likely caused by:
1. **Primary:** Excessive friction on carriage rails (80% probability)
2. **Secondary:** Motor temperature sensor malfunction (15% probability)
3. **Tertiary:** Motor failure (5% probability)

### Troubleshooting Steps

**Step 1: Visual Inspection (5 min)**
- Stop machine and lock out
- Inspect film carriage rails for debris or damage
- Check for visible wear on bearings

**Step 2: Manual Test (5 min)**
- Manually move carriage along rail
- Should move smoothly with minimal resistance
- If stiff → proceed to Step 3

**Step 3: Cleaning & Lubrication (20 min)**
- Clean rails with lint-free cloth
- Apply specified lubricant (Part #: LUB-001)
- Test manual movement again

**Step 4: Sensor Check (10 min)**
- Check motor temperature sensor connections
- Test sensor resistance (should be 100Ω ±5%)
- Replace if out of spec (Part #: SENS-401)

**Step 5: Reset & Test (5 min)**
- Clear error code via HMI
- Run test cycle
- Monitor motor current and temperature

### Required Parts
- Lubricant (LUB-001) - Always in stock
- Temperature Sensor (SENS-401) - If sensor test fails

### Resolution
- **Remote Resolution:** Possible if customer can perform steps
- **On-site Required:** If parts replacement needed or issue persists
- **Estimated Time:** 45-60 minutes

### Safety Notes
- ⚠️ Lock out machine before inspection
- ⚠️ Wear protective gloves when handling lubricants
```

---

### Node 6: Check Parts Availability

**Type:** Code (JavaScript) + External API Call

```javascript
/**
 * SPARE PARTS CHECK
 * Prüft Verfügbarkeit benötigter Ersatzteile
 */

const diagnosis = $input.item.json.ai_diagnosis;

// Extract part numbers from diagnosis
function extractPartNumbers(diagnosisText) {
  const pattern = /Part #?:?\s*([A-Z0-9-]+)/gi;
  const matches = diagnosisText.matchAll(pattern);
  return [...matches].map(m => m[1]);
}

const requiredParts = extractPartNumbers(diagnosis);

// NOTE: In real implementation, this would call inventory API
// For template, we simulate response

const partsAvailability = requiredParts.map(partNumber => {
  // Simulate inventory check
  return {
    part_number: partNumber,
    description: getPartDescription(partNumber),
    in_stock: Math.random() > 0.2, // 80% in stock
    stock_location: 'Warehouse Munich',
    quantity_available: Math.floor(Math.random() * 50) + 5,
    unit_price: 50 + Math.random() * 200,
    delivery_time_hours: Math.random() > 0.8 ? 48 : 4 // 20% need 2 days
  };
});

function getPartDescription(partNumber) {
  const descriptions = {
    'LUB-001': 'Rail Lubricant 500ml',
    'SENS-401': 'Motor Temperature Sensor',
    'BELT-101': 'Drive Belt',
    'MOTOR-301': 'Film Carriage Motor'
  };
  return descriptions[partNumber] || 'Spare Part';
}

const allPartsAvailable = partsAvailability.every(p => p.in_stock);
const maxDeliveryTime = Math.max(...partsAvailability.map(p => p.delivery_time_hours));

return {
  json: {
    ...$input.item.json,
    parts_check: {
      required_parts: partsAvailability,
      all_available: allPartsAvailable,
      max_delivery_time_hours: maxDeliveryTime,
      total_parts_cost: partsAvailability.reduce((sum, p) => sum + p.unit_price, 0)
    }
  }
};
```

---

### Node 7: Decision - Remote vs On-site

**Type:** Code (JavaScript)

```javascript
/**
 * SERVICE DELIVERY DECISION
 * Entscheidet ob Remote Support ausreicht oder Techniker vor Ort nötig ist
 */

const serviceRequest = $input.item.json.service_request;
const aiDiagnosis = $input.item.json.ai_diagnosis;
const partsCheck = $input.item.json.parts_check;

// Decision factors
const factors = {
  // Can customer perform steps?
  customer_capability: serviceRequest.urgency === 'critical' ? 0.3 : 0.7,

  // Parts replacement needed?
  parts_needed: partsCheck.required_parts.length > 0 ? 0.4 : 0.9,

  // Complexity of solution
  solution_complexity: aiDiagnosis.includes('Replace motor') ? 0.2 : 0.8,

  // Service contract level
  service_contract: 'premium' // from customer data
};

// Calculate remote resolution probability
const remoteScore = (factors.customer_capability + factors.parts_needed + factors.solution_complexity) / 3;

let serviceDeliveryMethod;
let reasoning;

if (remoteScore >= 0.7 && factors.service_contract !== 'premium') {
  serviceDeliveryMethod = 'remote_guided';
  reasoning = 'Customer can perform troubleshooting with remote guidance';
} else if (partsCheck.required_parts.length > 0) {
  serviceDeliveryMethod = 'parts_shipment_then_remote';
  reasoning = 'Ship parts to customer, then provide remote installation support';
} else {
  serviceDeliveryMethod = 'on_site';
  reasoning = 'On-site technician required for complex repair';
}

// Override for critical issues
if (serviceRequest.urgency === 'critical') {
  serviceDeliveryMethod = 'on_site_urgent';
  reasoning = 'Critical urgency requires immediate on-site response';
}

return {
  json: {
    ...$input.item.json,
    service_delivery: {
      method: serviceDeliveryMethod,
      reasoning: reasoning,
      remote_score: remoteScore
    }
  }
};
```

---

### Node 8: Create Service Ticket Document

**Type:** Google Docs Create

**Template:**
```markdown
# SERVICE TICKET - {{ ticket_id }}

**Status:** {{ status }}
**Priority:** {{ urgency }}
**Created:** {{ received_date }}
**SLA Deadline:** {{ sla_deadline }}

---

## CUSTOMER INFORMATION

**Company:** {{ company_name }}
**Contact:** {{ customer_name }}
**Email:** {{ customer_email }}
**Phone:** {{ customer_phone }}

**Service Contract:** {{ service_contract }}
**Contract Expiry:** {{ contract_expiry }}

---

## MACHINE INFORMATION

**Model:** {{ model_name }}
**Serial Number:** {{ machine_id }}
**Installation Date:** {{ installation_date }}
**Warranty Status:** {{ warranty_expiry > now ? 'Under Warranty' : 'Out of Warranty' }}
**Last Service:** {{ last_service_date }}

---

## ISSUE DESCRIPTION

**Error Code:** {{ error_code }}
**Issue Type:** {{ issue_type }}
**Source:** {{ source }}

{{ description }}

{{ #if telemetry }}
### Telemetry Data
- Motor Temperature: {{ telemetry.motor_temperature }}°C
- Motor Current: {{ telemetry.motor_current }}A
- Cycle Count: {{ telemetry.cycle_count }}
{{ /if }}

---

## AI DIAGNOSIS

{{ ai_diagnosis }}

---

## REQUIRED PARTS

{{ #if parts_check.required_parts.length }}
| Part Number | Description | In Stock | Delivery Time | Price |
|-------------|-------------|----------|---------------|-------|
{{ #each parts_check.required_parts }}
| {{ this.part_number }} | {{ this.description }} | {{ this.in_stock ? 'Yes' : 'No' }} | {{ this.delivery_time_hours }}h | €{{ this.unit_price }} |
{{ /each }}

**Total Parts Cost:** €{{ parts_check.total_parts_cost }}
{{ else }}
No spare parts required for this issue.
{{ /if }}

---

## SERVICE DELIVERY

**Method:** {{ service_delivery.method }}
**Reasoning:** {{ service_delivery.reasoning }}

{{ #if service_delivery.method === 'on_site' }}
**Technician:** {{ assigned_technician }}
**Scheduled Visit:** {{ scheduled_visit_date }}
**Estimated Duration:** {{ estimated_duration_hours }} hours
{{ /if }}

{{ #if service_delivery.method === 'remote_guided' }}
**Support Method:** Video call + step-by-step guide
**Scheduled Call:** {{ scheduled_call_time }}
**Support Agent:** {{ assigned_agent }}
{{ /if }}

---

## RESOLUTION STEPS

{{ troubleshooting_steps }}

---

## STATUS LOG

| Timestamp | Status | Notes |
|-----------|--------|-------|
| {{ received_date }} | Ticket Created | Initial request received |

---

**Generated by AI_SERVICE_AGENT v2025.10.2**
```

---

### Node 9: Write Service Ticket Log

**Type:** Google Sheets Append
**Sheet:** `04_🛠️_Service_Tickets`

```javascript
{
  "ticket_id": "={{ $json.service_request.ticket_id }}",
  "customer_id": "={{ $json.customer_id }}",
  "customer_name": "={{ $json.customer_info.company_name }}",
  "machine_id": "={{ $json.service_request.machine_id || '' }}",
  "model_name": "={{ $json.service_request.model_name || '' }}",
  "error_code": "={{ $json.service_request.error_code || 'N/A' }}",
  "issue_type": "={{ $json.service_request.issue_type }}",
  "urgency": "={{ $json.service_request.urgency }}",
  "source": "={{ $json.service_request.source }}",
  "description": "={{ $json.service_request.description }}",
  "service_delivery_method": "={{ $json.service_delivery.method }}",
  "required_parts": "={{ $json.parts_check.required_parts.map(p => p.part_number).join(', ') }}",
  "parts_cost_eur": "={{ $json.parts_check.total_parts_cost }}",
  "sla_hours": "={{ $json.service_request.sla_hours }}",
  "sla_deadline": "={{ $json.service_request.sla_deadline }}",
  "ticket_document_link": "={{ $json.ticket_doc_link }}",
  "status": "open",
  "created_date": "={{ $json.service_request.received_date }}",
  "assigned_to": "{{ $json.assigned_technician || $json.assigned_agent || 'pending' }}"
}
```

---

### Node 10: Send Response to Customer

**Type:** Send Email (Gmail)

**To:** `{{ $json.service_request.customer_email }}`
**Subject:** Service Ticket {{ ticket_id }} - {{ model_name }}

**Body:**
```
Dear {{ customer_name }},

Thank you for contacting {{ brand }} Support.

We have received your service request and created ticket {{ ticket_id }}.

**Issue Summary:**
- Machine: {{ model_name }}
- Error Code: {{ error_code }}
- Priority: {{ urgency }}

**Our Analysis:**
{{ ai_diagnosis_summary }}

**Next Steps:**
{{ #if service_delivery.method === 'remote_guided' }}
We can resolve this issue remotely. Our support team will contact you within {{ sla_hours }} hours to guide you through the resolution steps.

Estimated resolution time: 45-60 minutes
{{ /if }}

{{ #if service_delivery.method === 'on_site' }}
A service technician will visit your site to resolve this issue.

Scheduled Visit: {{ scheduled_visit_date }}
Technician: {{ assigned_technician }}
{{ /if }}

{{ #if parts_check.required_parts.length }}
**Required Spare Parts:**
{{ #each parts_check.required_parts }}
- {{ this.description }} ({{ this.part_number }}): €{{ this.unit_price }}
{{ /each }}

Parts will be {{ #if warranty_active }}shipped at no cost (under warranty){{ else }}shipped with invoice{{ /if }}.
{{ /if }}

**SLA Commitment:**
We will resolve your issue by: {{ sla_deadline }}

You can track your ticket status at: {{ ticket_tracking_link }}

If you have any questions, please reply to this email or call our hotline: +49 123 SERVICE

Best regards,
{{ brand }} Service Team

---
Ticket ID: {{ ticket_id }}
Reference: {{ master_execution_id }}
```

---

### Node 11: Schedule Follow-up

**Type:** Google Sheets Append
**Sheet:** `10_✅_Tasks_Workflow`

```javascript
{
  "task_id": "TASK_{{ $json.service_request.ticket_id }}_FOLLOWUP",
  "related_id": "={{ $json.service_request.ticket_id }}",
  "task_type": "service_follow_up",
  "task_description": "Follow up on service ticket - ensure resolution",
  "due_date": "={{ $json.service_request.sla_deadline }}",
  "priority": "={{ $json.service_request.urgency }}",
  "assigned_to": "service_team",
  "status": "pending",
  "created_date": "={{ $now.toISO() }}"
}
```

---

### Node 12: Log Support Call (if applicable)

**Type:** Google Sheets Append
**Sheet:** `05_📞_Support_Calls_Log`

```javascript
{
  "call_id": "CALL_{{ Date.now() }}",
  "ticket_id": "={{ $json.service_request.ticket_id }}",
  "customer_name": "={{ $json.customer_info.company_name }}",
  "caller_name": "={{ $json.service_request.customer_name }}",
  "caller_phone": "={{ $json.service_request.customer_phone }}",
  "call_type": "inbound_support",
  "issue_type": "={{ $json.service_request.issue_type }}",
  "urgency": "={{ $json.service_request.urgency }}",
  "duration_seconds": "={{ $json.service_request.call_duration || 0 }}",
  "resolution_method": "={{ $json.service_delivery.method }}",
  "call_date": "={{ $now.toISO() }}",
  "notes": "Service ticket created automatically"
}
```

---

## 📊 Verwendungsbeispiele

### Beispiel 1: Critical IoT Alert - On-site Service

**Input (IoT):**
```json
{
  "source": "iot",
  "data": {
    "machine_id": "RBP_002_SN123456",
    "error_code": "E401",
    "severity": "critical",
    "telemetry": {
      "motor_temperature": 85,
      "motor_current": 12.5
    }
  }
}
```

**Outcome:**
- Priority: Critical (4h SLA)
- Service Method: On-site urgent
- Parts: Temperature Sensor ordered
- Technician dispatched within 2 hours

---

### Beispiel 2: Email Request - Remote Resolution

**Input (Email):**
```json
{
  "source": "email",
  "data": {
    "subject": "Need help with film loading",
    "body": "Can you guide us through the film loading process?"
  }
}
```

**Outcome:**
- Priority: Low
- Service Method: Remote guided (video call)
- No parts needed
- Scheduled call within 24 hours

---

### Beispiel 3: Preventive Maintenance

**Input (Scheduled):**
```json
{
  "source": "scheduled",
  "maintenance_type": "preventive",
  "due_date": "2025-10-30"
}
```

**Outcome:**
- Priority: Medium
- Service Method: On-site planned
- Parts: Maintenance kit (filters, lubricants)
- Visit scheduled with customer

---

## ✅ Deployment Checklist

- [ ] Workflow importiert
- [ ] OpenAI Service KB Vector Store erstellt
- [ ] IoT Integration konfiguriert (MQTT/API)
- [ ] Email Integration (Gmail/Support Inbox)
- [ ] Spare Parts Inventory API connected
- [ ] Technician Scheduling System integrated
- [ ] SLA Rules konfiguriert
- [ ] Test Tickets für alle Urgency Levels
- [ ] Knowledge Base mit Service Manuals befüllt

---

## 📈 Success Metrics

- **First Response Time:** <30 min (critical), <4h (high)
- **Remote Resolution Rate:** Target >60%
- **SLA Compliance:** >95%
- **Customer Satisfaction:** CSAT >4.5/5
- **Mean Time To Resolution:** <48h
- **Parts Availability:** >90%

---

**Version:** 2025.10.2
**Status:** ✅ Production Ready
