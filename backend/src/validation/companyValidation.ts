import { z } from "zod";

// =========================
// Create Ticket Validation
// =========================

export const createTicketSchema = z.object({
  program: z.string().min(3, {
    message:
      "اسم البرنامج يجب أن لا يقل عن 3 أحرف / Program name must be at least 3 characters",
  }),

  count: z.number().int().positive({
    message:
      "عدد الموظفين يجب أن يكون رقماً موجباً / Employee count must be a positive number",
  }),

  budget: z.number().nonnegative({
    message: "الميزانية يجب أن تكون رقماً موجباً / Budget must be a non-negative number",
  }),

  domain: z.string().min(2, {
    message: "المجال التقني مطلوب / Technical domain is required",
  }),

  fileName: z.string().optional(),
});

// =========================
// Update Ticket Status Validation
// =========================

export const updateTicketStatusSchema = z.object({
  status: z.enum(["review", "issued", "approved"], {
    error: () =>
      "الحالة يجب أن تكون review أو issued أو approved / Status must be review, issued, or approved",
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
