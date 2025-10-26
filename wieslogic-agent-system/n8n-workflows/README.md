# n8n Workflow Files

**Status:** 📝 Dieses Verzeichnis ist aktuell leer

---

## ⚠️ Wichtiger Hinweis

Die WiesLogic Agent System Templates sind derzeit als **Markdown-Dokumentationen** verfügbar:
- Siehe: `../workflows/AI_*_AGENT.md` (8 Dateien)

**Importierbare n8n JSON Workflows existieren noch nicht.**

---

## 🎯 Wie erstelle ich n8n Workflows?

### Option 1: Manuell in n8n erstellen (empfohlen)

**Schritt-für-Schritt:**

1. **Öffne n8n Interface**
   ```bash
   # n8n Cloud: https://app.n8n.cloud
   # Oder Self-hosted: http://localhost:5678
   ```

2. **Neuen Workflow erstellen**
   ```
   Click "New Workflow" → Name: AI_WIESLOGIC_MASTER
   ```

3. **Folge dem Template**
   ```bash
   # Öffne: workflows/AI_WIESLOGIC_MASTER.md
   # Suche: Node 1: Webhook Trigger
   # Implementiere jeden Node gemäß Dokumentation
   ```

4. **Beispiel: Node 1 (Webhook)**
   ```
   Markdown zeigt:
   **Node 1: Webhook Trigger**
   **Path:** `/webhook/wieslogic-master`
   **Method:** POST

   In n8n:
   1. Add Node → Trigger → Webhook
   2. Path: wieslogic-master
   3. Method: POST
   4. Response Mode: Response Node
   ```

5. **Beispiel: Node 2 (Code)**
   ```
   Markdown zeigt:
   **Node 2: Code (JavaScript)**
   ```javascript
   const input = $input.item.json;
   // Validation logic...
   return { json: input };
   ```

   In n8n:
   1. Add Node → Code
   2. Kopiere JavaScript Code aus Markdown
   3. Paste in Code Editor
   ```

6. **Nodes verbinden**
   ```
   Drag from Webhook output → Code input
   ```

7. **Speichern & Testen**
   ```
   Save → Execute Workflow (mit Test-Daten)
   ```

**Zeit pro Workflow:** 30-60 Minuten

---

### Option 2: JSON-Export aus manuell erstelltem Workflow

**Nachdem du einen Workflow manuell erstellt hast:**

1. **Workflow in n8n öffnen**
2. **Click auf Menu (3 dots) → Download**
3. **Save as:** `AI_WIESLOGIC_MASTER.json`
4. **Move to:** `wieslogic-agent-system/n8n-workflows/`

**Dann können andere importieren:**
```bash
# In n8n:
# Import from File → Wähle AI_WIESLOGIC_MASTER.json
```

---

## 📦 Zukünftiger Inhalt

Wenn alle Workflows erstellt und exportiert sind, wird dieses Verzeichnis enthalten:

```
n8n-workflows/
├── README.md (diese Datei)
├── AI_WIESLOGIC_MASTER.json
├── AI_LEAD_AGENT.json
├── AI_TECHNICAL_AGENT.json
├── AI_SALES_AGENT.json
├── AI_SERVICE_AGENT.json
├── AI_LEAD_GENERATOR.json
├── AI_CONTENT_AGENT.json
├── AI_MARKETING_AGENT.json
└── AI_PERSONAL_ASSISTANT.json (optional)
```

---

## 🔄 Automatische JSON-Generierung (Roadmap)

**Geplant für Q1 2026:**

Tool: `markdown_to_n8n_json.py`

```bash
# Usage
python scripts/markdown_to_n8n_json.py \
  --input workflows/AI_WIESLOGIC_MASTER.md \
  --output n8n-workflows/AI_WIESLOGIC_MASTER.json

# Generiert importierbaren n8n JSON Workflow
```

**Status:** Konzept, noch nicht implementiert

---

## 📚 Hilfreiche Ressourcen

### n8n Dokumentation
- [n8n Docs](https://docs.n8n.io/)
- [Workflow Creation Guide](https://docs.n8n.io/workflows/)
- [Node Types](https://docs.n8n.io/nodes/)

### WiesLogic Dokumentation
- [Complete System Guide](../COMPLETE_SYSTEM_GUIDE.md)
- [Agent Templates](../workflows/)
- [Compatibility Analysis](../docs/COMPATIBILITY_ANALYSIS.md)

### Video Tutorials (extern)
- [n8n Basics](https://www.youtube.com/n8n)
- [Building Complex Workflows](https://www.youtube.com/n8n)

---

## 🤝 Beitragen

**Wenn du einen Workflow erstellt hast:**

1. Exportiere als JSON aus n8n
2. Validiere dass er funktioniert
3. Lege ihn hier ab: `n8n-workflows/`
4. Commit mit Message:
   ```bash
   git add n8n-workflows/AI_WIESLOGIC_MASTER.json
   git commit -m "feat: add n8n JSON workflow for MASTER agent"
   git push
   ```

**Naming Convention:**
- `AI_WIESLOGIC_MASTER.json` (exakt wie in Markdown)
- Großbuchstaben mit Underscores
- `.json` Extension

---

## ⏱️ Geschätzter Aufwand

| Workflow | Komplexität | Geschätzte Zeit |
|----------|-------------|-----------------|
| MASTER | Medium | 30-45 min |
| LEAD_AGENT | Medium | 40-60 min |
| TECHNICAL_AGENT | High | 60-90 min |
| SALES_AGENT | High | 60-90 min |
| SERVICE_AGENT | High | 60-90 min |
| LEAD_GENERATOR | Medium | 45-60 min |
| CONTENT_AGENT | Medium | 45-60 min |
| MARKETING_AGENT | High | 60-90 min |

**Total für alle 8:** 6-10 Stunden

---

## ✅ Checkliste für Workflow-Erstellung

Für jeden Workflow:

- [ ] Alle Nodes aus Markdown-Template hinzugefügt
- [ ] JavaScript Code korrekt eingefügt
- [ ] Nodes korrekt verbunden (Connections)
- [ ] Environment Variables konfiguriert
- [ ] Credentials hinzugefügt (Google Sheets, OpenAI, etc.)
- [ ] Test mit Dummy-Daten erfolgreich
- [ ] Error Handling funktioniert
- [ ] Workflow gespeichert
- [ ] JSON exportiert
- [ ] Dokumentiert in README (diese Datei)

---

**Version:** 2025.10.2
**Last Updated:** 26. Oktober 2025

**Sobald JSONs vorhanden sind, wird diese Datei aktualisiert!**
