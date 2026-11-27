import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, root)));
const sql = read(
  'database/prisma/content/nu-english-masters-2013-2014.study-tradition-individual-talent.sql',
).toString('utf8');
const code = sql
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');

describe('Tradition and Individual Talent study content file', () => {
  it('loads three sections, all as DRAFT, and never changes publication status on re-run', () => {
    expect(code.match(/'tradition-talent-s\d', \d, /g)).toHaveLength(3);
    expect(code).toContain("'DRAFT'");
    expect(code).not.toContain("'PUBLISHED'");
    const update = code.slice(code.indexOf('ON CONFLICT ("id")'));
    expect(update).not.toContain('publicationStatus');
  });

  it('is never marked as a sample', () => {
    expect(code).toContain("'DRAFT', false, now()");
    expect(code).not.toMatch(/SAMPLE:/);
  });

  it('states its sources and gaps, and the stored PDFs match the hashes in the README', () => {
    expect(sql).toContain('unofficial');
    expect(sql).toContain('NO written');
    const dir = 'academic-content/literature/tradition-and-the-individual-talent/';
    const readme = read(dir + 'README.md').toString('utf8');
    for (const file of [
      'tradition-and-the-individual-talent-full-text.pdf',
      'tradition-and-the-individual-talent-bangla-exam-notes.pdf',
    ]) {
      const hash = createHash('sha256')
        .update(read(dir + file))
        .digest('hex');
      expect(readme).toContain(hash);
    }
  });

  it('has the original text, keeps verse line breaks and leaves the questions unanswered', () => {
    expect(code.match(/'ORIGINAL_TEXT'/g)).toHaveLength(21);
    expect(code).toContain('platinum');
    expect(code).toContain('Shall be revenged after no common action.\nDoes the silkworm');
    const questions = [...code.matchAll(/'QUESTION_ANSWER',\d+,[^\n]*/g)];
    expect(questions).toHaveLength(35);
    for (const row of questions) expect(row[0]).toMatch(/,NULL,NULL\)/);
  });

  it('has no stray spaces inside Bangla words left over from PDF extraction', () => {
    expect(code).not.toMatch(/নতু ন|প্রকৃ ত|বর্ত মান|সম্পর্কে র|অনুভূ তি/);
  });
});
