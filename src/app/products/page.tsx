"use client";

import { useEffect, useState } from "react";
import { RoundSpinner } from "@/components/ui/spinner";
import { getProducts, deleteProduct } from "@/lib/api";
import { Product } from "@/lib/types";
import Link from "next/link";
import { Pen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [storedProducts, setStoredProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchStates, setFetchStates] = useState({
    loading: false,
    error: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm) {
      setProducts(storedProducts);
    } else if (searchTerm) {
      const filteredProducts = storedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filteredProducts);
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      setFetchStates((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));
      try {
        const data = await getProducts();
        const sortedProducts = data.sort((a, b) =>
          a.status === "SOLD" ? 1 : b.status === "SOLD" ? -1 : 0
        );
        setProducts(sortedProducts);
        setStoredProducts(sortedProducts);
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        setFetchStates((prevState) => ({
          ...prevState,
          error: error.message || "An unexpected error occurred",
        }));
      } finally {
        setFetchStates((prevState) => ({ ...prevState, loading: false }));
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    console.log(`Deleting product ${id}`);
    await deleteProduct(id);
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, status: "SOLD" } : product
      )
    );
  };

  if (fetchStates.loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <RoundSpinner size="xxl" />
      </div>
    );
  }

  if (fetchStates.error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <h1 className="text-center text-3xl text-red-700">
          Error: {fetchStates.error}
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-10 min-h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Products</h1>

        <Input
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-[300px]"
        />

        <Link href={`/products/new`}>
          <Button className="bg-black text-white hover:bg-black/80 hover:text-white mr-20">
            <PlusCircle className="mr-2 h-4 w-4 text-white" />
            Add New Product
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>On Sale</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className={
                product.status === "SOLD" ? "bg-gray-100 hover:bg-gray-100" : ""
              }
            >
              <TableCell>{product.name}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-white ${
                    product.sale_price > 0 &&
                    product.sale_price !== product.price
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                >
                  {product.sale_price > 0 &&
                  product.sale_price !== product.price
                    ? "On Sale"
                    : "Not on Sale"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-white ${
                    product.status === "AVAILABLE"
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  }`}
                >
                  {product.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/products/${product.id}`}>
                    <Pen className="h-5 w-5 text-blue-500 cursor-pointer" />
                  </Link>
                  <Trash2
                    className="h-5 w-5 text-red-500 cursor-pointer"
                    onClick={() => handleDelete(product.id)}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/products/images/${product.id}`}>
                    <Button variant="outline" size="sm">
                      Images
                    </Button>
                  </Link>
                  <Link href={`/products/variants/${product.id}`}>
                    <Button variant="outline" size="sm">
                      Variants
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
