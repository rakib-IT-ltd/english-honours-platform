import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { AcademicYearsService } from './academic-years.service.js';

describe('AcademicYearsService', () => {
  it('lists a department’s years in First..Fourth order', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new AcademicYearsService({
      academicYear: { findMany },
    } as unknown as PrismaService).findAll({
      departmentId: 'd1',
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { departmentId: 'd1' },
      orderBy: [{ departmentId: 'asc' }, { yearNumber: 'asc' }],
    });
  });

  it('404s for an unknown id', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const service = new AcademicYearsService({
      academicYear: { findUnique },
    } as unknown as PrismaService);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
