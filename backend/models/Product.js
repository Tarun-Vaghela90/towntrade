const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  title: {
    type: String,
    required: [true, "Product title is required"],
    trim: true
  },
  brand: {
    type: String,
    required: [true, "Product brand is required"],
    trim: true
  },

  description: {
    type: String,
    required: [true, "Product description is required"]
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "sold"], 
    default: "pending"
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  price: {
    type: Number,
    required: [true, "Product price is required"]
  },

  images: [{
    type: String,
    required: true
  }],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  // GeoJSON format for location search
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },

  // Human-readable location (city, street, etc.)
  locationName: {
    type: String,
    trim: true,
    default: ""
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

}, { timestamps: true });

// Index for full-text search
productSchema.index({ title: "text", description: "text" });

// Index for location queries
productSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Product", productSchema);
