"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { getFaqById, updateFaq } from "@/lib/api";

export default function UpdateFAQPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      questionEn: "",
      answerEn: "",
      questionAr: "",
      answerAr: "",
    },
  });

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        console.log("Fetching FAQ with ID:", id);
        const [faqEn, faqAr] = await getFaqById(Number(id));
        form.reset({
          questionEn: faqEn.question,
          answerEn: faqEn.answer,
          questionAr: faqAr.question,
          answerAr: faqAr.answer,
        });
      } catch (error) {
        console.error("Error fetching FAQ:", error);
        toast({
          title: "Error",
          description: "There was a problem fetching the FAQ.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaq();
  }, [id, form]);

  async function onSubmit(data: FAQFormValues) {
    setIsSubmitting(true);
    try {
      const faqData = [
        { question: data.questionEn, answer: data.answerEn },
        { question: data.questionAr, answer: data.answerAr },
      ];

      await updateFaq(Number(id), faqData);

      toast({
        title: "Successfully Updated",
        description: "Your FAQ has been updated successfully.",
      });
      router.push("/faqs");
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your FAQ.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
        <RoundSpinner size="xxl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Update FAQ</h1>
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
            className="bg-black text-white hover:bg-black/80 mr-20 px-12"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
