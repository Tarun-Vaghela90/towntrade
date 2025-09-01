import { useEffect, useState } from "react";
import Modal from "../../../common/Modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "../../../Axios/api";

// ✅ Schema generator
const getSchema = (mode) =>
  yup.object().shape({
    fullName: yup.string().required("Full name is required"),
    username: yup.string().required("Username is required"),
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    mobile: yup
      .string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number")
      .required("Mobile number is required"),
    password:
      mode === "add"
        ? yup
            .string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required")
        : yup.string().notRequired(),
    confirmPassword: yup.string().when("password", {
      is: (val) => val && val.length > 0,
      then: (schema) =>
        schema
          .oneOf([yup.ref("password"), null], "Passwords must match")
          .required("Confirm password is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    role: yup.string().oneOf(["user", "premium", "admin"]).required(),
    accountStatus: yup
      .string()
      .oneOf(["active", "deactive", "blocked"])
      .required(),
    profileImage: yup.mixed().notRequired(),
  });

// 🔹 Form Fields Component
function UserFormFields({ form, mode, setProfileFile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input placeholder="Enter Username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
{ mode ==="edit" &&
      <FormField
        control={form.control}
        name="mobile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mobile Number</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="9876543210" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      }
     { mode ==="edit" &&  <FormField
        control={form.control}
        name="profileImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Image</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  field.onChange(e.target.files?.[0] || null);
                  setProfileFile(e.target.files?.[0] || null);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />}

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accountStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactive">Deactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Password {mode === "edit" && "(leave blank to keep current)"}
            </FormLabel>
            <FormControl>
              <Input type="password" placeholder="********" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="********" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default function UserModal({
  title,
  buttonName,
  mode,
  onSuccess,
  user,
}) {
  const [profileFile, setProfileFile] = useState(null);

  const form = useForm({
    resolver: yupResolver(getSchema(mode)),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      role: "user",
      accountStatus: "active",
      profileImage: null,
    },
  });

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && user) {
      // Map API response to form fields
      form.reset({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        mobile: user.mobile || "", // <-- map API 'mobile' to ''
        role: user.role || "user",
        accountStatus: user.accountStatus || "active",
        profileImage: user.profileImage || null,
        password: "",
        confirmPassword: "",
      });
    }
  }, [mode, user, form]);

//   const onSubmit = async (values) => {
//     try {
//       const formData = new FormData();
//       Object.keys(values).forEach((key) => {
//   if (key === "profileImage" && profileFile) {
//     formData.append("profileImage", profileFile);
//   } else {
//     formData.append(key, values[key] ?? ""); // ✅ always append, fallback to ""
//   }
// });

// // Debug properly
// for (let [key, value] of formData.entries()) {
//   console.log(key, value);
// }


//       if (mode === "add") {
//         formData.forEach((value, key) => {
//           console.log(key, value);
//         });

//         await api.post("/auth/signup", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       } else if (mode === "edit") {
//         await api.put(`/users/${user._id}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }

//       form.reset();
//       setProfileFile(null);
//       if (onSuccess) onSuccess();
//       document.getElementById("close-user-modal")?.click();
//     } catch (error) {
//       console.error(error);
//     }
//   };

const onSubmit = async (values) => {
  try {
    const formData = new FormData();

    if (mode === "add") {
      // ✅ Only send required fields on add
      formData.append("fullName", values.fullName);
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("role", values.role);

      // If you want profile image optional on add:
     

      await api.post("/auth/signup", formData);
    } else if (mode === "edit") {
      // 🔹 On edit, allow updating all fields
      Object.keys(values).forEach((key) => {
        if (key === "profileImage" && profileFile) {
          formData.append("profileImage", profileFile);
        } else {
          formData.append(key, values[key] ?? "");
        }
      });

      await api.put(`/users/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    form.reset();
    setProfileFile(null);
    if (onSuccess) onSuccess();
    document.getElementById("close-user-modal")?.click();
  } catch (error) {
    console.error(error);
  }
};

  return (
    <Modal
      title={title}
      buttonName={buttonName}
      buttonDesign="bg-green-600 text-white hover:bg-green-700"
      ContentClassName={"sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl w-full p-6"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <UserFormFields
            form={form}
            mode={mode}
            setProfileFile={setProfileFile}
          />
          <div className="flex justify-end gap-3 mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <button id="close-user-modal" type="button" className="hidden" />
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
    </Modal>
  );
}
