import React, { useEffect, useState } from "react";
import Select from "react-select";
import Modal from "../common/Modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormInputField from "../common/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
  import {useSelector}  from 'react-redux'
import api from "../Axios/api";
import CategorySelect from "./CategorySelect";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
  
// ✅ Validation schema (same as create)
const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  brand: yup.string().required("Brand is required"),
  category: yup.string().required("Category is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be positive"),
  locationName: yup.string().required("Location is required"),
});

export default function ProductEditModal({ productId, title, buttonName, onUpdate }) {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      isFeatured: "no",
      brand: "",
      category: "",
      images: [], // only for new uploads
      price: "",
      locationName: "",
    },
  });

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [existingImages, setExistingImages] = useState([]); // old images from DB
  const [removedImages, setRemovedImages] = useState([]); // track deleted old images
  const {currentUser}  = useSelector((state)=> state.user)
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categorys");
      setCategories(res.data.categories);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch product details
  // const fetchProduct = async () => {
  //   try {
  //     const res = await api.get(`/products/${productId}`);
  //     const p = res.data;
  //     form.reset({
  //       title: p.title,
  //       description: p.description,
  //       isFeatured: p.isFeatured ? "yes" : "no",
  //       brand: p.brand,
  //       category: p.category?._id || "",
  //       images: [],
  //       price: p.price,
  //       locationName: p.locationName,
  //     });
  //     setExistingImages(p.images || []);
  //   } catch (err) {
  //     console.error("Failed to fetch product:", err);
  //     toast.error("❌ Failed to load product.");
  //   }
  // };

  const fetchProduct = async () => {
  try {
    const res = await api.get(`/products/${productId}`);
    const p = res.data;
    form.reset({
      title: p.title,
      description: p.description,
      isFeatured: p.isFeatured ? "yes" : "no",
      brand: p.brand,
      category: p.category?._id || "",
      images: [], // new uploads
      price: p.price,
      locationName: p.locationName,
    });
    setExistingImages(p.images || []); // ✅ update existingImages state
  } catch (err) {
    console.error("Failed to fetch product:", err);
    toast.error("❌ Failed to load product.");
  }
};


  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const onSubmit = async (data, closeModal) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("brand", data.brand);
      formData.append("price", data.price);
      formData.append("category", data.category);
      formData.append("isFeatured", data.isFeatured);
      formData.append("locationName", data.locationName);

      // ✅ Send existing images as JSON string
      if (Array.isArray(existingImages)) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      // ✅ Send removed images as JSON string
      if (Array.isArray(removedImages)) {
        formData.append("removedImages", JSON.stringify(removedImages));
      }

      // ✅ Include new uploaded images
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      await api.put(`/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // toast.success("✅ Product updated successfully!");
      form.reset();
      setExistingImages([]);
      setRemovedImages([]);
      closeModal();
      if (onUpdate) {
        onUpdate(); // 👈 re-fetch product in parent
      }
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("❌ Failed to update product. Try again.");
    }
  };

  return (
    <Modal
      title={title}
      buttonName={buttonName}
      buttonDesign={"bg-blue-600 text-white hover:bg-blue-700"}
      // ContentClassName={"sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl w-full p-6"}
      ContentClassName={
        "sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto"
      }
      open={open}
      // onOpenChange={(isOpen) => {
      //   setOpen(isOpen);
      //   if (!isOpen) {
      //     form.reset();
      //     setExistingImages([]);
      //     setRemovedImages([]);
      //   }
      // }}

      onOpenChange={async (isOpen) => {
  setOpen(isOpen);
  if (isOpen && productId) {
    await fetchProduct(); // fetch product details when modal opens
  } else if (!isOpen) {
    form.reset();
    setRemovedImages([]);
    // don't clear existingImages here
  }
}}

    >
      {({ closeModal }) => (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => onSubmit(data, closeModal))}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side - Images */}
              <div>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              field.onChange(files);
                            }}
                            className="w-full border p-2 rounded-md"
                          />

                          {/* Existing images */}
                          {/* Existing images */}
                          {existingImages.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">Current Images</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                {existingImages.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={`http://localhost:5000/${img}`} // ✅ Updated URL
                                      alt={`existing-${idx}`}
                                      className="w-full h-32 object-cover border rounded-md shadow-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRemovedImages((prev) => [
                                          ...prev,
                                          img,
                                        ]);
                                        setExistingImages((prev) =>
                                          prev.filter((i) => i !== img)
                                        );
                                      }}
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition shadow-md"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New upload preview */}
                          {field.value?.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">New Uploads</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                {field.value.map((file, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`preview-${idx}`}
                                      className="w-full h-32 object-cover border rounded-md shadow-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newFiles = field.value.filter(
                                          (_, i) => i !== idx
                                        );
                                        field.onChange(newFiles);
                                      }}
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition shadow-md"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Side - Inputs (same as create) */}
              <div className="flex flex-col gap-4">
                <FormInputField
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="Enter Product Title"
                />
                <FormInputField
                  control={form.control}
                  name="price"
                  type="number"
                  label="Price"
                  placeholder="Enter Product Price"
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Select
                          value={
                            field.value
                              ? { value: field.value, label: field.value }
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          options={[
                            { value: "nokia", label: "Nokia" },
                            { value: "samsung", label: "Samsung" },
                            { value: "vivo", label: "Vivo" },
                            { value: "realme", label: "Realme" },
                            { value: "lg", label: "LG" },
                            { value: "other", label: "Other" },
                          ]}
                          placeholder="Select Brand"
                          isSearchable
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <CategorySelect
                          categories={categories}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Product Description"
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormInputField
                  control={form.control}
                  name="locationName"
                  label="Location"
                  placeholder="Enter location"
                />
             {  currentUser.user.role === "premium" && <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is Featured</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id="isFeaturedNo" />
                            <Label htmlFor="isFeaturedNo">No</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id="isFeaturedYes" />
                            <Label htmlFor="isFeaturedYes">Yes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Update
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Modal>
  );
}
