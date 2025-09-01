import React, { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import api from "../../../Axios/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Carousel } from "react-responsive-carousel"; // ✅ Carousel package
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Carousel CSS

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all"); // ✅ filter state

  const formatImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000/${img.replace(/\\/g, "/")}`;
  };

  useEffect(() => {
    if (filterType === "pending") {
      fetchPendingProducts();
    } else {
      fetchProducts();
    }
  }, [filterType]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/admin/products");
      const list = res.data.products || [];
      setProducts(list);
      setFilteredProducts(list);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await api.get("/products/admin/pending");
      const list = res.data.products || [];
      setProducts(list);
      setFilteredProducts(list);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  // Search filter
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) =>
          p.title.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, products]);

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id));
    }
  };

  const bulkUpdateStatus = async (status) => {
    try {
      await api.put("/admin/products/bulk-update", { ids: selectedIds, status });
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const bulkDelete = async () => {
    try {
      await api.post("/admin/products/bulk-delete", { ids: selectedIds });
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/products/admin/approve/${id}`, { status });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={
              selectedIds.length === filteredProducts.length &&
              filteredProducts.length > 0
            }
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  selectedIds.length > 0 &&
                  selectedIds.length < filteredProducts.length;
              }
            }}
            onChange={handleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original._id)}
            onChange={() => handleToggle(row.original._id)}
          />
        ),
      },
      { header: "Title", accessorKey: "title" },
      { header: "Price", accessorKey: "price" },
      { header: "Category", accessorKey: "category.name" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onValueChange={(value) => handleStatusChange(row.original._id, value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedProduct(row.original);
              setViewModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        ),
      },
    ],
    [selectedIds, filteredProducts]
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Product Management</h2>

      {/* Top bar: Search + Filter + Bulk actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded px-3 py-1 w-64"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="pending">Pending Products</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={() => bulkUpdateStatus("approved")}>Approve</Button>
            <Button onClick={() => bulkUpdateStatus("rejected")}>Reject</Button>
            <Button variant="destructive" onClick={bulkDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-medium">🎉 No products to review!</p>
          <p className="mt-2">
            All products have been reviewed or there are no products.
          </p>
        </div>
      ) : (
        <table className="min-w-full border border-gray-200 rounded-lg shadow">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left border-b">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.original._id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl w-full p-6">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div>
              <h3 className="font-bold text-lg">{selectedProduct.title}</h3>
              <p className="text-sm text-gray-600">{selectedProduct.description}</p>
              <p className="mt-2">Price: ₹{selectedProduct.price}</p>
              <p>Category: {selectedProduct.category?.name}</p>

              {/* ✅ Carousel for product images */}
              {selectedProduct.images?.length > 0 && (
                <div className="mt-4">
                  <Carousel showThumbs={false} infiniteLoop autoPlay>
                    {selectedProduct.images.map((img, index) => (
                      <div key={index}>
                        <img
                          src={formatImageUrl(img)}
                          alt={`product-${index}`}
                          className="max-h-[400px] mx-auto object-contain"
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
