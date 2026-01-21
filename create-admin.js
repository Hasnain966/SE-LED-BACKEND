const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const createAdmin = async () => {
    try {
        // Hardcoded Admin Details
        const adminEmail = 'admin@seledworld.com';
        const adminPassword = 'adminpassword123'; // The user can change this

        // Check if admin already exists
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('User with this email already exists.');
            // Optional: Update role to admin if it exists but isn't admin
            userExists.role = 'admin';
            userExists.password = adminPassword; // Update password to the hardcoded one
            await userExists.save();
            console.log('Existing user updated to Admin role with new password.');
        } else {
            // Create new Admin
            const user = await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                gender: 'Male', // Default fields if required
                phone: '0000000000',
                country: 'Pakistan'
            });
            console.log('Admin User Created Successfully!');
        }

        console.log('-----------------------------------');
        console.log('Login Credentials:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
