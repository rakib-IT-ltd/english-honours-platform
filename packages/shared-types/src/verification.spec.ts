import { describe, expect, it } from 'vitest';
import { VERIFICATION_STATUSES } from './verification.js';

describe('VERIFICATION_STATUSES', () => {
  it('defaults to unverified and only knows the two governed states', () => {
    expect(VERIFICATION_STATUSES).toEqual(['UNVERIFIED', 'VERIFIED']);
  });
});
