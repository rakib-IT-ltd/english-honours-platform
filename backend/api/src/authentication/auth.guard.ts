import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  AuthNotConfiguredError,
  IdTokenVerifier,
  type VerifiedIdToken,
} from './id-token-verifier.js';

export type AuthenticatedRequest = Request & { auth: VerifiedIdToken };

/** Requires `Authorization: Bearer <Firebase ID token>` and attaches the verified identity. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly verifier: IdTokenVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const match = typeof header === 'string' ? /^Bearer\s+(\S+)$/i.exec(header) : null;
    if (!match?.[1]) throw new UnauthorizedException('Missing bearer token');

    try {
      request.auth = await this.verifier.verify(match[1]);
    } catch (error) {
      if (error instanceof AuthNotConfiguredError) {
        throw new ServiceUnavailableException('Authentication is not configured on this server');
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }
}
