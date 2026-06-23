const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../middleware/uploadMiddleware');
const { uploadFile, health } = require('../controllers/uploadController');

// POST /api/uploads/cloudinary
router.post('/cloudinary', upload.single('file'), uploadToCloudinary, uploadFile);

router.get('/health', health);

module.exports = router;
