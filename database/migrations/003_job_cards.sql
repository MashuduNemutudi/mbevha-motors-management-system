-- ============================================================
-- Migration 003: Job Cards + Business Info Landline
-- ============================================================
-- Run:
--   psql "postgresql://..." -f migrations/003_job_cards.sql
-- Safe to run multiple times (IF NOT EXISTS throughout).
-- ============================================================


-- ── business_info: add landline and email columns ──────────
ALTER TABLE business_info
  ADD COLUMN IF NOT EXISTS phone_landline VARCHAR(20),
  ADD COLUMN IF NOT EXISTS email          VARCHAR(100);

COMMENT ON COLUMN business_info.phone_landline IS 'Landline / office telephone number.';
COMMENT ON COLUMN business_info.email          IS 'Business email address.';


-- ── job_cards table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_cards (
  id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_number     VARCHAR(50)     NOT NULL,
  job_date            DATE            NOT NULL DEFAULT CURRENT_DATE,

  /* Vehicle */
  vehicle_make        VARCHAR(100),
  registration_number VARCHAR(50),
  vehicle_colour      VARCHAR(80),
  vehicle_vin         VARCHAR(100),
  mileage             VARCHAR(50),

  /* Owner */
  owner_name          VARCHAR(150)    NOT NULL,
  id_number           VARCHAR(50),
  contact_number      VARCHAR(20)     NOT NULL,
  residential_address TEXT,

  /* Job */
  job_description     TEXT,

  /* Items checklist — stored as a JSON array of strings e.g. ["Key","Radio"] */
  items_checklist     JSONB           NOT NULL DEFAULT '[]',

  /* Battery */
  battery_type        VARCHAR(60),
  battery_colour      VARCHAR(60),
  battery_size        VARCHAR(60),

  /* Staff */
  technician_name     VARCHAR(100),

  /* Workflow */
  status              VARCHAR(20)     NOT NULL DEFAULT 'open',

  notes               TEXT,
  created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

  CONSTRAINT job_cards_number_unique  UNIQUE (job_card_number),
  CONSTRAINT job_cards_status_values  CHECK  (status IN ('open','in_progress','completed','cancelled'))
);

COMMENT ON TABLE  job_cards                   IS 'Vehicle intake job cards — one per vehicle visit.';
COMMENT ON COLUMN job_cards.job_card_number   IS 'Auto-generated. Format: JC-YYYY-NNNN.';
COMMENT ON COLUMN job_cards.items_checklist   IS 'JSON array of items found in the vehicle at intake.';

/* Auto-update updated_at */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_job_cards'
  ) THEN
    CREATE TRIGGER set_updated_at_job_cards
      BEFORE UPDATE ON job_cards
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END;
$$;

/* Indexes */
CREATE INDEX IF NOT EXISTS idx_job_cards_number     ON job_cards(job_card_number);
CREATE INDEX IF NOT EXISTS idx_job_cards_status     ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_at ON job_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_cards_owner      ON job_cards(owner_name);

-- ============================================================
-- Migration 003 complete.
-- ============================================================
