# Database Migrations

This folder tracks incremental schema changes after the initial deployment.

## Convention

Each migration file is numbered sequentially:
- `001_initial_schema.sql` — baseline schema at launch
- `002_<description>.sql`  — next change
- `003_<description>.sql`  — and so on

## How to run a migration

```bash
psql <your_neon_connection_string> -f migrations/002_your_change.sql
```

## Current migrations

| # | File | Description | Date |
|---|------|-------------|------|
| 001 | 001_initial_schema.sql | Initial schema | 2026-06 |
