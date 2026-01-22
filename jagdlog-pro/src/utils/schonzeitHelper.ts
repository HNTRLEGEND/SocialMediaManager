/**
 * HNTR LEGEND Pro - Schonzeiten-Prüfung
 * Prüft ob für eine Wildart aktuell Schonzeit ist
 */

import { SCHONZEITEN, Schonzeit, Bundesland } from '../constants/schonzeiten';

/**
 * Prüft ob ein Datum innerhalb eines Schonzeitraums liegt
 * @param datum Das zu prüfende Datum
 * @param von Schonzeitbeginn im Format 'DD.MM'
 * @param bis Schonzeitende im Format 'DD.MM'
 * @returns true wenn das Datum in der Schonzeit liegt
 */
const istInZeitraum = (datum: Date, von: string, bis: string): boolean => {
  const aktuellerTag = datum.getDate();
  const aktuellerMonat = datum.getMonth() + 1; // 0-basiert -> 1-basiert
  const aktuellesJahr = datum.getFullYear();

  // Parse von/bis Datum
  const [vonTag, vonMonat] = von.split('.').map(Number);
  const [bisTag, bisMonat] = bis.split('.').map(Number);

  // Erstelle Vergleichsdaten für das aktuelle Jahr
  const aktuellesDatum = new Date(aktuellesJahr, aktuellerMonat - 1, aktuellerTag);

  let vonDatum = new Date(aktuellesJahr, vonMonat - 1, vonTag);
  let bisDatum = new Date(aktuellesJahr, bisMonat - 1, bisTag);

  // Wenn die Schonzeit über den Jahreswechsel geht (z.B. 16.10 bis 30.04)
  if (bisDatum < vonDatum) {
    // Wir sind im Zeitraum wenn:
    // - aktuelles Datum >= von (im selben Jahr)
    // - ODER aktuelles Datum <= bis (im selben Jahr)
    const vonImJahr = new Date(aktuellesJahr, vonMonat - 1, vonTag);
    const bisImJahr = new Date(aktuellesJahr, bisMonat - 1, bisTag);

    return aktuellesDatum >= vonImJahr || aktuellesDatum <= bisImJahr;
  }

  // Normaler Zeitraum ohne Jahreswechsel
  return aktuellesDatum >= vonDatum && aktuellesDatum <= bisDatum;
};

/**
 * Gibt Schonzeit-Warnungen für eine Wildart zurück
 * @param bundesland Das Bundesland (ID, z.B. 'nordrhein-westfalen')
 * @param wildartId Die Wildart-ID (z.B. 'rehwild')
 * @param isoDate Das Datum als ISO-String
 * @returns Warnmeldung oder null wenn keine Schonzeit
 */
export const checkSchonzeitWarning = (
  bundesland: string,
  wildartId: string,
  isoDate: string
): string | null => {
  // Bundesland normalisieren
  const bundeslandNorm = bundesland.toLowerCase().replace(/\s+/g, '-');

  // Schonzeiten für dieses Bundesland abrufen
  const bundeslandSchonzeiten = SCHONZEITEN[bundeslandNorm];
  if (!bundeslandSchonzeiten) {
    // Keine Daten für dieses Bundesland
    return null;
  }

  // Schonzeiten für diese Wildart abrufen
  const wildartSchonzeiten = bundeslandSchonzeiten[wildartId.toLowerCase()];
  if (!wildartSchonzeiten || wildartSchonzeiten.length === 0) {
    return null;
  }

  // Datum parsen
  const datum = new Date(isoDate);
  if (isNaN(datum.getTime())) {
    return null;
  }

  // Alle Schonzeiten prüfen
  const aktiveSchonzeiten: Schonzeit[] = wildartSchonzeiten.filter((sz) =>
    istInZeitraum(datum, sz.von, sz.bis)
  );

  if (aktiveSchonzeiten.length === 0) {
    return null;
  }

  // Warnmeldung erstellen
  const warnungen = aktiveSchonzeiten.map((sz) => {
    let msg = `⚠️ Schonzeit ${sz.von} - ${sz.bis}`;
    if (sz.beschreibung) {
      msg += `: ${sz.beschreibung}`;
    }
    if (sz.geschlecht) {
      msg += ` (${sz.geschlecht})`;
    }
    return msg;
  });

  return warnungen.join('\n');
};

/**
 * Gibt alle aktiven Schonzeiten für ein Bundesland zurück
 * @param bundesland Das Bundesland
 * @param datum Das zu prüfende Datum
 * @returns Array mit aktiven Schonzeit-Warnungen
 */
export const getAktiveSchonzeiten = (
  bundesland: string,
  datum: Date = new Date()
): { wildart: string; warnung: string }[] => {
  const bundeslandNorm = bundesland.toLowerCase().replace(/\s+/g, '-');
  const bundeslandSchonzeiten = SCHONZEITEN[bundeslandNorm];

  if (!bundeslandSchonzeiten) {
    return [];
  }

  const aktiveWarnungen: { wildart: string; warnung: string }[] = [];

  for (const [wildartId, schonzeiten] of Object.entries(bundeslandSchonzeiten)) {
    for (const sz of schonzeiten) {
      if (istInZeitraum(datum, sz.von, sz.bis)) {
        aktiveWarnungen.push({
          wildart: wildartId,
          warnung: `${sz.beschreibung}: ${sz.von} - ${sz.bis}`,
        });
      }
    }
  }

  return aktiveWarnungen;
};

/**
 * Formatiert ein Datum für die Anzeige
 */
export const formatiereDatum = (isoDate: string): string => {
  const datum = new Date(isoDate);
  return datum.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formatiert Zeit für die Anzeige
 */
export const formatiereZeit = (isoDate: string): string => {
  const datum = new Date(isoDate);
  return datum.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatiert Datum und Zeit für die Anzeige
 */
export const formatiereDatumZeit = (isoDate: string): string => {
  const datum = new Date(isoDate);
  return datum.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
