"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { faqSchema, FAQFormValues } from "@/lib/schema";
import { RoundSpinner } from "@/components/ui/spinner";
import { createFaq } from "@/lib/api";
export default function AddFAQPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      questionEn: "",
      answerEn: "",
      questionAr: "",
      answerAr: "",
    },
  });

  async function onSubmit(data: FAQFormValues) {
    setIsSubmitting(true);
    try {
      const faqData = [
        { question: data.questionEn, answer: data.answerEn },
        { question: data.questionAr, answer: data.answerAr },
      ];

      await createFaq(faqData);

      toast({
        title: "Successfully Added",
        description: "Your New FAQ Has Been Added Successfully.",
      });
      form.reset();
      router.push("/faqs");
    } catch (error) {
      console.error("Error submitting FAQ:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your FAQ.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
          <RoundSpinner size="xxl" />
        </div>
      )}
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Add New FAQ</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="questionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter question in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answerEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter answer in English"
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter question in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answerAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter answer in Arabic"
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-black/80 hover:text-white mr-20 px-12"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
