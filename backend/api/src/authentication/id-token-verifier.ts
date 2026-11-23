/** What the API needs to know about a signed-in Firebase user. */
export interface VerifiedIdToken {
  uid: string;
  email: string | null;
  name: string | null;
}

/** Thrown when authentication is not configured on the server (no Firebase project set). */
export class AuthNotConfiguredError extends Error {}

/**
 * Verifies an ID token. An abstract class is used as the injection token so tests can replace the
 * Firebase implementation with a fake.
 */
export abstract class IdTokenVerifier {
  abstract verify(idToken: string): Promise<VerifiedIdToken>;
}
