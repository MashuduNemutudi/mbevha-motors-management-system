-- ============================================================
-- Migration 003: Extend quotations and invoices tables
-- ============================================================
-- Date: 2026-07
-- Adds fields needed for full quotation/invoice feature set:
-- customer address, full vehicle info, discount, VAT,
-- extended status values, payment method, reference number.
--
-- Run:
--   psql <connection_string> -f migrations/003_quotations_invoices_extended.sql
-- ============================================================

-- ── Quotations: new columns ─────────────────────────────────
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS customer_address  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS vehicle_colour    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vehicle_vin       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mileage           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS expiry_date       DATE,
  ADD COLUMN IF NOT EXISTS prepared_by       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Drop the old 2-value status constraint and replace with 5-value
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_values;
ALTER TABLE quotations ADD CONSTRAINT quotations_status_values
  CHECK (status IN ('draft','sent','approved','rejected','converted'));

ALTER TABLE quotations ADD CONSTRAINT quotations_discount_positive
  CHECK (discount >= 0);
ALTER TABLE quotations ADD CONSTRAINT quotations_vat_positive
  CHECK (vat_amount >= 0);

-- ── Quotation items: sort order ─────────────────────────────
ALTER TABLE quotation_items
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ── Invoices: new columns ───────────────────────────────────
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS customer_address  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS vehicle_make      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vehicle_model     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vehicle_colour    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vehicle_vin       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mileage           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payment_method    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS reference_number  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prepared_by       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS invoice_date      DATE;

-- Drop old 2-value payment status constraint; add 'partial'
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_status_values;
ALTER TABLE invoices ADD CONSTRAINT invoices_payment_status_values
  CHECK (payment_status IN ('pending','partial','paid'));

ALTER TABLE invoices ADD CONSTRAINT invoices_payment_method_values
  CHECK (payment_method IS NULL OR payment_method IN ('cash','eft','card'));

ALTER TABLE invoices ADD CONSTRAINT invoices_discount_positive
  CHECK (discount >= 0);
ALTER TABLE invoices ADD CONSTRAINT invoices_vat_positive
  CHECK (vat_amount >= 0);

-- ── Invoice items: sort order ───────────────────────────────
ALTER TABLE invoice_items
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ── Indexes for common queries ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_quotations_expiry
  ON quotations(expiry_date) WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date
  ON invoices(invoice_date) WHERE invoice_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_payment_method
  ON invoices(payment_method) WHERE payment_method IS NOT NULL;

-- Migration 003 complete.
