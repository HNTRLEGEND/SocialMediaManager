# AI_SERVICE_AGENT – After‑Sales Service (Entwurf)

## Aufgaben
- Eingang: IoT/E‑Mail/Phone/Teams → Service Request normalisieren
- Troubleshooting via RAG (Service KB), Ersatzteile, Eskalation

## Input
```json
{ "customer_id": "ROBOPAC_AETNA_001", "data": { "machine_id": "RBP-123", "error_code": "E42" } }
```

## Output
```json
{ "ticket_id": "SR-2025-0001", "resolution": "…", "next_steps": ["…"] }
```

## Knoten (Kurz)
1. Normalize + Lookup Customer
2. RAG (Service KB Vector Store) – Fehlercodes, Schritte
3. Create Ticket + Notify
4. Respond + Log

