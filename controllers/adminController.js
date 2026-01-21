const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({ isPaid: true });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Weekly logins logic would require tracking login history which we haven't implemented.
    // We will return a placeholder or 0 for now to prevent errors.
    const weeklyLogins = 0;

    res.json({
        totalUsers,
        totalOrders,
        totalRevenue,
        weeklyLogins
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isBlocked = !user.isBlocked; // Toggle block status
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            isBlocked: updatedUser.isBlocked,
            message: `User ${updatedUser.isBlocked ? 'Blocked' : 'Unblocked'}`
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getDashboardStats,
    getUsers,
    deleteUser,
    blockUser
};
