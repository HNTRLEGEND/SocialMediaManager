/**
 * Tracking Assistant Service
 * 
 * Features:
 * - GPS-Nachsuche-Tracking
 * - Echtzeit-Empfehlungen während Nachsuche
 * - Pirschzeichen-Dokumentation
 * - Fundort-Markierung
 * - Erfolgs-Bewertung
 * - Entfernungs-Berechnung (Haversine)
 */

import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import * as Location from 'expo-location';
import type {
  NachsucheTracking,
  TrackingPunkt,
  WahrscheinlichkeitsZone,
} from '../types/analytics';

// ============================================================================
// TYPES
// ============================================================================

interface NachsucheInput {
  shot_analysis_id: string;
  empfohlene_wartezeit: number; // Minuten
  empfohlene_strategie: string;
  hund_empfohlen: boolean;
  hund_typ?: string;
}

interface NachsucheResult {
  gefunden: boolean;
  fundort?: {
    latitude: number;
    longitude: number;
  };
  zustand?: 'Verendet' | 'Lebend_erlegt';
  erfolgreich: boolean;
  wild_geborgen: boolean;
  abbruch_grund?: string;
  fotos?: string[]; // URIs
  notizen?: string;
  jagdgenossenschaft_informiert?: boolean;
  nachbarrevier_informiert?: boolean;
  meldung_behörde?: boolean;
}

interface RealtimeEmpfehlung {
  aktueller_radius: number; // Meter vom Anschuss
  nächste_zone?: WahrscheinlichkeitsZone;
  empfohlene_richtung?: number; // Grad
  pirschzeichen_erwartung: string;
  status_nachricht: string;
}

interface HundeEinsatz {
  hund_art: string;
  hund_name: string;
  hundeführer: string;
}

// ============================================================================
// SERVICE
// ============================================================================

class TrackingAssistantService {
  private db: SQLite.SQLiteDatabase;
  private locationSubscription: Location.LocationSubscription | null = null;

  constructor() {
    this.db = SQLite.openDatabaseSync('jagdlog.db');
  }

  // ============================================================================
  // NACHSUCHE STARTEN
  // ============================================================================

  /**
   * Startet eine Nachsuche
   */
  async starteNachsuche(
    user_id: string,
    revier_id: string,
    input: NachsucheInput
  ): Promise<NachsucheTracking> {
    const id = uuidv4();

    // Hole Anschuss-Daten für Startpunkt
    const shotAnalysis = await this.db.getFirstAsync<any>(
      `SELECT location_lat, location_lng, fluchtrichtung FROM shot_analysis WHERE id = ?`,
      [input.shot_analysis_id]
    );

    if (!shotAnalysis) {
      throw new Error('Shot analysis not found');
    }

    const now = new Date();

    // Erstelle Nachsuche-Eintrag
    await this.db.runAsync(
      `INSERT INTO nachsuche_tracking (
        id, shot_analysis_id, user_id, revier_id,
        status, empfohlene_wartezeit, empfohlene_strategie, hund_empfohlen, hund_typ,
        start_zeitpunkt, startpunkt_lat, startpunkt_lng,
        fluchtrichtung, gesuchter_radius, tracking_punkte
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.shot_analysis_id,
        user_id,
        revier_id,
        'Geplant',
        input.empfohlene_wartezeit,
        input.empfohlene_strategie,
        input.hund_empfohlen ? 1 : 0,
        input.hund_typ || null,
        now.toISOString(),
        shotAnalysis.location_lat,
        shotAnalysis.location_lng,
        shotAnalysis.fluchtrichtung || 0,
        500, // Initial radius
        JSON.stringify([]), // Empty tracking points
      ]
    );

    return {
      id,
      shot_analysis_id: input.shot_analysis_id,
      status: 'Geplant',
      empfohlene_wartezeit: input.empfohlene_wartezeit,
      tatsächliche_wartezeit: 0,
      empfohlene_strategie: input.empfohlene_strategie,
      hund_empfohlen: input.hund_empfohlen,
      hund_typ: input.hund_typ,
      hund_eingesetzt: false,
      start_zeitpunkt: now,
      startpunkt: {
        latitude: shotAnalysis.location_lat,
        longitude: shotAnalysis.location_lng,
      },
      fluchtrichtung: shotAnalysis.fluchtrichtung || 0,
      gesuchter_radius: 500,
      tracking_punkte: [],
      gefunden: false,
      erfolgreich: false,
      wild_geborgen: false,
    };
  }

  /**
   * Markiert Nachsuche als gestartet (Wartezeit vorbei)
   */
  async starteAktiveNachsuche(
    nachsuche_id: string,
    tatsächliche_wartezeit: number,
    hunde_einsatz?: HundeEinsatz
  ): Promise<void> {
    const updates: string[] = ['status = ?', 'tatsächliche_wartezeit = ?'];
    const params: any[] = ['Laufend', tatsächliche_wartezeit];

    if (hunde_einsatz) {
      updates.push('hund_eingesetzt = ?', 'hund_art = ?', 'hund_name = ?', 'hundeführer = ?');
      params.push(1, hunde_einsatz.hund_art, hunde_einsatz.hund_name, hunde_einsatz.hundeführer);
    }

    params.push(nachsuche_id);

    await this.db.runAsync(
      `UPDATE nachsuche_tracking SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  // ============================================================================
  // GPS TRACKING
  // ============================================================================

  /**
   * Fügt GPS-Tracking-Punkt hinzu
   */
  async addTrackingPunkt(
    nachsuche_id: string,
    punkt: Omit<TrackingPunkt, 'id'>
  ): Promise<void> {
    // Hole aktuelle Tracking-Punkte
    const nachsuche = await this.db.getFirstAsync<any>(
      `SELECT tracking_punkte FROM nachsuche_tracking WHERE id = ?`,
      [nachsuche_id]
    );

    if (!nachsuche) {
      throw new Error('Nachsuche not found');
    }

    const trackingPunkte: TrackingPunkt[] = nachsuche.tracking_punkte
      ? JSON.parse(nachsuche.tracking_punkte)
      : [];

    // Füge neuen Punkt hinzu
    trackingPunkte.push({
      id: uuidv4(),
      ...punkt,
    });

    // Update
    await this.db.runAsync(
      `UPDATE nachsuche_tracking SET tracking_punkte = ? WHERE id = ?`,
      [JSON.stringify(trackingPunkte), nachsuche_id]
    );
  }

  /**
   * Startet automatisches GPS-Tracking (alle 30 Sekunden)
   */
  async startAutoTracking(nachsuche_id: string): Promise<void> {
    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Subscribe to location updates
    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 seconds
        distanceInterval: 10, // 10 meters
      },
      async (location) => {
        await this.addTrackingPunkt(nachsuche_id, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          zeitpunkt: new Date(),
          notiz: 'Auto-tracked',
        });
      }
    );
  }

  /**
   * Stoppt automatisches GPS-Tracking
   */
  async stopAutoTracking(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  // ============================================================================
  // FUNDORT MARKIEREN
  // ============================================================================

  /**
   * Markiert Fundort des Wildes
   */
  async markiereFundort(
    nachsuche_id: string,
    location: { latitude: number; longitude: number },
    zustand: 'Verendet' | 'Lebend_erlegt'
  ): Promise<void> {
    await this.db.runAsync(
      `UPDATE nachsuche_tracking 
       SET gefunden = ?, fundort_lat = ?, fundort_lng = ?, zustand = ?
       WHERE id = ?`,
      [1, location.latitude, location.longitude, zustand, nachsuche_id]
    );

    // Add tracking point
    await this.addTrackingPunkt(nachsuche_id, {
      latitude: location.latitude,
      longitude: location.longitude,
      zeitpunkt: new Date(),
      notiz: `Wild gefunden (${zustand})`,
      foto_uri: undefined,
      pirschzeichen: undefined,
    });

    // Trigger berechnet automatisch Entfernung via SQL-Trigger
  }

  /**
   * Dokumentiert gefundenes Pirschzeichen
   */
  async dokumentierePirschzeichen(
    nachsuche_id: string,
    location: { latitude: number; longitude: number },
    pirschzeichen: {
      typ: string;
      beschreibung?: string;
      foto_uri?: string;
    }
  ): Promise<void> {
    // Hole aktuelle gefundene Zeichen
    const nachsuche = await this.db.getFirstAsync<any>(
      `SELECT gefundene_zeichen FROM nachsuche_tracking WHERE id = ?`,
      [nachsuche_id]
    );

    if (!nachsuche) {
      throw new Error('Nachsuche not found');
    }

    const gefundeneZeichen = nachsuche.gefundene_zeichen
      ? JSON.parse(nachsuche.gefundene_zeichen)
      : [];

    // Füge neues Zeichen hinzu
    gefundeneZeichen.push({
      typ: pirschzeichen.typ,
      beschreibung: pirschzeichen.beschreibung,
      location,
      foto_uri: pirschzeichen.foto_uri,
      zeitpunkt: new Date().toISOString(),
    });

    // Update
    await this.db.runAsync(
      `UPDATE nachsuche_tracking SET gefundene_zeichen = ? WHERE id = ?`,
      [JSON.stringify(gefundeneZeichen), nachsuche_id]
    );

    // Add tracking point
    await this.addTrackingPunkt(nachsuche_id, {
      latitude: location.latitude,
      longitude: location.longitude,
      zeitpunkt: new Date(),
      notiz: pirschzeichen.beschreibung,
      foto_uri: pirschzeichen.foto_uri,
      pirschzeichen: pirschzeichen.typ,
    });
  }

  // ============================================================================
  // NACHSUCHE ABSCHLIESSEN
  // ============================================================================

  /**
   * Schließt Nachsuche ab (Erfolg oder Abbruch)
   */
  async abschliesseNachsuche(nachsuche_id: string, result: NachsucheResult): Promise<void> {
    const ende_zeitpunkt = new Date();

    const updates: string[] = [
      'status = ?',
      'ende_zeitpunkt = ?',
      'erfolgreich = ?',
      'wild_geborgen = ?',
    ];
    const params: any[] = [
      result.erfolgreich ? 'Abgeschlossen' : 'Erfolglos',
      ende_zeitpunkt.toISOString(),
      result.erfolgreich ? 1 : 0,
      result.wild_geborgen ? 1 : 0,
    ];

    if (result.fundort) {
      updates.push('gefunden = ?', 'fundort_lat = ?', 'fundort_lng = ?');
      params.push(1, result.fundort.latitude, result.fundort.longitude);
    }

    if (result.zustand) {
      updates.push('zustand = ?');
      params.push(result.zustand);
    }

    if (result.abbruch_grund) {
      updates.push('abbruch_grund = ?');
      params.push(result.abbruch_grund);
    }

    if (result.fotos) {
      updates.push('fotos = ?');
      params.push(JSON.stringify(result.fotos));
    }

    if (result.notizen) {
      updates.push('notizen = ?');
      params.push(result.notizen);
    }

    if (result.jagdgenossenschaft_informiert !== undefined) {
      updates.push('jagdgenossenschaft_informiert = ?');
      params.push(result.jagdgenossenschaft_informiert ? 1 : 0);
    }

    if (result.nachbarrevier_informiert !== undefined) {
      updates.push('nachbarrevier_informiert = ?');
      params.push(result.nachbarrevier_informiert ? 1 : 0);
    }

    if (result.meldung_behörde !== undefined) {
      updates.push('meldung_behörde = ?');
      params.push(result.meldung_behörde ? 1 : 0);
    }

    params.push(nachsuche_id);

    await this.db.runAsync(
      `UPDATE nachsuche_tracking SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Stop auto-tracking
    await this.stopAutoTracking();
  }

  // ============================================================================
  // ECHTZEIT-EMPFEHLUNGEN
  // ============================================================================

  /**
   * Gibt Echtzeit-Empfehlungen während Nachsuche
   */
  async getRealtimeEmpfehlungen(
    nachsuche_id: string,
    current_location: { latitude: number; longitude: number }
  ): Promise<RealtimeEmpfehlung> {
    // Hole Nachsuche-Daten
    const nachsuche = await this.db.getFirstAsync<any>(
      `SELECT * FROM nachsuche_tracking WHERE id = ?`,
      [nachsuche_id]
    );

    if (!nachsuche) {
      throw new Error('Nachsuche not found');
    }

    // Hole Anschuss-Daten für Wahrscheinlichkeits-Zonen
    const shotAnalysis = await this.db.getFirstAsync<any>(
      `SELECT hauptdiagnose FROM shot_analysis WHERE id = ?`,
      [nachsuche.shot_analysis_id]
    );

    // Berechne Entfernung vom Anschuss
    const aktueller_radius = this.calculateDistance(
      { latitude: nachsuche.startpunkt_lat, longitude: nachsuche.startpunkt_lng },
      current_location
    );

    // TODO: Load Wahrscheinlichkeits-Zonen from shot_analysis recommendation
    // For now: Mock logic

    let status_nachricht: string;
    let pirschzeichen_erwartung: string;

    if (aktueller_radius < 50) {
      status_nachricht = 'Sie befinden sich am Anschuss. Suchen Sie nach Pirschzeichen.';
      pirschzeichen_erwartung = 'Blut, Haare, Wildpret, Fährte';
    } else if (aktueller_radius < 200) {
      status_nachricht = `${Math.round(aktueller_radius)}m vom Anschuss. Folgen Sie der Schweißfährte.`;
      pirschzeichen_erwartung = 'Blutstropfen, Fährte';
    } else if (aktueller_radius < 500) {
      status_nachricht = `${Math.round(aktueller_radius)}m vom Anschuss. Sie nähern sich der Hauptzone.`;
      pirschzeichen_erwartung = 'Wild könnte in Deckung liegen';
    } else {
      status_nachricht = `${Math.round(aktueller_radius)}m vom Anschuss. Sie haben die erwartete Zone verlassen.`;
      pirschzeichen_erwartung = 'Erweitern Sie den Suchradius oder kehren Sie zurück';
    }

    return {
      aktueller_radius,
      empfohlene_richtung: nachsuche.fluchtrichtung,
      pirschzeichen_erwartung,
      status_nachricht,
    };
  }

  // ============================================================================
  // ABFRAGEN
  // ============================================================================

  /**
   * Holt Nachsuche by ID
   */
  async getNachsucheById(id: string): Promise<NachsucheTracking | null> {
    const row = await this.db.getFirstAsync<any>(
      `SELECT * FROM nachsuche_tracking WHERE id = ?`,
      [id]
    );

    if (!row) return null;

    return this.mapRowToNachsuche(row);
  }

  /**
   * Holt alle Nachsuchen für Shot Analysis
   */
  async getNachsuchenByShotAnalysis(shot_analysis_id: string): Promise<NachsucheTracking[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM nachsuche_tracking WHERE shot_analysis_id = ? ORDER BY created_at DESC`,
      [shot_analysis_id]
    );

    return rows.map((row) => this.mapRowToNachsuche(row));
  }

  /**
   * Holt alle laufenden Nachsuchen
   */
  async getAktiveNachsuchen(user_id: string): Promise<NachsucheTracking[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM nachsuche_tracking 
       WHERE user_id = ? AND status IN ('Geplant', 'Laufend')
       ORDER BY start_zeitpunkt DESC`,
      [user_id]
    );

    return rows.map((row) => this.mapRowToNachsuche(row));
  }

  /**
   * Maps DB row to NachsucheTracking object
   */
  private mapRowToNachsuche(row: any): NachsucheTracking {
    const tracking_punkte = row.tracking_punkte ? JSON.parse(row.tracking_punkte) : [];
    const gefundene_zeichen = row.gefundene_zeichen ? JSON.parse(row.gefundene_zeichen) : [];
    const fotos = row.fotos ? JSON.parse(row.fotos) : [];

    return {
      id: row.id,
      shot_analysis_id: row.shot_analysis_id,
      status: row.status,
      empfohlene_wartezeit: row.empfohlene_wartezeit,
      tatsächliche_wartezeit: row.tatsächliche_wartezeit,
      empfohlene_strategie: row.empfohlene_strategie,
      hund_empfohlen: Boolean(row.hund_empfohlen),
      hund_typ: row.hund_typ,
      hund_eingesetzt: Boolean(row.hund_eingesetzt),
      hund_art: row.hund_art,
      hund_name: row.hund_name,
      hundeführer: row.hundeführer,
      start_zeitpunkt: new Date(row.start_zeitpunkt),
      ende_zeitpunkt: row.ende_zeitpunkt ? new Date(row.ende_zeitpunkt) : undefined,
      dauer_minuten: row.dauer_minuten,
      startpunkt: {
        latitude: row.startpunkt_lat,
        longitude: row.startpunkt_lng,
      },
      fluchtrichtung: row.fluchtrichtung,
      gesuchter_radius: row.gesuchter_radius,
      tracking_punkte,
      gefunden: Boolean(row.gefunden),
      fundort: row.fundort_lat
        ? { latitude: row.fundort_lat, longitude: row.fundort_lng }
        : undefined,
      entfernung_vom_anschuss: row.entfernung_vom_anschuss,
      zustand: row.zustand,
      gefundene_zeichen,
      erfolgreich: Boolean(row.erfolgreich),
      wild_geborgen: Boolean(row.wild_geborgen),
      abbruch_grund: row.abbruch_grund,
      fotos,
      notizen: row.notizen,
      jagdgenossenschaft_informiert: Boolean(row.jagdgenossenschaft_informiert),
      nachbarrevier_informiert: Boolean(row.nachbarrevier_informiert),
      meldung_behörde: Boolean(row.meldung_behörde),
    };
  }

  // ============================================================================
  // HELPER
  // ============================================================================

  /**
   * Berechnet Entfernung zwischen zwei GPS-Punkten (Haversine)
   */
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371000; // Earth radius in meters
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export default new TrackingAssistantService();
