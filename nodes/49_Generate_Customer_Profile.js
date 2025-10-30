// Funktion: 49_Generate_Customer_Profile
// -------------------------------------
// Ziel dieses Skripts:
// 1. Alle relevanten Node-Ausgaben (Webhooks, Analyse, Scoring, Kontakte, Dokumente etc.) einsammeln,
//    damit sie im Schritt "6_Intelligence_Gathering" vollständig vorliegen.
// 2. Die Daten strukturiert zusammenfassen (Lead, Projekt, Scoring, Kontakte, Zählerstände …),
//    sodass der Intelligence-Agent ohne weitere Lookups arbeiten kann.
// 3. Eine saubere Provenienz (Quellenverfolgung) und Rohdaten-Sammlung bereitstellen,
//    falls einzelne Tools fehlschlagen oder nachträglich geprüft werden müssen.
//
// Wichtige Hinweise zum Einsatz:
// - Dieses Skript wird in einem n8n Function-Node ausgeführt. Die zur Verfügung stehenden Hilfsfunktionen sind
//   $input, $items, $json, $itemIndex usw. (siehe n8n-Dokumentation zum Function-Node-Sandboxing).
// - Die Kommentare sind bewusst ausführlich auf Deutsch gehalten, damit klar ersichtlich ist, welche Bereiche
//   bei Bedarf angepasst werden müssen (z. B. wenn neue Nodes angebunden werden oder sich Feldnamen ändern).
// - Die Ausgaben sind an den erwarteten Input für den Node "6_Intelligence_Gathering" angelehnt: Dieser
//   erwartet ein vollständig aufbereitetes Objekt mit Lead-, Projekt-, Scoring-, Kontakt- und Kontextdaten,
//   sowie die Rohdaten aller relevanten Tools.

// -----------------------------------------------------------
// 1) Grundlegende Hilfsfunktionen
// -----------------------------------------------------------

/**
 * Liest alle Items eines vorherigen Nodes.
 * Wir nutzen bewusst nur $items(nodeName, 0, 0), da n8n in der Sandbox keine zusätzlichen Optionen erlaubt.
 * Bei Nodes, die nicht gelaufen sind oder nicht existieren, wird eine leere Liste zurückgegeben – so können wir
 * in der Provenienz später markieren, dass keine Daten vorlagen, ohne dass das Skript abstürzt.
 */
function ladeNodeItems(nodeName) {
  try {
    const nodeItems = $items(nodeName, 0, 0);
    if (!Array.isArray(nodeItems)) {
      return [];
    }

    return nodeItems.map((entry) => {
      const json = entry?.json ?? {};
      const binary = entry?.binary ? entry.binary : undefined;
      return binary ? { json, binary } : { json };
    });
  } catch (error) {
    // Viele n8n-Versionen werfen eine Fehlermeldung à la "No node with the name…" oder "Node did not execute".
    // In diesem Fall geben wir einfach ein leeres Array zurück und dokumentieren das später.
    const message = error?.message ?? '';
    if (/No node|did not execute|not executed|existiert nicht/i.test(message)) {
      return [];
    }

    // Bei echten Laufzeitfehlern geben wir den Fehler weiter, damit er sichtbar bleibt.
    throw new Error(`Fehler beim Laden von "${nodeName}": ${message}`);
  }
}

/**
 * Liefert den ersten JSON-Eintrag einer Node-Ausgabe oder ein leeres Objekt.
 * Dadurch können wir in der Zusammenfassung ohne großen Aufwand auf einzelne Felder zugreifen.
 */
function erstesJson(items) {
  if (!items || items.length === 0) {
    return {};
  }
  const first = items.find((entry) => entry && typeof entry === 'object');
  if (!first) {
    return {};
  }
  if (first.json && typeof first.json === 'object') {
    return first.json;
  }
  // Falls ausnahmsweise nur ein nacktes Objekt übergeben wurde.
  if (!first.json && typeof first === 'object') {
    return first;
  }
  return {};
}

/**
 * Nimmt die erste "echte" (nicht leere) Angabe aus einer Reihe von Werten.
 * So vermeiden wir ungewollte Überschreibungen durch leere Strings oder undefined.
 */
function wähle(...werte) {
  for (const wert of werte) {
    if (wert !== undefined && wert !== null && wert !== '') {
      return wert;
    }
  }
  return '';
}

/**
 * Wandelt Werte in Zahlen um. Bei nicht interpretierbaren Eingaben wird ein Fallback geliefert.
 */
function alsZahl(wert, fallback = 0) {
  if (wert === undefined || wert === null || wert === '') {
    return fallback;
  }
  const nummer = Number(wert);
  return Number.isFinite(nummer) ? nummer : fallback;
}

/**
 * Extrahiert einen Domain-Namen aus einer URL oder lässt den String unverändert, wenn bereits eine Domain vorliegt.
 */
function extrahiereDomain(website) {
  if (!website || typeof website !== 'string') {
    return '';
  }
  const getrimmt = website.trim();
  if (!getrimmt) {
    return '';
  }
  try {
    const normalisiert = /^https?:\/\//i.test(getrimmt) ? getrimmt : `https://${getrimmt}`;
    const hostname = new URL(normalisiert).hostname;
    return hostname.replace(/^www\./i, '');
  } catch (error) {
    // Wenn die URL nicht geparst werden kann (z. B. "firma.de/" ohne Protokoll), geben wir sie unverändert zurück.
    return getrimmt.replace(/^www\./i, '');
  }
}

/**
 * Wandelt Eingaben sicher in Arrays um. Praktisch, um Kontakte o. ä. konsistent zu behandeln.
 */
function alsArray(wert) {
  if (Array.isArray(wert)) {
    return wert;
  }
  if (wert === undefined || wert === null || wert === '') {
    return [];
  }
  return [wert];
}

/**
 * Hilfsfunktion, um flache Kopien von Objekten zu erstellen – verhindert, dass wir Referenzen zurückgeben,
 * die später ungewollt verändert werden.
 */
function kopiereObjekt(obj) {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    // Falls binäre Daten enthalten sind, kann JSON.stringify scheitern. In dem Fall liefern wir das Originalobjekt zurück.
    return obj;
  }
}

// -----------------------------------------------------------
// 2) Konfigurationsblock – welche Nodes sollen eingesammelt werden?
// -----------------------------------------------------------
// Die folgende Liste beschreibt alle relevanten Nodes vor "49_Generate_Customer_Profile".
// Passe diese Liste an, wenn sich Namen oder Verbindungen im Workflow ändern.
const NODE_REGISTRIERUNG = [
  { alias: 'webhook_trigger', name: '1_Webhook_Trigger', beschreibung: 'Originaler Lead-Webhooks (Rohdaten)' },
  { alias: 'validate_classify', name: '2_Validate_Classify', beschreibung: 'Validierung & Klassifizierung der Webhook-Daten' },
  { alias: 'read_counter', name: '3_Read_Counter', beschreibung: 'Auslesen aktueller Lead-/Angebotszähler' },
  { alias: 'generate_ids', name: '4_Generate_IDs', beschreibung: 'Generierung neuer Lead-/Offer-IDs' },
  { alias: 'prepare_analysis_data', name: '20_Prepare_Analysis_Data', beschreibung: 'Aufbereitung für Analyse & Agenteneingabe' },
  { alias: 'search_company_website', name: '45_Search_Company_Website', beschreibung: 'Suche nach offizieller Unternehmens-Website' },
  { alias: 'scrape_company_website', name: '46_Scrape_Company_Website', beschreibung: 'Scraping der Unternehmens-Website' },
  { alias: 'hunter_enrichment', name: '47_Hunter', beschreibung: 'Hunter.io-Enrichment für Kontaktdaten' },
  { alias: 'linkedin_company', name: '48_LinkedIn_Company_Search', beschreibung: 'LinkedIn Unternehmenssuche' },
  { alias: 'generate_customer_profile', name: '25_Generate_Customer_Profile', beschreibung: 'Frühere Profil-Anreicherung (falls vorhanden)' },
  { alias: 'calculate_score', name: '9_Calculate_Score', beschreibung: 'Lead-Scoring auf Basis Projekt- & Kontaktdaten' },
  { alias: 'prepare_contacts', name: '10_Prepare_Contacts', beschreibung: 'Ermittlung Haupt- & Nebenkontakte' },
  { alias: 'prepare_counter_update', name: '13_Prepare_CounterUpdate', beschreibung: 'Berechnung nächster Lead-/Offer-IDs' },
  { alias: 'create_dossier', name: '7_Create_Dossier', beschreibung: 'Google Doc erstellen' },
  { alias: 'update_dossier', name: '8_Update_Dossier', beschreibung: 'Befüllen des Google Docs' },
  { alias: 'write_masterlog', name: '11_Write_MasterLog', beschreibung: 'Schreiben in Master-Datenbank' },
  { alias: 'write_contacts', name: '12_Write_Contacts', beschreibung: 'Schreiben in Kontakte-Datenbank' },
  { alias: 'update_counter', name: '14_Update_Counter', beschreibung: 'Aktualisierung der Zählerstände' },
  { alias: 'think_tool', name: '75_Think_Tool', beschreibung: 'Internes Gedankentool für Zwischenergebnisse' },
  { alias: 'analysis_helper', name: '49_Generate_Customer_Profile', beschreibung: 'Eigenes Node-Resultat (für Re-Runs interessant)' },
];

// -----------------------------------------------------------
// 3) Hauptlogik – wir iterieren über alle eingehenden Items und reichern sie an.
// -----------------------------------------------------------
const eingehendeItems = $input.all();
const ergebnisse = [];

for (const aktuellesItem of eingehendeItems) {
  // 3.1) Rohdaten aller Nodes sammeln und Provenienz aufbauen
  const roheQuellen = {};
  const quellenMeta = [];

  for (const nodeInfo of NODE_REGISTRIERUNG) {
    const daten = ladeNodeItems(nodeInfo.name);
    roheQuellen[nodeInfo.alias] = daten;
    quellenMeta.push({
      alias: nodeInfo.alias,
      node: nodeInfo.name,
      beschreibung: nodeInfo.beschreibung,
      itemCount: Array.isArray(daten) ? daten.length : 0,
    });
  }

  // 3.2) Schnellzugriff auf die wichtigsten Informationen (First-JSON pro Node)
  const analyse = erstesJson(roheQuellen.prepare_analysis_data);
  const webhook = erstesJson(roheQuellen.webhook_trigger);
  const webhookBody = webhook?.body ?? webhook ?? {};
  const validiert = erstesJson(roheQuellen.validate_classify);
  const scoring = erstesJson(roheQuellen.calculate_score);
  const kontakte = erstesJson(roheQuellen.prepare_contacts);
  const zaehlerUpdate = erstesJson(roheQuellen.prepare_counter_update);
  const hunter = erstesJson(roheQuellen.hunter_enrichment);
  const linkedin = erstesJson(roheQuellen.linkedin_company);
  const webSuche = erstesJson(roheQuellen.search_company_website);
  const webScrape = erstesJson(roheQuellen.scrape_company_website);
  const gelesenZaehler = erstesJson(roheQuellen.read_counter);
  const generierteIds = erstesJson(roheQuellen.generate_ids);
  const dossierErstellt = erstesJson(roheQuellen.create_dossier);
  const dossierAktualisiert = erstesJson(roheQuellen.update_dossier);

  // 3.3) Lead- und Offer-IDs bestimmen (mit robusten Fallbacks)
  const leadId = wähle(
    analyse?.Lead_ID,
    analyse?.lead_id,
    generierteIds?.Lead_ID,
    validiert?.Lead_ID,
    webhookBody?.Lead_ID,
    aktuellesItem?.json?.Lead_ID,
    `LEAD_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );

  const offerId = wähle(
    analyse?.Offer_ID,
    analyse?.offer_id,
    generierteIds?.Offer_ID,
    aktuellesItem?.json?.Offer_ID,
    ''
  );

  // 3.4) Kontakt- & Kundendaten bündeln
  const kundeName = wähle(
    validiert?.fullName,
    webhookBody?.fullName,
    webhookBody?.Name,
    analyse?.fullName,
    `${wähle(validiert?.Vorname, webhookBody?.Vorname)} ${wähle(validiert?.Nachname, webhookBody?.Nachname)}`.trim()
  );

  const firmaName = wähle(
    validiert?.Firmenname,
    webhookBody?.Firmenname,
    analyse?.Firmenname,
    analyse?.webhookData?.Firmenname,
    linkedin?.company,
    webScrape?.company_name
  );

  const website = wähle(
    validiert?.Website,
    webhookBody?.Website,
    analyse?.Website,
    analyse?.webhookData?.Website,
    webSuche?.website_url,
    webScrape?.website,
    hunter?.domain,
    aktuellesItem?.json?.Website
  );

  const leadCore = {
    lead_id: leadId,
    offer_id: offerId,
    timestamp: wähle(analyse?.timestamp, webhookBody?.timestamp, aktuellesItem?.json?.timestamp),
    kundentyp: wähle(analyse?.Customer_Type, webhookBody?.Customer_Type, validiert?.Customer_Type, aktuellesItem?.json?.Customer_Type, 'nicht verfügbar'),
    anfrage_typ: wähle(validiert?.Anfrage_typ, webhookBody?.Anfrage_typ, analyse?.webhookData?.Anfrage_typ, analyse?.Anfrage_typ),
    kommentar: wähle(validiert?.Kommentar, webhookBody?.Kommentar, analyse?.Kommentar),
  };

  const kontaktBlock = {
    name: kundeName || 'nicht verfügbar',
    vorname: wähle(validiert?.Vorname, webhookBody?.Vorname, analyse?.Vorname),
    nachname: wähle(validiert?.Nachname, webhookBody?.Nachname, analyse?.Nachname),
    email: wähle(validiert?.Email, webhookBody?.Email, analyse?.Email, hunter?.email) || 'nicht verfügbar',
    telefon: wähle(validiert?.Phone, webhookBody?.Phone, analyse?.Phone) || 'nicht verfügbar',
    mobil: wähle(validiert?.Mobile, webhookBody?.Mobile, analyse?.Mobile),
  };

  const unternehmensBlock = {
    firmenname: firmaName || 'nicht verfügbar',
    adresse: wähle(validiert?.Adresse, webhookBody?.Adresse, analyse?.Adresse, analyse?.webhookData?.Adresse, aktuellesItem?.json?.Adresse) || 'nicht verfügbar',
    website: website || 'nicht verfügbar',
    domain: extrahiereDomain(website),
    branche: wähle(linkedin?.industry, webScrape?.industry, webhookBody?.Branche, analyse?.Branche),
    standorte: alsArray(webScrape?.locations || linkedin?.locations || analyse?.Standorte),
    mitarbeiterzahl: wähle(linkedin?.company_size, webScrape?.company_size, analyse?.company_size),
  };

  // 3.5) Projektdaten, Energieprofile & Ziele zusammenführen
  const projektBlock = {
    energieverbrauch_tag_kwh: alsZahl(wähle(validiert?.EnergieverbrauchProTagkWh, webhookBody?.EnergieverbrauchProTagkWh, analyse?.webhookData?.EnergieverbrauchProTagkWh)),
    energieverbrauch_jahr_kwh: alsZahl(wähle(validiert?.EnergieverbrauchProJahrkWh, webhookBody?.EnergieverbrauchProJahrkWh, analyse?.webhookData?.EnergieverbrauchProJahrkWh)),
    energieerzeugung_pv_jahr_kwh: alsZahl(wähle(validiert?.EnergieerzeugungPVproJahrkWh, webhookBody?.EnergieerzeugungPVproJahrkWh, analyse?.webhookData?.EnergieerzeugungPVproJahrkWh)),
    speicherkapazitaet_kwh: alsZahl(wähle(validiert?.speicherkapazitaetkWh, webhookBody?.speicherkapazitaetkWh, analyse?.webhookData?.speicherkapazitaetkWh, analyse?.speicherkapazitaetkWh)),
    wechselrichterleistung_kw: alsZahl(wähle(validiert?.WechselrichterLeistungkW, webhookBody?.WechselrichterLeistungkW, analyse?.webhookData?.WechselrichterLeistungkW, analyse?.WechselrichterLeistungkW)),
    batterietyp: wähle(validiert?.Batterietyp, webhookBody?.Batterietyp, analyse?.webhookData?.Batterietyp, analyse?.Batterietyp) || 'nicht verfügbar',
    einsatzbereich: wähle(validiert?.Einsatzbereich, webhookBody?.Einsatzbereich, analyse?.webhookData?.Einsatzbereich),
    einsatzzweck: wähle(validiert?.Einsatzzweck, webhookBody?.Einsatzzweck, analyse?.webhookData?.Einsatzzweck),
    projektziel: wähle(validiert?.Projektziel, webhookBody?.Projektziel, analyse?.webhookData?.Projektziel, analyse?.Projektziel),
    investitionsrahmen: wähle(validiert?.investitionskapazitaet_range, webhookBody?.investitionskapazitaet_range, analyse?.webhookData?.investitionskapazitaet_range, 'nicht verfügbar'),
  };

  // 3.6) Scoring, Kontakte und Counter für Agent aufbereiten
  const scoringBlock = {
    lead_score: wähle(scoring?.Lead_Score, analyse?.Lead_Score, aktuellesItem?.json?.Lead_Score),
    lead_category: wähle(scoring?.Lead_Category, analyse?.Lead_Category, aktuellesItem?.json?.Lead_Category),
    qualified: wähle(scoring?.Qualified, analyse?.Qualified, aktuellesItem?.json?.Qualified),
    score_breakdown: kopiereObjekt(scoring?.Score_Breakdown || analyse?.Score_Breakdown || {}),
    raw: kopiereObjekt(scoring),
  };

  const kontakteBlock = {
    primary: kopiereObjekt(kontakte?.primary_contact || kontakte?.Primary || kontakte?.primary || {}),
    secondary: kopiereObjekt(kontakte?.secondary_contacts || kontakte?.Secondary || kontakte?.secondary || []),
    all_contacts: kopiereObjekt(kontakte?.all_contacts || kontakte?.All || kontakte?.all || []),
    contact_count: wähle(kontakte?.contact_count, kontakte?.Contact_Count, kontakte?.count),
  };

  const counterBlock = {
    current_lead_id: leadId,
    current_offer_id: offerId || 'nicht verfügbar',
    next_lead_id: wähle(zaehlerUpdate?.Next_Lead_ID, analyse?.Next_Lead_ID, gelesenZaehler?.Next_Lead_ID, 'nicht verfügbar'),
    next_offer_id: wähle(zaehlerUpdate?.Next_Offer_ID, analyse?.Next_Offer_ID, gelesenZaehler?.Next_Offer_ID, 'nicht verfügbar'),
    raw: kopiereObjekt(zaehlerUpdate),
  };

  // 3.7) Unternehmensprofil aus Webdaten generieren
  const unternehmensProfil = (() => {
    const infos = [];
    const branche = wähle(linkedin?.industry, webScrape?.industry);
    const produkte = wähle(webScrape?.products, linkedin?.specialties);
    const standorte = alsArray(webScrape?.locations || linkedin?.locations);
    const groesse = wähle(linkedin?.company_size, webScrape?.company_size);
    const mission = wähle(webScrape?.mission, linkedin?.tagline);

    if (branche) {
      infos.push(`Branche: ${branche}`);
    }
    if (produkte) {
      infos.push(`Produkte/Leistungen: ${produkte}`);
    }
    if (standorte.length > 0) {
      infos.push(`Standorte: ${standorte.join(', ')}`);
    }
    if (groesse) {
      infos.push(`Unternehmensgröße: ${groesse}`);
    }
    if (mission) {
      infos.push(`Besonderheiten/Mission: ${mission}`);
    }

    if (infos.length === 0) {
      return 'Keine relevanten öffentlichen Unternehmensinformationen gefunden.';
    }

    return infos.join(' | ');
  })();

  // 3.8) Dokument-Metadaten (falls Dossier bereits angelegt)
  const dokumentBlock = {
    erstellt: kopiereObjekt(dossierErstellt),
    aktualisiert: kopiereObjekt(dossierAktualisiert),
  };

  // 3.9) Zusammenstellung für den Intelligence-Agenten (Node 6)
  const agentPayload = {
    version: '1.0.0',
    zielnode: '6_Intelligence_Gathering',
    generiert_am: new Date().toISOString(),
    lead: leadCore,
    kontakt: kontaktBlock,
    unternehmen: unternehmensBlock,
    projekt: projektBlock,
    scoring: scoringBlock,
    kontakte: kontakteBlock,
    counter: counterBlock,
    dokumente: dokumentBlock,
    website_suche: kopiereObjekt(webSuche),
    website_scraper: kopiereObjekt(webScrape),
    hunter: kopiereObjekt(hunter),
    linkedin: kopiereObjekt(linkedin),
    analyse_daten: kopiereObjekt(analyse),
    webhook_daten: kopiereObjekt(webhookBody),
    validierte_daten: kopiereObjekt(validiert),
    unternehmensprofil: unternehmensProfil,
    provenienz: {
      quellen: quellenMeta,
      hinweis: 'itemCount = Anzahl der Items je Node. 0 bedeutet, dass der Node nicht gelaufen ist oder keine Daten lieferte.'
    },
    roh_daten: kopiereObjekt(roheQuellen),
  };

  // 3.10) Zusätzliche Kompatibilitätsstruktur für spätere Nodes / Backwards-Compatibility
  const kompatibilitaet = {
    lead_id: leadId,
    offer_id: offerId || undefined,
    customer_profile: {
      lead_id: leadId,
      contact_info: kontaktBlock,
      company_details: {
        name: unternehmensBlock.firmenname,
        website: unternehmensBlock.website,
        domain: unternehmensBlock.domain,
        industry: unternehmensBlock.branche,
        address: unternehmensBlock.adresse,
      },
      energy_profile: {
        daily_consumption: projektBlock.energieverbrauch_tag_kwh,
        annual_consumption: projektBlock.energieverbrauch_jahr_kwh,
        pv_generation: projektBlock.energieerzeugung_pv_jahr_kwh,
        storage_capacity: projektBlock.speicherkapazitaet_kwh,
        inverter_power: projektBlock.wechselrichterleistung_kw,
      },
      project_details: {
        type: projektBlock.anfrage_typ,
        goal: projektBlock.projektziel,
        usage_area: projektBlock.einsatzbereich,
        purpose: projektBlock.einsatzzweck,
        battery_type: projektBlock.batterietyp,
        investment_range: projektBlock.investitionsrahmen,
      },
    },
    scoring: scoringBlock,
    contacts: kontakteBlock,
    counter: counterBlock,
    analysis_data: kopiereObjekt(analyse),
    webhook_data: kopiereObjekt(webhookBody),
  };

  // 3.11) Endergebnis (ein Item pro eingehendem Item)
  ergebnisse.push({
    json: {
      agent_payload: agentPayload,
      compatibility_payload: kompatibilitaet,
    },
  });
}

return ergebnisse;
