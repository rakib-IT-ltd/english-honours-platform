import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { BooksService } from '../books/books.service.js';
import { CoursesService } from './courses.service.js';

describe('CoursesService', () => {
  it('only lists PUBLISHED courses of a syllabus', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new CoursesService({ course: { findMany } } as unknown as PrismaService).findAll({
      syllabusId: 's1',
    });
    expect(findMany.mock.calls[0]?.[0].where).toEqual({
      syllabusId: 's1',
      publicationStatus: 'PUBLISHED',
    });
  });

  it('404s for a course that is missing or not published', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const service = new CoursesService({ course: { findFirst } } as unknown as PrismaService);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst.mock.calls[0]?.[0].where).toEqual({ id: 'x', publicationStatus: 'PUBLISHED' });
  });
});

describe('BooksService', () => {
  it('requires both the book and its course to be PUBLISHED', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new BooksService({ book: { findMany } } as unknown as PrismaService).findAll({
      syllabusId: 's1',
    });
    const where = findMany.mock.calls[0]?.[0].where;
    expect(where.publicationStatus).toBe('PUBLISHED');
    expect(where.course).toEqual({ publicationStatus: 'PUBLISHED', syllabusId: 's1' });
  });

  it('404s for an unpublished or unknown book', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const service = new BooksService({ book: { findFirst } } as unknown as PrismaService);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
