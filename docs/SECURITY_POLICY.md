# Security Policy

> **Status:** baseline rules from [`CLAUDE.md`](../CLAUDE.md) and the foundation configuration. Full policy not yet written.

- Secrets (keys, passwords, service accounts) are supplied through environment variables or the
  hosting secret manager and are never committed. Only `*.example` templates are tracked.
- Authorization is enforced server-side in the API; clients are never trusted.
- Development and production configuration are kept separate. Swagger is disabled in production.
- The API validates its environment at start-up and refuses to run with invalid configuration.
- Browser-visible variables (`NEXT_PUBLIC_*`) must never contain secrets.
