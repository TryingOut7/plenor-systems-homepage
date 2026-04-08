# DB Workflow (New Feature -> Migration -> Verify -> Deploy)

## Rules
- Use migrations-first everywhere.
- Do not use `PAYLOAD_DB_PUSH` on shared DBs (preview/staging/production).
- Every schema change must be represented by migration files.
- Production DB schema/data updates are allowed only through `main` branch deploys.

## Sequence
1. Implement the feature in code (collections/globals/backend logic).
2. Regenerate Payload schema artifacts:
   - `npm run generate:types`
   - `npm run generate:db-schema`
3. Create migrations:
   - If Payload schema changed: `npm run generate:migration -- <short_name>`
   - If backend SQL changed: add `migrations/versions/<NNNN>_<name>.up.sql` and `.down.sql`
4. Apply locally:
   - `npm run db:schema:ensure`
5. Verify locally:
   - `npm run db:schema:ensure:check`
   - `npm run check:type`
6. Commit all schema-related files together:
   - `migrations/payload/*` (and `migrations/payload/index.ts` if updated)
   - `migrations/versions/*.sql` (if any)
   - `src/payload-generated-schema.ts`
   - `src/payload-types.ts` (if changed)
7. Push and deploy:
   - Pre-push hook re-checks DB parity.
   - Vercel build runs `npm run db:schema:ensure` before `next build`.
   - Only pushes/merges to `main` should target and update the production DB.

## For Preview/Production DBs
- To verify a specific environment DB manually:
  - `POSTGRES_URL='<env_db_url>' npm run db:schema:ensure:check`
- To apply missing migrations to that DB:
  - `POSTGRES_URL='<env_db_url>' npm run db:schema:ensure`

## Operator Queries
- Registration submission export/delete SQL reference:
  - `docs/REGISTRATION_SUBMISSIONS_OPERATIONS.md`
