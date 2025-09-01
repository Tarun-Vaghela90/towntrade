const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/category");
const Chat = require("../models/Chat");
const Report = require("../models/Report");

// GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    // Counts
    const [usersCount, productsCount, categoriesCount, chatsCount, reportsCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Chat.countDocuments(),
      Report.countDocuments(),
    ]);

    // Latest Products
    const latestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title price status")
      .populate("category", "name")
      .populate("seller", "fullName");

    // Latest Users
    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email");

    // Products by Category (for chart)
    const productsByCategoryAgg = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },
      { $project: { _id: 0, category: "$categoryInfo.name", count: 1 } }
    ]);

    // Reports status (for chart)
    const reportsStatusAgg = await Report.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", value: 1 } }
    ]);

    res.json({
      users: usersCount,
      products: productsCount,
      categories: categoriesCount,
      chats: chatsCount,
      reports: reportsCount,
      latestProducts,
      latestUsers,
      productsByCategory: productsByCategoryAgg,
      reportsStatus: reportsStatusAgg
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
