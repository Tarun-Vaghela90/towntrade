const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  senderUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender ID is required"]
  },
  receiverUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Receiver ID is required"]
  },
  message: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String // store image/file URLs
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // optional, link chat to a product listing
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  }
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
