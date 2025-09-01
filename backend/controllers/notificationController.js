const admin = require("../config/firebase");
const User = require("../models/User");

exports.sendNotification = async (req, res) => {
  const { title, body, data = {} } = req.body; // <-- ✅ add data here

  try {
    if (!req.user._id || !title || !body) {
      console.warn("⚠️ Missing params for notification:", { title, body });
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const user = await User.findById(req.user._id).select("fcmToken");
    if (!user || !user.fcmToken) {
      console.warn(`⚠️ User ${req.user._id} has no FCM token`);
      return res.status(404).json({ success: false, message: "No FCM token" });
    }

    const message = {
      token: user.fcmToken,
      notification: {     
        title,
        body,
      },
      // data: {
      //   click_action: "FLUTTER_NOTIFICATION_CLICK",
      //   type: "custom",
      //   ...data, // ✅ Now safe
      // },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent to user:", req.user._id);

    return res.json({ success: true, response });
  } catch (err) {
    console.error("❌ Notification error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
const Notification = require("../models/Notification");



// Fetch user's notifications
exports.getNotifications = async (req, res) => {
  const userId = req.user._id; // from auth middleware
  const notifications = await Notification.find({ 
  userId,       // filter by user
  isRead: false // only unread notifications
}).sort({ createdAt: -1 });

  res.json(notifications);
};

// Mark as read
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.body;
  await Notification.findByIdAndUpdate(notificationId, { isRead: true });
  res.json({ success: true });
};
// Mark all notifications as read for the current user
exports.markAllAsRead = async (req, res) => {
  const userId = req.user._id; // assuming you have the logged-in user's ID in req.user

  try {
    await Notification.updateMany(
      { userId, isRead: false }, // only unread notifications
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("Failed to mark notifications as read:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

