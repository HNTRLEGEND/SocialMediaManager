import { Phone, TrendingUp, Headphones, Bot, Target, Users } from 'lucide-react'

export const workflowsDE = [
  {
    id: 'voice-agent',
    icon: Phone,
    title: 'AI Voice Agent',
    subtitle: '24/7 Telefon-Automatisierung',
    description: 'Nie wieder verpasste Anrufe. Ihr KI Agent nimmt Anrufe entgegen, bucht Termine und qualifiziert Leads - rund um die Uhr.',
    problem: 'Sie verlieren täglich 20-30 Anrufe, weil Ihre Mitarbeiter beschäftigt sind oder Feierabend haben. Das sind 70.000€+ entgangener Umsatz pro Jahr!',
    solution: 'Unser AI Voice Agent nimmt JEDEN Anruf entgegen - 24/7, auch nachts und am Wochenende. Automatische Terminbuchung, Lead-Qualifizierung und CRM-Integration inklusive.',
    roi: {
      before: { label: 'VORHER', value: '30', pain: 'Verpasste Anrufe pro Tag' },
      after: { label: 'NACHHER', value: '0', gain: '100% Anrufannahme garantiert' },
      savings: { value: '€71,000', period: '/Jahr' },
      timeSavings: { value: '20h', period: '/Woche' }
    },
    features: [
      'Automatische Terminbuchung in Ihrem Kalender',
      'Intelligente Lead-Qualifizierung in Echtzeit',
      'Mehrsprachig (DE, EN, FR, ES, TR)',
      'Nahtlose CRM-Integration (HubSpot, Salesforce, etc.)',
      'SMS & E-Mail Bestätigungen automatisch',
      '99,9% Verfügbarkeit - niemals krank oder im Urlaub'
    ],
    testimonial: {
      quote: 'In den ersten 3 Monaten haben wir 35% mehr Termine vergeben - ohne zusätzliches Personal. Der ROI war unfassbar!',
      author: 'Dr. Sarah Müller',
      role: 'Fachärztin',
      company: 'Praxis Dr. Müller, Münster',
      result: '+35%'
    },
    color: 'electric' as const,
    urgency: '🔥 Nur noch 3 Setup-Slots diese Woche verfügbar!'
  },
  {
    id: 'sales-agent',
    icon: TrendingUp,
    title: 'Sales Agent Workflow',
    subtitle: 'Automatisierter Verkaufsprozess',
    description: 'Von der Lead-Qualifizierung bis zum Abschluss. Automatisierte Follow-ups, intelligente Angebotsvorlagen und Pipeline-Management.',
    problem: 'Ihr Sales-Team verbringt 60% der Zeit mit Admin-Arbeit statt zu verkaufen. Follow-ups werden vergessen, Deals gehen verloren.',
    solution: 'Der Sales Agent automatisiert den gesamten Verkaufsprozess: Lead-Scoring, personalisierte Follow-ups, Angebotserstellung und Deal-Tracking - alles automatisch.',
    roi: {
      before: { label: 'VORHER', value: '45', pain: 'Tage bis zum Abschluss' },
      after: { label: 'NACHHER', value: '28', gain: '38% schnellerer Sales Cycle' },
      savings: { value: '€48,000', period: '/Jahr' },
      timeSavings: { value: '25h', period: '/Woche' }
    },
    features: [
      'Automatisches Lead-Scoring & Priorisierung',
      'Personalisierte Follow-up Sequenzen',
      'Intelligente Angebotserstellung',
      'Upselling & Cross-Selling Vorschläge',
      'Pipeline-Tracking & Forecasting',
      'Integration mit allen gängigen CRMs'
    ],
    testimonial: {
      quote: 'Unser Team macht 40% mehr Umsatz mit der gleichen Anzahl an Mitarbeitern. Der Sales Agent ist wie 3 zusätzliche SDRs.',
      author: 'Thomas Krause',
      role: 'Vertriebsleiter',
      company: 'TechSolutions GmbH',
      result: '+40%'
    },
    color: 'neon' as const,
    urgency: '⚡ 10X Ihren Sales-Prozess - Starten Sie JETZT!'
  },
  {
    id: 'service-agent',
    icon: Headphones,
    title: 'Service Agent Workflow',
    subtitle: 'Intelligenter Kundensupport',
    description: 'Support-Tickets automatisch bearbeiten, FAQ beantworten und komplexe Anfragen an Ihr Team weiterleiten - alles vollautomatisch.',
    problem: 'Ihr Support-Team ist überlastet mit wiederkehrenden Fragen. 80% der Tickets könnten automatisiert werden, aber Sie haben keine Zeit das aufzusetzen.',
    solution: 'Der Service Agent beantwortet 85% aller Tickets automatisch, routet komplexe Fälle intelligent und integriert sich nahtlos in Ihre Wissensdatenbank.',
    roi: {
      before: { label: 'VORHER', value: '€5,000', pain: 'Support-Kosten pro Monat' },
      after: { label: 'NACHHER', value: '€2,000', gain: '60% Kostenreduktion' },
      savings: { value: '€36,000', period: '/Jahr' },
      timeSavings: { value: '30h', period: '/Woche' }
    },
    features: [
      '85%+ Ticket-Automatisierung',
      'Intelligentes Routing nach Priorität',
      'Wissensdatenbank-Integration',
      'Automatisches Eskalations-Management',
      'Multi-Channel Support (E-Mail, Chat, Telefon)',
      'Kundenzufriedenheits-Tracking'
    ],
    testimonial: {
      quote: 'Unser Team kümmert sich nur noch um die wirklich komplexen Fälle. Die Kundenzufriedenheit ist gestiegen, die Kosten um 60% gesunken.',
      author: 'Markus Schröder',
      role: 'IT-Leiter',
      company: 'HandelsPro AG',
      result: '-60%'
    },
    color: 'gold' as const,
    urgency: '💰 Senken Sie Support-Kosten um 60% - JETZT starten!'
  },
  {
    id: 'technical-agent',
    icon: Bot,
    title: 'Technical Agent Workflow',
    subtitle: 'Technisches Ticket-Management',
    description: 'Technische Anfragen automatisch kategorisieren, priorisieren und an die richtigen Experten weiterleiten mit intelligenter Vorqualifizierung.',
    problem: 'Technische Tickets landen beim falschen Team, wichtige Issues werden übersehen, und Ihr Tech-Team verbringt Stunden mit Triage statt mit Lösungen.',
    solution: 'Der Technical Agent kategorisiert, priorisiert und routet alle technischen Anfragen automatisch. Mit SLA-Überwachung und intelligenter Eskalation.',
    roi: {
      before: { label: 'VORHER', value: '4h', pain: 'Durchschn. Ticket-Bearbeitungszeit' },
      after: { label: 'NACHHER', value: '45min', gain: '81% schnellere Resolution' },
      savings: { value: '€42,000', period: '/Jahr' },
      timeSavings: { value: '35h', period: '/Woche' }
    },
    features: [
      'Automatische Ticket-Kategorisierung',
      'Prioritäts-Bewertung nach Kritikalität',
      'Intelligentes Fachbereichs-Routing',
      'SLA-Überwachung & Eskalation',
      'Technische Dokumentation automatisch',
      'Integration mit Jira, ServiceNow, etc.'
    ],
    testimonial: {
      quote: 'Kritische Issues werden jetzt sofort erkannt und priorisiert. Unser Tech-Team kann sich auf echte Problemlösung konzentrieren.',
      author: 'Julia Weber',
      role: 'CTO',
      company: 'DevOps Solutions GmbH',
      result: '-81%'
    },
    color: 'purple' as const,
    urgency: '⚡ 10X Ihre Tech-Support-Effizienz - Buchen Sie JETZT!'
  },
  {
    id: 'lead-generator',
    icon: Target,
    title: 'Lead Generator Workflow',
    subtitle: 'Automatische Lead-Generierung',
    description: 'Identifizieren, qualifizieren und kontaktieren Sie potenzielle Kunden automatisch - während Sie schlafen.',
    problem: 'Manuelle Lead-Generierung kostet Zeit und Geld. Ihr Team kann nur 50 Leads pro Woche manuell bearbeiten - das Potenzial ist 10X größer!',
    solution: 'Der Lead Generator findet, qualifiziert und kontaktiert automatisch 500+ Leads pro Woche. Mit personalisierten Ansprachen und automatischem Follow-up.',
    roi: {
      before: { label: 'VORHER', value: '50', pain: 'Qualifizierte Leads pro Woche' },
      after: { label: 'NACHHER', value: '500+', gain: '10X mehr qualifizierte Leads' },
      savings: { value: '€85,000', period: '/Jahr' },
      timeSavings: { value: '40h', period: '/Woche' }
    },
    features: [
      'Automatische Lead-Identifikation aus multiplen Quellen',
      'AI-gestütztes Lead-Scoring',
      'Personalisierte Outreach-Kampagnen',
      'Automatisches Multi-Channel Follow-up',
      'A/B Testing & Optimierung',
      'Direkte CRM-Synchronisation'
    ],
    testimonial: {
      quote: 'Wir generieren jetzt 10X mehr qualifizierte Leads als vorher - komplett automatisiert. Unser Sales-Team kann sich auf Abschlüsse konzentrieren.',
      author: 'Michael Weber',
      role: 'Geschäftsführer',
      company: 'Weber Metallbau GmbH',
      result: '+10X'
    },
    color: 'electric' as const,
    urgency: '🚀 10X Ihre Lead-Pipeline - Nur noch 2 Slots verfügbar!'
  },
  {
    id: 'lead-manager',
    icon: Users,
    title: 'Lead Manager Workflow',
    subtitle: 'Intelligentes Lead-Management',
    description: 'Organisieren, priorisieren und pflegen Sie Ihre Leads automatisch mit AI-gestützten Insights und Empfehlungen.',
    problem: 'Leads werden nicht nachverfolgt, fallen durch die Ritzen oder werden zu spät kontaktiert. Sie verlieren 40% potenzielle Deals durch schlechtes Lead-Management.',
    solution: 'Der Lead Manager organisiert alle Leads automatisch, erinnert an Follow-ups, priorisiert nach Conversion-Wahrscheinlichkeit und gibt konkrete Handlungsempfehlungen.',
    roi: {
      before: { label: 'VORHER', value: '15%', pain: 'Lead-to-Customer Rate' },
      after: { label: 'NACHHER', value: '35%', gain: '+133% mehr Conversions' },
      savings: { value: '€95,000', period: '/Jahr' },
      timeSavings: { value: '30h', period: '/Woche' }
    },
    features: [
      'Automatische Lead-Segmentierung',
      'Conversion-Wahrscheinlichkeit Scoring',
      'Intelligente Follow-up Erinnerungen',
      'Behavioral Tracking & Insights',
      'Nurturing-Kampagnen automatisch',
      'Performance Analytics & Reporting'
    ],
    testimonial: {
      quote: 'Unsere Conversion-Rate hat sich mehr als verdoppelt. Der Lead Manager sagt uns genau, wann und wie wir jeden Lead kontaktieren sollten.',
      author: 'Lisa Hoffmann',
      role: 'Sales Director',
      company: 'Premium Services AG',
      result: '+133%'
    },
    color: 'neon' as const,
    urgency: '💎 Verdoppeln Sie Ihre Conversion-Rate - JETZT Demo buchen!'
  }
]

// English version
export const workflowsEN = [
  {
    id: 'voice-agent',
    icon: Phone,
    title: 'AI Voice Agent',
    subtitle: '24/7 Phone Automation',
    description: 'Never miss a call again. Your AI agent answers calls, books appointments and qualifies leads - around the clock.',
    problem: 'You lose 20-30 calls daily because your team is busy or off-duty. That\'s €70,000+ in lost revenue per year!',
    solution: 'Our AI Voice Agent answers EVERY call - 24/7, even at night and on weekends. Automatic appointment booking, lead qualification and CRM integration included.',
    roi: {
      before: { label: 'BEFORE', value: '30', pain: 'Missed calls per day' },
      after: { label: 'AFTER', value: '0', gain: '100% call answer rate guaranteed' },
      savings: { value: '€71,000', period: '/year' },
      timeSavings: { value: '20h', period: '/week' }
    },
    features: [
      'Automatic appointment booking in your calendar',
      'Intelligent real-time lead qualification',
      'Multilingual (EN, DE, FR, ES, TR)',
      'Seamless CRM integration (HubSpot, Salesforce, etc.)',
      'Automatic SMS & email confirmations',
      '99.9% availability - never sick or on vacation'
    ],
    testimonial: {
      quote: 'In the first 3 months, we scheduled 35% more appointments - without additional staff. The ROI was incredible!',
      author: 'Dr. Sarah Miller',
      role: 'Physician',
      company: 'Dr. Miller Practice, Münster',
      result: '+35%'
    },
    color: 'electric' as const,
    urgency: '🔥 Only 3 setup slots left this week!'
  },
  {
    id: 'sales-agent',
    icon: TrendingUp,
    title: 'Sales Agent Workflow',
    subtitle: 'Automated Sales Process',
    description: 'From lead qualification to closing. Automated follow-ups, intelligent quote templates and pipeline management.',
    problem: 'Your sales team spends 60% of their time on admin work instead of selling. Follow-ups get forgotten, deals get lost.',
    solution: 'The Sales Agent automates the entire sales process: lead scoring, personalized follow-ups, quote creation and deal tracking - all automatic.',
    roi: {
      before: { label: 'BEFORE', value: '45', pain: 'Days to close' },
      after: { label: 'AFTER', value: '28', gain: '38% faster sales cycle' },
      savings: { value: '€48,000', period: '/year' },
      timeSavings: { value: '25h', period: '/week' }
    },
    features: [
      'Automatic lead scoring & prioritization',
      'Personalized follow-up sequences',
      'Intelligent quote generation',
      'Upselling & cross-selling suggestions',
      'Pipeline tracking & forecasting',
      'Integration with all major CRMs'
    ],
    testimonial: {
      quote: 'Our team generates 40% more revenue with the same number of people. The Sales Agent is like 3 additional SDRs.',
      author: 'Thomas Krause',
      role: 'Sales Director',
      company: 'TechSolutions GmbH',
      result: '+40%'
    },
    color: 'neon' as const,
    urgency: '⚡ 10X your sales process - Start NOW!'
  },
  {
    id: 'service-agent',
    icon: Headphones,
    title: 'Service Agent Workflow',
    subtitle: 'Intelligent Customer Support',
    description: 'Automatically process support tickets, answer FAQs and route complex requests to your team - fully automated.',
    problem: 'Your support team is overwhelmed with recurring questions. 80% of tickets could be automated, but you don\'t have time to set it up.',
    solution: 'The Service Agent answers 85% of all tickets automatically, intelligently routes complex cases and seamlessly integrates with your knowledge base.',
    roi: {
      before: { label: 'BEFORE', value: '€5,000', pain: 'Support costs per month' },
      after: { label: 'AFTER', value: '€2,000', gain: '60% cost reduction' },
      savings: { value: '€36,000', period: '/year' },
      timeSavings: { value: '30h', period: '/week' }
    },
    features: [
      '85%+ ticket automation',
      'Intelligent routing by priority',
      'Knowledge base integration',
      'Automatic escalation management',
      'Multi-channel support (email, chat, phone)',
      'Customer satisfaction tracking'
    ],
    testimonial: {
      quote: 'Our team only handles truly complex cases now. Customer satisfaction has increased, costs dropped by 60%.',
      author: 'Markus Schröder',
      role: 'IT Manager',
      company: 'HandelsPro AG',
      result: '-60%'
    },
    color: 'gold' as const,
    urgency: '💰 Reduce support costs by 60% - Start NOW!'
  },
  {
    id: 'technical-agent',
    icon: Bot,
    title: 'Technical Agent Workflow',
    subtitle: 'Technical Ticket Management',
    description: 'Automatically categorize, prioritize and route technical requests to the right experts with intelligent pre-qualification.',
    problem: 'Technical tickets land with the wrong team, important issues get overlooked, and your tech team spends hours on triage instead of solutions.',
    solution: 'The Technical Agent categorizes, prioritizes and routes all technical requests automatically. With SLA monitoring and intelligent escalation.',
    roi: {
      before: { label: 'BEFORE', value: '4h', pain: 'Avg. ticket processing time' },
      after: { label: 'AFTER', value: '45min', gain: '81% faster resolution' },
      savings: { value: '€42,000', period: '/year' },
      timeSavings: { value: '35h', period: '/week' }
    },
    features: [
      'Automatic ticket categorization',
      'Priority assessment by criticality',
      'Intelligent department routing',
      'SLA monitoring & escalation',
      'Technical documentation automated',
      'Integration with Jira, ServiceNow, etc.'
    ],
    testimonial: {
      quote: 'Critical issues are now immediately recognized and prioritized. Our tech team can focus on actual problem-solving.',
      author: 'Julia Weber',
      role: 'CTO',
      company: 'DevOps Solutions GmbH',
      result: '-81%'
    },
    color: 'purple' as const,
    urgency: '⚡ 10X your tech support efficiency - Book NOW!'
  },
  {
    id: 'lead-generator',
    icon: Target,
    title: 'Lead Generator Workflow',
    subtitle: 'Automatic Lead Generation',
    description: 'Identify, qualify and contact potential customers automatically - while you sleep.',
    problem: 'Manual lead generation costs time and money. Your team can only handle 50 leads per week manually - the potential is 10X greater!',
    solution: 'The Lead Generator finds, qualifies and contacts 500+ leads per week automatically. With personalized approaches and automatic follow-up.',
    roi: {
      before: { label: 'BEFORE', value: '50', pain: 'Qualified leads per week' },
      after: { label: 'AFTER', value: '500+', gain: '10X more qualified leads' },
      savings: { value: '€85,000', period: '/year' },
      timeSavings: { value: '40h', period: '/week' }
    },
    features: [
      'Automatic lead identification from multiple sources',
      'AI-powered lead scoring',
      'Personalized outreach campaigns',
      'Automatic multi-channel follow-up',
      'A/B testing & optimization',
      'Direct CRM synchronization'
    ],
    testimonial: {
      quote: 'We now generate 10X more qualified leads than before - completely automated. Our sales team can focus on closing.',
      author: 'Michael Weber',
      role: 'Managing Director',
      company: 'Weber Metal Construction GmbH',
      result: '+10X'
    },
    color: 'electric' as const,
    urgency: '🚀 10X your lead pipeline - Only 2 slots left!'
  },
  {
    id: 'lead-manager',
    icon: Users,
    title: 'Lead Manager Workflow',
    subtitle: 'Intelligent Lead Management',
    description: 'Organize, prioritize and nurture your leads automatically with AI-powered insights and recommendations.',
    problem: 'Leads don\'t get followed up, fall through the cracks or get contacted too late. You lose 40% of potential deals due to poor lead management.',
    solution: 'The Lead Manager organizes all leads automatically, reminds you of follow-ups, prioritizes by conversion probability and gives concrete action recommendations.',
    roi: {
      before: { label: 'BEFORE', value: '15%', pain: 'Lead-to-customer rate' },
      after: { label: 'AFTER', value: '35%', gain: '+133% more conversions' },
      savings: { value: '€95,000', period: '/year' },
      timeSavings: { value: '30h', period: '/week' }
    },
    features: [
      'Automatic lead segmentation',
      'Conversion probability scoring',
      'Intelligent follow-up reminders',
      'Behavioral tracking & insights',
      'Nurturing campaigns automated',
      'Performance analytics & reporting'
    ],
    testimonial: {
      quote: 'Our conversion rate has more than doubled. The Lead Manager tells us exactly when and how to contact each lead.',
      author: 'Lisa Hoffmann',
      role: 'Sales Director',
      company: 'Premium Services AG',
      result: '+133%'
    },
    color: 'neon' as const,
    urgency: '💎 Double your conversion rate - Book demo NOW!'
  }
]
