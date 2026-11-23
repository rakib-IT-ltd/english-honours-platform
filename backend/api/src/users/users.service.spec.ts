import { describe, expect, it, vi } from 'vitest';
import {
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service.js';
import { toMe, UsersService } from './users.service.js';

const identity = { uid: 'f1', email: 'student@example.test', name: 'Test Student' };

function setup(overrides: Record<string, unknown> = {}) {
  const prisma = {
    user: {
      upsert: vi.fn().mockResolvedValue({ id: 'u1', profile: null }),
      update: vi.fn().mockResolvedValue({ id: 'u1', profile: null }),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'u1', profile: null }),
    },
    academicProgram: {
      findUnique: vi.fn().mockResolvedValue({ universityId: 'uni1', levels: [{ levelId: 'l1' }] }),
    },
    academicSession: { findUnique: vi.fn().mockResolvedValue({ universityId: 'uni1' }) },
    studentProfile: { upsert: vi.fn().mockResolvedValue({}) },
    ...overrides,
  };
  return { prisma, service: new UsersService(prisma as unknown as PrismaService) };
}

const input = {
  universityId: 'uni1',
  academicProgramId: 'p1',
  academicLevelId: 'l1',
  academicSessionId: null,
};

describe('UsersService.findOrCreate', () => {
  it('upserts by Firebase uid, creating the row on first sign-in', async () => {
    const { prisma, service } = setup();
    await service.findOrCreate(identity);
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { firebaseUid: 'f1' },
      update: {},
      create: { firebaseUid: 'f1', email: 'student@example.test', displayName: 'Test Student' },
      include: { profile: true },
    });
  });

  it('rejects an account without an email', async () => {
    const { service } = setup();
    await expect(service.findOrCreate({ ...identity, email: null })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('reports an email already linked to another account as a conflict', async () => {
    const { service } = setup({
      user: { upsert: vi.fn().mockRejectedValue({ code: 'P2002' }) },
    });
    await expect(service.findOrCreate(identity)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('UsersService.saveProfile', () => {
  it('saves a valid academic identity', async () => {
    const { prisma, service } = setup();
    await service.saveProfile('u1', input);
    expect(prisma.studentProfile.upsert).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: input,
      create: { userId: 'u1', ...input },
    });
  });

  it('rejects a program from another university', async () => {
    const { prisma, service } = setup();
    prisma.academicProgram.findUnique.mockResolvedValue({ universityId: 'other', levels: [] });
    await expect(service.saveProfile('u1', input)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(prisma.studentProfile.upsert).not.toHaveBeenCalled();
  });

  it('rejects an unknown program', async () => {
    const { prisma, service } = setup();
    prisma.academicProgram.findUnique.mockResolvedValue(null);
    await expect(service.saveProfile('u1', input)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('rejects a level the program does not offer', async () => {
    const { prisma, service } = setup();
    prisma.academicProgram.findUnique.mockResolvedValue({
      universityId: 'uni1',
      levels: [{ levelId: 'other' }],
    });
    await expect(service.saveProfile('u1', input)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('rejects a session of another university', async () => {
    const { prisma, service } = setup();
    prisma.academicSession.findUnique.mockResolvedValue({ universityId: 'other' });
    await expect(
      service.saveProfile('u1', { ...input, academicSessionId: 's1' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('turns a database foreign-key violation into a 422', async () => {
    const { prisma, service } = setup();
    prisma.studentProfile.upsert.mockRejectedValue({ code: 'P2003' });
    await expect(service.saveProfile('u1', input)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });
});

describe('toMe', () => {
  it('never exposes the Firebase uid', () => {
    const me = toMe({
      id: 'u1',
      firebaseUid: 'secret-uid',
      email: 'a@b.test',
      displayName: null,
      role: 'STUDENT',
      preferredLanguage: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: null,
    });
    expect(JSON.stringify(me)).not.toContain('secret-uid');
    expect(me.profile).toBeNull();
  });
});
