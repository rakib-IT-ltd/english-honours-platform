import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const PUBLISHED = 'PUBLISHED' as const;

/** A book is public only when it and its course are PUBLISHED. */
@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { syllabusId?: string; courseId?: string } = {}) {
    return this.prisma.book.findMany({
      where: {
        courseId: filter.courseId,
        publicationStatus: PUBLISHED,
        course: { publicationStatus: PUBLISHED, syllabusId: filter.syllabusId },
      },
      orderBy: [{ course: { sequence: 'asc' } }, { sequence: 'asc' }, { titleEn: 'asc' }],
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, publicationStatus: PUBLISHED, course: { publicationStatus: PUBLISHED } },
      include: {
        course: {
          select: { id: true, syllabusId: true, code: true, titleEn: true, titleBn: true },
        },
      },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }
}
