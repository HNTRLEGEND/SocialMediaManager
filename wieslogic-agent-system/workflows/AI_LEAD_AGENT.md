# AI_LEAD_AGENT – Lead Qualification & AI Agent Scoring

**Version:** 2025-10-27  
**Status:** Ready to import (n8n 1.114.4)

---

## Zweck
Der Workflow `AI_LEAD_AGENT` qualifiziert eingehende Leads anhand des BANT-Frameworks, nutzt ein AI-Agent-Setup mit Think-Tool und Simple Vector Base (OpenAI) und liefert eine strukturierte Antwort an den Aufrufer (z. B. MASTER-Workflow). Optional können Lead-Daten in Google Sheets oder dem Backend persistiert werden.

---

## Eingabe & Ausgabe

**Webhook (POST `/lead-agent`)**
```json
{
  "customer_id": "ROBOPAC_AETNA_001",
  "sheet_id": "1Abc...GoogleSheetId",
  "sheet_mappings": {
    "inquiries": "01_Inquiries_Log",
    "lead_intelligence": "19_Lead_Intelligence_Log"
  },
  "config": {
    "minBudgetEur": 25000,
    "minBantScore": 60,
    "autoQualifyScore": 80,
    "brand": "ROBOPAC"
  },
  "data": {
    "company_name": "Logistics GmbH",
    "contact_person": "John Doe",
    "email": "lead@example.com",
    "message": "We need automation",
    "budget": 45000,
    "timeline": "<3 months"
  }
}
```

**Webhook Response (Beispiel)**  
- `200 accepted` für hot/warm Leads (Empfehlung: Technical Agent ausführen)  
- `202 manual_review` für cold/nurture Leads  
- `400` bei Validierungsfehlern

---

## n8n Variable & Credential Checkliste
| Typ | Schlüssel | Beschreibung |
| --- | --- | --- |
| Variable | `BACKEND_BASE_URL` | Öffentliche URL deines WiesLogic Backends (z. B. `https://api.example.com`) |
| Variable | `BACKEND_TOKEN` | API Token aus dem Backend (.env `BACKEND_TOKEN`) |
| Variable | `TECH_WEBHOOK_URL` *(optional)* | Ziel-Webhook des Technical Agents (wird in der Response empfohlen) |
| Credential | **OpenAI Account** | n8n OpenAI Credential (muss GPT‑4o/GPT‑4o-mini & Embeddings unterstützen) |
| Credential | **Google Sheets OAuth2** *(optional)* | Für echtes Logging in Google Sheets – im Workflow derzeit als Platzhalter-Code hinterlegt |

> **Hinweis:** In n8n Cloud war der Zugriff auf `$env` geblockt. Dieser Workflow verwendet ausschließlich `$vars`. Setze die Variablen global oder über einen `Set`-Node, bevor du den Workflow aktivierst.

---

## Node-Überblick
1. **00_webhook_lead** – Webhook (POST `/lead-agent`), Response-Mode `responseNode`  
2. **05_validate_input** – Code-Node: Validierung, Normalisierung, `inquiry_id` und `timestamp` setzen  
3. **07_is_valid / 08_bad_request** – Abbruch bei fehlenden Pflichtfeldern  
4. **10_build_agent_payload** – Bereitet `agentInput` & Vektordokumente auf (BANT-Playbook + Markenrichtlinien)  
5. **15_ai_think_tool** – AI Think Tool (Scratchpad, automatisch aktiviert)  
6. **16_ai_vector_store** – Simple Vector Store Tool (OpenAI Embeddings auf Basis der vorbereiteten Dokumente)  
7. **20_ai_lead_agent** – AI Agent Node (OpenAI GPT‑4o-mini), JSON-Schema Output, nutzt Think & Vector Tools  
8. **25_parse_agent_result** – Parsen des Agent-Outputs, BANT-Struktur extrahieren  
9. **30_prepare_sheet_rows** – Optional: erzeugt vorbereitete Arrays für spätere Logs  
10. **35_append_inquiries_log** – Platzhalter (Code pass-through). Ersetze bei Bedarf durch Google Sheets Append  
11. **40_append_lead_intel** – Platzhalter (Code pass-through). Ersetze bei Bedarf durch Google Sheets Append  
12. **45_is_hot_or_warm** – Routing: hot/warm → Accepted, sonst nurture/manual-review  
13. **50_respond_success / 55_respond_cold** – Webhook Responses (200 bzw. 202)

---

## AI Agent Node – Konfiguration
- **Model**: `gpt-4o-mini` (oder kompatibles GPT‑4o Modell)  
- **Temperature**: `0.2` (reduziert Halluzinationen)  
- **Instructions** (System Prompt, deutsch/englisch möglich):  
  > Du bist der WiesLogic Lead Qualification Agent. Analysiere `agentInput`, nutze das Think Tool für strukturierte Reasoning-Schritte und greife über das Vector Store Tool auf Guidelines zu. Bewerte BANT, liefere Scores & Kategorie, formuliere Follow-up-Fragen und gib eine klare Handlungsempfehlung zurück.

- **Input**: `agentInput` (JSON)  
- **Output Format**: JSON-Schema (siehe Workflow)  
- **Tools**:  
  - 15_ai_think_tool (max. 6 Gedankenschritte)  
  - 16_ai_vector_store (Simple Vector Store → OpenAI Embeddings, `text-embedding-3-small`)  

---

## Optionale Sheet-/Backend-Logs
Die Nodes `35_append_inquiries_log` und `40_append_lead_intel` sind bewusst als Pass-through Code Nodes angelegt (sie geben `items` unverändert weiter).  

**So aktivierst du echtes Logging:**
1. Ersetze `35_...` durch einen Google Sheets Append Node (`operation = append`, `sheetId = {{$json.sheet_id}}`, `range = {{$json.sheet_mappings.inquiries}}`, `valueInputMode = USER_ENTERED`, `data = {{$json.leadRow}}`).  
2. Ersetze `40_...` analog für `sheet_mappings.lead_intelligence`.  
3. Alternativ kannst du hier HTTP-Requests zu deinem Backend einfügen (`POST {{$vars.BACKEND_BASE_URL}}/api/...`).  

Bis dahin laufen beide Nodes als No-Op und verhindern keine Ausführung.

---

## Vollständiger Workflow (JSON)
> Getestet mit n8n **1.114.4**. Falls dein System Tool-Bezeichner ändert, passe `typeVersion` bzw. Knotennamen an.

```json
{
  "name": "AI_LEAD_AGENT",
  "nodes": [
    {
      "parameters": {
        "path": "lead-agent",
        "responseMode": "responseNode",
        "httpMethod": "POST"
      },
      "id": "00_webhook_lead",
      "name": "00_webhook_lead",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [320, 220]
    },
    {
      "parameters": {
        "language": "JavaScript",
        "jsCode": "const body = $json || {};\nconst errors = [];\nconst data = body.data || {};\nconst config = body.config || {};\nconst sheetMappings = body.sheet_mappings || body.sheetMappings || {};\nconst sheetId = body.sheet_id || body.sheetId || config.googleSheetId || '';\nif (!body.customer_id) errors.push('Missing customer_id');\nif (!sheetId) errors.push('Missing sheet_id (sheet_id or config.googleSheetId)');\nif (!data.email) errors.push('Missing data.email');\nconst inquiryId = body.inquiry_id || 'INQ_' + Date.now();\nconst timestamp = new Date().toISOString();\nreturn [{ json: {\n  customer_id: body.customer_id,\n  action: body.action || 'trigger_lead_agent',\n  data,\n  config,\n  sheet_id: sheetId,\n  sheet_mappings: sheetMappings,\n  base_url: body.base_url || body.baseUrl || '',\n  invalid: errors.length > 0,\n  errors,\n  inquiry_id: inquiryId,\n  timestamp,\n  meta: {\n    master_execution_id: body.master_execution_id || '',\n    source: body.handover?.source || 'lead-webhook'\n  }\n}}];"
      },
      "id": "05_validate_input",
      "name": "05_validate_input",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [600, 220]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.invalid}}",
              "operation": "isFalse"
            }
          ]
        }
      },
      "id": "07_is_valid",
      "name": "07_is_valid",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [780, 220]
    },
    {
      "parameters": {
        "responseBody": "={{ JSON.stringify({ status: 'error', errors: $json.errors }) }}",
        "responseCode": 400
      },
      "id": "08_bad_request",
      "name": "08_bad_request",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [780, 380]
    },
    {
      "parameters": {
        "language": "JavaScript",
        "jsCode": "const data = $json.data || {};\nconst config = $json.config || {};\nconst docs = [];\ndocs.push({\n  id: 'bant-framework',\n  text: [\n    'BANT Qualification Playbook:',\n    '- Budget: Confirm available budget meets or exceeds minimum threshold.',\n    '- Authority: Identify if the contact has decision power or influence.',\n    '- Need: Clarify operational pains and automation goals.',\n    '- Timeline: Capture buying timeframe (<3 months = urgent, 3-6 months = near-term, >6 months = nurture).'\n  ].join('\\n')\n});\ndocs.push({\n  id: 'brand-tone',\n  text: [\n    'Brand Voice: Bold, direct, results-driven, Grant Cardone \"10X\" energy.',\n    'Core benefits: 24/7 AI automation, proven ROI, premium support.'\n  ].join('\\n')\n});\nif (data.product_type) {\n  docs.push({ id: 'product', text: 'Product focus: ' + data.product_type + '. Ensure fit with available solutions.' });\n}\nif (config.vectorAppendices) {\n  const extra = Array.isArray(config.vectorAppendices) ? config.vectorAppendices : [config.vectorAppendices];\n  extra.filter(Boolean).forEach((entry, index) => {\n    docs.push({ id: 'config-extra-' + (index + 1), text: String(entry) });\n  });\n}\nconst agentInput = {\n  inquiry_id: $json.inquiry_id,\n  customer_id: $json.customer_id,\n  contact: {\n    company_name: data.company_name || '',\n    contact_person: data.contact_person || '',\n    email: data.email || '',\n    phone: data.phone || ''\n  },\n  requirements: {\n    product_type: data.product_type || '',\n    budget: data.budget ?? null,\n    timeline: data.timeline || '',\n    throughput: data.required_pallets_per_hour || data.required_products_per_minute || null,\n    message: data.message || ''\n  },\n  config: {\n    min_budget_eur: config.minBudgetEur ?? null,\n    min_bant_score: config.minBantScore ?? 60,\n    auto_qualify_score: config.autoQualifyScore ?? 80,\n    brand: config.brand || data.brand || 'ROBOPAC'\n  },\n  sheet: {\n    id: $json.sheet_id || '',\n    mappings: $json.sheet_mappings || {}\n  },\n  meta: $json.meta || {},\n  timestamp: $json.timestamp\n};\nreturn [{\n  json: {\n    ...$json,\n    agentInput,\n    vectorDocuments: docs\n  }\n}];"
      },
      "id": "10_build_agent_payload",
      "name": "10_build_agent_payload",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [960, 220]
    },
    {
      "parameters": {},
      "id": "15_ai_think_tool",
      "name": "15_ai_think_tool",
      "type": "n8n-nodes-base.aiToolThink",
      "typeVersion": 1,
      "position": [960, 80]
    },
    {
      "parameters": {
        "vectorStoreType": "simple",
        "simpleVectorStore": {
          "provider": "openai",
          "model": "text-embedding-3-small",
          "matchCount": 6,
          "similarityThreshold": 0.35
        },
        "documents": "={{$json.vectorDocuments}}"
      },
      "id": "16_ai_vector_store",
      "name": "16_ai_vector_store",
      "type": "n8n-nodes-base.aiToolVectorStore",
      "typeVersion": 1,
      "position": [960, 140],
      "credentials": {
        "openAiApi": {
          "name": "OpenAI Account"
        }
      }
    },
    {
      "parameters": {
        "model": "gpt-4o-mini",
        "instructions": "You are the WiesLogic Lead Qualification Agent. Analyse the supplied agentInput JSON. Think step by step with the Think tool, consult the Vector Store for WiesLogic brand and BANT playbook context, and return a well-structured JSON result that includes BANT scoring, overall category (hot/warm/cold/manual_review), confidence, summary, recommended follow-up questions and next steps. Always respect min_budget_eur, min_bant_score and auto_qualify_score thresholds from the config. If critical data is missing, set status to manual_review and explain what is missing.",
        "temperature": 0.2,
        "inputKey": "agentInput",
        "responseFormat": "jsonSchema",
        "jsonSchema": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "enum": ["hot", "warm", "cold", "manual_review"]
            },
            "confidence": {
              "type": "string",
              "enum": ["high", "medium", "low"]
            },
            "summary": {
              "type": "string"
            },
            "bant": {
              "type": "object",
              "properties": {
                "budget": {
                  "type": "object",
                  "properties": {
                    "detected": {
                      "type": ["number", "string", "null"]
                    },
                    "score": {
                      "type": "number"
                    },
                    "threshold": {
                      "type": ["number", "null"]
                    },
                    "notes": {
                      "type": "string"
                    }
                  }
                },
                "authority": {
                  "type": "object",
                  "properties": {
                    "score": {
                      "type": "number"
                    },
                    "role": {
                      "type": "string"
                    },
                    "notes": {
                      "type": "string"
                    }
                  }
                },
                "need": {
                  "type": "object",
                  "properties": {
                    "score": {
                      "type": "number"
                    },
                    "pain": {
                      "type": "string"
                    }
                  }
                },
                "timeline": {
                  "type": "object",
                  "properties": {
                    "score": {
                      "type": "number"
                    },
                    "window": {
                      "type": "string"
                    }
                  }
                },
                "total_score": {
                  "type": "number"
                },
                "category": {
                  "type": "string",
                  "enum": ["hot", "warm", "cold", "manual_review"]
                }
              },
              "required": ["budget", "authority", "need", "timeline", "total_score", "category"]
            },
            "questions": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "follow_up": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "handover": {
              "type": "object",
              "properties": {
                "recommended_agent": {
                  "type": "string"
                },
                "reason": {
                  "type": "string"
                }
              }
            }
          },
          "required": ["status", "summary", "bant"]
        },
        "toolStrategy": "automatic"
      },
      "id": "20_ai_lead_agent",
      "name": "20_ai_lead_agent",
      "type": "n8n-nodes-base.aiAgent",
      "typeVersion": 1,
      "position": [1180, 220],
      "credentials": {
        "openAiApi": {
          "name": "OpenAI Account"
        }
      }
    },
    {
      "parameters": {
        "language": "JavaScript",
        "jsCode": "const agentNode = items[0].$node[\"20_ai_lead_agent\"] || {};\nlet result = agentNode.json?.output ?? agentNode.json?.result ?? agentNode.json;\nif (typeof result === 'string') {\n  try {\n    result = JSON.parse(result);\n  } catch (error) {\n    result = null;\n  }\n}\nconst safe = result && typeof result === 'object' ? result : {};\nconst bant = safe.bant || {};\nreturn [{\n  json: {\n    ...$json,\n    agent: safe,\n    bant: {\n      budget: bant.budget || {},\n      authority: bant.authority || {},\n      need: bant.need || {},\n      timeline: bant.timeline || {},\n      total_score: bant.total_score ?? bant.totalScore ?? null,\n      category: (bant.category || safe.status || '').toLowerCase()\n    },\n    agent_status: safe.status || '',\n    agent_confidence: safe.confidence || '',\n    follow_up: safe.follow_up || [],\n    questions: safe.questions || [],\n    summary: safe.summary || ''\n  }\n}];"
      },
      "id": "25_parse_agent_result",
      "name": "25_parse_agent_result",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1380, 220]
    },
    {
      "parameters": {
        "language": "JavaScript",
        "jsCode": "const bant = $json.bant || {};\nconst data = $json.data || {};\nconst leadRow = [[\n  $json.inquiry_id,\n  $json.customer_id,\n  data.company_name || '',\n  data.contact_person || '',\n  data.email || '',\n  data.phone || '',\n  data.product_type || '',\n  bant.total_score ?? '',\n  bant.category || '',\n  $json.summary || '',\n  JSON.stringify($json.questions || []),\n  JSON.stringify($json.follow_up || []),\n  $json.timestamp\n]];\nconst intelRow = [[\n  $json.inquiry_id,\n  (bant.budget?.detected ?? ''),\n  (bant.budget?.score ?? ''),\n  (bant.authority?.score ?? ''),\n  (bant.need?.score ?? ''),\n  (bant.timeline?.score ?? ''),\n  bant.total_score ?? '',\n  bant.category || '',\n  $json.agent_confidence || '',\n  $json.timestamp,\n  $json.summary || ''\n]];\nreturn [{\n  json: {\n    ...$json,\n    leadRow,\n    intelRow\n  }\n}];"
      },
      "id": "30_prepare_sheet_rows",
      "name": "30_prepare_sheet_rows",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1560, 220]
    },
    {
      "parameters": {
        "language": "JavaScript",
        "jsCode": "return items;"
      },
      "id": "35_append_inquiries_log",
      "name": "35_append_inquiries_log",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1740, 220],
      "notes": "Platzhalter: Ersetze diesen Node durch einen Google Sheets Append oder Backend-Request, sobald Credentials verfügbar sind."
    },
    {
      "parameters": {
        "language": "JavaScript",
        "jsCode": "return items;"
      },
      "id": "40_append_lead_intel",
      "name": "40_append_lead_intel",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1900, 220],
      "notes": "Platzhalter: Ersetze diesen Node durch einen zweiten Logging-Step (z. B. Lead Intelligence Sheet)."
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ ['hot','warm'].includes(($json.bant?.category || '').toLowerCase()) }}",
              "operation": "isTrue"
            }
          ]
        }
      },
      "id": "45_is_hot_or_warm",
      "name": "45_is_hot_or_warm",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [2060, 220]
    },
    {
      "parameters": {
        "responseBody": "={{ JSON.stringify({ status: 'accepted', category: ($json.bant?.category || ''), total_score: $json.bant?.total_score ?? null, inquiry_id: $json.inquiry_id, customer_id: $json.customer_id, summary: $json.summary || '', questions: $json.questions || [], follow_up: $json.follow_up || [], recommended_action: 'trigger_technical_agent', confidence: $json.agent_confidence || '' }) }}",
        "responseCode": 200
      },
      "id": "50_respond_success",
      "name": "50_respond_success",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [2240, 180]
    },
    {
      "parameters": {
        "responseBody": "={{ JSON.stringify({ status: 'manual_review', category: ($json.bant?.category || 'cold'), total_score: $json.bant?.total_score ?? null, inquiry_id: $json.inquiry_id, customer_id: $json.customer_id, summary: $json.summary || '', next: 'nurture_campaign', recommendations: $json.follow_up || [] }) }}",
        "responseCode": 202
      },
      "id": "55_respond_cold",
      "name": "55_respond_cold",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [2240, 260]
    }
  ],
  "connections": {
    "00_webhook_lead": {
      "main": [
        [
          {
            "node": "05_validate_input",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "05_validate_input": {
      "main": [
        [
          {
            "node": "07_is_valid",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "07_is_valid": {
      "main": [
        [
          {
            "node": "10_build_agent_payload",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "08_bad_request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "10_build_agent_payload": {
      "main": [
        [
          {
            "node": "20_ai_lead_agent",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "16_ai_vector_store",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "15_ai_think_tool": {
      "main": [
        [
          {
            "node": "20_ai_lead_agent",
            "type": "tools",
            "index": 0
          }
        ]
      ]
    },
    "16_ai_vector_store": {
      "main": [
        [
          {
            "node": "20_ai_lead_agent",
            "type": "tools",
            "index": 1
          }
        ]
      ]
    },
    "20_ai_lead_agent": {
      "main": [
        [
          {
            "node": "25_parse_agent_result",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "25_parse_agent_result": {
      "main": [
        [
          {
            "node": "30_prepare_sheet_rows",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "30_prepare_sheet_rows": {
      "main": [
        [
          {
            "node": "35_append_inquiries_log",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "35_append_inquiries_log": {
      "main": [
        [
          {
            "node": "40_append_lead_intel",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "40_append_lead_intel": {
      "main": [
        [
          {
            "node": "45_is_hot_or_warm",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "45_is_hot_or_warm": {
      "main": [
        [
          {
            "node": "50_respond_success",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "55_respond_cold",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "timezone": "Europe/Berlin",
    "saveDataErrorExecution": "all",
    "saveManualExecutions": true
  },
  "staticData": {},
  "pinData": {}
}
```

---

## Tests & Qualitätssicherung
| Test | Payload / Aktion | Erwartetes Ergebnis |
| --- | --- | --- |
| Health Check | Email vorhanden, Budget ≥ minBudget | Response `status=accepted`, Kategorie `hot/warm` |
| Kalt-Lead | Niedriges Budget + Timeline > 6 Monate | Response `status=manual_review`, `category=cold` |
| Fehlende Pflichtfelder | Kein `customer_id` oder `email` | 400 Fehler mit Fehlermeldung |
| Optionaler Tech-Agent | `TECH_WEBHOOK_URL` setzen und Response prüfen | Response enthält `recommended_action=trigger_technical_agent` |

---

## Nächste Schritte
1. **Variablen setzen** (`BACKEND_BASE_URL`, `BACKEND_TOKEN`, optional `TECH_WEBHOOK_URL`).  
2. **OpenAI Credential** (`OpenAI Account`) sicherstellen.  
3. Optional Logging: Platzhalter-Nodes durch echte Google Sheets / Backend Calls ersetzen.  
4. Workflow importieren, `AI Agent` testen (Manual Execution), anschließend aktivieren.  
5. MASTER-Workflow anpassen, sodass er `sheet_id`, `sheet_mappings` und `config` korrekt übergibt.

Fertig! Der Lead-Agent liefert nun einheitliche BANT-Scores und Empfehlungen und lässt sich ohne weiteres mit den übrigen Agent-Workflows kombinieren.
