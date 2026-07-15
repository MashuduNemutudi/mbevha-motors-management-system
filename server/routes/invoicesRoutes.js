const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAll, getOne, create, update, remove, updatePayment, pdf,
} = require('../controllers/invoicesController');

router.get('/',                  protect, getAll);
router.post('/',                 protect, create);
router.get('/:id',               protect, getOne);
router.put('/:id',               protect, update);
router.delete('/:id',            protect, remove);
router.patch('/:id/payment',     protect, updatePayment);
router.get('/:id/pdf',           protect, pdf);

module.exports = router;
