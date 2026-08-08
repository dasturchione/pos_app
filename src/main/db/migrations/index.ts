import type Database from 'better-sqlite3';
import * as initial from './0001_initial';

export interface Migration {
  version: number;
  name: string;
  up(db: Database.Database): void;
}

const migrations: Migration[] = [initial];

export function runMigrations(db: Database.Database): void {
  // Check if old schema_migrations table exists (id INTEGER, name TEXT)
  const oldSchemaExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
    )
    .get();

  if (oldSchemaExists) {
    // Check if it's the old format (has 'id' column)
    const tableInfo = db.pragma('table_info(schema_migrations)') as Array<{
      name: string;
    }>;
    const hasIdColumn = tableInfo.some((col) => col.name === 'id');
    const hasVersionColumn = tableInfo.some((col) => col.name === 'version');

    if (hasIdColumn && !hasVersionColumn) {
      // Old format exists - migrate to new format preserving data
      // Get all existing migration names
      const oldMigrations = db
        .prepare('SELECT id, name FROM schema_migrations ORDER BY id')
        .all() as Array<{ id: number; name: string }>;

      // Drop old table and create new one
      db.exec('DROP TABLE schema_migrations');
      db.exec(`
        CREATE TABLE schema_migrations (
          version INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Insert old migrations with version = id
      const insertStmt = db.prepare(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, datetime(\'now\'))'
      );
      for (const m of oldMigrations) {
        insertStmt.run(m.id);
      }
    }
  } else {
    // Create new schema_migrations table
    db.exec(`
      CREATE TABLE schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  // Get the highest applied version
  const result = db
    .prepare('SELECT MAX(version) as maxVersion FROM schema_migrations')
    .get() as { maxVersion: number | null };
  const appliedVersion = result.maxVersion ?? 0;

  // Apply pending migrations
  for (const migration of migrations) {
    if (migration.version > appliedVersion) {
      db.transaction(() => {
        migration.up(db);
        db.prepare(
          'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, datetime(\'now\'))'
        ).run(migration.version);
      })();
    }
  }
}
