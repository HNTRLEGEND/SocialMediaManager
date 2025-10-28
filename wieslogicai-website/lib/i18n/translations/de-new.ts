// 🇩🇪 Deutsche Übersetzungen - AKTUALISIERT mit neuen Preisen & Workflows
// Fokus: Realistische Preise für deutsche KMU, Beratung + fertige Workflows

export const de_updated = {
  // ... (alle anderen Inhalte bleiben gleich)

  // AKTUALISIERTE Produkte (Workflows statt Builder)
  features: {
    badge: "Unsere Lösungen",
    headline: "KI-Workflows für jeden",
    headlineHighlight: "Geschäftsprozess",
    description: "Wir entwickeln, implementieren und betreuen Ihre KI-Workflows - Sie profitieren von der Automatisierung ohne technischen Aufwand.",

    products: [
      {
        icon: "phone",
        title: "AI Voice Agent",
        subtitle: "24/7 Telefonassistent",
        description: "Nimmt Anrufe entgegen, vereinbart Termine, beantwortet Fragen - klingt wie ein echter Mitarbeiter. Wir richten alles für Sie ein.",
        benefits: [
          "Natürliche Gespräche (NLP-Technologie)",
          "Direkte Kalender-Integration",
          "Mehrsprachig (DE, EN, TR, ...)",
          "Wir übernehmen Setup & Wartung",
        ],
        useCases: "Perfekt für: Arztpraxen, Friseursalons, Anwälte, Steuerberater",
        pricing: "Ab €249/Monat",
        cta: "Mehr erfahren",
      },
      {
        icon: "bot",
        title: "Lead-Qualifizierungs-Workflow",
        subtitle: "Automatische Lead-Bewertung",
        description: "Unser KI-Workflow analysiert, bewertet und qualifiziert eingehende Leads automatisch - Sie sprechen nur mit heißen Interessenten.",
        benefits: [
          "Automatische BANT-Qualifizierung",
          "Lead-Scoring & Priorisierung",
          "Anreicherung mit zusätzlichen Daten",
          "Direkte CRM/Google Sheets Integration",
        ],
        useCases: "Perfekt für: B2B-Unternehmen, Dienstleister, Vertriebsorganisationen",
        pricing: "Ab €349/Monat",
        cta: "Mehr erfahren",
      },
      {
        icon: "workflow",
        title: "Sales-Automatisierungs-Workflow",
        subtitle: "Von Lead bis Angebot",
        description: "Unser KI-Workflow führt Leads durch den kompletten Sales-Prozess - von der Anfrage bis zum fertigen Angebot.",
        benefits: [
          "Automatische Produktempfehlungen",
          "Preiskalkulation & Angebotserstellung",
          "Follow-up-Automatisierung",
          "Integration mit Ihrer Preis-Matrix",
        ],
        useCases: "Perfekt für: Industrieunternehmen, B2B-Sales, Anlagenbau",
        pricing: "Ab €599/Monat",
        cta: "Mehr erfahren",
      },
      {
        icon: "headset",
        title: "Service-Automatisierungs-Workflow",
        subtitle: "Kundenservice auf Autopilot",
        description: "Unser KI-Workflow beantwortet 90% aller Kundenanfragen automatisch - Ihr Team kümmert sich nur um die komplexen Fälle.",
        benefits: [
          "Automatische Ticket-Bearbeitung",
          "FAQ-Beantwortung via KI",
          "Eskalation bei Bedarf",
          "Multi-Channel (E-Mail, Chat, Telefon)",
        ],
        useCases: "Perfekt für: E-Commerce, SaaS, Service-Unternehmen",
        pricing: "Ab €449/Monat",
        cta: "Mehr erfahren",
      },
    ],

    ctaSection: {
      question: "Nicht sicher, welcher Workflow passt?",
      cta: "Kostenlose Potenzialanalyse buchen",
      description: "In 30 Minuten analysieren wir Ihre Prozesse und zeigen konkrete Einsparpotenziale.",
    },
  },

  // AKTUALISIERTE Preise (realistisch für KMU)
  pricing: {
    badge: "Transparente Preise",
    headline: "Wählen Sie Ihren",
    headlineHighlight: "Automatisierungs-Plan",
    description: "Klein starten, schnell skalieren. Monatlich kündbar, Setup inklusive.",

    plans: [
      {
        name: "Starter",
        subtitle: "Für Einzelkämpfer & kleine Teams",
        price: "249",
        currency: "€",
        period: "/Monat",
        description: "Perfekt für Einzelpraxen, Salons oder Freelancer, die mit KI-Automatisierung starten.",
        features: [
          "1 KI-Workflow Ihrer Wahl",
          "Bis zu 500 Interaktionen/Monat",
          "Google Sheets/Kalender-Integration",
          "Basis-Setup durch uns (Wert: €500)",
          "E-Mail Support (24h Reaktionszeit)",
          "Einführungs-Call (1 Stunde)",
        ],
        cta: "Jetzt 14 Tage testen",
        badge: "",
        popular: false,
      },
      {
        name: "Professional",
        subtitle: "Am beliebtesten",
        price: "599",
        currency: "€",
        period: "/Monat",
        description: "Für wachsende Unternehmen, die mehrere Prozesse automatisieren wollen.",
        features: [
          "Bis zu 3 KI-Workflows kombinierbar",
          "Bis zu 2.000 Interaktionen/Monat",
          "Alle Integrationen (CRM, ERP, Praxis-Software)",
          "Premium-Setup & Anpassungen (Wert: €1.500)",
          "Priority Support (4h Reaktionszeit)",
          "Monatliche Optimierungs-Calls",
          "Persönlicher Ansprechpartner",
        ],
        cta: "Jetzt Demo buchen",
        badge: "BELIEBT",
        popular: true,
      },
      {
        name: "Enterprise",
        subtitle: "Für größere Unternehmen",
        price: "Auf Anfrage",
        currency: "",
        period: "",
        description: "Maßgeschneiderte Lösung für Unternehmen mit komplexen Anforderungen.",
        features: [
          "Unbegrenzte KI-Workflows",
          "Unbegrenzte Interaktionen",
          "Custom-Entwicklung nach Bedarf",
          "Dedizierte Infrastruktur (optional)",
          "SLA-Garantien (99,9% Uptime)",
          "Vor-Ort-Training für Ihr Team",
          "Strategisches Consulting",
          "Direkte Hotline zum Entwickler-Team",
        ],
        cta: "Angebot einholen",
        badge: "",
        popular: false,
      },
    ],

    guarantee: {
      title: "14 Tage kostenlos testen, dann 30 Tage Geld-zurück",
      description: "Keine Einrichtungsgebühr • Monatlich kündbar • Faire Preise",
    },

    faq: {
      title: "Häufige Fragen",
      questions: [
        {
          q: "Muss ich technisches Know-how haben?",
          a: "Nein! Wir richten alles für Sie ein und schulen Ihr Team. Sie müssen nur sagen, was automatisiert werden soll.",
        },
        {
          q: "Wie lange dauert die Einrichtung?",
          a: "Starter-Workflows: 3-5 Werktage. Professional: 1-2 Wochen. Enterprise: 2-4 Wochen, je nach Komplexität.",
        },
        {
          q: "Was, wenn ich mehr Interaktionen brauche?",
          a: "Kein Problem! Zusätzliche Kontingente können flexibel dazugebucht werden (€0,50 pro zusätzliche Interaktion).",
        },
        {
          q: "Kann ich Workflows später hinzufügen?",
          a: "Ja, jederzeit! Wir passen Ihren Plan flexibel an Ihre wachsenden Anforderungen an.",
        },
        {
          q: "Ist das DSGVO-konform?",
          a: "Absolut. Serverstandort Deutschland, alle Daten verschlüsselt, DSGVO-Audit verfügbar.",
        },
      ],
    },
  },
}
