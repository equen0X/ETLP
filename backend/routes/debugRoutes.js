const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

router.get('/sa-key', debugController.saKeyInfo);

module.exports = router;
