# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the current product flows: people who need to share files quickly, either as guests or while signed in. Guest upload and account-based file management are equally important experiences, as confirmed by the user.

## Product Purpose

ShareO lets people upload files and share them through a link. Success means making both a quick guest transfer and signed-in file management straightforward.

## Positioning

The current product offers guest transfers without signup, optional password protection, and a 24-hour file lifetime. These are grounded in the existing interface and implementation; do not extend them into unsupported security or privacy claims.

## Operating Context

The web app supports guest file upload and sharing, plus sign-in and a dashboard for managing a user's files.

## Capabilities and Constraints

- Maximum upload size is 100 MB.
- Files expire after 24 hours.
- Uploaders can optionally protect a file with a password.
- PostgreSQL data access uses Prisma; email/password accounts use Auth.js credentials; file objects use configurable S3-compatible storage.
- Existing Supabase accounts, metadata, and stored objects are not automatically migrated. The old Supabase data is left untouched.

## Brand Commitments

- Keep the ShareO name.
- Do not add a graphic logo.

## Evidence on Hand

- Existing upload, login, and dashboard flows in the repository.
- Existing copy describes the upload size, password protection, and expiry.
- No approved testimonials, customer logos, metrics, or other marketing proof assets are present; do not fabricate them.

## Product Principles

- Make a guest transfer easy to start.
- Give signed-in users a clear path to manage their files.
- State file limits and expiry plainly.
- Do not imply security or privacy guarantees beyond implemented behavior.
