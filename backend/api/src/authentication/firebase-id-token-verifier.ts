import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
  AuthNotConfiguredError,
  IdTokenVerifier,
  type VerifiedIdToken,
} from './id-token-verifier.js';

/**
 * Verifies Firebase Authentication ID tokens with the Firebase Admin SDK.
 *
 * Needs FIREBASE_PROJECT_ID. In production the SDK finds its credentials through the platform
 * (GOOGLE_APPLICATION_CREDENTIALS or workload identity) - nothing secret lives in this repository.
 * For local development set FIREBASE_AUTH_EMULATOR_HOST and no credentials are needed.
 */
@Injectable()
export class FirebaseIdTokenVerifier extends IdTokenVerifier {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async verify(idToken: string): Promise<VerifiedIdToken> {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    if (!projectId) throw new AuthNotConfiguredError('FIREBASE_PROJECT_ID is not set');

    const app = getApps().length > 0 ? getApp() : initializeApp({ projectId });
    const decoded = await getAuth(app).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: typeof decoded['name'] === 'string' ? decoded['name'] : null,
    };
  }
}
