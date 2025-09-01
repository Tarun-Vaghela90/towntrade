// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const { fetch_user } = require("../middlewares/AuthMiddleware");

// Create a review
router.post("/", fetch_user, async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "fullName");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update review
router.put("/:id", fetch_user, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review
router.delete("/:id", fetch_user, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await review.remove();
    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
