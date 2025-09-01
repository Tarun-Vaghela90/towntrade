const express = require("express");
const categoryController = require("../controllers/categoryController");
const { createCategoryValidator } = require("../validators/categoryValidator");
const { fetch_user } = require("../middlewares/AuthMiddleware");
const  Category  = require('../models/category')

const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const categories = await Category.aggregate([
//       { $match: { parentCategory: null } }, // root categories only
//       {
//         $graphLookup: {
//           from: "categories",             // collection name
//           startWith: "$_id",              // start from root
//           connectFromField: "_id",        // parent id
//           connectToField: "parentCategory", // child ref
//           as: "subcategories",
//           depthField: "level"             // optional: depth of nesting
//         }
//       },
//       { $sort: { name: 1 } }
//     ]);

//     res.status(200).json({
//       success: true,
//       categories
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// });

// Get all categorys
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const map = {};
    categories.forEach(cat => (map[cat._id] = { ...cat, children: [] }));

    const tree = [];
    categories.forEach(cat => {
      if (cat.parentCategory) {
        map[cat.parentCategory].children.push(map[cat._id]);
      } else {
        tree.push(map[cat._id]);
      }
    });

    res.status(200).json({ success: true, categories: tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", categoryController.getCategory); // Get single category

router.use('/',fetch_user)  // Middleware

router.post("/",createCategoryValidator, categoryController.createCategory); 
router.put("/:id", categoryController.updateCategory); // Update category
router.delete("/:id", categoryController.deleteCategory); // Delete category

module.exports = router;
