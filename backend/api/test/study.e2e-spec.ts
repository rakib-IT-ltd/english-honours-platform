import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { IdTokenVerifier } from '../src/authentication/id-token-verifier.js';
import { PrismaService } from '../src/database/prisma.service.js';

/** In-memory stand-in for the study tables. Only test data. */
function fakePrisma() {
  const notes = new Map<string, { sectionId: string; body: string; updatedAt: Date }>();
  const bookmarks = new Set<string>();
  const publicSections = new Set(['s1']);
  return {
    user: {
      upsert: () => Promise.resolve({ id: 'u1', profile: null }),
    },
    book: { findFirst: () => Promise.resolve({ id: 'b1' }) },
    bookSection: {
      findFirst: ({ where }: { where: { id?: string } }) =>
        Promise.resolve(where.id && publicSections.has(where.id) ? { id: where.id } : null),
      findMany: () => Promise.resolve([]),
    },
    sectionProgress: { upsert: () => Promise.resolve({}), findMany: () => Promise.resolve([]) },
    bookmark: {
      upsert: ({ create }: { create: { sectionId: string } }) => {
        bookmarks.add(create.sectionId);
        return Promise.resolve({});
      },
      deleteMany: ({ where }: { where: { sectionId: string } }) => {
        bookmarks.delete(where.sectionId);
        return Promise.resolve({ count: 1 });
      },
      findMany: () => Promise.resolve([...bookmarks].map((sectionId) => ({ sectionId }))),
    },
    studyNote: {
      upsert: ({ create }: { create: { sectionId: string; body: string } }) => {
        const note = { sectionId: create.sectionId, body: create.body, updatedAt: new Date() };
        notes.set(create.sectionId, note);
        return Promise.resolve(note);
      },
      deleteMany: ({ where }: { where: { sectionId: string } }) => {
        notes.delete(where.sectionId);
        return Promise.resolve({ count: 1 });
      },
      findMany: () => Promise.resolve([...notes.values()]),
    },
    $disconnect: () => Promise.resolve(),
  };
}

const fakeVerifier: IdTokenVerifier = {
  verify: (token) => {
    const [prefix, uid, email] = token.split(':');
    if (prefix !== 'test' || !uid) return Promise.reject(new Error('bad token'));
    return Promise.resolve({ uid, email: email ?? null, name: 'Test Student' });
  },
};

describe('Study endpoints (e2e, database and Firebase stubbed)', () => {
  let app: INestApplication;
  let baseUrl: string;
  const auth = { Authorization: 'Bearer test:f1:student@example.test' };
  const json = { ...auth, 'Content-Type': 'application/json' };
  const api = () => `${baseUrl}/api/v1`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma())
      .overrideProvider(IdTokenVerifier)
      .useValue(fakeVerifier)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app, { corsOrigins: ['http://app.test'], enableSwagger: true });
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', 'localhost');
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves public sections without a token, and rejects an unknown kind', async () => {
    expect((await fetch(`${api()}/books/b1/sections`)).status).toBe(200);
    expect((await fetch(`${api()}/books/b1/resources/VOCABULARY`)).status).toBe(200);
    expect((await fetch(`${api()}/books/b1/resources/NOPE`)).status).toBe(400);
    expect((await fetch(`${api()}/sections/missing`)).status).toBe(404);
  });

  it('keeps the student data private', async () => {
    expect((await fetch(`${api()}/me/study/books/b1`)).status).toBe(401);
    const res = await fetch(`${api()}/me/study/sections/s1/note`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'x' }),
    });
    expect(res.status).toBe(401);
  });

  it('saves, lists and deletes a note, with validation', async () => {
    const bad = await fetch(`${api()}/me/study/sections/s1/note`, {
      method: 'PUT',
      headers: json,
      body: JSON.stringify({ body: '   ' }),
    });
    expect(bad.status).toBe(400);

    const saved = await fetch(`${api()}/me/study/sections/s1/note`, {
      method: 'PUT',
      headers: json,
      body: JSON.stringify({ body: ' my note ' }),
    });
    expect(saved.status).toBe(200);
    expect(await saved.json()).toMatchObject({ sectionId: 's1', body: 'my note' });

    const mine = (await (await fetch(`${api()}/me/study/books/b1`, { headers: auth })).json()) as {
      notes: unknown[];
    };
    expect(mine.notes).toHaveLength(1);

    const del = await fetch(`${api()}/me/study/sections/s1/note`, {
      method: 'DELETE',
      headers: auth,
    });
    expect(del.status).toBe(204);
  });

  it('bookmarks and unbookmarks a public section; an unknown section is a 404', async () => {
    const put = await fetch(`${api()}/me/study/sections/s1/bookmark`, {
      method: 'PUT',
      headers: auth,
    });
    expect(put.status).toBe(204);
    const missing = await fetch(`${api()}/me/study/sections/nope/bookmark`, {
      method: 'PUT',
      headers: auth,
    });
    expect(missing.status).toBe(404);
    const del = await fetch(`${api()}/me/study/sections/s1/bookmark`, {
      method: 'DELETE',
      headers: auth,
    });
    expect(del.status).toBe(204);
  });

  it('records progress and rejects a non-boolean', async () => {
    const ok = await fetch(`${api()}/me/study/sections/s1/progress`, {
      method: 'PUT',
      headers: json,
      body: JSON.stringify({ completed: true }),
    });
    expect(ok.status).toBe(204);
    const bad = await fetch(`${api()}/me/study/sections/s1/progress`, {
      method: 'PUT',
      headers: json,
      body: JSON.stringify({ completed: 'yes' }),
    });
    expect(bad.status).toBe(400);
  });

  it('lets the browser use DELETE from the allowed origin (CORS preflight)', async () => {
    const res = await fetch(`${api()}/me/study/sections/s1/note`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://app.test',
        'Access-Control-Request-Method': 'DELETE',
        'Access-Control-Request-Headers': 'authorization',
      },
    });
    expect(res.headers.get('access-control-allow-methods')).toContain('DELETE');
  });
});
