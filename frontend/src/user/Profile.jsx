import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Modal from "../common/Modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormInputField from "../common/FormInput";
import api from "../Axios/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertConfirm } from "../common/AlertConfirm";

// Validation schema
const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  accountStatus: yup.string().oneOf(["active", "deactive", "blocked"]),
});

export default function Profile({ buttonDesign }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.user?._id || currentUser?.user?.id;

  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [open, setOpen] = useState(false); // control modal

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      mobile: "",
      accountStatus: "active",
      profileImage: "",
    },
  });

  // Fetch user data
  useEffect(() => {
    if (!userId) return;
    api
      .get(`/users/${userId}`)
      .then((res) => {
        const userData = res.data;
        form.reset(userData); // prefill form
        if (userData.profileImage) {
          setPreviewImage(`http://localhost:5000/${userData.profileImage}`);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  const onSubmit = async (data, closeModal) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("mobile", data.mobile);
      formData.append("accountStatus", data.accountStatus);
      if (data.profileImage instanceof File) {
        formData.append("profileImage", data.profileImage);
      }

      await api.put(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Profile updated successfully!");
      closeModal(); // ✅ close modal after save
      form.reset(); // optional: reset form after save
    } catch (err) {
      console.error(err);
      toast.error("❌ Error updating profile");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?"))
      return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("✅ Profile deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Error deleting profile");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Modal
      title="Profile"
      buttonName="Profile"
      buttonDesign={buttonDesign}
      open={open}
      onOpenChange={setOpen}
      ContentClassName={"sm:max-w-[90vw] md:max-w-3xl w-full p-6"}
    >
      {({ closeModal }) => (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => onSubmit(data, closeModal))}
            className="space-y-6"
          >
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={previewImage} alt="Profile" />
                <AvatarFallback>
                  {form.getValues("fullName")?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setPreviewImage(URL.createObjectURL(file));
                    form.setValue("profileImage", file);
                  }
                }}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 file:text-sm 
                  file:font-semibold file:bg-blue-50 file:text-blue-600 
                  hover:file:bg-blue-100"
              />
            </div>

            {/* User Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputField
                control={form.control}
                name="fullName"
                label="Full Name"
                placeholder="Enter full name"
              />
              <FormInputField
                control={form.control}
                name="username"
                label="Username"
                placeholder="Enter username"
              />
              <FormInputField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
              <FormInputField
                control={form.control}
                name="mobile"
                label="Mobile"
                placeholder="Enter your mobile number"
              />

              {/* Read-only Account Status */}
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Account Status
                  </label>

                  {form.getValues("accountStatus") === "blocked" ? (
                    <>
                      <p className="mt-1 text-gray-900 font-semibold bg-gray-100 px-3 py-2 rounded-md">
                        Blocked
                      </p>
                      <p className="mt-1 text-sm text-red-600">
                        Your account is blocked. Please report an issue if this
                        is a mistake.
                      </p>
                    </>
                  ) : (
                    <select
                      {...form.register("accountStatus")}
                      className="mt-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                    >
                      <option value="active">Active</option>
                      <option value="deactive">Deactive</option>
                    </select>
                  )}
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end mt-6">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Save
              </Button>
              {/* <Button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button> */}

              <AlertConfirm
                triggerText="Delete Account"
                title="Do Really  Want To  Delete Account ?"
                description="This action cannot be undone.. this will  perment  deletes  your  account"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                triggerVariant="destructive"
              />
            </div>
          </form>
        </Form>
      )}
    </Modal>
  );
}
