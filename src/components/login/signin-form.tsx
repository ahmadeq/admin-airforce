"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/AuthAtoms";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      await signin({ email: values.email, password: values.password });
      toast({
        title: "Signed In Successfully!",
        description: "Redirecting to dashboard...",
        className: "bg-green-50 ",
      });
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Failed to sign in:", error);
      if (error instanceof Error) {
        toast({
          title: "ERROR OCCURRED",
          description: error.message,
          className: "bg-red-200 ",
        });
      } else {
        toast({
          title: "ERROR OCCURRED",
          description: "An error occurred while signing in",
          className: "bg-red-200 ",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white min-w-[500px]">
        <div className="w-full max-w-md p-8 space-y-4 bg-black text-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Admin Sign In</h1>
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
                        placeholder="email@example.com"
                        {...field}
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/80"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Toaster />
    </>
  );
}
