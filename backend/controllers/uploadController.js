const path = require('path');

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // The upload middleware (uploadToCloudinary) will have set req.file.url
  const url = req.file.url || null;

  return res.status(200).json({ success: true, url, originalName: req.file.originalname });
};

exports.health = (req, res) => {
  res.status(200).json({ success: true, message: 'Upload controller alive' });
};
