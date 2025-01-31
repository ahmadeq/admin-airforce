"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Category } from "@/lib/types";
import { createProduct, getCategories } from "@/lib/api";

const productSchema = z.object({
  name: z.string().nonempty("Name is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  sale_price: z
    .number()
    .min(0, "Sale Price must be greater than or equal to 0"),
  image: z.string().url("Invalid URL"),
  category: z.number().min(1, "Category is required"),
  status: z.enum(["AVAILABLE", "SOLD"]),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sale_price: 0,
      status: "AVAILABLE",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, []);

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const product = {
        name: data.name,
        price: data.price,
        sale_price: data.sale_price,
        image: data.image,
        category_id: data.category,
      };
      await createProduct(product);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      router.push("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-10 min-h-screen overflow-hidden">
      <h1 className="text-2xl font-bold mb-5">Create Product</h1>
      <div className="h-full overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} required />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              required
            />
            {errors.price && (
              <p className="text-red-600 text-sm">{errors.price.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="sale_price">Sale Price</Label>
            <Input
              id="sale_price"
              type="number"
              {...register("sale_price", { valueAsNumber: true })}
              required
            />
            {errors.sale_price && (
              <p className="text-red-600 text-sm">
                {errors.sale_price.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" type="url" {...register("image")} required />
            {errors.image && (
              <p className="text-red-600 text-sm">{errors.image.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-red-600 text-sm">{errors.category.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </div>
    </div>
  );
}
