import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { universityId?: string } = {}) {
    return this.prisma.department.findMany({
      where: { universityId: filter.universityId },
      orderBy: { nameEn: 'asc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException(`Department ${id} not found`);
    return department;
  }
}
