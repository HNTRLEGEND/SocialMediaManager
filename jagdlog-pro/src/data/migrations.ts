/**
 * HNTR LEGEND Pro - Datenbank-Migrationen
 * Ermöglicht Schemaänderungen zwischen App-Versionen
 */

import type { SQLiteDatabase } from 'expo-sqlite';

// Migration-Definition
export interface Migration {
  version: number;
  beschreibung: string;
  up: (db: SQLiteDatabase) => Promise<void>;
  down?: (db: SQLiteDatabase) => Promise<void>;
}

/**
 * Alle Migrationen in chronologischer Reihenfolge
 */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    beschreibung: 'Initiales Schema erstellen',
    up: async (db: SQLiteDatabase) => {
      // Diese Migration wird automatisch beim ersten Start ausgeführt
      // Das Schema wird in db.ts direkt erstellt
      console.log('[Migration 1] Initiales Schema bereits durch db.ts erstellt');
    },
  },
  // Zukünftige Migrationen hier hinzufügen:
  // {
  //   version: 2,
  //   beschreibung: 'Neue Spalte X zu Tabelle Y hinzufügen',
  //   up: async (db) => {
  //     await db.execAsync('ALTER TABLE y ADD COLUMN x TEXT;');
  //   },
  // },
];

/**
 * Führt alle ausstehenden Migrationen aus
 */
export const runMigrations = async (
  db: SQLiteDatabase,
  aktuelleVersion: number,
  zielVersion: number
): Promise<void> => {
  console.log(`[Migrations] Prüfe Migrationen von Version ${aktuelleVersion} auf ${zielVersion}`);

  // Aufsteigende Migrationen
  for (const migration of MIGRATIONS) {
    if (migration.version > aktuelleVersion && migration.version <= zielVersion) {
      console.log(`[Migration ${migration.version}] ${migration.beschreibung}`);
      try {
        await migration.up(db);
        console.log(`[Migration ${migration.version}] Erfolgreich abgeschlossen`);
      } catch (error) {
        console.error(`[Migration ${migration.version}] Fehler:`, error);
        throw error;
      }
    }
  }

  console.log('[Migrations] Alle Migrationen abgeschlossen');
};

/**
 * Holt die aktuelle Datenbankversion aus den Settings
 */
export const getCurrentDbVersion = async (db: SQLiteDatabase): Promise<number> => {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      ['db_version']
    );
    return result ? parseInt(result.value, 10) : 0;
  } catch {
    // Tabelle existiert noch nicht
    return 0;
  }
};

/**
 * Speichert die aktuelle Datenbankversion
 */
export const setDbVersion = async (db: SQLiteDatabase, version: number): Promise<void> => {
  const jetzt = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    ['db_version', version.toString(), jetzt]
  );
};
