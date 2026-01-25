/**
 * Shot Analysis API
 */
import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, generateUUID, now } from '@/lib/database';

// KI-Mock für Shot Analysis (später durch echtes ML-Model ersetzen)
const analyzeShotMock = (data: any) => {
  const { bloodColor, bloodAmount, wildReaction } = data;

  // Simplified logic (später ML-Model)
  let hitZone = 'Blattschuss';
  let confidence = 0.95;
  let waitTimeMin = 15;
  let waitTimeOptimal = 30;
  let waitTimeMax = 60;
  let dogRequired = false;
  let dogType = null;

  if (bloodColor === 'hell-rot' && bloodAmount === 'viel') {
    hitZone = 'Blattschuss';
    confidence = 0.95;
    waitTimeMin = 15;
    waitTimeOptimal = 30;
    waitTimeMax = 60;
    dogRequired = false;
  } else if (bloodColor === 'dunkel-rot' && wildReaction === 'zusammengebrochen') {
    hitZone = 'Lebertreffer';
    confidence = 0.88;
    waitTimeMin = 60;
    waitTimeOptimal = 120;
    waitTimeMax = 180;
    dogRequired = true;
    dogType = 'Schweißhund';
  } else if (bloodColor === 'wässrig' || bloodAmount === 'wenig') {
    hitZone = 'Pansenschuss';
    confidence = 0.72;
    waitTimeMin = 360;
    waitTimeOptimal = 480;
    waitTimeMax = 720;
    dogRequired = true;
    dogType = 'Schweißhund';
  } else {
    hitZone = 'Keulenschuss';
    confidence = 0.82;
    waitTimeMin = 120;
    waitTimeOptimal = 180;
    waitTimeMax = 240;
    dogRequired = true;
    dogType = 'Schweißhund';
  }

  return {
    hitZone,
    confidence,
    waitTimeMin,
    waitTimeOptimal,
    waitTimeMax,
    dogRequired,
    dogType,
    successProbability: confidence,
  };
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      distance,
      direction,
      wildReaction,
      bloodColor,
      bloodAmount,
      bloodDistribution,
      bloodHeight,
      revierId,
      userId,
    } = data;

    // KI-Analyse durchführen
    const analysis = analyzeShotMock(data);

    // In Datenbank speichern
    const db = await initDatabase();
    const analysisId = generateUUID();
    const eintragId = generateUUID();
    const timestamp = now();

    // Eintrag erstellen
    db.run(
      `INSERT INTO eintraege (
        id, revier_id, user_id, typ, zeitpunkt, wildart_id, wildart_name,
        details_json, erstellt_am, aktualisiert_am, erstellt_von
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eintragId,
        revierId || 'default',
        userId || 'anonymous',
        'shot_analysis',
        timestamp,
        'unknown',
        'Unbekannt',
        JSON.stringify({ distance, direction, wildReaction }),
        timestamp,
        timestamp,
        userId || 'anonymous',
      ]
    );

    // Analyse-Ergebnis speichern
    db.run(
      `INSERT INTO shot_analysis (
        id, eintrag_id, hit_zone, confidence, wait_time_min, wait_time_optimal,
        wait_time_max, dog_required, dog_type, blood_color, blood_amount,
        blood_distribution, wild_reaction, erstellt_am
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        analysisId,
        eintragId,
        analysis.hitZone,
        analysis.confidence,
        analysis.waitTimeMin,
        analysis.waitTimeOptimal,
        analysis.waitTimeMax,
        analysis.dogRequired ? 1 : 0,
        analysis.dogType,
        bloodColor,
        bloodAmount,
        bloodDistribution,
        wildReaction,
        timestamp,
      ]
    );

    return NextResponse.json({
      success: true,
      analysisId,
      ...analysis,
    });
  } catch (error: any) {
    console.error('[API] Shot analysis error:', error);
    return NextResponse.json(
      { error: 'Analyse fehlgeschlagen', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await initDatabase();

    let query = `
      SELECT 
        sa.id, sa.hit_zone, sa.confidence, sa.wait_time_optimal,
        sa.dog_required, sa.erstellt_am, e.wildart_name
      FROM shot_analysis sa
      JOIN eintraege e ON sa.eintrag_id = e.id
    `;

    let params: any[] = [];
    if (userId) {
      query += ' WHERE e.user_id = ?';
      params = [userId];
    }

    query += ' ORDER BY sa.erstellt_am DESC LIMIT 50';

    const result = db.exec(query, params);

    if (result.length === 0 || result[0].values.length === 0) {
      return NextResponse.json({ analyses: [] });
    }

    const analyses = result[0].values.map((row) => ({
      id: row[0],
      hitZone: row[1],
      confidence: row[2],
      waitTimeOptimal: row[3],
      dogRequired: row[4] === 1,
      createdAt: row[5],
      wildart: row[6],
    }));

    return NextResponse.json({ analyses });
  } catch (error: any) {
    console.error('[API] Get shot analysis history error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden', details: error.message },
      { status: 500 }
    );
  }
}
