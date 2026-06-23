const express = require("express");
const router = express.Router();

const { listFiles } = require("../controllers/driveController");

// GET /api/drive/files?folderId=FOLDER_ID
router.get("/files", listFiles);

module.exports = router;
