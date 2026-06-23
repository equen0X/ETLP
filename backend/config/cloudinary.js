const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary if credentials exist
const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("☁️ Cloudinary Configured Successfully");
} else {
  console.log("⚠️ Cloudinary credentials missing. File uploads will fall back to local storage.");
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured: !!isConfigured
};
