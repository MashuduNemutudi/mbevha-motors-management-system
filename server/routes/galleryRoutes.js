/**
 * routes/galleryRoutes.js
 * Mounted at /api/gallery in server.js
 */
const express = require('express');
const router  = express.Router();

const { protect }        = require('../middleware/authMiddleware');
const { uploadGallery }  = require('../middleware/upload');
const { getAll, upload, updateCaption, remove } = require('../controllers/galleryController');

// Public
router.get('/', getAll);

// Admin only
router.post('/',       protect, uploadGallery.single('image'), upload);
router.patch('/:id',   protect, updateCaption);
router.delete('/:id',  protect, remove);

module.exports = router;
