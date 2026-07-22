# Sample database seed

This script creates or reuses four sample Auth users and seeds profiles, roles, categories, articles, comments and assessment results in the existing More Than 100 Supabase project.

The seed operates with the service-role key because it creates Auth users and assigns the initial admin role. Treat that key as a secret. Never place it in source code, commit it, share it in logs or expose it to browser code.

## Configure the local environment

1. Copy `.env.example` to `.env.local`.
2. Set `SUPABASE_URL` to the More Than 100 project URL.
3. Set `SUPABASE_SERVICE_ROLE_KEY` to the project service-role key from a secure local source.
4. Set each `SEED_*_PASSWORD` variable to the intended demo password.
5. Confirm that `.env.local` remains ignored by Git.

The committed `.env.example` contains variable names only. Do not add real values to it.

## Run safely

Make sure the target URL belongs to the intended Supabase project before continuing. The script writes data and creates confirmed demo Auth accounts.

Validate the built-in seed definition without connecting to Supabase:

```bash
npm run db:seed:validate
```

```bash
npm run db:seed
```

Run the same command a second time to check rerun behavior. Users are reused by email. Profiles and roles are upserted by their unique user identifiers, categories and articles by unique slugs, and comments and assessment results by deterministic identifiers.

To seed only application content while requiring all four sample Auth users to already exist:

```bash
node --env-file=.env.local supabase/seed-data/seed-sample-db-data.js --content-only
```

Article image URLs intentionally use clearly labeled temporary placeholders. Replace them later with generated or properly licensed project images stored in Supabase Storage.

The script stops on the first critical API error and prints progress for each major step. A successful run finishes with record counts for profiles, roles, categories, articles, comments and assessment results.
