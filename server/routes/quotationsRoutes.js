const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAll, getOne, create, update, remove,
  duplicate, updateStatus, convert, pdf,
} = require('../controllers/quotationsController');

router.get('/',                  protect, getAll);
router.post('/',                 protect, create);
router.get('/:id',               protect, getOne);
router.put('/:id',               protect, update);
router.delete('/:id',            protect, remove);
router.post('/:id/duplicate',    protect, duplicate);
router.patch('/:id/status',      protect, updateStatus);
router.post('/:id/convert',      protect, convert);
router.get('/:id/pdf',           protect, pdf);

module.exports = router;
