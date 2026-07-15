-- ============================================================
-- MBEVHA MOTORS MANAGEMENT SYSTEM
-- Migration 002 — Complete Schema Upgrade
-- ============================================================
--
-- PURPOSE:
--   Brings the live Neon database up to date with the current
--   application. Run this once and everything works.
--
-- HOW TO RUN:
--   Option A — psql (recommended):
--     psql "postgresql://..." -f migrations/002_upgrade_schema.sql
--
--   Option B — Neon SQL Editor:
--     Copy the entire contents of this file, paste into the
--     Neon console SQL editor, and click Run.
--
-- SAFE TO RE-RUN:
--   Every statement uses IF NOT EXISTS / DROP IF EXISTS.
--   Running it a second time causes no harm.
--
-- WHAT THIS COVERS:
--   1. messages        — add email, subject columns
--   2. quotations      — add 8 columns, fix status constraint
--   3. quotation_items — add sort_order column
--   4. invoices        — add 12 columns, fix payment constraints
--   5. invoice_items   — add sort_order column
--   6. Indexes         — add 9 performance indexes
-- ============================================================


-- ============================================================
-- 1. MESSAGES — email (optional) + subject (required)
-- ============================================================

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS email   VARCHAR(150),
  ADD COLUMN IF NOT EXISTS subject VARCHAR(200);

COMMENT ON COLUMN messages.email   IS 'Optional customer email for follow-up.';
COMMENT ON COLUMN messages.subject IS 'Subject line of the customer enquiry.';


-- ============================================================
-- 2. QUOTATIONS — 8 new columns + fix status constraint
-- ============================================================

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS customer_address  TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_colour    VARCHAR(80),
  ADD COLUMN IF NOT EXISTS vehicle_vin       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mileage           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS expiry_date       DATE,
  ADD COLUMN IF NOT EXISTS prepared_by       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Migrate any legacy 'final' rows BEFORE touching the constraint
UPDATE quotations SET status = 'sent' WHERE status = 'final';

-- Replace old ('draft','final') constraint with the full 5-value set
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_values;
ALTER TABLE quotations
  ADD CONSTRAINT quotations_status_values
  CHECK (status IN ('draft','sent','approved','rejected','converted'));

-- Non-negative guards on new numeric columns
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_discount_positive;
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_vat_positive;
ALTER TABLE quotations
  ADD CONSTRAINT quotations_discount_positive CHECK (discount   >= 0),
  ADD CONSTRAINT quotations_vat_positive      CHECK (vat_amount >= 0);

COMMENT ON COLUMN quotations.customer_address IS 'Customer postal/physical address.';
COMMENT ON COLUMN quotations.vehicle_colour   IS 'Vehicle body colour.';
COMMENT ON COLUMN quotations.vehicle_vin      IS 'Vehicle Identification Number (optional).';
COMMENT ON COLUMN quotations.mileage          IS 'Odometer reading at time of quotation.';
COMMENT ON COLUMN quotations.expiry_date      IS 'Date after which the quotation is no longer valid.';
COMMENT ON COLUMN quotations.prepared_by      IS 'Staff member who prepared the quotation.';
COMMENT ON COLUMN quotations.discount         IS 'Discount amount deducted from the subtotal.';
COMMENT ON COLUMN quotations.vat_amount       IS 'VAT charged at the applicable rate.';


-- ============================================================
-- 3. QUOTATION_ITEMS — sort_order
-- ============================================================

ALTER TABLE quotation_items
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Backfill existing rows so they keep their natural insertion order
DO $$
DECLARE
  r  RECORD;
  r2 RECORD;
  i  INT;
BEGIN
  FOR r IN SELECT DISTINCT quotation_id FROM quotation_items LOOP
    i := 0;
    FOR r2 IN
      SELECT id FROM quotation_items
      WHERE quotation_id = r.quotation_id
      ORDER BY id
    LOOP
      UPDATE quotation_items SET sort_order = i WHERE id = r2.id;
      i := i + 1;
    END LOOP;
  END LOOP;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_quotation_items_sort
  ON quotation_items(quotation_id, sort_order);


-- ============================================================
-- 4. INVOICES — 12 new columns + fix payment constraints
-- ============================================================
-- NOTE: The existing invoices table has a combined 'vehicle'
--       column. We keep it and ADD separate vehicle_make and
--       vehicle_model columns. The application writes both.
-- ============================================================

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS customer_address  TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_make      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vehicle_model     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vehicle_colour    VARCHAR(80),
  ADD COLUMN IF NOT EXISTS vehicle_vin       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mileage           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS prepared_by       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS reference_number  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS invoice_date      DATE NOT NULL DEFAULT CURRENT_DATE;

-- Back-populate invoice_date for existing rows from created_at
UPDATE invoices
  SET invoice_date = DATE(created_at)
  WHERE invoice_date = CURRENT_DATE
    AND created_at IS NOT NULL
    AND DATE(created_at) <> CURRENT_DATE;

-- Best-effort back-populate vehicle_make / vehicle_model from
-- the existing combined 'vehicle' column ("Toyota Hilux" → make/model)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'vehicle'
  ) THEN
    UPDATE invoices
    SET
      vehicle_make  = COALESCE(vehicle_make,
                               NULLIF(split_part(TRIM(vehicle), ' ', 1), '')),
      vehicle_model = COALESCE(vehicle_model,
                               NULLIF(TRIM(SUBSTRING(TRIM(vehicle)
                                 FROM POSITION(' ' IN TRIM(vehicle)) + 1)), ''))
    WHERE vehicle IS NOT NULL
      AND TRIM(vehicle) <> ''
      AND (vehicle_make IS NULL OR vehicle_model IS NULL);
  END IF;
END;
$$;

-- Replace old ('pending','paid') constraint with 3-value set
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_status_values;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_payment_status_values
  CHECK (payment_status IN ('pending','partial','paid'));

-- Payment method allowed values
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_method_values;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_payment_method_values
  CHECK (payment_method IS NULL OR payment_method IN ('cash','eft','card'));

-- Non-negative guards
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_discount_positive;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_vat_positive;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_discount_positive CHECK (discount   >= 0),
  ADD CONSTRAINT invoices_vat_positive      CHECK (vat_amount >= 0);

COMMENT ON COLUMN invoices.customer_address IS 'Customer postal/physical address.';
COMMENT ON COLUMN invoices.vehicle_make     IS 'Vehicle manufacturer (e.g. BMW, Toyota).';
COMMENT ON COLUMN invoices.vehicle_model    IS 'Vehicle model (e.g. 320i, Hilux).';
COMMENT ON COLUMN invoices.vehicle_colour   IS 'Vehicle body colour.';
COMMENT ON COLUMN invoices.vehicle_vin      IS 'Vehicle Identification Number (optional).';
COMMENT ON COLUMN invoices.mileage          IS 'Odometer reading at time of invoice.';
COMMENT ON COLUMN invoices.prepared_by      IS 'Staff member who prepared the invoice.';
COMMENT ON COLUMN invoices.discount         IS 'Discount amount deducted.';
COMMENT ON COLUMN invoices.vat_amount       IS 'VAT charged.';
COMMENT ON COLUMN invoices.payment_method   IS 'cash, eft, or card.';
COMMENT ON COLUMN invoices.reference_number IS 'EFT reference or receipt number.';
COMMENT ON COLUMN invoices.invoice_date     IS 'Date shown on the face of the invoice.';


-- ============================================================
-- 5. INVOICE_ITEMS — sort_order
-- ============================================================

ALTER TABLE invoice_items
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Backfill existing rows
DO $$
DECLARE
  r  RECORD;
  r2 RECORD;
  i  INT;
BEGIN
  FOR r IN SELECT DISTINCT invoice_id FROM invoice_items LOOP
    i := 0;
    FOR r2 IN
      SELECT id FROM invoice_items
      WHERE invoice_id = r.invoice_id
      ORDER BY id
    LOOP
      UPDATE invoice_items SET sort_order = i WHERE id = r2.id;
      i := i + 1;
    END LOOP;
  END LOOP;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_invoice_items_sort
  ON invoice_items(invoice_id, sort_order);


-- ============================================================
-- 6. INDEXES — performance on new columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_messages_subject
  ON messages(subject) WHERE subject IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quotations_status
  ON quotations(status);

CREATE INDEX IF NOT EXISTS idx_quotations_expiry
  ON quotations(expiry_date) WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quotations_created_at
  ON quotations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date
  ON invoices(invoice_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_payment_status
  ON invoices(payment_status);

CREATE INDEX IF NOT EXISTS idx_invoices_payment_method
  ON invoices(payment_method) WHERE payment_method IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_quotation_id
  ON invoices(quotation_id) WHERE quotation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_created_at
  ON invoices(created_at DESC);


-- ============================================================
-- DONE
-- ============================================================
-- Tables modified  : messages, quotations, quotation_items,
--                    invoices, invoice_items
-- Columns added    : 2 + 8 + 1 + 12 + 1 = 24
-- Constraints fixed: quotations.status (5 values),
--                    invoices.payment_status (3 values),
--                    invoices.payment_method
-- Indexes added    : 9
-- ============================================================
