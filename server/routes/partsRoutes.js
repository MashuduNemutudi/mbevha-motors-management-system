/**
 * routes/partsRoutes.js
 * Mounted at /api/parts
 *
 * Endpoints:
 *   GET    /api/parts        — list parts (public: available only | admin: all)
 *   GET    /api/parts/:id    — get single part
 *   POST   /api/parts        — add part + image upload (admin only)
 *   PUT    /api/parts/:id    — update part (admin only)
 *   DELETE /api/parts/:id    — delete part (admin only)
 *
 * TODO (Phase 4): Implement all routes with Multer for image upload.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/',       (req, res) => res.json({ success: true, data: [], message: 'Parts endpoint — coming in Phase 4' }));
router.get('/:id',    (req, res) => res.json({ success: true, message: 'Get part — coming in Phase 4' }));
router.post('/',      protect, (req, res) => res.json({ success: true, message: 'Add part — coming in Phase 4' }));
router.put('/:id',    protect, (req, res) => res.json({ success: true, message: 'Update part — coming in Phase 4' }));
router.delete('/:id', protect, (req, res) => res.json({ success: true, message: 'Delete part — coming in Phase 4' }));

module.exports = router;
