import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

/** The shared, university-independent platform levels. Read-only. */
@Injectable()
export class AcademicLevelsService {
  constructor(private readonly prisma: PrismaService) {}

  /** All levels in display order, or only those a given program offers. */
  findAll(filter: { academicProgramId?: string } = {}) {
    return this.prisma.academicLevel.findMany({
      where: filter.academicProgramId
        ? { programs: { some: { programId: filter.academicProgramId } } }
        : undefined,
      orderBy: { sequence: 'asc' },
    });
  }

  async findOne(id: string) {
    const level = await this.prisma.academicLevel.findUnique({ where: { id } });
    if (!level) throw new NotFoundException(`Academic level ${id} not found`);
    return level;
  }
}
