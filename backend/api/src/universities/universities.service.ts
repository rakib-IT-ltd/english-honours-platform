import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class UniversitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.university.findMany({ orderBy: { nameEn: 'asc' } });
  }

  async findOne(id: string) {
    const university = await this.prisma.university.findUnique({ where: { id } });
    if (!university) throw new NotFoundException(`University ${id} not found`);
    return university;
  }
}
