import { describe, expect, it } from 'vitest';
import { PROGRAMME_TYPES, SYLLABUS_SOURCE_TYPES, VERIFICATION_STATUSES } from './verification.js';

describe('VERIFICATION_STATUSES', () => {
  it('defaults to unverified and only knows the two governed states', () => {
    expect(VERIFICATION_STATUSES).toEqual(['UNVERIFIED', 'VERIFIED']);
  });
});

describe('programme and source types', () => {
  it('mirror the database enums', () => {
    expect(PROGRAMME_TYPES).toEqual(['HONOURS', 'MASTERS']);
    expect(SYLLABUS_SOURCE_TYPES).toEqual(['OFFICIAL_UNIVERSITY_DOCUMENT', 'OTHER']);
  });
});
