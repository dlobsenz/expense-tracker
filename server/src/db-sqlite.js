import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create SQLite database file
const db = new Database(join(__dirname, '../expense_tracker.db'));

// Create expenses table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export async function query(text, params = []) {
  try {
    // Convert PostgreSQL syntax to SQLite
    let sqliteQuery = text
      .replace(/\$(\d+)/g, '?')  // Replace $1, $2, etc. with ?
      .replace(/RETURNING \*/g, '')  // Remove RETURNING clause
      .replace(/date_trunc\('month', expense_date\) = date_trunc\('month', CURRENT_DATE\)/g, 
               "strftime('%Y-%m', expense_date) = strftime('%Y-%m', 'now')")
      .replace(/CURRENT_DATE/g, "date('now')")
      .replace(/COALESCE/g, 'IFNULL');

    if (text.includes('INSERT')) {
      const stmt = db.prepare(sqliteQuery);
      const result = stmt.run(...params);
      // Simulate PostgreSQL RETURNING behavior
      const insertedRow = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
      return { rows: [insertedRow], rowCount: result.changes };
    } else if (text.includes('DELETE')) {
      const stmt = db.prepare(sqliteQuery);
      const result = stmt.run(...params);
      return { rowCount: result.changes };
    } else {
      const stmt = db.prepare(sqliteQuery);
      const rows = stmt.all(...params);
      return { rows };
    }
  } catch (error) {
    console.error("SQLite query error:", error);
    throw error;
  }
}
