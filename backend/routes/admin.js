const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, getUserById, addUser, getStores, addStore } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', addUser);
router.get('/stores', getStores);
router.post('/stores', addStore);

module.exports = router;
