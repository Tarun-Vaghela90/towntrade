const express = require("express");
const productController = require("../controllers/productController");
const { createProductValidator } = require("../validators/productValidator");
const { fetch_user } = require("../middlewares/AuthMiddleware");
const { restrictTo } = require("../middlewares/RestrictTo");
const multer = require("multer");

const router = express.Router();

// ------------------- Multer Setup -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/products/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/* =====================================================
   PUBLIC ROUTES
   ===================================================== */
router.get("/", productController.getProducts);              // All products
router.get("/:id", productController.getProduct);            // Single product

/* =====================================================
   SELLER ROUTES (must be logged in)
   ===================================================== */
router.use(fetch_user); // protect all routes below

router.get("/sellers/me", productController.getSellersProducts); // Seller's own products

router.post(
  "/",
  createProductValidator,
  upload.array("images", 20),
  productController.createProduct
); // Create product

router.put(
  "/:id",
  upload.array("images", 20), // Parse uploaded images
  productController.updateProduct
);
             // Update product
router.delete("/:id", productController.deleteProduct);           // Delete product
router.patch("/:id/sold", productController.seller_mark);         // Mark as sold
router.put("/featured/:id", restrictTo("user", "premium"), productController.Add_to_Featured);

/* =====================================================
   ADMIN ROUTES
   ===================================================== */
router.get(
  "/admin/pending",
  restrictTo("admin"),
  productController.getPendingProducts
);
router.get(
  "/admin/products",
  restrictTo("admin"),
  productController.getAllProducts
);

router.put(
  "/admin/approve/:id",
  restrictTo("admin"),
  productController.AdminApproval
);

module.exports = router;
