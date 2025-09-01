import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../Axios/api";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required("Category name is required"),
  slug: yup.string().required("Slug is required"),
  parentCategory: yup.string().nullable(),
});

export default function CategoryModal({
  open,
  setOpen,
  title,
  category = null,
  categories = [],
  onSuccess,
  readOnly = false,
}) {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      parentCategory: category?.parentCategory || "",
    },
  });

  // Reset form when category changes
  useEffect(() => {
    form.reset({
      name: category?.name || "",
      slug: category?.slug || "",
      parentCategory: category?.parentCategory || "",
    });
  }, [category]);

  const onSubmit = async (data) => {
    console.log("Submitting category:", data);
      if (!data.parentCategory) {
    data.parentCategory = null;
  }
    try {
      if (category?._id) {
        await api.put(`/categorys/${category._id}`, data);
        console.log("Updated category:", data);
        // toast.success("Category updated successfully!");
      } else {
        await api.post("/categorys", data);
        console.log("Added category:", data);
        // toast.success("Category added successfully!");
      }
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save category:", err);
      toast.error("Failed to save category. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-2xl w-full p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border p-2 rounded"
              {...form.register("name")}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input
              className="w-full border p-2 rounded"
              {...form.register("slug")}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Parent Category</label>
            <select
              className="w-full border p-2 rounded"
              {...form.register("parentCategory")}
              disabled={readOnly}
            >
              <option value="">None</option>
              {categories
                .filter((cat) => !category || cat._id !== category._id)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <DialogFooter className="mt-4 flex justify-end space-x-2">
            {!readOnly && <Button type="submit">{category ? "Save" : "Add"}</Button>}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {readOnly ? "Close" : "Cancel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
