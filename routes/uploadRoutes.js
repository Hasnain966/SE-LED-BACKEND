const path = require('path');
const express = require('express');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// File type validation
// File type validation
function checkFileType(req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpg, jpeg, png, webp)'));
    }
}

// Multer upload instance
const upload = multer({
    storage,
    fileFilter: checkFileType,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload route
// Field name should match frontend: 'image'
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Serve relative path for frontend
        const relativePath = `/uploads/${req.file.filename}`;
        return res.status(200).json({ path: relativePath });
    } catch (error) {
        console.error('Upload Error:', error);
        return res.status(500).json({ message: 'Server Error during upload' });
    }
});

module.exports = router;
