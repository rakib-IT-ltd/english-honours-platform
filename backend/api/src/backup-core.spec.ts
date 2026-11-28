import { describe, expect, it } from 'vitest';
import {
  buildDocument,
  canonicalJson,
  chooseTables,
  confirmationError,
  databaseName,
  migrationMismatch,
  parseArgs,
  PERSONAL_TABLES,
  quoteIdent,
  sameExceptTimestamps,
  sortTables,
  verifyDocument,
} from '../scripts/lib/backup-core.mjs';

const edges = [
  { table: 'Department', references: 'University' },
  { table: 'Book', references: 'Course' },
  { table: 'Course', references: 'Syllabus' },
  { table: 'Syllabus', references: 'University' },
  { table: 'StudentProfile', references: 'User' },
  { table: 'StudentProfile', references: 'University' },
  { table: 'StudyItem', references: 'StudyItem' },
];
const all = [
  'Book',
  'Course',
  'Department',
  'StudentProfile',
  'StudyItem',
  'Syllabus',
  'University',
  'User',
];

describe('sortTables', () => {
  it('puts every table after the tables it references', () => {
    const order = sortTables(all, edges);
    for (const { table, references } of edges) {
      if (table !== references) {
        expect(order.indexOf(references)).toBeLessThan(order.indexOf(table));
      }
    }
    expect(order).toHaveLength(all.length);
  });

  it('allows a table that references itself', () => {
    expect(sortTables(['StudyItem'], [{ table: 'StudyItem', references: 'StudyItem' }])).toEqual([
      'StudyItem',
    ]);
  });

  it('refuses circular references', () => {
    expect(() =>
      sortTables(
        ['A', 'B'],
        [
          { table: 'A', references: 'B' },
          { table: 'B', references: 'A' },
        ],
      ),
    ).toThrow(/Circular/);
  });
});

describe('chooseTables', () => {
  it('a full export keeps every table', () => {
    expect(chooseTables(all, edges, 'full')).toHaveLength(all.length);
  });

  it('a content-only export leaves out student tables', () => {
    const noStudents = all.filter((name) => name !== 'StudentProfile');
    const chosen = chooseTables(noStudents, edges.slice(0, 4), 'content');
    for (const personal of PERSONAL_TABLES) expect(chosen).not.toContain(personal);
    expect(chosen).toContain('Book');
  });

  it('refuses a content-only export when content refers to a student table', () => {
    expect(() =>
      chooseTables(['Revision', 'User'], [{ table: 'Revision', references: 'User' }], 'content'),
    ).toThrow(/full export/);
  });

  it('rejects an unknown scope', () => {
    expect(() => chooseTables(all, edges, 'everything' as never)).toThrow(/Unknown scope/);
  });
});

describe('export document', () => {
  const doc = () =>
    buildDocument({
      scope: 'content',
      migrations: ['20261120213500_academic_structure'],
      tables: [
        { name: 'University', rows: [{ id: 'a', code: 'nu', nameEn: 'National University' }] },
        { name: 'Department', rows: [] },
      ],
      exportedAt: '2026-11-27T10:00:00.000Z',
    });

  it('verifies when untouched', () => {
    expect(() => verifyDocument(JSON.parse(JSON.stringify(doc())))).not.toThrow();
  });

  it('checksums do not depend on key order', () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 1, c: 2 }] })).toBe(
      canonicalJson({ a: [2, { c: 2, d: 1 }], b: 1 }),
    );
  });

  it('detects a changed row', () => {
    const copy = JSON.parse(JSON.stringify(doc()));
    copy.tables[0].rows[0].nameEn = 'Changed';
    expect(() => verifyDocument(copy)).toThrow(/checksum mismatch/);
  });

  it('detects a removed row', () => {
    const copy = JSON.parse(JSON.stringify(doc()));
    copy.tables[0].rows = [];
    expect(() => verifyDocument(copy)).toThrow(/row count/);
  });

  it('detects a changed migration list or table list', () => {
    const copy = JSON.parse(JSON.stringify(doc()));
    copy.migrations.push('x');
    expect(() => verifyDocument(copy)).toThrow(/checksum/);
    const other = JSON.parse(JSON.stringify(doc()));
    other.tables.pop();
    expect(() => verifyDocument(other)).toThrow(/checksum/);
  });

  it('rejects files that are not exports', () => {
    expect(() => verifyDocument({ hello: 'world' })).toThrow(/not an English Honours export/);
    expect(() => verifyDocument(null)).toThrow();
  });

  it('marks full exports as containing personal data', () => {
    const full = buildDocument({ scope: 'full', migrations: [], tables: [], exportedAt: 'x' });
    expect(full.containsPersonalData).toBe(true);
    expect(doc().containsPersonalData).toBe(false);
  });
});

describe('restore safety', () => {
  it('reads the database name from a connection URL', () => {
    expect(databaseName('postgresql://u:p@host:5432/ehp_scratch?sslmode=require')).toBe(
      'ehp_scratch',
    );
  });

  it('reads the name from URLs without a host or without a database', () => {
    expect(databaseName('postgresql://u@/ehp_b?host=/tmp&port=5432')).toBe('ehp_b');
    expect(databaseName('postgres://u:p%40ss@host/neondb')).toBe('neondb');
    expect(databaseName('postgresql://u:p@host:5432')).toBe('');
  });

  it('requires the target database name to be typed', () => {
    expect(confirmationError('ehp', undefined)).toMatch(/--confirm-database ehp/);
    expect(confirmationError('ehp', true)).toMatch(/--confirm-database ehp/);
    expect(confirmationError('ehp', 'other')).toMatch(/does not match/);
    expect(confirmationError('ehp', 'ehp')).toBeNull();
  });

  it('requires identical migrations', () => {
    expect(migrationMismatch(['a', 'b'], ['a', 'b'])).toBeNull();
    expect(migrationMismatch(['a', 'b'], ['a'])).toMatch(/missing: b/);
    expect(migrationMismatch(['a'], ['a', 'c'])).toMatch(/newer migrations: c/);
  });

  it('quotes identifiers', () => {
    expect(quoteIdent('User')).toBe('"User"');
    expect(quoteIdent('a"b')).toBe('"a""b"');
  });
});

describe('sameExceptTimestamps', () => {
  it('ignores createdAt and updatedAt only', () => {
    const a = [{ id: '1', code: 'X', createdAt: '2026-01-01', updatedAt: '2026-01-01' }];
    const b = [{ id: '1', code: 'X', createdAt: '2026-02-02', updatedAt: '2026-03-03' }];
    expect(sameExceptTimestamps(a, b)).toBe(true);
    expect(sameExceptTimestamps(a, [{ ...b[0], code: 'Y' }])).toBe(false);
    expect(sameExceptTimestamps(a, [])).toBe(false);
  });
});

describe('parseArgs', () => {
  it('reads flags with and without values and positional arguments', () => {
    const { flags, positional } = parseArgs(
      ['file.json', '--confirm-database', 'ehp', '--replace'],
      ['--confirm-database'],
    );
    expect(positional).toEqual(['file.json']);
    expect(flags['--confirm-database']).toBe('ehp');
    expect(flags['--replace']).toBe(true);
  });

  it('refuses a value flag without a value', () => {
    expect(() => parseArgs(['--out'], ['--out'])).toThrow(/needs a value/);
  });
});
