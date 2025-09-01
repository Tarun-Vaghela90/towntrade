// routes/product.js
const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const path =  require('path')
const fs =  require('fs')


// example   req.body  
// {
//   "ids": ["64f8a3b12b6a1234abcd5678", "64f8a3b12b6a1234abcd5679"],
//   "status": "approved"
// }

// Bulk update status (approve/reject/sold)
router.put("/bulk-update", async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) {
      return res.status(400).json({ message: "Invalid request" });
    }
    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    res.json({ message: "Products updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Bulk delete products
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Find products first to get image paths
    const products = await Product.find({ _id: { $in: ids } });

    for (const product of products) {
      if (product.images && product.images.length > 0) {
        product.images.forEach((imgPath) => {
          const fullPath = path.join(__dirname, "../../", imgPath.replace(/\\/g, "/"));
          if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
              if (err) console.error("Failed to delete image:", fullPath, err);
            });
          }
        });
      }
    }

    // Delete products from DB
    await Product.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Products and related images deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
