-- ============================================================================
-- Migration 009: Wildkamera KI-Detection System
-- Phase 7A: Deep Learning basierte Wildart-Erkennung
-- ============================================================================
-- Version: 1.0
-- Datum: 22. Januar 2026
-- Autor: HNTR LEGEND Dev Team
-- ============================================================================

-- ============================================================================
-- TABELLE: ki_detections
-- Haupt-Tabelle für KI-Detection Results pro Foto
-- ============================================================================

CREATE TABLE IF NOT EXISTS ki_detections (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Referenzen
  wildkamera_media_id TEXT NOT NULL REFERENCES wildkamera_media(id) ON DELETE CASCADE,
  revier_id TEXT NOT NULL REFERENCES reviere(id) ON DELETE CASCADE,
  
  -- Detection Status
  verarbeitungsstatus TEXT NOT NULL DEFAULT 'pending' 
    CHECK(verarbeitungsstatus IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Results (Zusammenfassung)
  anzahl_erkannt INTEGER NOT NULL DEFAULT 0,
  haupt_wildart TEXT,                              -- Häufigste erkannte Wildart
  confidence_gesamt REAL,                          -- 0-100 (Durchschnitt)
  
  -- Verarbeitung
  verarbeitet_am TEXT,                             -- ISO 8601 timestamp
  verarbeitungszeit_ms INTEGER,                    -- Millisekunden (Inference Time)
  model_version TEXT,                              -- "yolo-v8-1.0+efficientnet-b0-1.0+resnet-50-1.0"
  device_typ TEXT CHECK(device_typ IN ('cpu', 'gpu', 'npu', 'ane')),
  
  -- Fehler (falls failed)
  fehler_code TEXT,
  fehler_nachricht TEXT,
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Constraints
  FOREIGN KEY (wildkamera_media_id) REFERENCES wildkamera_media(id) ON DELETE CASCADE,
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

-- Indices für ki_detections
CREATE INDEX IF NOT EXISTS idx_ki_detections_media 
  ON ki_detections(wildkamera_media_id);

CREATE INDEX IF NOT EXISTS idx_ki_detections_revier 
  ON ki_detections(revier_id);

CREATE INDEX IF NOT EXISTS idx_ki_detections_status 
  ON ki_detections(verarbeitungsstatus);

CREATE INDEX IF NOT EXISTS idx_ki_detections_wildart 
  ON ki_detections(haupt_wildart) 
  WHERE haupt_wildart IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ki_detections_datum 
  ON ki_detections(verarbeitet_am) 
  WHERE verarbeitet_am IS NOT NULL;

-- ============================================================================
-- TABELLE: ki_detection_objekte
-- Individuelle Objekte/Tiere pro Detection (Multi-Object)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ki_detection_objekte (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Referenz
  ki_detection_id TEXT NOT NULL REFERENCES ki_detections(id) ON DELETE CASCADE,
  
  -- Object Index
  objekt_index INTEGER NOT NULL,                   -- 0, 1, 2, ... (Reihenfolge)
  
  -- Wildart Classification
  wildart TEXT NOT NULL,
  wildart_confidence REAL NOT NULL CHECK(wildart_confidence >= 0 AND wildart_confidence <= 100),
  
  -- Geschlecht Classification
  geschlecht TEXT CHECK(geschlecht IN ('männlich', 'weiblich', 'unbekannt')),
  geschlecht_confidence REAL CHECK(geschlecht_confidence >= 0 AND geschlecht_confidence <= 100),
  
  -- Altersklasse Classification
  altersklasse TEXT CHECK(altersklasse IN ('jung', 'mittel', 'alt', 'unbekannt')),
  altersklasse_confidence REAL CHECK(altersklasse_confidence >= 0 AND altersklasse_confidence <= 100),
  
  -- Bounding Box (normalized 0-1)
  bbox_x REAL NOT NULL CHECK(bbox_x >= 0 AND bbox_x <= 1),
  bbox_y REAL NOT NULL CHECK(bbox_y >= 0 AND bbox_y <= 1),
  bbox_width REAL NOT NULL CHECK(bbox_width >= 0 AND bbox_width <= 1),
  bbox_height REAL NOT NULL CHECK(bbox_height >= 0 AND bbox_height <= 1),
  
  -- Trophäen-Info (JSON, nur für Cerviden/Schwarzwild)
  ist_trophäe BOOLEAN DEFAULT 0,
  trophäen_info TEXT,                              -- JSON: {geweih: {...}, waffen: {...}, kondition: {...}}
  trophäen_confidence REAL CHECK(trophäen_confidence >= 0 AND trophäen_confidence <= 100),
  
  -- Tracking (für Video/Burst-Serien)
  tracking_id TEXT,                                -- UUID für Object-Tracking über mehrere Frames
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Constraints
  FOREIGN KEY (ki_detection_id) REFERENCES ki_detections(id) ON DELETE CASCADE
);

-- Indices für ki_detection_objekte
CREATE INDEX IF NOT EXISTS idx_ki_detection_objekte_detection 
  ON ki_detection_objekte(ki_detection_id);

CREATE INDEX IF NOT EXISTS idx_ki_detection_objekte_wildart 
  ON ki_detection_objekte(wildart);

CREATE INDEX IF NOT EXISTS idx_ki_detection_objekte_geschlecht 
  ON ki_detection_objekte(geschlecht) 
  WHERE geschlecht IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ki_detection_objekte_altersklasse 
  ON ki_detection_objekte(altersklasse) 
  WHERE altersklasse IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ki_detection_objekte_trophäe 
  ON ki_detection_objekte(ist_trophäe) 
  WHERE ist_trophäe = 1;

CREATE INDEX IF NOT EXISTS idx_ki_detection_objekte_tracking 
  ON ki_detection_objekte(tracking_id) 
  WHERE tracking_id IS NOT NULL;

-- ============================================================================
-- TABELLE: ki_detection_feedback
-- User Feedback für KI-Detection (für Re-Training & Accuracy Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ki_detection_feedback (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Referenzen
  ki_detection_objekt_id TEXT NOT NULL REFERENCES ki_detection_objekte(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Feedback
  ist_korrekt BOOLEAN NOT NULL,                    -- Ja (1) / Nein (0)
  
  -- Korrekturen (falls ist_korrekt = 0)
  korrektur_wildart TEXT,
  korrektur_geschlecht TEXT CHECK(korrektur_geschlecht IN ('männlich', 'weiblich', 'unbekannt', NULL)),
  korrektur_altersklasse TEXT CHECK(korrektur_altersklasse IN ('jung', 'mittel', 'alt', 'unbekannt', NULL)),
  korrektur_anzahl INTEGER,                        -- Falls Anzahl falsch erkannt
  
  -- Zusätzliche Infos
  bemerkungen TEXT,
  bild_qualität TEXT CHECK(bild_qualität IN ('schlecht', 'mittel', 'gut', 'sehr_gut', NULL)),
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Constraints
  FOREIGN KEY (ki_detection_objekt_id) REFERENCES ki_detection_objekte(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices für ki_detection_feedback
CREATE INDEX IF NOT EXISTS idx_ki_detection_feedback_objekt 
  ON ki_detection_feedback(ki_detection_objekt_id);

CREATE INDEX IF NOT EXISTS idx_ki_detection_feedback_user 
  ON ki_detection_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_ki_detection_feedback_korrekt 
  ON ki_detection_feedback(ist_korrekt);

CREATE INDEX IF NOT EXISTS idx_ki_detection_feedback_datum 
  ON ki_detection_feedback(created_at);

-- ============================================================================
-- TABELLE: ml_models
-- ML Model Management (Tracking von Modell-Versionen)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ml_models (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Model Identifikation
  model_name TEXT NOT NULL,                        -- 'yolo-v8', 'efficientnet-b0', 'resnet-50'
  version TEXT NOT NULL,                           -- '1.0.0', '1.1.0', etc.
  
  -- Model File Info
  datei_name TEXT NOT NULL,                        -- 'yolov8n-wildlife.tflite'
  datei_größe INTEGER NOT NULL,                    -- Bytes
  checksum_sha256 TEXT NOT NULL,                   -- SHA-256 Hash für Integrität
  
  -- Plattform
  plattform TEXT NOT NULL CHECK(plattform IN ('ios', 'android', 'both')),
  
  -- Performance Metrics
  accuracy REAL,                                   -- mAP@0.5 (YOLO), Top-1 Accuracy (Classification)
  inference_time_ms INTEGER,                       -- Durchschnittliche Inference-Zeit (ms)
  
  -- Status
  status TEXT NOT NULL DEFAULT 'available' 
    CHECK(status IN ('available', 'deprecated', 'training')),
  
  -- Download Info (für OTA Updates)
  download_url TEXT,
  size_compressed INTEGER,                         -- Bytes (gz/zip compressed)
  
  -- Training Info
  trainiert_am TEXT,                               -- ISO 8601 timestamp
  trainings_dataset_größe INTEGER,                 -- Anzahl Trainings-Bilder
  trainings_parameter TEXT,                        -- JSON: {epochs: 300, batch_size: 16, ...}
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Unique Constraint
  UNIQUE(model_name, version, plattform)
);

-- Indices für ml_models
CREATE INDEX IF NOT EXISTS idx_ml_models_name 
  ON ml_models(model_name);

CREATE INDEX IF NOT EXISTS idx_ml_models_status 
  ON ml_models(status);

CREATE INDEX IF NOT EXISTS idx_ml_models_plattform 
  ON ml_models(plattform);

CREATE INDEX IF NOT EXISTS idx_ml_models_version 
  ON ml_models(version);

-- ============================================================================
-- TABELLE: batch_processing_queue
-- Queue für Batch-Verarbeitung von Wildkamera-Fotos
-- ============================================================================

CREATE TABLE IF NOT EXISTS batch_processing_queue (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Batch Info
  batch_name TEXT,
  revier_id TEXT NOT NULL REFERENCES reviere(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Images
  total_images INTEGER NOT NULL,
  processed_images INTEGER NOT NULL DEFAULT 0,
  failed_images INTEGER NOT NULL DEFAULT 0,
  
  -- Progress
  current_image TEXT,                              -- Aktuell verarbeitetes Foto (URI)
  progress_percent REAL NOT NULL DEFAULT 0 CHECK(progress_percent >= 0 AND progress_percent <= 100),
  
  -- Timing
  started_at TEXT,
  completed_at TEXT,
  estimated_time_remaining_ms INTEGER,
  
  -- Results
  total_detections INTEGER NOT NULL DEFAULT 0,
  detections_by_wildart TEXT,                      -- JSON: {"rehwild": 45, "schwarzwild": 12, ...}
  
  -- Status
  status TEXT NOT NULL DEFAULT 'queued' 
    CHECK(status IN ('queued', 'processing', 'paused', 'completed', 'failed')),
  
  -- Fehler
  fehler_nachricht TEXT,
  
  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  -- Constraints
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices für batch_processing_queue
CREATE INDEX IF NOT EXISTS idx_batch_processing_queue_revier 
  ON batch_processing_queue(revier_id);

CREATE INDEX IF NOT EXISTS idx_batch_processing_queue_user 
  ON batch_processing_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_batch_processing_queue_status 
  ON batch_processing_queue(status);

CREATE INDEX IF NOT EXISTS idx_batch_processing_queue_datum 
  ON batch_processing_queue(created_at);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: ki_detection_zusammenfassung
-- Aggregierte Übersicht für KI-Detections
CREATE VIEW IF NOT EXISTS ki_detection_zusammenfassung AS
SELECT 
  kd.id,
  kd.wildkamera_media_id,
  kd.revier_id,
  kd.verarbeitungsstatus,
  kd.anzahl_erkannt,
  kd.haupt_wildart,
  kd.confidence_gesamt,
  kd.verarbeitet_am,
  kd.verarbeitungszeit_ms,
  kd.model_version,
  
  -- Counts
  COUNT(kdo.id) as objekt_count,
  SUM(CASE WHEN kdo.ist_trophäe = 1 THEN 1 ELSE 0 END) as trophäen_count,
  
  -- Feedback Stats
  COUNT(kdf.id) as feedback_count,
  SUM(CASE WHEN kdf.ist_korrekt = 1 THEN 1 ELSE 0 END) as korrekt_count,
  CASE 
    WHEN COUNT(kdf.id) > 0 
    THEN ROUND(CAST(SUM(CASE WHEN kdf.ist_korrekt = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(kdf.id) * 100, 2)
    ELSE NULL 
  END as accuracy_percent
  
FROM ki_detections kd
LEFT JOIN ki_detection_objekte kdo ON kd.id = kdo.ki_detection_id
LEFT JOIN ki_detection_feedback kdf ON kdo.id = kdf.ki_detection_objekt_id
GROUP BY kd.id;

-- View: wildart_statistik
-- Statistik nach Wildart (für Dashboard)
CREATE VIEW IF NOT EXISTS wildart_statistik AS
SELECT 
  kdo.wildart,
  r.id as revier_id,
  r.name as revier_name,
  COUNT(DISTINCT kdo.ki_detection_id) as detection_count,
  COUNT(kdo.id) as objekt_count,
  ROUND(AVG(kdo.wildart_confidence), 2) as avg_confidence,
  SUM(CASE WHEN kdo.ist_trophäe = 1 THEN 1 ELSE 0 END) as trophäen_count,
  MIN(kd.verarbeitet_am) as erste_sichtung,
  MAX(kd.verarbeitet_am) as letzte_sichtung
FROM ki_detection_objekte kdo
JOIN ki_detections kd ON kdo.ki_detection_id = kd.id
JOIN reviere r ON kd.revier_id = r.id
WHERE kd.verarbeitungsstatus = 'completed'
GROUP BY kdo.wildart, r.id;

-- View: trophäen_kandidaten
-- Top Trophäen-Kandidaten
CREATE VIEW IF NOT EXISTS trophäen_kandidaten AS
SELECT 
  kdo.id,
  kdo.ki_detection_id,
  kd.wildkamera_media_id,
  kd.revier_id,
  kdo.wildart,
  kdo.geschlecht,
  kdo.altersklasse,
  kdo.trophäen_info,
  kdo.trophäen_confidence,
  kd.verarbeitet_am,
  
  -- Extract CIC Score from JSON (if Cervid)
  json_extract(kdo.trophäen_info, '$.geweih.geschätzteCIC.wahrscheinlich') as geschätzte_cic,
  json_extract(kdo.trophäen_info, '$.geweih.qualität') as qualität,
  json_extract(kdo.trophäen_info, '$.geweih.endenAnzahl.gesamt') as enden_anzahl
  
FROM ki_detection_objekte kdo
JOIN ki_detections kd ON kdo.ki_detection_id = kd.id
WHERE kdo.ist_trophäe = 1
  AND kd.verarbeitungsstatus = 'completed'
ORDER BY geschätzte_cic DESC;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-Update updated_at für ki_detections
CREATE TRIGGER IF NOT EXISTS trigger_ki_detections_updated_at
AFTER UPDATE ON ki_detections
FOR EACH ROW
BEGIN
  UPDATE ki_detections
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;

-- Trigger: Auto-Update updated_at für ml_models
CREATE TRIGGER IF NOT EXISTS trigger_ml_models_updated_at
AFTER UPDATE ON ml_models
FOR EACH ROW
BEGIN
  UPDATE ml_models
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;

-- Trigger: Auto-Update updated_at für batch_processing_queue
CREATE TRIGGER IF NOT EXISTS trigger_batch_processing_queue_updated_at
AFTER UPDATE ON batch_processing_queue
FOR EACH ROW
BEGIN
  UPDATE batch_processing_queue
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;

-- Trigger: Auto-Calculate haupt_wildart bei Detection-Complete
CREATE TRIGGER IF NOT EXISTS trigger_calculate_haupt_wildart
AFTER UPDATE OF verarbeitungsstatus ON ki_detections
FOR EACH ROW
WHEN NEW.verarbeitungsstatus = 'completed'
BEGIN
  UPDATE ki_detections
  SET haupt_wildart = (
    SELECT wildart
    FROM ki_detection_objekte
    WHERE ki_detection_id = NEW.id
    GROUP BY wildart
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),
  confidence_gesamt = (
    SELECT ROUND(AVG(wildart_confidence), 2)
    FROM ki_detection_objekte
    WHERE ki_detection_id = NEW.id
  ),
  anzahl_erkannt = (
    SELECT COUNT(*)
    FROM ki_detection_objekte
    WHERE ki_detection_id = NEW.id
  )
  WHERE id = NEW.id;
END;

-- ============================================================================
-- SAMPLE DATA (für Development/Testing)
-- ============================================================================

-- Insert Sample ML Models
INSERT OR IGNORE INTO ml_models (
  id, model_name, version, datei_name, datei_größe, checksum_sha256, 
  plattform, accuracy, inference_time_ms, status, trainiert_am, 
  trainings_dataset_größe, created_at
) VALUES 
(
  'model_yolo_v8_1_0',
  'yolo-v8',
  '1.0.0',
  'yolov8n-wildlife.tflite',
  15728640,  -- 15 MB
  'abc123def456...',
  'both',
  91.2,      -- mAP@0.5
  200,       -- ms
  'available',
  datetime('now'),
  50000,
  datetime('now')
),
(
  'model_efficientnet_b0_1_0',
  'efficientnet-b0',
  '1.0.0',
  'efficientnet-b0-wildlife.tflite',
  20971520,  -- 20 MB
  'def789ghi012...',
  'both',
  93.1,      -- Top-1 Accuracy
  100,       -- ms
  'available',
  datetime('now'),
  100000,
  datetime('now')
),
(
  'model_resnet_50_1_0',
  'resnet-50',
  '1.0.0',
  'resnet50-trophy.tflite',
  26214400,  -- 25 MB
  'ghi345jkl678...',
  'both',
  82.4,      -- R² Score
  150,       -- ms
  'available',
  datetime('now'),
  30000,
  datetime('now')
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify Tables
SELECT 
  'ki_detections' as table_name, 
  COUNT(*) as row_count 
FROM ki_detections
UNION ALL
SELECT 'ki_detection_objekte', COUNT(*) FROM ki_detection_objekte
UNION ALL
SELECT 'ki_detection_feedback', COUNT(*) FROM ki_detection_feedback
UNION ALL
SELECT 'ml_models', COUNT(*) FROM ml_models
UNION ALL
SELECT 'batch_processing_queue', COUNT(*) FROM batch_processing_queue;
