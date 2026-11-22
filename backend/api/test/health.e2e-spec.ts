import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/database/prisma.service.js';

describe('Health (e2e, database stubbed)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let dbUp = true;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: () => (dbUp ? Promise.resolve([1]) : Promise.reject(new Error('down'))),
        $disconnect: () => Promise.resolve(),
      })
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app, { corsOrigins: [], enableSwagger: true });
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', 'localhost');
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health -> 200 ok', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok', service: 'ehp-api' });
  });

  it('GET /api/v1/health/ready -> 200 when db up, 503 when down', async () => {
    expect((await fetch(`${baseUrl}/api/v1/health/ready`)).status).toBe(200);
    dbUp = false;
    expect((await fetch(`${baseUrl}/api/v1/health/ready`)).status).toBe(503);
  });

  it('serves the OpenAPI document', async () => {
    const res = await fetch(`${baseUrl}/api/docs-json`);
    expect(res.status).toBe(200);
    const doc = (await res.json()) as { paths: Record<string, unknown> };
    expect(Object.keys(doc.paths)).toContain('/api/v1/health');
  });
});
