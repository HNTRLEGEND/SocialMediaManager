# AI_WIESLOGIC_MASTER - Master Controller Workflow

## Workflow Overview

The Master Controller is the central orchestration system for all WiesLogic agents. It handles:
- Customer routing
- Agent activation/deactivation
- Fallback routing when agents are disabled
- Health monitoring
- Error handling and recovery

## Workflow Structure

### Node Flow

```
[Webhook Trigger] → [Validate Customer] → [Load Configuration] → [Route to Agent] → [Monitor Execution] → [Handle Response]
                                ↓
                         [Error Handler]
                                ↓
                         [Log to Health]
```

## Detailed Node Configuration

### 1. Webhook Trigger (`00_webhook_master`)

**Type:** Webhook
**Path:** `/wieslogic/master`
**Method:** POST
**Authentication:** Header Auth (Bearer Token)

**Expected Payload:**
```json
{
  "customer_id": "ROBOPAC_AETNA_001",
  "action": "trigger_lead_agent",
  "data": {
    // Action-specific data
  }
}
```

### 2. Validate Customer (`05_validate_customer`)

**Type:** Code Node (JavaScript)
**Purpose:** Validate customer exists and is active

```javascript
// Get input data
const customerId = $input.item.json.customer_id;

// Validate customer ID format
if (!customerId || customerId.length < 5) {
  throw new Error('Invalid customer ID format');
}

// Return validated customer ID
return {
  json: {
    customer_id: customerId,
    action: $input.item.json.action,
    data: $input.item.json.data,
    timestamp: new Date().toISOString()
  }
};
```

### 3. Load Customer Configuration (`10_load_config`)

**Type:** HTTP Request
**Purpose:** Fetch customer configuration from WIES.AI backend

**Configuration:**
- Method: GET
- URL: `https://api.wies.ai/wieslogic/config/{{ $json.customer_id }}`
- Authentication: Bearer Token
- Headers:
  - `Authorization: Bearer {{ $env.WIESAI_API_KEY }}`

**Response Mapping:**
```javascript
const config = $input.item.json;

return {
  json: {
    customer_id: config.customerId,
    sheet_id: config.googleSheetId,
    active_agents: {
      lead: config.leadAgentEnabled,
      technical: config.techAgentEnabled,
      sales: config.salesAgentEnabled,
      service: config.serviceAgentEnabled
    },
    webhook_token: config.webhookToken,
    business_rules: {
      min_budget: config.minBudgetEur,
      min_bant_score: config.minBantScore,
      auto_qualify: config.autoQualifyScore
    }
  }
};
```

### 4. Load Sheet Mappings (`15_load_sheets`)

**Type:** HTTP Request
**Purpose:** Get sheet name mappings for customer

**Configuration:**
- Method: GET
- URL: `https://api.wies.ai/wieslogic/config/{{ $json.customer_id }}/sheet-mappings`

**Alternative (Code Node):**
```javascript
// If using embedded sheet mapper
const { SheetMapper } = require('./sheet-mapping-helper.js');

const mapper = new SheetMapper($json.customer_id);
const sheets = mapper.getAllSheets();

return {
  json: {
    ...$json,
    sheet_mappings: sheets
  }
};
```

### 5. Route to Appropriate Agent (`20_route_agent`)

**Type:** Switch Node
**Property:** `{{ $json.action }}`

**Routes:**
1. **trigger_lead_agent** → Lead Agent Workflow
2. **trigger_technical_agent** → Technical Agent Workflow
3. **trigger_sales_agent** → Sales Agent Workflow
4. **trigger_service_agent** → Service Agent Workflow
5. **health_check** → Health Check Node
6. **default** → Error (Unknown Action)

### 6A. Trigger Lead Agent (`25_trigger_lead`)

**Type:** Webhook (Call Workflow)
**URL:** `https://n8n.wies.ai/webhook/lead-agent`

**Payload:**
```javascript
{
  "customer_id": "{{ $json.customer_id }}",
  "sheet_id": "{{ $json.sheet_id }}",
  "sheet_mappings": {{ JSON.stringify($json.sheet_mappings) }},
  "config": {{ JSON.stringify($json.business_rules) }},
  "data": {{ JSON.stringify($json.data) }},
  "handover": {
    "source": "master_controller",
    "timestamp": "{{ new Date().toISOString() }}",
    "version": "2025.10.2"
  }
}
```

**Headers:**
```javascript
{
  "Authorization": "Bearer {{ $json.webhook_token }}",
  "Content-Type": "application/json",
  "X-Customer-ID": "{{ $json.customer_id }}"
}
```

### 6B. Check Agent Activation (`30_check_activation`)

**Type:** IF Node
**Condition:** Check if requested agent is enabled

```javascript
const action = $json.action;
const activeAgents = $json.active_agents;

let isEnabled = false;

switch(action) {
  case 'trigger_lead_agent':
    isEnabled = activeAgents.lead;
    break;
  case 'trigger_technical_agent':
    isEnabled = activeAgents.technical;
    break;
  case 'trigger_sales_agent':
    isEnabled = activeAgents.sales;
    break;
  case 'trigger_service_agent':
    isEnabled = activeAgents.service;
    break;
}

return {
  json: {
    ...$json,
    agent_enabled: isEnabled
  }
};
```

**Output:**
- **TRUE** → Proceed to trigger agent
- **FALSE** → Route to fallback handler

### 7. Fallback Handler (`35_fallback_routing`)

**Type:** Code Node
**Purpose:** Determine alternative routing when agent is disabled

```javascript
const action = $json.action;
const activeAgents = $json.active_agents;
const customerId = $json.customer_id;

// Define fallback logic
const fallbacks = {
  'trigger_technical_agent': {
    enabled: activeAgents.sales,
    fallback_action: 'trigger_sales_agent',
    note: 'Technical agent disabled, routing directly to sales'
  },
  'trigger_sales_agent': {
    enabled: false,
    fallback_action: 'manual_review',
    note: 'Sales agent disabled, requires manual review'
  }
};

const fallback = fallbacks[action];

if (!fallback || !fallback.enabled) {
  // No fallback available
  return {
    json: {
      status: 'manual_review_required',
      customer_id: customerId,
      original_action: action,
      reason: 'Agent disabled and no fallback available',
      notify_admin: true
    }
  };
}

return {
  json: {
    ...$json,
    action: fallback.fallback_action,
    fallback_note: fallback.note,
    original_action: action
  }
};
```

### 8. Monitor Agent Execution (`40_monitor_execution`)

**Type:** Code Node
**Purpose:** Track execution time and status

```javascript
const startTime = new Date($json.handover.timestamp);
const endTime = new Date();
const duration = endTime - startTime;

return {
  json: {
    ...$json.response,
    execution_metrics: {
      agent: $json.action.replace('trigger_', ''),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_ms: duration,
      customer_id: $json.customer_id
    }
  }
};
```

### 9. Log to Master Log (`45_log_execution`)

**Type:** Google Sheets Append
**Sheet ID:** `{{ $json.sheet_id }}`
**Range:** `{{ $json.sheet_mappings.master_log }}`

**Data:**
```javascript
[
  new Date().toISOString(),                    // Timestamp
  $json.execution_metrics.customer_id,         // Customer ID
  $json.execution_metrics.agent,               // Agent Name
  'execution',                                  // Action
  $json.inquiry_id || '',                      // Inquiry ID
  'success',                                    // Status
  $json.execution_metrics.duration_ms,         // Duration
  JSON.stringify($json.fallback_note || '')    // Notes
]
```

### 10. Error Handler (`50_error_handler`)

**Type:** Error Trigger
**Attached to:** All nodes

**Error Processing:**
```javascript
const error = $input.item.json.error;
const context = $input.item.json;

return {
  json: {
    error_type: error.name || 'UNKNOWN_ERROR',
    error_message: error.message,
    error_stack: error.stack,
    customer_id: context.customer_id,
    action: context.action,
    timestamp: new Date().toISOString(),
    severity: this.determineSeverity(error),
    recovery_action: this.determineRecoveryAction(error)
  }
};

// Helper functions
function determineSeverity(error) {
  if (error.message.includes('timeout')) return 'HIGH';
  if (error.message.includes('authentication')) return 'CRITICAL';
  if (error.message.includes('not found')) return 'MEDIUM';
  return 'LOW';
}

function determineRecoveryAction(error) {
  if (error.message.includes('timeout')) return 'RETRY';
  if (error.message.includes('rate limit')) return 'THROTTLE';
  if (error.message.includes('authentication')) return 'NOTIFY_ADMIN';
  return 'LOG_AND_CONTINUE';
}
```

### 11. Log Error to Health Log (`55_log_error`)

**Type:** Google Sheets Append
**Sheet ID:** From customer config
**Range:** Health Log sheet

**Data:**
```javascript
[
  new Date().toISOString(),
  $json.customer_id,
  'master_controller',
  $json.error_type,
  $json.severity,
  $json.error_message,
  $json.recovery_action,
  JSON.stringify({
    action: $json.action,
    stack: $json.error_stack
  })
]
```

### 12. Health Check Node (`60_health_check`)

**Type:** HTTP Request (Multiple)
**Purpose:** Check status of all agents

**For each agent:**
```javascript
// Lead Agent Health Check
GET https://n8n.wies.ai/webhook/lead-agent/health

// Technical Agent Health Check
GET https://n8n.wies.ai/webhook/technical-agent/health

// Sales Agent Health Check
GET https://n8n.wies.ai/webhook/sales-agent/health
```

**Aggregate Results:**
```javascript
const results = $input.all();

const healthStatus = {
  timestamp: new Date().toISOString(),
  overall_status: 'GREEN',
  agents: {}
};

results.forEach(result => {
  const agent = result.json.agent_name;
  const status = result.json.status;

  healthStatus.agents[agent] = {
    status: status,
    response_time: result.json.response_time_ms,
    last_error: result.json.last_error || null
  };

  // Update overall status
  if (status === 'RED' || status === 'CRITICAL') {
    healthStatus.overall_status = 'RED';
  } else if (status === 'YELLOW' && healthStatus.overall_status !== 'RED') {
    healthStatus.overall_status = 'YELLOW';
  }
});

return { json: healthStatus };
```

## Environment Variables Required

```env
# WIES.AI Backend
WIESAI_API_KEY=your_backend_api_key
WIESAI_API_URL=https://api.wies.ai

# n8n Workflow URLs
N8N_LEAD_AGENT_URL=https://n8n.wies.ai/webhook/lead-agent
N8N_TECHNICAL_AGENT_URL=https://n8n.wies.ai/webhook/technical-agent
N8N_SALES_AGENT_URL=https://n8n.wies.ai/webhook/sales-agent
N8N_SERVICE_AGENT_URL=https://n8n.wies.ai/webhook/service-agent

# Monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
EMAIL_NOTIFICATION_ADDRESS=admin@wies.ai

# Security
MASTER_WEBHOOK_SECRET=your_master_webhook_secret
```

## Testing the Master Controller

### Test 1: Basic Lead Agent Trigger

```bash
curl -X POST https://n8n.wies.ai/webhook/wieslogic/master \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "ROBOPAC_AETNA_001",
    "action": "trigger_lead_agent",
    "data": {
      "company_name": "Test Company",
      "contact_name": "John Doe",
      "email": "john@test.com",
      "product_interest": "pallet_wrapper"
    }
  }'
```

### Test 2: Fallback Routing (Technical Agent Disabled)

```bash
curl -X POST https://n8n.wies.ai/webhook/wieslogic/master \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUSTOMER_WITH_TECH_DISABLED",
    "action": "trigger_technical_agent",
    "data": {
      "inquiry_id": "INQ_123456"
    }
  }'
```

### Test 3: Health Check

```bash
curl -X POST https://n8n.wies.ai/webhook/wieslogic/master \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "ROBOPAC_AETNA_001",
    "action": "health_check"
  }'
```

## Deployment Checklist

- [ ] Import workflow to n8n
- [ ] Configure all environment variables
- [ ] Set up webhook authentication
- [ ] Test customer validation
- [ ] Test agent routing
- [ ] Test fallback logic
- [ ] Verify error handling
- [ ] Set up monitoring alerts
- [ ] Configure health checks
- [ ] Test end-to-end flow
- [ ] Document customer-specific configurations

## Maintenance

### Daily
- Review health check logs
- Monitor error rates
- Check agent response times

### Weekly
- Review fallback routing patterns
- Analyze customer usage
- Update configurations as needed

### Monthly
- Performance optimization
- Security audit
- Configuration backup
