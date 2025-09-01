import React, { useState, useEffect } from "react";
import api from "../Axios/api";

export default function ProductCompare() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCompare = (product) => {
    if (compareList.find(p => p._id === product._id)) return;
    if (compareList.length >= 4) {
      alert("You can only compare up to 4 products");
      return;
    }
    setCompareList(prev => [...prev, product]);
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(p => p._id !== id));
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http")) return imgPath;
    return `http://localhost:5000/${imgPath.replace("\\", "/")}`;
  };

  // Highlight differences between products
  const highlightDifference = (key, product) => {
    const values = compareList.map(p => (p[key]?.toString() || ""));
    return new Set(values).size > 1 ? "bg-yellow-100" : "";
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Compare Products</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-lg p-3 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
      />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {filteredProducts.map(product => (
          <div
            key={product._id}
            className="border rounded-lg shadow hover:shadow-xl transition p-4 flex flex-col items-center bg-white"
          >
            <img
              src={getImageUrl(product.images[0])}
              alt={product.title}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h2 className="font-semibold text-lg text-center text-gray-800">{product.title}</h2>
            <p className="text-blue-600 font-bold mt-1 mb-3">${product.price}</p>
            <button
              onClick={() => addToCompare(product)}
              disabled={compareList.find(p => p._id === product._id)}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                compareList.find(p => p._id === product._id)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {compareList.find(p => p._id === product._id) ? "Added" : "Add to Compare"}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      {compareList.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Comparing Products</h2>
          <div className="overflow-x-auto border rounded-lg shadow">
            <table className="min-w-full border-collapse table-auto text-center">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border p-3 text-left">Feature</th>
                  {compareList.map(product => (
                    <th key={product._id} className="border p-3 relative">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => removeFromCompare(product._id)}
                          className="absolute top-1 right-1 text-red-500 font-bold hover:text-red-700"
                        >
                          ×
                        </button>
                        <div className="flex gap-1 mb-2 overflow-x-auto">
                          {product.images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={getImageUrl(img)}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{product.title}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border p-3 font-semibold text-left">Price</td>
                  {compareList.map(product => (
                    <td
                      key={product._id}
                      className={`border p-3 font-bold text-blue-600 ${highlightDifference('price', product)}`}
                    >
                      ${product.price}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border p-3 font-semibold text-left">Category</td>
                  {compareList.map(product => (
                    <td
                      key={product._id}
                      className={`border p-3 ${highlightDifference('category', product)}`}
                    >
                      {product.category?.name}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border p-3 font-semibold text-left">Description</td>
                  {compareList.map(product => (
                    <td key={product._id} className="border p-3">{product.description}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
