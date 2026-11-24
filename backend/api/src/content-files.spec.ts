import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  fileURLToPath(
    new URL('../../../database/prisma/content/nu-english-honours-2024-2025.sql', import.meta.url),
  ),
  'utf8',
);
const courseRows = [...sql.matchAll(/^\s+\('(HONOURS_[1-4])', '(\d{6})', '([^']+)', (\d+)\)/gm)];

describe('NU English Honours 2024-2025 content file', () => {
  it('lists 32 courses with unique six-digit codes', () => {
    expect(courseRows).toHaveLength(32);
    expect(new Set(courseRows.map((row) => row[2])).size).toBe(32);
  });

  it('has the expected number of subjects per level', () => {
    const count = (level: string) => courseRows.filter((row) => row[1] === level).length;
    expect([1, 2, 3, 4].map((n) => count(`HONOURS_${n}`))).toEqual([8, 7, 8, 9]);
  });

  it('keeps each code in its own year (second digit of the code = year)', () => {
    for (const row of courseRows) expect(row[2]?.[1]).toBe(row[1]?.slice(-1));
  });

  it('is loaded as UNVERIFIED from a non-official source and never invents credits or marks', () => {
    const code = sql
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('--'))
      .join('\n');
    expect(code).toContain("'UNVERIFIED'");
    expect(code).toContain("'OTHER'");
    expect(code).not.toContain('OFFICIAL_UNIVERSITY_DOCUMENT');
    expect(code).not.toMatch(/"credits"|"marks"/);
  });
});
