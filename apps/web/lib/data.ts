// Zentral definierte Inhaltsblöcke für Landingpage und Dashboard.

// Leistungen mit Titel, Beschreibung und KPI-Label
export const services = [
  {
    title: 'KI-Potenzialanalyse',
    description: 'Wir identifizieren Ihre besten Automatisierungsmöglichkeiten, bewerten Business-Impact und priorisieren Use Cases.',
    metric: 'Analyse in 14 Tagen',
    icon: 'sparkle'
  },
  {
    title: 'Beratung & Strategieentwicklung',
    description: 'Gemeinsam entwickeln wir Ihre KI-Roadmap – praxisnah, wirtschaftlich und abgestimmt auf Teams & Stakeholder.',
    metric: 'Roadmap 30/60/90',
    icon: 'compass'
  },
  {
    title: 'KI-Prozessautomation',
    description: 'Wir automatisieren wiederkehrende Aufgaben mit Workflows, Agenten und Guardrails für sichere Abläufe.',
    metric: '60% Zeitersparnis',
    icon: 'workflow'
  },
  {
    title: 'AI Voice Agents',
    description: 'Automatisierte Kommunikation – natürlich klingend, mehrsprachig und 24/7 einsatzbereit für Service & Vertrieb.',
    metric: '24/7 Verfügbarkeit',
    icon: 'headset'
  }
];

// Projektphasen, die in der ProcessSection dargestellt werden
export const process = [
  {
    title: 'Analyse',
    description: 'Wir prüfen Prozesse, Daten und Systeme auf Automationspotenzial und definieren klare Ziele.'
  },
  {
    title: 'Konzept',
    description: 'Wir entwickeln eine individuelle KI-Strategie inklusive Roadmap, KPIs und Governance.'
  },
  {
    title: 'Umsetzung',
    description: 'Wir implementieren Workflows, Voice Agents & Enablement – messbar, sicher und skalierbar.'
  }
];

// Referenzbeispiele mit Branchenbezug
export const caseStudies = [
  {
    title: 'Support automatisiert mit KI Voice Agent',
    description: 'Ein AI Voice Agent reduziert Wartezeiten um 70 % und liefert konsistente Service-Erlebnisse – rund um die Uhr.',
    industry: 'Kundenservice'
  },
  {
    title: 'Angebotserstellung mit GPT beschleunigt',
    description: 'Sales-Teams erhalten vorbefüllte Angebotsdokumente in Minuten – inklusive Compliance-Check und CRM-Update.',
    industry: 'Vertrieb'
  },
  {
    title: 'Backoffice-Workflows automatisiert',
    description: 'Rechnungsprüfung, Datenerfassung und Dokumentenrouting laufen jetzt autonom – mit Audit-Trail und Eskalationen.',
    industry: 'Finanzen'
  }
];

// Beispielhafte Kennzahlen für das Dashboard-Mockup
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

// Knoten, die den Workflow-Builder illustrieren
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
