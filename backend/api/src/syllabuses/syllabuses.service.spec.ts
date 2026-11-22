import { describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { SyllabusesService } from './syllabuses.service.js';

type Row = {
  id: string;
  verificationStatus: 'UNVERIFIED' | 'VERIFIED';
  _count: { sources: number };
};

function setup(options: { row?: Row | null; updateCount?: number } = {}) {
  const row: Row | null =
    options.row === undefined
      ? { id: 's1', verificationStatus: 'UNVERIFIED', _count: { sources: 1 } }
      : options.row;
  const tx = {
    syllabus: {
      findUnique: vi.fn().mockResolvedValue(row),
      updateMany: vi.fn().mockResolvedValue({ count: options.updateCount ?? 1 }),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 's1', verificationStatus: 'VERIFIED' }),
    },
    syllabusVerification: { create: vi.fn().mockResolvedValue({}) },
  };
  const prisma = {
    ...tx,
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  } as unknown as PrismaService;
  return { service: new SyllabusesService(prisma), tx, prisma };
}

describe('SyllabusesService.verify', () => {
  it('rejects a blank reviewer without touching the database', async () => {
    const { service, prisma } = setup();
    await expect(service.verify('s1', { verifiedBy: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('404s for an unknown syllabus', async () => {
    const { service } = setup({ row: null });
    await expect(service.verify('nope', { verifiedBy: 'A. Reviewer' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('refuses to verify a syllabus that has no source document', async () => {
    const { service, tx } = setup({
      row: { id: 's1', verificationStatus: 'UNVERIFIED', _count: { sources: 0 } },
    });
    await expect(service.verify('s1', { verifiedBy: 'A. Reviewer' })).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(tx.syllabusVerification.create).not.toHaveBeenCalled();
    expect(tx.syllabus.updateMany).not.toHaveBeenCalled();
  });

  it('refuses to verify twice', async () => {
    const { service, tx } = setup({
      row: { id: 's1', verificationStatus: 'VERIFIED', _count: { sources: 1 } },
    });
    await expect(service.verify('s1', { verifiedBy: 'A. Reviewer' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.syllabusVerification.create).not.toHaveBeenCalled();
  });

  it('records the verification and flips the status in one transaction', async () => {
    const { service, tx, prisma } = setup();
    const result = await service.verify('s1', { verifiedBy: '  A. Reviewer ', note: ' checked ' });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.syllabusVerification.create).toHaveBeenCalledWith({
      data: { syllabusId: 's1', verifiedBy: 'A. Reviewer', note: 'checked' },
    });
    expect(tx.syllabus.updateMany).toHaveBeenCalledWith({
      where: { id: 's1', verificationStatus: 'UNVERIFIED' },
      data: { verificationStatus: 'VERIFIED' },
    });
    expect(result.verificationStatus).toBe('VERIFIED');
  });

  it('aborts (so the transaction rolls back) if another request verified it first', async () => {
    const { service } = setup({ updateCount: 0 });
    await expect(service.verify('s1', { verifiedBy: 'A. Reviewer' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

describe('SyllabusesService reads', () => {
  it('findOne 404s when missing', async () => {
    const prisma = { syllabus: { findUnique: vi.fn().mockResolvedValue(null) } };
    const service = new SyllabusesService(prisma as unknown as PrismaService);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll filters by department through the academic year', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new SyllabusesService({ syllabus: { findMany } } as unknown as PrismaService);
    await service.findAll({ departmentId: 'd1', academicSessionId: 's1' });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          academicSessionId: 's1',
          academicYearId: undefined,
          academicYear: { departmentId: 'd1' },
        },
      }),
    );
  });
});
