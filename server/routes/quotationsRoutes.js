/**
 * routes/quotationsRoutes.js
 * Mounted at /api/quotations in server.js
 *
 * Endpoints (Phase 7):
 *   GET    /api/quotations           — list all quotations
 *   GET    /api/quotations/:id       — get single quotation with items
 *   POST   /api/quotations           — create new quotation
 *   PUT    /api/quotations/:id       — update quotation
 *   DELETE /api/quotations/:id       — delete quotation
 *   GET    /api/quotations/:id/pdf   — generate and stream PDF
 *
 * All routes are protected (JWT required).
 * TODO (Phase 7): Implement all routes.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// TODO: import and wire up quotationsController functions

router.get('/',         protect, (req, res) => res.json({ success: true, message: 'Quotations endpoint — coming in Phase 7' }));
router.get('/:id',      protect, (req, res) => res.json({ success: true, message: 'Get quotation — coming in Phase 7' }));
router.post('/',        protect, (req, res) => res.json({ success: true, message: 'Create quotation — coming in Phase 7' }));
router.put('/:id',      protect, (req, res) => res.json({ success: true, message: 'Update quotation — coming in Phase 7' }));
router.delete('/:id',   protect, (req, res) => res.json({ success: true, message: 'Delete quotation — coming in Phase 7' }));
router.get('/:id/pdf',  protect, (req, res) => res.json({ success: true, message: 'PDF generation — coming in Phase 7' }));

module.exports = router;
