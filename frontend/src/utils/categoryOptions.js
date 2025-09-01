// utils/categoryOptions.js
export const buildCategoryOptions = (categories) => {
  return categories.map(cat => {
    if (cat.children && cat.children.length > 0) {
      return {
        label: cat.name,
        options: buildCategoryOptions(cat.children) // recursive groups
      };
    }
    return {
      value: cat._id,
      label: cat.name
    };
  });
};





// // utils/categoryOptions.js
// export const buildCategoryOptions = (categories) => {
//   return categories.map(cat => ({
//     value: cat._id,
//     label: cat.name,
//     options: cat.children && cat.children.length > 0
//       ? buildCategoryOptions(cat.children) // recursion
//       : undefined
//   }));
// };
