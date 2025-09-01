// backend/routes/notificationRoutes.js
const express = require("express");
const { sendNotification,getNotifications , markAsRead, markAllAsRead } = require("../controllers/notificationController");
const { fetch_user } = require("../middlewares/AuthMiddleware");

const router = express.Router();

router.post("/send", fetch_user, sendNotification);  //  firebase   push notification
router.get("/", fetch_user, getNotifications);
router.put("/read", fetch_user, markAsRead);
router.put("/markallread", fetch_user, markAllAsRead);
module.exports = router;
