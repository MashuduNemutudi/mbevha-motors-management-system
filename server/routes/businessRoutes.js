/**
 * routes/businessRoutes.js
 * Mounted at /api/business
 *
 * Endpoints:
 *   GET /api/business   — get business info (public)
 *   PUT /api/business   — update business info (admin only)
 *
 * TODO (Phase 9): Implement both routes.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/',  (req, res) => res.json({ success: true, data: {
  business_name: 'Mbevha Motors (Pty) Ltd',
  motto: 'Your Trusted Automotive Partner in Limpopo',
  phone: '',
  email: '',
  address: '',
  about: '',
  opening_hours: '',
  whatsapp_number: '',
  google_maps_link: '',
}, message: 'Business info — coming in Phase 9' }));

router.put('/',  protect, (req, res) => res.json({ success: true, message: 'Update business info — coming in Phase 9' }));

module.exports = router;
