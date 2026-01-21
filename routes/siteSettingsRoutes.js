const express = require('express');
const router = express.Router();
const { getSettings, updateTheme } = require('../controllers/siteSettingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/theme', protect, admin, updateTheme);

module.exports = router;
