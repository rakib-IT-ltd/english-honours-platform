import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** Only PUBLISHED content is ever served here (draft/review content is never public). */
const PUBLISHED = 'PUBLISHED' as const;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { syllabusId?: string } = {}) {
    return this.prisma.course.findMany({
      where: { syllabusId: filter.syllabusId, publicationStatus: PUBLISHED },
      orderBy: [{ sequence: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, publicationStatus: PUBLISHED },
      include: {
        books: {
          where: { publicationStatus: PUBLISHED },
          orderBy: [{ sequence: 'asc' }, { titleEn: 'asc' }],
        },
      },
    });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }
}
