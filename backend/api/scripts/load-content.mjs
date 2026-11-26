// Loads reviewed academic content (database/prisma/content/*.sql) into the database.
// Usage: pnpm db:load-content   (needs DATABASE_URL; the universities must already exist)
// Each file states its own source and verification status. Safe to run repeatedly.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

try {
  process.loadEnvFile();
} catch {
  // no .env file - rely on the process environment
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

// `--sample` loads the clearly labelled DEVELOPMENT sample material instead (never in production).
const sample = process.argv.includes('--sample');
if (sample && process.env.NODE_ENV === 'production') {
  console.error('Sample material must never be loaded in production.');
  process.exit(1);
}
const dir = fileURLToPath(
  new URL(
    sample ? '../../../database/prisma/dev-samples/' : '../../../database/prisma/content/',
    import.meta.url,
  ),
);
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.sql'))
  .sort();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  for (const name of files) {
    await client.query('BEGIN');
    try {
      await client.query(readFileSync(dir + name, 'utf8'));
      await client.query('COMMIT');
      console.log(`Loaded ${name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`${name}: ${error.message}`);
    }
  }
  const { rows } = await client.query(
    'SELECT (SELECT count(*) FROM "Syllabus") AS syllabuses, (SELECT count(*) FROM "Course") AS courses',
  );
  console.log(
    `Done: ${rows[0].syllabuses} syllabus versions, ${rows[0].courses} courses in total.`,
  );
} catch (error) {
  console.error('Load failed:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
