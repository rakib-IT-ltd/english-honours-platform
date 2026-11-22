import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { ProgrammeType } from '../generated/prisma/enums.js';

export interface AcademicProgramFilter {
  universityId?: string;
  programmeType?: ProgrammeType;
}

@Injectable()
export class AcademicProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: AcademicProgramFilter = {}) {
    return this.prisma.academicProgram.findMany({
      where: { universityId: filter.universityId, programmeType: filter.programmeType },
      orderBy: [{ universityId: 'asc' }, { code: 'asc' }],
    });
  }

  /** A program with the shared levels it offers, in display order. */
  async findOne(id: string) {
    const program = await this.prisma.academicProgram.findUnique({
      where: { id },
      include: { levels: { include: { level: true }, orderBy: { level: { sequence: 'asc' } } } },
    });
    if (!program) throw new NotFoundException(`Academic program ${id} not found`);
    const { levels, ...rest } = program;
    return { ...rest, levels: levels.map((programLevel) => programLevel.level) };
  }
}
