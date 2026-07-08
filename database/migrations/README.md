# Database Migrations

This folder tracks incremental schema changes after the initial deployment.

## Convention

Each migration file is numbered sequentially:
- `001_initial_schema.sql` — baseline schema at launch
- `002_<description>.sql`  — next change
- `003_<description>.sql`  — and so on

Always run migrations in order.

## How to run a migration

```bash
psql <your_neon_connection_string> -f migrations/002_employee_preparation.sql
```

## Current migrations

| # | File | Description | Date |
|---|------|-------------|------|
| 001 | 001_initial_schema.sql | Initial schema (admins, parts, gallery, quotations, invoices, messages, business_info, activity_logs) | 2026-06 |
| 002 | 002_employee_preparation.sql | employees + attendance tables for future Employee Management module | 2026-07 |

## Employee ID Design Note

The `employees` table uses a **user-defined `employee_id`** (e.g. `EMP-001`) as its primary key — not an auto-generated UUID or serial integer. This matches the business requirement: the Employee ID is the primary identifier used on attendance records and future reports. This means:

- The admin assigns the Employee ID manually when creating an employee record
- The ID is meaningful to the business (e.g. `TECH-001`, `ADMIN-002`)
- All attendance records reference this ID via a foreign key
- Future quotation and activity log linkage should use this same ID
