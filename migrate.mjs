/**
 * migrate.mjs — Run all SQL files in /migrations in order.
 *
 * Usage:
 *   node migrate.mjs
 *
 * It tracks which migrations have already been applied in a
 * `_migrations` bookkeeping table so it is safe to run repeatedly.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env manually (no dotenv dependency needed) ────────────────────────
const envText = readFileSync('.env', 'utf8');
for (const line of envText.split('\n')) {
  const eqIdx = line.indexOf('=');
  if (eqIdx === -1) continue;
  const key = line.slice(0, eqIdx).trim();
  const val = line.slice(eqIdx + 1).trim();
  if (key && !process.env[key]) process.env[key] = val;
}

// ── DB setup ─────────────────────────────────────────────────────────────────
import ws from 'ws';
import { Pool, neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Bookkeeping table ─────────────────────────────────────────────────────────
await pool.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id         SERIAL      PRIMARY KEY,
    filename   TEXT        NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── Discover migration files ──────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dir, 'migrations');

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();  // lexicographic — 001_ before 002_ etc.

// ── Applied set ───────────────────────────────────────────────────────────────
const { rows: applied } = await pool.query(`SELECT filename FROM _migrations`);
const appliedSet = new Set(applied.map((r) => r.filename));

// ── Run pending migrations ────────────────────────────────────────────────────
let ran = 0;
for (const file of files) {
  if (appliedSet.has(file)) {
    console.log(`  ⏭  ${file} (already applied)`);
    continue;
  }

  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  console.log(`  ▶  Running ${file} …`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file]);
    await client.query('COMMIT');
    console.log(`  ✅ ${file} applied`);
    ran++;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  ❌ ${file} FAILED:`, err.message);
    await client.end();
    await pool.end();
    process.exit(1);
  } finally {
    client.release();
  }
}

if (ran === 0) {
  console.log('\nNothing to migrate — database is up to date.');
} else {
  console.log(`\nDone — ${ran} migration(s) applied.`);
}

await pool.end();
