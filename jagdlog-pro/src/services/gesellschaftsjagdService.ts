/**
 * GESELLSCHAFTSJAGD SERVICE
 * Phase 6: Group Hunting Management
 * HNTR LEGEND Pro
 */

import { SQLiteDatabase } from 'expo-sqlite';
import { 
  Gesellschaftsjagd, 
  Teilnehmer, 
  JagdStandort,
  StandortZuweisung,
  Treiben,
  LiveEvent,
  StreckenAbschuss,
  JagdProtokoll,
  Notfall
} from '../types/gesellschaftsjagd';
import { GPSKoordinaten } from '../types/common';

export class GesellschaftsjagdService {
  constructor(private db: SQLiteDatabase) {}
  
  // ============================================================================
  // JAGD MANAGEMENT
  // ============================================================================
  
  /**
   * Neue Gesellschaftsjagd erstellen
   */
  async createJagd(jagd: Omit<Gesellschaftsjagd, 'id' | 'teilnehmer' | 'standorte' | 'standortZuweisungen' | 'treiben' | 'treiber' | 'strecke' | 'erstelltAm' | 'aktualisiertAm'>): Promise<Gesellschaftsjagd> {
    const id = this.generateId('gjagd');
    
    await this.db.runAsync(
      `INSERT INTO gesellschaftsjagden (
        id, revier_id, name, typ, datum, zeitplan,
        jagdleiter_id, max_teilnehmer, anmeldeschluss,
        sicherheit, regeln, status, erstellt_von
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        jagd.revierId,
        jagd.name,
        jagd.typ,
        jagd.datum.toISOString(),
        JSON.stringify(jagd.zeitplan),
        jagd.jagdleiter,
        jagd.maxTeilnehmer,
        jagd.anmeldeschluss?.toISOString() || null,
        JSON.stringify(jagd.sicherheit),
        JSON.stringify(jagd.regeln),
        jagd.status,
        jagd.erstelltVon
      ]
    );
    
    return this.getJagd(id) as Promise<Gesellschaftsjagd>;
  }
  
  /**
   * Jagd laden mit allen Details
   */
  async getJagd(id: string): Promise<Gesellschaftsjagd | null> {
    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM gesellschaftsjagden WHERE id = ?',
      [id]
    );
    
    if (result.length === 0) return null;
    
    const row = result[0];
    const teilnehmer = await this.getTeilnehmer(id);
    const standorte = await this.getStandorte(id);
    const standortZuweisungen = await this.getStandortZuweisungen(id);
    const treiben = await this.getTreiben(id);
    
    return {
      id: row.id,
      revierId: row.revier_id,
      name: row.name,
      typ: row.typ,
      datum: new Date(row.datum),
      zeitplan: JSON.parse(row.zeitplan),
      jagdleiter: row.jagdleiter_id,
      teilnehmer,
      maxTeilnehmer: row.max_teilnehmer,
      anmeldeschluss: row.anmeldeschluss ? new Date(row.anmeldeschluss) : undefined,
      standorte,
      standortZuweisungen,
      treiben,
      treiber: [], // Loaded from treiben
      sicherheit: JSON.parse(row.sicherheit),
      regeln: JSON.parse(row.regeln),
      strecke: {
        jagdId: id,
        abschuesse: await this.getStreckenAbschuesse(id),
        zusammenfassung: await this.getStreckenzusammenfassung(id),
        streckeFotos: [],
        verwertung: []
      },
      status: row.status,
      erstelltVon: row.erstellt_von,
      erstelltAm: new Date(row.erstellt_am),
      aktualisiertAm: new Date(row.aktualisiert_am)
    };
  }
  
  /**
   * Alle Jagden für ein Revier
   */
  async getJagdenForRevier(revierId: string, status?: Gesellschaftsjagd['status']): Promise<Gesellschaftsjagd[]> {
    const query = status
      ? 'SELECT * FROM gesellschaftsjagden WHERE revier_id = ? AND status = ? ORDER BY datum DESC'
      : 'SELECT * FROM gesellschaftsjagden WHERE revier_id = ? ORDER BY datum DESC';
    
    const params = status ? [revierId, status] : [revierId];
    const results = await this.db.getAllAsync<any>(query, params);
    
    return Promise.all(results.map(r => this.getJagd(r.id) as Promise<Gesellschaftsjagd>));
  }
  
  /**
   * Alle Jagden für einen User (als Jagdleiter oder Teilnehmer)
   */
  async getJagdenForUser(userId: string): Promise<Gesellschaftsjagd[]> {
    const results = await this.db.getAllAsync<any>(
      `SELECT DISTINCT g.*
       FROM gesellschaftsjagden g
       LEFT JOIN jagd_teilnehmer t ON t.jagd_id = g.id
       WHERE g.jagdleiter_id = ? OR t.user_id = ?
       ORDER BY g.datum DESC`,
      [userId, userId]
    );
    
    return Promise.all(results.map(r => this.getJagd(r.id) as Promise<Gesellschaftsjagd>));
  }
  
  /**
   * Jagd aktualisieren
   */
  async updateJagd(id: string, updates: Partial<Gesellschaftsjagd>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.typ) {
      fields.push('typ = ?');
      values.push(updates.typ);
    }
    if (updates.datum) {
      fields.push('datum = ?');
      values.push(updates.datum.toISOString());
    }
    if (updates.zeitplan) {
      fields.push('zeitplan = ?');
      values.push(JSON.stringify(updates.zeitplan));
    }
    if (updates.maxTeilnehmer) {
      fields.push('max_teilnehmer = ?');
      values.push(updates.maxTeilnehmer);
    }
    if (updates.sicherheit) {
      fields.push('sicherheit = ?');
      values.push(JSON.stringify(updates.sicherheit));
    }
    if (updates.regeln) {
      fields.push('regeln = ?');
      values.push(JSON.stringify(updates.regeln));
    }
    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    
    if (fields.length === 0) return;
    
    values.push(id);
    
    await this.db.runAsync(
      `UPDATE gesellschaftsjagden SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
  
  /**
   * Jagd löschen
   */
  async deleteJagd(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM gesellschaftsjagden WHERE id = ?', [id]);
  }
  
  // ============================================================================
  // TEILNEHMER MANAGEMENT
  // ============================================================================
  
  /**
   * Teilnehmer hinzufügen
   */
  async addTeilnehmer(teilnehmer: Omit<Teilnehmer, 'id' | 'abschuesse'>): Promise<Teilnehmer> {
    const id = this.generateId('jt');
    
    await this.db.runAsync(
      `INSERT INTO jagd_teilnehmer (
        id, jagd_id, user_id, name, telefon, email,
        rolle, ausruestung, erfahrung, anmeldung
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        teilnehmer.jagdId,
        teilnehmer.userId || null,
        teilnehmer.name,
        teilnehmer.telefon,
        teilnehmer.email || null,
        teilnehmer.rolle,
        JSON.stringify(teilnehmer.ausruestung),
        JSON.stringify(teilnehmer.erfahrung),
        JSON.stringify(teilnehmer.anmeldung)
      ]
    );
    
    return { ...teilnehmer, id, abschuesse: [] };
  }
  
  /**
   * Alle Teilnehmer einer Jagd
   */
  async getTeilnehmer(jagdId: string): Promise<Teilnehmer[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM jagd_teilnehmer WHERE jagd_id = ? ORDER BY rolle, name',
      [jagdId]
    );
    
    return results.map(r => ({
      id: r.id,
      jagdId: r.jagd_id,
      userId: r.user_id,
      name: r.name,
      telefon: r.telefon,
      email: r.email,
      rolle: r.rolle,
      ausruestung: JSON.parse(r.ausruestung),
      erfahrung: JSON.parse(r.erfahrung),
      anmeldung: JSON.parse(r.anmeldung),
      zugewiesenerStandort: r.zugewiesener_standort_id,
      liveStatus: r.live_status ? JSON.parse(r.live_status) : undefined,
      abschuesse: [] // Loaded separately if needed
    }));
  }
  
  /**
   * Teilnehmer-Status aktualisieren
   */
  async updateTeilnehmerStatus(
    teilnehmerId: string,
    status: Teilnehmer['anmeldung']['status'],
    kommentar?: string
  ): Promise<void> {
    const result = await this.db.getAllAsync<any>(
      'SELECT anmeldung FROM jagd_teilnehmer WHERE id = ?',
      [teilnehmerId]
    );
    
    if (result.length === 0) throw new Error('Teilnehmer not found');
    
    const anmeldung = JSON.parse(result[0].anmeldung);
    anmeldung.status = status;
    anmeldung.angemeldetAm = new Date().toISOString();
    if (kommentar) anmeldung.kommentar = kommentar;
    
    await this.db.runAsync(
      'UPDATE jagd_teilnehmer SET anmeldung = ? WHERE id = ?',
      [JSON.stringify(anmeldung), teilnehmerId]
    );
  }
  
  /**
   * Teilnehmer Live-Status aktualisieren
   */
  async updateTeilnehmerLiveStatus(
    teilnehmerId: string,
    liveStatus: Teilnehmer['liveStatus']
  ): Promise<void> {
    await this.db.runAsync(
      'UPDATE jagd_teilnehmer SET live_status = ? WHERE id = ?',
      [JSON.stringify(liveStatus), teilnehmerId]
    );
  }
  
  /**
   * Teilnehmer entfernen
   */
  async removeTeilnehmer(teilnehmerId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM jagd_teilnehmer WHERE id = ?', [teilnehmerId]);
  }
  
  // ============================================================================
  // STANDORT MANAGEMENT
  // ============================================================================
  
  /**
   * Standort erstellen
   */
  async createStandort(standort: Omit<JagdStandort, 'id' | 'zugewiesenePersonen'>): Promise<JagdStandort> {
    const id = this.generateId('js');
    
    await this.db.runAsync(
      `INSERT INTO jagd_standorte (
        id, jagd_id, nummer, name, typ,
        gps_latitude, gps_longitude, hoehe, poi_id,
        beschreibung, zugang, orientierung,
        sicherheit, eigenschaften, status, historie
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        standort.jagdId,
        standort.nummer,
        standort.name || null,
        standort.typ,
        standort.gps.latitude,
        standort.gps.longitude,
        standort.hoehe || null,
        standort.poiId || null,
        standort.beschreibung || null,
        standort.zugang,
        standort.orientierung,
        JSON.stringify(standort.sicherheit),
        JSON.stringify(standort.eigenschaften),
        standort.status,
        standort.historie ? JSON.stringify(standort.historie) : null
      ]
    );
    
    return { ...standort, id, zugewiesenePersonen: [] };
  }
  
  /**
   * Alle Standorte einer Jagd
   */
  async getStandorte(jagdId: string): Promise<JagdStandort[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM jagd_standorte WHERE jagd_id = ? ORDER BY nummer',
      [jagdId]
    );
    
    return results.map(r => ({
      id: r.id,
      jagdId: r.jagd_id,
      nummer: r.nummer,
      name: r.name,
      typ: r.typ,
      gps: {
        latitude: r.gps_latitude,
        longitude: r.gps_longitude
      },
      hoehe: r.hoehe,
      poiId: r.poi_id,
      beschreibung: r.beschreibung,
      zugang: r.zugang,
      orientierung: r.orientierung,
      sicherheit: JSON.parse(r.sicherheit),
      eigenschaften: JSON.parse(r.eigenschaften),
      status: r.status,
      zugewiesenePersonen: [], // Loaded from zuweisungen
      historie: r.historie ? JSON.parse(r.historie) : undefined
    }));
  }
  
  /**
   * Standort einer Jagd zuweisen
   */
  async assignStandort(
    jagdId: string,
    standortId: string,
    teilnehmerId: string,
    zugewiesenVon: string,
    prioritaet: number = 1,
    notizen?: string
  ): Promise<StandortZuweisung> {
    const id = this.generateId('sz');
    
    await this.db.runAsync(
      `INSERT INTO standort_zuweisungen (
        id, jagd_id, standort_id, teilnehmer_id,
        zugewiesen_von, prioritaet, notizen
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, jagdId, standortId, teilnehmerId, zugewiesenVon, prioritaet, notizen || null]
    );
    
    // Update Teilnehmer
    await this.db.runAsync(
      'UPDATE jagd_teilnehmer SET zugewiesener_standort_id = ? WHERE id = ?',
      [standortId, teilnehmerId]
    );
    
    // Update Standort Status
    await this.db.runAsync(
      'UPDATE jagd_standorte SET status = ? WHERE id = ?',
      ['besetzt', standortId]
    );
    
    return {
      id,
      jagdId,
      standortId,
      teilnehmerId,
      zugewiesenVon,
      zugewiesenAm: new Date(),
      prioritaet,
      bestaetigt: false,
      notizen
    };
  }
  
  /**
   * Alle Standort-Zuweisungen einer Jagd
   */
  async getStandortZuweisungen(jagdId: string): Promise<StandortZuweisung[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM standort_zuweisungen WHERE jagd_id = ?',
      [jagdId]
    );
    
    return results.map(r => ({
      id: r.id,
      jagdId: r.jagd_id,
      standortId: r.standort_id,
      teilnehmerId: r.teilnehmer_id,
      zugewiesenVon: r.zugewiesen_von,
      zugewiesenAm: new Date(r.zugewiesen_am),
      prioritaet: r.prioritaet,
      bestaetigt: Boolean(r.bestaetigt),
      bestaeligtAm: r.bestaetigt_am ? new Date(r.bestaetigt_am) : undefined,
      notizen: r.notizen
    }));
  }
  
  /**
   * Standort-Zuweisung bestätigen
   */
  async confirmStandortZuweisung(zuweisungId: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE standort_zuweisungen SET bestaetigt = 1, bestaetigt_am = CURRENT_TIMESTAMP WHERE id = ?',
      [zuweisungId]
    );
  }
  
  /**
   * Standort-Zuweisung aufheben
   */
  async unassignStandort(zuweisungId: string): Promise<void> {
    const result = await this.db.getAllAsync<any>(
      'SELECT standort_id, teilnehmer_id FROM standort_zuweisungen WHERE id = ?',
      [zuweisungId]
    );
    
    if (result.length === 0) return;
    
    const { standort_id, teilnehmer_id } = result[0];
    
    // Delete Zuweisung
    await this.db.runAsync('DELETE FROM standort_zuweisungen WHERE id = ?', [zuweisungId]);
    
    // Update Teilnehmer
    await this.db.runAsync(
      'UPDATE jagd_teilnehmer SET zugewiesener_standort_id = NULL WHERE id = ?',
      [teilnehmer_id]
    );
    
    // Check if Standort still has assignments
    const remaining = await this.db.getAllAsync<any>(
      'SELECT COUNT(*) as count FROM standort_zuweisungen WHERE standort_id = ?',
      [standort_id]
    );
    
    if (remaining[0].count === 0) {
      await this.db.runAsync(
        'UPDATE jagd_standorte SET status = ? WHERE id = ?',
        ['verfuegbar', standort_id]
      );
    }
  }
  
  // ============================================================================
  // TREIBEN MANAGEMENT
  // ============================================================================
  
  /**
   * Treiben erstellen
   */
  async createTreiben(treiben: Omit<Treiben, 'id'>): Promise<Treiben> {
    const id = this.generateId('jtr');
    
    await this.db.runAsync(
      `INSERT INTO jagd_treiben (
        id, jagd_id, nummer, name, start, geschaetzte_dauer,
        treibgebiet, richtung, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        treiben.jagdId,
        treiben.nummer,
        treiben.name,
        treiben.start.toISOString(),
        treiben.geschaetzteDauer,
        JSON.stringify(treiben.treibgebiet),
        treiben.richtung,
        treiben.status
      ]
    );
    
    // Add Treiber
    for (const treiberId of treiben.treiber) {
      await this.db.runAsync(
        'INSERT INTO treiben_treiber (treiben_id, teilnehmer_id, position, abstand, hundeeinsatz) VALUES (?, ?, ?, ?, ?)',
        [id, treiberId, 'mitte', 50, 0]
      );
    }
    
    // Add aktive Standorte
    for (const standortId of treiben.aktivStandorte) {
      await this.db.runAsync(
        'INSERT INTO treiben_standorte (treiben_id, standort_id) VALUES (?, ?)',
        [id, standortId]
      );
    }
    
    return { ...treiben, id };
  }
  
  /**
   * Alle Treiben einer Jagd
   */
  async getTreiben(jagdId: string): Promise<Treiben[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM jagd_treiben WHERE jagd_id = ? ORDER BY nummer',
      [jagdId]
    );
    
    const treiben: Treiben[] = [];
    
    for (const r of results) {
      const treiber = await this.db.getAllAsync<any>(
        'SELECT teilnehmer_id FROM treiben_treiber WHERE treiben_id = ?',
        [r.id]
      );
      
      const standorte = await this.db.getAllAsync<any>(
        'SELECT standort_id FROM treiben_standorte WHERE treiben_id = ?',
        [r.id]
      );
      
      treiben.push({
        id: r.id,
        jagdId: r.jagd_id,
        nummer: r.nummer,
        name: r.name,
        start: new Date(r.start),
        geschaetzteDauer: r.geschaetzte_dauer,
        ende: r.ende ? new Date(r.ende) : undefined,
        treibgebiet: JSON.parse(r.treibgebiet),
        richtung: r.richtung,
        treiber: treiber.map(t => t.teilnehmer_id),
        hundefuehrer: [],
        aktivStandorte: standorte.map(s => s.standort_id),
        status: r.status,
        ergebnis: r.ergebnis ? JSON.parse(r.ergebnis) : undefined
      });
    }
    
    return treiben;
  }
  
  /**
   * Treiben starten
   */
  async startTreiben(treibenId: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE jagd_treiben SET status = ? WHERE id = ?',
      ['laufend', treibenId]
    );
    
    // Create Live Event
    const treiben = await this.db.getAllAsync<any>(
      'SELECT jagd_id, nummer FROM jagd_treiben WHERE id = ?',
      [treibenId]
    );
    
    if (treiben.length > 0) {
      await this.createLiveEvent({
        id: this.generateId('jle'),
        jagdId: treiben[0].jagd_id,
        typ: 'treiben_start',
        zeitpunkt: new Date(),
        von: 'system',
        daten: { treibenNummer: treiben[0].nummer },
        sichtbarFuer: 'alle'
      });
    }
  }
  
  /**
   * Treiben beenden
   */
  async endTreiben(treibenId: string, ergebnis: Treiben['ergebnis']): Promise<void> {
    await this.db.runAsync(
      'UPDATE jagd_treiben SET status = ?, ende = CURRENT_TIMESTAMP, ergebnis = ? WHERE id = ?',
      ['abgeschlossen', JSON.stringify(ergebnis), treibenId]
    );
    
    // Create Live Event
    const treiben = await this.db.getAllAsync<any>(
      'SELECT jagd_id, nummer FROM jagd_treiben WHERE id = ?',
      [treibenId]
    );
    
    if (treiben.length > 0) {
      await this.createLiveEvent({
        id: this.generateId('jle'),
        jagdId: treiben[0].jagd_id,
        typ: 'treiben_ende',
        zeitpunkt: new Date(),
        von: 'system',
        daten: { treibenNummer: treiben[0].nummer, ergebnis },
        sichtbarFuer: 'alle'
      });
    }
  }
  
  // ============================================================================
  // LIVE EVENTS
  // ============================================================================
  
  /**
   * Live Event erstellen
   */
  async createLiveEvent(event: LiveEvent): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO jagd_live_events (
        id, jagd_id, typ, zeitpunkt, von, daten, sichtbar_fuer
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id,
        event.jagdId,
        event.typ,
        event.zeitpunkt.toISOString(),
        event.von,
        JSON.stringify(event.daten),
        event.sichtbarFuer
      ]
    );
  }
  
  /**
   * Live Events einer Jagd abrufen
   */
  async getLiveEvents(jagdId: string, limit: number = 50): Promise<LiveEvent[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM jagd_live_events WHERE jagd_id = ? ORDER BY zeitpunkt DESC LIMIT ?',
      [jagdId, limit]
    );
    
    return results.map(r => ({
      id: r.id,
      jagdId: r.jagd_id,
      typ: r.typ,
      zeitpunkt: new Date(r.zeitpunkt),
      von: r.von,
      daten: JSON.parse(r.daten),
      sichtbarFuer: r.sichtbar_fuer
    }));
  }
  
  // ============================================================================
  // STRECKE
  // ============================================================================
  
  /**
   * Abschuss erfassen
   */
  async createAbschuss(abschuss: Omit<StreckenAbschuss, 'id' | 'erfasstAm'>): Promise<StreckenAbschuss> {
    const id = this.generateId('sa');
    
    await this.db.runAsync(
      `INSERT INTO strecken_abschuesse (
        id, jagd_id, schuetze_id, standort_id, treiben_nummer,
        wildart, geschlecht, altersklasse, anzahl,
        zeitpunkt, gps_latitude, gps_longitude,
        details, verwertung, wildmarke, erfasst_von
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        abschuss.jagdId,
        abschuss.schuetzeId,
        abschuss.standortId,
        abschuss.treibenNummer || null,
        abschuss.wildart,
        abschuss.geschlecht,
        abschuss.altersklasse,
        abschuss.anzahl,
        abschuss.zeitpunkt.toISOString(),
        abschuss.gps.latitude,
        abschuss.gps.longitude,
        JSON.stringify(abschuss.details),
        JSON.stringify(abschuss.verwertung),
        abschuss.wildmarke ? JSON.stringify(abschuss.wildmarke) : null,
        abschuss.erfasstVon
      ]
    );
    
    // Create Live Event
    await this.createLiveEvent({
      id: this.generateId('jle'),
      jagdId: abschuss.jagdId,
      typ: 'abschuss',
      zeitpunkt: new Date(),
      von: abschuss.schuetzeId,
      daten: {
        wildart: abschuss.wildart,
        geschlecht: abschuss.geschlecht,
        standortId: abschuss.standortId,
        gps: abschuss.gps,
        nachsuche: abschuss.details.schussabgabe.nachsuche
      },
      sichtbarFuer: 'alle'
    });
    
    return { ...abschuss, id, erfasstAm: new Date(), fotos: [] };
  }
  
  /**
   * Alle Abschüsse einer Jagd
   */
  async getStreckenAbschuesse(jagdId: string): Promise<StreckenAbschuss[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM strecken_abschuesse WHERE jagd_id = ? ORDER BY zeitpunkt',
      [jagdId]
    );
    
    return results.map(r => ({
      id: r.id,
      jagdId: r.jagd_id,
      schuetzeId: r.schuetze_id,
      standortId: r.standort_id,
      treibenNummer: r.treiben_nummer,
      wildart: r.wildart,
      geschlecht: r.geschlecht,
      altersklasse: r.altersklasse,
      anzahl: r.anzahl,
      zeitpunkt: new Date(r.zeitpunkt),
      gps: {
        latitude: r.gps_latitude,
        longitude: r.gps_longitude
      },
      details: JSON.parse(r.details),
      verwertung: JSON.parse(r.verwertung),
      fotos: [],
      wildmarke: r.wildmarke ? JSON.parse(r.wildmarke) : undefined,
      erfasstVon: r.erfasst_von,
      erfasstAm: new Date(r.erfasst_am)
    }));
  }
  
  /**
   * Strecken-Zusammenfassung
   */
  async getStreckenzusammenfassung(jagdId: string): Promise<any> {
    const abschuesse = await this.getStreckenAbschuesse(jagdId);
    
    const zusammenfassung = {
      gesamt: abschuesse.length,
      nachWildart: {} as Record<string, number>,
      nachGeschlecht: {} as Record<string, number>,
      nachSchuetze: {} as Record<string, number>
    };
    
    for (const a of abschuesse) {
      // Nach Wildart
      zusammenfassung.nachWildart[a.wildart] = (zusammenfassung.nachWildart[a.wildart] || 0) + a.anzahl;
      
      // Nach Geschlecht
      zusammenfassung.nachGeschlecht[a.geschlecht] = (zusammenfassung.nachGeschlecht[a.geschlecht] || 0) + a.anzahl;
      
      // Nach Schütze
      zusammenfassung.nachSchuetze[a.schuetzeId] = (zusammenfassung.nachSchuetze[a.schuetzeId] || 0) + a.anzahl;
    }
    
    return zusammenfassung;
  }
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  private generateId(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
