const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.isBlocked) {
            res.status(401);
            throw new Error('Your account is blocked. Please contact support.');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            role: user.role,
            profileImage: user.profileImage,
            token: generateToken(user._id),
            phone:user.phone
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    let { name, email, password, gender, phone, country } = req.body;

    // Normalize gender to lowercase
    if (gender) gender = gender.toLowerCase();

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        gender,
        phone,
        country,
        role: 'user' // Default role
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            role: user.role,
            token: generateToken(user._id),
            profileImage: user.profileImage
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            phone: user.phone,
            country: user.country,
            profileImage: user.profileImage,
            role: user.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log(req.body, " ==>> update user")
    console.log(user, " ==>> update user user")
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.country = req.body.country || user.country;

        // Normalize gender to lowercase
        if (req.body.gender) {
            user.gender = req.body.gender.toLowerCase();
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            gender: updatedUser.gender,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
            profileImage: updatedUser.profileImage,
            phone:updatedUser.phone
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
};
