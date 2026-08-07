import Database from 'better-sqlite3';
import { migrate } from './migrations';

export type PosDatabase = Database.Database;

export function openDatabase(filePath: string): PosDatabase {
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  migrate(db);
  return db;
}
