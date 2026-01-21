const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET all products, POST create product (Admin only)
router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

// POST create review for product (Protected user)
router.route('/:id/reviews').post(protect, createProductReview);

// GET, PUT (Admin), DELETE (Admin) for specific product
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
