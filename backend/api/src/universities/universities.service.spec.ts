import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { UniversitiesService } from './universities.service.js';

describe('UniversitiesService', () => {
  it('lists universities ordered by English name', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new UniversitiesService({
      university: { findMany },
    } as unknown as PrismaService).findAll();
    expect(findMany).toHaveBeenCalledWith({ orderBy: { nameEn: 'asc' } });
  });

  it('returns a university by id', async () => {
    const row = { id: 'u1' };
    const findUnique = vi.fn().mockResolvedValue(row);
    const service = new UniversitiesService({
      university: { findUnique },
    } as unknown as PrismaService);
    await expect(service.findOne('u1')).resolves.toBe(row);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('404s for an unknown id', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const service = new UniversitiesService({
      university: { findUnique },
    } as unknown as PrismaService);
    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
