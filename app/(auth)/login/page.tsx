"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
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

// Validation schema
const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof LoginSchema>;

// Password Input component
function PasswordInput({ ...field }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        {...field}
        placeholder="••••••••"
        className="pl-10 pr-10"
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

  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Step 1: Authenticate and get the JWT
      const res = await fetch("http://localhost:1337/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data.error?.message?.[0]?.messages?.[0]?.message ||
          data.message ||
          "Login failed";
        setErrorMessage(message);
        return;
      }

      const jwt = data.jwt;
      
      // Step 2: Fetch the full user data with the JWT
      // Use populate=* to get all nested data like 'role'
      const userRes = await fetch("http://localhost:1337/api/users/me?populate=role", {
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      });
      const userData = await userRes.json();

      if (!userRes.ok) {
        setErrorMessage("Failed to fetch user data.");
        setIsSubmitting(false);
        return;
      }

      // Save JWT and the entire user data object
      localStorage.setItem("token", jwt);
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect after login
      router.push("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign in</h2>

        {errorMessage && (
          <div className="text-red-600 mb-4 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
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

            {/* Submit */}
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
  );
}