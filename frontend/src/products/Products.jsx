import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bookmark,
  BookmarkIcon,
  IndianRupee,
  LucideBookmark,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "../Axios/api";
import {
  setProducts,
  appendProducts,
  setLoading,
  setSelectedProduct,
} from "../redux/slices/productSlice";
import { setCurrentUser } from "../redux/slices/userSlice";
import { useCategory } from "../components/hooks/CategoryContext";
import { getUserLocation } from "../utils/getUserLocation";
export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { category, setCategory } = useCategory();
  const { term: searchTerm } = useSelector((state) => state.search);
  const { items: products, loading } = useSelector((state) => state.product);
  const { currentUser } = useSelector((state) => state.user);

  const [locationName, setLocationName] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);
const [suggestions, setSuggestions] = useState([]);

  // -------------------
  // Fetch Products
  // -------------------
  const fetchProducts = async (pageNumber = 1, replace = false) => {
    dispatch(setLoading(true));
    try {
      const params = {
        page: pageNumber,
        limit: 12,
        category: category || undefined,
        locationName: locationName || undefined,
        sort:
          sort === "default"
            ? undefined
            : sort === "price-asc"
            ? "price"
            : "-price",
        search: searchTerm || undefined,
      };

      const res = await api.get("/products", { params });
      const data = res.data.data;

      const productsWithFlags = data.map((p) => ({
        ...p,
        isFavorite: currentUser?.user?.favorites?.includes(p._id),
        isWatchlist: currentUser?.user?.watchlist?.includes(p._id),
      }));

      if (replace) {
        dispatch(setProducts(productsWithFlags));
      } else {
        const merged = [...products, ...productsWithFlags].filter(
          (p, index, self) => index === self.findIndex((x) => x._id === p._id)
        );
        dispatch(setProducts(merged));
      }

      setHasMore(res.data.hasNextPage);
      setPage(res.data.currentPage + 1);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [location,category]);

const handleApplyFilters = () => {
  setPage(1);
  setHasMore(true);
  fetchProducts(1, true);
};
const handleLocationChange = async (e) => {
  const value = e.target.value;
  setLocationName(value);

  if (value.length > 2) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${value}&format=json&addressdetails=1&limit=5&countrycodes=IN`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching location suggestions:", err);
    }
  } else {
    setSuggestions([]);
  }
};

const handleSelectSuggestion = (place) => {
  const loc =
  place.address.state_district ||
    place.address.city ||
    place.address.town ||
    place.address.village ||
    place.address.county ||
    place.display_name;

  setLocationName(loc);
  setSuggestions([]);
};


useEffect(() => {
  const fetchLocation = async () => {
    try {
      const loc = await getUserLocation();
      console.log(loc)
      setLocationName(loc);
    } catch (err) {
      console.error("Location error:", err);
    }
  };

  fetchLocation();
}, []);



  useEffect(() => {
    if (!products.length) return;

    const updatedProducts = products.map((p) => ({
      ...p,
      isFavorite: currentUser?.user?.favorites?.includes(p._id),
      isWatchlist: currentUser?.user?.watchlist?.includes(p._id),
    }));

    dispatch(setProducts(updatedProducts));
  }, [currentUser?.user]);

  // -------------------
  // Reset Filters
  // -------------------
  const handleResetFilters = () => {
    setCategory("");
    setLocationName("");
    setSort("default");
  };

  // -------------------
  // Toggle Favorite
  // -------------------
  const handleToggleFavorite = async (e, productId, isFavorite) => {
    e.stopPropagation();
    if (loadingFav) return;
    setLoadingFav(true);
    try {
      if (isFavorite) await api.delete(`/auth/favorite/${productId}`);
      else await api.post(`/auth/favorite/${productId}`);

      // Update products slice
      dispatch(
        setProducts(
          products.map((p) =>
            p._id === productId ? { ...p, isFavorite: !isFavorite } : p
          )
        )
      );

      // Update currentUser slice
      const updatedFavorites = isFavorite
        ? currentUser.user.favorites.filter((id) => id !== productId)
        : [...currentUser.user.favorites, productId];

      dispatch(
        setCurrentUser({
          ...currentUser,
          user: {
            ...currentUser.user,
            favorites: updatedFavorites,
          },
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFav(false);
    }
  };

  // -------------------
  // Toggle Watchlist
  // -------------------
  const handleToggleWatchlist = async (e, productId, isWatchlist) => {
    e.stopPropagation();
    if (loadingWatch) return;
    setLoadingWatch(true);
    try {
      if (isWatchlist) await api.delete(`/auth/watchlist/${productId}`);
      else await api.post(`/auth/watchlist/${productId}`);

      // Update products slice
      dispatch(
        setProducts(
          products.map((p) =>
            p._id === productId ? { ...p, isWatchlist: !isWatchlist } : p
          )
        )
      );

      // Update currentUser slice
      const updatedWatchlist = isWatchlist
        ? currentUser.user.watchlist.filter((id) => id !== productId)
        : [...currentUser.user.watchlist, productId];

      dispatch(
        setCurrentUser({
          ...currentUser,
          user: {
            ...currentUser.user,
            watchlist: updatedWatchlist,
          },
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWatch(false);
    }
  };

  // -------------------
  // Helper: Get Image URL
  // -------------------
  const getImageUrl = (img) =>
    img?.startsWith("http") ? img : `http://localhost:5000/${img}`;

  // -------------------
  // Render
  // -------------------
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          <Card className="sticky top-6 shadow-md border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              {/* <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <CategorySelect
                categories={categories}
                value={category}
                onChange={setCategory}
              />
            </div> */}

              {/* Location */}
              {/* <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter location"
                />
              </div> */}
    <div className="space-y-2 relative">
  <Label className="text-sm font-medium">Location</Label>
  <Input
    value={locationName}
    onChange={handleLocationChange}
    placeholder="Enter city"
    className="w-full"
  />

  {/* Suggestions dropdown */}
  {suggestions.length > 0 && (
    <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full shadow-md max-h-48 overflow-y-auto">
      {suggestions.map((s) => (
        <li
          key={s.place_id}
          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
          onClick={() => handleSelectSuggestion(s)}
        >
          {s.address.city || s.address.town || s.address.village || s.address.state_district}, {s.address.state}
        </li>
      ))}
    </ul>
  )}
</div>



              {/* Sort */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort By</Label>
                <select
                  className="w-full border rounded p-2"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                  Reset Filters
                </button>
                <button
  onClick={handleApplyFilters}
  className="w-full bg-blue-500 text-white py-2 px-4 rounded"
>
  Apply Filters
</button>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <div className="md:col-span-3">
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border rounded-2xl p-4">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-5 w-1/3" />
                </Card>
              ))}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={products.length}
              next={() => fetchProducts(page)}
              hasMore={hasMore}
              loader={
                <p className="text-center my-4 text-gray-500">
                  Loading more...
                </p>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card
                    key={product._id}
                    className="relative cursor-pointer hover:shadow-xl transition-shadow border border-gray-200 rounded-2xl overflow-hidden"
                    onClick={() => {
                      dispatch(setSelectedProduct(product));
                      navigate(`/product/${product._id}`);
                    }}
                  >
                    {/* Featured badge */}
                    {product.isFeatured && (
                      <span className="absolute top-3 left-3 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        Featured
                      </span>
                    )}

                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Product Image */}
                      <div className="flex-1 flex items-center justify-center mb-4">
                        <img
                          src={
                            getImageUrl(product.images?.[0]) ||
                            "placeholder.png"
                          }
                          alt={product.title}
                          className="h-40 object-contain transition-transform duration-300 transform hover:scale-105"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-800">
                            {product.title}
                          </h2>
                          <p className="text-xs text-gray-500 mb-1">
                            {product.category?.name || "Uncategorized"}
                          </p>
                          <p className="text-green-600 font-bold flex items-center mb-3">
                            <IndianRupee className="mr-1" /> {product.price}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-2">
                          {/* Favorite button */}
                          <button
                            disabled={loadingFav}
                            className={`flex-1 px-3 py-1 rounded-full border transition-colors flex items-center justify-center gap-1 font-semibold text-sm ${
                              product.isFavorite
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-red-50"
                            }`}
                            onClick={(e) =>
                              handleToggleFavorite(
                                e,
                                product._id,
                                product.isFavorite
                              )
                            }
                          >
                            {product.isFavorite ? "♥" : "♡"} Favorite
                          </button>

                          {/* Watchlist button */}
                          <button
                            disabled={loadingWatch}
                            className={`flex-1 px-3 py-1 rounded-full border transition-colors flex items-center justify-center gap-1 font-semibold text-sm ${
                              product.isWatchlist
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                            }`}
                            onClick={(e) =>
                              handleToggleWatchlist(
                                e,
                                product._id,
                                product.isWatchlist
                              )
                            }
                          >
                            <Bookmark
                              className={`w-4 h-4 ${
                                product.isWatchlist ? "fill-current" : ""
                              }`}
                              strokeWidth={2}
                            />
                            Watchlist
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </>
  );
}

