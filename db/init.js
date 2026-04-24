import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'tea-mood.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tea_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tea_name    TEXT    NOT NULL,
    mood        TEXT    NOT NULL,
    rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    notes       TEXT,
    weather     TEXT,
    temperature REAL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
