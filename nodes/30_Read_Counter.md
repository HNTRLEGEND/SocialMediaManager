# NODE 30: COUNTER LESEN

## Konfiguration in n8n:

**Node-Typ:** Google Sheets
**Operation:** Read
**Document ID:** `{{ $('00_Config').first().json.GOOGLE_SHEETS.spreadsheet_id }}`
**Sheet Name:** `{{ $('00_Config').first().json.GOOGLE_SHEETS.tabs.COUNTER.name }}`

## Beschreibung:

Liest den aktuellen ID-Zähler aus Google Sheets.

## Erwartete Sheet-Struktur:

| ID_Type | Last_Number | Next |
|---------|-------------|------|
| LEAD_ID | LEAD_250001 | 250002 |
| OFFER_ID | OFFER_25_0123 | OFFER_25_0124 |

## Output:

```json
{
  "ID_Type": "LEAD_ID",
  "Last_Number": "LEAD_250001",
  "Next": "250002"
}
```
