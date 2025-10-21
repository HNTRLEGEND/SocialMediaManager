// ============================================================================
// NODE 50: LEAD SCORING & QUALIFIKATION
// ============================================================================
//
// ZWECK:
// - Bewertet den Lead nach konfigurierten Kriterien (aus Node 00_Config)
// - Berechnet Lead_Score (0-10 Punkte)
// - Weist Lead_Category zu (HOT/WARM/COLD/NURTURE)
// - Entscheidet über Qualifikation (Qualified: true/false)
//
// INPUT:  Validierte Daten mit IDs (Node 40)
// OUTPUT: Daten + Lead_Score + Lead_Category + Qualified
//
// **ANPASSBAR**: Scoring-Logik basiert auf Node 00_Config
// ============================================================================

// ---------------------------------------------------------------------------
// 1️⃣ KONFIGURATION LADEN
// ---------------------------------------------------------------------------
const config = $('00_Config').first().json;
const SCORING_GEWICHTUNG = config.SCORING_GEWICHTUNG;
const LEAD_SCHWELLWERTE = config.LEAD_SCHWELLWERTE;
const BRANCHENFELDER = config.BRANCHENFELDER;

// ---------------------------------------------------------------------------
// 2️⃣ EINGABEDATEN
// ---------------------------------------------------------------------------
const item = $input.first();
const input = item.json;

console.log(`🎯 Scoring für Lead: ${input.Lead_ID}`);

// ---------------------------------------------------------------------------
// 3️⃣ SCORING-BERECHNUNG
// ---------------------------------------------------------------------------

let score = 0; // Gesamt-Rohscore (0-100)
let scoreBreakdown = {}; // Detaillierte Aufschlüsselung

// ---------------------------------------------------------------------------
// 3️⃣.1️⃣ ENERGIEINTENSITÄT (0-30 Punkte)
// ---------------------------------------------------------------------------
// **ANPASSEN**: Ersetze durch dein Haupt-Bewertungskriterium
// Beispiel Software: Nutzeranzahl
// Beispiel Immobilien: Kaufpreis

const jahresverbrauch = parseFloat(input.Energieverbrauch_Jahr_kWh) || 0;
let energieScore = 0;

if (jahresverbrauch > 100000) {
  energieScore = 30;
  scoreBreakdown.energieintensitaet = "Sehr hoch (>100k kWh) = 30pts";
} else if (jahresverbrauch > 50000) {
  energieScore = 20;
  scoreBreakdown.energieintensitaet = "Hoch (50-100k kWh) = 20pts";
} else if (jahresverbrauch > 20000) {
  energieScore = 15;
  scoreBreakdown.energieintensitaet = "Mittel (20-50k kWh) = 15pts";
} else if (jahresverbrauch > 5000) {
  energieScore = 10;
  scoreBreakdown.energieintensitaet = "Niedrig (5-20k kWh) = 10pts";
} else if (jahresverbrauch > 0) {
  energieScore = 5;
  scoreBreakdown.energieintensitaet = "Sehr niedrig (<5k kWh) = 5pts";
} else {
  energieScore = 0;
  scoreBreakdown.energieintensitaet = "Keine Angabe = 0pts";
}

score += energieScore;

// ---------------------------------------------------------------------------
// 3️⃣.2️⃣ PROJEKTVOLUMEN (0-25 Punkte)
// ---------------------------------------------------------------------------
const investmentRange = input.Investitionsrahmen || '<50k';
let projektvolumenScore = 0;

if (investmentRange.includes('>200')) {
  projektvolumenScore = 25;
  scoreBreakdown.projektvolumen = ">200k EUR = 25pts";
} else if (investmentRange.includes('100-200')) {
  projektvolumenScore = 20;
  scoreBreakdown.projektvolumen = "100-200k EUR = 20pts";
} else if (investmentRange.includes('50-100')) {
  projektvolumenScore = 15;
  scoreBreakdown.projektvolumen = "50-100k EUR = 15pts";
} else {
  projektvolumenScore = 5;
  scoreBreakdown.projektvolumen = "<50k EUR = 5pts";
}

score += projektvolumenScore;

// ---------------------------------------------------------------------------
// 3️⃣.3️⃣ DATENVOLLSTÄNDIGKEIT (0-20 Punkte)
// ---------------------------------------------------------------------------
// Prüfe, wie viele wichtige Felder ausgefüllt sind
const wichtigeFelder = [
  'Energieverbrauch_Jahr_kWh',
  'Phone',
  'Adresse',
  'Anfrage_typ',
  'Projektziel',
  'Speicherkapazitaet_kWh',
  'Wechselrichterleistung_kW'
];

let dataCompleteness = 0;
wichtigeFelder.forEach(feld => {
  if (input[feld] &&
      input[feld] !== '' &&
      input[feld] !== 'Nicht angegeben' &&
      input[feld] !== 0) {
    dataCompleteness++;
  }
});

const completenessScore = Math.round((dataCompleteness / wichtigeFelder.length) * 20);
score += completenessScore;
scoreBreakdown.datenvollstaendigkeit = `${dataCompleteness}/${wichtigeFelder.length} Felder = ${completenessScore}pts`;

// ---------------------------------------------------------------------------
// 3️⃣.4️⃣ KONTAKTQUALITÄT (0-15 Punkte)
// ---------------------------------------------------------------------------
let contactQuality = 0;

// Email-Qualität prüfen
if (input.Email_Gueltig) {
  if (input.Email_Typ === 'business') {
    contactQuality = 10; // Business-Email = höher bewertet
    scoreBreakdown.kontaktqualitaet = "Business Email = 10pts";
  } else if (input.Email_Typ === 'private') {
    contactQuality = 5; // Privat-Email = niedriger
    scoreBreakdown.kontaktqualitaet = "Private Email = 5pts";
  }
}

// Telefon vorhanden? +5 Punkte
if (input.Phone && input.Phone !== 'Nicht angegeben' && input.Phone.length > 5) {
  contactQuality += 5;
  scoreBreakdown.kontaktqualitaet += " + Telefon = +5pts";
}

score += Math.min(contactQuality, 15); // Maximum 15 Punkte

// ---------------------------------------------------------------------------
// 3️⃣.5️⃣ DRINGLICHKEIT (0-10 Punkte)
// ---------------------------------------------------------------------------
let urgencyScore = 5; // Default: Normal

if (input.Dringlichkeit === 'hoch') {
  urgencyScore = 10;
  scoreBreakdown.dringlichkeit = "Dringend = 10pts";
} else {
  scoreBreakdown.dringlichkeit = "Normal = 5pts";
}

score += urgencyScore;

// ---------------------------------------------------------------------------
// 4️⃣ NORMALISIERUNG AUF 0-10 SKALA
// ---------------------------------------------------------------------------
// Rohscore (0-100) → Lead_Score (0-10)
const finalScore = Math.round((score / 100) * 10 * 10) / 10; // Eine Nachkommastelle

// ---------------------------------------------------------------------------
// 5️⃣ KATEGORISIERUNG
// ---------------------------------------------------------------------------
let category = 'NURTURE';

if (finalScore >= LEAD_SCHWELLWERTE.HOT) {
  category = 'HOT';
} else if (finalScore >= LEAD_SCHWELLWERTE.WARM) {
  category = 'WARM';
} else if (finalScore >= LEAD_SCHWELLWERTE.COLD) {
  category = 'COLD';
}

// ---------------------------------------------------------------------------
// 6️⃣ QUALIFIKATIONS-ENTSCHEIDUNG
// ---------------------------------------------------------------------------
const qualified = finalScore >= LEAD_SCHWELLWERTE.QUALIFIED_MINIMUM;

// ---------------------------------------------------------------------------
// 7️⃣ EMPFEHLUNGEN GENERIEREN
// ---------------------------------------------------------------------------
let nextAction = '';
let vertriebsempfehlung = '';

if (qualified) {
  if (category === 'HOT') {
    nextAction = "Sofortiger Anruf innerhalb 24h";
    vertriebsempfehlung = "Top-Priorität! Persönlicher Kontakt, individuelles Angebot";
  } else if (category === 'WARM') {
    nextAction = "Kontaktaufnahme innerhalb 3 Werktagen";
    vertriebsempfehlung = "Qualifizierter Lead - Standard-Angebotsprozess";
  }
} else {
  if (category === 'COLD') {
    nextAction = "Nurture-Kampagne (Email-Serie)";
    vertriebsempfehlung = "In Marketing-Automation aufnehmen";
  } else {
    nextAction = "Newsletter, Low-Touch-Kampagne";
    vertriebsempfehlung = "Langfristige Pflege, kein aktiver Vertrieb";
  }
}

// ---------------------------------------------------------------------------
// 8️⃣ AUSGABE
// ---------------------------------------------------------------------------
console.log(`📊 Lead ${input.Lead_ID}: Score ${finalScore}/10 → ${category} (Qualified: ${qualified})`);

return {
  json: {
    // Alle bisherigen Daten durchreichen
    ...input,

    // ===== SCORING-ERGEBNISSE =====
    Lead_Score: finalScore,
    Lead_Category: category,
    Qualified: qualified,
    Score_Breakdown: scoreBreakdown,
    Raw_Score: score,

    // ===== EMPFEHLUNGEN =====
    Next_Action: nextAction,
    Vertriebsempfehlung: vertriebsempfehlung,

    // ===== METADATEN =====
    Scoring_Timestamp: new Date().toISOString(),
    Scoring_Version: config.config_version,
    Schwellwerte: LEAD_SCHWELLWERTE
  }
};

// ============================================================================
// ANPASSUNG FÜR ANDERE BRANCHEN:
// ============================================================================
//
// 1. Ersetze Zeile 40-70 (Energieintensität) durch dein Hauptkriterium:
//
//    Beispiel Software:
//    const nutzeranzahl = parseInt(input.Nutzeranzahl) || 0;
//    if (nutzeranzahl > 1000) energieScore = 30;
//    else if (nutzeranzahl > 100) energieScore = 20;
//    ...
//
// 2. Passe wichtigeFelder (Zeile 94-102) an deine Branche an
//
// 3. Aktualisiere SCORING_GEWICHTUNG in Node 00_Config
//
// ============================================================================
