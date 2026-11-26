import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { parseNoteBody, parseProgressBody } from './dto/parse.js';
import { isStudyKind } from './study-kinds.js';
import { StudyService } from './study.service.js';

/** Only test data. */
function service(overrides: Record<string, unknown> = {}) {
  const prisma = {
    book: { findFirst: vi.fn().mockResolvedValue({ id: 'b1' }) },
    bookSection: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    sectionProgress: { upsert: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
    bookmark: { upsert: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
    studyNote: { upsert: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
    ...overrides,
  };
  return { prisma, study: new StudyService(prisma as unknown as PrismaService) };
}

describe('StudyService (public)', () => {
  it('asks only for PUBLISHED sections of a PUBLISHED book and course', async () => {
    const { prisma, study } = service();
    await study.listSections('b1');
    expect(prisma.book.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'b1',
          publicationStatus: 'PUBLISHED',
          course: { publicationStatus: 'PUBLISHED' },
        },
      }),
    );
    expect(prisma.bookSection.findMany.mock.calls[0]?.[0].where).toMatchObject({
      publicationStatus: 'PUBLISHED',
      book: { publicationStatus: 'PUBLISHED', course: { publicationStatus: 'PUBLISHED' } },
    });
  });

  it('404s for an unpublished book or section', async () => {
    const { study } = service({ book: { findFirst: vi.fn().mockResolvedValue(null) } });
    await expect(study.listSections('b1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service().study.getSection('s1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists the kinds of material of each section once', async () => {
    const { study } = service({
      bookSection: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 's1',
            sequence: 1,
            items: [{ kind: 'SUMMARY' }, { kind: 'SUMMARY' }, { kind: 'VOCABULARY' }],
          },
        ]),
      },
    });
    const [section] = await study.listSections('b1');
    expect(section?.availableKinds).toEqual(['SUMMARY', 'VOCABULARY']);
    expect(section).not.toHaveProperty('items');
  });
});

describe('StudyService (student data)', () => {
  it('refuses to bookmark, note or track a section that is not public', async () => {
    const { prisma, study } = service();
    await expect(study.addBookmark('u1', 's1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(study.saveNote('u1', 's1', 'x')).rejects.toBeInstanceOf(NotFoundException);
    await expect(study.setProgress('u1', 's1', true)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.bookmark.upsert).not.toHaveBeenCalled();
    expect(prisma.studyNote.upsert).not.toHaveBeenCalled();
    expect(prisma.sectionProgress.upsert).not.toHaveBeenCalled();
  });

  it('scopes deletes to the student', async () => {
    const { prisma, study } = service();
    await study.removeBookmark('u1', 's1');
    await study.removeNote('u1', 's1');
    expect(prisma.bookmark.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1', sectionId: 's1' },
    });
    expect(prisma.studyNote.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1', sectionId: 's1' },
    });
  });

  it('summarises my study data for a book', async () => {
    const when = new Date('2026-01-01T00:00:00Z');
    const { study } = service({
      sectionProgress: {
        findMany: vi.fn().mockResolvedValue([
          { sectionId: 's2', completedAt: null },
          { sectionId: 's1', completedAt: when },
        ]),
      },
      bookmark: { findMany: vi.fn().mockResolvedValue([{ sectionId: 's2' }]) },
      studyNote: {
        findMany: vi.fn().mockResolvedValue([{ sectionId: 's1', body: 'n', updatedAt: when }]),
      },
    });
    expect(await study.myStudy('u1', 'b1')).toEqual({
      completedSectionIds: ['s1'],
      lastSectionId: 's2',
      bookmarkedSectionIds: ['s2'],
      notes: [{ sectionId: 's1', body: 'n', updatedAt: when.toISOString() }],
    });
  });
});

describe('request parsing', () => {
  it('accepts trimmed notes of 1-5000 characters only', () => {
    expect(parseNoteBody({ body: '  hello ' })).toBe('hello');
    expect(() => parseNoteBody({ body: '   ' })).toThrow();
    expect(() => parseNoteBody({ body: 'a'.repeat(5001) })).toThrow();
    expect(() => parseNoteBody({ body: 5 })).toThrow();
    expect(() => parseNoteBody(null)).toThrow();
  });

  it('needs a boolean for progress and knows the eight kinds', () => {
    expect(parseProgressBody({ completed: true })).toEqual({ completed: true });
    expect(() => parseProgressBody({ completed: 'yes' })).toThrow();
    expect(isStudyKind('VOCABULARY')).toBe(true);
    expect(isStudyKind('NOPE')).toBe(false);
  });
});
