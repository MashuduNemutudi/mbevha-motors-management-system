-- ============================================================
-- MBEVHA MOTORS MANAGEMENT SYSTEM (MMMS)
-- Database Seed File
-- ============================================================
-- Run AFTER schema.sql:
--   psql <connection_string> -f seed.sql
--
-- IMPORTANT — PASSWORD:
--   The hash below is pre-generated for "MbevhaAdmin2026!".
--   Generate your own with:
--     node -e "require('bcrypt').hash('YourPassword',12).then(console.log)"
-- ============================================================

-- ── Default administrator account ──────────────────────────
-- Username: mbevha_admin
-- Password: MbevhaAdmin2026!  ← change after first login
INSERT INTO admins (username, password_hash)
VALUES (
    'mbevha_admin',
    '$2b$12$oDblP3ee74FyHOC0icyURe2u1U72YRRp6HrKU23juWeADQtc6w9xy'
)
ON CONFLICT (username) DO NOTHING;

-- ── Initial business information ────────────────────────────
-- Edit these via the admin dashboard → Business Information.
INSERT INTO business_info (
    business_name,
    motto,
    phone,
    phone_landline,
    email,
    address,
    about,
    opening_hours,
    whatsapp_number,
    google_maps_link
)
VALUES (
    'Mbevha Motors (Pty) Ltd',
    'Notable Hands, We Do Quality.',
    '071 306 5615',
    '010 786 0789',
    'mbevhamotors@gmail.com',
    'Stand No 195, Vuwani Road, Mahematshena, Thohoyandou, 0950',
    'Mbevha Motors (Pty) Ltd is a trusted automotive workshop based in Dzwerani, Limpopo. We specialise in mechanical repairs, BMW specialist work, engine swaps, engine conversions, panel beating, automotive painting, and quality used vehicle parts. Our experienced technicians are committed to delivering honest, reliable, and professional automotive services to our community.',
    'Mon–Fri: 07:30–17:00 | Sat: 08:00–13:00 | Sun: Closed',
    '061 518 8643',
    ''
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED COMPLETE
-- ============================================================
-- Admin account: mbevha_admin / MbevhaAdmin2026!
-- Business info: Mbevha Motors, 071 306 5615, WhatsApp 061 518 8643
--
-- After first login:
--   1. Change your password in Settings
--   2. Update address and Google Maps link in Business Information
-- ============================================================
