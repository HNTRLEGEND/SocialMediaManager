/**
 * HNTR LEGEND Pro - Map Service
 * Karten-Operationen und Offline-Tile-Caching
 */

import { getDatabase, generateUUID, now } from '../data/db';
import { MapFeature, GPSKoordinaten, POIKategorie, ZonenTyp } from '../types';

/**
 * Speichert ein neues Map-Feature (POI, Zone, Track, etc.)
 */
export const saveMapFeature = async (
  feature: Omit<MapFeature, 'id' | 'erstelltAm' | 'aktualisiertAm' | 'syncStatus' | 'version'>
): Promise<string> => {
  const db = await getDatabase();
  const id = generateUUID();
  const jetzt = now();

  await db.runAsync(
    `INSERT INTO map_features (
      id, revier_id, typ, name, beschreibung, geometry_type, coordinates,
      poi_kategorie, poi_status, letzte_kontrolle, naechste_kontrolle,
      zonen_typ, foto_ids, icon, farbe,
      erstellt_am, aktualisiert_am, erstellt_von, sync_status, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      feature.revierId,
      feature.typ,
      feature.name,
      feature.beschreibung ?? null,
      feature.geometryType,
      feature.coordinates,
      feature.poiKategorie ?? null,
      feature.poiStatus ?? null,
      feature.letzteKontrolle ?? null,
      feature.naechsteKontrolle ?? null,
      feature.zonenTyp ?? null,
      JSON.stringify(feature.fotoIds ?? []),
      feature.icon ?? null,
      feature.farbe ?? null,
      jetzt,
      jetzt,
      feature.erstelltVon ?? null,
      'lokal',
      1,
    ]
  );

  return id;
};

/**
 * Lädt alle Map-Features für ein Revier
 */
export const getMapFeatures = async (
  revierId: string,
  typ?: 'poi' | 'boundary' | 'zone' | 'track' | 'hazard'
): Promise<MapFeature[]> => {
  const db = await getDatabase();

  let sql = 'SELECT * FROM map_features WHERE revier_id = ? AND geloescht_am IS NULL';
  const params: string[] = [revierId];

  if (typ) {
    sql += ' AND typ = ?';
    params.push(typ);
  }

  sql += ' ORDER BY name';

  const rows = await db.getAllAsync<Record<string, unknown>>(sql, params);

  return rows.map((row) => ({
    id: row.id as string,
    revierId: row.revier_id as string,
    typ: row.typ as MapFeature['typ'],
    name: row.name as string,
    beschreibung: row.beschreibung as string | undefined,
    geometryType: row.geometry_type as 'Point' | 'LineString' | 'Polygon',
    coordinates: row.coordinates as string,
    poiKategorie: row.poi_kategorie as POIKategorie | undefined,
    poiStatus: row.poi_status as 'aktiv' | 'inaktiv' | 'wartung' | undefined,
    letzteKontrolle: row.letzte_kontrolle as string | undefined,
    naechsteKontrolle: row.naechste_kontrolle as string | undefined,
    zonenTyp: row.zonen_typ as ZonenTyp | undefined,
    fotoIds: row.foto_ids ? JSON.parse(row.foto_ids as string) : [],
    icon: row.icon as string | undefined,
    farbe: row.farbe as string | undefined,
    erstelltAm: row.erstellt_am as string,
    aktualisiertAm: row.aktualisiert_am as string,
    erstelltVon: row.erstellt_von as string | undefined,
    syncStatus: row.sync_status as 'lokal' | 'synchronisiert' | 'konflikt',
    version: row.version as number,
    geloeschtAm: row.geloescht_am as string | null,
  }));
};

/**
 * Aktualisiert ein Map-Feature
 */
export const updateMapFeature = async (id: string, updates: Partial<MapFeature>): Promise<void> => {
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
  if (updates.coordinates !== undefined) {
    fields.push('coordinates = ?');
    params.push(updates.coordinates);
  }
  if (updates.poiStatus !== undefined) {
    fields.push('poi_status = ?');
    params.push(updates.poiStatus);
  }
  if (updates.letzteKontrolle !== undefined) {
    fields.push('letzte_kontrolle = ?');
    params.push(updates.letzteKontrolle ?? null);
  }

  params.push(id);

  await db.runAsync(`UPDATE map_features SET ${fields.join(', ')} WHERE id = ?`, params);
};

/**
 * Löscht ein Map-Feature (Soft Delete)
 */
export const deleteMapFeature = async (id: string): Promise<void> => {
  const db = await getDatabase();
  const jetzt = now();

  await db.runAsync(
    'UPDATE map_features SET geloescht_am = ?, aktualisiert_am = ? WHERE id = ?',
    [jetzt, jetzt, id]
  );
};

/**
 * Zählt POIs nach Kategorie
 */
export const countPOIsByCategory = async (
  revierId: string
): Promise<{ kategorie: string; anzahl: number }[]> => {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{ kategorie: string; anzahl: number }>(
    `SELECT poi_kategorie as kategorie, COUNT(*) as anzahl
     FROM map_features
     WHERE revier_id = ? AND typ = 'poi' AND geloescht_am IS NULL
     GROUP BY poi_kategorie`,
    [revierId]
  );

  return rows;
};
