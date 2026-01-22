/**
 * HNTR LEGEND Pro - Export Service
 * PDF-Export für Jagdtagebuch als Buch
 */

import { getEntries } from './storageService';
import { getRevier } from './storageService';
import { JagdEintrag, Revier } from '../types';
import { formatiereDeutsch, aktuellesJagdjahr, zeitraumString } from '../utils/dateHelpers';

/**
 * Export-Optionen
 */
export interface ExportOptionen {
  revierId: string;
  vonDatum: string;
  bisDatum: string;
  mitFotos: boolean;
  mitKarte: boolean;
  mitStatistiken: boolean;
}

/**
 * Export-Ergebnis
 */
export interface ExportErgebnis {
  erfolgreich: boolean;
  dateiPfad?: string;
  fehler?: string;
}

/**
 * Generiert eine HTML-Vorschau für den PDF-Export
 * (In einer vollständigen Implementierung würde dies ein echtes PDF erzeugen)
 */
export const generateExportPreview = async (
  optionen: ExportOptionen
): Promise<{ html: string; eintragszahl: number }> => {
  // Revier laden
  const revier = await getRevier(optionen.revierId);
  if (!revier) {
    throw new Error('Revier nicht gefunden');
  }

  // Einträge laden
  const eintraege = await getEntries({
    revierId: optionen.revierId,
    vonDatum: optionen.vonDatum,
    bisDatum: optionen.bisDatum,
    nurAktive: true,
  });

  // Einträge nach Monat gruppieren
  const nachMonat = new Map<string, JagdEintrag[]>();

  for (const eintrag of eintraege) {
    const datum = new Date(eintrag.zeitpunkt);
    const monatKey = `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}`;

    if (!nachMonat.has(monatKey)) {
      nachMonat.set(monatKey, []);
    }
    nachMonat.get(monatKey)!.push(eintrag);
  }

  // Statistiken berechnen
  const stats = {
    gesamt: eintraege.length,
    beobachtungen: eintraege.filter((e) => e.typ === 'beobachtung').length,
    abschuesse: eintraege.filter((e) => e.typ === 'abschuss').length,
    nachsuchen: eintraege.filter((e) => e.typ === 'nachsuche').length,
  };

  // HTML generieren
  let html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Jagdtagebuch - ${revier.name}</title>
  <style>
    body { font-family: 'Georgia', serif; margin: 40px; color: #2C2C2C; }
    h1 { color: #4A7C2C; border-bottom: 2px solid #4A7C2C; padding-bottom: 10px; }
    h2 { color: #4A7C2C; margin-top: 30px; }
    h3 { color: #666; font-size: 14px; margin-top: 20px; }
    .cover { text-align: center; page-break-after: always; padding-top: 200px; }
    .cover h1 { font-size: 36px; border: none; }
    .cover p { font-size: 18px; color: #666; }
    .entry { margin-bottom: 15px; padding: 10px; border-left: 3px solid #4A7C2C; }
    .entry-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .entry-type { font-weight: bold; color: #4A7C2C; }
    .entry-date { color: #666; font-size: 12px; }
    .entry-wildlife { font-size: 16px; margin-bottom: 5px; }
    .entry-notes { font-style: italic; color: #666; font-size: 13px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
    .stat-box { background: #f5f5f0; padding: 15px; text-align: center; border-radius: 8px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #4A7C2C; }
    .stat-label { font-size: 12px; color: #666; }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <!-- Deckblatt -->
  <div class="cover">
    <h1>Jagdtagebuch</h1>
    <p><strong>${revier.name}</strong></p>
    <p>${zeitraumString(new Date(optionen.vonDatum), new Date(optionen.bisDatum))}</p>
    <p style="margin-top: 50px;">Erstellt mit HNTR LEGEND Pro</p>
  </div>

  <!-- Statistiken -->
  ${optionen.mitStatistiken ? `
  <h2>Zusammenfassung</h2>
  <div class="stats">
    <div class="stat-box">
      <div class="stat-value">${stats.gesamt}</div>
      <div class="stat-label">Einträge gesamt</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.beobachtungen}</div>
      <div class="stat-label">Beobachtungen</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.abschuesse}</div>
      <div class="stat-label">Abschüsse</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${stats.nachsuchen}</div>
      <div class="stat-label">Nachsuchen</div>
    </div>
  </div>
  ` : ''}

  <!-- Einträge nach Monat -->
  <h2>Tagebucheinträge</h2>
`;

  // Monate durchgehen
  const sortierteMonat = Array.from(nachMonat.keys()).sort().reverse();

  for (const monatKey of sortierteMonat) {
    const monatEintraege = nachMonat.get(monatKey)!;
    const [jahr, monat] = monatKey.split('-');
    const monatName = new Date(parseInt(jahr), parseInt(monat) - 1).toLocaleDateString('de-DE', {
      month: 'long',
      year: 'numeric',
    });

    html += `<h3>${monatName} (${monatEintraege.length} Einträge)</h3>`;

    for (const eintrag of monatEintraege) {
      const typLabel =
        eintrag.typ === 'abschuss'
          ? 'Abschuss'
          : eintrag.typ === 'beobachtung'
          ? 'Beobachtung'
          : eintrag.typ === 'nachsuche'
          ? 'Nachsuche'
          : 'Ereignis';

      html += `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-type">${typLabel}</span>
          <span class="entry-date">${formatiereDeutsch(eintrag.zeitpunkt)}</span>
        </div>
        <div class="entry-wildlife">${eintrag.wildartName} ${eintrag.anzahl > 1 ? `(${eintrag.anzahl}×)` : ''}</div>
        ${eintrag.notizen ? `<div class="entry-notes">"${eintrag.notizen}"</div>` : ''}
      </div>
      `;
    }
  }

  html += `
</body>
</html>
`;

  return {
    html,
    eintragszahl: eintraege.length,
  };
};

/**
 * Exportiert das Jagdtagebuch als PDF
 * (Platzhalter - benötigt echte PDF-Bibliothek wie react-native-html-to-pdf)
 */
export const exportToPDF = async (optionen: ExportOptionen): Promise<ExportErgebnis> => {
  try {
    // Vorschau generieren
    const { html, eintragszahl } = await generateExportPreview(optionen);

    // TODO: Hier würde das echte PDF erzeugt werden
    // z.B. mit react-native-html-to-pdf
    console.log(`[Export] ${eintragszahl} Einträge würden exportiert werden`);

    return {
      erfolgreich: true,
      dateiPfad: '/path/to/export.pdf', // Platzhalter
    };
  } catch (error) {
    console.error('[Export] Fehler:', error);
    return {
      erfolgreich: false,
      fehler: error instanceof Error ? error.message : 'Unbekannter Fehler',
    };
  }
};

/**
 * Gibt Standardwerte für den Export zurück (aktuelles Jagdjahr)
 */
export const getDefaultExportOptionen = (revierId: string): ExportOptionen => {
  const jagdjahr = aktuellesJagdjahr();

  return {
    revierId,
    vonDatum: jagdjahr.von.toISOString(),
    bisDatum: jagdjahr.bis.toISOString(),
    mitFotos: true,
    mitKarte: false,
    mitStatistiken: true,
  };
};
