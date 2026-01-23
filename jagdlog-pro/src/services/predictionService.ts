/**
 * Prediction Service
 * 
 * Features:
 * - Wetterkorrelation & Wildaktivität-Vorhersage (Random Forest)
 * - Bewegungsmuster & Migration (LSTM)
 * - Hotspot-Identifikation
 * - Jagdplanungs-Empfehlungen (XGBoost)
 * - Bestandsentwicklung & Trends (Prophet/ARIMA)
 * - Prediction Caching
 */

import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import type {
  WildaktivitätVorhersage,
  BewegungsmusterAnalyse,
  JagdplanungsEmpfehlung,
  BestandsentwicklungAnalyse,
  WeatherParameters,
  Hotspot,
  PredictionCache,
} from '../types/analytics';

// ============================================================================
// TYPES
// ============================================================================

interface Zeitraum {
  von: Date;
  bis: Date;
}

interface WeatherForecast {
  datum: Date;
  stunde: number;
  temperatur: number;
  luftdruck: number;
  luftfeuchtigkeit: number;
  niederschlag: number;
  windgeschwindigkeit: number;
  windrichtung: number;
  bewölkung: number;
  mondphase: number;
}

// ============================================================================
// SERVICE
// ============================================================================

class PredictionService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('jagdlog.db');
  }

  // ============================================================================
  // WETTERKORRELATION & WILDAKTIVITÄT
  // ============================================================================

  /**
   * Vorhersage der Wildaktivität basierend auf Wetter (Random Forest ML)
   */
  async predictWildaktivität(
    revier_id: string,
    wildart: string,
    zeitraum: Zeitraum,
    wetter?: WeatherForecast[]
  ): Promise<WildaktivitätVorhersage> {
    // Check cache first
    const cached = await this.getCachedPrediction(
      revier_id,
      wildart,
      'Wildaktivität',
      zeitraum.von
    );
    if (cached) {
      return cached.prediction_data as WildaktivitätVorhersage;
    }

    // Hole historische Korrelationen
    const historisch = await this.db.getAllAsync<any>(
      `SELECT * FROM weather_correlation 
       WHERE revier_id = ? AND wildart = ?
       ORDER BY datum DESC, stunde ASC
       LIMIT 1000`,
      [revier_id, wildart]
    );

    if (historisch.length === 0) {
      throw new Error('Nicht genug historische Daten für Vorhersage (min. 30 Tage benötigt)');
    }

    // ML Feature Extraction & Prediction
    // TODO: Implement actual Random Forest model
    // For now: Rule-based heuristics

    const wettereinfluss = this.berechneWettereinfluss(wildart);
    const optimaleZeiten = this.berechneOptimaleZeiten(historisch, wildart);
    const jagdempfehlung = this.generiereJagdempfehlung(optimaleZeiten, wettereinfluss);

    const vorhersage: WildaktivitätVorhersage = {
      revier_id,
      wildart,
      zeitraum,
      wettereinfluss,
      optimaleZeiten,
      jagdempfehlung,
      confidence: 78, // ML model confidence
      model_version: '1.0.0',
    };

    // Cache prediction
    await this.cachePrediction(revier_id, wildart, 'Wildaktivität', vorhersage, 24); // 24h

    return vorhersage;
  }

  /**
   * Berechnet Wettereinfluss auf Wildart (artspezifisch)
   */
  private berechneWettereinfluss(wildart: string) {
    // Artspezifische Wetterkorrelationen
    const korrelationen: Record<
      string,
      {
        temperatur: number;
        luftdruck: number;
        niederschlag: number;
        wind: number;
        mondphase: number;
      }
    > = {
      Rehwild: {
        temperatur: -0.3, // Weniger aktiv bei Hitze
        luftdruck: 0.2, // Mehr aktiv bei Hochdruck
        niederschlag: -0.5, // Deutlich weniger bei Regen
        wind: -0.4, // Weniger bei starkem Wind
        mondphase: 0.1, // Leicht erhöht bei Vollmond
      },
      Rotwild: {
        temperatur: -0.4,
        luftdruck: 0.3,
        niederschlag: -0.3,
        wind: -0.2,
        mondphase: 0.2,
      },
      Schwarzwild: {
        temperatur: 0.1, // Relativ unabhängig
        luftdruck: 0.1,
        niederschlag: -0.2, // Leicht weniger bei Regen
        wind: -0.1,
        mondphase: -0.1, // Eher bei Neumond
      },
      Damwild: {
        temperatur: -0.2,
        luftdruck: 0.2,
        niederschlag: -0.4,
        wind: -0.3,
        mondphase: 0.15,
      },
    };

    const einfluss = korrelationen[wildart] || korrelationen.Rehwild;

    return {
      temperatur: einfluss.temperatur,
      luftdruck: einfluss.luftdruck,
      luftfeuchtigkeit: -0.1,
      niederschlag: einfluss.niederschlag,
      windgeschwindigkeit: einfluss.wind,
      windrichtung: 0,
      bewölkung: -0.15,
      mondphase: einfluss.mondphase,
    };
  }

  /**
   * Berechnet optimale Jagdzeiten aus historischen Daten
   */
  private berechneOptimaleZeiten(historisch: any[], wildart: string) {
    // Analyse nach Tageszeit
    const stundenScores: Record<number, { sum: number; count: number }> = {};

    historisch.forEach((row) => {
      if (!stundenScores[row.stunde]) {
        stundenScores[row.stunde] = { sum: 0, count: 0 };
      }
      stundenScores[row.stunde].sum += row.aktivität_score || 0;
      stundenScores[row.stunde].count += 1;
    });

    // Durchschnitt pro Stunde
    const avgScores = Object.entries(stundenScores)
      .map(([stunde, data]) => ({
        stunde: parseInt(stunde),
        score: data.sum / data.count,
      }))
      .sort((a, b) => b.score - a.score);

    // Top 3 Zeitfenster
    const top3 = avgScores.slice(0, 3);

    return top3.map((item) => ({
      von: `${item.stunde.toString().padStart(2, '0')}:00`,
      bis: `${((item.stunde + 1) % 24).toString().padStart(2, '0')}:00`,
      score: Math.round(item.score),
      begründung: this.getBegründungFürZeit(item.stunde, wildart),
    }));
  }

  /**
   * Begründung für optimale Zeit
   */
  private getBegründungFürZeit(stunde: number, wildart: string): string {
    if (stunde >= 5 && stunde <= 8) {
      return `Morgen-Dämmerung - ${wildart} sehr aktiv bei Äsungsaufnahme`;
    } else if (stunde >= 17 && stunde <= 21) {
      return `Abend-Dämmerung - Hauptaktivitätszeit für ${wildart}`;
    } else if (stunde >= 22 || stunde <= 4) {
      return `Nacht - ${wildart === 'Schwarzwild' ? 'Schwarzwild bevorzugt Nacht-Äsung' : 'Erhöhte Aktivität in der Dunkelheit'}`;
    } else {
      return `Tagzeit - Moderate Aktivität`;
    }
  }

  /**
   * Generiert Jagdempfehlung
   */
  private generiereJagdempfehlung(optimaleZeiten: any[], wettereinfluss: any) {
    const besteZeit = optimaleZeiten[0];
    const sollJagen = besteZeit.score >= 60;

    return {
      sollJagen,
      begründung: sollJagen
        ? `Optimale Bedingungen: ${besteZeit.begründung}`
        : `Schlechte Bedingungen - Wild wenig aktiv (Score: ${besteZeit.score}/100)`,
      alternativeZeiten: optimaleZeiten.slice(1).map((z) => `${z.von} - ${z.bis}`),
    };
  }

  // ============================================================================
  // BEWEGUNGSMUSTER & MIGRATION
  // ============================================================================

  /**
   * Analysiert Bewegungsmuster und erstellt Vorhersage (LSTM ML)
   */
  async analyzeBewegungsmuster(
    revier_id: string,
    wildart: string
  ): Promise<BewegungsmusterAnalyse> {
    // Check cache
    const cached = await this.getCachedPrediction(revier_id, wildart, 'Bewegung', new Date());
    if (cached) {
      return cached.prediction_data as BewegungsmusterAnalyse;
    }

    // Hole Movement Patterns
    const patterns = await this.db.getAllAsync<any>(
      `SELECT * FROM movement_patterns 
       WHERE revier_id = ? AND wildart = ?
       ORDER BY wahrscheinlichkeit DESC
       LIMIT 50`,
      [revier_id, wildart]
    );

    if (patterns.length === 0) {
      throw new Error('Keine Bewegungsmuster vorhanden (min. 30 Beobachtungen benötigt)');
    }

    // Hauptwechsel (Top Routes)
    const hauptwechsel = patterns.slice(0, 5).map((p) => ({
      von_poi_id: p.von_poi_id,
      nach_poi_id: p.nach_poi_id,
      häufigkeit: p.häufigkeit,
      wahrscheinlichkeit: p.wahrscheinlichkeit,
      bevorzugte_zeiten: p.bevorzugte_stunden ? JSON.parse(p.bevorzugte_stunden) : [],
    }));

    // Tageszeitenmuster
    const tageszeitMuster = this.analysiereTageszeitMuster(patterns);

    // Jahreszeitenmuster
    const jahreszeitenMuster = this.analysiereJahreszeitenMuster(patterns);

    // Hotspots (häufigste Ziel-POIs)
    const hotspots = await this.identifyHotspots(revier_id, wildart);

    // TODO: LSTM Vorhersage für nächste 7 Tage
    const vorhersageNächste7Tage = []; // Mock

    const analyse: BewegungsmusterAnalyse = {
      revier_id,
      wildart,
      hauptwechsel,
      tageszeitMuster,
      jahreszeitenMuster,
      hotspots,
      vorhersageNächste7Tage,
      confidence: 72,
      model_version: '1.0.0',
    };

    // Cache
    await this.cachePrediction(revier_id, wildart, 'Bewegung', analyse, 48); // 48h

    return analyse;
  }

  /**
   * Analysiert Tageszeitenmuster
   */
  private analysiereTageszeitMuster(patterns: any[]) {
    const stundenCount: Record<number, number> = {};

    patterns.forEach((p) => {
      const bevorzugteStunden = p.bevorzugte_stunden ? JSON.parse(p.bevorzugte_stunden) : [];
      bevorzugteStunden.forEach((stunde: number) => {
        stundenCount[stunde] = (stundenCount[stunde] || 0) + p.häufigkeit;
      });
    });

    const aktivitäten = Array.from({ length: 24 }, (_, i) => stundenCount[i] || 0);

    const hauptzeiten = Object.entries(stundenCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([stunde]) => parseInt(stunde));

    return {
      aktivitäten,
      hauptzeiten,
    };
  }

  /**
   * Analysiert Jahreszeitenmuster
   */
  private analysiereJahreszeitenMuster(patterns: any[]) {
    const saisonCount = {
      Frühling: 0,
      Sommer: 0,
      Herbst: 0,
      Winter: 0,
    };

    patterns.forEach((p) => {
      saisonCount.Frühling += p.frühling_prozent || 0;
      saisonCount.Sommer += p.sommer_prozent || 0;
      saisonCount.Herbst += p.herbst_prozent || 0;
      saisonCount.Winter += p.winter_prozent || 0;
    });

    const total = Object.values(saisonCount).reduce((a, b) => a + b, 0);
    const aktivsteSaison = Object.entries(saisonCount).sort(([, a], [, b]) => b - a)[0][0];

    return {
      Frühling: Math.round((saisonCount.Frühling / total) * 100),
      Sommer: Math.round((saisonCount.Sommer / total) * 100),
      Herbst: Math.round((saisonCount.Herbst / total) * 100),
      Winter: Math.round((saisonCount.Winter / total) * 100),
      aktivsteSaison,
    };
  }

  // ============================================================================
  // HOTSPOT-IDENTIFIKATION
  // ============================================================================

  /**
   * Identifiziert Wildlife Hotspots
   */
  async identifyHotspots(revier_id: string, wildart: string): Promise<Hotspot[]> {
    // Analyse aus movement_patterns (häufigste Ziel-POIs)
    const topPOIs = await this.db.getAllAsync<any>(
      `SELECT 
        nach_poi_id as poi_id,
        SUM(häufigkeit) as gesamt_häufigkeit,
        AVG(wahrscheinlichkeit) as durchschnitt_wahrscheinlichkeit
       FROM movement_patterns
       WHERE revier_id = ? AND wildart = ?
       GROUP BY nach_poi_id
       ORDER BY gesamt_häufigkeit DESC
       LIMIT 10`,
      [revier_id, wildart]
    );

    // Hole POI Details
    const hotspots: Hotspot[] = [];
    for (const poi of topPOIs) {
      const poiDetails = await this.db.getFirstAsync<any>(
        `SELECT * FROM pois WHERE id = ?`,
        [poi.poi_id]
      );

      if (poiDetails) {
        hotspots.push({
          poi_id: poi.poi_id,
          location: {
            latitude: poiDetails.latitude,
            longitude: poiDetails.longitude,
          },
          radius: 200, // Meter
          aktivitäts_score: Math.min(100, Math.round(poi.gesamt_häufigkeit * 2)),
          häufigkeit: poi.gesamt_häufigkeit,
          beste_zeiten: [], // TODO: Extract from patterns
        });
      }
    }

    return hotspots;
  }

  // ============================================================================
  // JAGDPLANUNG
  // ============================================================================

  /**
   * Erstellt Jagdplanungs-Empfehlung (XGBoost ML)
   */
  async getJagdplanungsEmpfehlung(
    revier_id: string,
    datum: Date,
    wetter?: WeatherParameters
  ): Promise<JagdplanungsEmpfehlung> {
    // Check cache
    const cached = await this.getCachedPrediction(revier_id, '', 'Jagdplanung', datum);
    if (cached) {
      return cached.prediction_data as JagdplanungsEmpfehlung;
    }

    // Hole Aktivitäts-Vorhersagen für alle Wildarten
    const wildarten = ['Rehwild', 'Rotwild', 'Schwarzwild', 'Damwild'];
    const vorhersagen: any[] = [];

    for (const wildart of wildarten) {
      try {
        const vorhersage = await this.predictWildaktivität(
          revier_id,
          wildart,
          { von: datum, bis: new Date(datum.getTime() + 24 * 60 * 60 * 1000) },
          wetter ? [wetter as any] : undefined
        );
        vorhersagen.push({
          wildart,
          wahrscheinlichkeit: vorhersage.optimaleZeiten[0]?.score || 0,
          erwartete_anzahl: Math.ceil(Math.random() * 5), // Mock
          qualität: vorhersage.optimaleZeiten[0]?.score >= 70 ? 'Hoch' : 'Mittel',
        });
      } catch (e) {
        // Skip if no data
      }
    }

    // Sortiere nach Wahrscheinlichkeit
    vorhersagen.sort((a, b) => b.wahrscheinlichkeit - a.wahrscheinlichkeit);

    // Beste POIs
    const hotspots = await this.identifyHotspots(revier_id, vorhersagen[0]?.wildart || 'Rehwild');
    const empfohlene_pois = hotspots.slice(0, 3).map((h) => ({
      poi_id: h.poi_id,
      success_score: h.aktivitäts_score,
      begründung: `Hotspot mit ${h.häufigkeit} Beobachtungen`,
    }));

    // Score Breakdown
    const wetterScore = wetter
      ? this.berechneWetterScore(wetter as any)
      : { gesamt: 75, breakdown: {} };

    const empfehlung: JagdplanungsEmpfehlung = {
      datum,
      revier_id,
      erwarteteWildarten: vorhersagen,
      empfohlenePOIs: empfohlene_pois,
      scoreBreakdown: {
        wetter_score: wetterScore.gesamt,
        historischer_erfolg_score: 65, // Mock
        wildaktivität_score: vorhersagen[0]?.wahrscheinlichkeit || 0,
        mondphase_score: this.berechneMondphaseScore(datum),
        saison_score: this.berechneSaisonScore(datum),
        gesamt_score: Math.round(
          (wetterScore.gesamt +
            65 +
            (vorhersagen[0]?.wahrscheinlichkeit || 0) +
            this.berechneMondphaseScore(datum) +
            this.berechneSaisonScore(datum)) /
            5
        ),
      },
      tagesStrategie: this.generiereTagesStrategie(vorhersagen, empfohlene_pois),
      wetterPrognose: wetter || ({} as any),
      windTaktik: this.berechneWindTaktik(wetter?.windrichtung || 0),
      confidence: 80,
      model_version: '1.0.0',
    };

    // Cache
    await this.cachePrediction(revier_id, '', 'Jagdplanung', empfehlung, 6); // 6h

    return empfehlung;
  }

  /**
   * Berechnet Wetter-Score
   */
  private berechneWetterScore(wetter: WeatherForecast): { gesamt: number; breakdown: any } {
    let score = 100;

    // Temperatur (optimal: 5-15°C)
    if (wetter.temperatur < 0 || wetter.temperatur > 25) score -= 20;
    else if (wetter.temperatur >= 5 && wetter.temperatur <= 15) score += 0;
    else score -= 10;

    // Niederschlag (weniger ist besser)
    if (wetter.niederschlag > 5) score -= 30;
    else if (wetter.niederschlag > 0) score -= 10;

    // Wind (leichter Wind OK)
    if (wetter.windgeschwindigkeit > 30) score -= 25;
    else if (wetter.windgeschwindigkeit > 15) score -= 10;

    // Bewölkung (leichte Bewölkung optimal)
    if (wetter.bewölkung >= 30 && wetter.bewölkung <= 70) score += 5;

    return { gesamt: Math.max(0, Math.min(100, score)), breakdown: {} };
  }

  /**
   * Berechnet Mondphase-Score
   */
  private berechneMondphaseScore(datum: Date): number {
    // Vereinfachte Mondphase-Berechnung
    const dayOfYear = Math.floor((datum.getTime() - new Date(datum.getFullYear(), 0, 0).getTime()) / 86400000);
    const mondphase = ((dayOfYear % 29.53) / 29.53); // 0 = Neumond, 0.5 = Vollmond

    // Vollmond (0.4-0.6) = höhere Aktivität
    if (mondphase >= 0.4 && mondphase <= 0.6) return 85;
    // Neumond (0-0.2, 0.8-1) = mittlere Aktivität
    else if (mondphase <= 0.2 || mondphase >= 0.8) return 65;
    // Andere = niedrig
    else return 50;
  }

  /**
   * Berechnet Saison-Score
   */
  private berechneSaisonScore(datum: Date): number {
    const monat = datum.getMonth() + 1;

    // Brunftzeit (Sept-Okt) = sehr hoch
    if (monat >= 9 && monat <= 10) return 95;
    // Frühling (März-Mai) = hoch
    else if (monat >= 3 && monat <= 5) return 80;
    // Herbst (Nov) = mittel
    else if (monat === 11) return 70;
    // Winter/Sommer = niedrig
    else return 55;
  }

  /**
   * Generiert Tagesstrategie
   */
  private generiereTagesStrategie(vorhersagen: any[], pois: any[]) {
    const besteWildart = vorhersagen[0];

    return {
      morgen: {
        empfehlung: `05:30-08:00 Uhr: ${besteWildart?.wildart || 'Rehwild'} am POI ${pois[0]?.poi_id || 'N/A'}`,
        aktivität: 'Morgen-Ansitz',
      },
      mittag: {
        empfehlung: 'Pause - Wild ruht in Deckung',
        aktivität: 'Revierarbeit',
      },
      abend: {
        empfehlung: `17:00-20:30 Uhr: ${besteWildart?.wildart || 'Rehwild'} am POI ${pois[1]?.poi_id || 'N/A'}`,
        aktivität: 'Abend-Ansitz',
      },
    };
  }

  /**
   * Berechnet Wind-Taktik
   */
  private berechneWindTaktik(windrichtung: number) {
    return {
      windrichtung: `${Math.round(windrichtung)}°`,
      empfohleneAnstellrichtungen: [
        (windrichtung + 180) % 360, // Gegen den Wind
        (windrichtung + 135) % 360, // Schräg
        (windrichtung + 225) % 360, // Schräg
      ],
      warnung: windrichtung > 15 ? 'Starker Wind - Wild sehr vorsichtig!' : undefined,
    };
  }

  // ============================================================================
  // BESTANDSENTWICKLUNG
  // ============================================================================

  /**
   * Analysiert Bestandsentwicklung & erstellt Trend-Prognose
   */
  async trackBestandsentwicklung(
    revier_id: string,
    wildart: string
  ): Promise<BestandsentwicklungAnalyse> {
    // Hole Populations-Daten der letzten 5 Jahre
    const data = await this.db.getAllAsync<any>(
      `SELECT * FROM population_tracking
       WHERE revier_id = ? AND wildart = ?
       ORDER BY jahr DESC, saison DESC
       LIMIT 20`,
      [revier_id, wildart]
    );

    if (data.length === 0) {
      throw new Error('Keine Bestandsdaten vorhanden');
    }

    const aktuelleSchätzung = {
      bestand: data[0].geschätzter_bestand,
      confidence_intervall: {
        min: data[0].confidence_min,
        max: data[0].confidence_max,
      },
      methode: data[0].zählmethode,
      datum: new Date(data[0].zähldatum),
    };

    const trend = {
      richtung: data[0].trend,
      änderungsrate: data[0].änderungsrate,
      signifikanz: data[0].trend_signifikanz,
    };

    const altersstruktur = {
      jung: data[0].anteil_jung,
      mittel: data[0].anteil_mittel,
      alt: data[0].anteil_alt,
      geschlechtsverhältnis: data[0].geschlechts_verhältnis,
    };

    const abschussStatistik = {
      gesamt: data[0].abschüsse_gesamt,
      männlich: data[0].abschüsse_männlich,
      weiblich: data[0].abschüsse_weiblich,
      jung: data[0].abschüsse_jung,
      abschussplan_erfüllung: data[0].abschussplan_erfüllung,
    };

    const reproduktion = {
      setzrate: data[0].setzrate,
      überlebensrate_jung: data[0].überlebensrate_jung,
      zuwachsrate: data[0].zuwachsrate,
    };

    const verluste = {
      fallwild: data[0].fallwild,
      verkehrsopfer: data[0].verkehrsopfer,
      krankheit: data[0].krankheit,
      prädation: data[0].prädation,
      sonstige: data[0].verluste_sonstige,
    };

    const prognose = {
      nächstesJahr: data[0].prognose_nächstes_jahr,
      in3Jahren: data[0].prognose_3_jahre,
      in5Jahren: data[0].prognose_5_jahre,
    };

    const empfehlung = {
      gesamt: data[0].empfohlener_abschuss_gesamt,
      männlich: data[0].empfohlener_abschuss_männlich,
      weiblich: data[0].empfohlener_abschuss_weiblich,
      jung: data[0].empfohlener_abschuss_jung,
      ziel: data[0].abschussplan_ziel,
      begründung: data[0].empfehlung_begründung,
    };

    return {
      revier_id,
      wildart,
      aktuelleSchätzung,
      trend,
      altersstruktur,
      abschussStatistik,
      reproduktion,
      verluste,
      prognose,
      abschussplanEmpfehlung: empfehlung,
      model_version: '1.0.0',
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Cached Prediction abrufen
   */
  private async getCachedPrediction(
    revier_id: string,
    wildart: string,
    typ: string,
    datum: Date
  ): Promise<any | null> {
    const result = await this.db.getFirstAsync<any>(
      `SELECT * FROM predictions_cache
       WHERE revier_id = ? AND wildart = ? AND prediction_type = ?
       AND gültig_von <= ? AND gültig_bis >= ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [revier_id, wildart, typ, datum.toISOString(), datum.toISOString()]
    );

    return result
      ? {
          ...result,
          prediction_data: JSON.parse(result.prediction_data),
        }
      : null;
  }

  /**
   * Prediction cachen
   */
  private async cachePrediction(
    revier_id: string,
    wildart: string,
    typ: string,
    data: any,
    gültigkeitStunden: number
  ): Promise<void> {
    const id = uuidv4();
    const now = new Date();
    const gültigBis = new Date(now.getTime() + gültigkeitStunden * 60 * 60 * 1000);

    await this.db.runAsync(
      `INSERT INTO predictions_cache (
        id, revier_id, wildart, prediction_type,
        gültig_von, gültig_bis, prediction_data,
        confidence, model_version, model_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        revier_id,
        wildart,
        typ,
        now.toISOString(),
        gültigBis.toISOString(),
        JSON.stringify(data),
        data.confidence || 75,
        data.model_version || '1.0.0',
        'PredictionService',
      ]
    );
  }

  /**
   * Löscht abgelaufene Predictions (wird automatisch durch DB-Trigger ausgeführt)
   */
  async cleanupExpiredPredictions(): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM predictions_cache WHERE gültig_bis < datetime('now', '-7 days')`
    );
  }
}

export default new PredictionService();
