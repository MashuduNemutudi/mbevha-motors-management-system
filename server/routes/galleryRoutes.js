/**
 * routes/galleryRoutes.js
 * Mounted at /api/gallery
 *
 * Endpoints:
 *   GET    /api/gallery        — list all images (public)
 *   POST   /api/gallery        — upload image (admin only)
 *   PATCH  /api/gallery/:id    — update caption (admin only)
 *   DELETE /api/gallery/:id    — delete image + file (admin only)
 *
 * TODO (Phase 5): Implement all routes with Multer.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/',        (req, res) => res.json({ success: true, data: [], message: 'Gallery endpoint — coming in Phase 5' }));
router.post('/',       protect, (req, res) => res.json({ success: true, message: 'Upload image — coming in Phase 5' }));
router.patch('/:id',   protect, (req, res) => res.json({ success: true, message: 'Update caption — coming in Phase 5' }));
router.delete('/:id',  protect, (req, res) => res.json({ success: true, message: 'Delete image — coming in Phase 5' }));

module.exports = router;
