/**
 * HNTR LEGEND Pro - SQLite Datenbank-Initialisierung
 * Offline-First Speicherung mit expo-sqlite
 */

import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL, INDICES_SQL, DB_VERSION } from './schema';
import { runMigrations, getCurrentDbVersion, setDbVersion } from './migrations';

// Datenbankname
const DB_NAME = 'jagdlog-pro.db';

// Singleton-Instanz
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Gibt die Datenbankinstanz zurück (öffnet sie bei Bedarf)
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  console.log('[DB] Öffne Datenbank...');

  try {
    // Datenbank öffnen
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);

    // WAL-Modus für bessere Performance
    await dbInstance.execAsync('PRAGMA journal_mode = WAL;');

    // Foreign Keys aktivieren
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');

    console.log('[DB] Datenbank geöffnet');

    // Schema initialisieren
    await initializeSchema(dbInstance);

    return dbInstance;
  } catch (error) {
    console.error('[DB] Fehler beim Öffnen der Datenbank:', error);
    throw error;
  }
};

/**
 * Initialisiert das Datenbankschema
 */
const initializeSchema = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('[DB] Initialisiere Schema...');

  try {
    // Alle Tabellen erstellen
    for (const [tableName, sql] of Object.entries(SCHEMA_SQL)) {
      console.log(`[DB] Erstelle Tabelle: ${tableName}`);
      await db.execAsync(sql);
    }

    // Indizes erstellen
    for (const indexSql of INDICES_SQL) {
      await db.execAsync(indexSql);
    }

    // Aktuelle DB-Version prüfen
    const aktuelleVersion = await getCurrentDbVersion(db);

    // Migrationen ausführen wenn nötig
    if (aktuelleVersion < DB_VERSION) {
      await runMigrations(db, aktuelleVersion, DB_VERSION);
      await setDbVersion(db, DB_VERSION);
    }

    console.log('[DB] Schema initialisiert');
  } catch (error) {
    console.error('[DB] Fehler bei Schema-Initialisierung:', error);
    throw error;
  }
};

/**
 * Schließt die Datenbankverbindung
 */
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    console.log('[DB] Schließe Datenbank...');
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log('[DB] Datenbank geschlossen');
  }
};

/**
 * Führt eine Transaktion aus
 */
export const runTransaction = async <T>(
  operation: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> => {
  const db = await getDatabase();

  try {
    await db.execAsync('BEGIN TRANSACTION;');
    const result = await operation(db);
    await db.execAsync('COMMIT;');
    return result;
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
};

/**
 * Hilfsfunktion: Generiert eine UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Hilfsfunktion: Aktueller ISO-Timestamp
 */
export const now = (): string => {
  return new Date().toISOString();
};

/**
 * Löscht die gesamte Datenbank (für Debugging/Reset)
 */
export const resetDatabase = async (): Promise<void> => {
  console.log('[DB] WARNUNG: Datenbank wird zurückgesetzt!');

  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }

  // Datenbank löschen durch Neuerstellung mit leeren Tabellen
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Alle Tabellen droppen
  for (const tableName of Object.keys(SCHEMA_SQL)) {
    await db.execAsync(`DROP TABLE IF EXISTS ${tableName};`);
  }

  await db.closeAsync();

  console.log('[DB] Datenbank zurückgesetzt');
};
