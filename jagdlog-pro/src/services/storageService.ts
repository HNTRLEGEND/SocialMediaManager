/**
 * HNTR LEGEND Pro - Storage Service
 * CRUD-Operationen für alle Entitäten
 */

import { getDatabase, generateUUID, now, runTransaction } from '../data/db';
import {
  JagdEintrag,
  JagdEintragBasisSchema,
  Revier,
  RevierSchema,
  RevierMitglied,
  MapFeature,
  Kontakt,
  KontaktLink,
  Medium,
  Einstellungen,
  GPSKoordinaten,
  Wetter,
  AbschussDetails,
} from '../types';

// ============================================================
// EINTRÄGE (Beobachtungen, Abschüsse, Nachsuchen, etc.)
// ============================================================

export interface EintragFilter {
  revierId?: string;
  typ?: 'beobachtung' | 'abschuss' | 'nachsuche' | 'revierereignis';
  wildartId?: string;
  vonDatum?: string;
  bisDatum?: string;
  suchbegriff?: string;
  nurAktive?: boolean; // Keine gelöschten
  limit?: number;
  offset?: number;
}

/**
 * Speichert einen neuen Jagdeintrag
 */
export const saveEntry = async (eintrag: Record<string, unknown>): Promise<string> => {
  const db = await getDatabase();
  const id = generateUUID();
  const jetzt = now();

  // Details als JSON serialisieren
  let detailsJson: string | null = null;
  if ('abschussDetails' in eintrag && eintrag.abschussDetails) {
    detailsJson = JSON.stringify(eintrag.abschussDetails);
  } else if ('nachsuche' in eintrag && eintrag.nachsuche) {
    detailsJson = JSON.stringify(eintrag.nachsuche);
  } else if ('ereignis' in eintrag && eintrag.ereignis) {
    detailsJson = JSON.stringify(eintrag.ereignis);
  } else if ('verhalten' in eintrag) {
    // Beobachtungsdetails
    detailsJson = JSON.stringify({ verhalten: eintrag.verhalten, geschlechtGeschaetzt: (eintrag as Record<string, unknown>).geschlechtGeschaetzt });
  }

  // Typisierte Felder extrahieren
  const gps = eintrag.gps as GPSKoordinaten | undefined;
  const wetter = eintrag.wetter as Wetter | undefined;

  await db.runAsync(
    `INSERT INTO eintraege (
      id, revier_id, typ, zeitpunkt, gps_lat, gps_lon, gps_accuracy,
      ort_beschreibung, wildart_id, wildart_name, anzahl, jagdart,
      wetter_json, notizen, foto_ids, sichtbarkeit, details_json,
      erstellt_am, aktualisiert_am, erstellt_von, sync_status, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      eintrag.revierId as string,
      eintrag.typ as string,
      eintrag.zeitpunkt as string,
      gps?.latitude ?? null,
      gps?.longitude ?? null,
      gps?.accuracy ?? null,
      (eintrag.ortBeschreibung as string) ?? null,
      eintrag.wildartId as string,
      eintrag.wildartName as string,
      (eintrag.anzahl as number) ?? 1,
      (eintrag.jagdart as string) ?? null,
      wetter ? JSON.stringify(wetter) : null,
      (eintrag.notizen as string) ?? null,
      JSON.stringify((eintrag.fotoIds as string[]) ?? []),
      (eintrag.sichtbarkeit as string) ?? 'revier',
      detailsJson,
      jetzt,
      jetzt,
      (eintrag.erstelltVon as string) ?? null,
      'lokal',
      1,
    ]
  );

  return id;
};

/**
 * Lädt Einträge mit Filter
 */
export const getEntries = async (filter: EintragFilter = {}): Promise<JagdEintrag[]> => {
  const db = await getDatabase();

  let sql = 'SELECT * FROM eintraege WHERE 1=1';
  const params: (string | number)[] = [];

  // Filter: Nur aktive (nicht gelöschte)
  if (filter.nurAktive !== false) {
    sql += ' AND geloescht_am IS NULL';
  }

  // Filter: Revier
  if (filter.revierId) {
    sql += ' AND revier_id = ?';
    params.push(filter.revierId);
  }

  // Filter: Typ
  if (filter.typ) {
    sql += ' AND typ = ?';
    params.push(filter.typ);
  }

  // Filter: Wildart
  if (filter.wildartId) {
    sql += ' AND wildart_id = ?';
    params.push(filter.wildartId);
  }

  // Filter: Datum
  if (filter.vonDatum) {
    sql += ' AND zeitpunkt >= ?';
    params.push(filter.vonDatum);
  }
  if (filter.bisDatum) {
    sql += ' AND zeitpunkt <= ?';
    params.push(filter.bisDatum);
  }

  // Filter: Suchbegriff
  if (filter.suchbegriff) {
    sql += ' AND (wildart_name LIKE ? OR notizen LIKE ? OR ort_beschreibung LIKE ?)';
    const s = `%${filter.suchbegriff}%`;
    params.push(s, s, s);
  }

  // Sortierung
  sql += ' ORDER BY zeitpunkt DESC';

  // Limit/Offset
  if (filter.limit) {
    sql += ' LIMIT ?';
    params.push(filter.limit);
  }
  if (filter.offset) {
    sql += ' OFFSET ?';
    params.push(filter.offset);
  }

  const rows = await db.getAllAsync<Record<string, unknown>>(sql, params);

  return rows.map(mapRowToEntry);
};

/**
 * Lädt einen einzelnen Eintrag
 */
export const getEntry = async (id: string): Promise<JagdEintrag | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM eintraege WHERE id = ?',
    [id]
  );

  return row ? mapRowToEntry(row) : null;
};

/**
 * Aktualisiert einen Eintrag
 */
export const updateEntry = async (id: string, updates: Partial<JagdEintrag>): Promise<void> => {
  const db = await getDatabase();
  const jetzt = now();

  // Build dynamic update query
  const fields: string[] = ['aktualisiert_am = ?', 'version = version + 1'];
  const params: (string | number | null)[] = [jetzt];

  if (updates.zeitpunkt !== undefined) {
    fields.push('zeitpunkt = ?');
    params.push(updates.zeitpunkt);
  }
  if (updates.gps !== undefined) {
    fields.push('gps_lat = ?', 'gps_lon = ?', 'gps_accuracy = ?');
    params.push(updates.gps?.latitude ?? null, updates.gps?.longitude ?? null, updates.gps?.accuracy ?? null);
  }
  if (updates.wildartId !== undefined) {
    fields.push('wildart_id = ?');
    params.push(updates.wildartId);
  }
  if (updates.wildartName !== undefined) {
    fields.push('wildart_name = ?');
    params.push(updates.wildartName);
  }
  if (updates.anzahl !== undefined) {
    fields.push('anzahl = ?');
    params.push(updates.anzahl);
  }
  if (updates.jagdart !== undefined) {
    fields.push('jagdart = ?');
    params.push(updates.jagdart ?? null);
  }
  if (updates.wetter !== undefined) {
    fields.push('wetter_json = ?');
    params.push(updates.wetter ? JSON.stringify(updates.wetter) : null);
  }
  if (updates.notizen !== undefined) {
    fields.push('notizen = ?');
    params.push(updates.notizen ?? null);
  }
  if (updates.fotoIds !== undefined) {
    fields.push('foto_ids = ?');
    params.push(JSON.stringify(updates.fotoIds));
  }
  if (updates.sichtbarkeit !== undefined) {
    fields.push('sichtbarkeit = ?');
    params.push(updates.sichtbarkeit);
  }

  params.push(id);

  await db.runAsync(
    `UPDATE eintraege SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
};

/**
 * Soft-Delete eines Eintrags
 */
export const deleteEntry = async (id: string): Promise<void> => {
  const db = await getDatabase();
  const jetzt = now();

  await db.runAsync(
    'UPDATE eintraege SET geloescht_am = ?, aktualisiert_am = ? WHERE id = ?',
    [jetzt, jetzt, id]
  );
};

/**
 * Zählt Einträge mit Filter
 */
export const countEntries = async (filter: Omit<EintragFilter, 'limit' | 'offset'> = {}): Promise<number> => {
  const db = await getDatabase();

  let sql = 'SELECT COUNT(*) as count FROM eintraege WHERE 1=1';
  const params: (string | number)[] = [];

  if (filter.nurAktive !== false) {
    sql += ' AND geloescht_am IS NULL';
  }
  if (filter.revierId) {
    sql += ' AND revier_id = ?';
    params.push(filter.revierId);
  }
  if (filter.typ) {
    sql += ' AND typ = ?';
    params.push(filter.typ);
  }

  const result = await db.getFirstAsync<{ count: number }>(sql, params);
  return result?.count ?? 0;
};

// Hilfsfunktion: DB-Row zu Eintrag-Objekt
const mapRowToEntry = (row: Record<string, unknown>): JagdEintrag => {
  const gps: GPSKoordinaten | undefined =
    row.gps_lat && row.gps_lon
      ? {
          latitude: row.gps_lat as number,
          longitude: row.gps_lon as number,
          accuracy: row.gps_accuracy as number | undefined,
        }
      : undefined;

  const wetter: Wetter | undefined = row.wetter_json
    ? JSON.parse(row.wetter_json as string)
    : undefined;

  const fotoIds: string[] = row.foto_ids
    ? JSON.parse(row.foto_ids as string)
    : [];

  const details = row.details_json ? JSON.parse(row.details_json as string) : null;

  const basis = {
    id: row.id as string,
    revierId: row.revier_id as string,
    typ: row.typ as JagdEintrag['typ'],
    zeitpunkt: row.zeitpunkt as string,
    gps,
    ortBeschreibung: row.ort_beschreibung as string | undefined,
    wildartId: row.wildart_id as string,
    wildartName: row.wildart_name as string,
    anzahl: row.anzahl as number,
    jagdart: row.jagdart as string | undefined,
    wetter,
    notizen: row.notizen as string | undefined,
    fotoIds,
    sichtbarkeit: (row.sichtbarkeit as JagdEintrag['sichtbarkeit']) ?? 'revier',
    erstelltAm: row.erstellt_am as string,
    aktualisiertAm: row.aktualisiert_am as string,
    erstelltVon: row.erstellt_von as string | undefined,
    syncStatus: (row.sync_status as 'lokal' | 'synchronisiert' | 'konflikt') ?? 'lokal',
    version: row.version as number,
    geloeschtAm: row.geloescht_am as string | null,
  };

  // Typ-spezifische Details hinzufügen
  if (row.typ === 'abschuss' && details) {
    return { ...basis, typ: 'abschuss', abschussDetails: details as AbschussDetails };
  } else if (row.typ === 'nachsuche' && details) {
    return { ...basis, typ: 'nachsuche', nachsuche: details };
  } else if (row.typ === 'revierereignis' && details) {
    return { ...basis, typ: 'revierereignis', ereignis: details };
  } else {
    return {
      ...basis,
      typ: 'beobachtung',
      verhalten: details?.verhalten,
      geschlechtGeschaetzt: details?.geschlechtGeschaetzt,
    };
  }
};

// ============================================================
// REVIERE
// ============================================================

/**
 * Speichert ein neues Revier
 */
export const saveRevier = async (revier: Omit<Revier, 'id' | 'erstelltAm' | 'aktualisiertAm' | 'syncStatus' | 'version'>): Promise<string> => {
  const db = await getDatabase();
  const id = generateUUID();
  const jetzt = now();

  await db.runAsync(
    `INSERT INTO reviere (
      id, name, beschreibung, bundesland, flaeche_hektar, plan, grenze_geo_json,
      erstellt_am, aktualisiert_am, sync_status, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      revier.name,
      revier.beschreibung ?? null,
      revier.bundesland,
      revier.flaecheHektar ?? null,
      revier.plan ?? 'free',
      revier.grenzeGeoJson ?? null,
      jetzt,
      jetzt,
      'lokal',
      1,
    ]
  );

  return id;
};

/**
 * Lädt alle Reviere
 */
export const getReviere = async (): Promise<Revier[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM reviere ORDER BY name'
  );

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    beschreibung: row.beschreibung as string | undefined,
    bundesland: row.bundesland as string,
    flaecheHektar: row.flaeche_hektar as number | undefined,
    plan: (row.plan as Revier['plan']) ?? 'free',
    grenzeGeoJson: row.grenze_geo_json as string | undefined,
    erstelltAm: row.erstellt_am as string,
    aktualisiertAm: row.aktualisiert_am as string,
    syncStatus: (row.sync_status as 'lokal' | 'synchronisiert' | 'konflikt') ?? 'lokal',
    version: row.version as number,
  }));
};

/**
 * Lädt ein einzelnes Revier
 */
export const getRevier = async (id: string): Promise<Revier | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM reviere WHERE id = ?',
    [id]
  );

  if (!row) return null;

  return {
    id: row.id as string,
    name: row.name as string,
    beschreibung: row.beschreibung as string | undefined,
    bundesland: row.bundesland as string,
    flaecheHektar: row.flaeche_hektar as number | undefined,
    plan: (row.plan as Revier['plan']) ?? 'free',
    grenzeGeoJson: row.grenze_geo_json as string | undefined,
    erstelltAm: row.erstellt_am as string,
    aktualisiertAm: row.aktualisiert_am as string,
    syncStatus: (row.sync_status as 'lokal' | 'synchronisiert' | 'konflikt') ?? 'lokal',
    version: row.version as number,
  };
};

/**
 * Aktualisiert ein Revier
 */
export const updateRevier = async (id: string, updates: Partial<Revier>): Promise<void> => {
  const db = await getDatabase();
  const jetzt = now();

  const fields: string[] = ['aktualisiert_am = ?'];
  const params: (string | number | null)[] = [jetzt];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.beschreibung !== undefined) {
    fields.push('beschreibung = ?');
    params.push(updates.beschreibung ?? null);
  }
  if (updates.bundesland !== undefined) {
    fields.push('bundesland = ?');
    params.push(updates.bundesland);
  }
  if (updates.flaecheHektar !== undefined) {
    fields.push('flaeche_hektar = ?');
    params.push(updates.flaecheHektar ?? null);
  }
  if (updates.grenzeGeoJson !== undefined) {
    fields.push('grenze_geo_json = ?');
    params.push(updates.grenzeGeoJson ?? null);
  }

  params.push(id);

  await db.runAsync(
    `UPDATE reviere SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
};

// ============================================================
// MEDIEN
// ============================================================

/**
 * Speichert ein Medium
 */
export const saveMedia = async (
  eintragId: string | null,
  fileUri: string,
  meta: Partial<Medium>
): Promise<string> => {
  const db = await getDatabase();
  const id = generateUUID();
  const jetzt = now();

  await db.runAsync(
    `INSERT INTO medien (
      id, eintrag_id, map_feature_id, lokale_uri, remote_uri, thumbnail_uri,
      dateiname, mime_type, groesse_bytes, breite, hoehe,
      aufnahme_zeitpunkt, aufnahme_gps_lat, aufnahme_gps_lon, erstellt_am, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      eintragId,
      meta.mapFeatureId ?? null,
      fileUri,
      meta.remoteUri ?? null,
      meta.thumbnailUri ?? null,
      meta.dateiname ?? `foto_${Date.now()}.jpg`,
      meta.mimeType ?? 'image/jpeg',
      meta.groesseBytes ?? null,
      meta.breite ?? null,
      meta.hoehe ?? null,
      meta.aufnahmeZeitpunkt ?? null,
      meta.aufnahmeGps?.latitude ?? null,
      meta.aufnahmeGps?.longitude ?? null,
      jetzt,
      'lokal',
    ]
  );

  return id;
};

/**
 * Lädt Medien für einen Eintrag
 */
export const getMedia = async (eintragId: string): Promise<Medium[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM medien WHERE eintrag_id = ?',
    [eintragId]
  );

  return rows.map((row) => ({
    id: row.id as string,
    eintragId: row.eintrag_id as string | undefined,
    mapFeatureId: row.map_feature_id as string | undefined,
    lokaleUri: row.lokale_uri as string,
    remoteUri: row.remote_uri as string | undefined,
    thumbnailUri: row.thumbnail_uri as string | undefined,
    dateiname: row.dateiname as string,
    mimeType: row.mime_type as string,
    groesseBytes: row.groesse_bytes as number | undefined,
    breite: row.breite as number | undefined,
    hoehe: row.hoehe as number | undefined,
    aufnahmeZeitpunkt: row.aufnahme_zeitpunkt as string | undefined,
    aufnahmeGps:
      row.aufnahme_gps_lat && row.aufnahme_gps_lon
        ? { latitude: row.aufnahme_gps_lat as number, longitude: row.aufnahme_gps_lon as number }
        : undefined,
    erstelltAm: row.erstellt_am as string,
    syncStatus: (row.sync_status as Medium['syncStatus']) ?? 'lokal',
  }));
};

// ============================================================
// STATISTIKEN
// ============================================================

export interface RevierStats {
  gesamtEintraege: number;
  beobachtungen: number;
  abschuesse: number;
  nachsuchen: number;
  wildartVerteilung: { wildart: string; anzahl: number }[];
  monatlicheEintraege: { monat: string; anzahl: number }[];
}

/**
 * Berechnet Statistiken für ein Revier
 */
export const getRevierStats = async (revierId: string): Promise<RevierStats> => {
  const db = await getDatabase();

  // Gesamtzahlen
  const gesamt = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE revier_id = ? AND geloescht_am IS NULL',
    [revierId]
  );

  const beobachtungen = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE revier_id = ? AND typ = ? AND geloescht_am IS NULL',
    [revierId, 'beobachtung']
  );

  const abschuesse = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE revier_id = ? AND typ = ? AND geloescht_am IS NULL',
    [revierId, 'abschuss']
  );

  const nachsuchen = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE revier_id = ? AND typ = ? AND geloescht_am IS NULL',
    [revierId, 'nachsuche']
  );

  // Wildart-Verteilung
  const wildarten = await db.getAllAsync<{ wildart: string; anzahl: number }>(
    `SELECT wildart_name as wildart, SUM(anzahl) as anzahl
     FROM eintraege WHERE revier_id = ? AND geloescht_am IS NULL
     GROUP BY wildart_id ORDER BY anzahl DESC LIMIT 10`,
    [revierId]
  );

  // Monatliche Verteilung (letzte 12 Monate)
  const monatlich = await db.getAllAsync<{ monat: string; anzahl: number }>(
    `SELECT strftime('%Y-%m', zeitpunkt) as monat, COUNT(*) as anzahl
     FROM eintraege WHERE revier_id = ? AND geloescht_am IS NULL
     AND zeitpunkt >= date('now', '-12 months')
     GROUP BY strftime('%Y-%m', zeitpunkt) ORDER BY monat`,
    [revierId]
  );

  return {
    gesamtEintraege: gesamt?.count ?? 0,
    beobachtungen: beobachtungen?.count ?? 0,
    abschuesse: abschuesse?.count ?? 0,
    nachsuchen: nachsuchen?.count ?? 0,
    wildartVerteilung: wildarten,
    monatlicheEintraege: monatlich,
  };
};

/**
 * Globale Statistiken über alle Reviere
 */
export const getGlobalStats = async (): Promise<RevierStats> => {
  const db = await getDatabase();

  const gesamt = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE geloescht_am IS NULL'
  );

  const beobachtungen = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE typ = ? AND geloescht_am IS NULL',
    ['beobachtung']
  );

  const abschuesse = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE typ = ? AND geloescht_am IS NULL',
    ['abschuss']
  );

  const nachsuchen = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM eintraege WHERE typ = ? AND geloescht_am IS NULL',
    ['nachsuche']
  );

  const wildarten = await db.getAllAsync<{ wildart: string; anzahl: number }>(
    `SELECT wildart_name as wildart, SUM(anzahl) as anzahl
     FROM eintraege WHERE geloescht_am IS NULL
     GROUP BY wildart_id ORDER BY anzahl DESC LIMIT 10`
  );

  const monatlich = await db.getAllAsync<{ monat: string; anzahl: number }>(
    `SELECT strftime('%Y-%m', zeitpunkt) as monat, COUNT(*) as anzahl
     FROM eintraege WHERE geloescht_am IS NULL
     AND zeitpunkt >= date('now', '-12 months')
     GROUP BY strftime('%Y-%m', zeitpunkt) ORDER BY monat`
  );

  return {
    gesamtEintraege: gesamt?.count ?? 0,
    beobachtungen: beobachtungen?.count ?? 0,
    abschuesse: abschuesse?.count ?? 0,
    nachsuchen: nachsuchen?.count ?? 0,
    wildartVerteilung: wildarten,
    monatlicheEintraege: monatlich,
  };
};
