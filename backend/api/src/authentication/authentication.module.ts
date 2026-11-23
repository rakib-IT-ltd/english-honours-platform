import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { FirebaseIdTokenVerifier } from './firebase-id-token-verifier.js';
import { IdTokenVerifier } from './id-token-verifier.js';

@Module({
  providers: [{ provide: IdTokenVerifier, useClass: FirebaseIdTokenVerifier }, AuthGuard],
  exports: [IdTokenVerifier, AuthGuard],
})
export class AuthenticationModule {}
