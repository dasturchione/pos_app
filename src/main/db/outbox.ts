import type { PosDatabase } from './database';

export interface OutboxRow {
  id: number;
  payload: string;
  created_at: string;
  synced: number;
}

export function enqueueOutbox(db: PosDatabase, payload: object): number {
  const payloadJson = JSON.stringify(payload);
  const result = db.prepare('INSERT INTO outbox (payload, synced) VALUES (?, 0)').run(payloadJson);
  return Number(result.lastInsertRowid);
}

export function listPendingOutbox(db: PosDatabase, limit = 100): OutboxRow[] {
  return db
    .prepare(
      'SELECT id, payload, created_at, synced FROM outbox WHERE synced = 0 ORDER BY id ASC LIMIT ?',
    )
    .all(limit) as OutboxRow[];
}

export function markOutboxSynced(db: PosDatabase, ids: number[]): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE outbox SET synced = 1 WHERE id IN (${placeholders})`).run(...ids);
}
