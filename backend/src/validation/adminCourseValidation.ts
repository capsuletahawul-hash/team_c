import { z } from "zod";

export const createAdminCourseSchema = z.object({
  title: z.string().trim().min(3, {
    message: "عنوان الدورة يجب أن لا يقل عن 3 أحرف / Course title must be at least 3 characters",
  }),

  description: z.string().trim().min(10, {
    message: "الوصف يجب أن لا يقل عن 10 أحرف / Description must be at least 10 characters",
  }),

  category: z.enum(
    ["Cybersecurity", "Software Engineering", "Artificial Intelligence", "Cloud Computing"],
    {
      error: () => "يجب اختيار تصنيف صحيح / A valid category must be selected",
    }
  ),

  level: z.enum(["beginner", "intermediate", "advanced"], {
    error: () => "يجب اختيار مستوى صحيح / A valid level must be selected",
  }),

  price: z.coerce.number().positive({
    message: "السعر يجب أن يكون رقماً موجباً / Price must be a positive number",
  }),

  durationWeeks: z.coerce.number().int().positive({
    message: "مدة الدورة غير صحيحة / Invalid course duration",
  }),

  trainerId: z.string().trim().min(1, {
    message: "يجب تحديد المدرب / A trainer must be specified",
  }),

  seatsLeft: z.coerce.number().int().nonnegative().optional(),
});

export type CreateAdminCourseInput = z.infer<typeof createAdminCourseSchema>;

export const updateAdminCourseSchema = createAdminCourseSchema.partial().extend({
  status: z.enum(["available", "coming_soon", "pending_deletion", "rejected"]).optional(),
  isVisible: z.boolean().optional(),
});

export type UpdateAdminCourseInput = z.infer<typeof updateAdminCourseSchema>;
