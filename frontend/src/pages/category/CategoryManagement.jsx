import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import api from "../../Axios/api";
import { AlertConfirm } from "../../common/AlertConfirm";
import CategoryModal from "./CategoryModal";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, view
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/categorys");
      if (res.data.success) {
        setCategories(res.data.categories);
        console.log("Fetched categories:", res.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Flatten categories for table
  const flatCategories = useMemo(() => {
    const flattenCategories = (cats, parentName = "") =>
      cats.reduce((acc, cat) => {
        const fullName = parentName ? `${parentName} > ${cat.name}` : cat.name;
        acc.push({ ...cat, fullName });
        if (cat.children && cat.children.length > 0) {
          acc.push(...flattenCategories(cat.children, fullName));
        }
        return acc;
      }, []);
    return flattenCategories(categories);
  }, [categories]);

  // Table columns
  const columns = useMemo(
    () => [
      { header: "Category Name", accessorKey: "fullName" },
      { header: "Slug", accessorKey: "slug" },
      { header: "Parent", accessorFn: (row) => row.parentCategory || "None" },
      {
        header: "Actions",
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  setModalMode("view");
                  setModalOpen(true);
                  console.log("Viewing category:", category);
                }}
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  setModalMode("edit");
                  setModalOpen(true);
                  console.log("Editing category:", category);
                }}
              >
                <Edit size={18} />
              </button>
              <AlertConfirm
                triggerText={<Trash2 size={18} />}
                title="Delete Category?"
                description="This will permanently delete the category."
                confirmText="Delete"
                cancelText="Cancel"
                triggerVariant="destructive"
                onConfirm={() => handleDelete(category)}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  // Delete category
  const handleDelete = async (category) => {
    console.log("Deleting category:", category);
    try {
      await api.delete(`/categorys/${category._id}`);
      console.log("Category deleted:", category);
      fetchCategories();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Table instance
  const table = useReactTable({
    data: flatCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p className="text-center p-4">Loading categories...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setModalMode("add");
            setModalOpen(true);
          }}
          className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Plus size={18} />
          <span className="ml-2">Add Category</span>
        </button>
      </div>

      <table className="w-full border-collapse bg-white shadow-md rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-left p-3 font-semibold text-gray-700">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 text-gray-600">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <CategoryModal
          open={modalOpen}
          setOpen={setModalOpen}
          title={
            modalMode === "add"
              ? "Add Category"
              : modalMode === "edit"
              ? "Edit Category"
              : "View Category"
          }
          category={selectedCategory}
          categories={categories}
          onSuccess={() => {
            fetchCategories();
            setModalOpen(false);
          }}
          readOnly={modalMode === "view"}
        />
      )}
    </div>
  );
}
