import { describe, expect, it, vi } from 'vitest';
import {
  ServiceUnavailableException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthNotConfiguredError, type IdTokenVerifier } from './id-token-verifier.js';

function context(headers: Record<string, string | undefined>) {
  const request: Record<string, unknown> = { headers };
  return {
    request,
    ctx: { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext,
  };
}

const guardWith = (verify: IdTokenVerifier['verify']) => new AuthGuard({ verify });

describe('AuthGuard', () => {
  it('attaches the verified identity for a valid bearer token', async () => {
    const identity = { uid: 'f1', email: 'a@b.test', name: null };
    const verify = vi.fn().mockResolvedValue(identity);
    const { ctx, request } = context({ authorization: 'Bearer abc.def' });
    await expect(guardWith(verify).canActivate(ctx)).resolves.toBe(true);
    expect(verify).toHaveBeenCalledWith('abc.def');
    expect(request['auth']).toEqual(identity);
  });

  it.each([{}, { authorization: 'Basic abc' }, { authorization: 'Bearer' }])(
    'rejects a missing or malformed header %j',
    async (headers) => {
      const verify = vi.fn();
      await expect(guardWith(verify).canActivate(context(headers).ctx)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(verify).not.toHaveBeenCalled();
    },
  );

  it('rejects a token that fails verification', async () => {
    const verify = vi.fn().mockRejectedValue(new Error('expired'));
    await expect(
      guardWith(verify).canActivate(context({ authorization: 'Bearer x' }).ctx),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('answers 503 when authentication is not configured', async () => {
    const verify = vi.fn().mockRejectedValue(new AuthNotConfiguredError('no project'));
    await expect(
      guardWith(verify).canActivate(context({ authorization: 'Bearer x' }).ctx),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
