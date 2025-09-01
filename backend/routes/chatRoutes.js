const express = require("express");
const Chat = require("../models/Chat");
const { fetch_user } = require("../middlewares/AuthMiddleware");
const User  =  require('../models/User')
const router = express.Router();
// 🔹 Get all users the current user is chatting with
router.get("/myChats", fetch_user, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all chats where current user is sender or receiver
    const chats = await Chat.find({
      $or: [{ senderUser: userId }, { receiverUser: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("senderUser", "fullName profileImage")
      .populate("receiverUser", "fullName profileImage")
      .populate("product", "title");

    // Map unique users with last message and product info
    const usersMap = {};
    chats.forEach((chat) => {
      const otherUser =
        String(chat.senderUser._id) === String(userId)
          ? chat.receiverUser
          : chat.senderUser;

      if (!usersMap[otherUser._id]) {
        usersMap[otherUser._id] = {
          _id: otherUser._id,
          fullName: otherUser.fullName,
          profileImage: otherUser.profileImage,
          lastMessage: chat.message,
          product: chat.product
            ? { _id: chat.product._id, title: chat.product.title }
            : null,
        };
      }
    });

    res.json({ users: Object.values(usersMap) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// 🔹 Get chat history with a specific user
router.get("/:receiverId", fetch_user, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    const chats = await Chat.find({
      $or: [
        { senderUser: senderId, receiverUser: receiverId },
        { senderUser: receiverId, receiverUser: senderId }
      ]
    })
      .populate("senderUser", "fullName profileImage")
      .populate("receiverUser", "fullName profileImage")
      .populate("product", "title")
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Chats fetched successfully",
      chats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Mark a message as read
router.put("/:chatId/read", fetch_user, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { status: "read" },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({
      message: "Message marked as read",
      chat
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Send a message (REST version, not socket)
router.post("/", fetch_user, async (req, res) => {
  try {
    const { receiverUser, message, product } = req.body;
    const senderUser = req.user._id;

    if (!receiverUser) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    const chat = await Chat.create({
      senderUser,
      receiverUser,
      message,
      product
    });

    res.status(201).json({
      message: "Message sent successfully",
      chat
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/block/:userId", fetch_user, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.blockedUsers.includes(req.params.userId)) {
    user.blockedUsers.push(req.params.userId);
    await user.save();
  }
  res.json({ message: "User blocked" });
});

// Unblock user
router.post("/unblock/:userId", fetch_user, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.blockedUsers = user.blockedUsers.filter(u => u.toString() !== req.params.userId);
  await user.save();
  res.json({ message: "User unblocked" });
});

module.exports = router;
