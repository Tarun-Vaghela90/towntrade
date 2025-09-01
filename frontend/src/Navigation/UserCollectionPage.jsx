import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser } from "../redux/slices/userSlice";
import api from "../Axios/api";

function AdCard({ ad, onRemove, removeLabel }) {
  return (
    <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition relative bg-white flex flex-col">
      <img
        src={ad.images?.[0] ? `http://localhost:5000/${ad.images[0]}` : "/placeholder.png"}
        alt={ad.title || "Product Image"}
        className="w-full h-48 object-contain mb-2"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{ad.title || "No Title"}</h3>
        <p className="text-gray-700 font-medium">${ad.price || "0"}</p>
      </div>
      <div className="mt-auto flex justify-end">
        {onRemove && (
          <button
            onClick={() => onRemove(ad._id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
          >
            {removeLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function UserCollectionsPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser); // keep the full object
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch collections
  const fetchCollections = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [watchlistRes, favoritesRes] = await Promise.all([
        api.get("/auth/watchlist"),
        api.get("/auth/favorites"),
      ]);
      setWatchlist(watchlistRes.data || []);
      setFavorites(favoritesRes.data || []);
    } catch (err) {
      console.error(err);
      setWatchlist([]);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [currentUser]);

  // Remove from Watchlist
  const removeFromWatchlist = async (id) => {
    try {
      await api.delete(`/auth/watchlist/${id}`);
      console.log(`Removed from watchlist: ${id}`);

      const updatedWatchlist = watchlist.filter((item) => item._id !== id);
      setWatchlist(updatedWatchlist);

      const updatedReduxUser = {
        ...currentUser.user,
        watchlist: currentUser.user.watchlist.filter((item) => String(item) !== String(id)),
      };

      dispatch(
        setCurrentUser({
          ...currentUser,
          user: updatedReduxUser,
        })
      );

      console.log("Updated currentUser object:", {
        ...currentUser,
        user: updatedReduxUser,
      });
    } catch (err) {
      console.error("Error removing from watchlist:", err);
    }
  };

  // Remove from Favorites
  const removeFromFavorites = async (id) => {
    try {
      await api.delete(`/auth/favorite/${id}`);
      console.log(`Removed from favorites: ${id}`);

      const updatedFavorites = favorites.filter((item) => item._id !== id);
      setFavorites(updatedFavorites);

      const updatedReduxUser = {
        ...currentUser.user,
        favorites: currentUser.user.favorites.filter((item) => String(item) !== String(id)),
      };

      dispatch(
        setCurrentUser({
          ...currentUser,
          user: updatedReduxUser,
        })
      );

      console.log("Updated currentUser object:", {
        ...currentUser,
        user: updatedReduxUser,
      });
    } catch (err) {
      console.error("Error removing from favorites:", err);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Watchlist */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">My Watchlist</h2>
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {watchlist.map((ad) => (
              <AdCard
                key={ad._id}
                ad={ad}
                onRemove={removeFromWatchlist}
                removeLabel="Remove"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Your watchlist is empty.</p>
        )}
      </section>

      {/* Favorites */}
      <section>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">My Favorites</h2>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((ad) => (
              <AdCard
                key={ad._id}
                ad={ad}
                onRemove={removeFromFavorites}
                removeLabel="Remove"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You have no favorite items.</p>
        )}
      </section>
    </div>
  );
}
