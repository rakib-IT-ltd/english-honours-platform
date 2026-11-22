import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { DepartmentsService } from './departments.service.js';

describe('DepartmentsService', () => {
  it('filters by university', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new DepartmentsService({ department: { findMany } } as unknown as PrismaService).findAll({
      universityId: 'u1',
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { universityId: 'u1' },
      orderBy: { nameEn: 'asc' },
    });
  });

  it('404s for an unknown id', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const service = new DepartmentsService({
      department: { findUnique },
    } as unknown as PrismaService);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
