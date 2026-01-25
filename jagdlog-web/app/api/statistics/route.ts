/**
 * Statistics API
 */
import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'overview';

    const db = await initDatabase();

    if (type === 'overview') {
      // Gesamt-Statistiken
      const totalHuntsResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'hunt' AND geloescht_am IS NULL`,
        [userId || '']
      );
      const totalHunts = totalHuntsResult[0]?.values[0]?.[0] || 0;

      const successfulResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'harvest' AND geloescht_am IS NULL`,
        [userId || '']
      );
      const successful = successfulResult[0]?.values[0]?.[0] || 0;

      const analysisCountResult = db.exec(
        `SELECT COUNT(*) FROM shot_analysis sa
         JOIN eintraege e ON sa.eintrag_id = e.id
         WHERE e.user_id = ?`,
        [userId || '']
      );
      const analysisCount = analysisCountResult[0]?.values[0]?.[0] || 0;

      const successRate = totalHunts > 0 ? (successful / totalHunts) * 100 : 0;

      return NextResponse.json({
        totalHunts,
        successful,
        successRate: successRate.toFixed(1),
        analysisCount,
        avgSearchTime: 1.7, // Mock - später aus tracking_data berechnen
      });
    }

    if (type === 'hit-zones') {
      // Trefferlagen-Statistik
      const result = db.exec(
        `SELECT 
          hit_zone,
          COUNT(*) as count,
          AVG(confidence) as avg_confidence,
          AVG(wait_time_optimal) / 60.0 as avg_wait_hours
        FROM shot_analysis sa
        JOIN eintraege e ON sa.eintrag_id = e.id
        WHERE e.user_id = ?
        GROUP BY hit_zone
        ORDER BY count DESC`,
        [userId || '']
      );

      if (result.length === 0 || result[0].values.length === 0) {
        return NextResponse.json({ hitZones: [] });
      }

      const hitZones = result[0].values.map((row) => ({
        zone: row[0],
        count: row[1],
        avgConfidence: parseFloat((row[2] as number).toFixed(2)),
        avgWaitTime: parseFloat((row[3] as number).toFixed(1)),
      }));

      return NextResponse.json({ hitZones });
    }

    if (type === 'monthly') {
      // Monatliche Statistik
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      
      const result = db.exec(
        `SELECT 
          strftime('%m', zeitpunkt) as month,
          COUNT(*) as count
        FROM eintraege
        WHERE user_id = ? 
          AND strftime('%Y', zeitpunkt) = ?
          AND typ IN ('hunt', 'harvest')
          AND geloescht_am IS NULL
        GROUP BY month
        ORDER BY month`,
        [userId || '', year.toString()]
      );

      const monthly = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: 0,
      }));

      if (result.length > 0 && result[0].values.length > 0) {
        result[0].values.forEach((row) => {
          const monthIndex = parseInt(row[0] as string) - 1;
          monthly[monthIndex].count = row[1] as number;
        });
      }

      return NextResponse.json({ monthly });
    }

    return NextResponse.json({ error: 'Unbekannter Statistik-Typ' }, { status: 400 });
  } catch (error: any) {
    console.error('[API] Statistics error:', error);
    return NextResponse.json(
      { error: 'Statistik-Fehler', details: error.message },
      { status: 500 }
    );
  }
}
