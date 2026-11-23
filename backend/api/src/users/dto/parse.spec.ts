import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { parseSaveProfile, parseUpdateMe } from './parse.js';

describe('parseUpdateMe', () => {
  it('accepts a trimmed name and a supported language', () => {
    expect(parseUpdateMe({ displayName: '  Rakib ', preferredLanguage: 'bn' })).toEqual({
      displayName: 'Rakib',
      preferredLanguage: 'bn',
    });
  });

  it('allows clearing the name', () => {
    expect(parseUpdateMe({ displayName: null })).toEqual({ displayName: null });
  });

  it.each([
    null,
    [],
    'x',
    {},
    { preferredLanguage: 'fr' },
    { displayName: '' },
    { displayName: 5 },
  ])('rejects %j', (body) => {
    expect(() => parseUpdateMe(body)).toThrow(BadRequestException);
  });
});

describe('parseSaveProfile', () => {
  const valid = { universityId: 'u', academicProgramId: 'p', academicLevelId: 'l' };

  it('defaults the session to null', () => {
    expect(parseSaveProfile(valid)).toEqual({ ...valid, academicSessionId: null });
  });

  it('keeps a given session', () => {
    expect(parseSaveProfile({ ...valid, academicSessionId: 's' }).academicSessionId).toBe('s');
  });

  it.each([
    {},
    { ...valid, universityId: '' },
    { ...valid, academicLevelId: 3 },
    { ...valid, academicSessionId: '' },
    { ...valid, academicSessionId: 7 },
    null,
  ])('rejects %j', (body) => {
    expect(() => parseSaveProfile(body)).toThrow(BadRequestException);
  });
});
