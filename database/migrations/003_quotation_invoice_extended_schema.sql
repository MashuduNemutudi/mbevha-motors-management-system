-- ============================================================
-- Migration 003: Extended Quotation & Invoice Schema
-- ============================================================
-- Date: 2026-07
-- Reason: Controllers and PDF service require additional columns
--         not present in the initial baseline schema.
--
-- Run AFTER 002_messages_email_subject.sql:
--   psql <connection_string> -f migrations/003_quotation_invoice_extended_schema.sql
-- ============================================================


-- ============================================================
-- QUOTATIONS — add extended columns
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

-- Drop the old restrictive status constraint and replace with the full set
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_values;
ALTER TABLE quotations
  ADD CONSTRAINT quotations_status_values
    CHECK (status IN ('draft','sent','approved','rejected','converted'));

-- Default existing 'final' rows to 'sent' (closest equivalent)
UPDATE quotations SET status = 'sent' WHERE status = 'final';

-- Add non-negative constraints on new numeric columns
ALTER TABLE quotations
  ADD CONSTRAINT quotations_discount_positive CHECK (discount   >= 0),
  ADD CONSTRAINT quotations_vat_positive      CHECK (vat_amount >= 0);

COMMENT ON COLUMN quotations.customer_address IS 'Optional customer postal or street address.';
COMMENT ON COLUMN quotations.vehicle_colour   IS 'Vehicle body colour.';
COMMENT ON COLUMN quotations.vehicle_vin      IS 'Vehicle Identification Number (optional).';
COMMENT ON COLUMN quotations.mileage          IS 'Vehicle odometer reading at time of quotation.';
COMMENT ON COLUMN quotations.expiry_date      IS 'Date after which this quotation is no longer valid.';
COMMENT ON COLUMN quotations.prepared_by      IS 'Name of the staff member who prepared the quotation.';
COMMENT ON COLUMN quotations.discount         IS 'Total discount amount applied to the quotation.';
COMMENT ON COLUMN quotations.vat_amount       IS 'VAT amount charged at the applicable rate.';


-- ============================================================
-- QUOTATION_ITEMS — add sort_order for consistent line ordering
-- ============================================================

ALTER TABLE quotation_items
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_quotation_items_sort
  ON quotation_items(quotation_id, sort_order);


-- ============================================================
-- INVOICES — add extended columns
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

-- Drop old restrictive payment_status constraint and add full set
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_status_values;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_payment_status_values
    CHECK (payment_status IN ('pending','partial','paid'));

-- Add non-negative constraints
ALTER TABLE invoices
  ADD CONSTRAINT invoices_discount_positive CHECK (discount   >= 0),
  ADD CONSTRAINT invoices_vat_positive      CHECK (vat_amount >= 0);

-- Constraint on payment_method values
ALTER TABLE invoices
  ADD CONSTRAINT invoices_payment_method_values
    CHECK (payment_method IS NULL OR payment_method IN ('cash','eft','card'));

COMMENT ON COLUMN invoices.customer_address IS 'Optional customer postal or street address.';
COMMENT ON COLUMN invoices.vehicle_make     IS 'Vehicle manufacturer extracted for invoice.';
COMMENT ON COLUMN invoices.vehicle_model    IS 'Vehicle model extracted for invoice.';
COMMENT ON COLUMN invoices.vehicle_colour   IS 'Vehicle body colour.';
COMMENT ON COLUMN invoices.vehicle_vin      IS 'Vehicle Identification Number (optional).';
COMMENT ON COLUMN invoices.mileage          IS 'Vehicle odometer reading at time of invoice.';
COMMENT ON COLUMN invoices.prepared_by      IS 'Staff member who prepared this invoice.';
COMMENT ON COLUMN invoices.discount         IS 'Total discount amount applied.';
COMMENT ON COLUMN invoices.vat_amount       IS 'VAT amount charged at the applicable rate.';
COMMENT ON COLUMN invoices.payment_method   IS 'How payment was or will be made: cash, eft, or card.';
COMMENT ON COLUMN invoices.reference_number IS 'EFT reference, POP number, or receipt number.';
COMMENT ON COLUMN invoices.invoice_date     IS 'Date on the face of the invoice (defaults to creation date).';


-- ============================================================
-- INVOICE_ITEMS — add sort_order
-- ============================================================

ALTER TABLE invoice_items
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_invoice_items_sort
  ON invoice_items(invoice_id, sort_order);


-- ============================================================
-- INDEXES — additional performance indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_quotations_expiry
  ON quotations(expiry_date)
  WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date
  ON invoices(invoice_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_payment_method
  ON invoices(payment_method)
  WHERE payment_method IS NOT NULL;


-- ============================================================
-- Migration 003 complete.
-- ============================================================
-- Tables modified: quotations, quotation_items, invoices, invoice_items
-- New columns: 8 on quotations, 1 on quotation_items,
--              12 on invoices, 1 on invoice_items
-- Constraints updated: quotations.status, invoices.payment_status
-- ============================================================
