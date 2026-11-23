# ADR 0004: Authentication and student profile

Status: accepted (owner approved the proposal).

## Decision

- Sign-in with **email + password** through Firebase Authentication. No social login, phone numbers
  or admin/reviewer roles yet.
- The API never sees passwords. The website sends the Firebase ID token as `Authorization: Bearer`;
  the API verifies it with `firebase-admin` behind an abstract `IdTokenVerifier`.
- The API creates its own `User` row on the first `GET /me`. It stores only email, display name,
  preferred language and academic identity (university, program, level, optional session).
- Development uses the **Firebase Auth Emulator** (project `demo-ehp`), so no Firebase account or
  secret is needed. A real project is only needed when going live.
- Responses: 401 missing/invalid token, 503 when verification is not configured, 422 when the
  chosen program/level/session is inconsistent with the university (also enforced by composite
  foreign keys in the database).

## Consequences

- `NEXT_PUBLIC_FIREBASE_*` values are public configuration, not secrets. Service-account keys must
  never be committed.
- Email verification is not enforced yet; the Flutter app will reuse the same API later.
