// Restores an export made by `pnpm db:export-content` into a database, and verifies the result.
// Usage: pnpm db:restore-content -- <file.json> --confirm-database <name> [--replace]
//   The target database must already have the same migrations applied (pnpm db:migrate:deploy).
//   Without --replace every table in the file must be empty in the target (or already identical).
//   --replace first empties the tables that are in the file (it refuses if other tables still
//   depend on them, for example when restoring a content-only file over a database with students).
//   --confirm-database must be the target database's name: restoring overwrites data.
// Everything happens in ONE transaction: if any check fails, nothing is changed.
import { readFileSync } from 'node:fs';
import pg from 'pg';
import {
  confirmationError,
  databaseName,
  migrationMismatch,
  parseArgs,
  quoteIdent,
  rowsChecksum,
  sameExceptTimestamps,
  sortTables,
  verifyDocument,
} from './lib/backup-core.mjs';
import { readRows, readSchema } from './lib/backup-db.mjs';

try {
  process.loadEnvFile();
} catch {
  // no .env file - rely on the process environment
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

let args;
try {
  args = parseArgs(process.argv.slice(2), ['--confirm-database']);
} catch (error) {
  fail(error.message);
}
const [file] = args.positional;
if (!file)
  fail('Usage: pnpm db:restore-content -- <file.json> --confirm-database <name> [--replace]');
if (!process.env.DATABASE_URL)
  fail('DATABASE_URL is not set (it must point at the TARGET database).');

const target = databaseName(process.env.DATABASE_URL);
const confirmProblem = confirmationError(target, args.flags['--confirm-database']);
if (confirmProblem) fail(confirmProblem);

let doc;
try {
  doc = verifyDocument(JSON.parse(readFileSync(file, 'utf8')));
} catch (error) {
  fail(`Cannot use ${file}: ${error.message}`);
}
const replace = args.flags['--replace'] === true;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(`SET LOCAL TIME ZONE 'UTC'`);

  const schema = await readSchema(client);
  const mismatch = migrationMismatch(doc.migrations, schema.migrations);
  if (mismatch) throw new Error(mismatch);

  const names = doc.tables.map((table) => table.name);
  const unknown = names.filter((name) => !schema.tables.includes(name));
  if (unknown.length) throw new Error(`The target has no table: ${unknown.join(', ')}`);
  const order = sortTables(names, schema.edges);

  // 1. Make room (or prove the target is ready). A freshly migrated database already holds some
  //    reference rows (the shared academic levels, stamped with the migration's own time):
  //    - identical to the file: left alone;
  //    - identical except the createdAt/updatedAt stamps: replaced by the file's rows;
  //    - anything else: refused, unless --replace is given.
  const byName = new Map(doc.tables.map((table) => [table.name, table]));
  const alreadyThere = new Set();
  const refresh = new Set();
  const nonEmpty = [];
  for (const name of names) {
    const rows = await readRows(client, name, schema.primaryKeys[name]);
    if (rows.length === 0) continue;
    const expected = byName.get(name);
    if (rows.length === expected.rowCount && rowsChecksum(rows) === expected.sha256) {
      alreadyThere.add(name);
    } else if (sameExceptTimestamps(rows, expected.rows)) {
      refresh.add(name);
    } else {
      nonEmpty.push(`${name} (${rows.length})`);
    }
  }
  if (nonEmpty.length && !replace) {
    throw new Error(
      `The target already has different data: ${nonEmpty.join(', ')}. Restore into an empty, freshly migrated database, or add --replace to overwrite.`,
    );
  }
  if (nonEmpty.length) {
    // No CASCADE: PostgreSQL refuses if a table outside the file still refers to these tables.
    await client.query(`TRUNCATE ${order.map(quoteIdent).join(', ')}`);
    alreadyThere.clear();
    refresh.clear();
  }
  // Children first, so that a refreshed parent table is not blocked by its own children.
  for (const name of [...order].reverse()) {
    if (refresh.has(name)) await client.query(`DELETE FROM ${quoteIdent(name)}`);
  }

  // 2. Insert in foreign-key order. The server converts the JSON rows to the real column types.
  for (const name of order) {
    const table = byName.get(name);
    if (table.rows.length === 0 || alreadyThere.has(name)) continue;
    await client.query(
      `INSERT INTO ${quoteIdent(name)} SELECT * FROM jsonb_populate_recordset(null::${quoteIdent(name)}, $1::jsonb)`,
      [JSON.stringify(table.rows)],
    );
  }

  // 3. Verify: read everything back and compare with the checksums in the file.
  const problems = [];
  for (const name of order) {
    const table = byName.get(name);
    const rows = await readRows(client, name, schema.primaryKeys[name]);
    if (rows.length !== table.rowCount) {
      problems.push(`${name}: ${rows.length} rows restored, ${table.rowCount} expected`);
    } else if (rowsChecksum(rows) !== table.sha256) {
      problems.push(`${name}: restored data differs from the file`);
    }
  }
  if (problems.length)
    throw new Error(`Verification failed - nothing was changed.\n  ${problems.join('\n  ')}`);

  await client.query('COMMIT');
  for (const name of order) console.log(`  ${name}: ${byName.get(name).rowCount}`);
  console.log(
    `Restored ${names.length} tables into "${target}" and verified every table against its checksum.`,
  );
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  console.error('Restore failed:', error.message);
  if (/cannot truncate a table referenced/.test(error.message)) {
    console.error(
      "Other tables (for example students' data) still depend on these tables, so nothing was overwritten.\n" +
        'Restore a FULL export instead, or restore into an empty, freshly migrated database.',
    );
  }
  process.exitCode = 1;
} finally {
  await client.end();
}
