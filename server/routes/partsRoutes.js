/**
 * routes/partsRoutes.js
 * Mounted at /api/parts in server.js
 */
const express = require('express');
const router  = express.Router();

const { protect }       = require('../middleware/authMiddleware');
const { uploadPart }    = require('../middleware/upload');
const {
  getAll, getOne, create, update, toggleAvailability, remove,
} = require('../controllers/partsController');

// Public
router.get('/',    getAll);
router.get('/:id', getOne);

// Admin only
router.post('/',                   protect, uploadPart.single('image'), create);
router.put('/:id',                 protect, uploadPart.single('image'), update);
router.patch('/:id/availability',  protect, toggleAvailability);
router.delete('/:id',              protect, remove);

module.exports = router;
