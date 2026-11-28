# ADR 0010 - Production backups: private Google Cloud bucket, Cloud KMS, paid database

Status: **proposed; owner decisions recorded 2026-11-27; NOT implemented.** Nothing is created or automated
until the owner has reviewed [`BACKUP_ARCHITECTURE.md`](../BACKUP_ARCHITECTURE.md) and approved the build.

## Context

Once professors edit content in the app (ADR 0008) and students have accounts, the database is the only
copy of important academic material and of student information. The free Neon plan has a 6-hour history
window only and is for development and testing (ADR 0007).

## Decisions (owner, 2026-11-27)

1. Backups are stored in a **private Google Cloud Storage bucket**, in a **separate Google Cloud project**
   from the application, never in the public repository. Automated, encrypted, nightly, access restricted,
   with a retention policy.
2. **Google Cloud KMS** manages the encryption keys. The owner keeps administrative recovery access.
   Recovery procedure and account details live in a reputable password manager plus a separate offline
   emergency record. No key or credential in GitHub, source code or ordinary project files.
   Restoration must remain possible if the application server or the development environment is lost.
3. Use the free Neon plan during development and testing. **Before launch with real student accounts or
   important academic data, move to a suitable paid plan** with dependable backup and recovery. The
   expected monthly cost is shown to the owner before upgrading.
4. Backup verification and a **tested restoration** are required before the system counts as complete.
5. **No production backup automation is built until** the architecture, access permissions, recovery
   procedure, estimated costs and restoration test plan are documented and reviewed by the owner.
   Student information and academic materials come first; reliability outweighs a small monthly saving.

## Further owner decisions (2026-11-27)

Nightly backups now (every 6 hours once professors edit daily); bucket in Singapore; a monthly offline copy
plus an offline escrow key with a sealed second copy held by a trusted person; retention policy left
unlocked until after the first successful restore drill; a separate billing account if possible and a budget
alert of about $5 a month; a second owner-controlled Google "break-glass" account whose credentials are
shared with no one; a deletion log and a stated 12-month backup retention; Neon Launch with a 7-day history
window as the plan to quote. See section 16 of BACKUP_ARCHITECTURE.md and the hand-setup checklist in
BACKUP_SETUP_CHECKLIST.md.

## Proposed design (details in BACKUP_ARCHITECTURE.md)

Scheduled Cloud Run jobs in the backup project dump the database through a read-only Neon role, encrypt each
backup with a random key wrapped by Cloud KMS, and upload it with a create-only identity. A second job
restores the newest backup into a temporary database every week and compares it with a manifest. Only the
owner, a break-glass administrator and the verification job can read or unwrap; the application project has
no access. Retention: 14 daily, 8 weekly, 12 monthly, plus milestone backups. Alerts for missing or failed
backups and for security-relevant changes. Neon's history window (up to 7 days on Launch) is the fine-grained
first layer.

## Consequences

- Estimated running cost of the backup system itself: under about $2 per month; the paid database about
  $5-20 per month depending on use (see the cost section of BACKUP_ARCHITECTURE.md).
- More moving parts, justified by independence from GitHub, Render, Codespaces and Neon.
- Phase 1 of the CMS (the first database migration) waits until the system has passed its acceptance tests.
- Open decisions are listed in section 16 of BACKUP_ARCHITECTURE.md.
