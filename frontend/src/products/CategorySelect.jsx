// CategorySelect.jsx
import React from "react";
import Select from "react-select";
import { buildCategoryOptions } from "../utils/categoryOptions";

// recursive helper
const flattenOptions = (options) => {
  return options.reduce((acc, opt) => {
    if (opt.options) {
      return acc.concat(flattenOptions(opt.options));
    }
    return acc.concat(opt);
  }, []);
};

export default function CategorySelect({ categories, value, onChange }) {
  const options = buildCategoryOptions(categories);
  const flatOptions = flattenOptions(options);  // ✅ works for all levels

  return (
    <Select
      options={options}
      value={flatOptions.find(opt => opt.value === value) || null}  // ✅ preselect
      onChange={(selected) => onChange(selected ? selected.value : "")}
      placeholder="Select Category"
      isSearchable
      className="w-full"
    />
  );
}










// // CategorySelect.jsx
// import React from "react";
// import Select from "react-select";
// import { buildCategoryOptions } from "../utils/categoryOptions";

// export default function CategorySelect({ categories, value, onChange }) {
//   const options = buildCategoryOptions(categories);

//   return (
//     <Select
//       options={options}
//       value={options
//         .flatMap(opt => (opt.options ? opt.options : opt)) // flatten once
//         .find(opt => opt.value === value)}
//       onChange={(selected) => onChange(selected.value)}
//       placeholder="Select Category"
//       isSearchable
//       className="w-full"
//     />
//   );
// }
