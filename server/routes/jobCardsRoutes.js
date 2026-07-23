const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAll, getOne, create, update, remove, pdf } = require('../controllers/jobCardsController');

router.get('/',         protect, getAll);
router.get('/:id',      protect, getOne);
router.post('/',        protect, create);
router.put('/:id',      protect, update);
router.delete('/:id',   protect, remove);
router.get('/:id/pdf',  protect, pdf);

module.exports = router;
