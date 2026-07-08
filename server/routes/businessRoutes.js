/**
 * routes/businessRoutes.js
 * Mounted at /api/business in server.js
 *
 * GET /api/business  — public (no auth) — fetched by public website
 * PUT /api/business  — protected (JWT)  — updated by admin dashboard
 */

const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { getBusinessInfo, updateBusinessInfo } = require('../controllers/businessController');

router.get('/', getBusinessInfo);
router.put('/', protect, updateBusinessInfo);

module.exports = router;
