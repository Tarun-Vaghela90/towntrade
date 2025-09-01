const admin = require("../config/firebase");
const User = require("../models/User");

/**
 * Send notification to all users except the excluded ones
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {Object} data - Optional additional data
 * @param {Array<String>} excludeUserIds - Array of user IDs to exclude
 */
const sendNotificationToAllUsers = async (title, body, data = {}, excludeUserIds = []) => {
  try {
    if (!title || !body) {
      console.warn("⚠️ Missing title or body for notification");
      return { success: false, message: "Missing title or body" };
    }

    // Fetch users with valid tokens, excluding multiple if provided
    const users = await User.find({
      fcmToken: { $exists: true, $ne: null, $ne: "" },
      ...(excludeUserIds.length && { _id: { $nin: excludeUserIds } })
    });

    if (!users.length) {
      console.warn("⚠️ No users with FCM tokens to send notification");
      return { success: false, message: "No FCM tokens found" };
    }

    // Collect unique tokens
    const allTokens = [...new Set(users.map(user => user.fcmToken))];
    const BATCH_SIZE = 500;
    let totalSuccess = 0, totalFailure = 0, removedTokensCount = 0;

    for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
      const batchTokens = allTokens.slice(i, i + BATCH_SIZE);

      const message = {
        notification: { title, body },
        data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        tokens: batchTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // Collect invalid tokens
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const token = batchTokens[idx];
          console.warn(`❌ Failed for token ${token}: ${resp.error?.message}`);
          invalidTokens.push(token);
        }
      });

      // Remove invalid tokens in bulk
      if (invalidTokens.length) {
        const res = await User.updateMany(
          { fcmToken: { $in: invalidTokens } },
          { $set: { fcmToken: null } }
        );
        removedTokensCount += res.modifiedCount;
      }
    }

    console.log(`✅ Broadcast Notifications: ${totalSuccess} success, ${totalFailure} failed, ${removedTokensCount} tokens removed`);
    return { success: true, totalSuccess, totalFailure, removedTokensCount };

  } catch (err) {
    console.error("❌ Notification error:", err.message);
    return { success: false, message: err.message };
  }
};

module.exports = sendNotificationToAllUsers;
