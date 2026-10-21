const express = require('express');
const { saveToken, sendNotification, sendMultipleNotification, unreadNotifications, markAsRead, markAsReadAll } = require('../controllers/notificationController');
const { authenticateAccessToken } = require('../utils/jwtUtil');
const router = express.Router();

router.post('/save-token',authenticateAccessToken,saveToken)
router.post('/send-notification',sendNotification)
router.post('/send-multiple-notification',sendMultipleNotification)

router.get('/unread', authenticateAccessToken, unreadNotifications)
router.patch('/mark-read/:id', authenticateAccessToken, markAsRead)
router.patch('/mark-read-all', authenticateAccessToken, markAsReadAll)

module.exports = router;