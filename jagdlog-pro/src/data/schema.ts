/**
 * HNTR LEGEND Pro - SQLite Schema Definitionen
 */

// Tabellen-Erstellungs-SQL
export const SCHEMA_SQL = {
  // Einstellungen
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,

  // Reviere
  reviere: `
    CREATE TABLE IF NOT EXISTS reviere (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      beschreibung TEXT,
      bundesland TEXT NOT NULL,
      flaeche_hektar REAL,
      plan TEXT DEFAULT 'free',
      grenze_geo_json TEXT,
      erstellt_am TEXT NOT NULL,
      aktualisiert_am TEXT NOT NULL,
      sync_status TEXT DEFAULT 'lokal',
      version INTEGER DEFAULT 1
    );
  `,

  // Revier-Mitglieder
  revier_mitglieder: `
    CREATE TABLE IF NOT EXISTS revier_mitglieder (
      id TEXT PRIMARY KEY,
      revier_id TEXT NOT NULL,
      user_id TEXT,
      name TEXT NOT NULL,
      email TEXT,
      telefon TEXT,
      rolle TEXT NOT NULL,
      gueltig_von TEXT,
      gueltig_bis TEXT,
      zone_ids TEXT,
      einladungs_status TEXT DEFAULT 'aktiv',
      erstellt_am TEXT NOT NULL,
      aktualisiert_am TEXT NOT NULL,
      FOREIGN KEY (revier_id) REFERENCES reviere(id)
    );
  `,

  // Jagd-Einträge (alle Typen in einer Tabelle)
  eintraege: `
    CREATE TABLE IF NOT EXISTS eintraege (
      id TEXT PRIMARY KEY,
      revier_id TEXT NOT NULL,
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
      FOREIGN KEY (revier_id) REFERENCES reviere(id)
    );
  `,

  // Medien/Fotos
  medien: `
    CREATE TABLE IF NOT EXISTS medien (
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
      FOREIGN KEY (eintrag_id) REFERENCES eintraege(id),
      FOREIGN KEY (map_feature_id) REFERENCES map_features(id)
    );
  `,

  // Karten-Features (POIs, Grenzen, Zonen, Tracks)
  map_features: `
    CREATE TABLE IF NOT EXISTS map_features (
      id TEXT PRIMARY KEY,
      revier_id TEXT NOT NULL,
      typ TEXT NOT NULL,
      name TEXT NOT NULL,
      beschreibung TEXT,
      geometry_type TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      poi_kategorie TEXT,
      poi_status TEXT,
      letzte_kontrolle TEXT,
      naechste_kontrolle TEXT,
      zonen_typ TEXT,
      foto_ids TEXT,
      icon TEXT,
      farbe TEXT,
      erstellt_am TEXT NOT NULL,
      aktualisiert_am TEXT NOT NULL,
      erstellt_von TEXT,
      sync_status TEXT DEFAULT 'lokal',
      version INTEGER DEFAULT 1,
      geloescht_am TEXT,
      FOREIGN KEY (revier_id) REFERENCES reviere(id)
    );
  `,

  // Kontakte
  kontakte: `
    CREATE TABLE IF NOT EXISTS kontakte (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      typ TEXT NOT NULL,
      telefon TEXT,
      telefon_mobil TEXT,
      email TEXT,
      strasse TEXT,
      plz TEXT,
      ort TEXT,
      notizen TEXT,
      tags TEXT,
      favorit INTEGER DEFAULT 0,
      erstellt_am TEXT NOT NULL,
      aktualisiert_am TEXT NOT NULL,
      sync_status TEXT DEFAULT 'lokal',
      version INTEGER DEFAULT 1,
      geloescht_am TEXT
    );
  `,

  // Kontakt-Verknüpfungen
  kontakt_links: `
    CREATE TABLE IF NOT EXISTS kontakt_links (
      id TEXT PRIMARY KEY,
      kontakt_id TEXT NOT NULL,
      ziel_typ TEXT NOT NULL,
      ziel_id TEXT NOT NULL,
      rolle TEXT,
      erstellt_am TEXT NOT NULL,
      FOREIGN KEY (kontakt_id) REFERENCES kontakte(id)
    );
  `,

  // Sync-Jobs (für spätere Cloud-Anbindung)
  sync_jobs: `
    CREATE TABLE IF NOT EXISTS sync_jobs (
      id TEXT PRIMARY KEY,
      aktion TEXT NOT NULL,
      entitaet_typ TEXT NOT NULL,
      entitaet_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      versuche INTEGER DEFAULT 0,
      letzter_versuch TEXT,
      fehler_meldung TEXT,
      erstellt_am TEXT NOT NULL
    );
  `,
};

// Indizes für bessere Performance
export const INDICES_SQL = [
  'CREATE INDEX IF NOT EXISTS idx_eintraege_revier ON eintraege(revier_id);',
  'CREATE INDEX IF NOT EXISTS idx_eintraege_typ ON eintraege(typ);',
  'CREATE INDEX IF NOT EXISTS idx_eintraege_zeitpunkt ON eintraege(zeitpunkt);',
  'CREATE INDEX IF NOT EXISTS idx_eintraege_wildart ON eintraege(wildart_id);',
  'CREATE INDEX IF NOT EXISTS idx_eintraege_geloescht ON eintraege(geloescht_am);',
  'CREATE INDEX IF NOT EXISTS idx_map_features_revier ON map_features(revier_id);',
  'CREATE INDEX IF NOT EXISTS idx_map_features_typ ON map_features(typ);',
  'CREATE INDEX IF NOT EXISTS idx_medien_eintrag ON medien(eintrag_id);',
  'CREATE INDEX IF NOT EXISTS idx_kontakt_links_kontakt ON kontakt_links(kontakt_id);',
  'CREATE INDEX IF NOT EXISTS idx_kontakt_links_ziel ON kontakt_links(ziel_typ, ziel_id);',
  'CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);',
];

// Datenbank-Version für Migrationen
export const DB_VERSION = 1;
