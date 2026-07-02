-- ============================================================
-- MBEVHA MOTORS MANAGEMENT SYSTEM (MMMS)
-- PostgreSQL Database Schema
-- Version: 1.0
-- Author:  Mashudu Nemutudi
-- Date:    2026
-- ============================================================
-- Run this file once against your Neon PostgreSQL database:
--   psql <connection_string> -f schema.sql
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================
-- Enable UUID generation natively inside PostgreSQL.
-- gen_random_uuid() is used as the default for all primary keys.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- CLEANUP (safe re-run during development)
-- Drop tables in reverse dependency order so foreign key
-- constraints do not block the drops.
-- ============================================================
DROP TABLE IF EXISTS activity_logs    CASCADE;
DROP TABLE IF EXISTS invoice_items    CASCADE;
DROP TABLE IF EXISTS invoices         CASCADE;
DROP TABLE IF EXISTS quotation_items  CASCADE;
DROP TABLE IF EXISTS quotations       CASCADE;
DROP TABLE IF EXISTS gallery          CASCADE;
DROP TABLE IF EXISTS parts            CASCADE;
DROP TABLE IF EXISTS messages         CASCADE;
DROP TABLE IF EXISTS business_info    CASCADE;
DROP TABLE IF EXISTS admins           CASCADE;


-- ============================================================
-- TABLE: admins
-- ============================================================
-- Stores administrator login credentials.
-- Only administrators can access the dashboard.
-- There are no customer accounts in this system.
-- Passwords are stored as bcrypt hashes — never plain text.
-- ============================================================
CREATE TABLE admins (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50) NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT admins_username_unique UNIQUE (username),
    CONSTRAINT admins_username_length CHECK (char_length(username) >= 3)
);

COMMENT ON TABLE  admins                IS 'Administrator accounts. Only admins can log into the dashboard.';
COMMENT ON COLUMN admins.id             IS 'UUID primary key, auto-generated.';
COMMENT ON COLUMN admins.username       IS 'Unique login username. Minimum 3 characters.';
COMMENT ON COLUMN admins.password_hash  IS 'bcrypt hashed password. Never store plain text.';
COMMENT ON COLUMN admins.created_at     IS 'Timestamp when the account was created.';


-- ============================================================
-- TABLE: business_info
-- ============================================================
-- Stores the editable public-facing business content.
-- This is a SINGLE-ROW table — there is always exactly one row.
-- The admin updates this row from the Business Information page.
-- The public website reads from this table for all contact
-- details, about text, opening hours, and Google Maps link.
-- ============================================================
CREATE TABLE business_info (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name     VARCHAR(150) NOT NULL,
    motto             VARCHAR(255),
    phone             VARCHAR(20)  NOT NULL,
    email             VARCHAR(100),
    address           TEXT         NOT NULL,
    about             TEXT,
    opening_hours     VARCHAR(200),
    whatsapp_number   VARCHAR(20),
    google_maps_link  TEXT,
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  business_info                  IS 'Single-row table. Stores all editable business contact and profile information used on the public website.';
COMMENT ON COLUMN business_info.id               IS 'UUID primary key.';
COMMENT ON COLUMN business_info.business_name    IS 'Official business name shown on website and PDF documents.';
COMMENT ON COLUMN business_info.motto            IS 'Business tagline or motto displayed on the website.';
COMMENT ON COLUMN business_info.phone            IS 'Primary contact phone number.';
COMMENT ON COLUMN business_info.email            IS 'Business email address.';
COMMENT ON COLUMN business_info.address          IS 'Full physical address of the workshop.';
COMMENT ON COLUMN business_info.about            IS 'About Us text shown on the public website.';
COMMENT ON COLUMN business_info.opening_hours    IS 'Working hours displayed on the website and contact page.';
COMMENT ON COLUMN business_info.whatsapp_number  IS 'WhatsApp number used for customer chat links.';
COMMENT ON COLUMN business_info.google_maps_link IS 'Embed URL for the Google Maps iframe on the contact page.';
COMMENT ON COLUMN business_info.updated_at       IS 'Timestamp of the last update made by the administrator.';


-- ============================================================
-- TABLE: messages
-- ============================================================
-- Stores customer enquiries submitted through the public
-- contact form on the website.
-- Administrators can view and delete messages from the dashboard.
-- No reply functionality in V1 — admins respond via phone
-- or WhatsApp using the contact details provided.
-- ============================================================
CREATE TABLE messages (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    vehicle     VARCHAR(100),
    message     TEXT         NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT messages_name_length    CHECK (char_length(name)    >= 2),
    CONSTRAINT messages_phone_length   CHECK (char_length(phone)   >= 7),
    CONSTRAINT messages_message_length CHECK (char_length(message) >= 5)
);

COMMENT ON TABLE  messages            IS 'Customer enquiries submitted from the public contact form.';
COMMENT ON COLUMN messages.id         IS 'UUID primary key.';
COMMENT ON COLUMN messages.name       IS 'Full name of the customer submitting the enquiry.';
COMMENT ON COLUMN messages.phone      IS 'Customer phone number for follow-up.';
COMMENT ON COLUMN messages.vehicle    IS 'Optional. Vehicle make and model relevant to the enquiry.';
COMMENT ON COLUMN messages.message    IS 'The full text of the customer enquiry.';
COMMENT ON COLUMN messages.is_read    IS 'Tracks whether the administrator has opened this message.';
COMMENT ON COLUMN messages.created_at IS 'Timestamp when the message was submitted.';


-- ============================================================
-- TABLE: parts
-- ============================================================
-- Stores used vehicle parts available at the workshop.
-- Displayed publicly on the Used Parts page.
-- Customers cannot purchase online — they contact the workshop
-- via WhatsApp or phone to enquire about a specific part.
-- Administrators manage parts from the admin dashboard.
-- ============================================================
CREATE TABLE parts (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150)   NOT NULL,
    category      VARCHAR(100)   NOT NULL,
    description   TEXT,
    price         NUMERIC(10,2)  NOT NULL,
    quantity      INT            NOT NULL DEFAULT 0,
    is_available  BOOLEAN        NOT NULL DEFAULT TRUE,
    image_url     TEXT,
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP      NOT NULL DEFAULT NOW(),

    CONSTRAINT parts_price_positive    CHECK (price    >= 0),
    CONSTRAINT parts_quantity_positive CHECK (quantity >= 0),
    CONSTRAINT parts_name_length       CHECK (char_length(name) >= 2)
);

COMMENT ON TABLE  parts               IS 'Used vehicle parts available at the workshop. Displayed publicly.';
COMMENT ON COLUMN parts.id            IS 'UUID primary key.';
COMMENT ON COLUMN parts.name          IS 'Descriptive name of the part (e.g. Toyota Hilux Front Bumper).';
COMMENT ON COLUMN parts.category      IS 'Part category for filtering (e.g. Engine, Body, Electrical).';
COMMENT ON COLUMN parts.description   IS 'Optional detailed description of the part condition and fitment.';
COMMENT ON COLUMN parts.price         IS 'Selling price in ZAR. Must be zero or positive.';
COMMENT ON COLUMN parts.quantity      IS 'Number of units in stock. Must be zero or positive.';
COMMENT ON COLUMN parts.is_available  IS 'Whether this part is currently available for purchase.';
COMMENT ON COLUMN parts.image_url     IS 'Relative path to uploaded image stored in /uploads/parts/.';
COMMENT ON COLUMN parts.created_at    IS 'Timestamp when the part was added.';
COMMENT ON COLUMN parts.updated_at    IS 'Timestamp of the last update to this part record.';


-- ============================================================
-- TABLE: gallery
-- ============================================================
-- Stores workshop images displayed on the public gallery page.
-- Administrators can upload images, edit captions, and delete
-- images from the admin dashboard.
-- Images are stored in /uploads/gallery/ on the server.
-- ============================================================
CREATE TABLE gallery (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url   TEXT         NOT NULL,
    caption     VARCHAR(255),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  gallery            IS 'Workshop images for the public gallery page.';
COMMENT ON COLUMN gallery.id         IS 'UUID primary key.';
COMMENT ON COLUMN gallery.image_url  IS 'Relative path to the uploaded image stored in /uploads/gallery/.';
COMMENT ON COLUMN gallery.caption    IS 'Optional descriptive caption shown below the image.';
COMMENT ON COLUMN gallery.created_at IS 'Timestamp when the image was uploaded.';
COMMENT ON COLUMN gallery.updated_at IS 'Timestamp when the caption was last edited.';


-- ============================================================
-- TABLE: quotations
-- ============================================================
-- Stores quotation headers created by the administrator.
-- Each quotation can have many line items (quotation_items).
-- Quotations are generated for customers BEFORE work begins.
-- Quotation numbers follow the format: QT-2026-0001
-- Quotations are printed or shared as PDF.
-- Status is either 'draft' or 'final'.
-- ============================================================
CREATE TABLE quotations (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number    VARCHAR(50)    NOT NULL,
    customer_name       VARCHAR(100)   NOT NULL,
    phone               VARCHAR(20)    NOT NULL,
    vehicle_make        VARCHAR(100),
    vehicle_model       VARCHAR(100),
    registration_number VARCHAR(50),
    labour_cost         NUMERIC(10,2)  NOT NULL DEFAULT 0,
    notes               TEXT,
    total_amount        NUMERIC(10,2)  NOT NULL DEFAULT 0,
    status              VARCHAR(10)    NOT NULL DEFAULT 'draft',
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW(),

    CONSTRAINT quotations_number_unique     UNIQUE (quotation_number),
    CONSTRAINT quotations_status_values     CHECK  (status IN ('draft', 'final')),
    CONSTRAINT quotations_labour_positive   CHECK  (labour_cost   >= 0),
    CONSTRAINT quotations_total_positive    CHECK  (total_amount  >= 0),
    CONSTRAINT quotations_name_length       CHECK  (char_length(customer_name) >= 2),
    CONSTRAINT quotations_phone_length      CHECK  (char_length(phone) >= 7)
);

COMMENT ON TABLE  quotations                      IS 'Quotation headers. Each quotation belongs to one customer and vehicle.';
COMMENT ON COLUMN quotations.id                   IS 'UUID primary key.';
COMMENT ON COLUMN quotations.quotation_number     IS 'Unique human-readable number. Format: QT-YYYY-NNNN. Auto-generated.';
COMMENT ON COLUMN quotations.customer_name        IS 'Full name of the customer receiving the quotation.';
COMMENT ON COLUMN quotations.phone                IS 'Customer contact phone number.';
COMMENT ON COLUMN quotations.vehicle_make         IS 'Vehicle manufacturer (e.g. Toyota).';
COMMENT ON COLUMN quotations.vehicle_model        IS 'Vehicle model (e.g. Hilux 2.4GD-6).';
COMMENT ON COLUMN quotations.registration_number  IS 'Vehicle registration plate number.';
COMMENT ON COLUMN quotations.labour_cost          IS 'Total labour charge added on top of parts. Must be zero or positive.';
COMMENT ON COLUMN quotations.notes                IS 'Optional internal or customer-facing notes.';
COMMENT ON COLUMN quotations.total_amount         IS 'Grand total: sum of all line item totals plus labour cost.';
COMMENT ON COLUMN quotations.status               IS 'Quotation state: draft (work in progress) or final (ready to share).';
COMMENT ON COLUMN quotations.created_at           IS 'Timestamp when the quotation was first created.';
COMMENT ON COLUMN quotations.updated_at           IS 'Timestamp of the last edit made to this quotation.';


-- ============================================================
-- TABLE: quotation_items
-- ============================================================
-- Stores individual line items belonging to a quotation.
-- One quotation can have many items (one-to-many).
-- The total column is stored (not computed on read) to preserve
-- historical accuracy even if prices change later.
-- Rows are deleted automatically when the parent quotation is
-- deleted (ON DELETE CASCADE).
-- ============================================================
CREATE TABLE quotation_items (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id    UUID           NOT NULL,
    description     TEXT           NOT NULL,
    quantity        INT            NOT NULL DEFAULT 1,
    unit_price      NUMERIC(10,2)  NOT NULL,
    total           NUMERIC(10,2)  NOT NULL,

    CONSTRAINT quotation_items_quotation_fk      FOREIGN KEY (quotation_id)
        REFERENCES quotations(id) ON DELETE CASCADE,

    CONSTRAINT quotation_items_quantity_positive  CHECK (quantity   >= 1),
    CONSTRAINT quotation_items_price_positive     CHECK (unit_price >= 0),
    CONSTRAINT quotation_items_total_positive     CHECK (total      >= 0),
    CONSTRAINT quotation_items_desc_length        CHECK (char_length(description) >= 1)
);

COMMENT ON TABLE  quotation_items              IS 'Line items for a quotation. Cascade-deleted with the parent quotation.';
COMMENT ON COLUMN quotation_items.id           IS 'UUID primary key.';
COMMENT ON COLUMN quotation_items.quotation_id IS 'Foreign key to the parent quotation.';
COMMENT ON COLUMN quotation_items.description  IS 'Description of the part or service being quoted.';
COMMENT ON COLUMN quotation_items.quantity     IS 'Number of units. Minimum 1.';
COMMENT ON COLUMN quotation_items.unit_price   IS 'Price per single unit in ZAR.';
COMMENT ON COLUMN quotation_items.total        IS 'Stored total: quantity × unit_price. Calculated before insert/update.';


-- ============================================================
-- TABLE: invoices
-- ============================================================
-- Stores invoice headers created by the administrator.
-- Each invoice can optionally be linked to a quotation.
-- Invoice numbers follow the format: INV-2026-0001
-- Payment status is either 'pending' or 'paid'.
-- If the linked quotation is deleted, quotation_id becomes NULL
-- (ON DELETE SET NULL) — the invoice itself is preserved.
-- ============================================================
CREATE TABLE invoices (
    id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number      VARCHAR(50)    NOT NULL,
    quotation_id        UUID,
    customer_name       VARCHAR(100)   NOT NULL,
    phone               VARCHAR(20)    NOT NULL,
    vehicle             VARCHAR(200),
    registration_number VARCHAR(50),
    labour_cost         NUMERIC(10,2)  NOT NULL DEFAULT 0,
    notes               TEXT,
    total_amount        NUMERIC(10,2)  NOT NULL DEFAULT 0,
    payment_status      VARCHAR(10)    NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW(),

    CONSTRAINT invoices_number_unique         UNIQUE (invoice_number),
    CONSTRAINT invoices_payment_status_values CHECK  (payment_status IN ('pending', 'paid')),
    CONSTRAINT invoices_labour_positive       CHECK  (labour_cost  >= 0),
    CONSTRAINT invoices_total_positive        CHECK  (total_amount >= 0),
    CONSTRAINT invoices_name_length           CHECK  (char_length(customer_name) >= 2),
    CONSTRAINT invoices_phone_length          CHECK  (char_length(phone) >= 7),

    CONSTRAINT invoices_quotation_fk FOREIGN KEY (quotation_id)
        REFERENCES quotations(id) ON DELETE SET NULL
);

COMMENT ON TABLE  invoices                      IS 'Invoice headers. Can optionally link to an existing quotation.';
COMMENT ON COLUMN invoices.id                   IS 'UUID primary key.';
COMMENT ON COLUMN invoices.invoice_number       IS 'Unique human-readable number. Format: INV-YYYY-NNNN. Auto-generated.';
COMMENT ON COLUMN invoices.quotation_id         IS 'Optional. Links invoice to the quotation it was raised from. Nullified if quotation is deleted.';
COMMENT ON COLUMN invoices.customer_name        IS 'Full name of the customer being invoiced.';
COMMENT ON COLUMN invoices.phone                IS 'Customer contact phone number.';
COMMENT ON COLUMN invoices.vehicle              IS 'Combined vehicle description (e.g. Toyota Hilux 2.4GD-6).';
COMMENT ON COLUMN invoices.registration_number  IS 'Vehicle registration plate number.';
COMMENT ON COLUMN invoices.labour_cost          IS 'Total labour charge. Must be zero or positive.';
COMMENT ON COLUMN invoices.notes                IS 'Optional notes or payment instructions on the invoice.';
COMMENT ON COLUMN invoices.total_amount         IS 'Grand total: sum of all line item totals plus labour cost.';
COMMENT ON COLUMN invoices.payment_status       IS 'Payment state: pending (unpaid) or paid.';
COMMENT ON COLUMN invoices.created_at           IS 'Timestamp when the invoice was created.';
COMMENT ON COLUMN invoices.updated_at           IS 'Timestamp of the last edit made to this invoice.';


-- ============================================================
-- TABLE: invoice_items
-- ============================================================
-- Stores individual line items belonging to an invoice.
-- Mirrors quotation_items in structure.
-- Rows are deleted automatically when the parent invoice is
-- deleted (ON DELETE CASCADE).
-- ============================================================
CREATE TABLE invoice_items (
    id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID           NOT NULL,
    description TEXT           NOT NULL,
    quantity    INT            NOT NULL DEFAULT 1,
    unit_price  NUMERIC(10,2)  NOT NULL,
    total       NUMERIC(10,2)  NOT NULL,

    CONSTRAINT invoice_items_invoice_fk       FOREIGN KEY (invoice_id)
        REFERENCES invoices(id) ON DELETE CASCADE,

    CONSTRAINT invoice_items_quantity_positive CHECK (quantity   >= 1),
    CONSTRAINT invoice_items_price_positive    CHECK (unit_price >= 0),
    CONSTRAINT invoice_items_total_positive    CHECK (total      >= 0),
    CONSTRAINT invoice_items_desc_length       CHECK (char_length(description) >= 1)
);

COMMENT ON TABLE  invoice_items             IS 'Line items for an invoice. Cascade-deleted with the parent invoice.';
COMMENT ON COLUMN invoice_items.id          IS 'UUID primary key.';
COMMENT ON COLUMN invoice_items.invoice_id  IS 'Foreign key to the parent invoice.';
COMMENT ON COLUMN invoice_items.description IS 'Description of the part or service being invoiced.';
COMMENT ON COLUMN invoice_items.quantity    IS 'Number of units. Minimum 1.';
COMMENT ON COLUMN invoice_items.unit_price  IS 'Price per single unit in ZAR.';
COMMENT ON COLUMN invoice_items.total       IS 'Stored total: quantity × unit_price. Calculated before insert/update.';


-- ============================================================
-- TABLE: activity_logs
-- ============================================================
-- Records administrator actions for the dashboard activity feed.
-- Every significant action (creating a quotation, uploading an
-- image, adding a part, etc.) writes one row here.
-- The dashboard reads the most recent rows to display activity.
-- action codes: CREATE_QUOTATION, FINALIZE_QUOTATION,
--               CREATE_INVOICE, MARK_PAID, ADD_PART,
--               UPDATE_PART, DELETE_PART, UPLOAD_IMAGE,
--               DELETE_IMAGE, DELETE_MESSAGE, UPDATE_BUSINESS
-- ============================================================
CREATE TABLE activity_logs (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id     UUID         NOT NULL,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50)  NOT NULL,
    entity_id    UUID,
    description  TEXT         NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT activity_logs_admin_fk      FOREIGN KEY (admin_id)
        REFERENCES admins(id) ON DELETE CASCADE,

    CONSTRAINT activity_logs_action_length CHECK (char_length(action) >= 3)
);

COMMENT ON TABLE  activity_logs              IS 'Audit trail of administrator actions. Populates the dashboard activity feed.';
COMMENT ON COLUMN activity_logs.id           IS 'UUID primary key.';
COMMENT ON COLUMN activity_logs.admin_id     IS 'Foreign key to the admin who performed the action.';
COMMENT ON COLUMN activity_logs.action       IS 'Short action code (e.g. CREATE_QUOTATION, UPLOAD_IMAGE, DELETE_PART).';
COMMENT ON COLUMN activity_logs.entity_type  IS 'Type of record affected (e.g. quotation, invoice, part, gallery).';
COMMENT ON COLUMN activity_logs.entity_id    IS 'Optional UUID of the affected record for traceability.';
COMMENT ON COLUMN activity_logs.description  IS 'Human-readable log entry shown in the dashboard activity feed.';
COMMENT ON COLUMN activity_logs.created_at   IS 'Timestamp when the action was performed.';


-- ============================================================
-- INDEXES
-- ============================================================
-- Primary keys are indexed automatically by PostgreSQL.
-- The indexes below target columns used in WHERE clauses,
-- ORDER BY, and JOIN conditions across the application.
-- ============================================================

-- admins: fast username lookup during login
CREATE INDEX idx_admins_username
    ON admins(username);

-- messages: dashboard list (newest first), unread filter, phone search
CREATE INDEX idx_messages_created_at
    ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read
    ON messages(is_read);
CREATE INDEX idx_messages_phone
    ON messages(phone);

-- parts: category filter on public page, availability filter, list order
CREATE INDEX idx_parts_category
    ON parts(category);
CREATE INDEX idx_parts_is_available
    ON parts(is_available);
CREATE INDEX idx_parts_created_at
    ON parts(created_at DESC);

-- gallery: display order
CREATE INDEX idx_gallery_created_at
    ON gallery(created_at DESC);

-- quotations: number lookup, status filter, list order, phone search
CREATE INDEX idx_quotations_number
    ON quotations(quotation_number);
CREATE INDEX idx_quotations_status
    ON quotations(status);
CREATE INDEX idx_quotations_created_at
    ON quotations(created_at DESC);
CREATE INDEX idx_quotations_phone
    ON quotations(phone);

-- quotation_items: fetch all items for a quotation
CREATE INDEX idx_quotation_items_quotation_id
    ON quotation_items(quotation_id);

-- invoices: number lookup, payment filter, list order, quotation link, phone search
CREATE INDEX idx_invoices_number
    ON invoices(invoice_number);
CREATE INDEX idx_invoices_payment_status
    ON invoices(payment_status);
CREATE INDEX idx_invoices_created_at
    ON invoices(created_at DESC);
CREATE INDEX idx_invoices_quotation_id
    ON invoices(quotation_id);
CREATE INDEX idx_invoices_phone
    ON invoices(phone);

-- invoice_items: fetch all items for an invoice
CREATE INDEX idx_invoice_items_invoice_id
    ON invoice_items(invoice_id);

-- activity_logs: dashboard feed (newest first), per-admin filter, entity type filter
CREATE INDEX idx_activity_logs_admin_id
    ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_created_at
    ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity_type
    ON activity_logs(entity_type);


-- ============================================================
-- FUNCTION + TRIGGERS — auto-update updated_at
-- ============================================================
-- This function is called by triggers on every table that has
-- an updated_at column. It automatically sets updated_at to
-- the current timestamp whenever a row is modified, removing
-- the need to handle this in application code.
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_parts
    BEFORE UPDATE ON parts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_gallery
    BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_quotations
    BEFORE UPDATE ON quotations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_invoices
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_business_info
    BEFORE UPDATE ON business_info
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- SCHEMA COMPLETE
-- ============================================================
-- Tables created (11):
--   admins, business_info, messages, parts, gallery,
--   quotations, quotation_items, invoices, invoice_items,
--   activity_logs
--
-- Indexes created (20)
-- Triggers created (5)
--
-- Next step: run seed.sql to insert the default admin account
-- and the initial business_info row.
-- ============================================================
