# AI_WIESLOGIC_MASTER – Orchestrator (Entwurf)

Version: 2025.10.2
Status: Ready to implement

## Aufgaben
- Einheitlicher Eingang (Webhook + optional MS Teams) für alle Kundenanfragen
- Intelligente Erkennung: intent (lead/technical/sales/service/content/marketing/health_check), Brand, Customer
- RAG‑gestützte Kontextanreicherung (OpenAI Vector Store)
- Laden von Kunden‑Config + Sheets‑Mappings aus Backend
- Routing zu Sub‑Agenten inkl. Fallback/Fehlerbehandlung und Logging

## Architektur (High‑Level)
```
Ingress (Webhook/MS Teams)
  → Normalize Input (Code)
  → Think (OpenAI Chat | JSON decision)
  → RAG (OpenAI Vector Store: vs_68fbe2b37f4c8191ae85460133ff6949)
  → Load Config (Backend) + Load Sheets (Backend)
  → Decision (Code): missing_fields? → AskBack | else route
  → Route to Agent (HTTP → n8n Webhook)
  → Respond (Webhook/Teams) + Log
```

## Input (Webhook)
```json
{
  "customer_id": "ROBOPAC_AETNA_001",
  "action": "trigger_lead_agent|trigger_technical_agent|trigger_sales_agent|trigger_service_agent|health_check",
  "data": { }
}
```

## Output (Webhook)
```json
{
  "status": "accepted|manual_review|error",
  "action": "trigger_lead_agent",
  "customer_id": "ROBOPAC_AETNA_001",
  "execution_id": "MASTER_2025-10-26T18:15:42.901Z",
  "result": { "forwarded": true, "agent": "lead", "status": 200 }
}
```

## Knoten (n8n)
1. Webhook (POST `/wieslogic-master`)
2. Normalize Input (Code): Webhook/MS Teams → {customer_id, action, data, source, text?}
3. Think (OpenAI Chat, JSON‑Schema): intent, brand, customer_id?, data, missing_fields[], questions[]
4. RAG (OpenAI Vector Store): `vs_68fbe2b37f4c8191ae85460133ff6949` → facts[], refs[] (optional)
5. Load Config (HTTP GET Backend `/api/wieslogic/config/:customerId`, Bearer)
6. Load Sheets (HTTP GET Backend `/api/wieslogic/config/:customerId/sheets`, Bearer)
7. Decision (Code): missing_fields? → AskBack ; else route
8. Route (Switch): lead/technical/sales/service/health_check
9. Call Agent (HTTP POST → n8n Webhook) mit Handover Payload
10. Respond (Webhook Response / Teams Reply)
11. (Optional) Log (Backend)

## Prompts (Kurz)
System: Du bist der WiesLogic MASTER‑Orchestrator. Erkenne intent ∈ {lead, technical, sales, service, content, marketing, health_check}, Brand ∈ {ROBOPAC, OCME, PRASMATIC, SOTEMAPACK, MEYPACK}, weise customer_id zu (falls eindeutig), extrahiere strukturierte Felder (company_name, email, product_interest, KPIs …), identifiziere missing_fields und generiere präzise Fragen. Antworte strikt als JSON {intent, confidence, brand?, customer_id?, data, missing_fields:[], questions:[]}.

## Fehler & Fallbacks
- Ungültiges Payload → 400 mit Fehlermeldung
- Agent disabled → manual_review (202) mit Hinweis
- Downstream 4xx/5xx → Retry‑Policy (1×) → Fallback (manual_review) + Log

## Tests
- Lead (Happy Path): trigger_lead_agent mit minimalen Feldern → 200 weitergeleitet
- Missing Fields: data ohne email → Rückfragen (Teams/Webhook‑Response)
- Health Check: action=health_check → Statusobjekt

