import { z } from "zod";

// Schema for validating B2B request data
export const b2bRequestSchema = z.object({
  companyName: z.string()
    .min(2, {
      message:
        "اسم الشركة يجب أن لا يقل عن حرفين / Company name must be at least 2 characters",
    }),

  contact: z.string()
    .min(5, {
      message:
        "بيانات التواصل غير صحيحة / Invalid contact information",
    }),

  message: z.string()
    .min(10, {
      message:
        "الرسالة يجب أن لا تقل عن 10 أحرف / Message must be at least 10 characters",
    }),
});

// Inferred type for controllers and services
export type B2BRequestInput = z.infer<typeof b2bRequestSchema>;
