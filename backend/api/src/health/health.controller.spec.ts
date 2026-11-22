import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController, SERVICE_NAME } from './health.controller.js';
import type { PrismaService } from '../database/prisma.service.js';

const makeController = (queryRaw: () => Promise<unknown>) =>
  new HealthController({ $queryRaw: queryRaw } as unknown as PrismaService);

describe('HealthController', () => {
  it('live() reports ok without touching the database', () => {
    const queryRaw = vi.fn();
    const res = makeController(queryRaw).live();
    expect(res).toMatchObject({ status: 'ok', service: SERVICE_NAME });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('ready() reports the database as up', async () => {
    const res = await makeController(() => Promise.resolve([{ '?column?': 1 }])).ready();
    expect(res.checks.database).toBe('up');
  });

  it('ready() answers 503 when the database is down', async () => {
    const controller = makeController(() => Promise.reject(new Error('connection refused')));
    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
