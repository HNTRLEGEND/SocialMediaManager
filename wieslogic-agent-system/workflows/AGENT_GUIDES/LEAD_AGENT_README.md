# AI_LEAD_AGENT – Lead Qualification (Entwurf)

## Aufgaben
- BANT‑Scoring (Budget, Authority, Need, Timeline)
- Firmen‑Enrichment (optional via Hunter/Clearbit)
- Lead Dossier erzeugen, Handover an TECHNICAL bei Score ≥ Min

## Input
```json
{
  "customer_id": "ROBOPAC_AETNA_001",
  "sheet_id": "<google_sheet_id>",
  "sheet_mappings": { "inquiries": "01_Inquiries_Log", "master_log": "13_Master_Log" },
  "config": { "min_bant_score": 60 },
  "data": { "company_name": "Test GmbH", "email": "test@example.com", "product_interest": "pallet_wrapper" }
}
```

## Output
```json
{ "bant_score": 85, "category": "hot", "handover": { "to": "technical_agent" } }
```

## Knoten (Kurz)
1. Validate + Load Sheets Rows
2. BANT Score (OpenAI Chat)
3. (Optional) Enrichment (HTTP)
4. Write to Sheets (inquiries, master_log)
5. Respond + Handover

