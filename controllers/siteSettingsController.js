const asyncHandler = require('express-async-handler');
const SiteSettings = require('../models/siteSettingsModel');

// @desc    Get site settings (theme)
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.findOne().sort({ createdAt: -1 });
    if (settings) {
        res.json(settings);
    } else {
        // Return default if none exists
        res.json({
            theme: {
                primary: '#3b82f6',
                secondary: '#fbbf24',
                background: '#f3f4f6',
                text: '#1f2937',
                navbar: '#ffffff'
            },
            activeThemeName: 'Default'
        });
    }
});

// @desc    Update site theme
// @route   PUT /api/settings/theme
// @access  Private/Admin
const updateTheme = asyncHandler(async (req, res) => {
    const { theme, name } = req.body;

    // Check if settings exist, otherwise create new
    let settings = await SiteSettings.findOne().sort({ createdAt: -1 });

    if (settings) {
        settings.theme = theme;
        settings.activeThemeName = name || settings.activeThemeName;
        const updatedSettings = await settings.save();

        res.json(updatedSettings);
    } else {
        const newSettings = new SiteSettings({
            theme,
            activeThemeName: name || 'Custom'
        });
        const createdSettings = await newSettings.save();

        res.json(createdSettings);
    }
});

module.exports = {
    getSettings,
    updateTheme
};
