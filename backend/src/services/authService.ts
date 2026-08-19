import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterInput, LoginInput } from "../validation/authValidation.js";
import { userRepository } from "../repositories/userRepository.js";
import { prisma } from "../lib/prisma.js";

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    // تحديد رتبة المستخدم الحقيقية من المخلات أو البريد الإلكتروني
    let userRole = (input.role || "STUDENT").toUpperCase();
    if (input.email.toLowerCase().includes("company")) {
      userRole = "COMPANY";
    }

    const newUser = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: userRole as any,
    });

    const secret = process.env.JWT_SECRET || "fallback-secret-key";

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  },

  async login(input: LoginInput) {
    let user = await userRepository.findByEmail(input.email);

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    if (user.status === "suspended") {
      return { success: false, error: "Your account has been suspended" };
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" };
    }

    // إصلاح تلقائي وحفظ رتبة الشركة في قاعدة البيانات إذا كان الإيميل يحتوي على company
    if (input.email.toLowerCase().includes("company") && String(user.role).toUpperCase() !== "COMPANY") {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "COMPANY" as any },
        });
      } catch (e) {
        user = { ...user, role: "COMPANY" as any };
      }
    }

    const secret = process.env.JWT_SECRET || "fallback-secret-key";

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};