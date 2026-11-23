import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
} from 'firebase/auth';

/**
 * Thin wrapper around Firebase Authentication (email + password). The Firebase web configuration
 * is public by design - it is not a secret. When it is absent (for example the static GitHub Pages
 * preview) authentication is simply reported as not configured.
 *
 * For local development without a Firebase account, set NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL to
 * the Firebase Auth Emulator and use any placeholder API key.
 */
export interface SignedInUser {
  email: string | null;
  displayName: string | null;
}

export type AuthErrorKind =
  'invalidCredentials' | 'emailInUse' | 'weakPassword' | 'network' | 'unknown';

const apiKey = process.env['NEXT_PUBLIC_FIREBASE_API_KEY'];
const projectId = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
const emulatorUrl = process.env['NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL'];

export function isAuthConfigured(): boolean {
  return Boolean(apiKey && projectId);
}

let emulatorConnected = false;

function auth(): Auth {
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey,
          projectId,
          authDomain:
            process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? `${projectId}.firebaseapp.com`,
        });
  const instance = getAuth(app);
  if (emulatorUrl && !emulatorConnected) {
    connectAuthEmulator(instance, emulatorUrl, { disableWarnings: true });
    emulatorConnected = true;
  }
  return instance;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth(), email, password);
  if (displayName) await updateProfile(credential.user, { displayName });
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth(), email, password);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth());
}

/** Calls back with the current user (or null) now and whenever it changes. */
export function subscribeToAuth(callback: (user: SignedInUser | null) => void): () => void {
  return onAuthStateChanged(auth(), (user) =>
    callback(user ? { email: user.email, displayName: user.displayName } : null),
  );
}

/** A fresh ID token for calling the API, or null when nobody is signed in. */
export async function getIdToken(): Promise<string | null> {
  const user = auth().currentUser;
  return user ? user.getIdToken() : null;
}

export function authErrorKind(error: unknown): AuthErrorKind {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'invalidCredentials';
    case 'auth/email-already-in-use':
      return 'emailInUse';
    case 'auth/weak-password':
      return 'weakPassword';
    case 'auth/network-request-failed':
      return 'network';
    default:
      return 'unknown';
  }
}
