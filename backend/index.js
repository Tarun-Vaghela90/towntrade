const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // replace with frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const chatsRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categorys", categoryRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dash",require('./routes/dashboardRoutes'))
app.use("/api/reviews",require('./routes/reviewRoutes'))
app.use("/api/admin/products", require("./routes/admin/BulkProductRoutes"));
app.use("/api/admin/users", require("./routes/admin/BulkUserRoutes"));
app.use("/api/admin/reports", require("./routes/admin/BulkReportRoutes"));
app.use('/api/ai',require('./routes/gemini/productDescription'))
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));




const Chat = require("./models/Chat");
const  createNotification  = require("./service/notificationService");
const User = require("./models/User");
const { onlineUsers, setIo } = require("./utils/socketManager");
// Store connected users
setIo(io);
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // When a user joins, map their userId to socket.id
  socket.on("joinChat", (userId) => {
    socket.join(userId);
    onlineUsers.set(userId.toString(), socket.id);
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
      // ✅ Check if receiver has blocked the sender
      const receiver = await User.findById(data.receiverUser).select("blockedUsers");
      if (receiver?.blockedUsers?.includes(data.senderUser)) {
        console.log(`🚫 User ${data.receiverUser} has blocked ${data.senderUser}. Message not sent.`);
        return; // stop here, don't save chat or notify
      }

      // Save the message
      const chat = await Chat.create({
        senderUser: data.senderUser,
        receiverUser: data.receiverUser,
        message: data.message,
        product: data.product,
      });

      // Populate sender, receiver, product
      const populatedChat = await Chat.findById(chat._id)
        .populate("senderUser", "fullName profileImage")
        .populate("receiverUser", "fullName profileImage")
        .populate("product", "title");

      // Emit to sender + receiver (if online)
      [data.senderUser, data.receiverUser].forEach((userId) => {
        socket.to(userId).emit("receiveMessage", populatedChat);
      });

      // Also emit back to sender
      socket.emit("receiveMessage", populatedChat);

      // ✅ Check if receiver is offline
      if (!onlineUsers.has(data.receiverUser.toString())) {
        console.log(`📨 User ${data.receiverUser} is offline. Sending push notification...`);

        // Trigger Firebase Notification
        await createNotification(
          data.receiverUser,
          `New message from ${populatedChat.senderUser.fullName}`,
          data.message,
          {
            link: `/chat/${data.senderUser}`, // optional deep link
          }
        );
      }

    } catch (err) {
      console.error("❌ Error saving/sending message:", err);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});




// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));