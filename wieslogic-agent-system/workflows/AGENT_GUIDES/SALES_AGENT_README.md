# AI_SALES_AGENT – Quotation & Pricing (Entwurf)

## Aufgaben
- Angebotserstellung, Optionen, ROI‑Hinweise
- Nutzung Catalog (Base Pricing, Discounts)
- Generierung Report (Sheets: reports)

## Input
```json
{
  "customer_id": "ROBOPAC_AETNA_001",
  "sheet_mappings": { "quotations": "02_Quotation_Options", "reports": "04_Reports" },
  "data": { "recommended_product": { "model": "Helix Standard" }, "requirements": { } }
}
```

## Output
```json
{ "quotation_id": "Q-2025-0001", "options": [ ... ], "report_link": "https://..." }
```

## Knoten (Kurz)
1. Validate + Load Catalog (Backend)
2. Compose Options (OpenAI Chat – Vorlage)
3. Write Quotation + Report
4. Respond + Handover

