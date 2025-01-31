"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Product, Category } from "@/lib/types";
import { getProductById, updateProduct, getCategories } from "@/lib/api";
import { RoundSpinner } from "@/components/ui/spinner";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await getProductById(Number(id));
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

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

    if (id) {
      fetchProduct();
    }
    fetchCategories();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!product) {
        throw new Error("Product not found");
      }
      await updateProduct(Number(id), product);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      router.push("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product?. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Product, value: string | number) => {
    setProduct((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <RoundSpinner size="xxl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        Product not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-10">
      <h1 className="text-2xl font-bold mb-5">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={product?.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={product?.price}
            onChange={(e) => handleChange("price", parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="sale_price">Sale Price</Label>
          <Input
            id="sale_price"
            type="number"
            value={product?.sale_price}
            onChange={(e) =>
              handleChange("sale_price", parseFloat(e.target.value))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            type="url"
            value={product?.image}
            onChange={(e) => handleChange("image", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category_id">Category</Label>
          <Select
            value={String(product?.category_id)}
            onValueChange={(value) =>
              handleChange("category_id", parseInt(value))
            }
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
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={product?.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
              <SelectItem value="SOLD">SOLD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Product"}
        </Button>
      </form>
    </div>
  );
}
