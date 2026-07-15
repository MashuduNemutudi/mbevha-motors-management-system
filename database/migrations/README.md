# Database Migrations

## Run order

```bash
# 1. Initial schema (run once when setting up)
psql "postgresql://..." -f database/migrations/001_initial_schema.sql

# 2. Full upgrade — adds all new columns required by the application
psql "postgresql://..." -f database/migrations/002_upgrade_schema.sql
```

Both migrations are **idempotent** — safe to run multiple times.

If your database already has the base tables (from 001), run **002 only**.

## What 002 adds

| Table | What was added |
|-------|---------------|
| `messages` | `email`, `subject` |
| `quotations` | `customer_address`, `vehicle_colour`, `vehicle_vin`, `mileage`, `expiry_date`, `prepared_by`, `discount`, `vat_amount`; status constraint expanded to 5 values |
| `quotation_items` | `sort_order` |
| `invoices` | `customer_address`, `vehicle_make`, `vehicle_model`, `vehicle_colour`, `vehicle_vin`, `mileage`, `prepared_by`, `discount`, `vat_amount`, `payment_method`, `reference_number`, `invoice_date`; payment_status expanded to 3 values |
| `invoice_items` | `sort_order` |
