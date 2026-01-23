-- MIGRATION 007: WILDKAMERA INTEGRATION (Phase 5 Enhancement)
-- Adds trail camera (Wildkamera) support and photo gallery
-- Version: 1.0.0
-- Date: 2026-01-22

-- ============================================================================
-- WILDKAMERAS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS wildkameras (
  id TEXT PRIMARY KEY NOT NULL,
  revier_id TEXT NOT NULL,
  name TEXT NOT NULL,
  marke TEXT NOT NULL CHECK (marke IN (
    'ICUSERVER', 'Zeiss', 'Spypoint', 'Browning', 'Bushnell',
    'Wildkamera24', 'Seissiger', 'Dörr', 'Reconyx', 'Cuddeback', 
    'Moultrie', 'Generic'
  )),
  modell TEXT NOT NULL,
  
  -- Standort
  gps_latitude REAL NOT NULL,
  gps_longitude REAL NOT NULL,
  poi_id TEXT, -- Verknüpfung zu POI
  ausrichtung INTEGER NOT NULL DEFAULT 0 CHECK (ausrichtung >= 0 AND ausrichtung <= 360),
  sichtfeld_winkel INTEGER NOT NULL DEFAULT 52, -- Grad
  sichtfeld_reichweite INTEGER NOT NULL DEFAULT 20, -- Meter
  
  -- Verbindung
  verbindung_typ TEXT NOT NULL CHECK (verbindung_typ IN (
    'wifi', 'bluetooth', 'cellular', 'sd_card', 'cloud_sync'
  )),
  verbindung_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (verbindung_status IN (
    'connected', 'disconnected', 'error', 'syncing'
  )),
  verbindung_letzte DATETIME,
  batterie INTEGER NOT NULL DEFAULT 100 CHECK (batterie >= 0 AND batterie <= 100),
  speicher_gesamt INTEGER NOT NULL DEFAULT 0, -- MB
  speicher_belegt INTEGER NOT NULL DEFAULT 0, -- MB
  speicher_frei INTEGER NOT NULL DEFAULT 0, -- MB
  
  -- Cloud Config (JSON)
  cloud_config TEXT, -- JSON: { apiEndpoint, apiKey, autoSync, syncInterval }
  
  -- Einstellungen (JSON)
  einstellungen TEXT NOT NULL, -- JSON: { aufloesungFoto, nachtmodus, etc. }
  
  -- Statistiken (JSON)
  statistik TEXT NOT NULL DEFAULT '{}', -- JSON: { totalFotos, totalVideos, etc. }
  
  -- Metadaten
  erstellt_am DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aktualisiert_am DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  geloescht_am DATETIME,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE,
  FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE SET NULL
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_wildkameras_revier ON wildkameras(revier_id);
CREATE INDEX IF NOT EXISTS idx_wildkameras_poi ON wildkameras(poi_id);
CREATE INDEX IF NOT EXISTS idx_wildkameras_status ON wildkameras(verbindung_status);
CREATE INDEX IF NOT EXISTS idx_wildkameras_gps ON wildkameras(gps_latitude, gps_longitude);

-- ============================================================================
-- WILDKAMERA MEDIA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS wildkamera_media (
  id TEXT PRIMARY KEY NOT NULL,
  wildkamera_id TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('foto', 'video')),
  
  -- Datei
  uri TEXT NOT NULL, -- Lokaler Dateipfad
  thumbnail TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  dateigroesse INTEGER NOT NULL DEFAULT 0, -- Bytes
  
  -- Metadaten
  zeitpunkt DATETIME NOT NULL,
  gps_latitude REAL NOT NULL, -- Von Wildkamera übernommen
  gps_longitude REAL NOT NULL,
  
  -- KI-Analyse (JSON)
  ai_analyse TEXT, -- JSON: { status, wildart, confidence, geschlecht, etc. }
  
  -- Galerie-Verknüpfung
  galerie_foto_id TEXT, -- Wenn in Galerie übernommen
  
  -- Import Info
  importiert_am DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verarbeitet BOOLEAN NOT NULL DEFAULT 0,
  
  -- Metadaten
  erstellt_am DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  geloescht_am DATETIME,
  
  FOREIGN KEY (wildkamera_id) REFERENCES wildkameras(id) ON DELETE CASCADE,
  FOREIGN KEY (galerie_foto_id) REFERENCES galerie_fotos(id) ON DELETE SET NULL
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_wildkamera_media_kamera ON wildkamera_media(wildkamera_id);
CREATE INDEX IF NOT EXISTS idx_wildkamera_media_zeitpunkt ON wildkamera_media(zeitpunkt);
CREATE INDEX IF NOT EXISTS idx_wildkamera_media_verarbeitet ON wildkamera_media(verarbeitet);
CREATE INDEX IF NOT EXISTS idx_wildkamera_media_galerie ON wildkamera_media(galerie_foto_id);

-- ============================================================================
-- GALERIE FOTOS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS galerie_fotos (
  id TEXT PRIMARY KEY NOT NULL,
  revier_id TEXT NOT NULL,
  
  -- Datei
  uri TEXT NOT NULL, -- Lokaler Dateipfad
  thumbnail TEXT NOT NULL,
  dateigroesse INTEGER NOT NULL DEFAULT 0, -- Bytes
  aufloesung_width INTEGER,
  aufloesung_height INTEGER,
  
  -- GPS & Zeit
  gps_latitude REAL NOT NULL,
  gps_longitude REAL NOT NULL,
  zeitpunkt DATETIME NOT NULL,
  
  -- Kategorisierung
  kategorie TEXT NOT NULL CHECK (kategorie IN (
    'sichtung', 'abschuss', 'trophae', 'revier', 
    'infrastruktur', 'wildschaden', 'wildkamera', 'sonstiges'
  )),
  quelle TEXT NOT NULL CHECK (quelle IN ('kamera', 'galerie', 'wildkamera')),
  
  -- KI-Analyse (JSON)
  ai_analyse TEXT NOT NULL, -- JSON: { status, wildart, confidence, geschlecht, etc. }
  
  -- Verknüpfungen
  eintrag_id TEXT, -- Link zu Jagd-Eintrag
  wildkamera_id TEXT, -- Link zu Wildkamera
  
  -- Metadaten
  erstellt_am DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  geloescht_am DATETIME,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE,
  FOREIGN KEY (eintrag_id) REFERENCES eintraege(id) ON DELETE SET NULL,
  FOREIGN KEY (wildkamera_id) REFERENCES wildkameras(id) ON DELETE SET NULL
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_galerie_fotos_revier ON galerie_fotos(revier_id);
CREATE INDEX IF NOT EXISTS idx_galerie_fotos_kategorie ON galerie_fotos(kategorie);
CREATE INDEX IF NOT EXISTS idx_galerie_fotos_quelle ON galerie_fotos(quelle);
CREATE INDEX IF NOT EXISTS idx_galerie_fotos_zeitpunkt ON galerie_fotos(zeitpunkt);
CREATE INDEX IF NOT EXISTS idx_galerie_fotos_eintrag ON galerie_fotos(eintrag_id);
CREATE INDEX IF NOT EXISTS idx_galerie_fotos_wildkamera ON galerie_fotos(wildkamera_id);
CREATE INDEX IF NOT EXISTS idx_galerie_fotos_gps ON galerie_fotos(gps_latitude, gps_longitude);

-- Full-Text Search für AI-Analyse
CREATE VIRTUAL TABLE IF NOT EXISTS galerie_fotos_fts USING fts5(
  wildart,
  geschlecht,
  altersklasse,
  content=galerie_fotos,
  content_rowid=rowid
);

-- Trigger für FTS Sync
CREATE TRIGGER IF NOT EXISTS galerie_fotos_fts_insert AFTER INSERT ON galerie_fotos BEGIN
  INSERT INTO galerie_fotos_fts(rowid, wildart, geschlecht, altersklasse)
  SELECT 
    NEW.rowid,
    json_extract(NEW.ai_analyse, '$.wildart'),
    json_extract(NEW.ai_analyse, '$.geschlecht'),
    json_extract(NEW.ai_analyse, '$.altersklasse');
END;

CREATE TRIGGER IF NOT EXISTS galerie_fotos_fts_delete AFTER DELETE ON galerie_fotos BEGIN
  DELETE FROM galerie_fotos_fts WHERE rowid = OLD.rowid;
END;

CREATE TRIGGER IF NOT EXISTS galerie_fotos_fts_update AFTER UPDATE ON galerie_fotos BEGIN
  DELETE FROM galerie_fotos_fts WHERE rowid = OLD.rowid;
  INSERT INTO galerie_fotos_fts(rowid, wildart, geschlecht, altersklasse)
  SELECT 
    NEW.rowid,
    json_extract(NEW.ai_analyse, '$.wildart'),
    json_extract(NEW.ai_analyse, '$.geschlecht'),
    json_extract(NEW.ai_analyse, '$.altersklasse');
END;

-- ============================================================================
-- UPDATE TRIGGERS (aktualisiert_am)
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS update_wildkameras_timestamp 
  AFTER UPDATE ON wildkameras
  FOR EACH ROW
BEGIN
  UPDATE wildkameras SET aktualisiert_am = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- VIEWS (Convenience)
-- ============================================================================

-- Wildkamera mit Statistiken
CREATE VIEW IF NOT EXISTS v_wildkameras_overview AS
SELECT 
  w.*,
  COUNT(DISTINCT wm.id) as total_media,
  COUNT(DISTINCT CASE WHEN wm.typ = 'foto' THEN wm.id END) as total_fotos,
  COUNT(DISTINCT CASE WHEN wm.typ = 'video' THEN wm.id END) as total_videos,
  MAX(wm.zeitpunkt) as letzte_aufnahme,
  COUNT(DISTINCT CASE WHEN json_extract(wm.ai_analyse, '$.status') = 'completed' THEN wm.id END) as analysierte_media
FROM wildkameras w
LEFT JOIN wildkamera_media wm ON w.id = wm.wildkamera_id AND wm.geloescht_am IS NULL
WHERE w.geloescht_am IS NULL
GROUP BY w.id;

-- Galerie mit AI-Analyse
CREATE VIEW IF NOT EXISTS v_galerie_fotos_analyzed AS
SELECT 
  gf.*,
  json_extract(gf.ai_analyse, '$.status') as ai_status,
  json_extract(gf.ai_analyse, '$.wildart') as wildart,
  json_extract(gf.ai_analyse, '$.confidence') as confidence,
  json_extract(gf.ai_analyse, '$.geschlecht') as geschlecht,
  json_extract(gf.ai_analyse, '$.altersklasse') as altersklasse,
  json_extract(gf.ai_analyse, '$.anzahl') as anzahl
FROM galerie_fotos gf
WHERE gf.geloescht_am IS NULL;

-- Wildkamera Activity (letzte 30 Tage)
CREATE VIEW IF NOT EXISTS v_wildkamera_activity_30d AS
SELECT 
  w.id as wildkamera_id,
  w.name as wildkamera_name,
  w.revier_id,
  COUNT(wm.id) as total_aufnahmen,
  COUNT(DISTINCT DATE(wm.zeitpunkt)) as aktive_tage,
  json_extract(wm.ai_analyse, '$.wildart') as wildart,
  COUNT(CASE WHEN json_extract(wm.ai_analyse, '$.wildart') IS NOT NULL THEN 1 END) as wild_erkannt,
  MAX(wm.zeitpunkt) as letzte_sichtung
FROM wildkameras w
LEFT JOIN wildkamera_media wm ON w.id = wm.wildkamera_id 
  AND wm.zeitpunkt >= datetime('now', '-30 days')
  AND wm.geloescht_am IS NULL
WHERE w.geloescht_am IS NULL
GROUP BY w.id, json_extract(wm.ai_analyse, '$.wildart');

-- ============================================================================
-- SAMPLE DATA (für Testing)
-- ============================================================================

-- Beispiel Wildkamera (ICUSERVER)
INSERT OR IGNORE INTO wildkameras (
  id, revier_id, name, marke, modell,
  gps_latitude, gps_longitude, ausrichtung,
  sichtfeld_winkel, sichtfeld_reichweite,
  verbindung_typ, verbindung_status,
  batterie, speicher_gesamt, speicher_belegt, speicher_frei,
  einstellungen
) VALUES (
  'wildkamera_sample_1',
  'revier_hauptrevier',
  'Wildkamera Nordrand',
  'ICUSERVER',
  'ICU-4G-LTE-Pro',
  50.12345,
  8.67890,
  45, -- Nord-Ost
  52, -- Grad
  25, -- Meter
  'cloud_sync',
  'connected',
  87,
  32000, -- 32 GB
  15000,
  17000,
  json_object(
    'aufloesungFoto', '20MP',
    'aufloesungVideo', '1080p',
    'ausloeserEmpfindlichkeit', 'hoch',
    'intervallModus', false,
    'nachtmodus', 'IR',
    'serienbildModus', true,
    'serienbildAnzahl', 3
  )
);

-- Beispiel Wildkamera (Zeiss)
INSERT OR IGNORE INTO wildkameras (
  id, revier_id, name, marke, modell,
  gps_latitude, gps_longitude, ausrichtung,
  sichtfeld_winkel, sichtfeld_reichweite,
  verbindung_typ, verbindung_status,
  batterie, speicher_gesamt, speicher_belegt, speicher_frei,
  einstellungen
) VALUES (
  'wildkamera_sample_2',
  'revier_hauptrevier',
  'Wildkamera Wildfütterung',
  'Zeiss',
  'Secacam HomeVista',
  50.13456,
  8.68901,
  180, -- Süd
  60, -- Grad
  20, -- Meter
  'cellular',
  'connected',
  92,
  16000, -- 16 GB
  5000,
  11000,
  json_object(
    'aufloesungFoto', '12MP',
    'aufloesungVideo', '1080p',
    'ausloeserEmpfindlichkeit', 'mittel',
    'intervallModus', false,
    'nachtmodus', 'black_LED',
    'videolaenge', 10
  )
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Migration 007: Wildkamera Integration - COMPLETED' as status;
