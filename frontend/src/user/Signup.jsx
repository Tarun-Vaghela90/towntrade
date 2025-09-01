import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { requestForToken } from "../firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import api from "../Axios/api";
import { setCurrentUser } from "../redux/slices/userSlice";
import { toast } from "react-toastify";
// ✅ Yup validation schema
const schema = yup.object().shape({
  fullName: yup.string().required("Full name is required"),
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const res = await api.post("/auth/signup", {
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      const { token, user } = res.data;

      // store in Redux
      // dispatch(setCurrentUser({ token, user }));
     
      // optionally store token separately
      localStorage.setItem("Token", token);
      // toast.info("User Signup Successfull")
      const fcmToken = await requestForToken();
      if (fcmToken) {
        try {
          await api.post(
            "/users/save-fcm-token",
            {
              userId: user._id,
              fcmToken,
            },
            {
              headers: { Authorization: `Bearer ${token}` }, // if your API requires auth
            }
          );
          console.log("✅ FCM Token saved in DB");
        } catch (err) {
          console.error("Error saving FCM token:", err);
        }
      }
      // toast.success("Registered Successfully")
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.info(error.response.data.message);
    }

    console.log("Signup Data:", values);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Signup
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
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
                      <Input placeholder="Enter  Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Signup
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ✅ Link below card */}
      <p className="mt-4 text-sm text-gray-600 text-center">
        Already have an account?{" "}
        <Link to="/" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
