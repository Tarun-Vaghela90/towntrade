const Product = require("../models/Product");
const factory = require("./handlerFactory");
const User = require("../models/User");
const { ApiFeature } = require("../utils/ApiFeature");
const sendNotificationToUser = require("../service/notificationService");
const sendNotificationToAllUsers = require("../utils/sendNotificationToAllUsers");



exports.createProduct = factory.createOne(Product)
// exports.getProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.getProducts = async (req, res) => {
  try {
    const result = await ApiFeature(Product, req.query);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getSellersProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found for this seller",
        products: []
      });
    }

    res.status(200).json({
      message: "Seller products retrieved successfully",
      products
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.seller_mark = async (req, res) => {
  try {
    const buyerId = req.body?.buyerId || null; // optional
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only seller or admin can mark as sold
    if (product.seller.toString() !== req.user._id.toString() && req.user.roles !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update product status to sold
    product.status = "sold";

    // If buyer is known, link to product
    if (buyerId) {
      product.buyer = buyerId; // optional field in Product schema

      // Also add product to buyer's purchase history
      await User.findByIdAndUpdate(buyerId, {
        $addToSet: { buyProducts: product._id } // prevents duplicates
      });
    }

    await product.save();

    res.json({ message: "Product marked as sold", product });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.AdminApproval = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const status = req.body?.status?.trim().toLowerCase();

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["pending", "approved", "rejected", "sold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid product status" });
    }

    const product = await Product.findById(productId);


    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.status === status) {
      return res.status(200).json({
        message: "No changes detected. Product status remains the same.",
        product
      });
    }
    console.log('product aprovel  by admin')
    // sendNotificationToUser(,"Your Product Status",status)

    await sendNotificationToUser(product.seller, "Your Product Status", status);

    if (status === "approved") {

      sendNotificationToAllUsers(" 🏙️ Town Trade", "New Product Added Check It Out", {}, [product.seller, req.user._id])
    }
    product.status = status;
    await product.save();

    res.status(200).json({
      message: "Product status updated successfully",
      product
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.Add_to_Featured = async (req, res) => {
  try {
    console.log("is featured route hit");
    const { id: productId } = req.params;
    const userId = req.user?._id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure only the owner can feature their product
    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You do not own this product" });
    }

    if (product.isFeatured === true) {
      return res.status(400).json({ message: "Product is already featured" });
    }

    product.isFeatured = true;
    await product.save();

    return res.status(200).json({
      message: "Product featured successfully",
      product
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getPendingProducts = async (req, res) => {

  try {
    const products = await Product.find({ status: "pending" })
      .populate("category", "name")          // only category name
      .populate("seller", "fullName email mobile") // pick fields you want
      .exec();


    if (products.length === 0) {
      return res.status(404).json({
        message: "No Pending products found ",
        products: []
      });
    }

    res.status(200).json({
      message: "Pending products retrieved successfully",
      products
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

}
exports.getAllProducts = async (req, res) => {

  try {
    const products = await Product.find()
      .populate("category", "name")          // only category name
      .populate("seller", "fullName email mobile") // pick fields you want
      .exec();


    if (products.length === 0) {
      return res.status(404).json({
        message: "No Pending products found ",
        products: []
      });
    }

    res.status(200).json({
      message: "Pending products retrieved successfully",
      products
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

}

