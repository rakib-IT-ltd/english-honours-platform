import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard.js';
import type { VerifiedIdToken } from './id-token-verifier.js';

/** The verified token identity of the current request (only valid behind AuthGuard). */
export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext): VerifiedIdToken =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().auth,
);
