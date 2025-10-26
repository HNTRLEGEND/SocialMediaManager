/**
 * WiesLogic Personal Assistant Helper Modules
 * Version: 2025.10.2
 *
 * Helper functions for AI Personal Assistant workflows
 */

/**
 * Email Classification and Processing
 */
class EmailProcessor {
  constructor(openAIApiKey) {
    this.apiKey = openAIApiKey;
  }

  /**
   * Classify email content
   */
  async classifyEmail(emailData) {
    const { from, subject, body, timestamp } = emailData;

    const prompt = `
Analysiere diese E-Mail und klassifiziere sie:

Von: ${from}
Betreff: ${subject}
Inhalt: ${body.substring(0, 1000)}

Gib zurück (JSON):
{
  "category": "meeting_request|question|urgent|info|task|sales|support|complaint",
  "priority": "urgent|high|normal|low",
  "action": "respond_immediately|schedule_meeting|create_task|archive|forward",
  "sentiment": "positive|neutral|negative|frustrated",
  "requires_response": true/false,
  "deadline": "ISO date or null",
  "key_points": ["punkt1", "punkt2"],
  "suggested_response_type": "detailed|brief|acknowledgment"
}`;

    // Call OpenAI (simplified - implement actual API call)
    const classification = await this.callOpenAI(prompt);

    return {
      ...classification,
      confidence: this.calculateConfidence(classification),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate email response
   */
  async generateResponse(emailData, classification, userPreferences) {
    const tone = userPreferences.email_tone || 'professional_friendly';
    const signature = userPreferences.email_signature || '';

    const prompt = `
Du bist der persönliche Assistent von ${userPreferences.user_name}.

Ursprüngliche E-Mail:
Von: ${emailData.from}
Betreff: ${emailData.subject}
Inhalt: ${emailData.body}

Klassifikation:
${JSON.stringify(classification, null, 2)}

Erstelle eine ${this.getToneDescription(tone)} E-Mail-Antwort.

Richtlinien:
- Sprache: ${this.detectLanguage(emailData.body)}
- Ton: ${tone}
- Beantworte alle Fragen direkt
- Bei Meeting-Anfragen: Schlage konkrete Zeiten vor
- Sei präzise aber freundlich
- Verwende Signatur: ${signature}

Antworte im JSON-Format:
{
  "subject": "Re: ...",
  "body": "HTML formatted email body",
  "action": "send_immediately|save_as_draft|needs_review",
  "confidence": 0.0-1.0
}`;

    const response = await this.callOpenAI(prompt);

    return {
      ...response,
      generated_at: new Date().toISOString(),
      based_on_classification: classification.category
    };
  }

  /**
   * Extract action items from email
   */
  extractActionItems(emailContent) {
    // Common action indicators
    const actionPatterns = [
      /bitte\s+(.+?)(?:\.|$)/gi,
      /könnten?\s+Sie\s+(.+?)(?:\.|$)/gi,
      /würden?\s+Sie\s+(.+?)(?:\.|$)/gi,
      /please\s+(.+?)(?:\.|$)/gi,
      /could\s+you\s+(.+?)(?:\.|$)/gi,
      /can\s+you\s+(.+?)(?:\.|$)/gi,
    ];

    const actions = [];
    actionPatterns.forEach(pattern => {
      const matches = [...emailContent.matchAll(pattern)];
      matches.forEach(match => {
        actions.push({
          text: match[1].trim(),
          type: 'request',
          priority: this.determinePriority(match[1])
        });
      });
    });

    return actions;
  }

  /**
   * Detect email language
   */
  detectLanguage(text) {
    const germanWords = ['und', 'der', 'die', 'das', 'ist', 'für', 'mit', 'auf'];
    const englishWords = ['and', 'the', 'is', 'for', 'with', 'on', 'in'];

    const lowerText = text.toLowerCase();
    const germanCount = germanWords.filter(word => lowerText.includes(word)).length;
    const englishCount = englishWords.filter(word => lowerText.includes(word)).length;

    return germanCount > englishCount ? 'de' : 'en';
  }

  getToneDescription(tone) {
    const tones = {
      'professional_friendly': 'professionelle und freundliche',
      'formal': 'formelle',
      'casual': 'lockere',
      'brief': 'kurze und prägnante'
    };
    return tones[tone] || 'professionelle';
  }

  calculateConfidence(classification) {
    // Simple confidence calculation based on classification certainty
    let confidence = 0.8;

    if (classification.category === 'urgent') confidence += 0.1;
    if (classification.key_points && classification.key_points.length > 0) confidence += 0.05;
    if (classification.deadline) confidence += 0.05;

    return Math.min(1.0, confidence);
  }

  determinePriority(text) {
    const urgentKeywords = ['urgent', 'asap', 'sofort', 'dringend', 'immediately'];
    const lowerText = text.toLowerCase();

    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'urgent';
    }
    return 'normal';
  }

  async callOpenAI(prompt) {
    // Placeholder - implement actual OpenAI API call
    return {}; // Return mock data for now
  }
}

/**
 * Calendar Management
 */
class CalendarManager {
  constructor(calendarId = 'primary') {
    this.calendarId = calendarId;
  }

  /**
   * Find available time slots
   */
  async findAvailableSlots(options) {
    const {
      duration = 60,           // minutes
      daysAhead = 14,
      preferredDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      preferredHours = [9, 10, 11, 14, 15, 16],
      bufferMinutes = 15,
      excludeWeekends = true
    } = options;

    // Get busy periods
    const busyPeriods = await this.getBusyPeriods(daysAhead);

    // Generate potential slots
    const slots = this.generatePotentialSlots({
      duration,
      daysAhead,
      preferredDays,
      preferredHours,
      excludeWeekends
    });

    // Filter out busy slots
    const availableSlots = slots.filter(slot => {
      return !this.hasConflict(slot, busyPeriods, bufferMinutes);
    });

    return availableSlots.slice(0, 10); // Return top 10 slots
  }

  generatePotentialSlots(options) {
    const { duration, daysAhead, preferredDays, preferredHours, excludeWeekends } = options;
    const slots = [];
    const now = new Date();

    for (let day = 0; day < daysAhead; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);

      // Skip weekends if needed
      if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }

      // Check if day is preferred
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (!preferredDays.includes(dayName)) {
        continue;
      }

      // Generate slots for preferred hours
      for (const hour of preferredHours) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);

        // Skip past times
        if (slotStart <= now) continue;

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        slots.push({
          start: slotStart,
          end: slotEnd,
          date: slotStart.toLocaleDateString('de-DE'),
          time: slotStart.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          dayOfWeek: dayName,
          duration: duration
        });
      }
    }

    return slots;
  }

  hasConflict(slot, busyPeriods, bufferMinutes = 0) {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    // Add buffer
    slotStart.setMinutes(slotStart.getMinutes() - bufferMinutes);
    slotEnd.setMinutes(slotEnd.getMinutes() + bufferMinutes);

    return busyPeriods.some(busy => {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);

      return slotStart < busyEnd && slotEnd > busyStart;
    });
  }

  async getBusyPeriods(daysAhead) {
    // Placeholder - implement actual Google Calendar API call
    return [];
  }

  /**
   * Check for meeting conflicts
   */
  checkConflicts(newEvent, existingEvents) {
    const conflicts = [];
    const newStart = new Date(newEvent.start);
    const newEnd = new Date(newEvent.end);

    for (const event of existingEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (newStart < eventEnd && newEnd > eventStart) {
        const overlapMinutes = this.calculateOverlap(newStart, newEnd, eventStart, eventEnd);

        conflicts.push({
          event_id: event.id,
          title: event.summary,
          start: event.start,
          end: event.end,
          overlap_minutes: overlapMinutes,
          severity: this.getConflictSeverity(overlapMinutes)
        });
      }
    }

    return {
      has_conflicts: conflicts.length > 0,
      conflict_count: conflicts.length,
      conflicts: conflicts,
      recommendation: conflicts.length > 0 ? 'reschedule_or_review' : 'proceed'
    };
  }

  calculateOverlap(start1, end1, start2, end2) {
    const overlapStart = Math.max(start1.getTime(), start2.getTime());
    const overlapEnd = Math.min(end1.getTime(), end2.getTime());
    return (overlapEnd - overlapStart) / (1000 * 60);
  }

  getConflictSeverity(overlapMinutes) {
    if (overlapMinutes >= 60) return 'critical';
    if (overlapMinutes >= 30) return 'high';
    if (overlapMinutes >= 15) return 'medium';
    return 'low';
  }

  /**
   * Format meeting invitation
   */
  formatMeetingInvitation(event, language = 'de') {
    const templates = {
      de: {
        subject: `Termin: ${event.title}`,
        body: `
Hallo,

ich möchte Sie zu folgendem Termin einladen:

📅 **Datum:** ${this.formatDate(event.start, 'de')}
🕐 **Uhrzeit:** ${this.formatTime(event.start, 'de')} - ${this.formatTime(event.end, 'de')}
⏱️ **Dauer:** ${event.duration} Minuten
${event.location ? `📍 **Ort:** ${event.location}` : ''}
${event.meetingLink ? `🔗 **Meeting-Link:** ${event.meetingLink}` : ''}

**Agenda:**
${event.agenda || 'Wird noch bekannt gegeben'}

Bitte bestätigen Sie Ihre Teilnahme.

Beste Grüße
`
      },
      en: {
        subject: `Meeting Invitation: ${event.title}`,
        body: `
Hello,

I would like to invite you to the following meeting:

📅 **Date:** ${this.formatDate(event.start, 'en')}
🕐 **Time:** ${this.formatTime(event.start, 'en')} - ${this.formatTime(event.end, 'en')}
⏱️ **Duration:** ${event.duration} minutes
${event.location ? `📍 **Location:** ${event.location}` : ''}
${event.meetingLink ? `🔗 **Meeting Link:** ${event.meetingLink}` : ''}

**Agenda:**
${event.agenda || 'To be announced'}

Please confirm your attendance.

Best regards
`
      }
    };

    return templates[language] || templates['en'];
  }

  formatDate(date, locale = 'de') {
    return new Date(date).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(date, locale = 'de') {
    return new Date(date).toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Task Management
 */
class TaskManager {
  constructor() {
    this.tasks = [];
  }

  /**
   * Extract tasks from text using NLP
   */
  async extractTasks(text, context = {}) {
    const tasks = [];

    // Task patterns
    const patterns = [
      /(?:bitte|please)\s+(.+?)(?:\.|$)/gi,
      /(?:task|aufgabe|todo):\s*(.+?)(?:\.|$)/gi,
      /(?:ich\s+(?:muss|sollte)|I\s+(?:need|should))\s+(.+?)(?:\.|$)/gi,
    ];

    patterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const taskText = match[1].trim();

        tasks.push({
          title: this.cleanTaskTitle(taskText),
          description: taskText,
          priority: this.inferPriority(taskText),
          deadline: this.extractDeadline(taskText),
          category: this.categorizeTask(taskText),
          estimated_time: this.estimateTime(taskText),
          source: context.source || 'manual',
          source_id: context.source_id || null,
          created_at: new Date().toISOString(),
          status: 'pending'
        });
      });
    });

    return tasks;
  }

  cleanTaskTitle(text) {
    // Remove common prefixes and clean up
    let cleaned = text
      .replace(/^(bitte|please|todo:|task:)\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit length
    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 97) + '...';
    }

    return cleaned;
  }

  inferPriority(text) {
    const urgentKeywords = ['urgent', 'asap', 'dringend', 'sofort', 'immediately', 'heute', 'today'];
    const highKeywords = ['wichtig', 'important', 'critical', 'kritisch'];

    const lowerText = text.toLowerCase();

    if (urgentKeywords.some(kw => lowerText.includes(kw))) return 'urgent';
    if (highKeywords.some(kw => lowerText.includes(kw))) return 'high';

    return 'normal';
  }

  extractDeadline(text) {
    // Simple deadline extraction
    const datePatterns = [
      /(?:bis|until|by)\s+(\d{1,2}[\.\/]\d{1,2}[\.\/]?\d{2,4})/i,
      /(?:morgen|tomorrow)/i,
      /(?:heute|today)/i,
      /(?:nächste\s+woche|next\s+week)/i,
    ];

    const lowerText = text.toLowerCase();

    if (/(?:morgen|tomorrow)/i.test(lowerText)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString();
    }

    if (/(?:heute|today)/i.test(lowerText)) {
      return new Date().toISOString();
    }

    if (/(?:nächste\s+woche|next\s+week)/i.test(lowerText)) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString();
    }

    return null;
  }

  categorizeTask(text) {
    const categories = {
      'meeting_prep': ['vorbereiten', 'prepare', 'meeting', 'präsentation', 'presentation'],
      'follow_up': ['follow up', 'nachfassen', 'reminder', 'erinnerung'],
      'research': ['recherche', 'research', 'analyse', 'analyze', 'prüfen', 'check'],
      'admin': ['buchen', 'book', 'bestellen', 'order', 'admin', 'dokumentieren'],
      'communication': ['anrufen', 'call', 'email', 'schreiben', 'write', 'kontakt'],
    };

    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        return category;
      }
    }

    return 'general';
  }

  estimateTime(text) {
    // Simple time estimation based on task complexity
    const lowerText = text.toLowerCase();
    const wordCount = text.split(' ').length;

    // Check for explicit time mentions
    const timeMatch = text.match(/(\d+)\s*(stunden?|hours?|minuten?|minutes?)/i);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      return unit.startsWith('stunde') || unit.startsWith('hour') ? value * 60 : value;
    }

    // Estimate based on keywords and length
    if (lowerText.includes('präsentation') || lowerText.includes('presentation')) return 120;
    if (lowerText.includes('recherche') || lowerText.includes('research')) return 90;
    if (lowerText.includes('email') || lowerText.includes('anrufen')) return 15;

    // Estimate by word count
    if (wordCount > 20) return 60;
    if (wordCount > 10) return 30;
    return 15;
  }

  /**
   * Generate daily task summary
   */
  generateDailyDigest(tasks) {
    const categorized = {
      overdue: tasks.filter(t => this.isOverdue(t)),
      today: tasks.filter(t => this.isToday(t)),
      this_week: tasks.filter(t => this.isThisWeek(t)),
      no_deadline: tasks.filter(t => !t.deadline && t.status === 'pending')
    };

    const totalEstimatedTime = tasks
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.estimated_time || 0), 0);

    return {
      summary: {
        total_pending: tasks.filter(t => t.status === 'pending').length,
        overdue: categorized.overdue.length,
        today: categorized.today.length,
        this_week: categorized.this_week.length,
        estimated_hours: Math.round(totalEstimatedTime / 60 * 10) / 10
      },
      tasks: categorized,
      recommendations: this.generateRecommendations(categorized)
    };
  }

  isOverdue(task) {
    if (!task.deadline) return false;
    return new Date(task.deadline) < new Date() && task.status !== 'completed';
  }

  isToday(task) {
    if (!task.deadline) return false;
    const today = new Date();
    const deadline = new Date(task.deadline);
    return today.toDateString() === deadline.toDateString();
  }

  isThisWeek(task) {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return deadline >= today && deadline <= weekFromNow;
  }

  generateRecommendations(categorized) {
    const recs = [];

    if (categorized.overdue.length > 0) {
      recs.push({
        type: 'warning',
        message: `Sie haben ${categorized.overdue.length} überfällige Aufgabe(n). Bitte priorisieren!`
      });
    }

    if (categorized.today.length > 5) {
      recs.push({
        type: 'info',
        message: `Heute sind ${categorized.today.length} Aufgaben fällig. Prüfen Sie Ihre Prioritäten.`
      });
    }

    if (categorized.no_deadline.length > 10) {
      recs.push({
        type: 'suggestion',
        message: `${categorized.no_deadline.length} Aufgaben haben keine Deadline. Fügen Sie Fristen hinzu.`
      });
    }

    return recs;
  }
}

/**
 * Contact & Relationship Manager
 */
class ContactManager {
  constructor() {
    this.contacts = new Map();
  }

  /**
   * Calculate relationship score
   */
  calculateRelationshipScore(contact) {
    let score = 0;

    // Recency (40 points max)
    const daysSinceLastContact = this.daysSince(contact.last_interaction);
    if (daysSinceLastContact < 7) score += 40;
    else if (daysSinceLastContact < 30) score += 30;
    else if (daysSinceLastContact < 90) score += 20;
    else if (daysSinceLastContact < 180) score += 10;

    // Sentiment (30 points max)
    const avgSentiment = this.calculateAverageSentiment(contact.interactions || []);
    score += Math.round(avgSentiment * 30);

    // Frequency (20 points max)
    const interactionCount = (contact.interactions || []).length;
    if (interactionCount >= 20) score += 20;
    else if (interactionCount >= 10) score += 15;
    else if (interactionCount >= 5) score += 10;
    else score += 5;

    // Response rate (10 points max)
    const responseRate = contact.response_rate || 0.5;
    score += Math.round(responseRate * 10);

    return Math.min(100, score);
  }

  calculateAverageSentiment(interactions) {
    if (!interactions || interactions.length === 0) return 0.5;

    const sentimentMap = {
      'positive': 1.0,
      'neutral': 0.5,
      'negative': 0.0,
      'frustrated': 0.0
    };

    const total = interactions.reduce((sum, interaction) => {
      return sum + (sentimentMap[interaction.sentiment] || 0.5);
    }, 0);

    return total / interactions.length;
  }

  daysSince(date) {
    if (!date) return Infinity;
    const now = new Date();
    const past = new Date(date);
    return Math.floor((now - past) / (1000 * 60 * 60 * 24));
  }

  /**
   * Determine relationship status
   */
  getRelationshipStatus(score) {
    if (score >= 70) return 'strong';
    if (score >= 40) return 'active';
    if (score >= 20) return 'weak';
    return 'at_risk';
  }

  /**
   * Recommend next action
   */
  recommendNextAction(contact) {
    const score = this.calculateRelationshipScore(contact);
    const status = this.getRelationshipStatus(score);
    const daysSinceLast = this.daysSince(contact.last_interaction);

    if (status === 'at_risk' || daysSinceLast > 90) {
      return {
        action: 'reach_out',
        priority: 'high',
        message: 'Lange kein Kontakt. Empfehle proaktive Kontaktaufnahme.',
        suggested_template: 'nurture_campaign'
      };
    }

    if (status === 'weak' && daysSinceLast > 60) {
      return {
        action: 'follow_up',
        priority: 'medium',
        message: 'Beziehung könnte gestärkt werden.',
        suggested_template: 'check_in'
      };
    }

    if (status === 'strong') {
      return {
        action: 'maintain',
        priority: 'low',
        message: 'Beziehung ist stark. Weiter pflegen.',
        suggested_template: 'value_add'
      };
    }

    return {
      action: 'monitor',
      priority: 'low',
      message: 'Beziehung ist aktiv.',
      suggested_template: null
    };
  }
}

/**
 * Export modules
 */
module.exports = {
  EmailProcessor,
  CalendarManager,
  TaskManager,
  ContactManager
};

/**
 * Usage examples for n8n:
 *
 * // Email Processing
 * const { EmailProcessor } = require('./personal-assistant-helpers.js');
 * const processor = new EmailProcessor(process.env.OPENAI_API_KEY);
 *
 * const classification = await processor.classifyEmail({
 *   from: 'client@example.com',
 *   subject: 'Meeting Request',
 *   body: 'Can we schedule a call next week?'
 * });
 *
 * const response = await processor.generateResponse(emailData, classification, userPrefs);
 *
 * // Calendar Management
 * const { CalendarManager } = require('./personal-assistant-helpers.js');
 * const calendar = new CalendarManager();
 *
 * const slots = await calendar.findAvailableSlots({
 *   duration: 60,
 *   daysAhead: 14,
 *   preferredDays: ['Tuesday', 'Wednesday', 'Thursday']
 * });
 *
 * // Task Management
 * const { TaskManager } = require('./personal-assistant-helpers.js');
 * const taskMgr = new TaskManager();
 *
 * const tasks = await taskMgr.extractTasks(emailBody, { source: 'email', source_id: emailId });
 * const digest = taskMgr.generateDailyDigest(allTasks);
 *
 * // Contact Management
 * const { ContactManager } = require('./personal-assistant-helpers.js');
 * const contactMgr = new ContactManager();
 *
 * const score = contactMgr.calculateRelationshipScore(contact);
 * const nextAction = contactMgr.recommendNextAction(contact);
 */
