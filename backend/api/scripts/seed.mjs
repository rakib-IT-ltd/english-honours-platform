// Runs database/prisma/seed/universities.sql (development seed, names only).
// Usage: pnpm db:seed   (needs DATABASE_URL; refuses to run in production)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

try {
  process.loadEnvFile();
} catch {
  // no .env file - rely on the process environment
}

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run the development seed with NODE_ENV=production.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = readFileSync(
  fileURLToPath(new URL('../../../database/prisma/seed/universities.sql', import.meta.url)),
  'utf8',
);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query(
    'SELECT (SELECT count(*) FROM "University") AS universities, (SELECT count(*) FROM "AcademicProgram") AS programs',
  );
  console.log(`Seed complete: ${rows[0].universities} universities, ${rows[0].programs} programs.`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
