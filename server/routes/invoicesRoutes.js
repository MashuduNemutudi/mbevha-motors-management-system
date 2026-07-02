/**
 * routes/invoicesRoutes.js
 * Mounted at /api/invoices
 *
 * Endpoints (Phase 8):
 *   GET    /api/invoices             — list all invoices
 *   GET    /api/invoices/:id         — get single invoice with items
 *   POST   /api/invoices             — create new invoice
 *   PUT    /api/invoices/:id         — update invoice
 *   DELETE /api/invoices/:id         — delete invoice
 *   PATCH  /api/invoices/:id/pay     — mark as paid
 *   GET    /api/invoices/:id/pdf     — generate and stream PDF
 *
 * TODO (Phase 8): Implement all routes.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/',          protect, (req, res) => res.json({ success: true, message: 'Invoices endpoint — coming in Phase 8' }));
router.get('/:id',       protect, (req, res) => res.json({ success: true, message: 'Get invoice — coming in Phase 8' }));
router.post('/',         protect, (req, res) => res.json({ success: true, message: 'Create invoice — coming in Phase 8' }));
router.put('/:id',       protect, (req, res) => res.json({ success: true, message: 'Update invoice — coming in Phase 8' }));
router.delete('/:id',    protect, (req, res) => res.json({ success: true, message: 'Delete invoice — coming in Phase 8' }));
router.patch('/:id/pay', protect, (req, res) => res.json({ success: true, message: 'Mark paid — coming in Phase 8' }));
router.get('/:id/pdf',   protect, (req, res) => res.json({ success: true, message: 'PDF generation — coming in Phase 8' }));

module.exports = router;
