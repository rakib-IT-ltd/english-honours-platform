import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, root)));
const sql = read(
  'database/prisma/content/nu-english-honours-2024-2025.year2-official.sql',
).toString('utf8');
const code = sql
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');
const courseRows = [
  ...code.matchAll(/^\s+\('(82\d{5})', '[^']+', (\d), (\d+), (\d+|NULL), (\d+)\)/gm),
];

describe('NU English Honours Second Year 2024-2025 (official) content file', () => {
  it('has the 10 papers printed in the table: 850 marks and 34 credits', () => {
    expect(courseRows).toHaveLength(10);
    expect(courseRows.reduce((sum, row) => sum + Number(row[2]), 0)).toBe(34);
    expect(courseRows.reduce((sum, row) => sum + Number(row[3]), 0)).toBe(850);
  });

  it('attaches the stored official PDF, whose SHA-256 matches', () => {
    const pdf = read(
      'academic-content/syllabus/national-university/2024-2025/english-honours/honours-2nd-year/english-honours-second-year-syllabus-2024-25.pdf',
    );
    const hash = createHash('sha256').update(pdf).digest('hex');
    expect(sql).toContain(hash);
    expect(code).toContain("'OFFICIAL_UNIVERSITY_DOCUMENT'");
  });

  it('runs after year 1 and before the verification file', () => {
    const names = [
      'nu-english-honours-2024-2025.unpublish.sql',
      'nu-english-honours-2024-2025.year1-official.sql',
      'nu-english-honours-2024-2025.year2-official.sql',
      'nu-english-honours-2024-2025.zz-verification.sql',
    ];
    expect([...names].sort()).toEqual(names);
  });
});

describe('NU English Honours verification file', () => {
  const verification = read(
    'database/prisma/content/nu-english-honours-2024-2025.zz-verification.sql',
  ).toString('utf8');

  it('only verifies current syllabuses that have an official source', () => {
    expect(verification).toContain('OFFICIAL_UNIVERSITY_DOCUMENT');
    expect(verification).toContain('sy."isCurrent"');
    expect(verification).toContain('INSERT INTO "SyllabusVerification"');
  });
});
