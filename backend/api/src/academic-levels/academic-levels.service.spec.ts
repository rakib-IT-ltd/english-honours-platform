import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { AcademicLevelsService } from './academic-levels.service.js';

describe('AcademicLevelsService', () => {
  it('lists all shared levels in sequence order', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new AcademicLevelsService({
      academicLevel: { findMany },
    } as unknown as PrismaService).findAll();
    expect(findMany).toHaveBeenCalledWith({ where: undefined, orderBy: { sequence: 'asc' } });
  });

  it('filters to the levels a program offers', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new AcademicLevelsService({
      academicLevel: { findMany },
    } as unknown as PrismaService).findAll({ academicProgramId: 'p1' });
    expect(findMany).toHaveBeenCalledWith({
      where: { programs: { some: { programId: 'p1' } } },
      orderBy: { sequence: 'asc' },
    });
  });

  it('404s for an unknown id', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const service = new AcademicLevelsService({
      academicLevel: { findUnique },
    } as unknown as PrismaService);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
