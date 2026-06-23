const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

// Configure local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images and videos)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|mp4|mkv|pdf|txt/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Unsupported file format"));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max limit
});

// Middleware to upload to Cloudinary (optional step after local disk upload)
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  if (!isCloudinaryConfigured) {
    // If Cloudinary is not configured, fallback to serving locally
    const serverUrl = `${req.protocol}://${req.get("host")}`;
    req.file.url = `${serverUrl}/uploads/${req.file.filename}`;
    return next();
  }

  try {
    let resourceType = "auto";
    if (req.file.mimetype.startsWith("video")) {
      resourceType = "video";
    } else if (req.file.mimetype.startsWith("image")) {
      resourceType = "image";
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "etlp",
      resource_type: resourceType
    });

    // Delete local temporary file
    fs.unlinkSync(req.file.path);

    // Save Cloudinary URL in req.file.url for controllers
    req.file.url = result.secure_url;
    next();
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    // On Cloudinary failure, fallback to local URL
    const serverUrl = `${req.protocol}://${req.get("host")}`;
    req.file.url = `${serverUrl}/uploads/${req.file.filename}`;
    next();
  }
};

module.exports = {
  upload,
  uploadToCloudinary
};
