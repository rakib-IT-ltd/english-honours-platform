import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class AcademicSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { universityId?: string } = {}) {
    return this.prisma.academicSession.findMany({
      where: { universityId: filter.universityId },
      orderBy: { startYear: 'desc' },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.academicSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Academic session ${id} not found`);
    return session;
  }
}
