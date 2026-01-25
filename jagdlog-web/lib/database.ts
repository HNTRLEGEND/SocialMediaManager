/**
 * HNTR LEGEND Web - Datenbank-Layer mit SQL.js
 * Identisches Schema wie Mobile App für perfekte Sync
 */

import initSqlJs, { Database } from 'sql.js';

const DB_NAME = 'jagdlog-web.db';
let dbInstance: Database | null = null;
let SQL: any = null;

/**
 * Initialisiert SQL.js
 */
export const initDatabase = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;

  console.log('[DB] Initialisiere SQL.js...');

  try {
    // SQL.js laden
    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: (file) => `/sql-wasm.wasm`,
      });
    }

    // Bestehende DB aus IndexedDB laden oder neue erstellen
    const savedDb = await loadDatabaseFromIndexedDB();
    
    if (savedDb) {
      dbInstance = new SQL.Database(new Uint8Array(savedDb));
      console.log('[DB] Datenbank aus IndexedDB geladen');
    } else {
      dbInstance = new SQL.Database();
      console.log('[DB] Neue Datenbank erstellt');
    }

    // Schema initialisieren
    await initializeSchema(dbInstance);

    // Auto-Save nach jeder Änderung
    setupAutoSave(dbInstance);

    return dbInstance;
  } catch (error) {
    console.error('[DB] Fehler bei DB-Initialisierung:', error);
    throw error;
  }
};

/**
 * Erstellt das komplette Datenbankschema (identisch zur Mobile App)
 */
const initializeSchema = async (db: Database): Promise<void> => {
  console.log('[DB] Erstelle Schema...');

  const tables = [
    // Settings
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,

    // Users (für Web-App Auth)
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL,
      last_login TEXT,
      sync_token TEXT
    )`,

    // Reviere
    `CREATE TABLE IF NOT EXISTS reviere (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      beschreibung TEXT,
      bundesland TEXT NOT NULL,
      flaeche_hektar REAL,
      plan TEXT DEFAULT 'free',
      grenze_geo_json TEXT,
      erstellt_am TEXT NOT NULL,
      aktualisiert_am TEXT NOT NULL,
      sync_status TEXT DEFAULT 'lokal',
      version INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Jagd-Einträge
    `CREATE TABLE IF NOT EXISTS eintraege (
      id TEXT PRIMARY KEY,
      revier_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      typ TEXT NOT NULL,
      zeitpunkt TEXT NOT NULL,
      gps_lat REAL,
      gps_lon REAL,
      gps_accuracy REAL,
      ort_beschreibung TEXT,
      wildart_id TEXT NOT NULL,
      wildart_name TEXT NOT NULL,
      anzahl INTEGER DEFAULT 1,
      jagdart TEXT,
      wetter_json TEXT,
      notizen TEXT,
      foto_ids TEXT,
      sichtbarkeit TEXT DEFAULT 'revier',
      details_json TEXT,
      erstellt_am TEXT NOT NULL,
      aktualisiert_am TEXT NOT NULL,
      erstellt_von TEXT,
      sync_status TEXT DEFAULT 'lokal',
      version INTEGER DEFAULT 1,
      geloescht_am TEXT,
      FOREIGN KEY (revier_id) REFERENCES reviere(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Shot Analysis Results
    `CREATE TABLE IF NOT EXISTS shot_analysis (
      id TEXT PRIMARY KEY,
      eintrag_id TEXT NOT NULL,
      hit_zone TEXT NOT NULL,
      confidence REAL NOT NULL,
      wait_time_min INTEGER NOT NULL,
      wait_time_optimal INTEGER NOT NULL,
      wait_time_max INTEGER NOT NULL,
      dog_required BOOLEAN NOT NULL,
      dog_type TEXT,
      blood_color TEXT,
      blood_amount TEXT,
      blood_distribution TEXT,
      wild_reaction TEXT,
      prediction_zones TEXT,
      erstellt_am TEXT NOT NULL,
      FOREIGN KEY (eintrag_id) REFERENCES eintraege(id)
    )`,

    // GPS Tracking Data
    `CREATE TABLE IF NOT EXISTS tracking_data (
      id TEXT PRIMARY KEY,
      eintrag_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      gps_lat REAL NOT NULL,
      gps_lon REAL NOT NULL,
      accuracy REAL,
      altitude REAL,
      speed REAL,
      heading REAL,
      FOREIGN KEY (eintrag_id) REFERENCES eintraege(id)
    )`,

    // Medien/Fotos
    `CREATE TABLE IF NOT EXISTS medien (
      id TEXT PRIMARY KEY,
      eintrag_id TEXT,
      map_feature_id TEXT,
      lokale_uri TEXT NOT NULL,
      remote_uri TEXT,
      thumbnail_uri TEXT,
      dateiname TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      groesse_bytes INTEGER,
      breite INTEGER,
      hoehe INTEGER,
      aufnahme_zeitpunkt TEXT,
      aufnahme_gps_lat REAL,
      aufnahme_gps_lon REAL,
      erstellt_am TEXT NOT NULL,
      sync_status TEXT DEFAULT 'lokal',
      FOREIGN KEY (eintrag_id) REFERENCES eintraege(id)
    )`,

    // Map Features (POIs, Wildkameras, etc.)
    `CREATE TABLE IF NOT EXISTS map_features (
      id TEXT PRIMARY KEY,
      revier_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      typ TEXT NOT NULL,
      name TEXT NOT NULL,
      beschreibung TEXT,
      geometry_type TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      poi_kategorie TEXT,
      poi_status TEXT,
      letzte_kontrolle TEXT,
      naechste_kontrolle TEXT,
      foto_ids TEXT,
      icon TEXT,
      farbe TEXT,
      erstellt_am TEXT NOT NULL,
      aktualisiert_am TEXT NOT NULL,
      sync_status TEXT DEFAULT 'lokal',
      version INTEGER DEFAULT 1,
      geloescht_am TEXT,
      FOREIGN KEY (revier_id) REFERENCES reviere(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Training Data Uploads
    `CREATE TABLE IF NOT EXISTS training_uploads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      data_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      wildart TEXT,
      quality_score REAL,
      metadata_json TEXT,
      upload_status TEXT DEFAULT 'pending',
      uploaded_at TEXT,
      points INTEGER DEFAULT 0,
      erstellt_am TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Sync Queue
    `CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      last_attempt TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL
    )`,
  ];

  // Tabellen erstellen
  for (const sql of tables) {
    db.exec(sql);
  }

  // Indizes erstellen
  const indices = [
    'CREATE INDEX IF NOT EXISTS idx_eintraege_revier ON eintraege(revier_id)',
    'CREATE INDEX IF NOT EXISTS idx_eintraege_user ON eintraege(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_eintraege_typ ON eintraege(typ)',
    'CREATE INDEX IF NOT EXISTS idx_eintraege_zeitpunkt ON eintraege(zeitpunkt)',
    'CREATE INDEX IF NOT EXISTS idx_tracking_eintrag ON tracking_data(eintrag_id)',
    'CREATE INDEX IF NOT EXISTS idx_medien_eintrag ON medien(eintrag_id)',
    'CREATE INDEX IF NOT EXISTS idx_map_features_revier ON map_features(revier_id)',
    'CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status)',
  ];

  for (const sql of indices) {
    db.exec(sql);
  }

  console.log('[DB] Schema erstellt');
};

/**
 * Speichert DB in IndexedDB
 */
const saveDatabaseToIndexedDB = async (db: Database): Promise<void> => {
  const data = db.export();
  const blob = new Blob([data], { type: 'application/octet-stream' });

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HNTRLegendDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['database'], 'readwrite');
      const store = transaction.objectStore('database');
      const putRequest = store.put(blob, 'main');

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('database')) {
        db.createObjectStore('database');
      }
    };
  });
};

/**
 * Lädt DB aus IndexedDB
 */
const loadDatabaseFromIndexedDB = async (): Promise<ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HNTRLegendDB', 1);

    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('database')) {
        resolve(null);
        return;
      }

      const transaction = db.transaction(['database'], 'readonly');
      const store = transaction.objectStore('database');
      const getRequest = store.get('main');

      getRequest.onsuccess = async () => {
        const blob = getRequest.result as Blob;
        if (!blob) {
          resolve(null);
          return;
        }
        const buffer = await blob.arrayBuffer();
        resolve(buffer);
      };

      getRequest.onerror = () => resolve(null);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('database')) {
        db.createObjectStore('database');
      }
    };
  });
};

/**
 * Auto-Save nach jeder Änderung
 */
let saveTimeout: NodeJS.Timeout | null = null;
const setupAutoSave = (db: Database) => {
  // Debounced save (alle 2 Sekunden)
  const save = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveDatabaseToIndexedDB(db).catch((err) =>
        console.error('[DB] Auto-Save Fehler:', err)
      );
    }, 2000);
  };

  // Save bei jeder DB-Operation triggern
  const originalExec = db.exec.bind(db);
  db.exec = function (...args) {
    const result = originalExec(...args);
    save();
    return result;
  };

  const originalRun = db.run.bind(db);
  db.run = function (...args) {
    const result = originalRun(...args);
    save();
    return result;
  };
};

/**
 * Hilfsfunktionen
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const now = (): string => {
  return new Date().toISOString();
};

/**
 * Export DB als Backup
 */
export const exportDatabase = async (): Promise<Blob> => {
  const db = await initDatabase();
  const data = db.export();
  return new Blob([data], { type: 'application/octet-stream' });
};

/**
 * Import DB from Backup
 */
export const importDatabase = async (file: File): Promise<void> => {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  const SQL = await initSqlJs({
    locateFile: (file) => `/sql-wasm.wasm`,
  });

  dbInstance = new SQL.Database(data);
  await saveDatabaseToIndexedDB(dbInstance);
  
  console.log('[DB] Datenbank importiert');
};

export { dbInstance };
