import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Delete redundant folder
const typoFolder = path.join(__dirname, 'frontend', 'src', 'app', '(auth');

console.log('--- CLEANUP START ---');

if (fs.existsSync(typoFolder)) {
  try {
    fs.rmSync(typoFolder, { recursive: true, force: true });
    console.log(`[OK] Deleted redundant typo folder: ${typoFolder}`);
  } catch (error) {
    console.error(`[ERROR] Failed to delete typo folder:`, error.message);
  }
} else {
  console.log(`[INFO] Typo folder not found (already deleted): ${typoFolder}`);
}

// 2. Clear Database
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/transitops';
console.log(`[INFO] Connecting to database using: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);

const pool = new Pool({ connectionString });

async function clearDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log('[INFO] Connected to Database.');
    console.log('[INFO] Truncating all tables...');
    await client.query('TRUNCATE TABLE expenses, fuel_logs, maintenance_logs, trips, drivers, vehicles, profiles CASCADE;');
    console.log('[OK] All tables truncated successfully.');
  } catch (error) {
    console.error('[ERROR] Failed to clear database:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
    console.log('--- CLEANUP END ---');
  }
}

clearDatabase();
