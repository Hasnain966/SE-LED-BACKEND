const mongoose = require('mongoose');

const siteSettingsSchema = mongoose.Schema({
    theme: {
        primary: { type: String, default: '#3b82f6' }, // Default blue
        secondary: { type: String, default: '#fbbf24' }, // Default yellow/amber
        background: { type: String, default: '#f3f4f6' }, // Default gray
        text: { type: String, default: '#1f2937' }, // Default dark gray
        navbar: { type: String, default: '#ffffff' } // Default white
    },
    activeThemeName: { type: String, default: 'Default' }
}, {
    timestamps: true
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
module.exports = SiteSettings;
