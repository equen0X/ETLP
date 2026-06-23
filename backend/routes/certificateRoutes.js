const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const {
    generateCertificate,
    verifyCertificate,
    getMyCertificates
} = require("../controllers/certificateController");

router.post(
    "/generate",
    protect,
    generateCertificate
);

router.get(
    "/verify/:code",
    verifyCertificate
);

router.get(
    "/my-certificates",
    protect,
    getMyCertificates
);

module.exports = router;