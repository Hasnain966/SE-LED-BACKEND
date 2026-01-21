const Contact = require('../models/contactModel');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Simple validation
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const newContact = new Contact({
            name,
            email,
            phone,
            message
        });

        const savedContact = await newContact.save();

        res.status(201).json({
            message: 'Contact form submitted successfully',
            contact: savedContact
        });

    } catch (error) {
        console.error('Error in submitContactForm:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    submitContactForm
};
