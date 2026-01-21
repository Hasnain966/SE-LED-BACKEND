const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    deleteUser,
    blockUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id')
    .delete(protect, admin, deleteUser);
router.route('/users/:id/block').put(protect, admin, blockUser);

module.exports = router;
