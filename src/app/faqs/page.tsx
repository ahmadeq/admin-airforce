"use client";
import { useEffect, useState } from "react";
import { RoundSpinner } from "@/components/ui/spinner";
import { getFaqs, deleteFaq } from "@/lib/api";
import { Faq } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [fetchStates, setFetchStates] = useState({
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchFaqs = async () => {
      setFetchStates((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));
      try {
        const data = await getFaqs();
        setFaqs(data);
      } catch (error: any) {
        console.error("Failed to fetch FAQs:", error);
        setFetchStates((prevState) => ({
          ...prevState,
          error: error.message || "An unexpected error occurred",
        }));
      } finally {
        setFetchStates((prevState) => ({ ...prevState, loading: false }));
      }
    };

    fetchFaqs();
  }, []);

  const handleDelete = async (id: number | undefined) => {
    setFetchStates((prevState) => ({
      ...prevState,
      loading: true,
      error: null,
    }));
    console.log("Deleting FAQ with ID:", id);
    if (!id) {
      throw new Error("FAQ ID is missing");
    }
    try {
      await deleteFaq(id);
      setFaqs((prevFaqs) => prevFaqs.filter((faq) => faq.id !== id));
      toast({
        title: "Successfully Deleted",
        description: "FAQ has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Failed to delete FAQ:", error);
      setFetchStates((prevState) => ({
        ...prevState,
        error: error.message || "An unexpected error occurred",
      }));
    } finally {
      setFetchStates((prevState) => ({ ...prevState, loading: false }));
    }
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
    <div className="container mx-auto p-4">
      <div className="py-4 space-y-2 flex items-stretch justify-between">
        <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>

        <Link href={`/faqs/new`}>
          <Button className="bg-black text-white hover:bg-black/80 hover:text-white mr-20">
            <PlusCircle className="mr-2 h-4 w-4 text-white" />
            Add New FAQ
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faqs.map((faq) => (
            <TableRow key={faq.id}>
              <TableCell>{faq.id}</TableCell>
              <TableCell>{faq.question}</TableCell>
              <TableCell>{faq.answer}</TableCell>
              <TableCell>
                <>
                  <Link href={`/faqs/${faq.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(faq.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
