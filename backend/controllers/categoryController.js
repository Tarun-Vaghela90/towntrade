const Category = require("../models/category");
const factory = require("./handlerFactory");



exports.createCategory = factory.createOne(Category)
exports.getCategorys = factory.getAll(Category);
exports.getCategory = factory.getOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);

// const buildCategoryTree = (categories, parent = null) => {
//   return categories
//     .filter(cat => String(cat.parentCategory) === String(parent))
//     .map(cat => ({
//       _id: cat._id,
//       name: cat.name,
//       slug: cat.slug,
//       icon: cat.icon,
//       children: buildCategoryTree(categories, cat._id) // recursion
//     }));
// };

// exports.getCategorys = async (req, res) => {
//   try {
//     const categories = await Category.find().lean();
//     const tree = buildCategoryTree(categories, null); // start from root (parentCategory=null)
//     res.json(tree);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
