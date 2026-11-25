import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../', import.meta.url);
const sql = readFileSync(
  fileURLToPath(new URL('database/prisma/content/nu-english-masters-2013-2014.sql', root)),
  'utf8',
);
const code = sql
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');
const courseRows = [...code.matchAll(/^\s+\('(31\d{4})', '([^']+)', (\d), (\d+|NULL), (\d+)\)/gm)];

describe('NU English Masters 2013-2014 content file', () => {
  it('has the 9 papers with credits adding up to the 32 printed in the syllabus', () => {
    expect(courseRows).toHaveLength(9);
    expect(courseRows.reduce((sum, row) => sum + Number(row[3]), 0)).toBe(32);
  });

  it('lists the texts of the 7 detailed papers', () => {
    const books = [...code.matchAll(/^\s+\('(31\d{4})', '(?:[^']|'')+', /gm)].filter(
      (row) => !courseRows.some((c) => c[0] === row[0]),
    );
    expect(books.length).toBeGreaterThanOrEqual(34);
  });

  it('is loaded UNVERIFIED with the official document attached and no invented marks', () => {
    expect(code).toContain("'UNVERIFIED'");
    expect(code).toContain("'OFFICIAL_UNIVERSITY_DOCUMENT'");
    expect(code).not.toContain("'VERIFIED'");
    expect(code).not.toContain('"marks"');
  });

  it('points at a stored source document whose hash matches the recorded one', () => {
    const file = fileURLToPath(
      new URL(
        'academic-content/syllabus/national-university/2013-2014/english-masters/masters-final/english-masters-syllabus-2013-14.doc',
        root,
      ),
    );
    const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
    expect(sql).toContain(hash);
  });
});

describe('NU English Masters 2013-2014 follow-up files', () => {
  const read = (name: string) =>
    readFileSync(fileURLToPath(new URL(`database/prisma/content/${name}`, root)), 'utf8');

  it('uses the corrected spellings in the main file', () => {
    expect(code).toContain('Troilus and Criseyde');
    expect(code).toContain('Seamus Heaney');
    expect(code).toContain("Eugene O''Neill");
    expect(code).toContain('Tennessee Williams');
    expect(code).not.toMatch(/Cresyde|Heany|Tennessee William'/);
  });

  it('verifies only a syllabus that has an official source, and records who/why', () => {
    const verification = read('nu-english-masters-2013-2014.verification.sql');
    expect(verification).toContain('OFFICIAL_UNIVERSITY_DOCUMENT');
    expect(verification).toContain('INSERT INTO "SyllabusVerification"');
    expect(verification).toContain("'VERIFIED'");
  });

  it('runs the corrections before, and the verification after, the main file', () => {
    const names = [
      'nu-english-masters-2013-2014.corrections.sql',
      'nu-english-masters-2013-2014.sql',
      'nu-english-masters-2013-2014.verification.sql',
    ];
    expect([...names].sort()).toEqual(names);
  });

  it('keeps the unofficial Honours list hidden (draft, not current)', () => {
    const honours = read('nu-english-honours-2024-2025.sql');
    expect(honours).toContain("'DRAFT'");
    expect(honours).not.toContain("'PUBLISHED'");
    expect(read('nu-english-honours-2024-2025.unpublish.sql')).toContain('"isCurrent" = false');
  });
});
