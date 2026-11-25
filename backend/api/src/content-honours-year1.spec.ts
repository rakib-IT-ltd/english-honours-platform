import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, root)));
const sql = read(
  'database/prisma/content/nu-english-honours-2024-2025.year1-official.sql',
).toString('utf8');
const code = sql
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');
const courseRows = [
  ...code.matchAll(
    /^\s+\('(21\d{4})', '[^']+', (?:NULL|'[^']+'), (\d), (\d+), (\d+|NULL), (\d+)\)/gm,
  ),
];

describe('NU English Honours First Year 2024-2025 (official) content file', () => {
  it('has the 10 official courses; one of three electives makes 28 credits / 700 marks', () => {
    expect(courseRows).toHaveLength(10);
    const electives = ['211009', '212009', '211909'];
    const counted = courseRows.filter(
      (row) => !electives.includes(String(row[1])) || row[1] === '212009',
    );
    expect(counted.reduce((sum, row) => sum + Number(row[2]), 0)).toBe(28);
    expect(counted.reduce((sum, row) => sum + Number(row[3]), 0)).toBe(700);
  });

  it('attaches the stored official PDF, whose SHA-256 matches', () => {
    const pdf = read(
      'academic-content/syllabus/national-university/2024-2025/english-honours/honours-1st-year/english-honours-first-year-syllabus-2024-25.pdf',
    );
    const hash = createHash('sha256').update(pdf).digest('hex');
    expect(sql).toContain(hash);
    expect(code).toContain("'OFFICIAL_UNIVERSITY_DOCUMENT'");
  });

  it('never marks anything verified and runs after the unpublish file', () => {
    expect(code).not.toContain("'VERIFIED'");
    const names = [
      'nu-english-honours-2024-2025.sql',
      'nu-english-honours-2024-2025.unpublish.sql',
      'nu-english-honours-2024-2025.year1-official.sql',
    ];
    expect([...names].sort()).toEqual(names);
  });
});
