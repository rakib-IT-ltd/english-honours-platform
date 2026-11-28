# Deployment (free tier): Neon + Render + Firebase

Decision record: `docs/adr/0007-free-tier-hosting.md`. Follow the steps in order. Nothing secret is
ever committed: passwords and keys are typed into the dashboards below.

Result: a public website, an API and a database that run without your Codespace.

## 1. Firebase (login) - about 10 minutes

1. Open <https://console.firebase.google.com> -> **Add project** (any name, Analytics off).
2. **Build -> Authentication -> Get started -> Sign-in method -> Email/Password -> Enable.**
3. **Project settings (gear) -> General -> Your apps -> Web (`</>`)** -> register an app. Copy
   `apiKey` and the project id. These two values are public by design.
4. After step 4 below gives you the website address, add it under **Authentication -> Settings ->
   Authorized domains** (for example `ehp-web.onrender.com`).

You need the **project id** and the **web apiKey**. No service-account file is needed: the API only
verifies login tokens.

## 2. Neon (database) - about 5 minutes

1. Sign up at <https://neon.com> (no card) -> create a project, region close to Bangladesh
   (Singapore).
2. **Connect** -> turn **off** "Connection pooling" so the host has no `-pooler` in it -> copy the
   connection string. It looks like `postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`.
   Keep it private (this is your `DATABASE_URL`).

## 3. Load the schema and the academic content into Neon (from the Codespace)

Run in a Codespace terminal (replace the value; do not save it in any file):

```bash
export DATABASE_URL='postgresql://...your Neon string...'
pnpm --filter @ehp/api db:migrate:deploy
pnpm db:seed          # universities and programs (names only)
pnpm db:load-content  # official syllabus content (Draft/Published states exactly as in the repo)
pnpm db:publish-study -- "The American Scholar" --reviewed-by "Your Name"
```

`db:load-sample` is for local development only and refuses production. Never run it against Neon.

## 4. Render (API + website) - about 15 minutes

1. Sign up at <https://render.com> with GitHub -> **New -> Blueprint** -> pick this repository. Render
   reads `render.yaml` and proposes two services: `ehp-api` and `ehp-web`.
2. Fill the prompted values:
   - `DATABASE_URL`: the Neon string from step 2.
   - `FIREBASE_PROJECT_ID`: from step 1.
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `NEXT_PUBLIC_FIREBASE_API_KEY`: from step 1.
   - `NEXT_PUBLIC_API_BASE_URL`: `https://ehp-api.onrender.com/api/v1` (if Render gives the API another
     address, use that one).
   - `CORS_ORIGINS`: `https://ehp-web.onrender.com` (the website address, no trailing slash).
3. Deploy. Wait until both show **Live**. Open the website address.
4. If an address differs from the guesses above, fix `NEXT_PUBLIC_API_BASE_URL` / `CORS_ORIGINS` in the
   service **Environment** tab and redeploy the website (its addresses are baked in at build time).

## 5. Check

- `https://<api>/api/v1/health/ready` returns `{"status":"ok"...}`.
- The website lists universities and The American Scholar's study centre opens.
- Register and sign in work (needs step 1.4).

## Keep the API awake (optional, free)

The free API sleeps after 15 minutes without visits; the next visitor then waits about a minute.
A free uptime monitor visiting it every few minutes prevents that.

1. Sign up at <https://uptimerobot.com> (free plan).
2. **Add New Monitor** -> type **HTTP(s)** -> URL `https://ehp-api.onrender.com/api/v1/health` ->
   interval 5 to 10 minutes (use the shortest the free plan allows, but under 15).
3. Use `/health`, not `/health/ready`: it does not touch the database, so Neon still sleeps when idle
   and its free compute hours are not used up.

If the API is still slow while awake, that is a code or query problem, not the free tier: report the
page and the delay so it can be measured.

## Things to know

- **Sleep:** the free API sleeps after 15 minutes idle; the next visit waits about a minute. The
  database also sleeps after 5 minutes and wakes by itself.
- **Updates:** push to `main` and Render redeploys. New database migrations are applied on start-up.
  Content changes are loaded with `pnpm db:load-content` against Neon (step 3).
- **Backups:** the free plans give no dependable backups. The academic content lives in this
  repository, so it can be re-loaded; **students' notes and bookmarks live only in the database**
  until a paid backup plan is added. Do not rely on this setup for real student data yet.
- **Swagger** (`/api/docs`) is off in production by design.
- **Cost guard:** every service uses `plan: free`; there is nothing to be billed.

## Backups

See [`BACKUP_AND_RESTORE.md`](./BACKUP_AND_RESTORE.md): how to export, back up and restore, and the plan for automated off-site backups. Free plans have no dependable backups, so make a backup yourself before any change to the database.
