import { z } from "zod";

export const faqSchema = z.object({
  questionEn: z.string().min(3, "Question must be at least 3 characters long"),
  answerEn: z.string().min(3, "Answer must be at least 3 characters long"),
  questionAr: z.string().min(3, "Question must be at least 3 characters long"),
  answerAr: z.string().min(3, "Answer must be at least 3 characters long"),
});

export type FAQFormValues = z.infer<typeof faqSchema>;

export const couponSchema = z.object({
  code: z.string().nonempty("Code is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  max: z.number().min(1, "Max discount must be greater than 0"),
  min: z.number().min(1, "Min purchase must be greater than 0"),
  is_percentage: z.any(),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
