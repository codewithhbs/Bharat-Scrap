const User = require("../models/user.model");
const admin = require("../config/firebase");
const Notification = require("../models/Notification");

exports.saveToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user?.sub;
        // console.log("userId",userId)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.fcmToken === token) {
            return res.status(200).json({
                success: true,
                message: "Token already saved"
            })
        }
        user.fcmToken = token;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Token saved successfully"
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.sendNotification = async (req, res) => {
    try {
        const { token, title, body, data } = req.body;

        const message = {
            token: token,           // user ka FCM token
            notification: {
                title: title,         // "Aapki gaadi ka offer aa gaya!"
                body: body,           // "Maruti Swift - ₹3,50,000"
            },
            data: data || {},       // extra data (screen navigate karne ke liye)
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'default',
                },
            },
        };

        await admin.messaging().send(message);
        return res.status(200).json({
            success: true,
            message: "Notification sent successfully"
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.sendMultipleNotification = async (req, res) => {
    try {
        const { tokens, title, body, data } = req.body;

        const message = {
            tokens: tokens,           // user ka FCM token
            notification: {
                title: title,         // "Aapki gaadi ka offer aa gaya!"
                body: body,           // "Maruti Swift - ₹3,50,000"
            },
            data: data || {},       // extra data (screen navigate karne ke liye)
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'default',
                },
            },
        };

        await admin.messaging().sendMulticast(message);
        return res.status(200).json({
            success: true,
            message: "Notification sent successfully"
        })
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

exports.unreadNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user?.sub,
            isRead: false,
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, notifications });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.markAsReadAll = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}