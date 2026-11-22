import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { departmentId?: string } = {}) {
    return this.prisma.academicYear.findMany({
      where: { departmentId: filter.departmentId },
      orderBy: [{ departmentId: 'asc' }, { yearNumber: 'asc' }],
    });
  }

  async findOne(id: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) throw new NotFoundException(`Academic year ${id} not found`);
    return year;
  }
}
