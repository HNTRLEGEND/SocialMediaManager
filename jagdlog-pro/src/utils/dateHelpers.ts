/**
 * HNTR LEGEND Pro - Datums-Hilfsfunktionen
 */

/**
 * Erstellt einen ISO-Timestamp für jetzt
 */
export const jetztAlsISO = (): string => {
  return new Date().toISOString();
};

/**
 * Formatiert ein ISO-Datum für die deutsche Anzeige
 * @param isoDate ISO-Datums-String
 * @param mitZeit Ob die Zeit angezeigt werden soll
 */
export const formatiereDeutsch = (isoDate: string, mitZeit: boolean = true): string => {
  const datum = new Date(isoDate);

  if (isNaN(datum.getTime())) {
    return 'Ungültiges Datum';
  }

  if (mitZeit) {
    return datum.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return datum.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formatiert nur das Datum (ohne Zeit)
 */
export const formatiereDatum = (isoDate: string): string => {
  const datum = new Date(isoDate);

  if (isNaN(datum.getTime())) {
    return 'Ungültiges Datum';
  }

  return datum.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatiert nur die Zeit
 */
export const formatiereZeit = (isoDate: string): string => {
  const datum = new Date(isoDate);

  if (isNaN(datum.getTime())) {
    return '--:--';
  }

  return datum.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Gibt ein relatives Datum zurück (z.B. "Heute", "Gestern", "Vor 3 Tagen")
 */
export const relativeDatum = (isoDate: string): string => {
  const datum = new Date(isoDate);
  const jetzt = new Date();

  if (isNaN(datum.getTime())) {
    return 'Unbekannt';
  }

  // Datum auf Mitternacht setzen für Tagesvergleich
  const datumNurTag = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate());
  const jetztNurTag = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());

  const diffMs = jetztNurTag.getTime() - datumNurTag.getTime();
  const diffTage = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffTage === 0) {
    return 'Heute';
  } else if (diffTage === 1) {
    return 'Gestern';
  } else if (diffTage === 2) {
    return 'Vorgestern';
  } else if (diffTage < 7) {
    return `Vor ${diffTage} Tagen`;
  } else if (diffTage < 14) {
    return 'Letzte Woche';
  } else if (diffTage < 30) {
    return `Vor ${Math.floor(diffTage / 7)} Wochen`;
  } else if (diffTage < 60) {
    return 'Letzten Monat';
  } else {
    return formatiereDeutsch(isoDate, false);
  }
};

/**
 * Gruppiert Einträge nach Datum
 */
export const gruppiereNachDatum = <T extends { zeitpunkt: string }>(
  eintraege: T[]
): Map<string, T[]> => {
  const gruppen = new Map<string, T[]>();

  for (const eintrag of eintraege) {
    const datum = new Date(eintrag.zeitpunkt);
    const schluessel = datum.toISOString().split('T')[0]; // YYYY-MM-DD

    const bestehendeGruppe = gruppen.get(schluessel) || [];
    bestehendeGruppe.push(eintrag);
    gruppen.set(schluessel, bestehendeGruppe);
  }

  return gruppen;
};

/**
 * Prüft ob ein Datum heute ist
 */
export const istHeute = (isoDate: string): boolean => {
  const datum = new Date(isoDate);
  const jetzt = new Date();

  return (
    datum.getDate() === jetzt.getDate() &&
    datum.getMonth() === jetzt.getMonth() &&
    datum.getFullYear() === jetzt.getFullYear()
  );
};

/**
 * Gibt das aktuelle Jagdjahr zurück
 * (Jagdjahr läuft von 01.04. bis 31.03.)
 */
export const aktuellesJagdjahr = (): { von: Date; bis: Date; bezeichnung: string } => {
  const jetzt = new Date();
  const monat = jetzt.getMonth() + 1; // 1-12

  let startJahr: number;

  if (monat >= 4) {
    // April oder später: aktuelles Jahr ist Startjahr
    startJahr = jetzt.getFullYear();
  } else {
    // Januar-März: Vorjahr ist Startjahr
    startJahr = jetzt.getFullYear() - 1;
  }

  return {
    von: new Date(startJahr, 3, 1), // 1. April
    bis: new Date(startJahr + 1, 2, 31), // 31. März
    bezeichnung: `${startJahr}/${startJahr + 1}`,
  };
};

/**
 * Erstellt einen Zeitraum-String für Exports
 */
export const zeitraumString = (von: Date, bis: Date): string => {
  const vonStr = von.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const bisStr = bis.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${vonStr} - ${bisStr}`;
};
