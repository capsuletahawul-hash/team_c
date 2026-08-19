import { z } from "zod";

// =========================
// Submit Contract Request Validation
// =========================

export const submitContractSchema = z.object({
  companyName: z.string().trim().min(2, {
    message: "اسم الشركة يجب أن لا يقل عن حرفين / Company name must be at least 2 characters",
  }),

  contactPerson: z.string().trim().min(2, {
    message: "اسم مسؤول التواصل مطلوب / Contact person name is required",
  }),

  email: z.string().trim().email({
    message: "صيغة البريد الإلكتروني غير صحيحة / Invalid email format",
  }),

  phone: z.string().trim().min(6, {
    message: "رقم الجوال غير صحيح / Invalid phone number",
  }),

  trainingType: z.string().trim().min(2, {
    message: "نوع التدريب مطلوب / Training type is required",
  }),

  trainees: z.coerce.number().int().positive({
    message: "عدد المتدربين يجب أن يكون رقماً موجباً / Trainees count must be a positive number",
  }),

  startDate: z.string().trim().min(4, {
    message: "تاريخ البدء مطلوب / Start date is required",
  }),

  notes: z.string().trim().optional().default(""),
});

export type SubmitContractInput = z.infer<typeof submitContractSchema>;
