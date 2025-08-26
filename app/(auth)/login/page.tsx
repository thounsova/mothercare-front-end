"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import Logo from "@/app/img/mother.jpg";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// ✅ Validation schema
const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof LoginSchema>;

// ✅ Password input with show/hide
function PasswordInput({ ...field }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        {...field}
        placeholder="••••••••"
        className="pl-10 pr-10 h-14"
      />
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted/60"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Handle form submission
  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 🔑 Login request
      const res = await fetch("https://energized-fireworks-cc618580b1.strapiapp.com/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error?.message || data.message || "Login failed");
        return;
      }

      const jwt = data.jwt;

      // 👤 Fetch user info with role + branch
      const userRes = await fetch(
        "https://energized-fireworks-cc618580b1.strapiapp.com/api/users/me?populate=role&populate=branch",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      const userData = await userRes.json();

      if (!userRes.ok) {
        setErrorMessage("Failed to fetch user data.");
        setIsSubmitting(false);
        return;
      }

      // Save token & user
      localStorage.setItem("token", jwt);
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Extract role & branch
      const roleName = userData.role?.name || "";
      const branchName = userData.branch?.name || "";

      console.log("Role:", roleName, "Branch:", branchName);

      // 🔀 Redirect based on role
      if (roleName === "Admin") {
        router.push("/dashboard");
      } else if (roleName === "Educator") {
        router.push("/dashboard/resident");
      } else if (roleName === "Parent") {
        router.push("/dashboard/parent");
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center">
        <img src={Logo.src} alt="Login Illustration" className="w-full h-full object-cover" />
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">
            Welcome <span className="text-blue-700">Mother Care</span>
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Sign in to access your dashboard
          </p>

          {errorMessage && (
            <div className="text-red-600 mb-4 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          {...field}
                          className="pl-10 h-14"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
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
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full h-14" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
