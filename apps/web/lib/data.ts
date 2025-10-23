export const services = [
  {
    title: 'KI-Potenzialanalyse',
    description:
      'Wir identifizieren Quick-Wins und Einsparpotenziale in Ihren Prozessen – datenbasiert, transparent und in wenigen Tagen.',
    metric: '12%+ Effizienz'
  },
  {
    title: 'Beratung & Konzeptentwicklung',
    description:
      'Gemeinsam entwerfen wir KI-Betriebskonzepte, Architektur-Blueprints und Business Cases für Ihren Vorstand.',
    metric: '4 Wochen Blueprint'
  },
  {
    title: 'KI-Prozessautomation',
    description:
      'Von Backoffice-Robotern bis hin zu Self-Service-Workflows – wir automatisieren End-to-End inklusive Governance.',
    metric: '60% Zeitersparnis'
  },
  {
    title: 'AI Voice Agents',
    description:
      '24/7 erreichbare, mehrsprachige Agenten auf Basis von ElevenLabs & GPT-5, inklusive Guardrails und CRM-Anbindung.',
    metric: '97% Kundenzufriedenheit'
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
    title: 'Voice Agent für Service-Center',
    description:
      'Reduktion der Warteschleifen um 82% und intelligente Übergabe an Mitarbeiter bei komplexen Anliegen.',
    industry: 'Telekommunikation'
  },
  {
    title: 'Backoffice Automation',
    description: 'Automatisierte Rechnungsprüfung, Mahnwesen und Reporting mit 99,7% Datenqualität.',
    industry: 'Industrie & Fertigung'
  },
  {
    title: 'Conversational Sales Assist',
    description:
      'AI-Kampagnen mit personalisierten Gesprächen steigern Upsell-Quote im Vertrieb um 34%.',
    industry: 'SaaS & IT'
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
