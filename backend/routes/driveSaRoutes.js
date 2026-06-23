const express = require("express");
const router = express.Router();

const { listFilesSA, streamFileSA } = require("../controllers/driveSaController");

// GET /api/drive/sa/files?folderId=FOLDER_ID
router.get("/files", listFilesSA);

// GET /api/drive/sa/file/:id  -> streams the file bytes
router.get("/file/:id", streamFileSA);
router.get("/status", require("../controllers/driveSaController").status);

module.exports = router;
