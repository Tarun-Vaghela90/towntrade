const express = require("express");
const userController = require("../controllers/userController");
const { restrictTo } = require("../middlewares/RestrictTo");
const { fetch_user } = require("../middlewares/AuthMiddleware");
const router = express.Router();

const User = require("../models/User");
const multer = require("multer");



const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/users/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });



router.use('/',fetch_user)   // middleware

// Admin privillage
router.put("/AccountStatus",restrictTo("admin") ,userController.accountStatus); 

router.get('/me',userController.getUser)
router.put("/premium",restrictTo("user") ,userController.UserAccountRole); 
router.get("/", userController.getUsers); // Get all users
router.get("/:id", userController.getUser); // Get single user
router.put("/:id",upload.single("profileImage") ,userController.updateUser); // Update user
router.delete("/:id", userController.deleteUser); // Delete user
router.post("/save-fcm-token", async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user._id;

    if (!userId || !fcmToken) {
      return res.status(400).json({ error: "userId and fcmToken required" });
    }

    // Save/replace latest FCM token
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },   // ✅ just replace with latest token
      { new: true }
    );

    res.json({ success: true, fcmToken: user.fcmToken });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// router.post("/save-fcm-token", async (req, res) => {
//   try {
//     const {  fcmToken } = req.body;
// const  userId =  req.user._id
//     if (!userId || !fcmToken) {
//       return res.status(400).json({ error: "userId and fcmToken required" });
//     }

//     // Update user and add token if it doesn’t exist
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { $addToSet: { fcmTokens: fcmToken } }, // prevents duplicates
//       { new: true }
//     );

//     res.json({ success: true, fcmTokens: user.fcmTokens });
//   } catch (error) {
//     console.error("Error saving FCM token:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
module.exports = router;
