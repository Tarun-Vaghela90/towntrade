const admin = require("../config/firebase");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { onlineUsers, getIo } = require("../utils/socketManager");

/**
 * Send FCM notification, emit via socket, and save in DB
 */
const sendNotificationToUser = async (userId, title, body, data = {}, link = "") => {
  try {
    if (!userId || !title || !body) {
      console.warn("⚠️ Missing params for notification:", { userId, title, body });
      return { success: false, message: "Missing parameters" };
    }

    const user = await User.findById(userId).select("fcmToken");
    if (!user) {
      console.warn(`⚠️ User ${userId} not found`);
      return { success: false, message: "User not found" };
    }

    // 1️⃣ Save notification in DB
    const newNotification = await Notification.create({
      userId,
      title,
      body,
      link,
    });

    // 2️⃣ Send FCM notification
    if (user.fcmToken) {
      const message = {
        token: user.fcmToken,
        notification: { title, body },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          type: "custom",
          ...data,
        },
      };

      await admin.messaging().send(message);
      console.log("✅ Notification sent via FCM:", userId);
    }

    // 3️⃣ Emit via socket if user is online
    const io = getIo();
    if (io && onlineUsers.has(userId.toString())) {
      const socketId = onlineUsers.get(userId.toString());
      io.to(socketId).emit("notification", {
        _id: newNotification._id,
        title,
        body,
        link,
        data,
        isRead: false,
        createdAt: newNotification.createdAt,
      });
      console.log(`💬 Notification emitted via socket to user ${userId}`);
    } else {
      console.log(`📨 User ${userId} is offline. Will receive FCM only.`);
    }

    return { success: true, notification: newNotification };
  } catch (err) {
    console.error("❌ Notification error:", err.message);
    return { success: false, message: err.message };
  }
};

module.exports = sendNotificationToUser;
