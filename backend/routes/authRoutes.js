const express = require("express");
const authController = require("../controllers/authController");
const { signupValidator, loginValidator, email_verification, password_verify } = require("../validators/authValidator");
const validateRequest = require("../middlewares/validateRequest");
const { restrictTo } = require("../middlewares/RestrictTo");
const { fetch_user } = require("../middlewares/AuthMiddleware");
const  User  =   require('../models/User')
const multer = require("multer");



const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/users/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = express.Router();

router.post("/signup", signupValidator, validateRequest, authController.signup);
router.post("/login", loginValidator, validateRequest, authController.login);
router.post("/send_email_verification", email_verification, validateRequest, authController.send_email_verify);
router.post("/forgot-password", email_verification, validateRequest, authController.forgot_password);
router.post("/reset-password/:token", password_verify, validateRequest, authController.reset_password);
router.get("/verify-email/:token", authController.email_verify);

// @desc  only  logged  user  with user id  can  access this  route

router.post('/favorite/:id', fetch_user, restrictTo("user","premium"), authController.addToFavorites)
router.delete('/favorite/:id', fetch_user, restrictTo("user","premium"), authController.removeFromFavorites)
router.post('/watchlist/:id', fetch_user, restrictTo("user","premium"), authController.addToWatchlist)
router.delete('/watchlist/:id', fetch_user, restrictTo("user","premium"), authController.removeFromWatchlist)
router.get("/watchlist", fetch_user, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("watchlist") // populate full product objects
      .select("watchlist");

    res.json(user.watchlist);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET current user's favorites
router.get("/favorites", fetch_user, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("favorites") // populate full product objects
      .select("favorites");

    res.json(user.favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
