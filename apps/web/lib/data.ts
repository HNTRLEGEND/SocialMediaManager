export const services = [
  {
    title: 'KI-Potenzialanalyse',
    description:
      'Wir identifizieren, welche Prozesse sich lohnen zu automatisieren und liefern eine priorisierte Roadmap inklusive Business Case.',
    metric: 'Analyse in 14 Tagen'
  },
  {
    title: 'KI-Prozessautomation',
    description:
      'Von der Idee zum intelligenten Workflow – mit n8n, OpenAI und Ihren Systemen bauen wir belastbare Automationen inklusive Governance.',
    metric: '60% Zeitersparnis'
  },
  {
    title: 'AI Voice Agents',
    description:
      'Automatisierte Kundenkommunikation mit ElevenLabs-Voices, Realtime-GPT und Guardrails – mehrsprachig, DSGVO-konform und integriert.',
    metric: '24/7 Verfügbarkeit'
  },
  {
    title: 'Beratung & Strategie',
    description:
      'Wir begleiten Sie bei der Einführung, Skalierung und Governance Ihrer KI-Systeme – mit Change-Enablement und Trainings.',
    metric: 'Executive Enablement'
  }
];

export const process = [
  {
    title: 'Analyse',
    description: 'Discovery-Workshops, Daten-Screening und Priorisierung Ihrer Automations-Chancen.'
  },
  {
    title: 'Implementierung',
    description: 'Wir liefern produktionsreife Agents, Workflows und Integrationen mit Ihren Kernsystemen.'
  },
  {
    title: 'Optimierung',
    description: 'Kontinuierliches Monitoring, A/B-Tests und KPI-Reviews zur Skalierung Ihrer Ergebnisse.'
  }
];

export const caseStudies = [
  {
    title: 'Angebotsprozess mit KI automatisiert',
    description: 'Von der Anfrage bis zur Freigabe – Angebote werden automatisch erstellt, geprüft und im ERP verbucht.',
    industry: 'Maschinenbau'
  },
  {
    title: 'AI Voice Agent für Support-Hotline',
    description: 'ElevenLabs-Stimmen übernehmen First-Level-Support, authentifizieren Kunden und übergeben bei Bedarf an Mitarbeitende.',
    industry: 'Versicherung'
  },
  {
    title: 'Workflow-Analyse mit n8n & GPT',
    description: 'Bestehende Prozesse werden durch GPT analysiert, Engpässe markiert und Automationschancen direkt umgesetzt.',
    industry: 'Professional Services'
  }
];

export const dashboardKpis = [
  {
    label: 'Aktive Agents',
    value: 12,
    trend: '+3',
    description: 'Voice & Chat Bots im produktiven Einsatz'
  },
  {
    label: 'ROI gesamt',
    value: '218%',
    trend: '+27%',
    description: 'Kapitalrendite über alle Programme'
  },
  {
    label: 'Automatisierte Stunden',
    value: '3.482h',
    trend: '+412h',
    description: 'Zeitersparnis der letzten 30 Tage'
  },
  {
    label: 'CSAT',
    value: '4.8/5',
    trend: '+0.3',
    description: 'Durchschnittliche Kundenzufriedenheit'
  }
];

export const workflowNodes = [
  {
    id: 'start',
    title: 'Webhook Eingang',
    description: 'Trigger durch CRM oder Supportticket'
  },
  {
    id: 'analyze',
    title: 'KI-Analyse',
    description: 'LLM bewertet Anliegen & Absicht'
  },
  {
    id: 'branch',
    title: 'Routing',
    description: 'Weiterleitung nach Regeln, Guardrails & Skills'
  },
  {
    id: 'act',
    title: 'Aktion',
    description: 'n8n Workflow, API Call oder Voice Response'
  },
  {
    id: 'report',
    title: 'Logging',
    description: 'Audit, Monitoring, KPI-Update in Echtzeit'
  }
];
