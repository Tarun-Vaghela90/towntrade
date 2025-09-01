import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import api from "../Axios/api";

// ✅ Reusable schema
const schema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

export default function EmailActionCard({
  title,
  apiEndpoint,
  successMessage,
}) {
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await api.post(apiEndpoint, { email: values.email });
      setSentEmail(values.email);
      setSuccess(true);
    } catch (error) {
      console.log("Error:", error);
      form.setError("email", {
        type: "manual",
        message: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center space-y-3">
              <p className="text-green-600 font-medium">✅ {successMessage}</p>
              <p className="text-gray-600 text-sm">
                Please check your inbox at{" "}
                <span className="font-semibold">{sentEmail}</span>.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setSuccess(false);
                  form.reset();
                }}
              >
                Send Again
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <Button type="submit" className="w-full">
                  Send Link
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
