import { useState } from "react";
import Navbar from "../../Navigation/Navbar";
import { Outlet ,useLocation} from "react-router-dom";

import CategoryTopbar from "../../products/Categorytopbar";
import {  useSearchParams } from "react-router-dom";

export default function PublicLayout() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const showCategoryTopbar =
    location.pathname.startsWith("/products") 
    // location.pathname.startsWith("/product/");

  const [category, setCategory] = useState(searchParams.get("category") || "");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showCategoryTopbar && <CategoryTopbar />}

      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
