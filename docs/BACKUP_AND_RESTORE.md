# Backup and restore

Why this matters: once professors edit academic material inside the app (ADR 0008), the database
holds the **only copy** of that work. The free Neon/Render setup (ADR 0007) is for trying the
platform. **Before real professors and students depend on it, the automated backups in
"Plan" below must be in place and a restore must have been practised.**

## What exists now (tested on a scratch database)

| Tool                     | What it makes                                                                                                                                                     | Restores into                                                              | Use it for                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm db:export-content` | One readable JSON file with a checksum per table. Default = **full** (content, review history and students' data). `-- --content-only` leaves out students' data. | A database that already has the same migrations. `pnpm db:restore-content` | A portable copy you can open, compare and check; moving content between databases. |
| `bash scripts/backup.sh` | A complete `pg_dump` file (`database/backups/*.dump`).                                                                                                            | A new, empty database. `bash scripts/restore.sh`                           | The complete safety copy (structure + data + migration history).                   |

Both are read-only on the source database. Files are written to `database/backups/` (git-ignored,
file mode 600). **A full export or dump contains students' emails and notes: keep it private, never
commit or share it.** Never paste the connection string into chat; set it only in your own terminal.

### Make a backup (Codespace terminal)

```bash
export DATABASE_URL='<your Neon direct connection string>'   # not the -pooler one
pnpm db:export-content                 # full JSON export
pnpm db:export-content -- --content-only
bash scripts/backup.sh                 # complete pg_dump
```

Then download the file from `database/backups/` (right-click -> Download) and keep it somewhere
private, outside GitHub.

### Restore (always into a NEW database first)

1. Create an empty database (a new Neon branch or database). Never restore over the live database as a first step.
2. **pg_dump file:** `RESTORE_DATABASE_URL='<new database url>' bash scripts/restore.sh <file.dump> <new-database-name>`
   It runs in one transaction; if anything already exists or fails, nothing is changed.
3. **JSON export:** point `DATABASE_URL` at the new database, run `pnpm db:migrate:deploy`, then
   `pnpm db:restore-content -- <file.json> --confirm-database <new-database-name>`
   - The migrations of the database must equal those in the file, or it refuses.
   - You must type the target database name (`--confirm-database`), or it refuses.
   - Every table is read back and compared with the file's checksums **before** the transaction is
     committed. Any difference (or any error) cancels everything.
   - A freshly migrated database already has the 5 shared academic levels; they are accepted (and refreshed) automatically.
   - Other existing data in a table is refused unless you add `--replace`. `--replace` empties the
     tables in the file first, and PostgreSQL refuses if other tables (for example students' data)
     still depend on them, so a content-only file can never silently wipe students.
4. Check the website/API against the restored database, then switch `DATABASE_URL` on Render to it.

### What was tested (2026-11-27, throwaway PostgreSQL 16, all migrations applied)

Source: 2 universities, 55 courses, 8 sections, 230 study items (Bangla included), 1 student note.

- Full export -> restore into a freshly migrated empty database -> export again: **identical checksum**.
- Bangla text in the restored database is byte-identical (checked by hash).
- Restoring again onto identical data works; onto damaged data it refuses; with `--replace` it repairs
  and the result is identical again.
- Refused, and nothing changed: no confirmation, wrong database name, tampered file (checksum),
  damaged row count, different migrations, content-only `--replace` over a database with students,
  an invalid row with valid checksums (rolled back; the target stayed as before).
- Content-only export contains no student tables and restores into a fresh database.
- `pg_dump` -> `restore.sh` into a new database -> export: **identical checksum**; wrong or missing
  name refused; a second restore into the now non-empty database fails without changing it.
- 22 unit tests cover the checks (`backend/api/src/backup-core.spec.ts`).

Not tested: a real Neon database (the same commands apply; Neon's pooled connection string must not be used).

## Plan: dependable automated backups (designed, NOT implemented)

The owner has decided (2026-11-27): encrypted nightly backups to a private Google Cloud Storage bucket in a
separate Google Cloud project, keys in Google Cloud KMS, a paid database before real users, and no
automation until the design is reviewed. The full design (architecture, access permissions, recovery
procedure, cost estimate, restoration test plan, open decisions) is in
[`BACKUP_ARCHITECTURE.md`](./BACKUP_ARCHITECTURE.md), recorded as
[ADR 0010](./adr/0010-production-backup-architecture.md).

Until that system is built, passes its tests and is signed off by the owner, the free-plan warning at the top
of this page applies: make a backup yourself (`pnpm db:export-content` and `bash scripts/backup.sh`) before
any change to the database, and do not rely on the free Neon history (6 hours).
