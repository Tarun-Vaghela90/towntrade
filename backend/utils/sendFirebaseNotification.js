// const admin = require("../config/firebase");
// const User = require("../models/User");

// /**
//  * Send FCM notification to a user (safe version)
//  * @param {String} userId - ID of the user
//  * @param {String} title - Notification title
//  * @param {String} body - Notification body
//  * @param {Object} [data] - Optional additional data
//  * @returns {Object} response or error info
//  */



// const sendNotificationToUser = async (userId, title, body, data = {}) => {
//   try {
//     if (!userId || !title || !body) {
//       console.warn("⚠️ Missing params for notification:", { userId, title, body });
//       return { success: false, message: "Missing parameters" };
//     }

//     const user = await User.findById(userId).select("fcmToken");
//     if (!user || !user.fcmToken) {
//       console.warn(`⚠️ User ${userId} has no FCM token`);
//       return { success: false, message: "No FCM token" };
//     }
//     console.log("from notificaiton",user)
//   console.log("fcm",user.fcmToken)
//     const message = {
//       token: user.fcmToken,
//       notification: {
//         title,
//         body,
//       },
//       data: {
//         click_action: "FLUTTER_NOTIFICATION_CLICK",
//         type: "custom",
//         ...data, // ✅ allow custom payload
//       },
//     };

//     const response = await admin.messaging().send(message);

//     console.log("✅ Notification sent to user:", userId);
//     return { success: true, response };
    
//   } catch (err) {
//     console.error("❌ Notification error:", err.message);
//     return { success: false, message: err.message };
//   }
// };
// module.exports = sendNotificationToUser;






// // const sendNotificationToUser = async (userId, title, body) => {
// //   try {
// //     if (!userId || !title || !body) {
// //       console.warn("⚠️ Missing params for notification:", { userId, title, body });
// //       return { success: false, message: "Missing parameters" };
// //     }

// //     const user = await User.findById(userId);
// //     if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
// //       console.warn(`⚠️ User ${userId} has no FCM tokens`);
// //       return { success: false, message: "No FCM tokens" };
// //     }

// //    const message = {
// //   notification: {
// //     title,
// //     body,
// //   },
// //   data: {
// //     click_action: "FLUTTER_NOTIFICATION_CLICK",
// //     type: "custom",
// //   }
// // };



// //     const response = await admin.messaging().sendEachForMulticast({
// //       ...message,
// //       tokens: user.fcmTokens,
// //     });

// //     console.log("✅ Notification sent:", response.successCount, "success,", response.failureCount, "failed");
// //     return { success: true, response };

// //   } catch (err) {
// //     console.error("❌ Notification error:", err.message);
// //     // return safe object instead of throwing
// //     return { success: false, message: err.message };
// //   }
// // };

