const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const sendEmail = require("../utils/email");
const path = require('path')
const Product = require('../models/Product');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// @desc Signup new user
exports.signup = async (req, res) => {


  try {
    const { fullName, username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      role
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const data = {
      name: user.username,
      token: token
    }
    sendEmail(user.email, "email_verfiy", data)

    // sendNotificationToUser(user._id,"User","SignUp Successfully")
    // Return token
    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        watchlist:user.watchlist,
        favorites:user.favorites,
        profileImage:user.profileImage

        
      }
    });
    

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Login user
exports.login = async (req, res) => {

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    // Return token
    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        watchlist:user.watchlist,
        favorites:user.favorites,
        emailVerified:user.emailVerified,
        profileImage:user.profileImage,
        accountStatus:user.accountStatus,
        blockedUsers:user.blockedUsers
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc  send  email verification
exports.send_email_verify = async (req, res) => {



  try {
    const { email } = req.body;


    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Could Not Find Email " });
    }



    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const data = {
      name: user.username,
      token: token
    }
    sendEmail(user.email, "email_verfiy", data)

    res.json({
      message: "Verification link sent to your email",


    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// @desc  verify  email  by  token send in email
exports.email_verify = async (req, res) => {



  try {
    const token = req.params.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);



    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Could Not Found User " });
    }



    user.emailVerified = true;
    await user.save();
    const to = user.email


    const data = {
      name: user.username,
    }
    try {

      sendEmail(to, "confirm_email_verify", data)
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

    res.sendFile(path.join(__dirname, "../public/emailConfirm.html"));
    // res.json({
    //   message: "Email Verify Successfully",

    // });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// @  send  token for  reset  password
exports.forgot_password = async (req, res) => {


  try {
    const { email } = req.body;


    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Could Not Find Email " });
    }



    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const data = {
      name: user.username,
      token: token
    }
    sendEmail(user.email, "forgot-password", data)

    res.json({
      message: "Verification link sent to your email",


    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// @desc verify and change  password
exports.reset_password = async (req, res) => {


  try {


    // Check if user exists
    const token = req.params.token;
    const newpassword = req.body.password
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);



    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Could Not Found User " });
    }


    const hashedPassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedPassword;
    await user.save();


    res.json({
      message: "Password Reset Successfully",


    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// todo

// 2. **Get user’s purchase history**

//    * `GET /users/:id/buy-products`

// @desc  Add product to watchlist of user
// @ POST /:id

exports.addToWatchlist = async (req, res) => {
  try {
    const productId = req.params?.id;
    const userId = req.user?._id;

    if (!productId || !userId) {
      return res.status(400).json({ message: "Product ID or User ID cannot be null" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // Prevent duplicate entries
    if (user.watchlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in watchlist" });
    }

    user.watchlist.push(productId);
    await user.save();

    return res.status(200).json({
      message: "Product added to watchlist successfully",
      watchlist: user.watchlist
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Remove product to watchlist of user
// @ DELETE /:id
exports.removeFromWatchlist = async (req, res) => {
  try {
    const productId = req.params?.id;
    const userId = req.user?._id;

    if (!productId || !userId) {
      return res.status(400).json({ message: "Product ID or User ID cannot be null" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.watchlist = user.watchlist.filter(id => id.toString() !== productId);
    await user.save();

    return res.status(200).json({
      message: "Product removed from watchlist successfully",
      watchlist: user.watchlist
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Add product to favorite of user
// @ POST /:id

exports.addToFavorites = async (req, res) => {
  try {
    const productId = req.params?.id;
    const userId = req.user?._id;

    if (!productId || !userId) {
      return res.status(400).json({ message: "Product ID or User ID cannot be null" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // Prevent duplicate entries
    if (user.favorites.includes(productId)) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    user.favorites.push(productId);
    await user.save();

    return res.status(200).json({
      message: "Product added to favorites successfully",
      favorites: user.favorites
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Remove product to favorites of user
// @ DELETE /:id
exports.removeFromFavorites = async (req, res) => {
  try {
    const productId = req.params?.id;
    const userId = req.user?._id;

    if (!productId || !userId) {
      return res.status(400).json({ message: "Product ID or User ID cannot be null" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();

    return res.status(200).json({
      message: "Product removed from favorites successfully",
      favorites: user.favorites
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};






