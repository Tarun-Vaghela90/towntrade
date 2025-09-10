const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "sold"], default: "pending" },
  isFeatured: { type: Boolean, default: false },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },
  locationName: { type: String, trim: true, default: "" },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // 🔑 New embedding field
  embedding: {
    type: [Number],
    default: []
  }

}, { timestamps: true });

productSchema.index({ title: "text", description: "text" });
productSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Product", productSchema);
