import { useState, useEffect } from "react";
import api from "../Axios/api";
import CategorySelect from "../products/CategorySelect";
import { useCategory } from "../components/hooks/CategoryContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
export default function CategoryTopbar() {
  const { category, setCategory } = useCategory();
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categorys");
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
const parentCount = categories.length
  const gridCols = parentCount <= 3 ? parentCount : 3 // max 3 cols
  const dropdownWidth = Math.min(parentCount * 220, 900) 


  return (
    <div className="sticky top-0 z-20 px-40 bg-white px-4 py-2 shadow-md flex flex-wrap items-center gap-4 border-b border-gray-200">
      <div className="w-52">
        <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div
                className={`grid gap-6 p-4`}
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                  width: dropdownWidth,
                }}
              >
                {categories.map((parent) => (
                  <div key={parent._id} className="space-y-2">
                    <h4 className="font-medium text-gray-800">{parent.name}</h4>
                   <ul className="space-y-1">
  {parent.children?.map((child) => (
    <li key={child._id}>
      <NavigationMenuLink asChild>
        <button
          className={`px-2 py-1 rounded transition w-full text-left
            ${category === child._id
              ? "bg-gray-800 text-white font-medium text-[15px]"
              : "text-gray-700 hover:bg-gray-100 text-sm"}
          `}
          onClick={() => setCategory(child._id)}
        >
          {child.name}
        </button>
      </NavigationMenuLink>
    </li>
  ))}
</ul>

                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 5).map((parent) => {
          const firstChild = parent.children?.[0];
          if (!firstChild) return null;
          return (
            <button
              key={firstChild._id}
              onClick={() => setCategory(firstChild._id)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                category === firstChild._id
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {firstChild.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
