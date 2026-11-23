import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { IdTokenVerifier } from '../src/authentication/id-token-verifier.js';
import { PrismaService } from '../src/database/prisma.service.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;
const jsonOf = async (res: Response): Promise<Json> => (await res.json()) as Json;

/** In-memory stand-in for the user/profile tables. Only test data. */
function fakePrisma() {
  const users = new Map<string, Record<string, unknown>>();
  const profiles = new Map<string, Record<string, unknown>>();
  const withProfile = (user: Record<string, unknown>) => ({
    ...user,
    profile: profiles.get(user['id'] as string) ?? null,
  });
  return {
    user: {
      upsert: ({
        where,
        create,
      }: {
        where: { firebaseUid: string };
        create: Record<string, unknown>;
      }) => {
        let user = [...users.values()].find((u) => u['firebaseUid'] === where.firebaseUid);
        if (!user) {
          user = {
            id: `user-${users.size + 1}`,
            role: 'STUDENT',
            preferredLanguage: 'en',
            ...create,
          };
          users.set(user['id'] as string, user);
        }
        return Promise.resolve(withProfile(user));
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const user = { ...users.get(where.id), ...data };
        users.set(where.id, user);
        return Promise.resolve(withProfile(user));
      },
      findUniqueOrThrow: ({ where }: { where: { id: string } }) =>
        Promise.resolve(withProfile(users.get(where.id) as Record<string, unknown>)),
    },
    academicProgram: {
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(
          where.id === 'p1' ? { universityId: 'uni1', levels: [{ levelId: 'l1' }] } : null,
        ),
    },
    academicSession: { findUnique: () => Promise.resolve(null) },
    studentProfile: {
      upsert: ({ create }: { create: Record<string, unknown> }) => {
        profiles.set(create['userId'] as string, create);
        return Promise.resolve(create);
      },
    },
    $disconnect: () => Promise.resolve(),
  };
}

/** Accepts tokens of the form "test:<uid>:<email>" - never a real Firebase token. */
const fakeVerifier: IdTokenVerifier = {
  verify: (token) => {
    const [prefix, uid, email] = token.split(':');
    if (prefix !== 'test' || !uid) return Promise.reject(new Error('bad token'));
    return Promise.resolve({ uid, email: email ?? null, name: 'Test Student' });
  },
};

describe('Student account endpoints (e2e, database and Firebase stubbed)', () => {
  let app: INestApplication;
  let baseUrl: string;
  const auth = { Authorization: 'Bearer test:f1:student@example.test' };
  const json = { ...auth, 'Content-Type': 'application/json' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma())
      .overrideProvider(IdTokenVerifier)
      .useValue(fakeVerifier)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app, { corsOrigins: [], enableSwagger: true });
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', 'localhost');
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects requests without a token', async () => {
    expect((await fetch(`${baseUrl}/api/v1/me`)).status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/me`, { headers: { Authorization: 'Bearer nope' } });
    expect(res.status).toBe(401);
  });

  it('creates the user on first sign-in and returns no Firebase uid', async () => {
    const res = await fetch(`${baseUrl}/api/v1/me`, { headers: auth });
    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(body).toMatchObject({
      email: 'student@example.test',
      role: 'STUDENT',
      preferredLanguage: 'en',
      profile: null,
    });
    expect(JSON.stringify(body)).not.toContain('"f1"');
  });

  it('saves and returns the academic identity', async () => {
    const put = await fetch(`${baseUrl}/api/v1/me/profile`, {
      method: 'PUT',
      headers: json,
      body: JSON.stringify({
        universityId: 'uni1',
        academicProgramId: 'p1',
        academicLevelId: 'l1',
      }),
    });
    expect(put.status).toBe(200);
    expect((await jsonOf(put))['profile']).toEqual({
      universityId: 'uni1',
      academicProgramId: 'p1',
      academicLevelId: 'l1',
      academicSessionId: null,
    });
    const me = await jsonOf(await fetch(`${baseUrl}/api/v1/me`, { headers: auth }));
    expect(me.profile.academicProgramId).toBe('p1');
  });

  it('answers 422 for a program that does not belong to the university', async () => {
    const res = await fetch(`${baseUrl}/api/v1/me/profile`, {
      method: 'PUT',
      headers: json,
      body: JSON.stringify({
        universityId: 'other',
        academicProgramId: 'p1',
        academicLevelId: 'l1',
      }),
    });
    expect(res.status).toBe(422);
  });

  it('answers 400 for an incomplete profile body', async () => {
    const res = await fetch(`${baseUrl}/api/v1/me/profile`, {
      method: 'PUT',
      headers: json,
      body: JSON.stringify({ universityId: 'uni1' }),
    });
    expect(res.status).toBe(400);
  });

  it('updates the display name and language', async () => {
    const res = await fetch(`${baseUrl}/api/v1/me`, {
      method: 'PATCH',
      headers: json,
      body: JSON.stringify({ displayName: 'Rakib', preferredLanguage: 'bn' }),
    });
    expect(res.status).toBe(200);
    expect(await jsonOf(res)).toMatchObject({ displayName: 'Rakib', preferredLanguage: 'bn' });
  });

  it('documents bearer authentication and only the /me write routes', async () => {
    const doc = await jsonOf(await fetch(`${baseUrl}/api/docs-json`));
    expect(doc.components.securitySchemes).toBeTruthy();
    expect(Object.keys(doc.paths['/api/v1/me']).sort()).toEqual(['get', 'patch']);
    expect(Object.keys(doc.paths['/api/v1/me/profile'])).toEqual(['put']);
  });
});
