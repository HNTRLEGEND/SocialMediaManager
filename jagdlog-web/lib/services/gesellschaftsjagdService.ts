/**
 * HNTR LEGEND - Gesellschaftsjagd Service Layer
 * CRUD operations for hunting party management
 */

import { initDatabase, generateUUID, now } from '../database';
import type {
  Gesellschaftsjagd,
  Teilnehmer,
  Standort,
  Sicherheitszone,
  JagdStatistik,
  GesellschaftsjagdFilter,
} from '../types/gesellschaftsjagd';

// ===================================
// GESELLSCHAFTSJAGD CRUD
// ===================================

export const createGesellschaftsjagd = async (
  data: Omit<Gesellschaftsjagd, 'id' | 'erstellt_am' | 'aktualisiert_am' | 'version'>
): Promise<Gesellschaftsjagd> => {
  const db = await initDatabase();
  const id = generateUUID();
  const timestamp = now();

  const jagd: Gesellschaftsjagd = {
    ...data,
    id,
    erstellt_am: timestamp,
    aktualisiert_am: timestamp,
    version: 1,
  };

  db.run(
    `INSERT INTO gesellschaftsjagd (
      id, revier_id, organisator_id, name, beschreibung, datum,
      start_zeit, end_zeit, jagd_typ, status, erwartete_jaeger,
      erwartete_treiber, sicherheitsregeln, notfall_kontakte,
      erstellt_am, aktualisiert_am, erstellt_von, aktualisiert_von, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      jagd.id,
      jagd.revier_id,
      jagd.organisator_id,
      jagd.name,
      jagd.beschreibung || null,
      jagd.datum,
      jagd.start_zeit,
      jagd.end_zeit,
      jagd.jagd_typ,
      jagd.status,
      jagd.erwartete_jaeger,
      jagd.erwartete_treiber,
      jagd.sicherheitsregeln || null,
      jagd.notfall_kontakte || null,
      jagd.erstellt_am,
      jagd.aktualisiert_am,
      jagd.erstellt_von,
      jagd.aktualisiert_von,
      jagd.version,
    ]
  );

  return jagd;
};

export const getGesellschaftsjagd = async (id: string): Promise<Gesellschaftsjagd | null> => {
  const db = await initDatabase();
  const result = db.exec(
    `SELECT * FROM gesellschaftsjagd WHERE id = ?`,
    [id]
  );

  if (!result.length || !result[0].values.length) {
    return null;
  }

  const row = result[0];
  const obj: any = {};
  row.columns.forEach((col, idx) => {
    obj[col] = row.values[0][idx];
  });

  return obj as Gesellschaftsjagd;
};

export const getAllGesellschaftsjagd = async (
  filter?: GesellschaftsjagdFilter
): Promise<Gesellschaftsjagd[]> => {
  const db = await initDatabase();
  
  let query = 'SELECT * FROM gesellschaftsjagd WHERE 1=1';
  const params: any[] = [];

  if (filter?.revier_id) {
    query += ' AND revier_id = ?';
    params.push(filter.revier_id);
  }

  if (filter?.organisator_id) {
    query += ' AND organisator_id = ?';
    params.push(filter.organisator_id);
  }

  if (filter?.status && filter.status.length > 0) {
    const placeholders = filter.status.map(() => '?').join(',');
    query += ` AND status IN (${placeholders})`;
    params.push(...filter.status);
  }

  if (filter?.datum_von) {
    query += ' AND datum >= ?';
    params.push(filter.datum_von);
  }

  if (filter?.datum_bis) {
    query += ' AND datum <= ?';
    params.push(filter.datum_bis);
  }

  query += ' ORDER BY datum DESC, start_zeit DESC';

  const result = db.exec(query, params);

  if (!result.length || !result[0].values.length) {
    return [];
  }

  const row = result[0];
  return row.values.map((values) => {
    const obj: any = {};
    row.columns.forEach((col, idx) => {
      obj[col] = values[idx];
    });
    return obj as Gesellschaftsjagd;
  });
};

export const updateGesellschaftsjagd = async (
  id: string,
  data: Partial<Omit<Gesellschaftsjagd, 'id' | 'erstellt_am' | 'erstellt_von'>>,
  userId: string
): Promise<Gesellschaftsjagd | null> => {
  const db = await initDatabase();
  const existing = await getGesellschaftsjagd(id);

  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...data,
    aktualisiert_am: now(),
    aktualisiert_von: userId,
    version: existing.version + 1,
  };

  db.run(
    `UPDATE gesellschaftsjagd SET
      name = ?, beschreibung = ?, datum = ?, start_zeit = ?, end_zeit = ?,
      jagd_typ = ?, status = ?, erwartete_jaeger = ?, erwartete_treiber = ?,
      sicherheitsregeln = ?, notfall_kontakte = ?, aktualisiert_am = ?,
      aktualisiert_von = ?, version = ?
    WHERE id = ?`,
    [
      updated.name,
      updated.beschreibung || null,
      updated.datum,
      updated.start_zeit,
      updated.end_zeit,
      updated.jagd_typ,
      updated.status,
      updated.erwartete_jaeger,
      updated.erwartete_treiber,
      updated.sicherheitsregeln || null,
      updated.notfall_kontakte || null,
      updated.aktualisiert_am,
      updated.aktualisiert_von,
      updated.version,
      id,
    ]
  );

  return updated;
};

export const deleteGesellschaftsjagd = async (id: string): Promise<boolean> => {
  const db = await initDatabase();
  db.run('DELETE FROM gesellschaftsjagd WHERE id = ?', [id]);
  return true;
};

// ===================================
// TEILNEHMER CRUD
// ===================================

export const addTeilnehmer = async (
  data: Omit<Teilnehmer, 'id' | 'erstellt_am'>
): Promise<Teilnehmer> => {
  const db = await initDatabase();
  const id = generateUUID();
  const timestamp = now();

  const teilnehmer: Teilnehmer = {
    ...data,
    id,
    erstellt_am: timestamp,
  };

  db.run(
    `INSERT INTO jagd_teilnehmer (
      id, jagd_id, name, email, telefon, rolle, user_id, notizen, anwesend, erstellt_am
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      teilnehmer.id,
      teilnehmer.jagd_id,
      teilnehmer.name,
      teilnehmer.email || null,
      teilnehmer.telefon || null,
      teilnehmer.rolle,
      teilnehmer.user_id || null,
      teilnehmer.notizen || null,
      teilnehmer.anwesend ? 1 : 0,
      teilnehmer.erstellt_am,
    ]
  );

  return teilnehmer;
};

export const getTeilnehmer = async (jagdId: string): Promise<Teilnehmer[]> => {
  const db = await initDatabase();
  const result = db.exec(
    'SELECT * FROM jagd_teilnehmer WHERE jagd_id = ? ORDER BY name',
    [jagdId]
  );

  if (!result.length || !result[0].values.length) {
    return [];
  }

  const row = result[0];
  return row.values.map((values) => {
    const obj: any = {};
    row.columns.forEach((col, idx) => {
      obj[col] = values[idx];
    });
    // Convert boolean
    obj.anwesend = obj.anwesend === 1;
    return obj as Teilnehmer;
  });
};

export const updateTeilnehmer = async (
  id: string,
  data: Partial<Omit<Teilnehmer, 'id' | 'jagd_id' | 'erstellt_am'>>
): Promise<Teilnehmer | null> => {
  const db = await initDatabase();
  
  // Get existing
  const result = db.exec('SELECT * FROM jagd_teilnehmer WHERE id = ?', [id]);
  if (!result.length || !result[0].values.length) {
    return null;
  }

  const row = result[0];
  const existing: any = {};
  row.columns.forEach((col, idx) => {
    existing[col] = row.values[0][idx];
  });
  existing.anwesend = existing.anwesend === 1;

  const updated = { ...existing, ...data };

  db.run(
    `UPDATE jagd_teilnehmer SET
      name = ?, email = ?, telefon = ?, rolle = ?, user_id = ?, notizen = ?, anwesend = ?
    WHERE id = ?`,
    [
      updated.name,
      updated.email || null,
      updated.telefon || null,
      updated.rolle,
      updated.user_id || null,
      updated.notizen || null,
      updated.anwesend ? 1 : 0,
      id,
    ]
  );

  return updated as Teilnehmer;
};

export const deleteTeilnehmer = async (id: string): Promise<boolean> => {
  const db = await initDatabase();
  db.run('DELETE FROM jagd_teilnehmer WHERE id = ?', [id]);
  return true;
};

// ===================================
// STANDORTE CRUD
// ===================================

export const addStandort = async (
  data: Omit<Standort, 'id' | 'erstellt_am'>
): Promise<Standort> => {
  const db = await initDatabase();
  const id = generateUUID();
  const timestamp = now();

  const standort: Standort = {
    ...data,
    id,
    erstellt_am: timestamp,
  };

  db.run(
    `INSERT INTO jagd_standorte (
      id, jagd_id, typ, name, beschreibung, gps_lat, gps_lon,
      zugewiesener_jaeger_id, zuweisungs_bestaetigt, zugewiesen_am, erstellt_am
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      standort.id,
      standort.jagd_id,
      standort.typ,
      standort.name,
      standort.beschreibung || null,
      standort.gps_lat,
      standort.gps_lon,
      standort.zugewiesener_jaeger_id || null,
      standort.zuweisungs_bestaetigt ? 1 : 0,
      standort.zugewiesen_am || null,
      standort.erstellt_am,
    ]
  );

  return standort;
};

export const getStandorte = async (jagdId: string): Promise<Standort[]> => {
  const db = await initDatabase();
  const result = db.exec(
    'SELECT * FROM jagd_standorte WHERE jagd_id = ? ORDER BY name',
    [jagdId]
  );

  if (!result.length || !result[0].values.length) {
    return [];
  }

  const row = result[0];
  return row.values.map((values) => {
    const obj: any = {};
    row.columns.forEach((col, idx) => {
      obj[col] = values[idx];
    });
    obj.zuweisungs_bestaetigt = obj.zuweisungs_bestaetigt === 1;
    return obj as Standort;
  });
};

export const assignJaeger = async (
  standortId: string,
  jaegerId: string | null
): Promise<Standort | null> => {
  const db = await initDatabase();
  const timestamp = jaegerId ? now() : null;

  db.run(
    `UPDATE jagd_standorte SET
      zugewiesener_jaeger_id = ?,
      zugewiesen_am = ?,
      zuweisungs_bestaetigt = 0
    WHERE id = ?`,
    [jaegerId, timestamp, standortId]
  );

  // Get updated standort
  const result = db.exec('SELECT * FROM jagd_standorte WHERE id = ?', [standortId]);
  if (!result.length || !result[0].values.length) {
    return null;
  }

  const row = result[0];
  const obj: any = {};
  row.columns.forEach((col, idx) => {
    obj[col] = row.values[0][idx];
  });
  obj.zuweisungs_bestaetigt = obj.zuweisungs_bestaetigt === 1;
  return obj as Standort;
};

export const unassignJaeger = async (standortId: string): Promise<boolean> => {
  return (await assignJaeger(standortId, null)) !== null;
};

export const deleteStandort = async (id: string): Promise<boolean> => {
  const db = await initDatabase();
  db.run('DELETE FROM jagd_standorte WHERE id = ?', [id]);
  return true;
};

// ===================================
// SICHERHEITSZONEN CRUD
// ===================================

export const addSicherheitszone = async (
  data: Omit<Sicherheitszone, 'id' | 'erstellt_am'>
): Promise<Sicherheitszone> => {
  const db = await initDatabase();
  const id = generateUUID();
  const timestamp = now();

  const zone: Sicherheitszone = {
    ...data,
    id,
    erstellt_am: timestamp,
  };

  db.run(
    `INSERT INTO jagd_sicherheitszonen (
      id, jagd_id, typ, name, beschreibung, polygon_koordinaten, farbe, erstellt_am
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      zone.id,
      zone.jagd_id,
      zone.typ,
      zone.name,
      zone.beschreibung || null,
      zone.polygon_koordinaten,
      zone.farbe,
      zone.erstellt_am,
    ]
  );

  return zone;
};

export const getSicherheitszonen = async (jagdId: string): Promise<Sicherheitszone[]> => {
  const db = await initDatabase();
  const result = db.exec(
    'SELECT * FROM jagd_sicherheitszonen WHERE jagd_id = ? ORDER BY name',
    [jagdId]
  );

  if (!result.length || !result[0].values.length) {
    return [];
  }

  const row = result[0];
  return row.values.map((values) => {
    const obj: any = {};
    row.columns.forEach((col, idx) => {
      obj[col] = values[idx];
    });
    return obj as Sicherheitszone;
  });
};

export const deleteSicherheitszone = async (id: string): Promise<boolean> => {
  const db = await initDatabase();
  db.run('DELETE FROM jagd_sicherheitszonen WHERE id = ?', [id]);
  return true;
};

// ===================================
// STATISTIK
// ===================================

export const getJagdStatistik = async (jagdId: string): Promise<JagdStatistik> => {
  const db = await initDatabase();

  // Get participant counts
  const teilnehmerResult = db.exec(
    `SELECT 
      COUNT(*) as gesamt,
      SUM(CASE WHEN rolle = 'jaeger' THEN 1 ELSE 0 END) as jaeger,
      SUM(CASE WHEN rolle = 'treiber' THEN 1 ELSE 0 END) as treiber
    FROM jagd_teilnehmer WHERE jagd_id = ?`,
    [jagdId]
  );

  // Get location counts
  const standorteResult = db.exec(
    `SELECT 
      COUNT(*) as gesamt,
      SUM(CASE WHEN zugewiesener_jaeger_id IS NOT NULL THEN 1 ELSE 0 END) as zugewiesen,
      SUM(CASE WHEN zugewiesener_jaeger_id IS NULL THEN 1 ELSE 0 END) as offen
    FROM jagd_standorte WHERE jagd_id = ?`,
    [jagdId]
  );

  // Get safety zone count
  const zonenResult = db.exec(
    'SELECT COUNT(*) as anzahl FROM jagd_sicherheitszonen WHERE jagd_id = ?',
    [jagdId]
  );

  const teilnehmer = teilnehmerResult[0]?.values[0] || [0, 0, 0];
  const standorte = standorteResult[0]?.values[0] || [0, 0, 0];
  const zonen = zonenResult[0]?.values[0] || [0];

  return {
    jagd_id: jagdId,
    anzahl_teilnehmer_gesamt: Number(teilnehmer[0]),
    anzahl_jaeger: Number(teilnehmer[1]),
    anzahl_treiber: Number(teilnehmer[2]),
    anzahl_standorte_gesamt: Number(standorte[0]),
    anzahl_standorte_zugewiesen: Number(standorte[1]),
    anzahl_standorte_offen: Number(standorte[2]),
    anzahl_sicherheitszonen: Number(zonen[0]),
  };
};
