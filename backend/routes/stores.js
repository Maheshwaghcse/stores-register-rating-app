const express = require('express');
const router = express.Router();
const { getStores, submitRating, updateRating } = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');

// Anyone logged in can view stores (token optional for guest)
router.get('/', authenticate, getStores);

// Ratings — only normal users
router.post('/ratings', authenticate, authorize('user'), submitRating);
router.put('/ratings/:id', authenticate, authorize('user'), updateRating);

module.exports = router;
