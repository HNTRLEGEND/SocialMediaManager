/**
 * HNTR LEGEND Web - Sync Service
 * Synchronisiert Daten zwischen Web-App, Mobile-App und Backend
 */

import { initDatabase, generateUUID, now } from './database';
import { sync as syncAPI, auth } from './api';

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table_name: string;
  record_id: string;
  payload: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  attempts: number;
  created_at: string;
}

/**
 * Fügt eine Änderung zur Sync-Queue hinzu
 */
export const queueSync = async (
  action: 'create' | 'update' | 'delete',
  tableName: string,
  recordId: string,
  payload: any
): Promise<void> => {
  const db = await initDatabase();

  const queueItem: SyncQueueItem = {
    id: generateUUID(),
    action,
    table_name: tableName,
    record_id: recordId,
    payload: JSON.stringify(payload),
    status: 'pending',
    attempts: 0,
    created_at: now(),
  };

  db.run(
    `INSERT INTO sync_queue (id, action, table_name, record_id, payload, status, attempts, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      queueItem.id,
      queueItem.action,
      queueItem.table_name,
      queueItem.record_id,
      queueItem.payload,
      queueItem.status,
      queueItem.attempts,
      queueItem.created_at,
    ]
  );

  console.log('[Sync] Änderung in Queue:', queueItem);
};

/**
 * Führt Sync mit Backend durch
 */
export const performSync = async (): Promise<{
  success: boolean;
  pushed: number;
  pulled: number;
  errors: string[];
}> => {
  console.log('[Sync] Starte Synchronisation...');

  const db = await initDatabase();
  const errors: string[] = [];
  let pushedCount = 0;
  let pulledCount = 0;

  try {
    // 1. Pending Changes sammeln
    const pendingChanges = db.exec(
      `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC`
    );

    if (pendingChanges.length > 0 && pendingChanges[0].values.length > 0) {
      console.log(`[Sync] ${pendingChanges[0].values.length} Änderungen zum Push`);

      // 2. Push zu Backend
      try {
        const changes = pendingChanges[0].values.map((row: any) => ({
          id: row[0],
          action: row[1],
          table_name: row[2],
          record_id: row[3],
          payload: JSON.parse(row[4]),
        }));

        const pushResult = await syncAPI.push(changes);
        pushedCount = changes.length;

        // Queue-Einträge als completed markieren
        for (const change of changes) {
          db.run(
            `UPDATE sync_queue SET status = 'completed' WHERE id = ?`,
            [change.id]
          );
        }

        console.log('[Sync] Push erfolgreich:', pushedCount);
      } catch (error: any) {
        console.error('[Sync] Push-Fehler:', error);
        errors.push(`Push failed: ${error.message}`);

        // Fehlerhafte Items markieren
        db.run(
          `UPDATE sync_queue 
           SET status = 'failed', attempts = attempts + 1, error_message = ?, last_attempt = ?
           WHERE status = 'pending'`,
          [error.message, now()]
        );
      }
    }

    // 3. Pull vom Backend
    try {
      // Letzten Sync-Timestamp holen
      const lastSyncResult = db.exec(
        `SELECT value FROM settings WHERE key = 'last_sync_timestamp'`
      );
      const lastSync = lastSyncResult[0]?.values[0]?.[0] as string | undefined;

      const pullResult = await syncAPI.pull(lastSync);
      pulledCount = pullResult.changes?.length || 0;

      // Server-Änderungen in lokale DB schreiben
      if (pullResult.changes && pullResult.changes.length > 0) {
        console.log(`[Sync] ${pullResult.changes.length} Änderungen vom Server`);

        for (const change of pullResult.changes) {
          await applyServerChange(db, change);
        }
      }

      // Sync-Timestamp aktualisieren
      const newTimestamp = now();
      db.run(
        `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
        ['last_sync_timestamp', newTimestamp, newTimestamp]
      );

      console.log('[Sync] Pull erfolgreich:', pulledCount);
    } catch (error: any) {
      console.error('[Sync] Pull-Fehler:', error);
      errors.push(`Pull failed: ${error.message}`);
    }

    // 4. Alte completed Queue-Einträge löschen (älter als 7 Tage)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    db.run(
      `DELETE FROM sync_queue WHERE status = 'completed' AND created_at < ?`,
      [sevenDaysAgo]
    );

    console.log('[Sync] Synchronisation abgeschlossen');
    return {
      success: errors.length === 0,
      pushed: pushedCount,
      pulled: pulledCount,
      errors,
    };
  } catch (error: any) {
    console.error('[Sync] Sync-Fehler:', error);
    return {
      success: false,
      pushed: pushedCount,
      pulled: pulledCount,
      errors: [error.message],
    };
  }
};

/**
 * Wendet Server-Änderung auf lokale DB an
 */
const applyServerChange = async (db: any, change: any): Promise<void> => {
  const { action, table_name, record_id, payload } = change;

  try {
    if (action === 'create' || action === 'update') {
      // Insert or Replace
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
  } catch (error) {
    console.error(`[Sync] Fehler beim Anwenden von ${action} auf ${table_name}:`, error);
    throw error;
  }
};

/**
 * Auto-Sync Interval (alle 5 Minuten wenn online)
 */
let syncInterval: NodeJS.Timeout | null = null;

export const startAutoSync = (intervalMs: number = 5 * 60 * 1000): void => {
  if (syncInterval) return;

  console.log('[Sync] Auto-Sync aktiviert (Interval: ${intervalMs}ms)');

  syncInterval = setInterval(async () => {
    if (navigator.onLine && auth.getCurrentUser()) {
      try {
        await performSync();
      } catch (error) {
        console.error('[Sync] Auto-Sync Fehler:', error);
      }
    }
  }, intervalMs);

  // Initial sync
  if (navigator.onLine && auth.getCurrentUser()) {
    performSync().catch(console.error);
  }
};

export const stopAutoSync = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[Sync] Auto-Sync deaktiviert');
  }
};

/**
 * Sync bei Online-Event
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Online - starte Sync');
    if (auth.getCurrentUser()) {
      performSync().catch(console.error);
    }
  });
}
