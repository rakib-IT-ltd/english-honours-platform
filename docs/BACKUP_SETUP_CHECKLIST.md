# Backup setup checklist (steps the owner does by hand)

Part of the production backup design ([`BACKUP_ARCHITECTURE.md`](./BACKUP_ARCHITECTURE.md), ADR 0010).
This is **build step 1**: only things you do yourself, in your own accounts. Nothing here runs any
automation, and the assistant needs no access to anything below.

**Golden rules**

- Never send the assistant (or anyone) a password, key, recovery code, connection string or screenshot that shows one.
- Never put any of them in GitHub, in the project folders, or in chat.
- Do the steps in order. Tick each box. When everything is ticked, send the assistant the short
  "non-secret answers" list at the end (Part G).

Time needed: about 1-2 hours, spread over a few days is fine.

## Part A - Protect your main Google account (the Owner)

This account will own the backup project and can read all backups, so it is the most important lock.

- [ ] Sign-in with **passkeys or security keys**, not only a password: Google Account -> Security -> Passkeys and security keys. Add **at least two** (for example a passkey on your phone and a physical security key, or two keys). Keep them in different places.
- [ ] 2-Step Verification is on, and the phone number and **recovery e-mail** are current and are yours alone.
- [ ] Download the **backup codes** (Security -> 2-Step Verification -> Backup codes). Store them in the password manager and the offline record (Part D), not on the computer's desktop.
- [ ] Run Google's **Security Checkup** and remove devices and apps you do not recognise.
- [ ] Consider turning on Google's **Advanced Protection Program** for this account (free; Security -> Advanced Protection). It requires passkeys/security keys and recovery options, and limits which third-party apps can access the account's data. After enabling it, check that you can still sign in to the Google Cloud console and to `gcloud` on a computer. If a tool is blocked, tell the assistant (no secrets) and we will adjust rather than weaken the protection.
- [ ] The same protection (2-step verification, strong unique password in the password manager) on the accounts that can reach your project: **GitHub, Neon, Render, Firebase**. If any of them signs in with this same Google account, they are protected by Part A already; if not, secure them separately.

## Part B - Create the break-glass Google account

A second account that only you control, used only if the main account is lost or locked.

- [ ] Create a **new Google account** with its own e-mail address (do not reuse the main account's recovery e-mail as its only recovery).
- [ ] Give it its own strong unique password, 2-Step Verification, its own recovery phone/e-mail, and its **own security key or passkey**.
- [ ] Store its credentials in the password manager and in the offline record (Part D). Do **not** sign in with it day to day. Do not tell the assistant its address or password.
- [ ] Put a note in your calendar to sign in with it once every 6 months to prove it still works (and that Google has not disabled it for inactivity).

## Part C - Password manager entries

Use a reputable password manager that you already trust, protected by a strong master password and its own 2-step protection. Create these entries (names only here; the values stay in the manager):

- [ ] "Google - Owner account": e-mail, password, where the security keys are kept, backup codes.
- [ ] "Google - Break-glass account": e-mail, password, recovery details, security key location.
- [ ] "EHP backup project": the project name and project ID (Part E), the bucket name and region once they exist, and a link to the recovery runbook in the repository.
- [ ] "Neon", "Render", "Firebase", "GitHub": usual login entries (no connection strings in notes; the Neon direct connection string is entered only in Render's settings and in your own terminal when needed).
- [ ] A secure note "Recovery kit - read this first" listing what is in the offline record and where it is kept (no secrets in the note itself).

## Part D - Offline emergency record (paper or an offline drive)

A separate record kept **outside** the computer and the password manager, in a safe place (fireproof box, or with someone you trust). Write by hand or print; do not photograph it to a phone gallery or cloud.

- [ ] Both Google accounts' e-mail addresses, and where their security keys and backup codes are.
- [ ] The master-password hint or recovery method for the password manager (not the password itself, if you can avoid it).
- [ ] The names of the backup project, bucket and key (not secret) and the line "Backups are in the Google Cloud project ... in Singapore".
- [ ] Plain-language instructions: "If the website database is lost: sign in to Google with the break-glass account, open the backup project, follow the recovery runbook in `docs/` (copy printed or in the bucket folder `recovery/`)".
- [ ] A **sealed second copy** of this record held by the person you trust (decision 3).
- [ ] The **offline escrow key** will be generated later, together with the assistant's script, on an offline step; leave a labelled space for it. Do not create it yet.

## Part E - Google Cloud project, billing and budget alert (no services yet)

Create only the empty containers. **Do not enable any APIs or create buckets, keys or jobs yet.** The assistant gives a reviewed script for those in step 2.

- [ ] Sign in to the Google Cloud console with the **Owner account** and accept the terms.
- [ ] Create a **billing account**. Decision 5: a **separate** one for backups if Google lets you create it with your payment profile; if not, use your existing one (and tell the assistant, because the 3 free Cloud Scheduler jobs are shared across a billing account).
- [ ] Create a new **project** named `ehp-backups` (it must be **separate from any project the application uses**). Google assigns a globally unique **project ID**; write it in the password manager. Link the project to the billing account.
- [ ] Add the **break-glass account as Owner** of the project (IAM & Admin -> IAM -> Grant access). Confirm both accounts show as Owner and nobody else is listed.
- [ ] Create a **budget** (Billing -> Budgets & alerts -> Create budget): scope = the `ehp-backups` project, amount about **$5 per month**, alert thresholds at **50%, 90% and 100%** of actual spend and 100% of forecasted spend, e-mail to the Owner account **and** the break-glass account. A budget only sends alerts; it does not stop services.
- [ ] Under the project's settings, note the **location/region choice for later: Singapore (asia-southeast1)**. Nothing to create yet.

## Part F - Neon (no change now)

- [ ] Stay on the **Free** plan until you decide to launch. Upgrading is a separate step: the assistant shows the quote first and you approve it.
- [ ] In the Neon console, open your project and note the **PostgreSQL version** (shown on the project dashboard) and the **region**. These are not secrets; they let the backup tools use a matching client.
- [ ] Take a manual backup yourself whenever you change data in a big way (you already know how: `pnpm db:export-content` and `bash scripts/backup.sh`).

## Part G - What to send the assistant when you are done (non-secret answers only)

Reply with:

1. Parts A-F: "all ticked", or the numbers of any you could not do and why.
2. The **project ID** of `ehp-backups` (not a secret).
3. Whether the billing account is **separate** or **shared**.
4. The Neon **PostgreSQL version** and **region**.
5. A yes/no that the break-glass account exists and has been tested (never its details).
6. Whether you enabled Advanced Protection, and whether the Google Cloud console and `gcloud` sign-in still work.

Never send passwords, codes, keys, connection strings or screenshots of them.

## What happens next (only after you reply and approve)

1. The assistant writes **step 2** as a reviewable script and a change list (bucket, key ring and key, service accounts, permissions, retention, audit logs, alerts). **You read it first.** You run it yourself from Google Cloud's own shell with the Owner account; the assistant never receives your credentials.
2. Then the backup job, the verification job, monitoring, the dry-run tests (T1-T7), the paid-database quote, and the first real backup with a real restore drill. Each is reviewed before the next.
3. Phase 1 of the CMS (the first database migration) waits until the backup system has passed its acceptance tests.
