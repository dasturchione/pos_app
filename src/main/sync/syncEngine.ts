import type { PosDatabase } from '../db/database';
import { listPendingOutbox, markOutboxSynced } from '../db/outbox';

export interface SyncEngineOptions {
  baseUrl: string;
  authSecret: string;
}

export async function flushOutboxToServer(
  db: PosDatabase,
  opts: SyncEngineOptions,
): Promise<{ ok: boolean; error?: string }> {
  const pending = listPendingOutbox(db, 50);
  if (pending.length === 0) return { ok: true };

  try {
    const res = await fetch(`${opts.baseUrl.replace(/\/$/, '')}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PosApp-Auth': opts.authSecret,
      },
      body: JSON.stringify({ items: pending.map((p) => ({ id: p.id, payload: p.payload })) }),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { acceptedIds?: number[] };
    const ids = data.acceptedIds ?? pending.map((p) => p.id);
    markOutboxSynced(db, ids);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
