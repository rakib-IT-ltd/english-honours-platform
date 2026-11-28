// Exports the database to one JSON file with checksums (a portable, readable backup).
// Usage: pnpm db:export-content [-- --content-only] [--out <file>]
//   default      FULL export: academic content, review history AND student data (accounts, notes...).
//   --content-only  leaves out student data, so the file holds no personal information.
// Needs DATABASE_URL. Read-only: the database is not changed. The file goes to database/backups/
// (git-ignored) unless --out is given. Restore with `pnpm db:restore-content`.
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { buildDocument, chooseTables, parseArgs } from './lib/backup-core.mjs';
import { beginReadSnapshot, readRows, readSchema } from './lib/backup-db.mjs';

try {
  process.loadEnvFile();
} catch {
  // no .env file - rely on the process environment
}

let args;
try {
  args = parseArgs(process.argv.slice(2), ['--out']);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}
const scope = args.flags['--content-only'] ? 'content' : 'full';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await beginReadSnapshot(client);
  const schema = await readSchema(client);
  if (schema.migrations.length === 0) {
    throw new Error('No applied migrations found: is this the right database?');
  }
  const names = chooseTables(schema.tables, schema.edges, scope);
  const tables = [];
  for (const name of names) {
    tables.push({ name, rows: await readRows(client, name, schema.primaryKeys[name]) });
  }
  await client.query('COMMIT');

  const doc = buildDocument({
    scope,
    migrations: schema.migrations,
    tables,
    exportedAt: new Date().toISOString(),
  });

  const backupsDir = fileURLToPath(new URL('../../../database/backups/', import.meta.url));
  const stamp = doc.exportedAt.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const out = args.flags['--out']
    ? resolve(String(args.flags['--out']))
    : `${backupsDir}ehp-export-${scope}-${stamp}.json`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(doc, null, 1), { mode: 0o600 });
  chmodSync(out, 0o600);

  for (const table of doc.tables) console.log(`  ${table.name}: ${table.rowCount}`);
  console.log(`Export written to ${out}`);
  console.log(`Scope: ${scope}. Checksum: ${doc.checksum}`);
  if (doc.containsPersonalData) {
    console.log(
      "This file contains students' personal data (emails, notes). Keep it private; never commit or share it.",
    );
  }
} catch (error) {
  console.error('Export failed:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
