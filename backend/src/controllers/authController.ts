import { Request, Response } from "express";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from "../validation/authValidation.js";

import { authService } from "../services/authService.js";
import { userRepository } from "../repositories/userRepository.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const authController = {
  /**
   * Register
   */
  async register(req: Request, res: Response) {
    try {
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const result = await authService.register(validation.data);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  /**
   * Login
   */
  async login(req: Request, res: Response) {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      // تعديل: التحقق من حساب الأدمن الثابت قبل الانتقال لخدمة المصادقة العادية
      if (
        validation.data.email === "capsuletahawul@gmail.com" &&
        validation.data.password === "Admin@5011"
      ) {
        // محاكاة استجابة نجاح تسجيل دخول الأدمن بصلاحياته ودور admin
        const adminResult = {
          success: true,
          token: "mock-admin-token-capsuletahawul", // أو استدعاء خدمة توليد التوكن إذا لزم
          user: {
            id: "admin-static-id",
            name: "Administrator",
            email: "capsuletahawul@gmail.com",
            role: "admin",
          },
        };
        return res.status(200).json(adminResult);
      }
      // نهاية التعديل للأدمن الثابت

      const result = await authService.login(validation.data);

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  /**
   * Current User
   */
  async me(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      
      // تعديل: دعم الاستعلام عن بيانات الأدمن الثابت في حال كان معرفه خاصاً بالأدمن
      if (authUser.userId === "admin-static-id" || authUser.email === "capsuletahawul@gmail.com") {
        return res.status(200).json({
          success: true,
          user: {
            id: "admin-static-id",
            fullName: "Administrator",
            email: "capsuletahawul@gmail.com",
            role: "admin",
            avatar: "",
            joinedAt: new Date(),
            completedCourses: 0,
            activeCourses: 0,
            companyAffiliation: "Capsulet Tahawul",
          },
        });
      }
      // نهاية تعديل بيانات الأدمن الثابت

if (!authUser.userId) {
  return res.status(401).json({
    success: false,
    error: "invalid_user",
  });
}

const user = await userRepository.findById(authUser.userId);

      if (!user) {
        return res.status(404).json({ success: false, error: "user_not_found" });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          fullName: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          joinedAt: user.createdAt,
          // لا يوجد نظام تسجيل دورات بعد — قيم افتراضية بانتظار وحدة التسجيل
          completedCourses: 0,
          activeCourses: 0,
          companyAffiliation: "",
        },
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  /**
   * Forgot Password
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const validation = forgotPasswordSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      // لا نكشف ما إذا كان البريد الإلكتروني مسجّلاً أم لا لأسباب أمنية —
      // نعيد نفس الرسالة دائماً بغض النظر عن نتيجة البحث
      await userRepository.findByEmail(validation.data.email);

      return res.status(200).json({
        success: true,
        message:
          "إذا كان البريد الإلكتروني مسجلاً لدينا، سيصلك رابط إعادة تعيين كلمة المرور / If this email is registered, a password reset link has been sent",
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
};