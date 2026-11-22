import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { AcademicSessionsService } from './academic-sessions.service.js';

describe('AcademicSessionsService', () => {
  it('lists sessions newest first, filtered by university', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new AcademicSessionsService({
      academicSession: { findMany },
    } as unknown as PrismaService).findAll({ universityId: 'u1' });
    expect(findMany).toHaveBeenCalledWith({
      where: { universityId: 'u1' },
      orderBy: { startYear: 'desc' },
    });
  });

  it('404s for an unknown id', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const service = new AcademicSessionsService({
      academicSession: { findUnique },
    } as unknown as PrismaService);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
