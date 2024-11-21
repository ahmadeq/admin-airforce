import { z } from "zod";

export const faqSchema = z.object({
  questionEn: z.string().min(3, "Question must be at least 3 characters long"),
  answerEn: z.string().min(3, "Answer must be at least 3 characters long"),
  questionAr: z.string().min(3, "Question must be at least 3 characters long"),
  answerAr: z.string().min(3, "Answer must be at least 3 characters long"),
});

export type FAQFormValues = z.infer<typeof faqSchema>;
