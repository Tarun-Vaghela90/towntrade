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

import api from "../Axios/api";
import CategorySelect from "./CategorySelect";

// ✅ react-toastify
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

// Validation schema
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
  images: yup
    .array()
    .of(yup.mixed())
    .min(3, "At least 3 image is required")
    .required("Images are required"),
  locationName: yup.string().required("Location is required"),
});
export default function ProductModal({ title, buttonName }) {

  const {currentUser} = useSelector((state)=>state.user)
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      isFeatured: "no",
      brand: "",
      category: "",
      images: [],
      price: "",
      locationName: "",
    },
  });

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false); // ✅ control modal open/close

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categorys");
      setCategories(res.data.categories);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = (data, closeModal) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("brand", data.brand);
    formData.append("price", data.price);
    formData.append("category", data.category);
    formData.append("isFeatured", data.isFeatured);
    formData.append("locationName", data.locationName);

    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    api
      .post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer YOUR_TOKEN_HERE`,
        },
      })
      .then((res) => {
        // toast.success("✅ Product saved successfully!");
        // ✅ close modal
        form.reset();
        closeModal();
      })
      .catch((err) => {
        console.error("Error saving product:", err);
        toast.error("❌ Failed to save product. Try again.");
      });
  };

  return (
    <Modal
      title={title}
      buttonName={buttonName}
      buttonDesign={"bg-green-600 text-white hover:bg-green-700"}
      ContentClassName={
        "sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl w-full p-6 max-h-[80vh] overflow-y-auto"
      }
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset(); // Reset all fields when modal closes
        }
      }}
      footerButtons={<></>}
    >
      {({ closeModal }) => (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => onSubmit(data, closeModal))}
            className="space-y-6"
          >
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side - Images */}
              <div>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Product Images</FormLabel>
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
                          {field.value?.length > 0 && (
                            <>
                              <Carousel className="w-full max-w-md mx-auto">
                                <CarouselContent>
                                  {field.value.map((file, idx) => (
                                    <CarouselItem
                                      key={idx}
                                      className="flex justify-center"
                                    >
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={`preview-${idx}`}
                                        className="w-72 h-72 object-contain border rounded-lg shadow-sm"
                                      />
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {field.value.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="relative group flex-shrink-0"
                                  >
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`thumb-${idx}`}
                                      className="w-20 h-20 object-cover border rounded-md shadow-sm rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newFiles = field.value.filter(
                                          (_, i) => i !== idx
                                        );
                                        field.onChange(newFiles);
                                      }}
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-md"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Side - Inputs */}
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

                {currentUser?.user?.role === 'premium' &&
                     (<FormField
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
                  />)
                }
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
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Modal>
  );
}
