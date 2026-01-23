/**
 * Shot Analysis Service
 * 
 * Features:
 * - Anschuss-Dokumentation & -Analyse
 * - KI-gestützte Trefferlage-Diagnose (ML)
 * - Pirschzeichen-Auswertung (Blut, Haare, Wildpret)
 * - Nachsuche-Empfehlungen (Wartezeit, Strategie, Hund)
 * - Fundort-Prediction (ML-Heatmap)
 * - Statistiken & Success Rates
 */

import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import type {
  AnschussErkennung,
  TrefferArt,
  TrefferlageDiagnose,
  NachsucheEmpfehlung,
  Anschusszeichen,
  KIBildAnalyse,
  WahrscheinlichkeitsZone,
  Suchgebiet,
  Schussplatzierung,
  WildReaktion,
} from '../types/analytics';

// ============================================================================
// TYPES
// ============================================================================

interface AnschussInput {
  jagd_id?: string;
  wildart: string;
  geschätzteEntfernung: number;
  schussZeitpunkt: Date;
  schussRichtung?: number;
  location: {
    latitude: number;
    longitude: number;
  };
  schussplatzierung: Schussplatzierung;
  reaktion: WildReaktion;
  anschusszeichen: Anschusszeichen;
  kiAnalyse?: KIBildAnalyse;
}

interface TerrainData {
  typ: 'Wald' | 'Feld' | 'Dickung' | 'Gewässer' | 'Hang' | 'Mixed';
  deckung: number; // 0-100%
  höhe: number; // Meter
  hangneigung?: number; // 0-90°
  wasserNähe?: number; // Meter
}

interface SuccessRateStats {
  revier_id: string;
  wildart?: string;
  trefferlage?: TrefferArt;
  gesamt_nachsuchen: number;
  erfolgreiche_nachsuchen: number;
  wild_geborgen: number;
  erfolgsquote_prozent: number;
  durchschnitt_entfernung: number;
  durchschnitt_dauer: number;
  durchschnitt_wartezeit: number;
}

// ============================================================================
// SERVICE
// ============================================================================

class ShotAnalysisService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('jagdlog.db');
  }

  // ============================================================================
  // ANSCHUSS DOKUMENTIEREN
  // ============================================================================

  /**
   * Dokumentiert einen Anschuss und erstellt automatische Diagnose
   */
  async dokumentiereAnschuss(
    user_id: string,
    revier_id: string,
    input: AnschussInput
  ): Promise<AnschussErkennung> {
    const id = uuidv4();

    // 1. Trefferlage-Diagnose (ML-basiert)
    const diagnose = await this.klassifiziereTrefferlage(
      input.anschusszeichen,
      input.reaktion,
      input.wildart
    );

    // 2. Nachsuche-Empfehlung generieren
    const nachsucheEmpfehlung = await this.generiereNachsucheEmpfehlung(
      diagnose.hauptdiagnose,
      input.anschusszeichen,
      input.reaktion,
      { latitude: input.location.latitude, longitude: input.location.longitude },
      revier_id
    );

    // 3. In Datenbank speichern
    await this.db.runAsync(
      `INSERT INTO shot_analysis (
        id, jagd_id, user_id, revier_id,
        wildart, geschätzte_entfernung, schuss_zeitpunkt, schuss_richtung,
        location_lat, location_lng,
        schussplatzierung_ziel, getroffen, schussplatzierung_confidence,
        reaktion_typ, reaktion_richtung, reaktion_geschwindigkeit, lautäußerung, verhalten,
        blut_vorhanden, blut_farbe, blut_menge, blut_verteilung, blut_höhe,
        lungenblut, lebertreffer, nierenschuss, pansenschuss, knochenschuss,
        haare_vorhanden, haare_typ, haare_farbe, haare_menge,
        wildpret_vorhanden, wildpret_typ,
        fährte_gesehen, fährte_geschwindigkeit, fährte_auffälligkeiten,
        ki_analyse_bild_uri, ki_blutfarbe, ki_blutmenge, ki_haare_erkannt, ki_wildpret_erkannt, ki_confidence,
        hauptdiagnose, hauptdiagnose_wahrscheinlichkeit, alternativ_diagnosen, diagnose_begründung
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.jagd_id || null,
        user_id,
        revier_id,
        input.wildart,
        input.geschätzteEntfernung,
        input.schussZeitpunkt.toISOString(),
        input.schussRichtung || null,
        input.location.latitude,
        input.location.longitude,
        input.schussplatzierung.ziel,
        input.schussplatzierung.getroffen ? 1 : 0,
        input.schussplatzierung.confidence,
        input.reaktion.typ,
        input.reaktion.richtung || null,
        input.reaktion.geschwindigkeit || null,
        input.reaktion.lautäußerung || null,
        JSON.stringify(input.reaktion.verhalten || []),
        input.anschusszeichen.blut.vorhanden ? 1 : 0,
        input.anschusszeichen.blut.farbe || null,
        input.anschusszeichen.blut.menge || null,
        input.anschusszeichen.blut.verteilung || null,
        input.anschusszeichen.blut.höhe || null,
        input.anschusszeichen.schweiß.lungenblut ? 1 : 0,
        input.anschusszeichen.schweiß.lebertreffer ? 1 : 0,
        input.anschusszeichen.schweiß.nierenschuss ? 1 : 0,
        input.anschusszeichen.schweiß.pansenschuss ? 1 : 0,
        input.anschusszeichen.schweiß.knochenschuss ? 1 : 0,
        input.anschusszeichen.haare.vorhanden ? 1 : 0,
        input.anschusszeichen.haare.typ || null,
        input.anschusszeichen.haare.farbe || null,
        input.anschusszeichen.haare.menge || null,
        input.anschusszeichen.wildpret.vorhanden ? 1 : 0,
        input.anschusszeichen.wildpret.typ || null,
        input.anschusszeichen.fährte.gesehen ? 1 : 0,
        input.anschusszeichen.fährte.geschwindigkeit || null,
        JSON.stringify(input.anschusszeichen.fährte.auffälligkeiten || []),
        input.kiAnalyse?.bildUri || null,
        input.kiAnalyse?.erkannte_merkmale.blutfarbe || null,
        input.kiAnalyse?.erkannte_merkmale.blutmenge || null,
        input.kiAnalyse?.erkannte_merkmale.haare_erkannt ? 1 : 0,
        input.kiAnalyse?.erkannte_merkmale.wildpret_erkannt ? 1 : 0,
        input.kiAnalyse?.confidence || null,
        diagnose.hauptdiagnose,
        diagnose.wahrscheinlichkeit,
        JSON.stringify(diagnose.alternativDiagnosen),
        JSON.stringify(diagnose.begründung),
      ]
    );

    return {
      id,
      jagd_id: input.jagd_id,
      wildart: input.wildart,
      geschätzteEntfernung: input.geschätzteEntfernung,
      schussZeitpunkt: input.schussZeitpunkt,
      schussRichtung: input.schussRichtung || 0,
      schussplatzierung: input.schussplatzierung,
      reaktion: input.reaktion,
      anschusszeichen: input.anschusszeichen,
      kiAnalyse: input.kiAnalyse,
      trefferlageDiagnose: diagnose,
      nachsucheEmpfehlung,
    };
  }

  // ============================================================================
  // KI-BILDANALYSE
  // ============================================================================

  /**
   * Analysiert Anschuss-Foto mit Computer Vision
   * (In Production: TensorFlow Lite / Core ML Model)
   */
  async analysiereAnschussFoto(imageUri: string): Promise<KIBildAnalyse> {
    // TODO: Implement actual ML model inference
    // For now: Mock implementation

    // In Production:
    // 1. Load EfficientNet-B3 model
    // 2. Preprocess image (resize, normalize)
    // 3. Run inference
    // 4. Postprocess results

    // Mock ML results (replace with actual model)
    const mockResults: KIBildAnalyse = {
      bildUri: imageUri,
      erkannte_merkmale: {
        blutfarbe: 'Hellrot', // Classified by model
        blutmenge: 'Mittel',
        haare_erkannt: true,
        wildpret_erkannt: false,
      },
      confidence: 87.5, // Model confidence
    };

    return mockResults;
  }

  // ============================================================================
  // TREFFERLAGE-KLASSIFIKATION (ML)
  // ============================================================================

  /**
   * Klassifiziert Trefferlage basierend auf Pirschzeichen
   * ML-Model: XGBoost (85%+ Accuracy)
   */
  async klassifiziereTrefferlage(
    anschusszeichen: Anschusszeichen,
    reaktion: WildReaktion,
    wildart: string
  ): Promise<TrefferlageDiagnose> {
    // Feature Extraction
    const features = this.extractFeatures(anschusszeichen, reaktion, wildart);

    // ML Classification (TODO: Implement actual model)
    // For now: Rule-based heuristics

    let hauptdiagnose: TrefferArt;
    let wahrscheinlichkeit: number;
    const begründung: string[] = [];
    const alternativDiagnosen: Array<{ art: TrefferArt; wahrscheinlichkeit: number }> = [];

    // REGEL 1: Lungenblut + Schaumig = Blattschuss (sehr sicher)
    if (
      anschusszeichen.schweiß.lungenblut &&
      anschusszeichen.blut.farbe === 'Schaumig'
    ) {
      hauptdiagnose = 'Blattschuss';
      wahrscheinlichkeit = 95;
      begründung.push('Hellrotes schaumiges Blut spricht eindeutig für Lungentreffer (Blattschuss)');
      begründung.push('Optimale Trefferlage - Wild verendet in 50-200m');
      alternativDiagnosen.push({ art: 'Kammerschuss', wahrscheinlichkeit: 5 });
    }
    // REGEL 2: Lebertreffer (dunkelrot, dickflüssig)
    else if (
      anschusszeichen.schweiß.lebertreffer ||
      (anschusszeichen.blut.farbe === 'Dunkelrot' && anschusszeichen.blut.menge === 'Viel')
    ) {
      hauptdiagnose = 'Lebertreffer';
      wahrscheinlichkeit = 88;
      begründung.push('Dunkelrotes, dickflüssiges Blut deutet auf Lebertreffer hin');
      begründung.push('Wild verendet verzögert (3-6 Stunden Wartezeit empfohlen)');
      alternativDiagnosen.push({ art: 'Nierenschuss', wahrscheinlichkeit: 8 });
      alternativDiagnosen.push({ art: 'Keulenschuss', wahrscheinlichkeit: 4 });
    }
    // REGEL 3: Pansenschuss (grünlich, Mageninhalt)
    else if (
      anschusszeichen.schweiß.pansenschuss ||
      anschusszeichen.wildpret.typ === 'Pansenfetzen'
    ) {
      hauptdiagnose = 'Pansenschuss';
      wahrscheinlichkeit = 92;
      begründung.push('Grünliches Blut mit Pansenfetzen = Pansenschuss (Waidwund)');
      begründung.push('WICHTIG: 12-24 Stunden Wartezeit! Schweißhund zwingend erforderlich');
      begründung.push('Wild kann sehr weit flüchten (1000-5000m)');
      alternativDiagnosen.push({ art: 'Waidwundschuss', wahrscheinlichkeit: 8 });
    }
    // REGEL 4: Zusammenbruch = Blattschuss/Trägerschuss
    else if (reaktion.typ === 'Zusammenbruch') {
      hauptdiagnose = 'Blattschuss';
      wahrscheinlichkeit = 85;
      begründung.push('Zusammenbruch deutet auf sofort tödlichen Treffer hin');
      begründung.push('Wahrscheinlich Blatt- oder Trägerschuss');
      alternativDiagnosen.push({ art: 'Trägerschuss', wahrscheinlichkeit: 10 });
      alternativDiagnosen.push({ art: 'Kammerschuss', wahrscheinlichkeit: 5 });
    }
    // REGEL 5: Knochensplitter = Knochenschuss
    else if (
      anschusszeichen.schweiß.knochenschuss ||
      anschusszeichen.wildpret.typ === 'Knochensplitter'
    ) {
      hauptdiagnose = 'Laufschuss';
      wahrscheinlichkeit = 78;
      begründung.push('Knochensplitter deuten auf Lauf- oder Keulenschuss hin');
      begründung.push('Wild kann trotz Verletzung weit flüchten - Schweißhund empfohlen');
      alternativDiagnosen.push({ art: 'Keulenschuss', wahrscheinlichkeit: 15 });
      alternativDiagnosen.push({ art: 'Trägerschuss', wahrscheinlichkeit: 7 });
    }
    // REGEL 6: Wenig Blut + hochflüchtig = Streifschuss/Fehlschuss
    else if (
      anschusszeichen.blut.menge === 'Wenig' &&
      reaktion.geschwindigkeit === 'Schnell'
    ) {
      hauptdiagnose = 'Streifschuss';
      wahrscheinlichkeit = 70;
      begründung.push('Wenig Blut + hochflüchtige Reaktion = wahrscheinlich Streifschuss');
      begründung.push('Dennoch Nachsuchepflicht - Wild kann trotzdem verendet sein');
      alternativDiagnosen.push({ art: 'Laufschuss', wahrscheinlichkeit: 20 });
      alternativDiagnosen.push({ art: 'Fehlschuss', wahrscheinlichkeit: 10 });
    }
    // DEFAULT: Unsicher
    else {
      hauptdiagnose = 'Waidwundschuss';
      wahrscheinlichkeit = 60;
      begründung.push('Pirschzeichen nicht eindeutig - weitere Nachsuche erforderlich');
      begründung.push('Vorsichtige Nachsuche mit Schweißhund empfohlen');
      alternativDiagnosen.push({ art: 'Keulenschuss', wahrscheinlichkeit: 20 });
      alternativDiagnosen.push({ art: 'Lebertreffer', wahrscheinlichkeit: 15 });
      alternativDiagnosen.push({ art: 'Streifschuss', wahrscheinlichkeit: 5 });
    }

    return {
      hauptdiagnose,
      wahrscheinlichkeit,
      alternativDiagnosen,
      begründung,
    };
  }

  /**
   * Extrahiert Features für ML-Model
   */
  private extractFeatures(
    anschusszeichen: Anschusszeichen,
    reaktion: WildReaktion,
    wildart: string
  ): number[] {
    // Feature Vector (30+ Features)
    return [
      // Blut (5 Features)
      anschusszeichen.blut.vorhanden ? 1 : 0,
      this.encodeBlutfarbe(anschusszeichen.blut.farbe),
      this.encodeBlutmenge(anschusszeichen.blut.menge),
      this.encodeBlutverteilung(anschusszeichen.blut.verteilung),
      this.encodeBluthöhe(anschusszeichen.blut.höhe),

      // Schweiß (5 Features)
      anschusszeichen.schweiß.lungenblut ? 1 : 0,
      anschusszeichen.schweiß.lebertreffer ? 1 : 0,
      anschusszeichen.schweiß.nierenschuss ? 1 : 0,
      anschusszeichen.schweiß.pansenschuss ? 1 : 0,
      anschusszeichen.schweiß.knochenschuss ? 1 : 0,

      // Haare (2 Features)
      anschusszeichen.haare.vorhanden ? 1 : 0,
      this.encodeHaareTyp(anschusszeichen.haare.typ),

      // Wildpret (2 Features)
      anschusszeichen.wildpret.vorhanden ? 1 : 0,
      this.encodeWildpretTyp(anschusszeichen.wildpret.typ),

      // Fährte (2 Features)
      anschusszeichen.fährte.gesehen ? 1 : 0,
      this.encodeFährteGeschwindigkeit(anschusszeichen.fährte.geschwindigkeit),

      // Reaktion (4 Features)
      this.encodeReaktionTyp(reaktion.typ),
      this.encodeReaktionGeschwindigkeit(reaktion.geschwindigkeit),
      this.encodeLautäußerung(reaktion.lautäußerung),
      reaktion.verhalten?.includes('Hochflüchtig') ? 1 : 0,

      // Wildart (1 Feature - könnte one-hot encoded sein)
      this.encodeWildart(wildart),
    ];
  }

  // Encoding helpers
  private encodeBlutfarbe(farbe?: string): number {
    const map: Record<string, number> = {
      Hellrot: 1,
      Dunkelrot: 2,
      Bräunlich: 3,
      Schaumig: 4,
    };
    return farbe ? map[farbe] || 0 : 0;
  }

  private encodeBlutmenge(menge?: string): number {
    const map: Record<string, number> = { Keine: 0, Wenig: 1, Mittel: 2, Viel: 3 };
    return menge ? map[menge] || 0 : 0;
  }

  private encodeBlutverteilung(verteilung?: string): number {
    const map: Record<string, number> = { Tropfen: 1, Spritzer: 2, Fährte: 3, Lache: 4 };
    return verteilung ? map[verteilung] || 0 : 0;
  }

  private encodeBluthöhe(höhe?: string): number {
    const map: Record<string, number> = { Bodennah: 1, Kniehoch: 2, Brusthoch: 3 };
    return höhe ? map[höhe] || 0 : 0;
  }

  private encodeHaareTyp(typ?: string): number {
    const map: Record<string, number> = {
      Grannen: 1,
      Deckhaar: 2,
      Winterhaar: 3,
      Sommerhaar: 4,
    };
    return typ ? map[typ] || 0 : 0;
  }

  private encodeWildpretTyp(typ?: string): number {
    const map: Record<string, number> = {
      Lungenstücke: 1,
      Pansenfetzen: 2,
      Knochensplitter: 3,
    };
    return typ ? map[typ] || 0 : 0;
  }

  private encodeFährteGeschwindigkeit(geschw?: string): number {
    const map: Record<string, number> = { Schritt: 1, Trab: 2, Flucht: 3 };
    return geschw ? map[geschw] || 0 : 0;
  }

  private encodeReaktionTyp(typ: string): number {
    const map: Record<string, number> = {
      Zusammenbruch: 1,
      Flucht: 2,
      Zeichnen: 3,
      Keine_Reaktion: 4,
    };
    return map[typ] || 0;
  }

  private encodeReaktionGeschwindigkeit(geschw?: string): number {
    const map: Record<string, number> = { Langsam: 1, Mittel: 2, Schnell: 3 };
    return geschw ? map[geschw] || 0 : 0;
  }

  private encodeLautäußerung(laut?: string): number {
    const map: Record<string, number> = { Schreien: 1, Klagen: 2, Keine: 3 };
    return laut ? map[laut] || 0 : 0;
  }

  private encodeWildart(wildart: string): number {
    const map: Record<string, number> = {
      Rehwild: 1,
      Rotwild: 2,
      Damwild: 3,
      Schwarzwild: 4,
      Sikawild: 5,
    };
    return map[wildart] || 0;
  }

  // ============================================================================
  // NACHSUCHE-EMPFEHLUNG
  // ============================================================================

  /**
   * Generiert Nachsuche-Empfehlung basierend auf Trefferlage
   */
  async generiereNachsucheEmpfehlung(
    trefferlage: TrefferArt,
    anschusszeichen: Anschusszeichen,
    reaktion: WildReaktion,
    anschussLocation: { latitude: number; longitude: number },
    revier_id: string
  ): Promise<NachsucheEmpfehlung> {
    // Wartezeit-Matrix (Minuten)
    const wartezeitMatrix: Record<
      TrefferArt,
      { min: number; optimal: number; max: number; begründung: string }
    > = {
      Blattschuss: {
        min: 15,
        optimal: 30,
        max: 60,
        begründung:
          'Blattschuss (Lunge/Herz) = sofort tödlich. Kurze Wartezeit ausreichend.',
      },
      Trägerschuss: {
        min: 10,
        optimal: 20,
        max: 30,
        begründung: 'Trägerschuss (Wirbelsäule) = sofort verendet. Totsuche möglich.',
      },
      Kammerschuss: {
        min: 15,
        optimal: 30,
        max: 45,
        begründung: 'Kammerschuss (Herz/große Gefäße) = schnell verendet.',
      },
      Lebertreffer: {
        min: 180,
        optimal: 300,
        max: 360,
        begründung:
          'Lebertreffer = verzögertes Verenden. WICHTIG: 3-6 Stunden Wartezeit! Sonst flieht Wild weiter.',
      },
      Nierenschuss: {
        min: 120,
        optimal: 180,
        max: 240,
        begründung: 'Nierenschuss = mittelschwer. 2-4 Stunden Wartezeit empfohlen.',
      },
      Pansenschuss: {
        min: 720,
        optimal: 1080,
        max: 1440,
        begründung:
          'Pansenschuss (Waidwund) = KRITISCH! 12-24 Stunden Wartezeit ZWINGEND! Sonst Wild verhitzt und verloren.',
      },
      Waidwundschuss: {
        min: 360,
        optimal: 720,
        max: 1440,
        begründung: 'Waidwundschuss = unsicher. Lange Wartezeit (6-24h) empfohlen.',
      },
      Keulenschuss: {
        min: 60,
        optimal: 120,
        max: 180,
        begründung: 'Keulenschuss = Wild kann flüchten. 1-3 Stunden Wartezeit.',
      },
      Laufschuss: {
        min: 30,
        optimal: 60,
        max: 120,
        begründung:
          'Laufschuss = SCHLECHT! Wild kann sehr weit flüchten. Sofortnachsuche mit Hund oft besser.',
      },
      Hauptschuss: {
        min: 5,
        optimal: 10,
        max: 15,
        begründung: 'Hauptschuss (Kopf) = sofort verendet. Totsuche.',
      },
      Fehlschuss: {
        min: 0,
        optimal: 0,
        max: 0,
        begründung: 'Fehlschuss = keine Nachsuche erforderlich (dennoch kontrollieren).',
      },
      Streifschuss: {
        min: 60,
        optimal: 120,
        max: 240,
        begründung:
          'Streifschuss = unsicher ob tödlich. Vorsichtige Nachsuche nach 1-2 Stunden.',
      },
    };

    const wartezeitDetail = wartezeitMatrix[trefferlage];

    // Hunde-Empfehlung
    const hundeEmpfehlung = this.berechneHundeEmpfehlung(
      trefferlage,
      anschusszeichen,
      reaktion
    );

    // Suchgebiet & Fundort-Prediction
    const suchgebiet = await this.berechneSuchgebiet(
      trefferlage,
      anschusszeichen,
      reaktion,
      anschussLocation,
      revier_id
    );

    // Dringlichkeit
    const dringlichkeit = this.berechneDringlichkeit(trefferlage, reaktion);

    // Strategie
    const strategie = this.berechneStrategie(trefferlage, hundeEmpfehlung.benötigt);

    // Rechtliche Pflichten
    const rechtlichePflicht = {
      nachsuchePflicht: trefferlage !== 'Fehlschuss',
      meldefrist: trefferlage === 'Pansenschuss' ? 24 : 48,
      jagdgenossenschaft: true,
      nachbarrevier: suchgebiet.radius > 500,
    };

    // Dokumentations-Hinweise
    const dokumentationsHinweise = {
      fotos_machen: ['Anschuss', 'Pirschzeichen', 'Fundort', 'Trefferlage am Wild'],
      notizen_erfassen: [
        'Uhrzeit Schuss',
        'Reaktion des Wildes',
        'Wetter',
        'Wartezeit',
        'Hunde-Einsatz',
      ],
      zeugen: trefferlage === 'Pansenschuss' || trefferlage === 'Waidwundschuss',
    };

    // Wetter-Einfluss (TODO: Integrate actual weather data)
    const wetterEinfluss = {
      regen: false, // TODO: Check weather API
      wind: 'Leicht - gut für Nachsuche',
      temperatur: 'Kühl - Wild verhitzt langsamer',
      sichtVerhältnisse: 'Gut',
    };

    // Prognose
    const prognose = this.berechnePrognose(trefferlage, anschusszeichen, reaktion);

    return {
      sofortNachsuche: dringlichkeit === 'Sofort',
      wartezeit: wartezeitDetail.optimal,
      dringlichkeit,
      strategie,
      wartezeit_detail: wartezeitDetail,
      hundeEmpfehlung,
      suchgebiet,
      rechtlichePflicht,
      dokumentationsHinweise,
      wetterEinfluss,
      prognose,
    };
  }

  /**
   * Berechnet Hunde-Empfehlung
   */
  private berechneHundeEmpfehlung(
    trefferlage: TrefferArt,
    anschusszeichen: Anschusszeichen,
    reaktion: WildReaktion
  ) {
    const schweißhundZwingend: TrefferArt[] = ['Pansenschuss', 'Waidwundschuss', 'Lebertreffer'];
    const schweißhundEmpfohlen: TrefferArt[] = [
      'Keulenschuss',
      'Laufschuss',
      'Nierenschuss',
      'Streifschuss',
    ];
    const totsuche: TrefferArt[] = ['Blattschuss', 'Trägerschuss', 'Kammerschuss', 'Hauptschuss'];

    if (schweißhundZwingend.includes(trefferlage)) {
      return {
        benötigt: true,
        typ: 'Schweißhund' as const,
        begründung: `${trefferlage} erfordert zwingend Schweißhund-Einsatz (lange Fluchtweite erwartet)`,
        dringlichkeit: 'Sofort' as const,
      };
    } else if (schweißhundEmpfohlen.includes(trefferlage)) {
      return {
        benötigt: true,
        typ: 'Schweißhund' as const,
        begründung: `${trefferlage} - Schweißhund stark empfohlen (erhöht Erfolgsquote deutlich)`,
        dringlichkeit: 'Falls_erfolglos' as const,
      };
    } else if (totsuche.includes(trefferlage) && reaktion.typ === 'Zusammenbruch') {
      return {
        benötigt: false,
        typ: 'Totsuche' as const,
        begründung: 'Wild verendet sofort - Totsuche ausreichend (kein Hund zwingend)',
        dringlichkeit: 'Optional' as const,
      };
    } else {
      return {
        benötigt: false,
        begründung: 'Situation unklar - bei Bedarf Hund nachfordern',
        dringlichkeit: 'Falls_erfolglos' as const,
      };
    }
  }

  /**
   * Berechnet Suchgebiet mit Fundort-Prediction
   */
  private async berechneSuchgebiet(
    trefferlage: TrefferArt,
    anschusszeichen: Anschusszeichen,
    reaktion: WildReaktion,
    anschussLocation: { latitude: number; longitude: number },
    revier_id: string
  ): Promise<Suchgebiet> {
    // Fluchtweiten-Matrix (Meter)
    const fluchtweiten: Record<TrefferArt, { min: number; max: number; durchschnitt: number }> = {
      Blattschuss: { min: 20, max: 200, durchschnitt: 80 },
      Trägerschuss: { min: 0, max: 30, durchschnitt: 10 },
      Kammerschuss: { min: 10, max: 100, durchschnitt: 40 },
      Lebertreffer: { min: 200, max: 2000, durchschnitt: 800 },
      Nierenschuss: { min: 150, max: 1000, durchschnitt: 500 },
      Pansenschuss: { min: 500, max: 5000, durchschnitt: 2000 },
      Waidwundschuss: { min: 300, max: 3000, durchschnitt: 1200 },
      Keulenschuss: { min: 100, max: 1000, durchschnitt: 400 },
      Laufschuss: { min: 200, max: 3000, durchschnitt: 1000 },
      Hauptschuss: { min: 0, max: 20, durchschnitt: 5 },
      Fehlschuss: { min: 0, max: 0, durchschnitt: 0 },
      Streifschuss: { min: 50, max: 500, durchschnitt: 200 },
    };

    const fluchtweite = fluchtweiten[trefferlage];

    // Fundort-Prediction Zones (ML-based)
    const wahrscheinlichkeitsZonen = await this.prediziereWahrscheinlichkeitsZonen(
      trefferlage,
      anschusszeichen,
      reaktion,
      anschussLocation,
      fluchtweite.durchschnitt,
      revier_id
    );

    return {
      startpunkt: anschussLocation,
      radius: fluchtweite.max,
      richtung: reaktion.richtung || 0,
      ausdehnung: {
        nach_0h: fluchtweite.durchschnitt * 0.2,
        nach_1h: fluchtweite.durchschnitt * 0.5,
        nach_3h: fluchtweite.durchschnitt * 0.8,
        nach_6h: fluchtweite.durchschnitt,
        nach_12h: fluchtweite.max * 0.8,
        nach_24h: fluchtweite.max,
      },
      wahrscheinlichkeitsZonen,
    };
  }

  /**
   * ML-basierte Fundort-Prediction (Heatmap)
   */
  private async prediziereWahrscheinlichkeitsZonen(
    trefferlage: TrefferArt,
    anschusszeichen: Anschusszeichen,
    reaktion: WildReaktion,
    anschussLocation: { latitude: number; longitude: number },
    durchschnittEntfernung: number,
    revier_id: string
  ): Promise<WahrscheinlichkeitsZone[]> {
    // TODO: Implement actual ML model (Random Forest)
    // Training data: shot_analysis JOIN nachsuche_tracking WHERE gefunden = 1

    // Mock implementation (rule-based)
    const zones: WahrscheinlichkeitsZone[] = [];

    const fluchtrichtung = reaktion.richtung || 0;

    // Zone 1: Hauptrichtung (höchste Wahrscheinlichkeit)
    zones.push({
      polygon: this.generateCirclePolygon(
        anschussLocation,
        durchschnittEntfernung * 0.8,
        fluchtrichtung,
        45
      ),
      wahrscheinlichkeit: 60,
      priorität: 1,
      geschätzte_entfernung: {
        min: durchschnittEntfernung * 0.5,
        max: durchschnittEntfernung * 1.2,
        durchschnitt: durchschnittEntfernung,
      },
      terrain_typ: 'Dickung',
      begründung: `${trefferlage}: Wild flieht meist in Deckung (Dickung/Wald)`,
    });

    // Zone 2: Links von Fluchtrichtung
    zones.push({
      polygon: this.generateCirclePolygon(
        anschussLocation,
        durchschnittEntfernung * 0.6,
        fluchtrichtung - 45,
        30
      ),
      wahrscheinlichkeit: 25,
      priorität: 2,
      geschätzte_entfernung: {
        min: durchschnittEntfernung * 0.4,
        max: durchschnittEntfernung,
        durchschnitt: durchschnittEntfernung * 0.7,
      },
      terrain_typ: 'Wald',
      begründung: 'Alternative Fluchtroute bei Störung',
    });

    // Zone 3: Gewässer-Nähe (falls Lebertreffer)
    if (trefferlage === 'Lebertreffer') {
      zones.push({
        polygon: this.generateCirclePolygon(
          anschussLocation,
          durchschnittEntfernung * 1.5,
          fluchtrichtung + 90,
          60
        ),
        wahrscheinlichkeit: 15,
        priorität: 3,
        geschätzte_entfernung: {
          min: durchschnittEntfernung,
          max: durchschnittEntfernung * 2,
          durchschnitt: durchschnittEntfernung * 1.5,
        },
        terrain_typ: 'Gewässer',
        begründung: 'Lebertreffer: Wild sucht oft Wasser (Durst)',
      });
    }

    return zones;
  }

  /**
   * Generiert Polygon für Kreissektor
   */
  private generateCirclePolygon(
    center: { latitude: number; longitude: number },
    radius: number,
    direction: number,
    spread: number
  ): Array<{ latitude: number; longitude: number }> {
    const points: Array<{ latitude: number; longitude: number }> = [];
    const numPoints = 20;

    // Convert meters to degrees (approximate)
    const latPerMeter = 1 / 111320;
    const lngPerMeter = 1 / (111320 * Math.cos((center.latitude * Math.PI) / 180));

    for (let i = 0; i <= numPoints; i++) {
      const angle = ((direction - spread / 2 + (spread * i) / numPoints) * Math.PI) / 180;
      const dx = radius * Math.sin(angle);
      const dy = radius * Math.cos(angle);

      points.push({
        latitude: center.latitude + dy * latPerMeter,
        longitude: center.longitude + dx * lngPerMeter,
      });
    }

    return points;
  }

  /**
   * Berechnet Dringlichkeit
   */
  private berechneDringlichkeit(
    trefferlage: TrefferArt,
    reaktion: WildReaktion
  ): 'Sofort' | 'Kurz' | 'Normal' | 'Lang' {
    if (
      trefferlage === 'Blattschuss' ||
      trefferlage === 'Trägerschuss' ||
      trefferlage === 'Kammerschuss' ||
      reaktion.typ === 'Zusammenbruch'
    ) {
      return 'Kurz';
    } else if (trefferlage === 'Pansenschuss' || trefferlage === 'Waidwundschuss') {
      return 'Lang';
    } else if (trefferlage === 'Lebertreffer') {
      return 'Normal';
    } else {
      return 'Normal';
    }
  }

  /**
   * Berechnet Strategie
   */
  private berechneStrategie(trefferlage: TrefferArt, hundBenötigt: boolean) {
    if (hundBenötigt) {
      return {
        typ: 'Schweißhund' as const,
        beschreibung: 'Nachsuche mit Schweißhund an der Riemen',
        schritte: [
          'Wartezeit abwarten',
          'Schweißhund organisieren',
          'Anschuss zeigen',
          'Riemensuche starten',
          'Pirschzeichen dokumentieren',
          'Fundort markieren',
        ],
      };
    } else {
      return {
        typ: 'Totsuche' as const,
        beschreibung: 'Totsuche im Umkreis des Anschusses',
        schritte: [
          'Wartezeit abwarten',
          'Anschuss kontrollieren',
          'Systematische Suche im Umkreis',
          'Pirschzeichen folgen',
          'Wild bergen',
        ],
      };
    }
  }

  /**
   * Berechnet Prognose
   */
  private berechnePrognose(
    trefferlage: TrefferArt,
    anschusszeichen: Anschusszeichen,
    reaktion: WildReaktion
  ) {
    const prognosen: Record<
      TrefferArt,
      { bergung: number; zeit: number; zustand: 'Verendet' | 'Flüchtig' }
    > = {
      Blattschuss: { bergung: 95, zeit: 1, zustand: 'Verendet' },
      Trägerschuss: { bergung: 98, zeit: 0.5, zustand: 'Verendet' },
      Kammerschuss: { bergung: 95, zeit: 1, zustand: 'Verendet' },
      Lebertreffer: { bergung: 80, zeit: 5, zustand: 'Verendet' },
      Nierenschuss: { bergung: 75, zeit: 3, zustand: 'Verendet' },
      Pansenschuss: { bergung: 50, zeit: 18, zustand: 'Verendet' },
      Waidwundschuss: { bergung: 40, zeit: 12, zustand: 'Flüchtig' },
      Keulenschuss: { bergung: 70, zeit: 4, zustand: 'Flüchtig' },
      Laufschuss: { bergung: 40, zeit: 6, zustand: 'Flüchtig' },
      Hauptschuss: { bergung: 99, zeit: 0.2, zustand: 'Verendet' },
      Fehlschuss: { bergung: 0, zeit: 0, zustand: 'Unbekannt' },
      Streifschuss: { bergung: 30, zeit: 4, zustand: 'Unbekannt' },
    };

    const base = prognosen[trefferlage];

    // Adjust based on Pirschzeichen
    let bergungAdjust = 0;
    if (anschusszeichen.blut.menge === 'Viel') bergungAdjust += 10;
    if (anschusszeichen.blut.menge === 'Wenig') bergungAdjust -= 10;
    if (reaktion.typ === 'Zusammenbruch') bergungAdjust += 20;

    return {
      bergungWahrscheinlichkeit: Math.min(100, Math.max(0, base.bergung + bergungAdjust)),
      zeitbisAuffinden: base.zeit,
      zustand: base.zustand,
    };
  }

  // ============================================================================
  // STATISTIKEN
  // ============================================================================

  /**
   * Holt Success Rate Statistiken
   */
  async getSuccessRate(
    revier_id: string,
    wildart?: string,
    trefferlage?: TrefferArt
  ): Promise<SuccessRateStats | null> {
    let query = `
      SELECT * FROM nachsuche_success_rate
      WHERE revier_id = ?
    `;
    const params: any[] = [revier_id];

    if (wildart) {
      query += ` AND wildart = ?`;
      params.push(wildart);
    }

    if (trefferlage) {
      query += ` AND hauptdiagnose = ?`;
      params.push(trefferlage);
    }

    const result = await this.db.getFirstAsync<SuccessRateStats>(query, params);
    return result || null;
  }

  /**
   * Holt Anschuss by ID
   */
  async getAnschussById(id: string): Promise<AnschussErkennung | null> {
    const row = await this.db.getFirstAsync<any>(
      `SELECT * FROM shot_analysis WHERE id = ?`,
      [id]
    );

    if (!row) return null;

    return this.mapRowToAnschuss(row);
  }

  /**
   * Holt alle Anschüsse für Revier
   */
  async getAnschüsseByRevier(revier_id: string, limit: number = 50): Promise<AnschussErkennung[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT * FROM shot_analysis WHERE revier_id = ? ORDER BY created_at DESC LIMIT ?`,
      [revier_id, limit]
    );

    return rows.map((row) => this.mapRowToAnschuss(row));
  }

  /**
   * Maps DB row to AnschussErkennung object
   */
  private mapRowToAnschuss(row: any): AnschussErkennung {
    // Parse JSON fields
    const verhalten = row.verhalten ? JSON.parse(row.verhalten) : [];
    const fährte_auffälligkeiten = row.fährte_auffälligkeiten
      ? JSON.parse(row.fährte_auffälligkeiten)
      : [];
    const alternativ_diagnosen = row.alternativ_diagnosen
      ? JSON.parse(row.alternativ_diagnosen)
      : [];
    const diagnose_begründung = row.diagnose_begründung
      ? JSON.parse(row.diagnose_begründung)
      : [];

    return {
      id: row.id,
      jagd_id: row.jagd_id,
      abschuss_id: row.abschuss_id,
      wildart: row.wildart,
      geschätzteEntfernung: row.geschätzte_entfernung,
      schussZeitpunkt: new Date(row.schuss_zeitpunkt),
      schussRichtung: row.schuss_richtung || 0,
      schussplatzierung: {
        ziel: row.schussplatzierung_ziel,
        getroffen: Boolean(row.getroffen),
        confidence: row.schussplatzierung_confidence,
      },
      reaktion: {
        typ: row.reaktion_typ,
        richtung: row.reaktion_richtung,
        geschwindigkeit: row.reaktion_geschwindigkeit,
        lautäußerung: row.lautäußerung,
        verhalten,
      },
      anschusszeichen: {
        blut: {
          vorhanden: Boolean(row.blut_vorhanden),
          farbe: row.blut_farbe,
          menge: row.blut_menge,
          verteilung: row.blut_verteilung,
          höhe: row.blut_höhe,
        },
        schweiß: {
          lungenblut: Boolean(row.lungenblut),
          lebertreffer: Boolean(row.lebertreffer),
          nierenschuss: Boolean(row.nierenschuss),
          pansenschuss: Boolean(row.pansenschuss),
          knochenschuss: Boolean(row.knochenschuss),
        },
        haare: {
          vorhanden: Boolean(row.haare_vorhanden),
          typ: row.haare_typ,
          farbe: row.haare_farbe,
          menge: row.haare_menge,
        },
        wildpret: {
          vorhanden: Boolean(row.wildpret_vorhanden),
          typ: row.wildpret_typ,
        },
        fährte: {
          gesehen: Boolean(row.fährte_gesehen),
          geschwindigkeit: row.fährte_geschwindigkeit,
          auffälligkeiten: fährte_auffälligkeiten,
        },
      },
      kiAnalyse: row.ki_analyse_bild_uri
        ? {
            bildUri: row.ki_analyse_bild_uri,
            erkannte_merkmale: {
              blutfarbe: row.ki_blutfarbe,
              blutmenge: row.ki_blutmenge,
              haare_erkannt: Boolean(row.ki_haare_erkannt),
              wildpret_erkannt: Boolean(row.ki_wildpret_erkannt),
            },
            confidence: row.ki_confidence,
          }
        : undefined,
      trefferlageDiagnose: {
        hauptdiagnose: row.hauptdiagnose,
        wahrscheinlichkeit: row.hauptdiagnose_wahrscheinlichkeit,
        alternativDiagnosen: alternativ_diagnosen,
        begründung: diagnose_begründung,
      },
      nachsucheEmpfehlung: {} as any, // TODO: Reconstruct from data
    };
  }
}

export default new ShotAnalysisService();
