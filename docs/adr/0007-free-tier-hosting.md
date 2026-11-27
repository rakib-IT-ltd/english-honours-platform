# ADR 0007 - Free-tier hosting: Neon + Render + Firebase

Status: accepted (2026-11-26)

## Context

Testing in a Codespace needs a terminal kept open. The project owner wants the website reachable
online without cost or a credit card. The stack stays as decided in ADR 0001 (Next.js, NestJS,
PostgreSQL, Firebase Auth).

## Decision

- **Database:** Neon free Postgres (1 GB, scale-to-zero, no expiry). Render's free Postgres was
  rejected because it expires 30 days after creation.
- **API:** Render free web service built from `render.yaml`; it sleeps when idle.
- **Website:** Render static site. `STATIC_EXPORT=true` switches `next.config.ts` to `output: 'export'`
  without a sub-path. This works because every route uses query parameters (ADR 0005/0006).
- **Login:** a real Firebase project (Spark plan). The API only verifies ID tokens, so it needs the
  public project id and no service-account secret.
- Secrets are entered in the dashboards (`sync: false`); nothing secret is committed.
- Migrations run on API start (`prisma migrate deploy`, idempotent). Content is loaded manually from a
  trusted machine so a sleeping API never re-runs it, and publication stays a reviewed human step.

## Consequences

- First request after idle is slow (about a minute). Acceptable for testing.
- No dependable backups on free plans; not suitable for real student data until upgraded.
- Moving later to Cloud Run or a paid always-on plan changes only `render.yaml`/DNS, not the code.
