/**
 * Sync API - Push/Pull Synchronization
 */
import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, now } from '@/lib/database';

// Push lokale Änderungen zum Server
export async function POST(request: NextRequest) {
  try {
    const { changes, action } = await request.json();

    if (action === 'push') {
      // Änderungen verarbeiten
      const db = await initDatabase();
      const processed = [];
      const errors = [];

      for (const change of changes) {
        try {
          const { action, table_name, record_id, payload } = change;

          if (action === 'create' || action === 'update') {
            const columns = Object.keys(payload);
            const placeholders = columns.map(() => '?').join(', ');
            const values = columns.map((col) => payload[col]);

            db.run(
              `INSERT OR REPLACE INTO ${table_name} (${columns.join(', ')}) VALUES (${placeholders})`,
              values
            );
          } else if (action === 'delete') {
            db.run(`UPDATE ${table_name} SET geloescht_am = ? WHERE id = ?`, [now(), record_id]);
          }

          processed.push(change.id);
        } catch (error: any) {
          errors.push({ id: change.id, error: error.message });
        }
      }

      return NextResponse.json({
        success: true,
        processed: processed.length,
        errors,
      });
    }

    if (action === 'pull') {
      // Server-Änderungen seit lastSyncTimestamp
      const { lastSyncTimestamp } = await request.json();
      const db = await initDatabase();

      // Alle geänderten Einträge seit letztem Sync
      const tables = ['eintraege', 'shot_analysis', 'map_features', 'tracking_data', 'medien'];
      const allChanges = [];

      for (const table of tables) {
        const result = db.exec(
          `SELECT * FROM ${table} WHERE aktualisiert_am > ? OR erstellt_am > ?`,
          [lastSyncTimestamp || '1970-01-01', lastSyncTimestamp || '1970-01-01']
        );

        if (result.length > 0 && result[0].values.length > 0) {
          const columns = result[0].columns;
          
          result[0].values.forEach((row) => {
            const record: any = {};
            columns.forEach((col, idx) => {
              record[col] = row[idx];
            });

            allChanges.push({
              action: 'update',
              table_name: table,
              record_id: record.id,
              payload: record,
            });
          });
        }
      }

      return NextResponse.json({
        success: true,
        changes: allChanges,
        timestamp: now(),
      });
    }

    return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 });
  } catch (error: any) {
    console.error('[API] Sync error:', error);
    return NextResponse.json(
      { error: 'Sync fehlgeschlagen', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    const db = await initDatabase();
    const tables = ['eintraege', 'shot_analysis', 'map_features', 'tracking_data'];
    const changes = [];

    for (const table of tables) {
      let query = `SELECT * FROM ${table}`;
      const params: any[] = [];

      if (since) {
        query += ' WHERE aktualisiert_am > ? OR erstellt_am > ?';
        params.push(since, since);
      }

      query += ' ORDER BY erstellt_am DESC LIMIT 100';

      const result = db.exec(query, params);

      if (result.length > 0 && result[0].values.length > 0) {
        const columns = result[0].columns;
        
        result[0].values.forEach((row) => {
          const record: any = {};
          columns.forEach((col, idx) => {
            record[col] = row[idx];
          });

          changes.push({
            action: 'update',
            table_name: table,
            record_id: record.id,
            payload: record,
          });
        });
      }
    }

    return NextResponse.json({
      changes,
      timestamp: now(),
    });
  } catch (error: any) {
    console.error('[API] Sync GET error:', error);
    return NextResponse.json(
      { error: 'Sync fehlgeschlagen', details: error.message },
      { status: 500 }
    );
  }
}
