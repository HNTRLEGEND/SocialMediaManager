# Quick Fix Guide - Update Sheet References in Existing Workflows

## Problem
Your existing n8n workflows (Lead Agent, Technical Agent, Sales Agent) likely reference incorrect sheet names that don't match the actual tabs in your Robopac_Database Google Sheet.

## Solution
Update all sheet references to use the correct names.

---

## ✅ Correct Sheet Names (Robopac_Database)

```javascript
const CORRECT_SHEETS = {
  inquiries: '01_📋Inquiries_Log',           // NOT '01_📞_Leads'
  quotations: '02💰Quotation_Options',        // NOT '02_🎯_Opportunities'
  customer_profile: '03🔍Customer_Profile',   // NEW
  reports: '04📑Reports',                     // NOT '03_📑_Reports'
  service_log: '05📑Service_Log',             // NEW
  product_portfolio: '06📦Product_Portfolio', // NOT '04_📦_Product_Portfolio'
  mechanical_specs: '07⚙️Mechanical_Specs',   // NOT '05_⚙️_Mechanical_Specs'
  electrical_specs: '08🔌Electrical_Specs',   // NOT '06_🔌_Electrical_Specs'
  packaging_specs: '09🎞️Packaging_Process_Specs', // NOT '07_🎞️_Packaging_Process_Specs'
  marketing_log: '10📑Marketing_Activity_Log', // NEW
  chart_data: '12_📈Chart_Data',              // NEW
  master_log: '13📑Master_Log',               // NOT '13_🧩_Master_Log'
  performance_log: '14🔍Performance_Log',     // NEW
  health_log: '15🔍System_Health_Log',        // NOT '15_🩺_System_Health_Log'
  evaluation_log: '16_Evaluation_Log',        // NOT '16_🤖_Evaluation_Log'
  client_config: '17🔍Client_Config',         // NEW
  lead_intelligence: '19🔍_Lead_Intelligence_Log' // NOT '19_🔍_Lead_Intelligence_Log'
};
```

---

## 🔧 How to Update Your Workflows

### Option 1: Manual Update in n8n (Quick)

#### Step 1: Open Each Workflow
1. Go to n8n
2. Open "AI_LEAD_AGENT_NEW" workflow

#### Step 2: Find Google Sheets Nodes
Look for nodes with these types:
- "Google Sheets" (Read)
- "Google Sheets" (Append)
- "Google Sheets" (Update)

#### Step 3: Update Sheet Names
For each Google Sheets node:

**Before:**
```
Sheet Name: 01_📞_Leads
Range: A2:M100
```

**After:**
```
Sheet Name: 01_📋Inquiries_Log
Range: A2:M100
```

#### Step 4: Update All References
Replace these across all workflows:

| Old Name | New Name | Agent |
|----------|----------|-------|
| `01_📞_Leads` | `01_📋Inquiries_Log` | Lead, Technical, Sales |
| `02_🎯_Opportunities` | `02💰Quotation_Options` | Sales |
| `03_📑_Reports` | `04📑Reports` | Sales |
| `04_📦_Product_Portfolio` | `06📦Product_Portfolio` | Technical |
| `05_⚙️_Mechanical_Specs` | `07⚙️Mechanical_Specs` | Technical |
| `06_🔌_Electrical_Specs` | `08🔌Electrical_Specs` | Technical |
| `07_🎞️_Packaging_Process_Specs` | `09🎞️Packaging_Process_Specs` | Technical |
| `13_🧩_Master_Log` | `13📑Master_Log` | All agents |
| `15_🩺_System_Health_Log` | `15🔍System_Health_Log` | All agents |
| `16_🤖_Evaluation_Log` | `16_Evaluation_Log` | Technical |

#### Step 5: Save and Test
1. Save the workflow
2. Test with a sample lead
3. Verify data is written to correct sheets

### Option 2: Use Sheet Mapping Helper (Recommended)

#### Step 1: Add Helper Code to n8n
Create a new "Code" node at the start of each workflow:

```javascript
// Node: "Load Sheet Mappings"
// Place this early in each workflow

const SHEET_MAPPINGS = {
  inquiries: '01_📋Inquiries_Log',
  quotations: '02💰Quotation_Options',
  customer_profile: '03🔍Customer_Profile',
  reports: '04📑Reports',
  service_log: '05📑Service_Log',
  product_portfolio: '06📦Product_Portfolio',
  mechanical_specs: '07⚙️Mechanical_Specs',
  electrical_specs: '08🔌Electrical_Specs',
  packaging_specs: '09🎞️Packaging_Process_Specs',
  marketing_log: '10📑Marketing_Activity_Log',
  chart_data: '12_📈Chart_Data',
  master_log: '13📑Master_Log',
  performance_log: '14🔍Performance_Log',
  health_log: '15🔍System_Health_Log',
  evaluation_log: '16_Evaluation_Log',
  client_config: '17🔍Client_Config',
  lead_intelligence: '19🔍_Lead_Intelligence_Log'
};

// Make available to all subsequent nodes
return {
  json: {
    ...$json,
    sheet_mappings: SHEET_MAPPINGS
  }
};
```

#### Step 2: Update Google Sheets Nodes
In each Google Sheets node, use the mapping:

**Before:**
```
Sheet Name: 01_📞_Leads
```

**After:**
```
Sheet Name: {{ $node["Load Sheet Mappings"].json["sheet_mappings"]["inquiries"] }}
```

---

## 📋 Agent-Specific Updates

### Lead Agent Workflow

**Sheets Used:**
- `inquiries` - Write new inquiries
- `customer_profile` - Enrich company data
- `master_log` - Log actions
- `lead_intelligence` - Store enrichment data
- `client_config` - Load configuration

**Critical Nodes to Update:**
1. "Write Inquiry to Sheet" → Use `inquiries`
2. "Update Customer Profile" → Use `customer_profile`
3. "Log to Master" → Use `master_log`
4. "Save Intelligence" → Use `lead_intelligence`

### Technical Agent Workflow

**Sheets Used:**
- `inquiries` - Read inquiry details
- `product_portfolio` - Match products
- `mechanical_specs` - Validate mechanical requirements
- `electrical_specs` - Validate electrical requirements
- `packaging_specs` - Check packaging compatibility
- `evaluation_log` - Write technical evaluation
- `master_log` - Log actions

**Critical Nodes to Update:**
1. "Read Inquiry" → Use `inquiries`
2. "Load Products" → Use `product_portfolio`
3. "Check Mechanical" → Use `mechanical_specs`
4. "Check Electrical" → Use `electrical_specs`
5. "Check Packaging" → Use `packaging_specs`
6. "Write Evaluation" → Use `evaluation_log`
7. "Log to Master" → Use `master_log`

### Sales Agent Workflow

**Sheets Used:**
- `inquiries` - Read inquiry details
- `quotations` - Write quotation options
- `customer_profile` - Get customer info
- `reports` - Generate reports
- `master_log` - Log actions

**Critical Nodes to Update:**
1. "Read Inquiry" → Use `inquiries`
2. "Create Quotation" → Use `quotations`
3. "Get Customer Info" → Use `customer_profile`
4. "Generate Report" → Use `reports`
5. "Log to Master" → Use `master_log`

---

## 🧪 Testing Checklist

After updating sheet references, test each workflow:

### Lead Agent Test
```bash
POST /webhook/lead-agent
{
  "company_name": "Test Company",
  "contact_name": "John Doe",
  "email": "john@test.com",
  "product_interest": "pallet_wrapper"
}
```

**Verify:**
- [ ] New row appears in `01_📋Inquiries_Log`
- [ ] Company data in `03🔍Customer_Profile`
- [ ] Entry in `13📑Master_Log`
- [ ] Intelligence data in `19🔍_Lead_Intelligence_Log`

### Technical Agent Test
```bash
POST /webhook/technical-agent
{
  "inquiry_id": "TEST_001",
  "product_type": "pallet_wrapper"
}
```

**Verify:**
- [ ] Product data read from `06📦Product_Portfolio`
- [ ] Specs read from `07⚙️Mechanical_Specs`, `08🔌Electrical_Specs`, `09🎞️Packaging_Process_Specs`
- [ ] Evaluation written to `16_Evaluation_Log`
- [ ] Entry in `13📑Master_Log`

### Sales Agent Test
```bash
POST /webhook/sales-agent
{
  "inquiry_id": "TEST_001",
  "recommended_products": ["Helix Standard"]
}
```

**Verify:**
- [ ] Quotation written to `02💰Quotation_Options`
- [ ] Report generated in `04📑Reports`
- [ ] Entry in `13📑Master_Log`

---

## 🚨 Common Errors After Update

### Error 1: "Sheet not found"
**Cause:** Typo in sheet name
**Fix:** Double-check exact sheet name including emojis

```javascript
// WRONG
'01_📋_Inquiries_Log'  // Extra underscore after emoji

// RIGHT
'01_📋Inquiries_Log'   // No underscore after emoji
```

### Error 2: "Range not found"
**Cause:** Sheet is empty or range is invalid
**Fix:** Ensure sheet has header row

```javascript
// For reading: Start from row 2 (after headers)
Range: '01_📋Inquiries_Log'!A2:M100

// For appending: Use entire column range
Range: '01_📋Inquiries_Log'!A:M
```

### Error 3: "Permission denied"
**Cause:** Service account doesn't have access
**Fix:** Share Google Sheet with service account email

---

## 💾 Backup Before Changes

**IMPORTANT:** Before making any changes:

1. **Export Workflows**
   - In n8n, click each workflow
   - Click "..." menu
   - Select "Download"
   - Save as `AI_LEAD_AGENT_BACKUP_[DATE].json`

2. **Export Google Sheet**
   - File → Download → Microsoft Excel (.xlsx)
   - Save as `Robopac_Database_BACKUP_[DATE].xlsx`

3. **Document Current State**
   - Take screenshots of working workflows
   - Note current sheet names
   - Record any custom configurations

---

## 📞 If Something Breaks

### Quick Rollback
1. Stop the workflow
2. Re-import backup JSON
3. Restore from sheet backup
4. Contact support

### Debug Process
1. Check n8n execution log
2. Verify sheet name exactly matches (including emojis)
3. Confirm service account has access
4. Test with simple read operation first
5. Gradually add complexity

---

## ✅ Verification Commands

After updating, run these checks:

### Check 1: Sheet Names in Google Sheets
```
Open Robopac_Database
Verify exact tab names:
✓ 01_📋Inquiries_Log
✓ 02💰Quotation_Options
✓ 03🔍Customer_Profile
✓ 04📑Reports
✓ 05📑Service_Log
✓ 06📦Product_Portfolio
✓ 07⚙️Mechanical_Specs
✓ 08🔌Electrical_Specs
✓ 09🎞️Packaging_Process_Specs
✓ 10📑Marketing_Activity_Log
✓ 12_📈Chart_Data
✓ 13📑Master_Log
✓ 14🔍Performance_Log
✓ 15🔍System_Health_Log
✓ 16_Evaluation_Log
✓ 17🔍Client_Config
✓ 19🔍_Lead_Intelligence_Log
```

### Check 2: n8n Workflow References
Search in each workflow for old sheet names:
```
Search for: "01_📞_Leads"
Replace with: "01_📋Inquiries_Log"

Search for: "02_🎯_Opportunities"
Replace with: "02💰Quotation_Options"

Search for: "13_🧩_Master_Log"
Replace with: "13📑Master_Log"

...etc for all sheets
```

### Check 3: Test End-to-End
```
1. Submit test lead → Verify appears in correct sheet
2. Trigger technical analysis → Verify reads from correct sheets
3. Generate quotation → Verify writes to correct sheet
4. Check all logs → Verify in correct log sheets
```

---

## 🎯 Summary

**What to Do:**
1. ✅ Backup everything
2. ✅ Update sheet names in all workflows
3. ✅ Test each agent individually
4. ✅ Test end-to-end flow
5. ✅ Monitor for errors

**What NOT to Do:**
- ❌ Change sheet names in Google Sheets
- ❌ Delete any existing data
- ❌ Skip testing
- ❌ Update production without testing in staging

**Time Required:**
- Manual update: ~2 hours
- With sheet mapper: ~30 minutes
- Testing: ~1 hour

**When Done:**
✅ All workflows use correct sheet names
✅ Data flows to correct locations
✅ No errors in execution logs
✅ All agents communicate properly

---

**Ready to start? Begin with Lead Agent, test thoroughly, then move to Technical and Sales Agents.** 🚀
