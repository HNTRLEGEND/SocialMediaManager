# AI_PERSONAL_ASSISTANT - Intelligenter Persönlicher Assistent

## Workflow Übersicht

Der AI Personal Assistant ist ein intelligenter, autonomer Assistent, der folgende Aufgaben übernimmt:

- ✅ **Email-Management** - Automatische Kategorisierung, Priorisierung, Antworten
- ✅ **Kalender-Management** - Terminplanung, Konfliktprüfung, Erinnerungen
- ✅ **Aufgaben-Management** - ToDo-Listen, Deadlines, Follow-ups
- ✅ **Kommunikation** - E-Mail-Entwürfe, automatische Antworten
- ✅ **Meeting-Koordination** - Terminvorschläge, Einladungen
- ✅ **Dokumenten-Organisation** - Ablage, Kategorisierung
- ✅ **Kontakt-Management** - CRM, Beziehungspflege

## Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                  AI Personal Assistant Core                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Email Trigger] ──┬──▶ [Classifier] ──┬──▶ [Action Router]   │
│                    │                    │                       │
│  [Calendar Event]──┤                    ├──▶ [Email Handler]   │
│                    │                    │                       │
│  [Schedule API]────┘                    ├──▶ [Calendar Handler]│
│                                         │                       │
│                                         ├──▶ [Task Handler]    │
│                                         │                       │
│                                         └──▶ [Response Gen]    │
└─────────────────────────────────────────────────────────────────┘
```

## Node-Struktur

### 1. Email-Management Workflow

#### 1.1 Email Trigger (`00_email_trigger`)

**Type:** Gmail Trigger
**Configuration:**
- Trigger: New Email in Inbox
- Filter: Exclude spam, promotions (optional)
- Frequency: Every 1 minute

**Output:**
```json
{
  "email_id": "msg_123456",
  "from": "sender@example.com",
  "to": "user@company.com",
  "subject": "Meeting Request",
  "body": "Email content...",
  "timestamp": "2025-10-26T10:00:00Z",
  "labels": ["INBOX", "UNREAD"],
  "thread_id": "thread_123"
}
```

#### 1.2 Email Classifier (`05_classify_email`)

**Type:** OpenAI Chat
**Purpose:** Kategorisiere und priorisiere eingehende E-Mails

**Prompt:**
```
Du bist ein intelligenter Email-Assistent. Analysiere die folgende E-Mail und kategorisiere sie.

Von: {{ $json.from }}
Betreff: {{ $json.subject }}
Inhalt: {{ $json.body }}

Klassifiziere nach:
1. **Kategorie**: meeting_request, question, urgent, info, task, sales, support
2. **Priorität**: urgent, high, normal, low
3. **Aktion**: respond_immediately, schedule_meeting, create_task, archive, forward
4. **Sentiment**: positive, neutral, negative, frustrated
5. **Benötigt Antwort**: yes/no
6. **Deadline**: Extrahiere Datum/Zeit falls vorhanden

Antworte im JSON-Format.
```

**Response Format:**
```json
{
  "category": "meeting_request",
  "priority": "high",
  "action": "schedule_meeting",
  "sentiment": "positive",
  "requires_response": true,
  "deadline": "2025-10-27T14:00:00Z",
  "key_points": [
    "Wants to schedule product demo",
    "Available next week Tuesday or Thursday",
    "Mentioned budget of 50k EUR"
  ],
  "suggested_response": "Thank the sender and propose specific times..."
}
```

#### 1.3 Priority Router (`10_priority_router`)

**Type:** Switch Node
**Property:** `{{ $json.classification.priority }}`

**Routes:**
1. **urgent** → Immediate Response Handler
2. **high** → Quick Response Handler
3. **normal** → Standard Processing
4. **low** → Batch Processing (process later)

#### 1.4 Email Response Generator (`15_generate_response`)

**Type:** OpenAI Chat
**Purpose:** Generiere professionelle E-Mail-Antworten

**Prompt:**
```
Du bist der persönliche Assistent von {{ $json.customer_config.user_name }}.

Ursprüngliche E-Mail:
Von: {{ $json.from }}
Betreff: {{ $json.subject }}
Inhalt: {{ $json.body }}

Klassifikation:
{{ JSON.stringify($json.classification) }}

Erstelle eine professionelle E-Mail-Antwort auf Deutsch/Englisch je nach Original-Sprache.

Ton: {{ $json.customer_config.email_tone || 'professional and friendly' }}

Richtlinien:
- Höflich und professionell
- Beantworte alle Fragen
- Bei Meeting-Anfragen: Schlage konkrete Termine vor
- Bei Aufgaben: Bestätige und gib Timeline
- Verwende Signatur: {{ $json.customer_config.email_signature }}

Antworte mit:
{
  "subject": "Re: ...",
  "body": "Email body in HTML",
  "action": "send_immediately" oder "save_as_draft",
  "suggested_calendar_slots": [...] // falls Meeting-Anfrage
}
```

#### 1.5 Send/Draft Email (`20_send_email`)

**Type:** IF Node + Gmail Send

**Condition:**
```javascript
$json.response.action === 'send_immediately' &&
$json.classification.priority !== 'urgent'
```

**IF TRUE → Save as Draft:**
```javascript
// Gmail: Create Draft
{
  "to": $json.from,
  "subject": $json.response.subject,
  "body": $json.response.body,
  "threadId": $json.thread_id
}
```

**IF FALSE → Send Immediately:**
```javascript
// Gmail: Send Email
{
  "to": $json.from,
  "subject": $json.response.subject,
  "body": $json.response.body,
  "threadId": $json.thread_id
}
```

#### 1.6 Auto-Archive/Label (`25_organize_email`)

**Type:** Gmail Update
**Purpose:** Organisiere E-Mail automatisch

```javascript
const actions = {
  'urgent': { labels: ['URGENT', 'STARRED'] },
  'meeting_request': { labels: ['MEETINGS'], archive: false },
  'question': { labels: ['QUESTIONS'], archive: false },
  'info': { labels: ['INFO'], archive: true },
  'task': { labels: ['TASKS'], archive: false },
  'sales': { labels: ['SALES'], archive: false }
};

const action = actions[$json.classification.category];

return {
  json: {
    messageId: $json.email_id,
    addLabels: action.labels,
    removeLabels: action.archive ? ['INBOX'] : [],
    markAsRead: action.archive
  }
};
```

### 2. Kalender-Management Workflow

#### 2.1 Calendar Trigger (`30_calendar_trigger`)

**Type:** Multiple Triggers
- **New Event Created** → Validate and optimize
- **Event Updated** → Check conflicts
- **15min before Event** → Send reminder
- **API Call** → Schedule new meeting

#### 2.2 Find Available Slots (`35_find_slots`)

**Type:** Google Calendar + Code Node
**Purpose:** Finde freie Zeitfenster

```javascript
const { GoogleCalendar } = require('./google-calendar-helper.js');

// Input: Meeting request details
const meetingDuration = $json.duration || 60; // minutes
const preferredDays = $json.preferred_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const preferredTimes = $json.preferred_times || [9, 10, 11, 14, 15, 16]; // hours
const lookAheadDays = $json.look_ahead || 14;

// Get busy times from calendar
const busySlots = await GoogleCalendar.getBusyTimes({
  start: new Date(),
  end: new Date(Date.now() + lookAheadDays * 24 * 60 * 60 * 1000)
});

// Find free slots
function findFreeSlots(busySlots, duration, preferredDays, preferredTimes, lookAhead) {
  const freeSlots = [];
  const now = new Date();

  for (let day = 0; day < lookAhead; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);

    const dayName = date.toLocaleDateString('de-DE', { weekday: 'long' });
    if (!preferredDays.includes(dayName)) continue;

    for (const hour of preferredTimes) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      // Check if slot is free
      const isConflict = busySlots.some(busy => {
        return slotStart < busy.end && slotEnd > busy.start;
      });

      if (!isConflict && slotStart > now) {
        freeSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          date: slotStart.toLocaleDateString('de-DE'),
          time: slotStart.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        });
      }
    }
  }

  return freeSlots.slice(0, 5); // Return top 5 slots
}

const availableSlots = findFreeSlots(busySlots, meetingDuration, preferredDays, preferredTimes, lookAheadDays);

return {
  json: {
    ...$json,
    available_slots: availableSlots,
    total_slots_found: availableSlots.length
  }
};
```

#### 2.3 Smart Meeting Scheduler (`40_schedule_meeting`)

**Type:** OpenAI + Google Calendar
**Purpose:** Intelligente Terminplanung

**Process:**
1. Analysiere Meeting-Anfrage
2. Finde passende Zeitfenster
3. Prüfe Teilnehmer-Verfügbarkeit (falls bekannt)
4. Erstelle Kalender-Event
5. Sende Einladungen
6. Erstelle Bestätigungs-Email

```javascript
// Create Calendar Event
{
  "summary": "{{ $json.meeting_title }}",
  "description": "{{ $json.meeting_description }}",
  "start": {
    "dateTime": "{{ $json.selected_slot.start }}",
    "timeZone": "Europe/Berlin"
  },
  "end": {
    "dateTime": "{{ $json.selected_slot.end }}",
    "timeZone": "Europe/Berlin"
  },
  "attendees": [
    { "email": "{{ $json.attendee_email }}" }
  ],
  "reminders": {
    "useDefault": false,
    "overrides": [
      { "method": "email", "minutes": 1440 }, // 1 day before
      { "method": "popup", "minutes": 15 }    // 15 min before
    ]
  },
  "conferenceData": {
    "createRequest": {
      "requestId": "{{ $json.meeting_id }}",
      "conferenceSolutionKey": { "type": "hangoutsMeet" }
    }
  }
}
```

#### 2.4 Conflict Detection (`45_check_conflicts`)

**Type:** Code Node
**Purpose:** Prüfe Terminüberschneidungen

```javascript
const newEvent = $json.new_event;
const existingEvents = $json.calendar_events;

function checkConflicts(newEvent, existingEvents) {
  const conflicts = [];
  const newStart = new Date(newEvent.start);
  const newEnd = new Date(newEvent.end);

  for (const event of existingEvents) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Check overlap
    if (newStart < eventEnd && newEnd > eventStart) {
      conflicts.push({
        event_id: event.id,
        title: event.summary,
        start: event.start,
        end: event.end,
        severity: calculateOverlap(newStart, newEnd, eventStart, eventEnd)
      });
    }
  }

  return conflicts;
}

function calculateOverlap(start1, end1, start2, end2) {
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  const overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);

  if (overlapMinutes >= 60) return 'critical';
  if (overlapMinutes >= 30) return 'high';
  if (overlapMinutes >= 15) return 'medium';
  return 'low';
}

const conflicts = checkConflicts(newEvent, existingEvents);

return {
  json: {
    has_conflicts: conflicts.length > 0,
    conflict_count: conflicts.length,
    conflicts: conflicts,
    recommendation: conflicts.length > 0 ? 'reschedule' : 'proceed'
  }
};
```

#### 2.5 Meeting Reminder (`50_send_reminder`)

**Type:** Scheduled Trigger + Email
**Trigger:** 15 minutes before calendar event

```javascript
// OpenAI: Generate meeting reminder
const prompt = `
Erstelle eine kurze, freundliche Meeting-Erinnerung.

Meeting Details:
Titel: {{ $json.event.summary }}
Zeit: {{ $json.event.start }}
Teilnehmer: {{ $json.event.attendees }}
Ort/Link: {{ $json.event.hangoutLink || $json.event.location }}

Erstelle eine Erinnerung mit:
1. Freundliche Begrüßung
2. Meeting-Details
3. Join-Link (falls virtuell)
4. Agenda (falls vorhanden)
5. Kontaktmöglichkeit bei Verspätung
`;

// Send via Email or Slack/Teams
```

### 3. Aufgaben-Management Workflow

#### 3.1 Task Extractor (`55_extract_tasks`)

**Type:** OpenAI Chat
**Purpose:** Extrahiere Aufgaben aus E-Mails/Meetings

```javascript
const prompt = `
Analysiere folgenden Text und extrahiere alle Aufgaben (Tasks).

Text: {{ $json.content }}

Für jede Aufgabe extrahiere:
- **task_title**: Kurze Beschreibung
- **assignee**: Wer ist verantwortlich? (ich/sender/team)
- **deadline**: Frist (falls erwähnt)
- **priority**: urgent/high/normal/low
- **dependencies**: Abhängigkeiten von anderen Aufgaben
- **estimated_time**: Geschätzte Dauer in Minuten
- **category**: meeting_prep, follow_up, research, admin, etc.

Antworte im JSON-Array Format.
`;
```

**Response:**
```json
[
  {
    "task_title": "Produktdemo vorbereiten",
    "assignee": "ich",
    "deadline": "2025-10-28T10:00:00Z",
    "priority": "high",
    "dependencies": [],
    "estimated_time": 120,
    "category": "meeting_prep"
  },
  {
    "task_title": "Preisangebot erstellen",
    "assignee": "ich",
    "deadline": "2025-10-29T17:00:00Z",
    "priority": "normal",
    "dependencies": ["Produktdemo vorbereiten"],
    "estimated_time": 60,
    "category": "follow_up"
  }
]
```

#### 3.2 Create Tasks in System (`60_create_tasks`)

**Type:** Google Sheets Append (or Notion/Asana API)

```javascript
// Write to Task Management Sheet
const tasks = $json.extracted_tasks;

const rows = tasks.map(task => [
  new Date().toISOString(),           // Created
  task.task_title,                    // Title
  task.assignee,                      // Assignee
  task.deadline,                      // Deadline
  task.priority,                      // Priority
  'pending',                          // Status
  task.estimated_time,                // Est. Time
  task.category,                      // Category
  JSON.stringify(task.dependencies),  // Dependencies
  $json.source_email_id || '',        // Source
  ''                                  // Notes
]);

return { json: { rows } };
```

#### 3.3 Task Reminder System (`65_task_reminders`)

**Type:** Schedule Trigger
**Frequency:** Daily at 8:00 AM

**Process:**
1. Lade alle offenen Aufgaben
2. Prüfe Deadlines
3. Kategorisiere: Überfällig, Heute, Diese Woche
4. Sende tägliche Task-Übersicht per E-Mail

```javascript
const tasks = await loadTasksFromSheet();
const now = new Date();

const categorized = {
  overdue: tasks.filter(t => new Date(t.deadline) < now && t.status !== 'completed'),
  today: tasks.filter(t => isToday(new Date(t.deadline))),
  this_week: tasks.filter(t => isThisWeek(new Date(t.deadline))),
  no_deadline: tasks.filter(t => !t.deadline && t.status === 'pending')
};

// Generate daily digest email
const digest = await generateTaskDigest(categorized);

// Send email
await sendEmail({
  to: $json.user_email,
  subject: `📋 Deine Aufgaben für ${formatDate(now)}`,
  body: digest
});
```

### 4. Auto-Response System

#### 4.1 Out of Office (`70_ooo_handler`)

**Type:** Code + Email
**Purpose:** Automatische Abwesenheitsnotiz

```javascript
// Check if user is out of office
const oooConfig = await loadOOOConfig($json.user_id);

if (oooConfig.enabled && isWithinOOOPeriod(oooConfig)) {

  // Generate OOO response
  const response = `
Vielen Dank für Ihre E-Mail.

Ich bin vom ${formatDate(oooConfig.start)} bis ${formatDate(oooConfig.end)}
nicht im Büro und habe keinen Zugriff auf meine E-Mails.

${oooConfig.custom_message || ''}

In dringenden Fällen wenden Sie sich bitte an:
${oooConfig.backup_contact || 'info@company.com'}

Ich melde mich nach meiner Rückkehr bei Ihnen.

Beste Grüße
${$json.user_name}
  `;

  // Send auto-reply
  await sendEmail({
    to: $json.from,
    subject: `Re: ${$json.subject}`,
    body: response,
    threadId: $json.thread_id
  });

  // Mark email for follow-up after return
  await createFollowUpTask({
    email_id: $json.email_id,
    due_date: addDays(oooConfig.end, 1),
    priority: 'high'
  });
}
```

#### 4.2 FAQ Auto-Response (`75_faq_handler`)

**Type:** OpenAI with RAG
**Purpose:** Beantworte häufige Fragen automatisch

```javascript
// Load FAQ database from vector store
const faqContext = await retrieveFAQs($json.question);

// Generate response with GPT-4
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [
    {
      role: 'system',
      content: `Du bist ein hilfreicher Assistent. Beantworte Fragen basierend auf den FAQs.

FAQ Kontext:
${faqContext}

Wenn die Antwort nicht in den FAQs ist, sage dass du die Anfrage weiterleitest.`
    },
    {
      role: 'user',
      content: $json.body
    }
  ]
});

// Check confidence
if (response.confidence > 0.8) {
  // Send automatic response
  await sendEmail({
    to: $json.from,
    subject: `Re: ${$json.subject}`,
    body: response.answer
  });
} else {
  // Forward to human
  await createTask({
    title: `Manual review needed: ${$json.subject}`,
    priority: 'high'
  });
}
```

### 5. Intelligente Dokumenten-Organisation

#### 5.1 Email Attachment Handler (`80_process_attachments`)

**Type:** Gmail + Google Drive

```javascript
const attachments = $json.email_attachments;

for (const attachment of attachments) {
  // Classify document type
  const classification = await classifyDocument(attachment);

  // Determine folder
  const folder = determineFolderByType(classification.type, classification.category);

  // Save to Google Drive
  const file = await GoogleDrive.createFile({
    name: attachment.filename,
    parents: [folder.id],
    mimeType: attachment.mimeType,
    data: attachment.data
  });

  // Create metadata
  await GoogleDrive.updateMetadata(file.id, {
    description: classification.summary,
    properties: {
      source_email: $json.email_id,
      received_date: $json.timestamp,
      sender: $json.from,
      category: classification.category,
      tags: classification.tags.join(',')
    }
  });

  // Log to tracking sheet
  await logDocumentReceived({
    file_id: file.id,
    filename: attachment.filename,
    category: classification.category,
    source: 'email',
    processed_date: new Date().toISOString()
  });
}
```

### 6. Kontakt-Management & CRM

#### 6.1 Contact Enrichment (`85_enrich_contact`)

**Type:** Code + External APIs
**Purpose:** Reichere Kontaktdaten an

```javascript
const contact = {
  email: $json.from,
  name: extractName($json.from_name)
};

// Enrich with Hunter.io
const hunterData = await hunter.emailFinder(contact.email);
if (hunterData) {
  contact.company = hunterData.company;
  contact.position = hunterData.position;
  contact.linkedin = hunterData.linkedin;
}

// Check if contact exists in CRM
const existingContact = await findContactInSheet(contact.email);

if (existingContact) {
  // Update interaction history
  await updateContactInteraction({
    email: contact.email,
    last_contact: new Date().toISOString(),
    interaction_type: $json.classification.category,
    sentiment: $json.classification.sentiment
  });
} else {
  // Create new contact
  await createContact({
    ...contact,
    first_contact: new Date().toISOString(),
    source: 'email',
    tags: [$json.classification.category]
  });
}
```

#### 6.2 Relationship Tracking (`90_track_relationship`)

**Type:** Code Node
**Purpose:** Tracke Beziehungsqualität

```javascript
// Calculate relationship score
function calculateRelationshipScore(contact) {
  let score = 0;

  // Frequency of interaction
  const daysSinceLastContact = daysBetween(contact.last_contact, new Date());
  if (daysSinceLastContact < 7) score += 30;
  else if (daysSinceLastContact < 30) score += 20;
  else if (daysSinceLastContact < 90) score += 10;

  // Sentiment history
  const avgSentiment = calculateAverageSentiment(contact.interactions);
  if (avgSentiment > 0.7) score += 30;
  else if (avgSentiment > 0.4) score += 20;
  else score += 10;

  // Response rate
  if (contact.response_rate > 0.8) score += 20;
  else if (contact.response_rate > 0.5) score += 10;

  // Deal value (if applicable)
  if (contact.total_deal_value > 100000) score += 20;
  else if (contact.total_deal_value > 50000) score += 10;

  return Math.min(100, score);
}

// Update relationship status
const score = calculateRelationshipScore(contact);
const status = score >= 70 ? 'strong' : score >= 40 ? 'active' : 'weak';

await updateContact({
  email: contact.email,
  relationship_score: score,
  relationship_status: status
});

// Trigger nurture campaign if relationship is weak
if (status === 'weak' && daysSinceLastContact > 60) {
  await triggerNurtureCampaign(contact);
}
```

### 7. Smart Notifications

#### 7.1 Notification Aggregator (`95_aggregate_notifications`)

**Type:** Schedule Trigger (Hourly)
**Purpose:** Fasse Benachrichtigungen zusammen

```javascript
// Collect events from last hour
const events = {
  urgent_emails: await getUrgentEmails(),
  upcoming_meetings: await getUpcomingMeetings(60), // next 60 min
  overdue_tasks: await getOverdueTasks(),
  new_leads: await getNewLeads(),
  calendar_conflicts: await getConflicts()
};

// Determine if notification is needed
const needsNotification =
  events.urgent_emails.length > 0 ||
  events.upcoming_meetings.length > 0 ||
  events.overdue_tasks.length > 0;

if (needsNotification) {
  // Send smart notification
  await sendNotification({
    channel: $json.preferred_channel, // email, slack, teams
    summary: generateSummary(events),
    priority: determinePriority(events)
  });
}
```

## Konfiguration

### Environment Variables

```env
# Google Services
GOOGLE_SERVICE_ACCOUNT_EMAIL=assistant@project.iam.gserviceaccount.com
GOOGLE_CALENDAR_ID=primary
GOOGLE_DRIVE_FOLDER_ID=folder_id_here

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# Email Configuration
GMAIL_USER_EMAIL=user@company.com
EMAIL_SIGNATURE="Best regards,\nYour Name\nCompany"
EMAIL_TONE=professional_friendly

# Personal Assistant Settings
PA_AUTO_RESPONSE_ENABLED=true
PA_MIN_CONFIDENCE_AUTO_SEND=0.85
PA_WORKING_HOURS_START=9
PA_WORKING_HOURS_END=17
PA_TIMEZONE=Europe/Berlin

# Notification Channels
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...

# External Services
HUNTER_API_KEY=your_hunter_key
```

### Customer Configuration

```json
{
  "user_id": "USER_001",
  "user_name": "Max Mustermann",
  "user_email": "max@company.com",
  "preferences": {
    "email_tone": "professional_friendly",
    "auto_response_threshold": 0.85,
    "working_hours": {
      "start": 9,
      "end": 17,
      "timezone": "Europe/Berlin"
    },
    "notification_preferences": {
      "urgent_emails": "immediate",
      "meeting_reminders": "15min_before",
      "daily_summary": "8am",
      "channels": ["email", "slack"]
    },
    "calendar_preferences": {
      "default_meeting_duration": 30,
      "buffer_between_meetings": 15,
      "no_meetings_before": "9:00",
      "no_meetings_after": "17:00",
      "preferred_meeting_days": ["Tuesday", "Wednesday", "Thursday"]
    },
    "email_rules": {
      "auto_archive_categories": ["newsletter", "promotions"],
      "priority_senders": ["boss@company.com", "client@important.com"],
      "auto_forward_to": {
        "urgent_while_ooo": "deputy@company.com"
      }
    }
  },
  "integrations": {
    "calendar": "google_calendar",
    "email": "gmail",
    "tasks": "google_sheets",
    "storage": "google_drive",
    "crm": "google_sheets"
  }
}
```

## Testing

### Test 1: Email Auto-Response
```bash
# Send test email to user
# Expected: Classification, draft response, appropriate action
```

### Test 2: Meeting Scheduling
```bash
POST /webhook/personal-assistant/schedule
{
  "attendee_email": "client@example.com",
  "meeting_title": "Product Demo",
  "duration": 60,
  "preferred_times": ["morning"]
}
# Expected: Available slots, calendar event created, confirmation email sent
```

### Test 3: Task Extraction
```bash
# Send email with tasks
# Expected: Tasks extracted, added to task list, confirmation sent
```

## Deployment Checklist

- [ ] Google Calendar API enabled
- [ ] Gmail API configured
- [ ] Google Drive API setup
- [ ] OpenAI API key configured
- [ ] Service account created with proper permissions
- [ ] Test email account setup
- [ ] Notification channels configured
- [ ] User preferences loaded
- [ ] FAQ database populated
- [ ] Test all workflows end-to-end

## Monitoring

Track these metrics:
- Emails processed per day
- Auto-response success rate
- Meeting scheduling success rate
- Task completion rate
- User satisfaction score
- Response time (draft generation)

---

**Version:** 2025.10.2
**Platform:** n8n + WIES.AI
**Status:** Ready for Deployment
