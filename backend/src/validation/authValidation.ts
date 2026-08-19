import { z } from "zod";

// =========================
// Register Validation
// =========================

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, {
      message:
        "الاسم يجب أن لا يقل عن 3 أحرف / Name must be at least 3 characters",
    }),

  email: z.string().email({
    message:
      "صيغة البريد الإلكتروني غير صحيحة / Invalid email format",
  }),

  password: z
    .string()
    .min(8, {
      message:
        "كلمة المرور يجب أن لا تقل عن 8 خانات / Password must be at least 8 characters",
    }),

  role: z.enum(["Student", "Trainer", "Company", "Admin"], {
    error: () =>
      "يجب اختيار رتبة صحيحة / Role must be Student, Trainer, Company, or Admin",
  }),
});

// =========================
// Login Validation
// =========================

export const loginSchema = z.object({
  email: z.string().email({
    message:
      "صيغة البريد الإلكتروني غير صحيحة / Invalid email format",
  }),

  password: z.string().min(1, {
    message: "كلمة المرور مطلوبة / Password is required",
  }),
});

// =========================
// Forgot Password Validation
// =========================

export const forgotPasswordSchema = z.object({
  email: z.string().email({
    message:
      "صيغة البريد الإلكتروني غير صحيحة / Invalid email format",
  }),
});

// =========================
// Types
// =========================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;