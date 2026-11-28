# Production backup architecture (design for the owner's review)

Status: **PROPOSAL. Nothing described here has been created or automated.** No Google Cloud project,
bucket, key, secret, job or schedule exists. Implementation starts only after the owner has reviewed
and approved this document (owner instruction, 2026-11-27).

Priority set by the owner: protecting student information and academic materials. Backup reliability
matters more than saving a small monthly cost.

Builds on: [`BACKUP_AND_RESTORE.md`](./BACKUP_AND_RESTORE.md) (the tested export/restore tools),
ADR 0007 (free hosting), ADR 0008/0009 (CMS), ADR 0010 (this proposal in decision form).
Prices below were checked on 2026-11-27 (sources at the end) and must be re-checked before each purchase.

## 1. What we are protecting against

| Threat                              | Example                                                                   | Covered by                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Mistake                             | A professor or the Owner edits or deletes the wrong text; a bad migration | Neon history window (short, fine-grained) + nightly backups (long)                                                                   |
| Provider loss                       | The Neon project is deleted or its account is locked                      | Off-site backups in a different company's cloud (Google)                                                                             |
| Our environment lost                | Codespace, GitHub account, Render account all gone                        | The backup system depends on none of them (section 3, 9)                                                                             |
| Attacker with application access    | Someone obtains the API's database password                               | The backup bucket and keys live in a separate Google project; the app has no access to it; writers cannot read or delete (section 6) |
| Attacker with a backup file         | A stolen or leaked copy                                                   | Encryption before upload; the key never leaves Google KMS (section 5)                                                                |
| Loss of the key or of Google access | Key destroyed; owner locked out                                           | Key-destruction delay, a second administrator, an offline recovery record and an optional offline copy (sections 5, 9, 15)           |
| Silent failure                      | Backups stop or are unreadable for months                                 | Automatic verification, alerts, scheduled human drills (sections 8, 12)                                                              |

## 2. The owner's decisions this design implements

1. Backups go to a **private Google Cloud Storage bucket** in the owner's Google account, in a **separate
   Google Cloud project** from the application, never in the public GitHub repository. Encrypted, nightly,
   restricted access, with a retention policy.
2. **Google Cloud KMS** manages the keys. The owner stays Owner with recovery access. Credentials and
   recovery details go in a reputable password manager plus a separate offline emergency record; **no key
   or credential in GitHub, source code or ordinary project files**. Backups must stay restorable if the
   application server or the development environment is lost.
3. A **paid database** before real student accounts or important academic data; the free Neon plan only for
   development and testing. The expected monthly cost is shown first (section 11). Backup verification and a
   tested restoration are required before the system counts as complete.
4. **Do not automate or implement** the production backup system until architecture, access permissions,
   recovery procedure, costs and the restoration test plan are documented and reviewed (this document).

## 3. Architecture

```
  Neon (production DB)                         Google Cloud project "ehp-backups" (separate from the app)
  ┌──────────────────┐                         ┌──────────────────────────────────────────────────────┐
  │ PostgreSQL        │◄── read-only role ─────┤ Cloud Scheduler (nightly)                            │
  │ + 7-day history   │    "ehp_backup"        │   └► Cloud Run JOB "backup"  (identity: sa-backup)   │
  └──────────────────┘    (password in Secret  │        1. consistent snapshot, pg_dump + manifest    │
        ▲                  Manager)            │        2. encrypt with a random data key (AES-256-GCM)│
        │ (not connected to the app)           │        3. wrap that key with Cloud KMS               │
   Render API / website                        │        4. upload to the bucket (create-only)         │
   Firebase                                    │                                                      │
   GitHub / Codespaces                         │ Cloud Scheduler (weekly) ► Cloud Run JOB "verify"    │
   -- none of these can reach the backups --   │   (identity: sa-verify) downloads, decrypts, restores│
                                               │   into a throw-away PostgreSQL inside the job,       │
                                               │   compares with the manifest, writes a result        │
                                               │                                                      │
                                               │ Bucket (private, Singapore): daily/ weekly/ monthly/ │
                                               │   milestones/ verification/ recovery/                │
                                               │ Cloud KMS key ring + key "backup-key" (rotating)     │
                                               │ Monitoring alerts ──► e-mail to the owner            │
                                               └──────────────────────────────────────────────────────┘
        Restore on ANY computer:  owner signs in to Google (password manager + security key) ► gcloud ►
        download + decrypt (KMS) ► pg_restore into a new database ► point the API at it.
```

Why a Cloud Run job and not GitHub Actions: the repository is public and tied to GitHub, which the
owner wants the backups to survive losing. A Cloud Run job lives in the backup project, has its own
identity, and needs no secret stored outside Google.

### Components

| Component              | Purpose                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloud Scheduler        | Starts the backup job nightly and the verify job weekly.                                                                                                                                 |
| Cloud Run job `backup` | Dumps, encrypts and uploads. A small container with the PostgreSQL client tools matching Neon's version and the scripts from `infrastructure/backup/` (to be written after approval).    |
| Cloud Run job `verify` | Decrypts the newest backup, restores it into a temporary PostgreSQL started inside the job (no real data leaves Google, no second database to pay for), runs checks, records the result. |
| Secret Manager         | Holds only the read-only Neon backup password (one secret).                                                                                                                              |
| Cloud KMS              | Holds the key that wraps each backup's data key. Key material cannot be exported.                                                                                                        |
| Bucket                 | Stores `*.enc` backups, wrapped keys, manifests, verification results and the non-secret recovery kit.                                                                                   |
| Cloud Monitoring       | Alerts on missing/failed backups, failed verification, and changes to IAM, keys or the bucket.                                                                                           |

### What a backup consists of

- `ehp-<UTC time>.dump.enc`: a complete `pg_dump` (custom format: structure, data, migration history).
- `ehp-<UTC time>.key.wrapped`: the random data key, wrapped by KMS.
- `ehp-<UTC time>.manifest.json`: table names, row counts and checksums taken in the **same consistent
  snapshot** as the dump (using the checksum logic already in `backend/api/scripts/lib/backup-core.mjs`),
  the migration list, the software version. Not secret, but stored next to the backup.
  Using one exported snapshot for both the dump and the manifest has to be confirmed in the first test (it
  needs a direct, non-pooled Neon connection). If it cannot be done, the manifest is verified differently
  and the document is updated before approval of the build.

## 4. Backup layers (defence in depth)

| Layer                                   | What                                                   | Window                               | Where                                |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------ | ------------------------------------ |
| 1 Neon history ("instant restore")      | Undo a mistake to a chosen minute                      | Launch plan: up to 7 days            | Neon                                 |
| 2 Neon scheduled snapshots (optional)   | Named restore points                                   | by schedule                          | Neon (same provider as the database) |
| 3 **Nightly encrypted off-site backup** | Survives loss of the Neon account                      | daily 14 d, weekly 8 w, monthly 12 m | Google bucket                        |
| 4 Milestone backups                     | Before each CMS migration phase and each major release | kept until the owner releases them   | Google bucket `milestones/`          |
| 5 Optional offline monthly copy         | Survives loss of the Google account                    | monthly                              | Owner's own offline storage          |

Recovery point objective (how much work can be lost): up to 24 hours for a total loss of Neon; minutes
for a mistake within the history window. Once professors edit all day, a more frequent schedule (for
example every 6 hours) can be adopted at almost no cost: **decision 1 in section 16**.
Recovery time objective (target, measured in the drills): a working database restored within 4 hours.

## 5. Encryption and keys

- **Envelope encryption:** each backup is encrypted in the job with a fresh random 256-bit key using
  authenticated encryption (AES-256-GCM); that key is then wrapped with the Cloud KMS key. The bucket
  therefore never holds readable data, even for someone who can read the bucket. Google also encrypts all
  stored data at rest by default; this is on top.
- **The KMS key** lives in a key ring in the backup project. Only `sa-verify` and the owner can unwrap;
  `sa-backup` can only wrap (encrypt). Key material cannot be exported from KMS, so nobody can copy it
  into GitHub or a file.
- **Rotation:** automatic every 90 days (new versions only; old versions stay enabled so old backups remain
  readable; each version is billed, section 11).
- **Destruction protection:** KMS never destroys a version immediately: the default delay is 30 days and
  can be cancelled (documented by Google; we keep the default). An alert fires on any scheduled
  destruction. Destroying a version makes every backup encrypted with it unrecoverable, so only the owner
  holds the permission to do so.
- **Optional escrow (decision 3):** each data key is additionally wrapped for an offline recovery key
  (a public key stored in the bucket; the private key printed/stored offline by the owner, never online).
  Together with the monthly offline copy this lets backups be read even if the Google account were lost.
  Cost: one more secret to guard.

## 6. Access permissions (least privilege)

| Principal                                                                                                                                                | Can                                                                                              | Cannot                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **Owner** (your Google account; security key + passkey, 2-step verification)                                                                             | Administer the backup project, bucket, key, jobs; restore                                        | –                                                 |
| **Break-glass administrator** (a second account you control, credentials in the password manager and the offline record; used only if the first is lost) | Same as the Owner                                                                                | – (every use is logged and alerted)               |
| `sa-backup` (service account of the backup job)                                                                                                          | Create new objects in the bucket; wrap with the key; read the one Neon backup secret; write logs | Read, overwrite or delete any backup; unwrap keys |
| `sa-verify` (verification job)                                                                                                                           | Read backups; unwrap with the key; write verification results                                    | Delete or change backups; read the Neon secret    |
| `sa-scheduler`                                                                                                                                           | Start the two jobs                                                                               | Anything else                                     |
| Application project (Render, Firebase, Codespaces, GitHub)                                                                                               | **Nothing**                                                                                      | Everything                                        |
| Neon role `ehp_backup` (new, in Neon)                                                                                                                    | Read all data                                                                                    | Write, change structure                           |

Other rules:

- Custom service accounts only; the default accounts with broad "Editor" rights are not used.
- Service-account **keys are never created or downloaded**; jobs authenticate with the identity attached to them.
- Bucket: uniform access control, **public access prevention enforced**, no public or "all authenticated
  users" grants, bucket in Singapore (asia-southeast1).
- Without a Google Workspace/Cloud Identity organization, organization-wide policies are unavailable; the
  settings above are applied on the project, bucket and key instead (a limitation, listed in section 15).
- **Audit logs:** administrator actions are always logged; we also switch on data-access logging for the
  bucket and the key so every download and every unwrap is recorded.
- The first run is done by hand by the owner following a written step-by-step list (section 13); the owner
  keeps the only copy of administrator rights and the break-glass account.

## 7. Retention and immutability

| Copy              | Kept                        | How                                      |
| ----------------- | --------------------------- | ---------------------------------------- |
| Daily             | 14 days                     | lifecycle rule on `daily/`               |
| Weekly (Sunday's) | 8 weeks                     | job copies to `weekly/`; lifecycle rule  |
| Monthly (1st)     | 12 months                   | job copies to `monthly/`; lifecycle rule |
| Milestone         | until the owner releases it | `milestones/`, manual                    |

- Standard storage class (the cold classes have minimum storage periods and tiny savings at this size).
- **Soft delete** on the bucket (Google's default is 7 days; we set 30) so a deleted backup can still be recovered.
- **Retention policy** (objects cannot be deleted or replaced before a minimum age): start **unlocked**
  at 14 days. **Locking it is permanent** (it cannot be removed or shortened; the bucket cannot be deleted
  until every object has aged out), so the lock is a separate decision after the first successful restore
  drill (**decision 4**).
- Object versioning is off (names are unique per run; soft delete covers accidents).

## 8. Monitoring, alerts and budget

| Alert                       | Trigger                                                                                                               | Goes to                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| No new backup               | none in the daily folder for more than 26 hours                                                                       | e-mail to the owner (+ the break-glass address) |
| Backup or verify job failed | job error                                                                                                             | same                                            |
| Verification failed         | `verification/` result says FAIL, or none for 8 days                                                                  | same                                            |
| Security change             | IAM policy change, key disabled or destruction scheduled, bucket retention change, bucket deletion, break-glass login | same                                            |
| Cost                        | budget alerts at about 50%, 100% and 200% of the expected cost                                                        | same                                            |

Alerts are proven during acceptance by deliberately breaking a backup in a test (section 12).

## 9. Recovery procedure (runbook outline)

The full step-by-step runbook, with exact commands, is written after approval and tested in the drills.
It needs only: **a computer, the Google account (or the break-glass account), `gcloud`, PostgreSQL tools,
and a new empty database.** It does **not** need Codespaces, GitHub, Render, Firebase or the old server.

1. Sign in to Google (password manager entry + security key). If locked out: use the break-glass account.
2. Open the backup project; pick the newest backup in `daily/` (or an older one if the newest is suspect).
3. Download `.dump.enc`, `.key.wrapped`, `.manifest.json`.
4. Unwrap the data key with KMS; decrypt; check the checksum against the manifest.
5. Create a new empty Neon database (or branch); restore with `pg_restore --single-transaction` (the tested
   `scripts/restore.sh` procedure, and the manifest check).
6. Verify counts against the manifest; start the API against it; check the website, one published
   section, and the staff accounts.
7. Switch the application's database setting to the restored database (Render environment variable).
8. Re-apply any deletions of student data recorded since the backup (section 10).
9. Write down what happened and how long it took.

### Recovery kit (so that losing the application or your laptop is survivable)

| Item                                                                | Where                                                                             | Notes                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Google account recovery details, security keys, 2-step backup codes | Password manager **and** the offline emergency record                             | At least two security keys, stored in different places |
| Break-glass administrator credentials                               | Offline emergency record + password manager                                       | Used only in emergencies                               |
| Names of the backup project, bucket and key                         | Password manager, offline record, and the `recovery/` folder of the bucket        | Names are not secrets                                  |
| This runbook and the restore scripts                                | `recovery/` folder of the bucket, printed copy, and the public repository         | Contains no secret                                     |
| Offline escrow key (only if decision 3 = yes)                       | Offline only (paper/hardware); a second sealed copy with a trusted person or safe | Never online                                           |
| Who to call / what to do, in plain language                         | Offline emergency record                                                          | For a stressful day                                    |

### Loss scenarios (each is rehearsed)

| What is lost                                           | What still works                                   | Recovery                                                                              |
| ------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Codespace / laptop                                     | Everything online                                  | New computer; run the runbook                                                         |
| GitHub account or repo                                 | Backups, Google                                    | Runbook copy in the bucket; scripts copy in the bucket                                |
| Render / Firebase                                      | Backups, Neon                                      | Re-deploy elsewhere; restore not needed unless the database is also lost              |
| Neon project deleted                                   | Google backups                                     | Restore into a new database                                                           |
| Your Google account locked                             | Break-glass account, offline record                | Use the break-glass account; if both are lost: offline copy + escrow key (if enabled) |
| A KMS key version scheduled for destruction by mistake | Within the 30-day delay                            | Cancel the destruction                                                                |
| Everything at once                                     | Offline record + offline monthly copy + escrow key | Slowest path; the reason decision 3 matters                                           |

## 10. Student information in backups

- A full backup contains students' e-mail addresses, notes, bookmarks and progress. It is encrypted, access is
  limited to the two administrators and the verify job, and every access is logged.
- A student who asks for deletion is removed from the live database at once but remains in older backups
  until they age out (up to 12 months in monthly copies). Policy proposed: keep a **deletion log** (an
  identifier and date, no personal content) and re-apply it after any restore; state the backup retention
  in the privacy notice shown to students. (Legal advice is outside this document; check the applicable
  Bangladeshi requirements before launch.)
- Backups are never used to populate development or test environments; developers use the labelled sample
  data only.
- Restore drills run inside Google (the verify job) or on the owner's own computer, and the files are deleted afterwards.

## 11. Expected monthly cost (US dollars, estimates)

Assumptions: a small site (about 1 GB of data, compressed backups between 20 MB and 2 GB), 34 retained
copies (14 daily + 8 weekly + 12 monthly), Neon Launch plan with the smallest compute (about 0.25 CU, to be
confirmed in the console), history window 7 days with about 0.5 GB of change history.

**Neon (the paid database)** - Launch plan has no monthly minimum; it is pay-as-you-go.

| Item                           | Price              | Estimate                                                          |
| ------------------------------ | ------------------ | ----------------------------------------------------------------- |
| Compute                        | $0.106 per CU-hour | 0.25 CU busy 6 h/day: $4.77 · 12 h/day: $9.67 · always on: $19.34 |
| Storage                        | $0.35 per GB-month | 1 GB: $0.35                                                       |
| Instant-restore history        | $0.20 per GB-month | about 0.5 GB: $0.10                                               |
| Scheduled snapshots (optional) | $0.09 per GB-month | about $0.09                                                       |
| **Neon total**                 |                    | **about $5 (quiet) · $10 (expected) · $20 (always on)**           |

Cost control: cap the autoscaling maximum in the Neon console (1 CU always on would be about $77/month,
so the cap matters) and set a spending alert. Invoices under $0.50 are not collected.

**Google Cloud backup project**

| Item                                         | Price                                                               | Estimate                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Bucket storage (Singapore, Standard)         | $0.020 per GB-month                                                 | 20 MB backups: $0.01 · 200 MB: $0.14 · 2 GB: $1.36                                           |
| Cloud KMS key                                | $0.06 per active key version per month; $0.03 per 10,000 operations | 1 version $0.06; with rotation up to 5 versions in a year $0.30; operations well under $0.01 |
| Secret Manager                               | first 6 secret versions free                                        | $0 (one secret)                                                                              |
| Cloud Scheduler                              | 3 jobs per billing account free, then $0.10 each                    | $0 (2 jobs) if the billing account has no other jobs                                         |
| Cloud Run jobs                               | free monthly tier: 240,000 vCPU-seconds and 450,000 GiB-seconds     | $0 (a few minutes per night)                                                                 |
| Logging, monitoring, container image storage | small; included allowances expected to cover it                     | about $0 to $0.10 (to be confirmed with the pricing calculator)                              |
| Downloading a backup in an emergency         | per-GB internet egress                                              | a few cents (price not quoted here; checked at build time)                                   |
| **Google total**                             |                                                                     | **about $0.10 to $2 per month**                                                              |

**Whole system when real users start** (the backup system itself costs under about $2; the rest is hosting)

|                                                                                                             | Quiet         | Expected      | Always on     |
| ----------------------------------------------------------------------------------------------------------- | ------------- | ------------- | ------------- |
| Neon Launch                                                                                                 | $5.22         | $10.12        | $19.80        |
| Google backup project                                                                                       | $0.10         | $0.50         | $2.00         |
| Render API "Starter" (always awake; the free one sleeps)                                                    | $7.00         | $7.00         | $7.00         |
| **Total**                                                                                                   | **about $12** | **about $18** | **about $29** |
| Website (Render static site) and Firebase sign-in stay free at this scale. The Render figure is the plan    |
| price listed on 2026-11-27 and is not part of the backup system; it is shown because an always-awake API is |
| what "real users" need. Re-check every figure in the provider's console before upgrading; I will show the   |
| actual quote and ask for your go-ahead first.                                                               |

## 12. Verification and the restoration test plan

| Test                             | When                                              | What is checked                                                                                                                                                                                                                 | Pass means                                                                                      |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **T1 integrity**                 | After every backup (automatic)                    | file exists, size within a sane range of the previous one, authenticated decryption succeeds, checksum equals the manifest                                                                                                      | all true                                                                                        |
| **T2 automatic restore**         | Weekly (automatic, inside Google)                 | restore into a temporary PostgreSQL; per-table row counts and checksums equal the manifest; foreign-key integrity; migration history is the expected list; at least one published section with text and Bangla text             | all true; result file written; alert on FAIL                                                    |
| **T3 human drill**               | Monthly, and once before launch                   | The owner (or a helper) uses only the recovery kit on a computer **without** Codespaces/GitHub access: sign in, download, decrypt, restore into a new Neon database, open the site against it, compare one known published text | works with the runbook only; time recorded (target 4 hours); problems fed back into the runbook |
| **T4 pre-migration rehearsal**   | Before every CMS migration phase                  | fresh milestone backup, restore into a scratch database, run the migration there, compare the public API output before and after                                                                                                | identical output                                                                                |
| **T5 failure injection**         | Once at acceptance, repeated after any big change | break the backup on purpose (bad password, blocked job); confirm the alert arrives; confirm a stale backup raises the "no new backup" alert                                                                                     | alerts fire within the stated times                                                             |
| **T6 key and account scenarios** | Once at acceptance                                | disable the key and re-enable it; schedule a key version for destruction and cancel it; sign in with the break-glass account; (if enabled) decrypt a backup using only the offline escrow key and the offline copy              | each recovers as documented                                                                     |
| **T7 security checks**           | Once at acceptance                                | `sa-backup` cannot read or delete; the application project cannot list the bucket; no public access; logs show the downloads and unwraps                                                                                        | all refused/visible as designed                                                                 |

**Acceptance: the backup system is complete only when** T1 to T7 have passed, T3 has been performed by the
owner within the target time, the cost report matches section 11 within a reasonable margin, the runbook
has been reviewed and corrected after T3, and the owner has signed off. Until then the status stays
"in progress", and the free-tier warning in `BACKUP_AND_RESTORE.md` stays.

## 13. Build steps (after your approval; each step reviewed before the next)

1. **Prerequisites (you):** a Google Cloud billing account, the separate project, security keys and
   2-step verification on the owner account, the break-glass account, a budget alert. Done by hand with `BACKUP_SETUP_CHECKLIST.md`.
2. **Foundations:** bucket, key ring and key, service accounts, permissions, retention and lifecycle, audit logs; documented as a reviewable script in `infrastructure/backup/` (no secrets). Reviewed by you before it runs.
3. **Backup job:** container and script, tested against a scratch Neon database with sample data.
4. **Verify job** and the weekly schedule.
5. **Monitoring and alerts**, then T5.
6. **Dry runs** T3, T6, T7 with sample data; fix the runbook.
7. **Switch to the paid Neon plan** (after you approve the quote), point the backup at the production database, first real backup, **T3 with real data**.
8. Sign-off; decision on locking the retention policy.
   Phase 1 of the CMS (the first database migration) waits for step 7.

## 14. Alternatives considered

| Option                                      | Why not (as the main solution)                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| GitHub Actions nightly job                  | The repository is public and depends on GitHub; secrets and logs sit in the same account the owner wants backups to survive. |
| Only Neon snapshots and history             | Same company and account as the database; a window of at most 7 days on Launch (30 on Scale). Kept as layers 1-2.            |
| Backups stored on Render                    | Same failure domain as the application.                                                                                      |
| Server-side encryption of the bucket only   | Anyone with read access to the bucket could read student data. Envelope encryption removes that.                             |
| Rotating one long-lived downloaded key file | Creates a secret to leak; KMS keeps the key inside Google.                                                                   |

## 15. Residual risks and limits (stated honestly)

- Backups are only as good as the last verified restore. That is why verification and drills are part of "done".
- KMS keys cannot be exported: if Google access and the break-glass account were both lost and there is no
  offline copy plus escrow key, the encrypted backups would be unreadable. Hence decision 3.
- A personal Google account has no organization-level policies; protection relies on project, bucket and key settings, strong sign-in, and alerts.
- A backup taken at 02:00 loses later edits in a total-loss case (see the schedule decision).
- Locking the retention policy is irreversible; deliberately postponed until after the first drill.
- Prices and plan limits change; they are re-checked before purchase.
- Backups contain personal data for as long as they are kept (section 10).

## 16. Owner decisions (recorded 2026-11-27: "agree to all")

| #   | Decision                    | Chosen                                                                                                                                                            |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Backup frequency            | **Nightly now**; move to every 6 hours when professors start editing daily                                                                                        |
| 2   | Bucket region               | **Singapore (asia-southeast1)**                                                                                                                                   |
| 3   | Offline copy and escrow key | **Yes**: a monthly offline copy and an offline recovery (escrow) key on paper, with a sealed second copy held by a trusted person                                 |
| 4   | Retention lock              | **Left unlocked** until after the first successful restore drill; then decide (locking is permanent)                                                              |
| 5   | Billing                     | A **separate billing account** if Google allows it (otherwise the same one; the 3 free scheduler jobs are per billing account); **budget alert about $5 a month** |
| 6   | Break-glass account         | A **second Google account controlled only by the owner**; its credentials are never shared with anyone, including the assistant                                   |
| 7   | Student deletions           | A **deletion log** (identifier and date, no personal content) re-applied after any restore; the privacy notice states backups are kept up to **12 months**        |
| 8   | Neon plan to quote          | **Launch** with a **7-day history window** (the quote is shown to the owner before any upgrade)                                                                   |

The hand-done prerequisites that follow from these decisions are in
[`BACKUP_SETUP_CHECKLIST.md`](./BACKUP_SETUP_CHECKLIST.md). Build step 1 is not finished until the owner
has completed that checklist; building (step 2 onward) still needs the owner's explicit go-ahead after
reviewing the checklist results.

## Sources (checked 2026-11-27)

- Neon pricing: https://neon.com/pricing and history window https://neon.com/docs/postgres/backup-restore/history-window
- Cloud Storage pricing: https://cloud.google.com/storage/docs/pricing ; soft delete https://docs.cloud.google.com/storage/docs/soft-delete ; Bucket Lock https://docs.cloud.google.com/storage/docs/bucket-lock
- Cloud KMS pricing: https://cloud.google.com/kms/pricing ; key destruction https://docs.cloud.google.com/kms/docs/destroy-restore
- Secret Manager pricing: https://cloud.google.com/secret-manager/pricing ; Cloud Scheduler pricing: https://cloud.google.com/scheduler/pricing ; Cloud Run pricing: https://cloud.google.com/run/pricing
- Render plan prices: https://render.com/pricing.md
