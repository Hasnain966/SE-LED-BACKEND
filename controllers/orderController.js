const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const crypto = require('crypto');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        contactNumber
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // Generate Tracking Info
        const trackingId = 'SE-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const trackingPassword = crypto.randomBytes(4).toString('hex'); // Simple password

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            contactNumber,
            trackingId,
            trackingPassword
        });

        const createdOrder = await order.save();

        // Emit Real-Time Event
        // req.io.emit('order:new', createdOrder);
        // req.io.emit('admin:statsUpdate'); // Signal to refresh stats

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, message } = req.body; // Getting optional message from admin
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        // Update admin message if provided
        if (message) {
            order.adminMessage = message;
        }

        // Push to history
        order.statusHistory.push({
            status,
            message: message || `Order marked as ${status}`,
            updatedAt: Date.now()
        });

        const updatedOrder = await order.save();
        // req.io.emit('order:update', updatedOrder); // Real-time update
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        const updatedOrder = await order.save();
        // req.io.emit('order:update', updatedOrder);
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

// @desc    Track Order
// @route   POST /api/orders/track
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
    const { trackingId, trackingPassword } = req.body;

    // Find order with matching credentials
    const order = await Order.findOne({
        trackingId,
        trackingPassword
    }).populate('user', 'name');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Invalid Tracking ID or Password');
    }
});

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    trackOrder,
    updateOrderStatus
};
