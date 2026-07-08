-- ============================================================
-- Migration 002: Employee Management Preparation
-- ============================================================
-- Date:    2026
-- Author:  Mashudu Nemutudi
--
-- PURPOSE:
--   Defines the employees and attendance tables for future use.
--   The Employee Management module will be built in a later phase.
--   This migration only creates the tables — it does NOT modify
--   any existing tables (admins, activity_logs, quotations, etc.)
--
-- KEY DESIGN DECISION: Employee ID as primary identifier
--   Employees are identified by a human-readable Employee ID
--   (e.g. "EMP001", "EMP002") rather than an auto-generated UUID.
--   This makes employee identification intuitive across:
--     - Attendance records
--     - Activity logs (future: assigned_to)
--     - Quotations (future: created_by_employee)
--     - Reports and printouts
--
-- RUN:
--   psql <connection_string> -f migrations/002_employees_preparation.sql
-- ============================================================


-- ============================================================
-- TABLE: employees
-- ============================================================
-- Stores workshop employees.
-- employee_id is the primary identifier throughout the system.
-- Format convention: EMP001, EMP002, EMP003, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
    employee_id    VARCHAR(20)  PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    phone          VARCHAR(20),
    role           VARCHAR(100) NOT NULL,
    department     VARCHAR(100),
    start_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
    status         VARCHAR(20)  NOT NULL DEFAULT 'active',
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT employees_employee_id_format
        CHECK (employee_id ~ '^EMP[0-9]{3,}$'),

    CONSTRAINT employees_status_values
        CHECK (status IN ('active', 'inactive', 'suspended')),

    CONSTRAINT employees_name_length
        CHECK (char_length(full_name) >= 2)
);

COMMENT ON TABLE  employees              IS 'Workshop employees. employee_id (e.g. EMP001) is the primary identifier used across the entire system.';
COMMENT ON COLUMN employees.employee_id  IS 'Human-readable primary key. Format: EMP001, EMP002, etc. Used everywhere to identify an employee.';
COMMENT ON COLUMN employees.full_name    IS 'Employee full name.';
COMMENT ON COLUMN employees.phone        IS 'Employee contact number.';
COMMENT ON COLUMN employees.role         IS 'Job role, e.g. Mechanic, Spray Painter, Panel Beater, Receptionist.';
COMMENT ON COLUMN employees.department   IS 'Workshop department, e.g. Workshop, Panel Shop, Administration.';
COMMENT ON COLUMN employees.start_date   IS 'Date employee joined the workshop.';
COMMENT ON COLUMN employees.status       IS 'Employment status: active, inactive, or suspended.';


-- ============================================================
-- TABLE: attendance
-- ============================================================
-- Records daily attendance for each employee.
-- References employees(employee_id) — NOT a UUID foreign key.
-- One record per employee per day.
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id    VARCHAR(20)  NOT NULL,
    work_date      DATE         NOT NULL DEFAULT CURRENT_DATE,
    check_in       TIME,
    check_out      TIME,
    status         VARCHAR(20)  NOT NULL DEFAULT 'present',
    notes          TEXT,
    recorded_by    UUID,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT attendance_employee_fk
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT attendance_admin_fk
        FOREIGN KEY (recorded_by) REFERENCES admins(id)
        ON DELETE SET NULL,

    CONSTRAINT attendance_unique_per_day
        UNIQUE (employee_id, work_date),

    CONSTRAINT attendance_status_values
        CHECK (status IN ('present', 'absent', 'half_day', 'leave', 'sick'))
);

COMMENT ON TABLE  attendance              IS 'Daily employee attendance records. One row per employee per day.';
COMMENT ON COLUMN attendance.employee_id  IS 'Foreign key to employees.employee_id. References the human-readable Employee ID.';
COMMENT ON COLUMN attendance.work_date    IS 'The date this attendance record applies to.';
COMMENT ON COLUMN attendance.check_in     IS 'Time the employee checked in (optional).';
COMMENT ON COLUMN attendance.check_out    IS 'Time the employee checked out (optional).';
COMMENT ON COLUMN attendance.status       IS 'Attendance status: present, absent, half_day, leave, or sick.';
COMMENT ON COLUMN attendance.notes        IS 'Optional notes about this attendance record.';
COMMENT ON COLUMN attendance.recorded_by  IS 'Admin who recorded this attendance entry (nullable).';


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_employees_status
    ON employees(status);

CREATE INDEX IF NOT EXISTS idx_employees_role
    ON employees(role);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id
    ON attendance(employee_id);

CREATE INDEX IF NOT EXISTS idx_attendance_work_date
    ON attendance(work_date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_status
    ON attendance(status);

-- Composite index for common query: all attendance for an employee in a date range
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date
    ON attendance(employee_id, work_date DESC);


-- ============================================================
-- TRIGGER: auto-update employees.updated_at
-- ============================================================
CREATE TRIGGER IF NOT EXISTS set_updated_at_employees
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- FUTURE INTEGRATION NOTES
-- ============================================================
-- When building the Employee module, consider:
--
-- 1. activity_logs can be extended with an optional employee_id
--    column to track which employee performed an action
--    (separate from the admin who approved it).
--
--    ALTER TABLE activity_logs ADD COLUMN employee_id VARCHAR(20)
--    REFERENCES employees(employee_id) ON DELETE SET NULL;
--
-- 2. quotations can be extended with a created_by_employee column:
--
--    ALTER TABLE quotations ADD COLUMN assigned_to VARCHAR(20)
--    REFERENCES employees(employee_id) ON DELETE SET NULL;
--
-- 3. A monthly_summary view can be added:
--
--    CREATE VIEW employee_monthly_attendance AS
--    SELECT employee_id, DATE_TRUNC('month', work_date) AS month,
--           COUNT(*) FILTER (WHERE status = 'present') AS days_present,
--           COUNT(*) FILTER (WHERE status = 'absent')  AS days_absent
--    FROM attendance
--    GROUP BY employee_id, DATE_TRUNC('month', work_date);
-- ============================================================

-- Migration 002 complete.
