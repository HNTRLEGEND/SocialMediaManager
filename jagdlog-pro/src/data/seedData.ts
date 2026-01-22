/**
 * HNTR LEGEND Pro - Demo/Seed Daten
 * Erstellt Beispieldaten für den sofortigen App-Start
 */

import { getDatabase, generateUUID, now } from './db';
import { WILDARTEN } from '../constants/wildarten';

/**
 * Prüft ob bereits Seed-Daten existieren
 */
export const hasSeedData = async (): Promise<boolean> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reviere'
  );
  return (result?.count ?? 0) > 0;
};

/**
 * Erstellt Demo-Daten für die App
 */
export const seedDemoData = async (): Promise<void> => {
  console.log('[Seed] Starte Demo-Daten-Erstellung...');

  const db = await getDatabase();

  // Prüfen ob bereits Daten existieren
  const hatDaten = await hasSeedData();
  if (hatDaten) {
    console.log('[Seed] Daten bereits vorhanden, überspringe Seed.');
    return;
  }

  const jetzt = new Date();
  const jetztISO = jetzt.toISOString();

  // === Demo-Revier erstellen ===
  const revierId = generateUUID();

  await db.runAsync(
    `INSERT INTO reviere (
      id, name, beschreibung, bundesland, flaeche_hektar, plan,
      erstellt_am, aktualisiert_am, sync_status, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      revierId,
      'Musterrevier Eichwald',
      'Demo-Revier für HNTR LEGEND Pro. Wunderschönes Waldrevier mit vielfältigem Wildbestand.',
      'nordrhein-westfalen',
      450,
      'revier_m',
      jetztISO,
      jetztISO,
      'lokal',
      1,
    ]
  );

  console.log('[Seed] Demo-Revier erstellt:', revierId);

  // === Demo-Einträge erstellen ===
  const demoEintraege = [
    // Beobachtungen
    {
      typ: 'beobachtung',
      wildartId: 'rehwild',
      wildartName: 'Rehwild',
      anzahl: 4,
      jagdart: 'Ansitz',
      notizen: 'Ricke mit 3 Kitzen auf Waldwiese. Alle gesund und munter.',
      tageZurueck: 0,
      stunde: 6,
      gps: { lat: 51.425, lon: 7.123 },
      wetter: { temp: 12, bewoelkung: 'Leicht bewölkt', windRichtung: 'SW' },
    },
    {
      typ: 'beobachtung',
      wildartId: 'schwarzwild',
      wildartName: 'Schwarzwild',
      anzahl: 7,
      jagdart: 'Pirsch',
      notizen: 'Rotte mit Bache und 6 Frischlingen an der Kirrung.',
      tageZurueck: 1,
      stunde: 20,
      gps: { lat: 51.428, lon: 7.118 },
      wetter: { temp: 8, bewoelkung: 'Bedeckt', windRichtung: 'O' },
    },
    {
      typ: 'beobachtung',
      wildartId: 'fuchs',
      wildartName: 'Fuchs',
      anzahl: 1,
      jagdart: 'Ansitz',
      notizen: 'Altfuchs mausend am Feldrand.',
      tageZurueck: 2,
      stunde: 18,
      gps: { lat: 51.430, lon: 7.125 },
      wetter: { temp: 15, bewoelkung: 'Sonnig', windRichtung: 'N' },
    },
    {
      typ: 'beobachtung',
      wildartId: 'rotwild',
      wildartName: 'Rotwild',
      anzahl: 12,
      jagdart: 'Pirsch',
      notizen: 'Kahlwildrudel am Waldrand. Imposanter Anblick!',
      tageZurueck: 3,
      stunde: 7,
      gps: { lat: 51.435, lon: 7.130 },
      wetter: { temp: 5, bewoelkung: 'Nebelig', windRichtung: 'NO' },
    },
    {
      typ: 'beobachtung',
      wildartId: 'feldhase',
      wildartName: 'Feldhase',
      anzahl: 2,
      jagdart: 'Pirsch',
      notizen: 'Zwei Hasen beim Rammelspiel auf dem Acker.',
      tageZurueck: 4,
      stunde: 16,
      gps: { lat: 51.422, lon: 7.120 },
      wetter: { temp: 14, bewoelkung: 'Heiter', windRichtung: 'W' },
    },

    // Abschüsse
    {
      typ: 'abschuss',
      wildartId: 'rehwild',
      wildartName: 'Rehwild',
      anzahl: 1,
      jagdart: 'Ansitz',
      notizen: 'Sauberer Blattschuss, sofort verendet.',
      tageZurueck: 5,
      stunde: 19,
      gps: { lat: 51.427, lon: 7.121 },
      wetter: { temp: 11, bewoelkung: 'Teilweise bewölkt', windRichtung: 'SW' },
      abschuss: {
        geschlecht: 'männlich',
        altersklasse: 'Mittel',
        gewichtKg: 14.5,
      },
    },
    {
      typ: 'abschuss',
      wildartId: 'schwarzwild',
      wildartName: 'Schwarzwild',
      anzahl: 1,
      jagdart: 'Ansitz',
      notizen: 'Überläuferkeiler an der Kirrung erlegt.',
      tageZurueck: 8,
      stunde: 21,
      gps: { lat: 51.429, lon: 7.116 },
      wetter: { temp: 6, bewoelkung: 'Klar', windRichtung: 'N' },
      abschuss: {
        geschlecht: 'männlich',
        altersklasse: 'Überläufer',
        gewichtKg: 42,
      },
    },
    {
      typ: 'abschuss',
      wildartId: 'rehwild',
      wildartName: 'Rehwild',
      anzahl: 1,
      jagdart: 'Pirsch',
      notizen: 'Schmalreh zur Bestandsregulierung.',
      tageZurueck: 12,
      stunde: 17,
      gps: { lat: 51.431, lon: 7.128 },
      wetter: { temp: 9, bewoelkung: 'Bedeckt', windRichtung: 'O' },
      abschuss: {
        geschlecht: 'weiblich',
        altersklasse: 'Schmalreh',
        gewichtKg: 11.2,
      },
    },
    {
      typ: 'abschuss',
      wildartId: 'fuchs',
      wildartName: 'Fuchs',
      anzahl: 1,
      jagdart: 'Ansitz',
      notizen: 'Jungfuchs am Hochsitz Waldeck.',
      tageZurueck: 15,
      stunde: 22,
      gps: { lat: 51.424, lon: 7.119 },
      wetter: { temp: 3, bewoelkung: 'Sternenklar', windRichtung: 'NW' },
      abschuss: {
        geschlecht: 'männlich',
        altersklasse: 'Jungfuchs',
        gewichtKg: 5.8,
      },
    },

    // Noch mehr Beobachtungen
    {
      typ: 'beobachtung',
      wildartId: 'damwild',
      wildartName: 'Damwild',
      anzahl: 8,
      jagdart: 'Pirsch',
      notizen: 'Damwildrudel in der Brunft. Beeindruckende Schaufler!',
      tageZurueck: 18,
      stunde: 8,
      gps: { lat: 51.433, lon: 7.135 },
      wetter: { temp: 7, bewoelkung: 'Morgennebel', windRichtung: 'SO' },
    },
    {
      typ: 'beobachtung',
      wildartId: 'waschbaer',
      wildartName: 'Waschbär',
      anzahl: 3,
      jagdart: 'Ansitz',
      notizen: 'Waschbärfähe mit 2 Jungtieren am Wildacker.',
      tageZurueck: 20,
      stunde: 23,
      gps: { lat: 51.426, lon: 7.124 },
      wetter: { temp: 10, bewoelkung: 'Bewölkt', windRichtung: 'W' },
    },
  ];

  // Einträge in die Datenbank schreiben
  for (const eintrag of demoEintraege) {
    const eintragId = generateUUID();
    const datum = new Date(jetzt);
    datum.setDate(datum.getDate() - eintrag.tageZurueck);
    datum.setHours(eintrag.stunde, Math.floor(Math.random() * 60), 0, 0);

    const wetterJson = eintrag.wetter
      ? JSON.stringify({
          temperatur: eintrag.wetter.temp,
          bewölkung: eintrag.wetter.bewoelkung,
          windRichtung: eintrag.wetter.windRichtung,
          mondphase: 'Zunehmender Mond',
          erfasstAm: datum.toISOString(),
          quelle: 'manuell',
        })
      : null;

    let detailsJson: string | null = null;
    if (eintrag.typ === 'abschuss' && eintrag.abschuss) {
      detailsJson = JSON.stringify({
        geschlecht: eintrag.abschuss.geschlecht,
        altersklasse: eintrag.abschuss.altersklasse,
        gewichtAufgebrochenKg: eintrag.abschuss.gewichtKg,
      });
    } else if (eintrag.typ === 'beobachtung') {
      detailsJson = JSON.stringify({
        verhalten: 'beobachtet',
      });
    }

    await db.runAsync(
      `INSERT INTO eintraege (
        id, revier_id, typ, zeitpunkt, gps_lat, gps_lon, gps_accuracy,
        ort_beschreibung, wildart_id, wildart_name, anzahl, jagdart,
        wetter_json, notizen, foto_ids, sichtbarkeit, details_json,
        erstellt_am, aktualisiert_am, erstellt_von, sync_status, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eintragId,
        revierId,
        eintrag.typ,
        datum.toISOString(),
        eintrag.gps.lat,
        eintrag.gps.lon,
        10,
        null,
        eintrag.wildartId,
        eintrag.wildartName,
        eintrag.anzahl,
        eintrag.jagdart,
        wetterJson,
        eintrag.notizen,
        '[]',
        'revier',
        detailsJson,
        datum.toISOString(),
        datum.toISOString(),
        null,
        'lokal',
        1,
      ]
    );
  }

  console.log('[Seed] Demo-Einträge erstellt:', demoEintraege.length);

  // === Demo-POIs erstellen ===
  const demoPOIs = [
    { name: 'Hochsitz Waldeck', kategorie: 'hochsitz', lat: 51.427, lon: 7.121 },
    { name: 'Hochsitz Eichengrund', kategorie: 'hochsitz', lat: 51.432, lon: 7.128 },
    { name: 'Kanzel Feldrand', kategorie: 'kanzel', lat: 51.424, lon: 7.118 },
    { name: 'Kirrung Süd', kategorie: 'kirrung', lat: 51.425, lon: 7.115 },
    { name: 'Kirrung Nord', kategorie: 'kirrung', lat: 51.433, lon: 7.130 },
    { name: 'Salzlecke Waldwiese', kategorie: 'salzlecke', lat: 51.428, lon: 7.124 },
    { name: 'Wildkamera Wechsel', kategorie: 'wildkamera', lat: 51.430, lon: 7.122 },
    { name: 'Parkplatz Haupteingang', kategorie: 'parken', lat: 51.420, lon: 7.110 },
  ];

  for (const poi of demoPOIs) {
    const poiId = generateUUID();

    await db.runAsync(
      `INSERT INTO map_features (
        id, revier_id, typ, name, beschreibung, geometry_type, coordinates,
        poi_kategorie, poi_status, erstellt_am, aktualisiert_am, sync_status, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        poiId,
        revierId,
        'poi',
        poi.name,
        null,
        'Point',
        JSON.stringify([poi.lon, poi.lat]),
        poi.kategorie,
        'aktiv',
        jetztISO,
        jetztISO,
        'lokal',
        1,
      ]
    );
  }

  console.log('[Seed] Demo-POIs erstellt:', demoPOIs.length);

  // === Demo-Kontakte erstellen ===
  const demoKontakte = [
    { name: 'Hans Müller', typ: 'hundefuehrer', telefon: '+49 170 1234567', ort: 'Dortmund' },
    { name: 'Wildhof Schmidt', typ: 'wildhaendler', telefon: '+49 231 9876543', ort: 'Bochum' },
    { name: 'Metzgerei Weber', typ: 'metzger', telefon: '+49 234 5551234', ort: 'Essen' },
    { name: 'Dr. Fischer', typ: 'tierarzt', telefon: '+49 201 7778899', ort: 'Gelsenkirchen' },
  ];

  for (const kontakt of demoKontakte) {
    const kontaktId = generateUUID();

    await db.runAsync(
      `INSERT INTO kontakte (
        id, name, typ, telefon, ort, erstellt_am, aktualisiert_am, sync_status, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kontaktId,
        kontakt.name,
        kontakt.typ,
        kontakt.telefon,
        kontakt.ort,
        jetztISO,
        jetztISO,
        'lokal',
        1,
      ]
    );
  }

  console.log('[Seed] Demo-Kontakte erstellt:', demoKontakte.length);

  console.log('[Seed] Demo-Daten-Erstellung abgeschlossen!');
};
