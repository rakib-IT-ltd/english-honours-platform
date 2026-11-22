import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/database/prisma.service.js';

const university = {
  id: 'u1',
  code: 'TEST',
  nameEn: 'Sample University (test data)',
  nameBn: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

/** Minimal in-memory stand-in for the Prisma models used by the read endpoints. */
const model = (rows: Array<{ id: string }>) => ({
  findMany: () => Promise.resolve(rows),
  findUnique: ({ where }: { where: { id: string } }) =>
    Promise.resolve(rows.find((r) => r.id === where.id) ?? null),
});

describe('Academic structure (e2e, database stubbed)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({
        university: model([university]),
        department: model([]),
        academicYear: model([]),
        academicSession: model([]),
        syllabus: model([]),
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

  it.each(['universities', 'departments', 'academic-years', 'academic-sessions', 'syllabuses'])(
    'GET /%s returns a JSON array',
    async (path) => {
      const res = await fetch(`${baseUrl}/api/v1/${path}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(await res.json())).toBe(true);
    },
  );

  it('GET /universities/:id returns the row, and 404 for an unknown id', async () => {
    const ok = await fetch(`${baseUrl}/api/v1/universities/u1`);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ id: 'u1', code: 'TEST' });
    expect((await fetch(`${baseUrl}/api/v1/universities/missing`)).status).toBe(404);
  });

  it.each(['departments', 'academic-years', 'academic-sessions', 'syllabuses'])(
    'GET /%s/:id returns 404 for an unknown id',
    async (path) => {
      expect((await fetch(`${baseUrl}/api/v1/${path}/missing`)).status).toBe(404);
    },
  );

  it('exposes no write routes until authentication/authorization exists', async () => {
    const res = await fetch(`${baseUrl}/api/docs-json`);
    const doc = (await res.json()) as { paths: Record<string, Record<string, unknown>> };
    const academicPaths = Object.entries(doc.paths).filter(([p]) =>
      /\/(universities|departments|academic-years|academic-sessions|syllabuses)/.test(p),
    );
    expect(academicPaths.length).toBeGreaterThanOrEqual(10);
    for (const [, operations] of academicPaths) {
      expect(Object.keys(operations)).toEqual(['get']);
    }
  });
});
