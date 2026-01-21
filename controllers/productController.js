const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }

    try {
        const product = await Product.findById(id);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        product.views = Number(product.views || 0) + 1;
        await product.save().catch(err => console.error(err.message));

        // if (req.io && typeof req.io.emit === 'function') {
        //     req.io.emit('product:view', { id: product._id, views: product.views });
        // }

        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err.message);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await Product.deleteOne({ _id: product._id });

    // if (req.io && typeof req.io.emit === 'function') {
    //     req.io.emit('product:delete', req.params.id);
    // }

    res.json({ message: 'Product removed' });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    console.log(req.body, "==>> new product body")
    const { name, price, category, description, countInStock, features, images, isFeatured, isNewArrival } = req.body
    const product = new Product({
        name,
        price,
        user: req.user._id,
        images,
        category,
        countInStock,
        // numReviews: 0,
        description,
        isFeatured,
        features: features,
        // colors
        isNewArrival
    });


    const createdProduct = await product.save();

    // if (req.io && typeof req.io.emit === 'function') {
    //     req.io.emit('product:create', createdProduct);
    // }

    res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
    try {
        const {
            name, price, description, images,
            category, countInStock,
            features = [], colors = [],
            isFeatured, isNewArrival
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.name = name ?? product.name;
        product.price = price !== undefined ? Number(price) : product.price;
        product.description = description ?? product.description;
        product.category = category ?? product.category;
        product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;
        product.images = Array.isArray(images) ? images : product.images;
        product.features = Array.isArray(features) ? features.filter(f => f.label && f.value) : product.features;
        product.colors = Array.isArray(colors) ? colors : product.colors;
        product.isFeatured = typeof isFeatured === 'boolean' ? isFeatured : product.isFeatured;
        product.isNewArrival = typeof isNewArrival === 'boolean' ? isNewArrival : product.isNewArrival;

        const updatedProduct = await product.save();

        // if (req.io && typeof req.io.emit === 'function') {
        //     req.io.emit('product:update', updatedProduct);
        // }

        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});




// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }

    const product = await Product.findById(id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
    }

    if (!rating || !comment) {
        res.status(400);
        throw new Error('Please provide both rating and comment');
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        res.status(400);
        throw new Error('Rating must be a number between 1 and 5');
    }

    const review = {
        name: req.user.name,
        rating: numericRating,
        comment,
        user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

    await product.save();

    // if (req.io && typeof req.io.emit === 'function') {
    //     req.io.emit('product:review', { id: product._id, review });
    // }

    // Return the review itself so frontend can update UI
    res.status(201).json(review);
});

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
};
