import { z } from "zod";

// =========================
// Update Profile Validation
// =========================

export const updateStudentProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, {
      message:
        "الاسم يجب أن لا يقل عن 3 أحرف / Name must be at least 3 characters",
    })
    .optional(),

  avatar: z.string().optional(),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
