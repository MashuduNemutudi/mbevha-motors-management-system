-- ============================================================
-- Migration 002: Add email and subject columns to messages
-- ============================================================
-- Date: 2026-07
-- Reason: Contact form updated to capture optional email address
--         and a required subject line for better message routing.
--
-- Run:
--   psql <connection_string> -f migrations/002_messages_email_subject.sql
-- ============================================================

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS email   VARCHAR(150),
  ADD COLUMN IF NOT EXISTS subject VARCHAR(200);

-- Index for searching by email
CREATE INDEX IF NOT EXISTS idx_messages_email
  ON messages(email)
  WHERE email IS NOT NULL;

COMMENT ON COLUMN messages.email   IS 'Optional customer email address for follow-up.';
COMMENT ON COLUMN messages.subject IS 'Subject of the enquiry (e.g. Engine Repair, Parts Enquiry).';

-- Migration 002 complete.
