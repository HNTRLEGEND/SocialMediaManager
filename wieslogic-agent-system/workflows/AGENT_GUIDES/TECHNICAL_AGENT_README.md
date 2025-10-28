# AI_TECHNICAL_AGENT – Technical Analysis (Entwurf)

## Aufgaben
- Produkt‑Matching (Portfolios/Specs vs. Anfrage)
- Calculators (Robopac 10 Maschinentypen)
- RAG (Technische Fakten) bei Unklarheiten

## Input
```json
{
  "customer_id": "ROBOPAC_AETNA_001",
  "sheet_id": "<google_sheet_id>",
  "sheet_mappings": { "product_portfolio": "06_Product_Portfolio" },
  "data": { "product_interest": "pallet_wrapper", "required_pallets_per_hour": 80 }
}
```

## Output
```json
{ "recommended_product": { "model": "Helix Standard" }, "alternatives": ["Helix Premium"], "technical_score": 92 }
```

## Knoten (Kurz)
1. Load Portfolio + Specs
2. Calculator (product-calculators.js)
3. RAG (vs_68fbe2b37f4c8191ae85460133ff6949) – Fakten/Refs
4. Write Evaluation + Master Log
5. Respond + Handover (Sales)

