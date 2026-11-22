import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { AcademicProgramsService } from './academic-programs.service.js';

describe('AcademicProgramsService', () => {
  it('filters by university and programme type', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new AcademicProgramsService({
      academicProgram: { findMany },
    } as unknown as PrismaService).findAll({ universityId: 'u1', programmeType: 'HONOURS' });
    expect(findMany).toHaveBeenCalledWith({
      where: { universityId: 'u1', programmeType: 'HONOURS' },
      orderBy: [{ universityId: 'asc' }, { code: 'asc' }],
    });
  });

  it('returns a program with its shared levels flattened in order', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'p1',
      code: 'eng-hons',
      levels: [{ level: { id: 'l1', sequence: 1 } }, { level: { id: 'l2', sequence: 2 } }],
    });
    const result = await new AcademicProgramsService({
      academicProgram: { findUnique },
    } as unknown as PrismaService).findOne('p1');
    expect(result.levels).toEqual([
      { id: 'l1', sequence: 1 },
      { id: 'l2', sequence: 2 },
    ]);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      include: { levels: { include: { level: true }, orderBy: { level: { sequence: 'asc' } } } },
    });
  });

  it('404s for an unknown id', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    await expect(
      new AcademicProgramsService({
        academicProgram: { findUnique },
      } as unknown as PrismaService).findOne('nope'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
