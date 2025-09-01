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
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // const onSubmit = async (values) => {
  //   try {
  //     const res = await api.post("/auth/login", {
  //       email: values.email,
  //       password: values.password,
  //     });

  //     const { token, user } = res.data;

  //     // store in Redux
  //     dispatch(setCurrentUser({ token, user }));

  //     // optionally store token separately
  //     localStorage.setItem("Token", token);

  //     // ✅ Request FCM token and send it to backend
  //     const fcmToken = await requestForToken();
  //     if (fcmToken) {
  //       try {
  //         await api.post(
  //           "/users/save-fcm-token",
  //           {
  //             userId: user._id,
  //             fcmToken,
  //           },
  //           {
  //             headers: { Authorization: `Bearer ${token}` }, // if your API requires auth
  //           }
  //         );
  //         console.log("✅ FCM Token saved in DB");
  //       } catch (err) {
  //         console.error("Error saving FCM token:", err);
  //       }
  //     }
  //     if (
  //       user.accountStatus === "blocked" ||
  //       user.accountStatus === "deactive"
  //     ) {
  //       navigate(`/account-status/${user.accountStatus}`);
  //       return;
  //     }
  //     // redirect after saving token
  //     navigate("/products");
  //   } catch (error) {
  //     console.log("Login Error:", error);
  //     toast.info(error.response.data.message);
  //   }

  //   console.log("Login Data:", values);
  // };
const onSubmit = async (values) => {
  try {
    const res = await api.post("/auth/login", {
      email: values.email,
      password: values.password,
    });

    const { token, user } = res.data;

    // store in Redux
    dispatch(setCurrentUser({ token, user }));

    // optionally store token separately
    localStorage.setItem("Token", token);

    // ✅ Request FCM token and send it to backend
    const fcmToken = await requestForToken();
    if (fcmToken) {
      try {
        await api.post(
          "/users/save-fcm-token",
          { fcmToken }, // ❌ removed userId, backend already knows from JWT
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ FCM Token saved in DB");
      } catch (err) {
        console.error("Error saving FCM token:", err);
      }
    }

    // ✅ handle blocked/deactive
    if (user.accountStatus === "blocked" || user.accountStatus === "deactive") {
      navigate(`/account-status/${user.accountStatus}`);
      return;
    }

    // redirect after saving token
    navigate("/products");
  } catch (error) {
    console.log("Login Error:", error);
    toast.info(error.response?.data?.message || "Login failed");
  }

  console.log("Login Data:", values);
};

  return (
    // <div className="flex flex-col items-center justify-center flex-1 min-h-screen bg-gray-50">
    <div className="flex flex-col items-center justify-center flex-1 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
        <p className="text-blue-600 px-5">
          <Link to="/forgotpassword">Forgot Password ?</Link>{" "}
        </p>
      </Card>
      {/* ✅ Link below card */}
      <p className="mt-4 text-sm text-gray-600 text-center">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Signup
        </Link>
      </p>
    </div>
  );
}
