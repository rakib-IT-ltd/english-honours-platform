import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, root)));
const sql = read(
  'database/prisma/content/nu-english-masters-2013-2014.study-american-scholar.sql',
).toString('utf8');
const code = sql
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');

describe('The American Scholar study content file', () => {
  it('loads five sections, all as DRAFT, and never changes publication status on re-run', () => {
    expect(code.match(/'american-scholar-s\d', \d, /g)).toHaveLength(5);
    expect(code).toContain("'DRAFT'");
    expect(code).not.toContain("'PUBLISHED'");
    const update = code.slice(code.indexOf('ON CONFLICT ("id")'));
    expect(update).not.toContain('publicationStatus');
  });

  it('is never marked as a sample and is not a stand-in text', () => {
    expect(code).toContain("'DRAFT', false, now()");
    expect(code).not.toMatch(/SAMPLE:/);
  });

  it('states its sources and gaps, and the stored PDFs match the hashes in the README', () => {
    expect(sql).toContain('DRAFT');
    expect(sql).toContain('unofficial');
    expect(sql).toContain('NO written');
    const dir = 'academic-content/literature/the-american-scholar/';
    const readme = read(dir + 'README.md').toString('utf8');
    for (const file of [
      'the-american-scholar-full-text.pdf',
      'the-american-scholar-bangla-exam-notes.pdf',
    ]) {
      const hash = createHash('sha256')
        .update(read(dir + file))
        .digest('hex');
      expect(readme).toContain(hash);
    }
  });

  it('has the original text and leaves the practice questions unanswered', () => {
    expect(code.match(/'ORIGINAL_TEXT'/g)!.length).toBeGreaterThan(30);
    expect(code).toContain('Man Thinking');
    const questions = [...code.matchAll(/'QUESTION_ANSWER',\d+,[^\n]*/g)];
    expect(questions).toHaveLength(25);
    for (const row of questions) expect(row[0]).toMatch(/,NULL,NULL\)/);
  });
});
