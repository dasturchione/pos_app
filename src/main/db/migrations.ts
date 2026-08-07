import type Database from 'better-sqlite3';

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  synced INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function migrate(db: Database.Database): void {
  db.exec(INIT_SQL);
  const exists = db.prepare('SELECT 1 FROM schema_migrations WHERE name = ?').get('v1');
  if (!exists) {
    db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run('v1');
  }
}
