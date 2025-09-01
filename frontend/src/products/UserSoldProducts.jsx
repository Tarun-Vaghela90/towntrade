import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // import useNavigate
import api from "../Axios/api"; // your Axios instance
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

const UserSoldProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // create navigate instance

  // Fetch user sold products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/sellers/me");
      setProducts(res.data.products);
    } catch (error) {
      console.error(error);
      // toast.error("Failed to fetch your products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Sold Products</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-md" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p>No products sold yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{product.title}</CardTitle>
                <Badge variant={product.status === "approved" ? "secondary" : "destructive"}>
                  {product.status.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent>
                <img
                  src={
                    product.images && product.images.length > 0
                      ? "http://localhost:5000/" + product.images[0].replace("\\", "/")
                      : "/placeholder.png"
                  }
                  alt={product.title}
                  className="w-full h-40 object-cover rounded-md mb-4 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)} // navigate on image click
                />

                <CardDescription>{product.description}</CardDescription>
                <p className="font-semibold mt-2">Price: ₹{product.price}</p>
                <Button
                  className="mt-4 w-full"
                  size="sm"
                  onClick={() => navigate(`/product/${product._id}`)} // navigate on button click
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSoldProducts;
