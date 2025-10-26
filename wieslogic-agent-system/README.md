# WiesLogic Agent System - Multi-Customer Architecture

Version: 2025.10.2
Last Updated: October 26, 2025

## 📁 Directory Structure

```
wieslogic-agent-system/
├── README.md                          # This file
├── config/                            # Configuration files
│   ├── master-controller-config.json  # Master controller configuration
│   ├── sheet-mapping-helper.js        # Sheet name mapping utilities
│   └── backend-integration.md         # NestJS integration guide
├── calculations/                      # Product calculation modules
│   └── product-calculators.js         # All 10 Robopac product calculators
├── templates/                         # Customer deployment templates
│   └── customer-template.json         # New customer configuration template
├── workflows/                         # n8n workflow templates
│   └── MASTER_CONTROLLER_TEMPLATE.md  # Master controller workflow guide
└── docs/                              # Documentation
    ├── COMPREHENSIVE_RECOMMENDATIONS.md  # Complete system overview
    └── QUICK_FIX_GUIDE.md             # Quick sheet reference update guide
```

## 🎯 What This System Does

The WiesLogic Agent System is a multi-customer AI sales automation platform that:

✅ **Automates Lead Qualification** - BANT scoring and company enrichment
✅ **Performs Technical Analysis** - Product matching and feasibility assessment
✅ **Generates Quotations** - Automated pricing and proposal creation
✅ **Supports Multiple Customers** - Template-based multi-tenant deployment
✅ **Handles Partial Purchases** - Flexible agent activation with fallback routing
✅ **Calculates Product Requirements** - 10 different Robopac machine types

## 🚀 Quick Start

### 1. **Review the System** (15 minutes)
Read: `docs/COMPREHENSIVE_RECOMMENDATIONS.md`

This document contains:
- Complete architecture overview
- Implementation roadmap
- Success metrics
- Next steps

### 2. **Fix Existing Workflows** (30 minutes)
Read: `docs/QUICK_FIX_GUIDE.md`

Update your current n8n workflows to use correct Google Sheets names:
- Lead Agent sheet references
- Technical Agent sheet references
- Sales Agent sheet references

### 3. **Deploy Master Controller** (2 hours)
Read: `workflows/MASTER_CONTROLLER_TEMPLATE.md`

Create the central orchestration system:
- Customer routing
- Agent activation control
- Fallback handling
- Health monitoring

### 4. **Integrate Backend** (4 hours)
Read: `config/backend-integration.md`

Add multi-customer management to WIES.AI backend:
- Database schema
- API endpoints
- Configuration management
- Webhook handling

### 5. **Add Product Calculators** (2 hours)
Use: `calculations/product-calculators.js`

Integrate calculation modules into Technical Agent:
- Pallet wrappers
- Palletizers/Depalletizers
- LGVs, Case Packers, Shrink Wrappers
- Cobots and more

## 📚 Key Documents

### For Developers
- **Backend Integration Guide** - `config/backend-integration.md`
- **Sheet Mapping Helper** - `config/sheet-mapping-helper.js`
- **Product Calculators** - `calculations/product-calculators.js`

### For n8n Workflows
- **Master Controller Template** - `workflows/MASTER_CONTROLLER_TEMPLATE.md`
- **Sheet Mapping Config** - `config/sheet-mapping-helper.js`
- **Quick Fix Guide** - `docs/QUICK_FIX_GUIDE.md`

### For Project Management
- **Comprehensive Recommendations** - `docs/COMPREHENSIVE_RECOMMENDATIONS.md`
- **Customer Template** - `templates/customer-template.json`
- **Master Controller Config** - `config/master-controller-config.json`

## 🔧 Configuration Files

### 1. Master Controller Configuration
**File:** `config/master-controller-config.json`

Central configuration for:
- Customer registry
- Agent activation rules
- Sheet mappings
- Routing logic
- Calculation modules
- Health monitoring

### 2. Customer Template
**File:** `templates/customer-template.json`

Template for deploying to new customers:
- Basic customer info
- Google Sheets integration
- Agent activation settings
- Product catalog
- Branding
- Business rules

### 3. Sheet Mapping Helper
**File:** `config/sheet-mapping-helper.js`

JavaScript utilities for:
- Centralized sheet name management
- Customer-specific sheet mappings
- Dynamic range building
- Column mapping

## 🧮 Product Calculators

**File:** `calculations/product-calculators.js`

Calculation modules for 10 Robopac machine types:

1. **Pallet Wrappers** - Speed-based (pallets/hour, film usage)
2. **Palletizers** - Formation-based (products/min, patterns)
3. **Depalletizers** - Reverse formation calculations
4. **LGVs** - Throughput-based (trips/hour, routes)
5. **Case Packers** - Speed and configuration
6. **Shrink Wrappers** - Tunnel speed and pack size
7. **Tray Shrink Wrappers** - Specialized tray handling
8. **Bag Sealers** - Cycle time and seal quality
9. **Case Packing Machines** - Advanced formations
10. **Cobots** - Pick-and-place cycles

### Usage Example

```javascript
const { CalculatorFactory } = require('./calculations/product-calculators.js');

// Get calculator for pallet wrapper
const calculator = CalculatorFactory.getCalculator('pallet_wrapper');

// Calculate requirements
const result = calculator.calculate({
  required_pallets_per_hour: 60,
  pallet_height: 1800,
  pallet_weight: 900
});

console.log(result.recommended_model); // "Helix Standard"
console.log(result.meets_requirement); // true
```

## 🗺️ Implementation Roadmap

### Week 1-2: Foundation
- [ ] Backend setup (Prisma schema, NestJS modules)
- [ ] Master controller deployment
- [ ] Testing infrastructure

### Week 3-4: Robopac Deployment
- [ ] Update existing workflows
- [ ] Configure Robopac customer
- [ ] Integration testing

### Week 5-6: Multi-Customer Template
- [ ] Finalize template system
- [ ] Admin UI for configuration
- [ ] Documentation

### Week 7-8: Optimization
- [ ] Performance improvements
- [ ] Enhanced error recovery
- [ ] Analytics dashboard

## 🔒 Correct Google Sheets Names

**Robopac_Database sheets:**

```
✅ 01_📋Inquiries_Log
✅ 02💰Quotation_Options
✅ 03🔍Customer_Profile
✅ 04📑Reports
✅ 05📑Service_Log
✅ 06📦Product_Portfolio
✅ 07⚙️Mechanical_Specs
✅ 08🔌Electrical_Specs
✅ 09🎞️Packaging_Process_Specs
✅ 10📑Marketing_Activity_Log
✅ 12_📈Chart_Data
✅ 13📑Master_Log
✅ 14🔍Performance_Log
✅ 15🔍System_Health_Log
✅ 16_Evaluation_Log
✅ 17🔍Client_Config
✅ 19🔍_Lead_Intelligence_Log
```

## 🎓 Learning Path

### Beginner
1. Read `COMPREHENSIVE_RECOMMENDATIONS.md`
2. Review `customer-template.json`
3. Follow `QUICK_FIX_GUIDE.md`

### Intermediate
1. Study `backend-integration.md`
2. Review `product-calculators.js`
3. Implement `sheet-mapping-helper.js`

### Advanced
1. Build `MASTER_CONTROLLER_TEMPLATE.md`
2. Customize calculation modules
3. Extend for new product types

## 📊 Success Metrics

### System Performance
- Lead response time: <2 minutes
- Technical analysis: <5 minutes
- Quote generation: <10 minutes
- System uptime: >99.9%
- Error rate: <1%

### Business Impact
- Lead qualification: >80%
- Lead-to-opportunity: >30%
- Sales cycle reduction: >40%
- Quote accuracy: >95%

## 🆘 Troubleshooting

### Sheet Not Found
**Problem:** "Sheet '01_📞_Leads' not found"
**Solution:** Update to correct name: `01_📋Inquiries_Log`
**Guide:** See `QUICK_FIX_GUIDE.md`

### Agent Disabled
**Problem:** "Technical agent not enabled"
**Solution:** Check customer configuration or use fallback routing
**Guide:** See `MASTER_CONTROLLER_TEMPLATE.md`

### Calculation Error
**Problem:** "Unknown product type"
**Solution:** Check product type matches calculator names
**Guide:** See `product-calculators.js`

## 🔗 Integration Points

### With WIES.AI Backend
- Customer configuration API
- Webhook triggers
- Execution logging
- Analytics

### With n8n
- Master controller workflow
- Agent workflows (Lead, Technical, Sales)
- Error handlers
- Health checks

### With Google Sheets
- Robopac_Database
- Customer-specific sheets
- Multi-customer isolation

## 📞 Support

**Technical Questions:**
- Review `docs/COMPREHENSIVE_RECOMMENDATIONS.md`
- Check `config/backend-integration.md`

**Implementation Help:**
- Follow `docs/QUICK_FIX_GUIDE.md`
- Use `workflows/MASTER_CONTROLLER_TEMPLATE.md`

**Calculator Questions:**
- See examples in `calculations/product-calculators.js`
- Review product-specific requirements

## ✅ What's Included

- ✅ Complete multi-customer architecture
- ✅ Master controller template
- ✅ Product calculation modules (10 types)
- ✅ Backend integration guide
- ✅ Customer deployment template
- ✅ Sheet mapping utilities
- ✅ Comprehensive documentation
- ✅ Quick fix guide
- ✅ Implementation roadmap

## 🎉 Ready to Deploy

You now have everything needed to:
1. Fix existing workflow sheet references
2. Deploy master controller
3. Add product calculators
4. Support multiple customers
5. Handle flexible agent activation

**Start with `docs/COMPREHENSIVE_RECOMMENDATIONS.md` for the complete picture!** 🚀

---

**Created for:** Robopac/AETNA Group (First Customer)
**Platform:** WIES.AI + n8n
**Version:** 2025.10.2
**Status:** Ready for Implementation
