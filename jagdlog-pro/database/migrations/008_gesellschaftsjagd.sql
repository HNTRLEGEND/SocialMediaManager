-- ============================================================================
-- MIGRATION 008: GESELLSCHAFTSJAGD MANAGEMENT
-- Phase 6: Group Hunting Features
-- HNTR LEGEND Pro
-- ============================================================================

-- Gesellschaftsjagden (Haupt-Tabelle)
CREATE TABLE IF NOT EXISTS gesellschaftsjagden (
  id TEXT PRIMARY KEY,
  revier_id TEXT NOT NULL,
  
  -- Basis-Informationen
  name TEXT NOT NULL,
  typ TEXT NOT NULL CHECK(typ IN ('drueckjagd', 'treibjagd', 'bewegungsjagd', 'ansitzjagd_gruppe', 'riegeljagd', 'sonstiges')),
  datum DATE NOT NULL,
  
  -- Zeitplan (JSON)
  zeitplan TEXT NOT NULL,  -- {sammeln, ansprechen, jagdBeginn, jagdEnde, streckeZeigen}
  
  -- Organisation
  jagdleiter_id TEXT NOT NULL,
  max_teilnehmer INTEGER NOT NULL CHECK(max_teilnehmer >= 2 AND max_teilnehmer <= 100),
  anmeldeschluss DATE,
  
  -- Sicherheit (JSON)
  sicherheit TEXT NOT NULL,  -- {notfallkontakt, sammelplatz, notfallplan}
  
  -- Regeln (JSON)
  regeln TEXT NOT NULL,  -- {wildarten[], schussrichtungen[], schussEntfernung, besondereVorschriften}
  
  -- Status
  status TEXT NOT NULL DEFAULT 'geplant' CHECK(status IN ('geplant', 'aktiv', 'abgeschlossen', 'abgesagt')),
  
  -- Metadaten
  erstellt_von TEXT NOT NULL,
  erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  aktualisiert_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (revier_id) REFERENCES reviere(id) ON DELETE CASCADE
);

CREATE INDEX idx_gesellschaftsjagden_revier ON gesellschaftsjagden(revier_id);
CREATE INDEX idx_gesellschaftsjagden_datum ON gesellschaftsjagden(datum);
CREATE INDEX idx_gesellschaftsjagden_status ON gesellschaftsjagden(status);
CREATE INDEX idx_gesellschaftsjagden_jagdleiter ON gesellschaftsjagden(jagdleiter_id);

-- Teilnehmer
CREATE TABLE IF NOT EXISTS jagd_teilnehmer (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Person
  user_id TEXT,  -- NULL wenn nicht registriert
  name TEXT NOT NULL,
  telefon TEXT NOT NULL,
  email TEXT,
  
  -- Rolle
  rolle TEXT NOT NULL CHECK(rolle IN ('jagdleiter', 'schuetze', 'treiber', 'hundefuehrer', 'ansteller', 'bergehelfer', 'sanitaeter')),
  
  -- Ausrüstung (JSON)
  ausruestung TEXT NOT NULL,  -- {waffe, optik, munition, signalweste, funkgeraet}
  
  -- Erfahrung (JSON)
  erfahrung TEXT,  -- {jahreSeit, gesellschaftsjagdenAnzahl, standortPraeferenz}
  
  -- Anmeldung (JSON)
  anmeldung TEXT NOT NULL,  -- {status, angemeldetAm, kommentar}
  
  -- Standort
  zugewiesener_standort_id TEXT,
  
  -- Live-Status (JSON)
  live_status TEXT,  -- {amStandort, letzteAktivitaet, gps}
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (zugewiesener_standort_id) REFERENCES jagd_standorte(id) ON DELETE SET NULL
);

CREATE INDEX idx_jagd_teilnehmer_jagd ON jagd_teilnehmer(jagd_id);
CREATE INDEX idx_jagd_teilnehmer_user ON jagd_teilnehmer(user_id);
CREATE INDEX idx_jagd_teilnehmer_rolle ON jagd_teilnehmer(rolle);

-- Standorte
CREATE TABLE IF NOT EXISTS jagd_standorte (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Identifikation
  nummer INTEGER NOT NULL,
  name TEXT,
  typ TEXT NOT NULL CHECK(typ IN ('hochsitz', 'bodensitz', 'kanzel', 'ansitzleiter', 'druckposten', 'treiberlinie')),
  
  -- Position
  gps_latitude REAL NOT NULL CHECK(gps_latitude >= -90 AND gps_latitude <= 90),
  gps_longitude REAL NOT NULL CHECK(gps_longitude >= -180 AND gps_longitude <= 180),
  hoehe INTEGER,
  poi_id TEXT,  -- Verknüpfung zu POI
  
  -- Beschreibung
  beschreibung TEXT,
  zugang TEXT NOT NULL,
  orientierung INTEGER CHECK(orientierung >= 0 AND orientierung <= 360),
  
  -- Sicherheit (JSON)
  sicherheit TEXT NOT NULL,  -- {schussrichtungen[], gefahrenbereiche[], sichtfeld}
  
  -- Eigenschaften (JSON)
  eigenschaften TEXT NOT NULL,  -- {ueberdacht, beheizt, kapazitaet, barrierefrei, ansitzleiter}
  
  -- Status
  status TEXT NOT NULL DEFAULT 'verfuegbar' CHECK(status IN ('verfuegbar', 'besetzt', 'gesperrt')),
  
  -- Historie (JSON)
  historie TEXT,  -- {haeufigsteWildart, durchschnittAbschuesse, erfolgreicheJagden, totalJagden}
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE SET NULL,
  
  UNIQUE(jagd_id, nummer)
);

CREATE INDEX idx_jagd_standorte_jagd ON jagd_standorte(jagd_id);
CREATE INDEX idx_jagd_standorte_gps ON jagd_standorte(gps_latitude, gps_longitude);
CREATE INDEX idx_jagd_standorte_status ON jagd_standorte(status);

-- Standort-Zuweisungen
CREATE TABLE IF NOT EXISTS standort_zuweisungen (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  standort_id TEXT NOT NULL,
  teilnehmer_id TEXT NOT NULL,
  
  -- Zuweisung
  zugewiesen_von TEXT NOT NULL,
  zugewiesen_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  prioritaet INTEGER DEFAULT 1,
  
  -- Bestätigung
  bestaetigt BOOLEAN DEFAULT 0,
  bestaetigt_am DATETIME,
  
  -- Notizen
  notizen TEXT,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id) ON DELETE CASCADE,
  FOREIGN KEY (teilnehmer_id) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE,
  
  UNIQUE(jagd_id, standort_id, teilnehmer_id)
);

CREATE INDEX idx_standort_zuweisungen_jagd ON standort_zuweisungen(jagd_id);
CREATE INDEX idx_standort_zuweisungen_standort ON standort_zuweisungen(standort_id);
CREATE INDEX idx_standort_zuweisungen_teilnehmer ON standort_zuweisungen(teilnehmer_id);

-- Treiben
CREATE TABLE IF NOT EXISTS jagd_treiben (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Identifikation
  nummer INTEGER NOT NULL,
  name TEXT NOT NULL,
  
  -- Zeitplan
  start DATETIME NOT NULL,
  geschaetzte_dauer INTEGER NOT NULL,  -- Minuten
  ende DATETIME,
  
  -- Gebiet (JSON Polygon)
  treibgebiet TEXT NOT NULL,
  richtung INTEGER NOT NULL CHECK(richtung >= 0 AND richtung <= 360),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'geplant' CHECK(status IN ('geplant', 'laufend', 'abgeschlossen', 'abgebrochen')),
  
  -- Ergebnis (JSON)
  ergebnis TEXT,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  
  UNIQUE(jagd_id, nummer)
);

CREATE INDEX idx_jagd_treiben_jagd ON jagd_treiben(jagd_id);
CREATE INDEX idx_jagd_treiben_status ON jagd_treiben(status);

-- Treiben-Treiber (Many-to-Many)
CREATE TABLE IF NOT EXISTS treiben_treiber (
  treiben_id TEXT NOT NULL,
  teilnehmer_id TEXT NOT NULL,
  position TEXT NOT NULL CHECK(position IN ('links', 'mitte', 'rechts', 'flanke')),
  abstand INTEGER,  -- Meter
  hundeeinsatz BOOLEAN DEFAULT 0,
  
  PRIMARY KEY (treiben_id, teilnehmer_id),
  FOREIGN KEY (treiben_id) REFERENCES jagd_treiben(id) ON DELETE CASCADE,
  FOREIGN KEY (teilnehmer_id) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE
);

-- Treiben-Standorte (Many-to-Many)
CREATE TABLE IF NOT EXISTS treiben_standorte (
  treiben_id TEXT NOT NULL,
  standort_id TEXT NOT NULL,
  
  PRIMARY KEY (treiben_id, standort_id),
  FOREIGN KEY (treiben_id) REFERENCES jagd_treiben(id) ON DELETE CASCADE,
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id) ON DELETE CASCADE
);

-- Live Events
CREATE TABLE IF NOT EXISTS jagd_live_events (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  typ TEXT NOT NULL CHECK(typ IN ('abschuss', 'nachsuche', 'wildsichtung', 'standort_erreicht', 'treiben_start', 'treiben_ende', 'notfall', 'nachricht', 'pause', 'jagd_ende')),
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  von TEXT NOT NULL,  -- Teilnehmer-ID
  
  -- Event-Daten (JSON)
  daten TEXT NOT NULL,
  
  -- Sichtbarkeit
  sichtbar_fuer TEXT NOT NULL CHECK(sichtbar_fuer IN ('alle', 'jagdleiter', 'schuetzen', 'treiber')),
  
  -- Status
  gelesen BOOLEAN DEFAULT 0,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (von) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE
);

CREATE INDEX idx_jagd_live_events_jagd ON jagd_live_events(jagd_id);
CREATE INDEX idx_jagd_live_events_zeitpunkt ON jagd_live_events(zeitpunkt DESC);
CREATE INDEX idx_jagd_live_events_typ ON jagd_live_events(typ);

-- Kommunikations-Kanäle
CREATE TABLE IF NOT EXISTS jagd_kanaele (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  name TEXT NOT NULL,
  typ TEXT NOT NULL CHECK(typ IN ('haupt', 'jagdleitung', 'schuetzen', 'treiber', 'notfall')),
  prioritaet TEXT DEFAULT 'normal' CHECK(prioritaet IN ('normal', 'hoch', 'kritisch')),
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  
  UNIQUE(jagd_id, typ)
);

CREATE INDEX idx_jagd_kanaele_jagd ON jagd_kanaele(jagd_id);

-- Nachrichten
CREATE TABLE IF NOT EXISTS jagd_nachrichten (
  id TEXT PRIMARY KEY,
  kanal_id TEXT NOT NULL,
  von TEXT NOT NULL,  -- Teilnehmer-ID
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Inhalt
  typ TEXT NOT NULL CHECK(typ IN ('text', 'audio', 'bild', 'standort')),
  inhalt TEXT NOT NULL,
  
  -- Priorität
  prioritaet TEXT DEFAULT 'normal' CHECK(prioritaet IN ('normal', 'wichtig', 'dringend')),
  
  -- Reply
  antwort_auf TEXT,
  
  FOREIGN KEY (kanal_id) REFERENCES jagd_kanaele(id) ON DELETE CASCADE,
  FOREIGN KEY (von) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE,
  FOREIGN KEY (antwort_auf) REFERENCES jagd_nachrichten(id) ON DELETE SET NULL
);

CREATE INDEX idx_jagd_nachrichten_kanal ON jagd_nachrichten(kanal_id);
CREATE INDEX idx_jagd_nachrichten_zeitpunkt ON jagd_nachrichten(zeitpunkt DESC);

-- Nachricht-Gelesen-Status
CREATE TABLE IF NOT EXISTS nachrichten_gelesen (
  nachricht_id TEXT NOT NULL,
  teilnehmer_id TEXT NOT NULL,
  gelesen_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (nachricht_id, teilnehmer_id),
  FOREIGN KEY (nachricht_id) REFERENCES jagd_nachrichten(id) ON DELETE CASCADE,
  FOREIGN KEY (teilnehmer_id) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE
);

-- Strecken-Abschüsse
CREATE TABLE IF NOT EXISTS strecken_abschuesse (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Wer?
  schuetze_id TEXT NOT NULL,
  standort_id TEXT NOT NULL,
  treiben_nummer INTEGER,
  
  -- Was?
  wildart TEXT NOT NULL,
  geschlecht TEXT NOT NULL CHECK(geschlecht IN ('männlich', 'weiblich', 'unbekannt')),
  altersklasse TEXT NOT NULL,
  anzahl INTEGER DEFAULT 1 CHECK(anzahl >= 1),
  
  -- Wann & Wo?
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  gps_latitude REAL NOT NULL,
  gps_longitude REAL NOT NULL,
  
  -- Details (JSON)
  details TEXT NOT NULL,  -- {gewicht, groesse, trophae, schussabgabe}
  
  -- Verwertung (JSON)
  verwertung TEXT NOT NULL,  -- {aufbrechDatum, aufbrechOrt, wildbrethygiene, trichinenprobe, verwendung}
  
  -- Wildmarke (JSON)
  wildmarke TEXT,
  
  -- Metadaten
  erfasst_von TEXT NOT NULL,
  erfasst_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (schuetze_id) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE,
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id) ON DELETE CASCADE
);

CREATE INDEX idx_strecken_abschuesse_jagd ON strecken_abschuesse(jagd_id);
CREATE INDEX idx_strecken_abschuesse_schuetze ON strecken_abschuesse(schuetze_id);
CREATE INDEX idx_strecken_abschuesse_wildart ON strecken_abschuesse(wildart);
CREATE INDEX idx_strecken_abschuesse_zeitpunkt ON strecken_abschuesse(zeitpunkt);

-- Strecken-Fotos
CREATE TABLE IF NOT EXISTS strecken_fotos (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  
  -- Foto
  uri TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  aufnahme_datum DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Typ
  typ TEXT NOT NULL CHECK(typ IN ('strecke_gesamt', 'einzeltier', 'trophae', 'gruppe')),
  
  -- Zuordnung (JSON Array)
  abschuss_ids TEXT,
  
  -- Metadaten
  beschreibung TEXT,
  gps_latitude REAL,
  gps_longitude REAL,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE
);

CREATE INDEX idx_strecken_fotos_jagd ON strecken_fotos(jagd_id);
CREATE INDEX idx_strecken_fotos_typ ON strecken_fotos(typ);

-- Trichinenproben
CREATE TABLE IF NOT EXISTS trichinenproben (
  id TEXT PRIMARY KEY,
  abschuss_id TEXT NOT NULL,
  
  -- Probe
  proben_nummer TEXT NOT NULL UNIQUE,
  entnahme_datum DATETIME DEFAULT CURRENT_TIMESTAMP,
  entnommen_von TEXT NOT NULL,
  
  -- Labor
  labor TEXT,
  versand_datum DATETIME,
  ergebnis_datum DATETIME,
  ergebnis TEXT CHECK(ergebnis IN ('negativ', 'positiv', 'unklar')),
  
  -- Dokumente (JSON Array)
  dokumente TEXT,
  
  FOREIGN KEY (abschuss_id) REFERENCES strecken_abschuesse(id) ON DELETE CASCADE
);

CREATE INDEX idx_trichinenproben_abschuss ON trichinenproben(abschuss_id);
CREATE INDEX idx_trichinenproben_nummer ON trichinenproben(proben_nummer);

-- Jagd-Protokolle
CREATE TABLE IF NOT EXISTS jagd_protokolle (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL UNIQUE,
  
  -- Pflichtangaben (JSON)
  pflichtangaben TEXT NOT NULL,
  
  -- Teilnehmer-Anzahl (JSON)
  teilnehmer_anzahl TEXT NOT NULL,
  
  -- Zeitplan (JSON)
  zeitplan TEXT NOT NULL,
  
  -- Wetter (JSON)
  wetter TEXT NOT NULL,
  
  -- Strecke (JSON)
  strecke TEXT NOT NULL,
  
  -- Besonderheiten (JSON)
  besonderheiten TEXT NOT NULL,
  
  -- Kommentare
  bemerkungen TEXT,
  verbesserungsvorschlaege TEXT,
  
  -- Unterschriften (JSON)
  unterschriften TEXT,
  
  -- Export
  pdf_generiert BOOLEAN DEFAULT 0,
  pdf_uri TEXT,
  
  -- Behördenmeldung (JSON)
  behoerdenmeldung TEXT,
  
  -- Metadaten
  erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  aktualisiert_am DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE
);

-- Notfälle
CREATE TABLE IF NOT EXISTS jagd_notfaelle (
  id TEXT PRIMARY KEY,
  jagd_id TEXT NOT NULL,
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Melder
  gemeldet_von TEXT NOT NULL,
  standort_id TEXT,
  gps_latitude REAL NOT NULL,
  gps_longitude REAL NOT NULL,
  
  -- Art
  art TEXT NOT NULL CHECK(art IN ('unfall', 'verletzung', 'herzinfarkt', 'verirrung', 'wildunfall', 'sonstiges')),
  schweregrad TEXT NOT NULL CHECK(schweregrad IN ('niedrig', 'mittel', 'hoch', 'kritisch')),
  
  -- Beschreibung
  beschreibung TEXT NOT NULL,
  betroffene_personen TEXT NOT NULL,  -- JSON Array
  
  -- Maßnahmen (JSON)
  massnahmen TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'gemeldet' CHECK(status IN ('gemeldet', 'in_bearbeitung', 'aufgeloest', 'abgeschlossen')),
  aufgeloest_am DATETIME,
  
  -- Fotos (JSON Array)
  fotos TEXT,
  
  FOREIGN KEY (jagd_id) REFERENCES gesellschaftsjagden(id) ON DELETE CASCADE,
  FOREIGN KEY (gemeldet_von) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE,
  FOREIGN KEY (standort_id) REFERENCES jagd_standorte(id) ON DELETE SET NULL
);

CREATE INDEX idx_jagd_notfaelle_jagd ON jagd_notfaelle(jagd_id);
CREATE INDEX idx_jagd_notfaelle_status ON jagd_notfaelle(status);
CREATE INDEX idx_jagd_notfaelle_schweregrad ON jagd_notfaelle(schweregrad);

-- Notfall-Verlauf
CREATE TABLE IF NOT EXISTS notfall_verlauf (
  id TEXT PRIMARY KEY,
  notfall_id TEXT NOT NULL,
  zeitpunkt DATETIME DEFAULT CURRENT_TIMESTAMP,
  von TEXT NOT NULL,
  aktion TEXT NOT NULL,
  bemerkung TEXT,
  
  FOREIGN KEY (notfall_id) REFERENCES jagd_notfaelle(id) ON DELETE CASCADE,
  FOREIGN KEY (von) REFERENCES jagd_teilnehmer(id) ON DELETE CASCADE
);

CREATE INDEX idx_notfall_verlauf_notfall ON notfall_verlauf(notfall_id);

-- ============================================================================
-- VIEWS für schnellere Queries
-- ============================================================================

-- View: Jagd-Übersicht mit Teilnehmer-Anzahl
CREATE VIEW IF NOT EXISTS v_jagd_uebersicht AS
SELECT 
  g.*,
  COUNT(DISTINCT t.id) as teilnehmer_anzahl,
  COUNT(DISTINCT CASE WHEN t.anmeldung LIKE '%"status":"zugesagt"%' THEN t.id END) as zugesagt_anzahl,
  COUNT(DISTINCT s.id) as standorte_anzahl,
  COUNT(DISTINCT a.id) as strecke_anzahl
FROM gesellschaftsjagden g
LEFT JOIN jagd_teilnehmer t ON t.jagd_id = g.id
LEFT JOIN jagd_standorte s ON s.jagd_id = g.id
LEFT JOIN strecken_abschuesse a ON a.jagd_id = g.id
GROUP BY g.id;

-- View: Strecken-Zusammenfassung
CREATE VIEW IF NOT EXISTS v_strecke_zusammenfassung AS
SELECT 
  jagd_id,
  COUNT(*) as gesamt,
  SUM(anzahl) as total_anzahl,
  COUNT(DISTINCT wildart) as wildarten_anzahl,
  COUNT(DISTINCT schuetze_id) as erfolgreiche_schuetzen
FROM strecken_abschuesse
GROUP BY jagd_id;

-- View: Standort-Belegung
CREATE VIEW IF NOT EXISTS v_standort_belegung AS
SELECT 
  s.*,
  GROUP_CONCAT(t.name, ', ') as zugewiesene_personen_namen,
  COUNT(z.id) as anzahl_zuweisungen
FROM jagd_standorte s
LEFT JOIN standort_zuweisungen z ON z.standort_id = s.id
LEFT JOIN jagd_teilnehmer t ON t.id = z.teilnehmer_id
GROUP BY s.id;

-- ============================================================================
-- SAMPLE DATA (für Testing)
-- ============================================================================

-- Beispiel Gesellschaftsjagd
INSERT INTO gesellschaftsjagden (
  id, revier_id, name, typ, datum,
  zeitplan,
  jagdleiter_id, max_teilnehmer,
  sicherheit,
  regeln,
  status, erstellt_von
) VALUES (
  'gjagd-001',
  'revier-001',
  'Winterdrückjagd Hauptrevier 2026',
  'drueckjagd',
  '2026-12-15',
  '{"sammeln":"2026-12-15T07:00:00Z","ansprechen":"2026-12-15T07:30:00Z","jagdBeginn":"2026-12-15T08:00:00Z","jagdEnde":"2026-12-15T13:00:00Z","streckeZeigen":"2026-12-15T14:00:00Z"}',
  'user-001',
  30,
  '{"notfallkontakt":"112","sammelplatz":{"latitude":48.7758,"longitude":9.1829},"notfallplan":"Sammelplatz am Waldparkplatz. Rettungspunkt: RW 52 345 678"}',
  '{"wildarten":["Rehwild","Schwarzwild","Rotwild"],"schussrichtungen":["Nord","Ost","Süd"],"schussEntfernung":150,"besondereVorschriften":"Keine Schüsse über Treiber-Linie"}',
  'geplant',
  'user-001'
);

-- Beispiel Teilnehmer
INSERT INTO jagd_teilnehmer (
  id, jagd_id, user_id, name, telefon, email, rolle,
  ausruestung,
  erfahrung,
  anmeldung
) VALUES 
(
  'jt-001',
  'gjagd-001',
  'user-001',
  'Hans Müller',
  '+49 151 12345678',
  'hans.mueller@example.com',
  'jagdleiter',
  '{"waffe":"Repetierbüchse .308","optik":"Zielfernrohr 3-12x56","munition":"180gr Teilmantel","signalweste":true,"funkgeraet":true}',
  '{"jahreSeit":2001,"gesellschaftsjagdenAnzahl":45,"standortPraeferenz":"hochsitz"}',
  '{"status":"zugesagt","angemeldetAm":"2026-11-01T10:00:00Z","kommentar":"Bin dabei!"}'
),
(
  'jt-002',
  'gjagd-001',
  'user-002',
  'Peter Schmidt',
  '+49 172 98765432',
  'peter.schmidt@example.com',
  'schuetze',
  '{"waffe":"Drilling 16/70","optik":"Rotpunkt","munition":"Brenneke","signalweste":true,"funkgeraet":false}',
  '{"jahreSeit":2010,"gesellschaftsjagdenAnzahl":12,"standortPraeferenz":"bodensitz"}',
  '{"status":"zugesagt","angemeldetAm":"2026-11-02T14:30:00Z"}'
),
(
  'jt-003',
  'gjagd-001',
  NULL,
  'Klaus Weber',
  '+49 160 11223344',
  NULL,
  'treiber',
  '{"waffe":"","optik":"","munition":"","signalweste":true,"funkgeraet":true}',
  '{"jahreSeit":2015,"gesellschaftsjagdenAnzahl":8,"standortPraeferenz":"treiber"}',
  '{"status":"zugesagt","angemeldetAm":"2026-11-03T09:15:00Z"}'
);

-- Beispiel Standorte
INSERT INTO jagd_standorte (
  id, jagd_id, nummer, name, typ,
  gps_latitude, gps_longitude, hoehe,
  beschreibung, zugang, orientierung,
  sicherheit,
  eigenschaften,
  status
) VALUES
(
  'js-001',
  'gjagd-001',
  1,
  'Hochsitz am Nordrand',
  'hochsitz',
  48.7760,
  9.1830,
  450,
  'Erhöhter Hochsitz mit guter Übersicht über Waldrand',
  'Von Parkplatz 150m Richtung Norden',
  90,
  '{"schussrichtungen":[0,45,90,135],"gefahrenbereiche":[],"sichtfeld":{"winkel":180,"reichweite":200}}',
  '{"ueberdacht":true,"beheizt":false,"kapazitaet":2,"barrierefrei":false,"ansitzleiter":false}',
  'verfuegbar'
),
(
  'js-002',
  'gjagd-001',
  2,
  'Kanzel Wiesenhang',
  'kanzel',
  48.7755,
  9.1835,
  430,
  'Kanzel am Wiesenhang mit Blick auf Tal',
  'Vom Forstweg 200m bergauf',
  270,
  '{"schussrichtungen":[180,225,270,315,360],"gefahrenbereiche":[],"sichtfeld":{"winkel":200,"reichweite":180}}',
  '{"ueberdacht":true,"beheizt":true,"kapazitaet":1,"barrierefrei":false,"ansitzleiter":false}',
  'verfuegbar'
);

-- Beispiel Standort-Zuweisung
INSERT INTO standort_zuweisungen (
  id, jagd_id, standort_id, teilnehmer_id,
  zugewiesen_von, prioritaet, bestaetigt, notizen
) VALUES
(
  'sz-001',
  'gjagd-001',
  'js-001',
  'jt-001',
  'user-001',
  1,
  1,
  'Jagdleiter auf Standort 1 für Übersicht'
);

-- Update Teilnehmer mit Standort
UPDATE jagd_teilnehmer 
SET zugewiesener_standort_id = 'js-001' 
WHERE id = 'jt-001';

-- Update Standort Status
UPDATE jagd_standorte 
SET status = 'besetzt' 
WHERE id = 'js-001';

-- Beispiel Kommunikations-Kanäle
INSERT INTO jagd_kanaele (id, jagd_id, name, typ, prioritaet) VALUES
('jk-001', 'gjagd-001', 'Hauptkanal', 'haupt', 'normal'),
('jk-002', 'gjagd-001', 'Jagdleitung', 'jagdleitung', 'hoch'),
('jk-003', 'gjagd-001', 'Schützen', 'schuetzen', 'normal'),
('jk-004', 'gjagd-001', 'Treiber', 'treiber', 'normal'),
('jk-005', 'gjagd-001', 'Notfall', 'notfall', 'kritisch');

-- ============================================================================
-- TRIGGERS für Automatisierung
-- ============================================================================

-- Auto-Update aktualisiert_am bei Änderungen
CREATE TRIGGER IF NOT EXISTS update_gesellschaftsjagd_timestamp 
AFTER UPDATE ON gesellschaftsjagden
BEGIN
  UPDATE gesellschaftsjagden 
  SET aktualisiert_am = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_protokoll_timestamp 
AFTER UPDATE ON jagd_protokolle
BEGIN
  UPDATE jagd_protokolle 
  SET aktualisiert_am = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Auto-Create Kommunikations-Kanäle bei neuer Jagd
CREATE TRIGGER IF NOT EXISTS create_jagd_kanaele
AFTER INSERT ON gesellschaftsjagden
BEGIN
  INSERT INTO jagd_kanaele (id, jagd_id, name, typ, prioritaet) VALUES
    (NEW.id || '-haupt', NEW.id, 'Hauptkanal', 'haupt', 'normal'),
    (NEW.id || '-leitung', NEW.id, 'Jagdleitung', 'jagdleitung', 'hoch'),
    (NEW.id || '-schuetzen', NEW.id, 'Schützen', 'schuetzen', 'normal'),
    (NEW.id || '-treiber', NEW.id, 'Treiber', 'treiber', 'normal'),
    (NEW.id || '-notfall', NEW.id, 'Notfall', 'notfall', 'kritisch');
END;

-- ============================================================================
-- FULL-TEXT SEARCH
-- ============================================================================

-- FTS für Jagd-Suche
CREATE VIRTUAL TABLE IF NOT EXISTS gesellschaftsjagden_fts USING fts5(
  name,
  typ,
  content=gesellschaftsjagden,
  content_rowid=rowid
);

-- Trigger für FTS-Sync
CREATE TRIGGER IF NOT EXISTS gesellschaftsjagden_fts_insert
AFTER INSERT ON gesellschaftsjagden
BEGIN
  INSERT INTO gesellschaftsjagden_fts(rowid, name, typ)
  VALUES (NEW.rowid, NEW.name, NEW.typ);
END;

CREATE TRIGGER IF NOT EXISTS gesellschaftsjagden_fts_delete
AFTER DELETE ON gesellschaftsjagden
BEGIN
  DELETE FROM gesellschaftsjagden_fts WHERE rowid = OLD.rowid;
END;

CREATE TRIGGER IF NOT EXISTS gesellschaftsjagden_fts_update
AFTER UPDATE ON gesellschaftsjagden
BEGIN
  UPDATE gesellschaftsjagden_fts 
  SET name = NEW.name, typ = NEW.typ
  WHERE rowid = NEW.rowid;
END;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Version tracking
INSERT INTO schema_version (version, description, applied_at) 
VALUES (8, 'Gesellschaftsjagd Management - Phase 6', CURRENT_TIMESTAMP);
