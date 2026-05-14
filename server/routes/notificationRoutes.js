const express = require('express');
const { saveToken, sendNotification, sendMultipleNotification } = require('../controllers/notificationController');
const { authenticateAccessToken } = require('../utils/jwtUtil');
const router = express.Router();

router.post('/save-token',authenticateAccessToken,saveToken)
router.post('/send-notification',sendNotification)
router.post('/send-multiple-notification',sendMultipleNotification)

module.exports = router;