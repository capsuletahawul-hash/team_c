import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export const courseRepository = {
  async findById(id: string) {
    return prisma.course.findUnique({ where: { id } });
  },

  async create(data: Prisma.CourseUncheckedCreateInput) {
    return prisma.course.create({ data });
  },

  async update(id: string, data: Prisma.CourseUncheckedUpdateInput) {
    try {
      return await prisma.course.update({ where: { id }, data });
    } catch {
      return undefined;
    }
  },

  async delete(id: string) {
    try {
      await prisma.course.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count(),
    ]);

    return {
      courses,
      total,
    };
  },
};