-- ============================================================================
-- Phase 8: Advanced Analytics & Predictions - Database Migration
-- ============================================================================
-- Features:
--   - Weather Correlation Tracking
--   - Movement Pattern Analysis
--   - Shot Analysis & Hit Zone Detection
--   - Nachsuche Tracking & Recovery Assistance
--   - Population Tracking & Trend Analysis
--   - Prediction Cache (ML Results)
--   - User-Contributed Training Data (Crowdsourcing)

-- ============================================================================
-- 1. WEATHER CORRELATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS weather_correlation (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT NOT NULL,
  
  -- Zeitraum
  datum DATE NOT NULL,
  stunde INTEGER NOT NULL CHECK (stunde >= 0 AND stunde <= 23),
  
  -- Wetter
  temperatur REAL,
  luftdruck REAL,
  luftfeuchtigkeit REAL CHECK (luftfeuchtigkeit IS NULL OR (luftfeuchtigkeit >= 0 AND luftfeuchtigkeit <= 100)),
  niederschlag REAL CHECK (niederschlag IS NULL OR niederschlag >= 0),
  windgeschwindigkeit REAL CHECK (windgeschwindigkeit IS NULL OR windgeschwindigkeit >= 0),
  windrichtung REAL CHECK (windrichtung IS NULL OR (windrichtung >= 0 AND windrichtung <= 360)),
  bewölkung REAL CHECK (bewölkung IS NULL OR (bewölkung >= 0 AND bewölkung <= 100)),
  mondphase REAL CHECK (mondphase IS NULL OR (mondphase >= 0 AND mondphase <= 1)),
  
  -- Aktivität (gemessen)
  aktivität_score REAL CHECK (aktivität_score IS NULL OR (aktivität_score >= 0 AND aktivität_score <= 100)),
  sichtungen INTEGER DEFAULT 0,
  abschüsse INTEGER DEFAULT 0,
  wildkamera_detections INTEGER DEFAULT 0,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_weather_corr_revier_wildart ON weather_correlation(revier_id, wildart, datum);
CREATE INDEX idx_weather_corr_datum ON weather_correlation(datum, stunde);
CREATE INDEX idx_weather_corr_aktivität ON weather_correlation(aktivität_score DESC);

-- ============================================================================
-- 2. MOVEMENT PATTERNS (Wildwechsel)
-- ============================================================================

CREATE TABLE IF NOT EXISTS movement_patterns (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT NOT NULL,
  
  -- Route
  von_poi_id TEXT,
  nach_poi_id TEXT,
  
  -- Statistik
  häufigkeit INTEGER DEFAULT 1,
  letzte_beobachtung DATETIME,
  durchschnitt_dauer INTEGER,           -- Minuten
  
  -- Zeitliche Muster (JSON Arrays)
  bevorzugte_stunden TEXT,              -- JSON Array [5,6,7,18,19,20]
  bevorzugte_wochentage TEXT,           -- JSON Array [1,2,6]
  bevorzugte_monate TEXT,               -- JSON Array [5,6,9,10]
  
  -- Jahreszeitliche Verteilung (%)
  frühling_prozent REAL CHECK (frühling_prozent IS NULL OR (frühling_prozent >= 0 AND frühling_prozent <= 100)),
  sommer_prozent REAL CHECK (sommer_prozent IS NULL OR (sommer_prozent >= 0 AND sommer_prozent <= 100)),
  herbst_prozent REAL CHECK (herbst_prozent IS NULL OR (herbst_prozent >= 0 AND herbst_prozent <= 100)),
  winter_prozent REAL CHECK (winter_prozent IS NULL OR (winter_prozent >= 0 AND winter_prozent <= 100)),
  
  -- Vorhersage-Daten
  wahrscheinlichkeit REAL CHECK (wahrscheinlichkeit IS NULL OR (wahrscheinlichkeit >= 0 AND wahrscheinlichkeit <= 1)),
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE,
  FOREIGN KEY (von_poi_id) REFERENCES pois(id) ON DELETE SET NULL,
  FOREIGN KEY (nach_poi_id) REFERENCES pois(id) ON DELETE SET NULL
);

CREATE INDEX idx_movement_patterns_revier ON movement_patterns(revier_id, wildart);
CREATE INDEX idx_movement_patterns_route ON movement_patterns(von_poi_id, nach_poi_id);
CREATE INDEX idx_movement_patterns_updated ON movement_patterns(updated_at DESC);

-- Trigger: Auto-update timestamp
CREATE TRIGGER update_movement_patterns_timestamp
AFTER UPDATE ON movement_patterns
FOR EACH ROW
BEGIN
  UPDATE movement_patterns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- 3. SHOT ANALYSIS (Anschuss-Erkennung)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shot_analysis (
  id TEXT PRIMARY KEY,
  jagd_id TEXT,
  abschuss_id TEXT,                     -- Falls erfolgreich geborgen
  user_id TEXT NOT NULL,
  revier_id TEXT NOT NULL,
  
  -- Basis
  wildart TEXT NOT NULL,
  geschätzte_entfernung REAL CHECK (geschätzte_entfernung IS NULL OR geschätzte_entfernung >= 0),
  schuss_zeitpunkt DATETIME NOT NULL,
  schuss_richtung REAL CHECK (schuss_richtung IS NULL OR (schuss_richtung >= 0 AND schuss_richtung <= 360)),
  location_lat REAL CHECK (location_lat IS NULL OR (location_lat >= -90 AND location_lat <= 90)),
  location_lng REAL CHECK (location_lng IS NULL OR (location_lng >= -180 AND location_lng <= 180)),
  
  -- Schuss-Details
  schussplatzierung_ziel TEXT CHECK (schussplatzierung_ziel IN ('Blatt', 'Träger', 'Kammer', 'Keule', 'Lauf', 'Haupt', 'Unbekannt')),
  getroffen BOOLEAN,
  schussplatzierung_confidence REAL CHECK (schussplatzierung_confidence IS NULL OR (schussplatzierung_confidence >= 0 AND schussplatzierung_confidence <= 100)),
  
  -- Wild-Reaktion
  reaktion_typ TEXT CHECK (reaktion_typ IN ('Zusammenbruch', 'Flucht', 'Zeichnen', 'Keine_Reaktion')),
  reaktion_richtung REAL CHECK (reaktion_richtung IS NULL OR (reaktion_richtung >= 0 AND reaktion_richtung <= 360)),
  reaktion_geschwindigkeit TEXT CHECK (reaktion_geschwindigkeit IN (NULL, 'Langsam', 'Mittel', 'Schnell')),
  lautäußerung TEXT CHECK (lautäußerung IN (NULL, 'Schreien', 'Klagen', 'Keine')),
  verhalten TEXT,                       -- JSON Array ["Hochflüchtig", "Katzenbuckel", "Taumeln"]
  
  -- Pirschzeichen: Blut
  blut_vorhanden BOOLEAN DEFAULT 0,
  blut_farbe TEXT CHECK (blut_farbe IN (NULL, 'Hellrot', 'Dunkelrot', 'Bräunlich', 'Schaumig')),
  blut_menge TEXT CHECK (blut_menge IN (NULL, 'Keine', 'Wenig', 'Mittel', 'Viel')),
  blut_verteilung TEXT CHECK (blut_verteilung IN (NULL, 'Tropfen', 'Spritzer', 'Fährte', 'Lache')),
  blut_höhe TEXT CHECK (blut_höhe IN (NULL, 'Bodennah', 'Kniehoch', 'Brusthoch')),
  
  -- Schweiß-Details
  lungenblut BOOLEAN DEFAULT 0,
  lebertreffer BOOLEAN DEFAULT 0,
  nierenschuss BOOLEAN DEFAULT 0,
  pansenschuss BOOLEAN DEFAULT 0,
  knochenschuss BOOLEAN DEFAULT 0,
  
  -- Sonstige Zeichen
  haare_vorhanden BOOLEAN DEFAULT 0,
  haare_typ TEXT CHECK (haare_typ IN (NULL, 'Grannen', 'Deckhaar', 'Winterhaar', 'Sommerhaar')),
  haare_farbe TEXT,
  haare_menge INTEGER,
  
  wildpret_vorhanden BOOLEAN DEFAULT 0,
  wildpret_typ TEXT CHECK (wildpret_typ IN (NULL, 'Lungenstücke', 'Pansenfetzen', 'Knochensplitter')),
  
  fährte_gesehen BOOLEAN DEFAULT 0,
  fährte_geschwindigkeit TEXT CHECK (fährte_geschwindigkeit IN (NULL, 'Schritt', 'Trab', 'Flucht')),
  fährte_auffälligkeiten TEXT,          -- JSON Array ["Schleifen", "Weit auseinander"]
  
  -- KI-Analyse
  ki_analyse_bild_uri TEXT,
  ki_blutfarbe TEXT,
  ki_blutmenge TEXT,
  ki_haare_erkannt BOOLEAN,
  ki_wildpret_erkannt BOOLEAN,
  ki_confidence REAL CHECK (ki_confidence IS NULL OR (ki_confidence >= 0 AND ki_confidence <= 100)),
  
  -- Trefferlage-Diagnose
  hauptdiagnose TEXT NOT NULL CHECK (hauptdiagnose IN (
    'Blattschuss', 'Trägerschuss', 'Kammerschuss', 'Laufschuss', 'Lebertreffer',
    'Nierenschuss', 'Pansenschuss', 'Waidwundschuss', 'Keulenschuss', 'Hauptschuss',
    'Fehlschuss', 'Streifschuss'
  )),
  hauptdiagnose_wahrscheinlichkeit REAL CHECK (hauptdiagnose_wahrscheinlichkeit >= 0 AND hauptdiagnose_wahrscheinlichkeit <= 100),
  alternativ_diagnosen TEXT,            -- JSON Array [{art, wahrscheinlichkeit}]
  diagnose_begründung TEXT,             -- JSON Array ["Hellrotes schaumiges Blut..."]
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (jagd_id) REFERENCES jagden(id) ON DELETE SET NULL,
  FOREIGN KEY (abschuss_id) REFERENCES abschuesse(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_shot_analysis_revier ON shot_analysis(revier_id, wildart);
CREATE INDEX idx_shot_analysis_user ON shot_analysis(user_id, created_at DESC);
CREATE INDEX idx_shot_analysis_diagnose ON shot_analysis(hauptdiagnose);
CREATE INDEX idx_shot_analysis_jagd ON shot_analysis(jagd_id);

-- Trigger: Auto-update timestamp
CREATE TRIGGER update_shot_analysis_timestamp
AFTER UPDATE ON shot_analysis
FOR EACH ROW
BEGIN
  UPDATE shot_analysis SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- 4. NACHSUCHE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS nachsuche_tracking (
  id TEXT PRIMARY KEY,
  shot_analysis_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  revier_id TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('Geplant', 'Aktiv', 'Erfolgreich', 'Erfolglos', 'Abgebrochen')),
  
  -- Empfehlung (initial)
  empfohlene_wartezeit INTEGER CHECK (empfohlene_wartezeit IS NULL OR empfohlene_wartezeit >= 0),
  empfohlene_strategie TEXT,
  hund_empfohlen BOOLEAN,
  hund_typ TEXT,
  
  -- Durchführung
  tatsächliche_wartezeit INTEGER CHECK (tatsächliche_wartezeit IS NULL OR tatsächliche_wartezeit >= 0),
  start_zeitpunkt DATETIME,
  ende_zeitpunkt DATETIME,
  dauer_minuten INTEGER CHECK (dauer_minuten IS NULL OR dauer_minuten >= 0),
  
  -- Hunde-Einsatz
  hund_eingesetzt BOOLEAN DEFAULT 0,
  hund_art TEXT,
  hund_name TEXT,
  hundeführer TEXT,
  
  -- Suchgebiet
  startpunkt_lat REAL CHECK (startpunkt_lat IS NULL OR (startpunkt_lat >= -90 AND startpunkt_lat <= 90)),
  startpunkt_lng REAL CHECK (startpunkt_lng IS NULL OR (startpunkt_lng >= -180 AND startpunkt_lng <= 180)),
  fluchtrichtung REAL CHECK (fluchtrichtung IS NULL OR (fluchtrichtung >= 0 AND fluchtrichtung <= 360)),
  gesuchter_radius REAL CHECK (gesuchter_radius IS NULL OR gesuchter_radius >= 0),
  
  -- Tracking-Punkte (Route) - JSON Array
  tracking_punkte TEXT,                 -- JSON Array von {lat, lng, zeitpunkt, notiz, foto_uri, pirschzeichen}
  
  -- Fundort
  gefunden BOOLEAN DEFAULT 0,
  fundort_lat REAL CHECK (fundort_lat IS NULL OR (fundort_lat >= -90 AND fundort_lat <= 90)),
  fundort_lng REAL CHECK (fundort_lng IS NULL OR (fundort_lng >= -180 AND fundort_lng <= 180)),
  entfernung_vom_anschuss REAL CHECK (entfernung_vom_anschuss IS NULL OR entfernung_vom_anschuss >= 0),
  zustand TEXT CHECK (zustand IN (NULL, 'Verendet', 'Noch_lebend')),
  
  -- Pirschzeichen während Nachsuche - JSON Array
  gefundene_zeichen TEXT,               -- JSON Array [{typ, beschreibung, location, foto_uri}]
  
  -- Ergebnis
  erfolgreich BOOLEAN,
  wild_geborgen BOOLEAN,
  abbruch_grund TEXT,
  
  -- Dokumentation
  fotos TEXT,                           -- JSON Array URIs
  notizen TEXT,
  
  -- Rechtlich
  jagdgenossenschaft_informiert BOOLEAN DEFAULT 0,
  nachbarrevier_informiert BOOLEAN DEFAULT 0,
  meldung_behörde BOOLEAN DEFAULT 0,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (shot_analysis_id) REFERENCES shot_analysis(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_nachsuche_shot ON nachsuche_tracking(shot_analysis_id);
CREATE INDEX idx_nachsuche_status ON nachsuche_tracking(status, created_at DESC);
CREATE INDEX idx_nachsuche_user ON nachsuche_tracking(user_id, revier_id);
CREATE INDEX idx_nachsuche_erfolg ON nachsuche_tracking(erfolgreich, wild_geborgen);

-- Trigger: Auto-update timestamp
CREATE TRIGGER update_nachsuche_tracking_timestamp
AFTER UPDATE ON nachsuche_tracking
FOR EACH ROW
BEGIN
  UPDATE nachsuche_tracking SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- 5. POPULATION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS population_tracking (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT NOT NULL,
  
  -- Zeitraum
  jahr INTEGER NOT NULL CHECK (jahr >= 2000 AND jahr <= 2100),
  saison TEXT CHECK (saison IN ('Frühjahr', 'Sommer', 'Herbst', 'Winter')),
  
  -- Bestand
  geschätzter_bestand INTEGER CHECK (geschätzter_bestand IS NULL OR geschätzter_bestand >= 0),
  confidence_min INTEGER CHECK (confidence_min IS NULL OR confidence_min >= 0),
  confidence_max INTEGER CHECK (confidence_max IS NULL OR confidence_max >= 0),
  zählmethode TEXT CHECK (zählmethode IN (NULL, 'Jagdstatistik', 'Scheinwerferzählung', 'Wildkamera', 'KI-Schätzung')),
  zähldatum DATE,
  
  -- Entwicklung
  trend TEXT CHECK (trend IN (NULL, 'Steigend', 'Stabil', 'Fallend')),
  änderungsrate REAL,                   -- % (kann negativ sein)
  trend_signifikanz REAL CHECK (trend_signifikanz IS NULL OR (trend_signifikanz >= 0 AND trend_signifikanz <= 100)),
  
  -- Altersstruktur
  anteil_jung REAL CHECK (anteil_jung IS NULL OR (anteil_jung >= 0 AND anteil_jung <= 100)),
  anteil_mittel REAL CHECK (anteil_mittel IS NULL OR (anteil_mittel >= 0 AND anteil_mittel <= 100)),
  anteil_alt REAL CHECK (anteil_alt IS NULL OR (anteil_alt >= 0 AND anteil_alt <= 100)),
  geschlechts_verhältnis REAL CHECK (geschlechts_verhältnis IS NULL OR geschlechts_verhältnis >= 0),
  
  -- Abschuss
  abschüsse_gesamt INTEGER DEFAULT 0,
  abschüsse_männlich INTEGER DEFAULT 0,
  abschüsse_weiblich INTEGER DEFAULT 0,
  abschüsse_jung INTEGER DEFAULT 0,
  abschussplan_erfüllung REAL CHECK (abschussplan_erfüllung IS NULL OR abschussplan_erfüllung >= 0),
  
  -- Reproduktion
  setzrate REAL CHECK (setzrate IS NULL OR setzrate >= 0),
  überlebensrate_jung REAL CHECK (überlebensrate_jung IS NULL OR (überlebensrate_jung >= 0 AND überlebensrate_jung <= 100)),
  zuwachsrate REAL,                     -- % (kann negativ sein)
  
  -- Verluste
  fallwild INTEGER DEFAULT 0,
  verkehrsopfer INTEGER DEFAULT 0,
  krankheit INTEGER DEFAULT 0,
  prädation INTEGER DEFAULT 0,
  verluste_sonstige INTEGER DEFAULT 0,
  
  -- Prognose
  prognose_nächstes_jahr INTEGER CHECK (prognose_nächstes_jahr IS NULL OR prognose_nächstes_jahr >= 0),
  prognose_3_jahre INTEGER CHECK (prognose_3_jahre IS NULL OR prognose_3_jahre >= 0),
  prognose_5_jahre INTEGER CHECK (prognose_5_jahre IS NULL OR prognose_5_jahre >= 0),
  
  -- Abschussplan-Empfehlung
  empfohlener_abschuss_gesamt INTEGER CHECK (empfohlener_abschuss_gesamt IS NULL OR empfohlener_abschuss_gesamt >= 0),
  empfohlener_abschuss_männlich INTEGER CHECK (empfohlener_abschuss_männlich IS NULL OR empfohlener_abschuss_männlich >= 0),
  empfohlener_abschuss_weiblich INTEGER CHECK (empfohlener_abschuss_weiblich IS NULL OR empfohlener_abschuss_weiblich >= 0),
  empfohlener_abschuss_jung INTEGER CHECK (empfohlener_abschuss_jung IS NULL OR empfohlener_abschuss_jung >= 0),
  abschussplan_ziel TEXT CHECK (abschussplan_ziel IN (NULL, 'Reduktion', 'Stabilisierung', 'Aufbau')),
  empfehlung_begründung TEXT,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE,
  
  UNIQUE(revier_id, wildart, jahr, saison)
);

CREATE INDEX idx_population_revier ON population_tracking(revier_id, wildart);
CREATE INDEX idx_population_jahr ON population_tracking(jahr, saison);
CREATE INDEX idx_population_trend ON population_tracking(trend);

-- Trigger: Auto-update timestamp
CREATE TRIGGER update_population_tracking_timestamp
AFTER UPDATE ON population_tracking
FOR EACH ROW
BEGIN
  UPDATE population_tracking SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- 6. PREDICTIONS CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS predictions_cache (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  wildart TEXT,
  
  -- Typ
  prediction_type TEXT NOT NULL CHECK (prediction_type IN (
    'Wildaktivität', 'Bewegung', 'Hotspot', 'Jagdplanung', 'Bestandsentwicklung', 'Fundort'
  )),
  
  -- Zeitraum
  gültig_von DATETIME NOT NULL,
  gültig_bis DATETIME NOT NULL,
  
  -- Daten (JSON)
  prediction_data TEXT NOT NULL,        -- JSON mit spezifischen Vorhersage-Daten
  
  -- Qualität
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100)),
  accuracy_historical REAL CHECK (accuracy_historical IS NULL OR (accuracy_historical >= 0 AND accuracy_historical <= 100)),
  
  -- ML-Model
  model_version TEXT,
  model_name TEXT,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_predictions_revier ON predictions_cache(revier_id, wildart, prediction_type);
CREATE INDEX idx_predictions_gültig ON predictions_cache(gültig_von, gültig_bis);
CREATE INDEX idx_predictions_type ON predictions_cache(prediction_type);

-- ============================================================================
-- 7. USER-CONTRIBUTED TRAINING DATA (Crowdsourcing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_contributed_training_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  
  -- Typ
  typ TEXT NOT NULL CHECK (typ IN (
    'Anschusszeichen', 'Wildpret', 'Fährte', 'Fundort', 'Blutfarbe', 'Haare', 'Knochensplitter'
  )),
  
  -- Bild
  bild_uri TEXT NOT NULL,
  aufnahme_datum DATE NOT NULL,
  
  -- Annotationen (User)
  wildart TEXT,
  blutfarbe TEXT,
  blutmenge TEXT,
  haare_typ TEXT,
  wildpret_typ TEXT,
  trefferlage TEXT CHECK (trefferlage IN (NULL,
    'Blattschuss', 'Trägerschuss', 'Kammerschuss', 'Laufschuss', 'Lebertreffer',
    'Nierenschuss', 'Pansenschuss', 'Waidwundschuss', 'Keulenschuss', 'Hauptschuss',
    'Fehlschuss', 'Streifschuss'
  )),
  
  -- Outcome (wichtig für Fundort-Training)
  gefunden BOOLEAN,
  fundort_entfernung REAL CHECK (fundort_entfernung IS NULL OR fundort_entfernung >= 0),
  fluchtrichtung REAL CHECK (fluchtrichtung IS NULL OR (fluchtrichtung >= 0 AND fluchtrichtung <= 360)),
  wartezeit INTEGER CHECK (wartezeit IS NULL OR wartezeit >= 0),
  
  -- Qualität
  verifiziert BOOLEAN DEFAULT 0,        -- Von Experten geprüft
  quality_score REAL CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- ML-Training
  verwendet_für_training BOOLEAN DEFAULT 0,
  model_version TEXT,
  
  -- Privacy
  anonymisiert BOOLEAN DEFAULT 1,
  öffentlich BOOLEAN DEFAULT 0,         -- Nutzer erlaubt Training-Nutzung
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_training_data_user ON user_contributed_training_data(user_id);
CREATE INDEX idx_training_data_typ ON user_contributed_training_data(typ);
CREATE INDEX idx_training_data_verifiziert ON user_contributed_training_data(verifiziert, quality_score DESC);
CREATE INDEX idx_training_data_training ON user_contributed_training_data(verwendet_für_training);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Shot Analysis Summary (für Dashboard)
CREATE VIEW IF NOT EXISTS shot_analysis_summary AS
SELECT 
  revier_id,
  wildart,
  hauptdiagnose,
  COUNT(*) as anzahl,
  AVG(hauptdiagnose_wahrscheinlichkeit) as durchschnitt_confidence,
  SUM(CASE WHEN blut_vorhanden = 1 THEN 1 ELSE 0 END) as mit_blut,
  SUM(CASE WHEN lungenblut = 1 THEN 1 ELSE 0 END) as lungenblut_fälle,
  SUM(CASE WHEN lebertreffer = 1 THEN 1 ELSE 0 END) as lebertreffer_fälle,
  SUM(CASE WHEN pansenschuss = 1 THEN 1 ELSE 0 END) as pansenschuss_fälle
FROM shot_analysis
GROUP BY revier_id, wildart, hauptdiagnose;

-- View: Nachsuche Success Rate
CREATE VIEW IF NOT EXISTS nachsuche_success_rate AS
SELECT 
  n.revier_id,
  s.wildart,
  s.hauptdiagnose,
  COUNT(*) as gesamt_nachsuchen,
  SUM(CASE WHEN n.erfolgreich = 1 THEN 1 ELSE 0 END) as erfolgreiche_nachsuchen,
  SUM(CASE WHEN n.wild_geborgen = 1 THEN 1 ELSE 0 END) as wild_geborgen,
  ROUND(CAST(SUM(CASE WHEN n.erfolgreich = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as erfolgsquote_prozent,
  AVG(n.entfernung_vom_anschuss) as durchschnitt_entfernung,
  AVG(n.dauer_minuten) as durchschnitt_dauer,
  AVG(n.tatsächliche_wartezeit) as durchschnitt_wartezeit
FROM nachsuche_tracking n
JOIN shot_analysis s ON n.shot_analysis_id = s.id
GROUP BY n.revier_id, s.wildart, s.hauptdiagnose;

-- View: Population Trends (aktuell vs. Vorjahr)
CREATE VIEW IF NOT EXISTS population_trends AS
SELECT 
  p1.revier_id,
  p1.wildart,
  p1.jahr as aktuelles_jahr,
  p1.geschätzter_bestand as aktueller_bestand,
  p2.geschätzter_bestand as vorjahres_bestand,
  p1.geschätzter_bestand - p2.geschätzter_bestand as absolute_änderung,
  CASE 
    WHEN p2.geschätzter_bestand > 0 
    THEN ROUND(((p1.geschätzter_bestand - p2.geschätzter_bestand) * 100.0) / p2.geschätzter_bestand, 1)
    ELSE NULL
  END as prozentuale_änderung,
  p1.trend,
  p1.abschüsse_gesamt as abschüsse_aktuell,
  p2.abschüsse_gesamt as abschüsse_vorjahr
FROM population_tracking p1
LEFT JOIN population_tracking p2 ON 
  p1.revier_id = p2.revier_id AND 
  p1.wildart = p2.wildart AND 
  p1.jahr = p2.jahr + 1 AND
  p1.saison = p2.saison;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Calculate nachsuche entfernung_vom_anschuss
CREATE TRIGGER calculate_nachsuche_entfernung
AFTER UPDATE OF fundort_lat, fundort_lng ON nachsuche_tracking
FOR EACH ROW
WHEN NEW.fundort_lat IS NOT NULL AND NEW.fundort_lng IS NOT NULL
BEGIN
  UPDATE nachsuche_tracking
  SET entfernung_vom_anschuss = (
    SELECT 
      -- Haversine formula (simplified - meters)
      111319.9 * SQRT(
        POWER((NEW.fundort_lat - s.location_lat), 2) + 
        POWER((NEW.fundort_lng - s.location_lng) * COS(RADIANS((NEW.fundort_lat + s.location_lat) / 2)), 2)
      )
    FROM shot_analysis s
    WHERE s.id = NEW.shot_analysis_id
  )
  WHERE id = NEW.id;
END;

-- Trigger: Auto-set dauer_minuten when ende_zeitpunkt is set
CREATE TRIGGER calculate_nachsuche_dauer
AFTER UPDATE OF ende_zeitpunkt ON nachsuche_tracking
FOR EACH ROW
WHEN NEW.ende_zeitpunkt IS NOT NULL AND NEW.start_zeitpunkt IS NOT NULL
BEGIN
  UPDATE nachsuche_tracking
  SET dauer_minuten = CAST((julianday(NEW.ende_zeitpunkt) - julianday(NEW.start_zeitpunkt)) * 24 * 60 AS INTEGER)
  WHERE id = NEW.id;
END;

-- Trigger: Invalidate old predictions (cleanup)
CREATE TRIGGER cleanup_expired_predictions
AFTER INSERT ON predictions_cache
FOR EACH ROW
BEGIN
  DELETE FROM predictions_cache
  WHERE gültig_bis < datetime('now', '-7 days');
END;

-- ============================================================================
-- INITIAL DATA / SEED
-- ============================================================================

-- Wartezeit-Empfehlungen (Lookup-Daten für Nachsuche-Assistent)
-- Diese Werte werden vom Service Layer genutzt, aber könnten auch in eine Lookup-Tabelle

-- COMPLETED: Migration 010 - Advanced Analytics
-- Created:
--   - 7 Tables (weather_correlation, movement_patterns, shot_analysis, nachsuche_tracking, population_tracking, predictions_cache, user_contributed_training_data)
--   - 3 Views (shot_analysis_summary, nachsuche_success_rate, population_trends)
--   - 4 Triggers (auto-update timestamps, calculate entfernung, calculate dauer, cleanup predictions)
--   - 20+ Indexes (optimized queries)
