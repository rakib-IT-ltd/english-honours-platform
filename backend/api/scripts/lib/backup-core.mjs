// Pure helpers for `db:export-content` and `db:restore-content` (no database access here, so they
// can be unit-tested). The documents they build are described in docs/BACKUP_AND_RESTORE.md.
import { createHash } from 'node:crypto';

export const EXPORT_FORMAT = 'ehp-export';
export const EXPORT_FORMAT_VERSION = 1;

/**
 * Tables that hold students' own data (accounts, bookmarks, notes, progress). A `--content-only`
 * export leaves them out. Every other table is treated as academic content or its audit trail.
 */
export const PERSONAL_TABLES = [
  'User',
  'StudentProfile',
  'Bookmark',
  'StudyNote',
  'SectionProgress',
];

/** Stable JSON: object keys sorted, so the same data always gives the same text and checksum. */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

export function rowsChecksum(rows) {
  return sha256(canonicalJson(rows));
}

/** True when two lists of rows are equal except for the createdAt/updatedAt stamps. */
export function sameExceptTimestamps(rowsA, rowsB) {
  const strip = (rows) =>
    rows.map((row) => {
      const { createdAt: _created, updatedAt: _updated, ...rest } = row;
      return rest;
    });
  return rowsChecksum(strip(rowsA)) === rowsChecksum(strip(rowsB));
}

/**
 * Orders tables so that a table comes after every table it references.
 * `edges` is a list of `{ table, references }` (foreign keys). A table referencing itself is fine.
 * Throws when two tables reference each other (not supported, and the schema has none).
 */
export function sortTables(tables, edges) {
  const wanted = new Set(tables);
  const dependsOn = new Map(tables.map((name) => [name, new Set()]));
  for (const { table, references } of edges) {
    if (table !== references && wanted.has(table) && wanted.has(references)) {
      dependsOn.get(table).add(references);
    }
  }
  const sorted = [];
  const remaining = new Set(tables);
  while (remaining.size > 0) {
    const ready = [...remaining]
      .filter((name) => [...dependsOn.get(name)].every((dep) => !remaining.has(dep)))
      .sort();
    if (ready.length === 0) {
      throw new Error(`Circular foreign keys between: ${[...remaining].sort().join(', ')}`);
    }
    for (const name of ready) {
      sorted.push(name);
      remaining.delete(name);
    }
  }
  return sorted;
}

/**
 * Chooses the tables to export. For `content` scope the personal tables are left out; the export
 * is refused if a table that stays in refers to one that was left out (it could not be restored).
 */
export function chooseTables(allTables, edges, scope) {
  if (scope !== 'full' && scope !== 'content') throw new Error(`Unknown scope: ${scope}`);
  const excluded = scope === 'content' ? new Set(PERSONAL_TABLES) : new Set();
  const included = allTables.filter((name) => !excluded.has(name));
  for (const { table, references } of edges) {
    if (included.includes(table) && excluded.has(references)) {
      throw new Error(
        `Table "${table}" refers to "${references}", which a content-only export leaves out. ` +
          'Make a full export instead.',
      );
    }
  }
  return sortTables(included, edges);
}

/** Builds the export document and its checksums. */
export function buildDocument({ scope, migrations, tables, exportedAt }) {
  const entries = tables.map(({ name, rows }) => ({
    name,
    rowCount: rows.length,
    sha256: rowsChecksum(rows),
    rows,
  }));
  return {
    format: EXPORT_FORMAT,
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt,
    scope,
    containsPersonalData: scope === 'full',
    migrations,
    tables: entries,
    checksum: documentChecksum(migrations, entries),
  };
}

function documentChecksum(migrations, entries) {
  return sha256(
    canonicalJson({
      migrations,
      tables: entries.map(({ name, rowCount, sha256: hash }) => ({ name, rowCount, hash })),
    }),
  );
}

/** Throws a clear error when the file is not an export of ours or has been changed or damaged. */
export function verifyDocument(doc) {
  if (!doc || doc.format !== EXPORT_FORMAT)
    throw new Error('This is not an English Honours export.');
  if (doc.formatVersion !== EXPORT_FORMAT_VERSION) {
    throw new Error(`Unsupported export format version ${doc.formatVersion}.`);
  }
  if (!Array.isArray(doc.tables) || !Array.isArray(doc.migrations)) {
    throw new Error('The export file is incomplete.');
  }
  for (const table of doc.tables) {
    if (table.rows.length !== table.rowCount) {
      throw new Error(`Table ${table.name}: row count does not match the file.`);
    }
    if (rowsChecksum(table.rows) !== table.sha256) {
      throw new Error(`Table ${table.name}: checksum mismatch (the file was changed or damaged).`);
    }
  }
  if (documentChecksum(doc.migrations, doc.tables) !== doc.checksum) {
    throw new Error('The export file checksum does not match (the file was changed or damaged).');
  }
  return doc;
}

/** Name of the database in a PostgreSQL connection URL ("" when there is none). */
export function databaseName(connectionString) {
  // A regular expression instead of `new URL`: URLs without a host (socket connections) are valid
  // for PostgreSQL but not for the WHATWG URL parser.
  const match = /^postgres(?:ql)?:\/\/[^/?#]*\/([^?#]*)/i.exec(connectionString.trim());
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

/** Double-quotes an SQL identifier. Names come from the catalogue, but quote them anyway. */
export function quoteIdent(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

/**
 * Restoring replaces data, so the person must type the name of the target database.
 * Returns an error message, or null when the confirmation matches.
 */
export function confirmationError(targetDatabase, confirmed) {
  if (typeof confirmed !== 'string' || confirmed === '') {
    return `Add --confirm-database ${targetDatabase} to confirm that this is the database to restore into.`;
  }
  if (confirmed !== targetDatabase) {
    return `--confirm-database "${confirmed}" does not match the target database "${targetDatabase}".`;
  }
  return null;
}

/** The migrations applied in the file and in the target must be identical. Returns a message or null. */
export function migrationMismatch(fileMigrations, targetMigrations) {
  const missingInTarget = fileMigrations.filter((name) => !targetMigrations.includes(name));
  const extraInTarget = targetMigrations.filter((name) => !fileMigrations.includes(name));
  if (missingInTarget.length === 0 && extraInTarget.length === 0) return null;
  const parts = [];
  if (missingInTarget.length) parts.push(`target is missing: ${missingInTarget.join(', ')}`);
  if (extraInTarget.length) parts.push(`target has newer migrations: ${extraInTarget.join(', ')}`);
  return `The database structure differs from the export (${parts.join('; ')}). Run migrations on the target first (or restore with a matching version of the code).`;
}

/** Minimal flag parser: `--name value` and bare `--flag`. */
export function parseArgs(argv, valueFlags) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      if (valueFlags.includes(arg)) {
        const value = argv[i + 1];
        if (value === undefined || value.startsWith('--')) throw new Error(`${arg} needs a value.`);
        flags[arg] = value;
        i += 1;
      } else {
        flags[arg] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}
