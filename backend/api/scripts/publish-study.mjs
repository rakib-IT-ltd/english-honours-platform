// Publishes the DRAFT study sections of one book after an academic reviewer has approved them.
// Usage: pnpm db:publish-study -- "<book title>" --reviewed-by "<reviewer name>" [--course 311111]
// Content workflow: Draft -> Academic Review -> Approval -> Publication. Nothing is published
// unless a reviewer's name is given; it is printed so it can be recorded in the change log.
import pg from 'pg';

try {
  process.loadEnvFile();
} catch {
  // no .env file - rely on the process environment
}
const args = process.argv.slice(2).filter((a) => a !== '--');
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : (args[i + 1] ?? null);
};
const reviewer = flag('--reviewed-by');
const course = flag('--course');
const title = args.find((a, i) => !a.startsWith('--') && !String(args[i - 1]).startsWith('--'));
if (!process.env.DATABASE_URL || !title || !reviewer?.trim()) {
  console.error(
    'Usage: pnpm db:publish-study -- "<book title>" --reviewed-by "<reviewer name>" [--course 311111]\n' +
      '(DATABASE_URL must be set. A reviewer name is required: nothing is published unreviewed.)',
  );
  process.exit(1);
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows: books } = await client.query(
    `SELECT b.id, b."titleEn", c.code FROM "Book" b JOIN "Course" c ON c.id = b."courseId"
     WHERE b."titleEn" IN ($1, $2) AND ($3::text IS NULL OR c.code = $3)`,
    [title, `'${title}'`, course],
  );
  if (books.length !== 1) {
    throw new Error(
      `Expected exactly one book matching "${title}", found ${books.length}. Use --course to narrow it.`,
    );
  }
  const result = await client.query(
    `UPDATE "BookSection" SET "publicationStatus" = 'PUBLISHED', "updatedAt" = now()
     WHERE "bookId" = $1 AND "publicationStatus" <> 'PUBLISHED'`,
    [books[0].id],
  );
  console.log(
    `Published ${result.rowCount} section(s) of ${books[0].titleEn} (${books[0].code}); reviewed by ${reviewer.trim()} on ${new Date().toISOString().slice(0, 10)}.`,
  );
} catch (error) {
  console.error('Publish failed:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
