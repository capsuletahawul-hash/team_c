import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterInput, LoginInput } from "../validation/authValidation.js";
import { userRepository } from "../repositories/userRepository.js";

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role || "STUDENT",
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET || "fallback-secret-key",
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
    // 🌟 البحث دائماً من قاعدة البيانات عبر Prisma
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" };
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret-key",
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