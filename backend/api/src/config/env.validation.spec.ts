import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation.js';

const valid = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' };

describe('validateEnv', () => {
  it('applies defaults and parses values', () => {
    const env = validateEnv({ ...valid, CORS_ORIGINS: 'http://a.test, http://b.test ,' });
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3001);
    expect(env.CORS_ORIGINS).toEqual(['http://a.test', 'http://b.test']);
  });

  it('requires a postgres DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({ DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });

  it('rejects an unknown NODE_ENV and a bad PORT, reporting all problems', () => {
    expect(() => validateEnv({ ...valid, NODE_ENV: 'staging', PORT: 'abc' })).toThrow(
      /NODE_ENV[\s\S]*PORT/,
    );
    expect(() => validateEnv({ ...valid, PORT: '70000' })).toThrow(/PORT/);
  });
});
