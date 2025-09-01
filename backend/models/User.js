const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },
  password: { type: String, required: true, minlength: 6, select: false },

  profileImage: { type: String, default: "" },
  mobile: { type: String, trim: true }, 
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  role: { type: String, enum: ["user", "premium", "admin"], default: "user" },

  accountStatus: { type: String, enum: ["active", "deactive", "blocked"], default: "active" },

  sellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  buyProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

  emailVerified: { type: Boolean, default: false },

  refreshToken: { type: String },
  tokenExpiry: { type: Date },
fcmToken: { type: String }

  // fcmTokens: [{ type: String }]
}, { timestamps: true });

// Geospatial index
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
