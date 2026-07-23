-- ============================================================
-- MBEVHA MOTORS — Run this in the Neon SQL Editor
-- Paste the entire file, then click Run.
-- Safe to run multiple times.
-- ============================================================

-- ── messages: email + subject ───────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS email   VARCHAR(150);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(200);

-- ── quotations: extended columns ────────────────────────────
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_address  TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS vehicle_colour    VARCHAR(80);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS vehicle_vin       VARCHAR(100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS mileage           VARCHAR(50);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS expiry_date       DATE;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS prepared_by       VARCHAR(100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS discount          NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(10,2) NOT NULL DEFAULT 0;

UPDATE quotations SET status = 'sent' WHERE status = 'final';
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_values;
ALTER TABLE quotations ADD CONSTRAINT quotations_status_values
  CHECK (status IN ('draft','sent','approved','rejected','converted'));

-- ── quotation_items: sort_order ─────────────────────────────
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ── invoices: extended columns ──────────────────────────────
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_address  TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vehicle_make      VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vehicle_model     VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vehicle_colour    VARCHAR(80);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vehicle_vin       VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS mileage           VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS prepared_by       VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount          NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method    VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reference_number  VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date      DATE NOT NULL DEFAULT CURRENT_DATE;

UPDATE invoices SET invoice_date = DATE(created_at)
  WHERE created_at IS NOT NULL AND DATE(created_at) <> CURRENT_DATE;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_status_values;
ALTER TABLE invoices ADD CONSTRAINT invoices_payment_status_values
  CHECK (payment_status IN ('pending','partial','paid'));

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_method_values;
ALTER TABLE invoices ADD CONSTRAINT invoices_payment_method_values
  CHECK (payment_method IS NULL OR payment_method IN ('cash','eft','card'));

-- ── invoice_items: sort_order ───────────────────────────────
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ── business_info: landline + email ─────────────────────────
ALTER TABLE business_info ADD COLUMN IF NOT EXISTS phone_landline VARCHAR(20);
ALTER TABLE business_info ADD COLUMN IF NOT EXISTS email          VARCHAR(100);

-- ── job_cards table (NEW) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS job_cards (
  id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_number     VARCHAR(50)     NOT NULL,
  job_date            DATE            NOT NULL DEFAULT CURRENT_DATE,
  vehicle_make        VARCHAR(100),
  registration_number VARCHAR(50),
  vehicle_colour      VARCHAR(80),
  vehicle_vin         VARCHAR(100),
  mileage             VARCHAR(50),
  owner_name          VARCHAR(150)    NOT NULL,
  id_number           VARCHAR(50),
  contact_number      VARCHAR(20)     NOT NULL,
  residential_address TEXT,
  job_description     TEXT,
  items_checklist     JSONB           NOT NULL DEFAULT '[]',
  battery_type        VARCHAR(60),
  battery_colour      VARCHAR(60),
  battery_size        VARCHAR(60),
  technician_name     VARCHAR(100),
  received_by         VARCHAR(100),
  status              VARCHAR(20)     NOT NULL DEFAULT 'open',
  notes               TEXT,
  created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
  CONSTRAINT job_cards_number_unique UNIQUE (job_card_number),
  CONSTRAINT job_cards_status_values CHECK (status IN ('open','in_progress','completed','cancelled'))
);

-- Add received_by to existing job_cards if table already existed without it
ALTER TABLE job_cards ADD COLUMN IF NOT EXISTS received_by VARCHAR(100);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_job_cards ON job_cards;
CREATE TRIGGER set_updated_at_job_cards
  BEFORE UPDATE ON job_cards
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_cards_number     ON job_cards(job_card_number);
CREATE INDEX IF NOT EXISTS idx_job_cards_status     ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_at ON job_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_cards_owner      ON job_cards(owner_name);

-- ── Done ─────────────────────────────────────────────────────
-- All tables are now up to date.
-- ============================================================
