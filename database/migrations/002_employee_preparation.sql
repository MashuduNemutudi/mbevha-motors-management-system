-- ============================================================
-- Migration 002: Employee Management Preparation
-- ============================================================
-- Date: 2026
-- Purpose:
--   Prepares the database schema for a future Employee Management
--   module without breaking any existing functionality.
--
-- Design decisions:
--   - Employee ID is a custom string (e.g. EMP-001) chosen by
--     the administrator, NOT an auto-generated UUID.
--     This matches the business requirement: Employee ID is the
--     primary identifier used on attendance records, quotations,
--     activity logs, and future reports.
--   - The table is created but left empty — the module is not
--     built yet, only the schema is prepared.
--   - activity_logs.admin_id already links to admins, which is
--     correct for Phase 1. When employees are active users,
--     a separate employee_logs table may be added.
-- ============================================================

-- ── employees table ─────────────────────────────────────────
-- employee_id is a user-defined identifier (e.g. EMP-001)
-- NOT an auto-generated key, as per business requirement.
CREATE TABLE IF NOT EXISTS employees (
    employee_id     VARCHAR(20)   PRIMARY KEY,         -- e.g. EMP-001, TECH-003
    first_name      VARCHAR(80)   NOT NULL,
    last_name       VARCHAR(80)   NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(100),                       -- e.g. Mechanic, Painter, Receptionist
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    hire_date       DATE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT employees_id_format CHECK (char_length(employee_id) >= 3)
);

COMMENT ON TABLE  employees             IS 'Workshop employees. employee_id is the business-defined primary key (e.g. EMP-001).';
COMMENT ON COLUMN employees.employee_id IS 'User-defined employee identifier. Primary key. Not auto-generated.';
COMMENT ON COLUMN employees.role        IS 'Job role/position within the workshop.';
COMMENT ON COLUMN employees.is_active   IS 'Whether the employee is currently employed.';

-- ── attendance table (preparation) ──────────────────────────
-- References employee_id so attendance records are tied to
-- the business identifier, not an internal UUID.
CREATE TABLE IF NOT EXISTS attendance (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id   VARCHAR(20) NOT NULL,
    clock_in      TIMESTAMP NOT NULL,
    clock_out     TIMESTAMP,
    notes         TEXT,
    recorded_at   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT attendance_employee_fk FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id) ON DELETE CASCADE,

    CONSTRAINT attendance_clockout_after_clockin
        CHECK (clock_out IS NULL OR clock_out > clock_in)
);

COMMENT ON TABLE  attendance             IS 'Employee attendance records. Links to employees via employee_id.';
COMMENT ON COLUMN attendance.employee_id IS 'Foreign key to employees.employee_id (business identifier).';
COMMENT ON COLUMN attendance.clock_out   IS 'NULL if employee has not yet clocked out.';

-- ── Updated_at trigger for employees ────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_employees
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employees_is_active   ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_role        ON employees(role);
CREATE INDEX IF NOT EXISTS idx_attendance_employee   ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_clock_in   ON attendance(clock_in DESC);

-- ============================================================
-- Run this migration:
--   psql <connection_string> -f migrations/002_employee_preparation.sql
-- ============================================================
