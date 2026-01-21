const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    }],
    shippingAddress: { // Implicit requirements, usually needed for orders
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    paymentMethod: { type: String, required: true },
    paymentResult: { // For online payments (future proofing)
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    contactNumber: { type: String },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Help Line', 'Accepted', 'Shipped', 'Delivered', 'Deleted']
    },
    adminMessage: { type: String }, // Message from admin for Help Line or other statuses
    statusHistory: [{
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        message: { type: String }
    }],

    // Tracking System
    trackingId: { type: String, unique: true },
    trackingPassword: { type: String },

    deliveryDate: { type: Date }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
