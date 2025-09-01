const { body } = require("express-validator");

exports.createProductValidator = [
  // Title
  body("title")
    .notEmpty().withMessage("Product title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  // Description
  body("description")
    .notEmpty().withMessage("Product description is required")
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters"),

  // Price
  body("price")
    .notEmpty().withMessage("Product price is required")
    .isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),

  // Images
  body("images")
    .isArray({ min: 1 }).withMessage("At least one image is required")
    .custom((images) => {
      if (!images.every(img => typeof img === "string")) {
        throw new Error("All images must be strings (URLs or file paths)");
      }
      return true;
    }),

  // Category
  body("category")
    .notEmpty().withMessage("Category is required")
    .isMongoId().withMessage("Category must be a valid ID"),

  // Location - coordinates
  body("location.coordinates")
    .isArray({ min: 2, max: 2 }).withMessage("Location coordinates must be an array of [lng, lat]")
    .custom(([lng, lat]) => {
      if (typeof lng !== "number" || typeof lat !== "number") {
        throw new Error("Coordinates must be numbers");
      }
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error("Invalid latitude or longitude values");
      }
      return true;
    }),

  // Seller
  body("seller")
    .notEmpty().withMessage("Seller ID is required")
    .isMongoId().withMessage("Seller must be a valid user ID")
];
