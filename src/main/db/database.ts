import Database from 'better-sqlite3';
import { runMigrations } from './migrations';

export type PosDatabase = Database.Database;

export function openDatabase(filePath: string): PosDatabase {
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  runMigrations(db);
  return db;
}
