# AI Personal Assistant - Integration Guide

## Übersicht

Der AI Personal Assistant ist ein vollständig autonomer Assistent, der sich nahtlos in das WiesLogic Agent System integriert und folgende Hauptfunktionen bietet:

### Kernfunktionen

✅ **E-Mail-Management**
- Automatische Klassifizierung und Priorisierung
- Intelligente Auto-Response
- Draft-Generierung für Review
- E-Mail-Organisation und Archivierung

✅ **Kalender-Management**
- Automatische Terminplanung
- Konfliktprüfung
- Meeting-Einladungen
- Erinnerungen

✅ **Aufgaben-Management**
- Automatische Task-Extraktion aus E-Mails
- Priorisierung und Deadlines
- Tägliche Übersicht
- Follow-up Tracking

✅ **Kommunikation**
- Professionelle E-Mail-Antworten
- Meeting-Koordination
- Kontakt-Beziehungspflege
- Mehrkanalige Benachrichtigungen

## Systemarchitektur

```
┌────────────────────────────────────────────────────────────────────┐
│                    WiesLogic Master Controller                     │
└─────────────────────┬──────────────────────────────────────────────┘
                      │
                      ├──▶ Lead Agent
                      ├──▶ Technical Agent
                      ├──▶ Sales Agent
                      └──▶ Personal Assistant Agent (NEU)
                           │
                           ├──▶ Email Management
                           ├──▶ Calendar Management
                           ├──▶ Task Management
                           └──▶ Contact Management
```

## Integration mit bestehenden Agenten

### 1. Lead Agent → Personal Assistant

**Szenario:** Neuer Lead kommt rein
```javascript
// Lead Agent erstellt Inquiry
→ Personal Assistant erstellt Follow-up Task
→ Personal Assistant scheduled Follow-up Meeting
→ Personal Assistant sendet Erinnerung
```

**Workflow:**
```javascript
{
  "trigger": "lead_qualified",
  "action": "create_follow_up_task",
  "data": {
    "task_title": "Follow up with new lead: {{ company_name }}",
    "deadline": "+3 days",
    "priority": "high",
    "category": "follow_up",
    "context": {
      "lead_id": "{{ lead_id }}",
      "company": "{{ company_name }}",
      "contact": "{{ contact_name }}"
    }
  }
}
```

### 2. Technical Agent → Personal Assistant

**Szenario:** Technische Analyse abgeschlossen
```javascript
// Technical Agent findet passende Produkte
→ Personal Assistant erstellt Task "Angebot vorbereiten"
→ Personal Assistant scheduled Produktdemo
→ Personal Assistant bereitet Meeting-Agenda vor
```

### 3. Sales Agent → Personal Assistant

**Szenario:** Angebot versendet
```javascript
// Sales Agent sendet Quotation
→ Personal Assistant tracked Response
→ Personal Assistant erstellt Follow-up Task (nach 3 Tagen)
→ Personal Assistant erinnert an Nachfassen
```

### 4. Personal Assistant → Sales Agent

**Szenario:** Kunde fragt nach Preisen
```javascript
// Personal Assistant empfängt Preis-Anfrage
→ Klassifiziert als "sales" Category
→ Leitet an Sales Agent weiter
→ Sales Agent generiert Angebot
→ Personal Assistant versendet Angebot
```

## Deployment-Schritte

### Schritt 1: Voraussetzungen

```bash
# Google APIs aktivieren
- Gmail API
- Google Calendar API
- Google Drive API
- Google Sheets API

# Service Account erstellen
- Erstelle Service Account in Google Cloud
- Generiere JSON Key
- Teile Kalender mit Service Account
- Gewähre Gmail-Zugriff (Domain-wide Delegation)

# OpenAI API
- API Key für GPT-4 Turbo
- (Optional) Vector Store für RAG
```

### Schritt 2: Backend-Erweiterung

Erweitere die WiesLogic-Konfiguration in der Datenbank:

```prisma
model CustomerAgentConfig {
  // ... existing fields ...

  // Personal Assistant Settings
  paEnabled              Boolean  @default(false)
  paEmailManagement      Boolean  @default(true)
  paCalendarManagement   Boolean  @default(true)
  paTaskManagement       Boolean  @default(true)
  paAutoResponse         Boolean  @default(true)
  paAutoResponseThreshold Float   @default(0.85)

  // Working Hours
  paWorkingHoursStart    Int      @default(9)
  paWorkingHoursEnd      Int      @default(17)
  paTimezone             String   @default("Europe/Berlin")

  // Notification Preferences
  paNotifyUrgent         Boolean  @default(true)
  paNotifyChannel        String   @default("email")
  paSlackWebhook         String?
  paTeamsWebhook         String?

  // Email Settings
  paEmailTone            String   @default("professional_friendly")
  paEmailSignature       String?
  paOOOEnabled           Boolean  @default(false)
  paOOOStart             DateTime?
  paOOOEnd               DateTime?
  paOOOMessage           String?
  paOOOBackupContact     String?

  // @@index([customerId, paEnabled])
}
```

### Schritt 3: n8n Workflow Import

1. **Importiere Personal Assistant Workflow**
```bash
# In n8n
Settings → Import from File → AI_PERSONAL_ASSISTANT.json
```

2. **Konfiguriere Environment Variables**
```env
# Füge zu n8n hinzu:
GOOGLE_SERVICE_ACCOUNT_EMAIL=assistant@project.iam.gserviceaccount.com
GOOGLE_CALENDAR_ID=primary
GMAIL_USER_EMAIL=user@company.com

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

PA_AUTO_RESPONSE_ENABLED=true
PA_WORKING_HOURS_START=9
PA_WORKING_HOURS_END=17

SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

3. **Verbinde mit Master Controller**
```javascript
// In Master Controller, füge hinzu:
{
  "agent_name": "personal_assistant",
  "workflow_id": "AI_PERSONAL_ASSISTANT",
  "webhook_url": "/webhook/personal-assistant",
  "triggers": [
    "email_received",
    "calendar_event",
    "task_due",
    "agent_handover"
  ]
}
```

### Schritt 4: Gmail Integration

#### Gmail Trigger Setup
```javascript
// In n8n Gmail Trigger Node:
{
  "authentication": "serviceAccount",
  "serviceAccountEmail": "{{ $env.GOOGLE_SERVICE_ACCOUNT_EMAIL }}",
  "filters": {
    "labelIds": ["INBOX"],
    "excludeSpam": true,
    "includeSpamTrash": false
  },
  "pollTimes": {
    "item": [
      {
        "mode": "everyMinute"
      }
    ]
  }
}
```

#### Gmail Response Setup
```javascript
// Sende E-Mail via Gmail API
{
  "to": "{{ $json.recipient }}",
  "subject": "{{ $json.subject }}",
  "message": "{{ $json.body }}",
  "format": "html",
  "threadId": "{{ $json.threadId }}",  // Für Thread-Antworten
  "labelIds": ["SENT"]
}
```

### Schritt 5: Google Calendar Integration

```javascript
// Finde freie Zeiten
{
  "operation": "getBusy",
  "calendar": "primary",
  "timeMin": "{{ $now }}",
  "timeMax": "{{ $now.plus(14, 'days') }}",
  "timeZone": "Europe/Berlin"
}

// Erstelle Event
{
  "operation": "create",
  "calendar": "primary",
  "summary": "{{ $json.meeting_title }}",
  "description": "{{ $json.meeting_description }}",
  "start": "{{ $json.start_time }}",
  "end": "{{ $json.end_time }}",
  "attendees": "{{ $json.attendees }}",
  "conferenceData": {
    "createRequest": {
      "requestId": "{{ $json.meeting_id }}",
      "conferenceSolutionKey": {
        "type": "hangoutsMeet"
      }
    }
  }
}
```

### Schritt 6: Task Management Integration

Nutze vorhandene Google Sheets oder integriere mit:

```javascript
// Schreibe Task in Sheet
const taskSheet = '18_📊_PA_Tasks';  // Neues Sheet

await sheets.append({
  range: `${taskSheet}!A:K`,
  values: [[
    new Date().toISOString(),      // Created
    task.title,                    // Title
    task.priority,                 // Priority
    task.deadline,                 // Deadline
    task.category,                 // Category
    'pending',                     // Status
    task.estimated_time,           // Est. Time
    task.source,                   // Source
    task.source_id,                // Source ID
    JSON.stringify(task.context),  // Context
    ''                             // Notes
  ]]
});
```

## Verwendungsbeispiele

### Beispiel 1: Auto-Response auf Meeting-Anfrage

**Eingehende E-Mail:**
```
Von: kunde@example.com
Betreff: Termin für Produktdemo

Hallo,

ich würde gerne eine Produktdemo vereinbaren.
Passt es Ihnen nächste Woche Dienstag oder Donnerstag?

Viele Grüße
Max Mustermann
```

**Personal Assistant Workflow:**
```javascript
1. Email Trigger empfängt E-Mail
2. Classifier erkennt: category="meeting_request", priority="high"
3. Calendar Manager findet freie Slots:
   - Dienstag 10:00-11:00
   - Dienstag 15:00-16:00
   - Donnerstag 14:00-15:00
4. Response Generator erstellt Antwort
5. Sendet Draft zur Review (oder automatisch wenn confidence > 0.85)
```

**Generierte Antwort:**
```
Betreff: Re: Termin für Produktdemo

Sehr geehrter Herr Mustermann,

vielen Dank für Ihr Interesse an einer Produktdemo.

Ich habe folgende Termine für Sie gefunden:

🗓️ Dienstag, 29.10.2025
   • 10:00 - 11:00 Uhr
   • 15:00 - 16:00 Uhr

🗓️ Donnerstag, 31.10.2025
   • 14:00 - 15:00 Uhr

Bitte teilen Sie mir mit, welcher Termin Ihnen am besten passt,
dann sende ich Ihnen die Kalendereinladung mit dem Meeting-Link.

Mit freundlichen Grüßen
[Signatur]
```

### Beispiel 2: Task-Extraktion aus E-Mail

**Eingehende E-Mail:**
```
Von: chef@company.com
Betreff: Follow-up nach Meeting

Hallo,

bitte bereiten Sie folgendes vor:
- Präsentation für Kundentermin aktualisieren
- Preisangebot für Projekt XY erstellen (bis Freitag)
- Termin mit Lieferant vereinbaren

Danke!
```

**Personal Assistant Workflow:**
```javascript
1. Email empfangen
2. Task Extractor findet 3 Aufgaben
3. Erstellt Tasks mit Prioritäten und Deadlines
4. Sendet Bestätigung zurück
```

**Extrahierte Tasks:**
```javascript
[
  {
    "title": "Präsentation für Kundentermin aktualisieren",
    "priority": "high",
    "deadline": null,  // Kein explizites Datum
    "category": "meeting_prep",
    "estimated_time": 60
  },
  {
    "title": "Preisangebot für Projekt XY erstellen",
    "priority": "high",
    "deadline": "2025-10-31T17:00:00Z",  // Freitag
    "category": "follow_up",
    "estimated_time": 90
  },
  {
    "title": "Termin mit Lieferant vereinbaren",
    "priority": "normal",
    "deadline": null,
    "category": "communication",
    "estimated_time": 15
  }
]
```

**Bestätigungs-E-Mail:**
```
Betreff: Re: Follow-up nach Meeting

Hallo,

ich habe folgende Aufgaben notiert:

✅ Präsentation für Kundentermin aktualisieren (Priorität: Hoch)
✅ Preisangebot für Projekt XY erstellen (Frist: Freitag, 17:00)
✅ Termin mit Lieferant vereinbaren

Ich melde mich zeitnah mit Updates.

Grüße
```

### Beispiel 3: Tägliche Task-Übersicht

**Jeden Morgen um 8:00 Uhr:**

```
📋 Ihre Aufgaben für Dienstag, 29. Oktober 2025

🚨 ÜBERFÄLLIG (2)
• Angebot für Kunde ABC finalisieren (seit 1 Tag)
• Vertragsunterlagen prüfen (seit 3 Tagen)

⏰ HEUTE FÄLLIG (4)
• Preisangebot für Projekt XY erstellen (17:00)
• Meeting vorbereiten: Produktdemo (10:00)
• Rückruf bei Lieferant (bis 16:00)
• Wochenbericht fertigstellen (EOD)

📅 DIESE WOCHE
• Quarterly Review vorbereiten (Freitag)
• Team-Meeting Agenda erstellen (Donnerstag)

📊 ZUSAMMENFASSUNG
• Gesamt offen: 12 Aufgaben
• Geschätzte Zeit: 6.5 Stunden
• Meetings heute: 3

💡 EMPFEHLUNGEN
• Priorisieren Sie die überfälligen Aufgaben
• Blockieren Sie 2h für konzentriertes Arbeiten
• Verschieben Sie wenn möglich: Team-Meeting Agenda

Viel Erfolg heute! 🎯
```

### Beispiel 4: Out of Office Management

**Konfiguration:**
```javascript
{
  "ooo_enabled": true,
  "ooo_start": "2025-11-01T00:00:00Z",
  "ooo_end": "2025-11-08T23:59:59Z",
  "ooo_message": "Ich bin im Urlaub und melde mich ab dem 11.11. zurück.",
  "backup_contact": "vertretung@company.com",
  "auto_create_follow_ups": true
}
```

**Während Abwesenheit:**
1. Alle E-Mails erhalten automatische OOO-Antwort
2. Dringende E-Mails werden an Vertretung weitergeleitet
3. Alle E-Mails werden als Follow-up-Tasks für nach der Rückkehr gespeichert
4. Am ersten Tag nach Rückkehr: Priorisierte Liste aller verpassten Anfragen

## Anpassung und Konfiguration

### Pro-Kunde Anpassungen

Jeder Kunde kann eigene Einstellungen haben:

```javascript
// Kunde A: Sehr konservativ, manuelle Review
{
  "auto_response_enabled": false,
  "save_all_as_drafts": true,
  "notify_all_emails": true
}

// Kunde B: Voll automatisiert
{
  "auto_response_enabled": true,
  "auto_response_threshold": 0.75,  // Niedrigere Schwelle
  "auto_schedule_meetings": true
}

// Kunde C: Nur während Arbeitszeiten
{
  "auto_response_enabled": true,
  "working_hours_only": true,
  "out_of_hours_behavior": "save_for_next_day"
}
```

### Email-Ton Anpassung

```javascript
// Verschiedene Töne für verschiedene Situationen
{
  "default_tone": "professional_friendly",
  "tone_per_sender": {
    "vip@client.com": "formal",
    "team@company.com": "casual"
  },
  "tone_per_category": {
    "complaint": "empathetic_formal",
    "sales": "enthusiastic_professional",
    "support": "helpful_patient"
  }
}
```

### Kalender-Präferenzen

```javascript
{
  "meeting_preferences": {
    "preferred_days": ["tuesday", "wednesday", "thursday"],
    "avoid_mondays": true,
    "avoid_fridays_after": "14:00",
    "lunch_break": "12:00-13:00",
    "focus_blocks": [
      {
        "day": "monday",
        "time": "09:00-11:00",
        "reason": "Deep Work"
      }
    ],
    "max_meetings_per_day": 5,
    "buffer_between_meetings": 15
  }
}
```

## Monitoring & Analytics

### Dashboards

Track folgende Metriken:

```javascript
{
  "email_metrics": {
    "total_received": 150,
    "auto_classified": 148,
    "auto_responded": 45,
    "saved_as_draft": 82,
    "forwarded": 23,
    "avg_classification_confidence": 0.87,
    "avg_response_time_minutes": 3.5
  },
  "calendar_metrics": {
    "meetings_scheduled": 12,
    "conflicts_detected": 3,
    "conflicts_resolved": 3,
    "avg_scheduling_time_minutes": 2.1
  },
  "task_metrics": {
    "tasks_created": 45,
    "tasks_from_emails": 32,
    "tasks_completed": 38,
    "overdue_tasks": 4,
    "completion_rate": 0.84
  },
  "productivity_metrics": {
    "time_saved_hours": 12.5,
    "emails_handled_automatically": 45,
    "meetings_scheduled_automatically": 12,
    "user_satisfaction_score": 4.6
  }
}
```

### Alerts einrichten

```javascript
{
  "alerts": [
    {
      "name": "High Error Rate",
      "condition": "error_rate > 0.05",
      "action": "notify_admin",
      "channel": "slack"
    },
    {
      "name": "Low Confidence Responses",
      "condition": "avg_confidence < 0.7",
      "action": "review_required",
      "channel": "email"
    },
    {
      "name": "Many Overdue Tasks",
      "condition": "overdue_tasks > 10",
      "action": "daily_reminder",
      "channel": "email"
    }
  ]
}
```

## Best Practices

### 1. Starte konservativ
```javascript
// Erste Woche
{
  "auto_response_enabled": false,
  "save_all_as_drafts": true,
  "notify_all_emails": true
}

// Nach 1 Woche: Schrittweise aktivieren
{
  "auto_response_enabled": true,
  "auto_response_threshold": 0.95,  // Sehr hoch
}

// Nach 1 Monat: Optimale Balance
{
  "auto_response_threshold": 0.85,
  "auto_schedule_meetings": true
}
```

### 2. Trainiere das System
- Korrigiere falsche Klassifikationen
- Markiere gute/schlechte Antworten
- Passe Tone Preferences an
- Verfeinere Task-Extraktion

### 3. Überwache regelmäßig
- Täglich: Durchschnittliche Confidence
- Wöchentlich: Response Quality
- Monatlich: Overall Performance

### 4. Nutze Feedback-Loops
```javascript
// Füge Feedback-Buttons zu generierten E-Mails hinzu
// "War diese Antwort hilfreich? 👍 👎"

// Lerne aus Korrekturen
if (user_edited_draft) {
  learnFromCorrection(original, edited);
}
```

## Troubleshooting

### Problem 1: Zu viele Drafts, zu wenige Auto-Sends

**Lösung:**
```javascript
// Senke Confidence-Threshold
"auto_response_threshold": 0.80  // statt 0.85

// Oder: Aktiviere Auto-Send für bestimmte Kategorien
"auto_send_categories": ["meeting_request", "question"]
```

### Problem 2: Termine werden zu spät vorgeschlagen

**Lösung:**
```javascript
// Erweitere Suchfenster
"look_ahead_days": 21  // statt 14

// Oder: Mehr Zeitfenster erlauben
"preferred_times": [9, 10, 11, 13, 14, 15, 16, 17]
```

### Problem 3: Tasks werden nicht erkannt

**Lösung:**
```javascript
// Verwende aggressivere Task-Extraktion
"task_extraction_mode": "aggressive"

// Oder: Trainiere mit Beispielen
await taskManager.learnFromExamples([
  { text: "bitte XY erledigen", extracted: "XY erledigen" }
]);
```

---

## Nächste Schritte

1. ✅ Review Konfiguration
2. ✅ Deploy Workflow
3. ✅ Teste mit Test-Account
4. ✅ Schrittweise für echten Account aktivieren
5. ✅ Monitor und optimiere

**Viel Erfolg mit Ihrem AI Personal Assistant!** 🤖✨
