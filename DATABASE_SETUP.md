# Database and storage setup

ShareO uses PostgreSQL through Prisma, Auth.js credentials for accounts, and an S3-compatible bucket for file contents.

## Environment

Copy `.env.example` to `.env` if needed. Keep the existing `DATABASE_URL` value; do not replace it with the example URL. Set:

- `NEXTAUTH_SECRET` to a new random secret (for example, generate one with `openssl rand -base64 32`).
- `NEXTAUTH_URL` to the canonical app origin.
- `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY` for the private bucket.
- `S3_ENDPOINT` for providers such as R2 or MinIO. Leave it empty for AWS S3.
- `S3_FORCE_PATH_STYLE=true` only when the provider requires path-style requests.
- `CRON_SECRET` (optional) to enable scheduled deletion of expired S3 objects.

Never expose database or object-storage credentials through `NEXT_PUBLIC_*` variables or commit `.env`.

Vercel does not upload the local `.env` file. Add `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and the required S3 settings in the Vercel project's Environment Variables for each deployment environment.

## Initialize PostgreSQL

Run these commands after setting `DATABASE_URL`:

```powershell
npx prisma generate
npx prisma migrate deploy
```

The migration creates `shareo_users` and `shareo_files`. It does not drop or rewrite existing tables.

## Existing Supabase data

This migration does not copy Supabase accounts, file metadata, or uploaded objects. Existing Supabase data remains untouched; users must create accounts in the new system and old Supabase-hosted links are not served by the migrated app.

## Object storage

Create a private bucket before uploading files. Configure provider credentials as server-only variables in `.env`. The upload API returns an explicit configuration error until the required S3 settings are present.

Expired files are removed when accessed. For proactive cleanup, set `CRON_SECRET` and schedule `GET /api/cron/cleanup` at an interval of your choice with `Authorization: Bearer <CRON_SECRET>`.
