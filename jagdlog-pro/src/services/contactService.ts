/**
 * HNTR LEGEND Pro - Contact Service
 * Lokale Kontaktverwaltung
 */

import { getDatabase, generateUUID, now } from '../data/db';
import { Kontakt, KontaktTyp, KontaktLink } from '../types';

/**
 * Speichert einen neuen Kontakt
 */
export const saveContact = async (
  kontakt: Omit<Kontakt, 'id' | 'erstelltAm' | 'aktualisiertAm' | 'syncStatus' | 'version'>
): Promise<string> => {
  const db = await getDatabase();
  const id = generateUUID();
  const jetzt = now();

  await db.runAsync(
    `INSERT INTO kontakte (
      id, name, typ, telefon, telefon_mobil, email,
      strasse, plz, ort, notizen, tags, favorit,
      erstellt_am, aktualisiert_am, sync_status, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      kontakt.name,
      kontakt.typ,
      kontakt.telefon ?? null,
      kontakt.telefonMobil ?? null,
      kontakt.email ?? null,
      kontakt.strasse ?? null,
      kontakt.plz ?? null,
      kontakt.ort ?? null,
      kontakt.notizen ?? null,
      JSON.stringify(kontakt.tags ?? []),
      kontakt.favorit ? 1 : 0,
      jetzt,
      jetzt,
      'lokal',
      1,
    ]
  );

  return id;
};

/**
 * Lädt alle Kontakte
 */
export const getContacts = async (filterTyp?: KontaktTyp): Promise<Kontakt[]> => {
  const db = await getDatabase();

  let sql = 'SELECT * FROM kontakte WHERE geloescht_am IS NULL';
  const params: string[] = [];

  if (filterTyp) {
    sql += ' AND typ = ?';
    params.push(filterTyp);
  }

  sql += ' ORDER BY favorit DESC, name';

  const rows = await db.getAllAsync<Record<string, unknown>>(sql, params);

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    typ: row.typ as KontaktTyp,
    telefon: row.telefon as string | undefined,
    telefonMobil: row.telefon_mobil as string | undefined,
    email: row.email as string | undefined,
    strasse: row.strasse as string | undefined,
    plz: row.plz as string | undefined,
    ort: row.ort as string | undefined,
    notizen: row.notizen as string | undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    favorit: row.favorit === 1,
    erstelltAm: row.erstellt_am as string,
    aktualisiertAm: row.aktualisiert_am as string,
    syncStatus: row.sync_status as 'lokal' | 'synchronisiert' | 'konflikt',
    version: row.version as number,
    geloeschtAm: row.geloescht_am as string | null,
  }));
};

/**
 * Lädt einen einzelnen Kontakt
 */
export const getContact = async (id: string): Promise<Kontakt | null> => {
  const db = await getDatabase();

  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM kontakte WHERE id = ?',
    [id]
  );

  if (!row) return null;

  return {
    id: row.id as string,
    name: row.name as string,
    typ: row.typ as KontaktTyp,
    telefon: row.telefon as string | undefined,
    telefonMobil: row.telefon_mobil as string | undefined,
    email: row.email as string | undefined,
    strasse: row.strasse as string | undefined,
    plz: row.plz as string | undefined,
    ort: row.ort as string | undefined,
    notizen: row.notizen as string | undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    favorit: row.favorit === 1,
    erstelltAm: row.erstellt_am as string,
    aktualisiertAm: row.aktualisiert_am as string,
    syncStatus: row.sync_status as 'lokal' | 'synchronisiert' | 'konflikt',
    version: row.version as number,
    geloeschtAm: row.geloescht_am as string | null,
  };
};

/**
 * Aktualisiert einen Kontakt
 */
export const updateContact = async (id: string, updates: Partial<Kontakt>): Promise<void> => {
  const db = await getDatabase();
  const jetzt = now();

  const fields: string[] = ['aktualisiert_am = ?'];
  const params: (string | number | null)[] = [jetzt];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.typ !== undefined) {
    fields.push('typ = ?');
    params.push(updates.typ);
  }
  if (updates.telefon !== undefined) {
    fields.push('telefon = ?');
    params.push(updates.telefon ?? null);
  }
  if (updates.favorit !== undefined) {
    fields.push('favorit = ?');
    params.push(updates.favorit ? 1 : 0);
  }

  params.push(id);

  await db.runAsync(`UPDATE kontakte SET ${fields.join(', ')} WHERE id = ?`, params);
};

/**
 * Löscht einen Kontakt (Soft Delete)
 */
export const deleteContact = async (id: string): Promise<void> => {
  const db = await getDatabase();
  const jetzt = now();

  await db.runAsync(
    'UPDATE kontakte SET geloescht_am = ?, aktualisiert_am = ? WHERE id = ?',
    [jetzt, jetzt, id]
  );
};

/**
 * Verknüpft einen Kontakt mit einem Eintrag
 */
export const linkContactToEntry = async (
  kontaktId: string,
  eintragId: string,
  rolle?: string
): Promise<string> => {
  const db = await getDatabase();
  const id = generateUUID();
  const jetzt = now();

  await db.runAsync(
    `INSERT INTO kontakt_links (id, kontakt_id, ziel_typ, ziel_id, rolle, erstellt_am)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, kontaktId, 'eintrag', eintragId, rolle ?? null, jetzt]
  );

  return id;
};

/**
 * Sucht Kontakte
 */
export const searchContacts = async (suchbegriff: string): Promise<Kontakt[]> => {
  const db = await getDatabase();

  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM kontakte
     WHERE geloescht_am IS NULL
     AND (name LIKE ? OR ort LIKE ? OR notizen LIKE ?)
     ORDER BY favorit DESC, name`,
    [`%${suchbegriff}%`, `%${suchbegriff}%`, `%${suchbegriff}%`]
  );

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    typ: row.typ as KontaktTyp,
    telefon: row.telefon as string | undefined,
    telefonMobil: row.telefon_mobil as string | undefined,
    email: row.email as string | undefined,
    strasse: row.strasse as string | undefined,
    plz: row.plz as string | undefined,
    ort: row.ort as string | undefined,
    notizen: row.notizen as string | undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    favorit: row.favorit === 1,
    erstelltAm: row.erstellt_am as string,
    aktualisiertAm: row.aktualisiert_am as string,
    syncStatus: 'lokal' as const,
    version: row.version as number,
    geloeschtAm: row.geloescht_am as string | null,
  }));
};
