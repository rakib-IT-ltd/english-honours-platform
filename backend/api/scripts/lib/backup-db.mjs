// Database access shared by `db:export-content` and `db:restore-content`.
import { canonicalJson, quoteIdent } from './backup-core.mjs';

/** Reads table names, foreign keys, primary keys and applied migrations from the catalogue. */
export async function readSchema(client) {
  const tables = (
    await client.query(
      `SELECT c.relname AS name
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname <> '_prisma_migrations'
        ORDER BY c.relname`,
    )
  ).rows.map((row) => row.name);

  const edges = (
    await client.query(
      `SELECT cl.relname AS "table", rf.relname AS "references"
         FROM pg_constraint con
         JOIN pg_class cl ON cl.oid = con.conrelid
         JOIN pg_class rf ON rf.oid = con.confrelid
         JOIN pg_namespace n ON n.oid = cl.relnamespace
        WHERE con.contype = 'f' AND n.nspname = 'public'`,
    )
  ).rows;

  const primaryKeys = {};
  for (const name of tables) {
    const { rows } = await client.query(
      `SELECT a.attname AS column
         FROM pg_index i
         JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary
        ORDER BY array_position(i.indkey::int2[], a.attnum)`,
      [`public.${quoteIdent(name)}`],
    );
    primaryKeys[name] = rows.map((row) => row.column);
  }

  const hasMigrations = (await client.query(`SELECT to_regclass('public._prisma_migrations') AS t`))
    .rows[0].t;
  const migrations = hasMigrations
    ? (
        await client.query(
          `SELECT migration_name FROM _prisma_migrations
            WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
            ORDER BY migration_name`,
        )
      ).rows.map((row) => row.migration_name)
    : [];

  return { tables, edges, primaryKeys, migrations };
}

/**
 * All rows of one table as JSON objects, in a deterministic order (by primary key, compared in
 * JavaScript so that database collation cannot change the order between two databases).
 */
export async function readRows(client, name, primaryKey) {
  const { rows } = await client.query(`SELECT to_jsonb(t) AS row FROM ${quoteIdent(name)} t`);
  const list = rows.map((row) => row.row);
  const key = (row) =>
    canonicalJson(primaryKey.length ? primaryKey.map((column) => row[column]) : row);
  return list.sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/** Opens a transaction with a stable snapshot and a fixed time zone, so exports are comparable. */
export async function beginReadSnapshot(client) {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  await client.query(`SET LOCAL TIME ZONE 'UTC'`);
}
